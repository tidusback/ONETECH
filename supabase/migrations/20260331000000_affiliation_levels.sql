-- =============================================================================
-- Affiliation Level Progression System
-- Levels: affiliate_technician → certified_technician → certified_partner
--
-- Design:
--   • Level is stored on technician_applications (the technician profile record)
--   • Technicians request promotion via technician_level_requests
--   • Admins approve/reject or directly set levels
--   • Criteria are stored in technician_level_criteria (editable without migration)
--   • territory_priority column is future-ready (not yet wired to routing logic)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extend technician_applications
-- ---------------------------------------------------------------------------

ALTER TABLE technician_applications
  ADD COLUMN IF NOT EXISTS affiliation_level text NOT NULL DEFAULT 'affiliate_technician'
    CHECK (affiliation_level IN ('affiliate_technician', 'certified_technician', 'certified_partner')),
  ADD COLUMN IF NOT EXISTS level_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS territory_priority integer NOT NULL DEFAULT 0;
    -- 0 = standard; higher = higher priority in territory matching (future use)

COMMENT ON COLUMN technician_applications.affiliation_level
  IS 'Current affiliation tier. Progresses on admin approval of a level request.';
COMMENT ON COLUMN technician_applications.territory_priority
  IS 'Future: higher values get preferential lead routing within shared territories.';

-- ---------------------------------------------------------------------------
-- 2. Level criteria reference table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS technician_level_criteria (
  level               text PRIMARY KEY CHECK (level IN ('certified_technician', 'certified_partner')),
  min_jobs_completed  integer NOT NULL,
  min_points_balance  integer NOT NULL,
  min_days_at_level   integer NOT NULL DEFAULT 0,
  description         text
);

INSERT INTO technician_level_criteria VALUES
  ('certified_technician',
   5, 1000, 0,
   'Complete at least 5 jobs and hold a released points balance of 1,000 pts.'),
  ('certified_partner',
   20, 4000, 30,
   'Complete at least 20 jobs, hold 4,000 released pts, and have been a Certified Technician for at least 30 days.')
ON CONFLICT (level) DO NOTHING;

-- Admins can UPDATE criteria rows via Supabase dashboard without a migration.
ALTER TABLE technician_level_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "criteria_public_read"
  ON technician_level_criteria FOR SELECT USING (true);
CREATE POLICY "criteria_admin_write"
  ON technician_level_criteria FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ---------------------------------------------------------------------------
-- 3. Level promotion requests
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS technician_level_requests (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id           uuid        NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  requested_level         text        NOT NULL
    CHECK (requested_level IN ('certified_technician', 'certified_partner')),
  current_level           text        NOT NULL,

  -- Snapshot of key metrics at the moment of request
  snapshot_jobs_completed integer     NOT NULL,
  snapshot_points_balance integer     NOT NULL,
  snapshot_days_at_level  integer     NOT NULL,

  -- Admin decision
  status                  text        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by             uuid        REFERENCES profiles (id),
  reviewed_at             timestamptz,
  rejection_reason        text,
  admin_notes             text,

  created_at              timestamptz NOT NULL DEFAULT now()
);

-- Only one pending request per technician at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_level_requests_one_pending
  ON technician_level_requests (technician_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_level_requests_technician
  ON technician_level_requests (technician_id, created_at DESC);

ALTER TABLE technician_level_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_level_requests_select"
  ON technician_level_requests FOR SELECT
  USING (auth.uid() = technician_id);

CREATE POLICY "own_level_requests_insert"
  ON technician_level_requests FOR INSERT
  WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "admin_level_requests_all"
  ON technician_level_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ---------------------------------------------------------------------------
-- 4. evaluate_progression_criteria(p_technician_id)
-- Returns a JSONB snapshot of criteria met/unmet for the NEXT level up.
-- Called server-side for display; also used internally by request_level_promotion.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION evaluate_progression_criteria (p_technician_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_app             technician_applications%ROWTYPE;
  v_criteria        technician_level_criteria%ROWTYPE;
  v_jobs_completed  integer;
  v_points_balance  integer;
  v_days_at_level   integer;
  v_next_level      text;
BEGIN
  SELECT * INTO v_app
    FROM technician_applications
    WHERE user_id = p_technician_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'No technician application found');
  END IF;

  -- Determine next level
  v_next_level := CASE v_app.affiliation_level
    WHEN 'affiliate_technician'  THEN 'certified_technician'
    WHEN 'certified_technician'  THEN 'certified_partner'
    ELSE NULL
  END;

  IF v_next_level IS NULL THEN
    RETURN jsonb_build_object(
      'current_level', v_app.affiliation_level,
      'next_level',    NULL,
      'at_max_level',  true
    );
  END IF;

  -- Completed jobs
  SELECT COUNT(*) INTO v_jobs_completed
    FROM technician_jobs
    WHERE technician_id = p_technician_id AND status = 'completed';

  -- Released points balance
  SELECT COALESCE(SUM(points), 0) INTO v_points_balance
    FROM technician_points
    WHERE technician_id = p_technician_id AND state = 'released';

  -- Days at current level (falls back to days since approved)
  v_days_at_level := GREATEST(0, (
    EXTRACT(EPOCH FROM (now() - COALESCE(v_app.level_updated_at, v_app.reviewed_at, v_app.created_at)))
    / 86400.0
  )::integer);

  -- Fetch criteria
  SELECT * INTO v_criteria
    FROM technician_level_criteria
    WHERE level = v_next_level;

  RETURN jsonb_build_object(
    'current_level',          v_app.affiliation_level,
    'next_level',             v_next_level,
    'at_max_level',           false,
    'jobs_completed',         v_jobs_completed,
    'points_balance',         v_points_balance,
    'days_at_level',          v_days_at_level,
    'criteria', jsonb_build_object(
      'min_jobs_completed',   v_criteria.min_jobs_completed,
      'min_points_balance',   v_criteria.min_points_balance,
      'min_days_at_level',    v_criteria.min_days_at_level,
      'description',          v_criteria.description
    ),
    'meets_jobs',     v_jobs_completed  >= v_criteria.min_jobs_completed,
    'meets_points',   v_points_balance  >= v_criteria.min_points_balance,
    'meets_tenure',   v_days_at_level   >= v_criteria.min_days_at_level,
    'meets_all', (
      v_jobs_completed  >= v_criteria.min_jobs_completed AND
      v_points_balance  >= v_criteria.min_points_balance AND
      v_days_at_level   >= v_criteria.min_days_at_level
    ),
    'has_pending_request', EXISTS (
      SELECT 1 FROM technician_level_requests
      WHERE technician_id = p_technician_id AND status = 'pending'
    )
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. request_level_promotion(p_technician_id)
-- Technician submits a promotion request. Allowed even if criteria not fully met
-- (admin decides). Blocked if a pending request already exists.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION request_level_promotion (p_technician_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_eval jsonb;
BEGIN
  IF auth.uid() != p_technician_id THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  v_eval := evaluate_progression_criteria(p_technician_id);

  IF v_eval->>'error' IS NOT NULL THEN
    RETURN v_eval;
  END IF;

  IF (v_eval->>'at_max_level')::boolean THEN
    RETURN jsonb_build_object('error', 'You are already at the highest affiliation level.');
  END IF;

  IF (v_eval->>'has_pending_request')::boolean THEN
    RETURN jsonb_build_object('error', 'You already have a pending promotion request. Please wait for admin review.');
  END IF;

  INSERT INTO technician_level_requests (
    technician_id,
    requested_level,
    current_level,
    snapshot_jobs_completed,
    snapshot_points_balance,
    snapshot_days_at_level
  ) VALUES (
    p_technician_id,
    v_eval->>'next_level',
    v_eval->>'current_level',
    (v_eval->>'jobs_completed')::integer,
    (v_eval->>'points_balance')::integer,
    (v_eval->>'days_at_level')::integer
  );

  RETURN jsonb_build_object(
    'success', true,
    'requested_level', v_eval->>'next_level'
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. approve_level_promotion(p_request_id, p_admin_notes)
-- Admin approves: updates request + promotes technician.
-- Also bumps territory_priority for certified_partner promotions.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION approve_level_promotion (
  p_request_id  uuid,
  p_admin_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req technician_level_requests%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT * INTO v_req FROM technician_level_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Request not found');
  END IF;
  IF v_req.status != 'pending' THEN
    RETURN jsonb_build_object('error', 'Request is no longer pending');
  END IF;

  UPDATE technician_level_requests SET
    status      = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    admin_notes = p_admin_notes
  WHERE id = p_request_id;

  UPDATE technician_applications SET
    affiliation_level  = v_req.requested_level,
    level_updated_at   = now(),
    -- Certified partners get a base territory priority boost (admin can override)
    territory_priority = CASE
      WHEN v_req.requested_level = 'certified_partner' THEN GREATEST(territory_priority, 10)
      WHEN v_req.requested_level = 'certified_technician' THEN GREATEST(territory_priority, 5)
      ELSE territory_priority
    END
  WHERE user_id = v_req.technician_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. reject_level_promotion(p_request_id, p_reason)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION reject_level_promotion (
  p_request_id uuid,
  p_reason     text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req technician_level_requests%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT * INTO v_req FROM technician_level_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Request not found');
  END IF;
  IF v_req.status != 'pending' THEN
    RETURN jsonb_build_object('error', 'Request is no longer pending');
  END IF;

  UPDATE technician_level_requests SET
    status           = 'rejected',
    reviewed_by      = auth.uid(),
    reviewed_at      = now(),
    rejection_reason = p_reason
  WHERE id = p_request_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ---------------------------------------------------------------------------
-- 8. admin_set_level(p_technician_id, p_level, p_notes)
-- Direct admin override — bypasses the request flow.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION admin_set_level (
  p_technician_id uuid,
  p_level         text,
  p_notes         text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  IF p_level NOT IN ('affiliate_technician', 'certified_technician', 'certified_partner') THEN
    RETURN jsonb_build_object('error', 'Invalid level');
  END IF;

  UPDATE technician_applications SET
    affiliation_level  = p_level,
    level_updated_at   = now(),
    territory_priority = CASE p_level
      WHEN 'certified_partner'    THEN GREATEST(territory_priority, 10)
      WHEN 'certified_technician' THEN GREATEST(territory_priority, 5)
      ELSE 0
    END,
    admin_notes = COALESCE(p_notes, admin_notes)
  WHERE user_id = p_technician_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Technician application not found');
  END IF;

  -- Cancel any pending request so there's no stale pending state
  UPDATE technician_level_requests SET
    status      = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    rejection_reason = 'Superseded by direct admin level assignment'
  WHERE technician_id = p_technician_id AND status = 'pending';

  RETURN jsonb_build_object('success', true);
END;
$$;
