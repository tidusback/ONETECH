-- Migration: points_lifecycle
-- Adds a state machine to technician_points so job-completion points start
-- as 'pending' (awaiting admin review) and only become spendable once
-- 'released'. Admin bonuses and adjustments start released immediately.
-- Redemption deductions are also released immediately (balance checked at write).
--
-- Anti-abuse controls:
--   • UNIQUE index: one 'job_completed' row per job_id — no double-awarding
--   • 'job_completed' entries only created via the auto_award_job_points trigger
--   • 'bonus'/'adjustment' entries only via admin SECURITY DEFINER functions
--   • Balance calculation uses state = 'released' exclusively

-- ---------------------------------------------------------------------------
-- Extend technician_points
-- ---------------------------------------------------------------------------

ALTER TABLE public.technician_points
  ADD COLUMN IF NOT EXISTS state        text        NOT NULL DEFAULT 'released'
                                          CHECK (state IN ('pending', 'released', 'voided')),
  ADD COLUMN IF NOT EXISTS released_at  timestamptz,
  ADD COLUMN IF NOT EXISTS released_by  uuid        REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS void_reason  text,
  ADD COLUMN IF NOT EXISTS source_ref   text;   -- e.g. job number, for human tracing

-- Pending entries have no release metadata yet
-- Released entries have released_at set when approved
-- Voided entries have void_reason set when rejected

-- ---------------------------------------------------------------------------
-- Anti-abuse: one job_completed entry per job
-- ---------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS idx_points_unique_job_completion
  ON public.technician_points (job_id)
  WHERE reason = 'job_completed' AND job_id IS NOT NULL AND state != 'voided';

-- ---------------------------------------------------------------------------
-- Trigger: auto-award pending points when a job reaches 'completed'
-- Fires AFTER UPDATE on technician_jobs.
-- Creates a 'pending' entry only if points_awarded > 0 and none exists yet.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.auto_award_job_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only act when status transitions to 'completed' with points set
  IF OLD.status IS DISTINCT FROM 'completed'
     AND NEW.status = 'completed'
     AND NEW.points_awarded IS NOT NULL
     AND NEW.points_awarded > 0
  THEN
    INSERT INTO public.technician_points
      (technician_id, job_id, points, reason, state, source_ref, note)
    VALUES
      (NEW.technician_id, NEW.id, NEW.points_awarded, 'job_completed', 'pending',
       NEW.job_number,
       'Pending review — ' || NEW.points_awarded || ' pts for job ' || NEW.job_number)
    ON CONFLICT DO NOTHING;   -- safe if somehow called twice
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER technician_jobs_auto_award_points
  AFTER UPDATE ON public.technician_jobs
  FOR EACH ROW EXECUTE FUNCTION public.auto_award_job_points();

-- ---------------------------------------------------------------------------
-- release_points_entry(p_points_id)
-- Admin releases a pending entry → it becomes spendable.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.release_points_entry(p_points_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_entry    record;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN json_build_object('error', 'Forbidden');
  END IF;

  SELECT * INTO v_entry
    FROM public.technician_points
    WHERE id = p_points_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Entry not found');
  END IF;

  IF v_entry.state != 'pending' THEN
    RETURN json_build_object('error', 'Entry is not in pending state');
  END IF;

  UPDATE public.technician_points
    SET state = 'released', released_at = now(), released_by = v_admin_id
    WHERE id = p_points_id;

  RETURN json_build_object('error', null);
END;
$$;

-- ---------------------------------------------------------------------------
-- void_points_entry(p_points_id, p_reason)
-- Admin voids a pending entry → points are never credited.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.void_points_entry(
  p_points_id uuid,
  p_reason    text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_entry    record;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN json_build_object('error', 'Forbidden');
  END IF;

  SELECT * INTO v_entry
    FROM public.technician_points
    WHERE id = p_points_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Entry not found');
  END IF;

  IF v_entry.state = 'released' THEN
    RETURN json_build_object('error', 'Cannot void a released entry');
  END IF;

  UPDATE public.technician_points
    SET state = 'voided',
        void_reason = NULLIF(TRIM(COALESCE(p_reason, '')), ''),
        released_by = v_admin_id   -- reuse field to record who voided
    WHERE id = p_points_id;

  RETURN json_build_object('error', null);
END;
$$;

-- ---------------------------------------------------------------------------
-- admin_grant_points(p_technician_id, p_points, p_reason, p_note)
-- Admin creates a bonus or adjustment entry directly as 'released'.
-- p_reason must be 'bonus' or 'adjustment'.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_grant_points(
  p_technician_id uuid,
  p_points        integer,
  p_reason        text    DEFAULT 'bonus',
  p_note          text    DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN json_build_object('error', 'Forbidden');
  END IF;

  IF p_reason NOT IN ('bonus', 'adjustment') THEN
    RETURN json_build_object('error', 'Reason must be ''bonus'' or ''adjustment''');
  END IF;

  IF p_points = 0 THEN
    RETURN json_build_object('error', 'Points value cannot be zero');
  END IF;

  -- Validate technician exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_technician_id) THEN
    RETURN json_build_object('error', 'Technician not found');
  END IF;

  INSERT INTO public.technician_points
    (technician_id, points, reason, state, released_at, released_by, note)
  VALUES
    (p_technician_id, p_points, p_reason, 'released',
     now(), v_admin_id,
     NULLIF(TRIM(COALESCE(p_note, '')), ''));

  RETURN json_build_object('error', null);
END;
$$;

-- ---------------------------------------------------------------------------
-- fulfill_redemption(p_redemption_id, p_note)
-- Admin marks a pending redemption as fulfilled.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fulfill_redemption(
  p_redemption_id uuid,
  p_note          text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN json_build_object('error', 'Forbidden');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.technician_reward_redemptions
    WHERE id = p_redemption_id AND status = 'pending'
  ) THEN
    RETURN json_build_object('error', 'Redemption not found or not pending');
  END IF;

  UPDATE public.technician_reward_redemptions
    SET status = 'fulfilled',
        processed_at = now(),
        note = NULLIF(TRIM(COALESCE(p_note, '')), '')
    WHERE id = p_redemption_id;

  RETURN json_build_object('error', null);
END;
$$;

-- ---------------------------------------------------------------------------
-- cancel_redemption(p_redemption_id, p_note)
-- Admin cancels a pending redemption and refunds the points.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.cancel_redemption(
  p_redemption_id uuid,
  p_note          text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id    uuid := auth.uid();
  v_redemption  record;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN json_build_object('error', 'Forbidden');
  END IF;

  SELECT * INTO v_redemption
    FROM public.technician_reward_redemptions
    WHERE id = p_redemption_id FOR UPDATE;

  IF NOT FOUND OR v_redemption.status != 'pending' THEN
    RETURN json_build_object('error', 'Redemption not found or not pending');
  END IF;

  -- Cancel the redemption
  UPDATE public.technician_reward_redemptions
    SET status = 'cancelled',
        processed_at = now(),
        note = NULLIF(TRIM(COALESCE(p_note, '')), '')
    WHERE id = p_redemption_id;

  -- Refund the points as a released adjustment
  INSERT INTO public.technician_points
    (technician_id, points, reason, state, released_at, released_by, note)
  VALUES
    (v_redemption.technician_id, v_redemption.points_spent,
     'adjustment', 'released', now(), v_admin_id,
     'Refund — cancelled redemption ' || v_redemption.id);

  RETURN json_build_object('error', null);
END;
$$;

-- ---------------------------------------------------------------------------
-- Register new functions in types (declare for RPC type inference)
-- ---------------------------------------------------------------------------

-- (No SQL needed here — types/database.types.ts is manually maintained)

-- ---------------------------------------------------------------------------
-- Indexes for admin review queries
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_points_state_pending
  ON public.technician_points (state, created_at DESC)
  WHERE state = 'pending';

CREATE INDEX IF NOT EXISTS idx_points_technician_state
  ON public.technician_points (technician_id, state);

CREATE INDEX IF NOT EXISTS idx_redemptions_status_pending
  ON public.technician_reward_redemptions (status, created_at DESC)
  WHERE status = 'pending';
