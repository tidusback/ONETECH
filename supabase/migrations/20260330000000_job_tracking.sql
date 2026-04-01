-- Migration: job_tracking
-- Adds lead assignment records, job audit logging, actual fault capture,
-- and atomic SQL functions for all major job-lifecycle actions.
-- Every state-change goes through a SECURITY DEFINER function so the
-- full transition is committed in one transaction and a log row is always written.

-- ---------------------------------------------------------------------------
-- Extend technician_jobs
-- ---------------------------------------------------------------------------

ALTER TABLE public.technician_jobs
  ADD COLUMN IF NOT EXISTS actual_fault     text,         -- what the technician actually found
  ADD COLUMN IF NOT EXISTS cancelled_reason text,         -- reason if status = 'cancelled'
  ADD COLUMN IF NOT EXISTS accepted_at      timestamptz;  -- when the technician accepted the job

-- ---------------------------------------------------------------------------
-- technician_lead_assignments
-- Tracks every offer/accept/decline of a lead per technician.
-- A lead may be offered to multiple technicians sequentially (e.g. first
-- declined by tech A then accepted by tech B).  The UNIQUE constraint
-- on (lead_id, technician_id) prevents duplicate records per pair.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.technician_lead_assignments (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid        NOT NULL REFERENCES public.technician_leads(id) ON DELETE CASCADE,
  technician_id   uuid        NOT NULL REFERENCES public.profiles(id),
  status          text        NOT NULL DEFAULT 'offered'
                    CHECK (status IN ('offered', 'accepted', 'declined', 'expired')),
  offered_at      timestamptz NOT NULL DEFAULT now(),
  responded_at    timestamptz,
  expires_at      timestamptz,  -- per-assignment expiry window (can differ from lead expiry)
  job_id          uuid        REFERENCES public.technician_jobs(id),  -- populated on accept
  decline_reason  text,
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, technician_id)
);

CREATE TRIGGER technician_lead_assignments_updated_at
  BEFORE UPDATE ON public.technician_lead_assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.technician_lead_assignments ENABLE ROW LEVEL SECURITY;

-- Technicians can see their own assignments
CREATE POLICY "lead_assignments_select_own"
  ON public.technician_lead_assignments FOR SELECT
  USING (auth.uid() = technician_id);

-- Admins see all
CREATE POLICY "lead_assignments_admin_all"
  ON public.technician_lead_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- technician_job_logs
-- Append-only audit trail. One row per action. Never deleted.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.technician_job_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      uuid        NOT NULL REFERENCES public.technician_jobs(id) ON DELETE CASCADE,
  actor_id    uuid        REFERENCES public.profiles(id),
  actor_role  text        NOT NULL DEFAULT 'system'
                CHECK (actor_role IN ('technician', 'admin', 'system')),
  action      text        NOT NULL
                CHECK (action IN (
                  'job_created',
                  'status_changed',
                  'note_added',
                  'fault_captured',
                  'admin_override',
                  'cancelled',
                  'points_awarded',
                  'admin_note_added'
                )),
  prev_value  text,   -- previous status / previous note text
  next_value  text,   -- new status / new note text
  note        text,   -- free-text human description
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.technician_job_logs ENABLE ROW LEVEL SECURITY;

-- Technicians read logs for their own jobs
CREATE POLICY "job_logs_select_tech"
  ON public.technician_job_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.technician_jobs
      WHERE id = job_id AND technician_id = auth.uid()
    )
  );

-- Admins see all
CREATE POLICY "job_logs_admin_all"
  ON public.technician_job_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- Fix reward_redemptions status values to match UI labels
-- ---------------------------------------------------------------------------

ALTER TABLE public.technician_reward_redemptions
  DROP CONSTRAINT IF EXISTS technician_reward_redemptions_status_check;

ALTER TABLE public.technician_reward_redemptions
  ADD CONSTRAINT technician_reward_redemptions_status_check
  CHECK (status IN ('pending', 'fulfilled', 'cancelled'));

-- ---------------------------------------------------------------------------
-- Helper: expire_stale_leads()
-- Marks leads past their expires_at as 'expired'. Called lazily on read.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.expire_stale_leads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.technician_leads
    SET status = 'expired'
  WHERE status = 'open'
    AND expires_at IS NOT NULL
    AND expires_at < now();

  -- Also expire individual assignments whose window has closed
  UPDATE public.technician_lead_assignments
    SET status = 'expired', responded_at = now()
  WHERE status = 'offered'
    AND expires_at IS NOT NULL
    AND expires_at < now();
END;
$$;

-- ---------------------------------------------------------------------------
-- accept_technician_lead(p_lead_id)
-- Called by the authenticated technician. Atomically:
--   1. Locks the lead row and checks availability
--   2. Creates / updates the assignment record
--   3. Creates a technician_jobs row from lead data
--   4. Updates lead status → 'assigned'
--   5. Writes a job_created log entry
-- Returns: { job_id, job_number, error }
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.accept_technician_lead(p_lead_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_technician_id uuid := auth.uid();
  v_lead          record;
  v_assignment    record;
  v_job_id        uuid;
  v_job_number    text;
BEGIN
  -- Validate caller
  IF v_technician_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated', 'job_id', null, 'job_number', null);
  END IF;

  -- Confirm technician is approved
  IF NOT EXISTS (
    SELECT 1 FROM public.technician_applications
    WHERE user_id = v_technician_id AND status = 'approved'
  ) THEN
    RETURN json_build_object('error', 'Your profile is not yet approved', 'job_id', null, 'job_number', null);
  END IF;

  -- Lock and load lead
  SELECT * INTO v_lead
    FROM public.technician_leads
    WHERE id = p_lead_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Lead not found', 'job_id', null, 'job_number', null);
  END IF;

  -- Check expiry first (opportunistic expiry)
  IF v_lead.expires_at IS NOT NULL AND v_lead.expires_at < now() THEN
    UPDATE public.technician_leads SET status = 'expired' WHERE id = p_lead_id;
    RETURN json_build_object('error', 'This lead has expired', 'job_id', null, 'job_number', null);
  END IF;

  -- Check availability
  IF v_lead.status NOT IN ('open') THEN
    RETURN json_build_object('error', 'This lead is no longer available', 'job_id', null, 'job_number', null);
  END IF;

  -- Upsert assignment record
  INSERT INTO public.technician_lead_assignments
    (lead_id, technician_id, status, offered_at, responded_at)
  VALUES
    (p_lead_id, v_technician_id, 'accepted', now(), now())
  ON CONFLICT (lead_id, technician_id) DO UPDATE
    SET status = 'accepted', responded_at = now(), updated_at = now()
  RETURNING * INTO v_assignment;

  -- Generate job number
  v_job_number := 'TRXJ-' || to_char(now(), 'YYYYMMDD') || '-' ||
    lpad(nextval('technician_job_seq')::text, 4, '0');

  -- Create job
  INSERT INTO public.technician_jobs (
    job_number, lead_id, technician_id,
    title, description, category,
    location_city, location_province,
    status, accepted_at
  ) VALUES (
    v_job_number, p_lead_id, v_technician_id,
    v_lead.title, v_lead.description, v_lead.category,
    v_lead.location_city, v_lead.location_province,
    'assigned', now()
  )
  RETURNING id INTO v_job_id;

  -- Link assignment → job
  UPDATE public.technician_lead_assignments
    SET job_id = v_job_id, updated_at = now()
    WHERE id = v_assignment.id;

  -- Mark lead assigned
  UPDATE public.technician_leads
    SET status = 'assigned', assigned_to = v_technician_id, updated_at = now()
    WHERE id = p_lead_id;

  -- Audit log
  INSERT INTO public.technician_job_logs
    (job_id, actor_id, actor_role, action, next_value, note)
  VALUES
    (v_job_id, v_technician_id, 'technician', 'job_created', 'assigned',
     'Job created from lead ' || v_lead.lead_number);

  RETURN json_build_object(
    'job_id',     v_job_id,
    'job_number', v_job_number,
    'error',      null
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- decline_technician_lead(p_lead_id, p_reason)
-- Records the decline. Lead remains 'open' for other technicians.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.decline_technician_lead(
  p_lead_id uuid,
  p_reason  text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_technician_id uuid := auth.uid();
BEGIN
  IF v_technician_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Confirm lead exists and is still open
  IF NOT EXISTS (
    SELECT 1 FROM public.technician_leads
    WHERE id = p_lead_id AND status = 'open'
  ) THEN
    RETURN json_build_object('error', 'Lead is not available');
  END IF;

  -- Upsert decline record
  INSERT INTO public.technician_lead_assignments
    (lead_id, technician_id, status, responded_at, decline_reason)
  VALUES
    (p_lead_id, v_technician_id, 'declined', now(), p_reason)
  ON CONFLICT (lead_id, technician_id) DO UPDATE
    SET status = 'declined', responded_at = now(),
        decline_reason = p_reason, updated_at = now();

  RETURN json_build_object('error', null);
END;
$$;

-- ---------------------------------------------------------------------------
-- update_job_status_with_log(p_job_id, p_status, p_notes, p_actual_fault)
-- Technician-initiated status progression. Validates allowed transitions.
-- Writes a log entry in the same transaction.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_job_status_with_log(
  p_job_id       uuid,
  p_status       text,
  p_notes        text    DEFAULT NULL,
  p_actual_fault text    DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_technician_id uuid := auth.uid();
  v_job           record;
  v_allowed       text[];
  v_update        jsonb := '{}';
BEGIN
  IF v_technician_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Load job (validate ownership)
  SELECT * INTO v_job
    FROM public.technician_jobs
    WHERE id = p_job_id AND technician_id = v_technician_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Job not found');
  END IF;

  -- Enforce status machine
  v_allowed := CASE v_job.status
    WHEN 'assigned'  THEN ARRAY['en_route']
    WHEN 'en_route'  THEN ARRAY['on_site']
    WHEN 'on_site'   THEN ARRAY['completed']
    ELSE             ARRAY[]::text[]
  END;

  IF NOT (p_status = ANY(v_allowed)) THEN
    RETURN json_build_object(
      'error',
      'Invalid transition: ' || v_job.status || ' → ' || p_status
    );
  END IF;

  -- Build update payload
  UPDATE public.technician_jobs
    SET
      status           = p_status,
      completion_notes = COALESCE(NULLIF(TRIM(p_notes), ''), completion_notes),
      actual_fault     = COALESCE(NULLIF(TRIM(p_actual_fault), ''), actual_fault),
      completed_at     = CASE WHEN p_status = 'completed' THEN now() ELSE completed_at END,
      updated_at       = now()
    WHERE id = p_job_id;

  -- Audit log
  INSERT INTO public.technician_job_logs
    (job_id, actor_id, actor_role, action, prev_value, next_value, note)
  VALUES
    (p_job_id, v_technician_id, 'technician', 'status_changed',
     v_job.status, p_status,
     NULLIF(TRIM(COALESCE(p_notes, '')), ''));

  RETURN json_build_object('error', null);
END;
$$;

-- ---------------------------------------------------------------------------
-- capture_job_fault(p_job_id, p_fault)
-- Records the actual fault found on-site. Can be called once job is on_site
-- or later. Separate from completion notes — this is the diagnostic finding.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.capture_job_fault(
  p_job_id uuid,
  p_fault  text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_technician_id uuid := auth.uid();
  v_prev_fault    text;
BEGIN
  IF v_technician_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  IF NULLIF(TRIM(p_fault), '') IS NULL THEN
    RETURN json_build_object('error', 'Fault description cannot be empty');
  END IF;

  SELECT actual_fault INTO v_prev_fault
    FROM public.technician_jobs
    WHERE id = p_job_id AND technician_id = v_technician_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Job not found');
  END IF;

  UPDATE public.technician_jobs
    SET actual_fault = TRIM(p_fault), updated_at = now()
    WHERE id = p_job_id;

  INSERT INTO public.technician_job_logs
    (job_id, actor_id, actor_role, action, prev_value, next_value)
  VALUES
    (p_job_id, v_technician_id, 'technician', 'fault_captured',
     v_prev_fault, TRIM(p_fault));

  RETURN json_build_object('error', null);
END;
$$;

-- ---------------------------------------------------------------------------
-- admin_override_job_status(p_job_id, p_status, p_reason)
-- Admin can force any job to any valid status including cancellation.
-- Always writes an 'admin_override' log entry with the reason.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_override_job_status(
  p_job_id uuid,
  p_status text,
  p_reason text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_job      record;
BEGIN
  -- Confirm caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN json_build_object('error', 'Forbidden');
  END IF;

  IF p_status NOT IN ('assigned', 'en_route', 'on_site', 'completed', 'cancelled') THEN
    RETURN json_build_object('error', 'Invalid status value');
  END IF;

  SELECT * INTO v_job FROM public.technician_jobs WHERE id = p_job_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Job not found');
  END IF;

  UPDATE public.technician_jobs
    SET
      status           = p_status,
      cancelled_reason = CASE WHEN p_status = 'cancelled'
                              THEN COALESCE(NULLIF(TRIM(p_reason), ''), cancelled_reason)
                              ELSE cancelled_reason END,
      completed_at     = CASE WHEN p_status = 'completed' AND v_job.completed_at IS NULL
                              THEN now() ELSE completed_at END,
      updated_at       = now()
    WHERE id = p_job_id;

  INSERT INTO public.technician_job_logs
    (job_id, actor_id, actor_role, action, prev_value, next_value, note)
  VALUES
    (p_job_id, v_admin_id, 'admin', 'admin_override',
     v_job.status, p_status,
     NULLIF(TRIM(COALESCE(p_reason, '')), ''));

  RETURN json_build_object('error', null);
END;
$$;

-- ---------------------------------------------------------------------------
-- Indexes for common access patterns
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_lead_assignments_technician
  ON public.technician_lead_assignments (technician_id);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead
  ON public.technician_lead_assignments (lead_id);

CREATE INDEX IF NOT EXISTS idx_job_logs_job
  ON public.technician_job_logs (job_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_logs_actor
  ON public.technician_job_logs (actor_id);

CREATE INDEX IF NOT EXISTS idx_jobs_actual_fault
  ON public.technician_jobs (id) WHERE actual_fault IS NOT NULL;
