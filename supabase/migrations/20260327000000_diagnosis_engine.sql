-- =============================================================================
-- Diagnosis Engine — V1 Schema
-- Trivelox Trading Inc.
--
-- Stable seed UUIDs used for cross-referencing conditions in diagnosis_outcomes:
--   Questions : aaaaaaaa-0000-0000-0000-00000000000{1-8}
--   Options   : bbbbbbbb-0000-0000-{cat:04}-00000000000{1-4}
--   Outcomes  : cccccccc-0000-0000-0000-00000000000{1-8}
--   Parts     : dddddddd-0000-0000-0000-00000000000{1-3}
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Issue categories (seeded; admin-managed in future)
CREATE TABLE public.issue_categories (
  id          TEXT        PRIMARY KEY,           -- e.g. 'power', 'noise'
  label       TEXT        NOT NULL,
  description TEXT        NOT NULL,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions per category (one per category in V1; schema supports multi-question branching)
CREATE TABLE public.diagnosis_questions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_category_id TEXT        NOT NULL REFERENCES public.issue_categories(id) ON DELETE CASCADE,
  question_text     TEXT        NOT NULL,
  hint_text         TEXT,
  sort_order        SMALLINT    NOT NULL DEFAULT 0,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Answer options per question
-- next_question_id enables branching in V2 (NULL = end of chain in V1)
CREATE TABLE public.diagnosis_options (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id      UUID        NOT NULL REFERENCES public.diagnosis_questions(id) ON DELETE CASCADE,
  option_text      TEXT        NOT NULL,
  sort_order       SMALLINT    NOT NULL DEFAULT 0,
  next_question_id UUID        REFERENCES public.diagnosis_questions(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outcomes with embedded rule conditions (JSONB array of {question_id, option_id})
-- conditions = '[]' means "always matches" (fallback / catch-all rule, confidence = 0.5)
-- conditions with entries are scored: matched / total → 0.0 – 1.0
CREATE TABLE public.diagnosis_outcomes (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_category_id   TEXT        NOT NULL REFERENCES public.issue_categories(id) ON DELETE CASCADE,
  title               TEXT        NOT NULL,   -- "Likely cause" headline
  description         TEXT        NOT NULL,
  recommended_action  TEXT        NOT NULL,
  urgency             TEXT        NOT NULL DEFAULT 'medium'
                                  CHECK (urgency IN ('low', 'medium', 'high')),
  conditions          JSONB       NOT NULL DEFAULT '[]'::JSONB,
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conditions_is_array CHECK (jsonb_typeof(conditions) = 'array')
);

-- Parts catalogue
CREATE TABLE public.parts (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT           NOT NULL,
  part_number  TEXT           NOT NULL UNIQUE,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  is_active    BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Recommended parts per outcome (sorted)
CREATE TABLE public.outcome_parts (
  outcome_id UUID     NOT NULL REFERENCES public.diagnosis_outcomes(id) ON DELETE CASCADE,
  part_id    UUID     NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (outcome_id, part_id)
);

-- User diagnosis sessions
-- machine_id is UUID without FK until the machines table is defined
CREATE TABLE public.diagnosis_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  machine_id        UUID,       -- FK to machines(id) added in a later migration
  issue_category_id TEXT        REFERENCES public.issue_categories(id) ON DELETE SET NULL,
  status            TEXT        NOT NULL DEFAULT 'in_progress'
                                CHECK (status IN ('in_progress', 'completed', 'escalated', 'abandoned')),
  outcome_id        UUID        REFERENCES public.diagnosis_outcomes(id) ON DELETE SET NULL,
  confidence_score  NUMERIC(5, 4) CHECK (confidence_score BETWEEN 0 AND 1),
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One answer per question per session (UNIQUE enforces upsert semantics)
CREATE TABLE public.diagnosis_answers (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        NOT NULL REFERENCES public.diagnosis_sessions(id) ON DELETE CASCADE,
  question_id UUID        NOT NULL REFERENCES public.diagnosis_questions(id) ON DELETE RESTRICT,
  option_id   UUID        NOT NULL REFERENCES public.diagnosis_options(id) ON DELETE RESTRICT,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, question_id)
);

-- ---------------------------------------------------------------------------
-- updated_at trigger for diagnosis_sessions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_diagnosis_sessions_updated_at
  BEFORE UPDATE ON public.diagnosis_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_dq_category    ON public.diagnosis_questions(issue_category_id) WHERE is_active = TRUE;
CREATE INDEX idx_do_question     ON public.diagnosis_options(question_id);
CREATE INDEX idx_dout_category   ON public.diagnosis_outcomes(issue_category_id) WHERE is_active = TRUE;
CREATE INDEX idx_dout_conditions ON public.diagnosis_outcomes USING GIN (conditions);
CREATE INDEX idx_op_outcome      ON public.outcome_parts(outcome_id);
CREATE INDEX idx_ds_user         ON public.diagnosis_sessions(user_id);
CREATE INDEX idx_ds_status       ON public.diagnosis_sessions(status);
CREATE INDEX idx_da_session      ON public.diagnosis_answers(session_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.issue_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_options   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_outcomes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_parts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_answers   ENABLE ROW LEVEL SECURITY;

-- Catalogue tables: any authenticated user can read
CREATE POLICY "issue_categories: auth read"    ON public.issue_categories    FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "diagnosis_questions: auth read" ON public.diagnosis_questions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "diagnosis_options: auth read"   ON public.diagnosis_options   FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "diagnosis_outcomes: auth read"  ON public.diagnosis_outcomes  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "parts: auth read"               ON public.parts               FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "outcome_parts: auth read"       ON public.outcome_parts       FOR SELECT TO authenticated USING (TRUE);

-- Session data: own rows only
CREATE POLICY "diagnosis_sessions: own"
  ON public.diagnosis_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "diagnosis_answers: own"
  ON public.diagnosis_answers FOR ALL TO authenticated
  USING (
    session_id IN (SELECT id FROM public.diagnosis_sessions WHERE user_id = auth.uid())
  )
  WITH CHECK (
    session_id IN (SELECT id FROM public.diagnosis_sessions WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

GRANT SELECT ON public.issue_categories    TO authenticated;
GRANT SELECT ON public.diagnosis_questions TO authenticated;
GRANT SELECT ON public.diagnosis_options   TO authenticated;
GRANT SELECT ON public.diagnosis_outcomes  TO authenticated;
GRANT SELECT ON public.parts               TO authenticated;
GRANT SELECT ON public.outcome_parts       TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnosis_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnosis_answers  TO authenticated;

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
-- All UUIDs are hardcoded so that conditions arrays in diagnosis_outcomes
-- can reference question_id / option_id values that remain stable across
-- re-seeds and environments.

DO $$
DECLARE

  -- Question IDs (one per category)
  qid_power       UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  qid_noise       UUID := 'aaaaaaaa-0000-0000-0000-000000000002';
  qid_heat        UUID := 'aaaaaaaa-0000-0000-0000-000000000003';
  qid_leak        UUID := 'aaaaaaaa-0000-0000-0000-000000000004';
  qid_vibration   UUID := 'aaaaaaaa-0000-0000-0000-000000000005';
  qid_performance UUID := 'aaaaaaaa-0000-0000-0000-000000000006';
  qid_error       UUID := 'aaaaaaaa-0000-0000-0000-000000000007';
  qid_other       UUID := 'aaaaaaaa-0000-0000-0000-000000000008';

  -- Option IDs — power (cat 1)
  oid_power_1 UUID := 'bbbbbbbb-0000-0000-0001-000000000001'; -- Just now
  oid_power_2 UUID := 'bbbbbbbb-0000-0000-0001-000000000002'; -- A few days ago
  oid_power_3 UUID := 'bbbbbbbb-0000-0000-0001-000000000003'; -- About a week ago
  oid_power_4 UUID := 'bbbbbbbb-0000-0000-0001-000000000004'; -- It never worked right

  -- Option IDs — noise (cat 2)
  oid_noise_1 UUID := 'bbbbbbbb-0000-0000-0002-000000000001'; -- Grinding / scraping
  oid_noise_2 UUID := 'bbbbbbbb-0000-0000-0002-000000000002'; -- Knocking / banging
  oid_noise_3 UUID := 'bbbbbbbb-0000-0000-0002-000000000003'; -- High-pitched squeal
  oid_noise_4 UUID := 'bbbbbbbb-0000-0000-0002-000000000004'; -- Rattling / vibration

  -- Option IDs — heat (cat 3)
  oid_heat_1 UUID := 'bbbbbbbb-0000-0000-0003-000000000001'; -- Straight after starting
  oid_heat_2 UUID := 'bbbbbbbb-0000-0000-0003-000000000002'; -- After running a while
  oid_heat_3 UUID := 'bbbbbbbb-0000-0000-0003-000000000003'; -- Only under heavy load
  oid_heat_4 UUID := 'bbbbbbbb-0000-0000-0003-000000000004'; -- Randomly / no pattern

  -- Option IDs — leak (cat 4)
  oid_leak_1 UUID := 'bbbbbbbb-0000-0000-0004-000000000001'; -- Oil or lubricant
  oid_leak_2 UUID := 'bbbbbbbb-0000-0000-0004-000000000002'; -- Water or coolant
  oid_leak_3 UUID := 'bbbbbbbb-0000-0000-0004-000000000003'; -- Air or gas
  oid_leak_4 UUID := 'bbbbbbbb-0000-0000-0004-000000000004'; -- Not sure

  -- Option IDs — vibration (cat 5)
  oid_vibration_1 UUID := 'bbbbbbbb-0000-0000-0005-000000000001'; -- Slight
  oid_vibration_2 UUID := 'bbbbbbbb-0000-0000-0005-000000000002'; -- Moderate
  oid_vibration_3 UUID := 'bbbbbbbb-0000-0000-0005-000000000003'; -- Severe
  oid_vibration_4 UUID := 'bbbbbbbb-0000-0000-0005-000000000004'; -- Only at certain speeds

  -- Option IDs — performance (cat 6)
  oid_perf_1 UUID := 'bbbbbbbb-0000-0000-0006-000000000001'; -- Just today
  oid_perf_2 UUID := 'bbbbbbbb-0000-0000-0006-000000000002'; -- A few days
  oid_perf_3 UUID := 'bbbbbbbb-0000-0000-0006-000000000003'; -- A week or more
  oid_perf_4 UUID := 'bbbbbbbb-0000-0000-0006-000000000004'; -- Gradually getting worse

  -- Option IDs — error (cat 7)
  oid_error_1 UUID := 'bbbbbbbb-0000-0000-0007-000000000001'; -- Error code on display
  oid_error_2 UUID := 'bbbbbbbb-0000-0000-0007-000000000002'; -- Alarm sound only
  oid_error_3 UUID := 'bbbbbbbb-0000-0000-0007-000000000003'; -- Warning light is on
  oid_error_4 UUID := 'bbbbbbbb-0000-0000-0007-000000000004'; -- Multiple warnings at once

  -- Option IDs — other (cat 8)
  oid_other_1 UUID := 'bbbbbbbb-0000-0000-0008-000000000001'; -- Critical
  oid_other_2 UUID := 'bbbbbbbb-0000-0000-0008-000000000002'; -- High
  oid_other_3 UUID := 'bbbbbbbb-0000-0000-0008-000000000003'; -- Medium
  oid_other_4 UUID := 'bbbbbbbb-0000-0000-0008-000000000004'; -- Low

  -- Outcome IDs
  out_power       UUID := 'cccccccc-0000-0000-0000-000000000001';
  out_noise       UUID := 'cccccccc-0000-0000-0000-000000000002';
  out_heat        UUID := 'cccccccc-0000-0000-0000-000000000003';
  out_leak        UUID := 'cccccccc-0000-0000-0000-000000000004';
  out_vibration   UUID := 'cccccccc-0000-0000-0000-000000000005';
  out_performance UUID := 'cccccccc-0000-0000-0000-000000000006';
  out_error       UUID := 'cccccccc-0000-0000-0000-000000000007';
  out_other       UUID := 'cccccccc-0000-0000-0000-000000000008';

  -- Part IDs
  part_valve  UUID := 'dddddddd-0000-0000-0000-000000000001';
  part_seal   UUID := 'dddddddd-0000-0000-0000-000000000002';
  part_filter UUID := 'dddddddd-0000-0000-0000-000000000003';

BEGIN

  -- -------------------------------------------------------------------------
  -- Issue categories
  -- -------------------------------------------------------------------------

  INSERT INTO public.issue_categories (id, label, description, sort_order) VALUES
    ('power',       'Won''t start',       'Machine doesn''t power on or turn off normally', 1),
    ('noise',       'Strange noise',      'Unusual grinding, knocking, or squealing',       2),
    ('heat',        'Overheating',        'Machine gets too hot during operation',          3),
    ('leak',        'Leaking',            'Oil, water, or other fluid leaking out',         4),
    ('vibration',   'Vibrating badly',    'Excessive shaking or instability',               5),
    ('performance', 'Poor performance',   'Slow output, reduced quality, or low power',     6),
    ('error',       'Error code / alarm', 'Warning light, alarm, or error code showing',   7),
    ('other',       'Something else',     'Describe the problem in your own words',         8);

  -- -------------------------------------------------------------------------
  -- Questions
  -- -------------------------------------------------------------------------

  INSERT INTO public.diagnosis_questions (id, issue_category_id, question_text, sort_order) VALUES
    (qid_power,       'power',       'When did this start?',                          0),
    (qid_noise,       'noise',       'What does the noise sound like?',               0),
    (qid_heat,        'heat',        'When does it overheat?',                        0),
    (qid_leak,        'leak',        'What is leaking?',                              0),
    (qid_vibration,   'vibration',   'How severe is the vibration?',                  0),
    (qid_performance, 'performance', 'How long has performance been affected?',       0),
    (qid_error,       'error',       'What are you seeing on the machine?',           0),
    (qid_other,       'other',       'How urgent is this for you?',                   0);

  -- -------------------------------------------------------------------------
  -- Options
  -- -------------------------------------------------------------------------

  INSERT INTO public.diagnosis_options (id, question_id, option_text, sort_order) VALUES
    -- power
    (oid_power_1, qid_power, 'Just now',              0),
    (oid_power_2, qid_power, 'A few days ago',        1),
    (oid_power_3, qid_power, 'About a week ago',      2),
    (oid_power_4, qid_power, 'It never worked right', 3),
    -- noise
    (oid_noise_1, qid_noise, 'Grinding / scraping',  0),
    (oid_noise_2, qid_noise, 'Knocking / banging',   1),
    (oid_noise_3, qid_noise, 'High-pitched squeal',  2),
    (oid_noise_4, qid_noise, 'Rattling / vibration', 3),
    -- heat
    (oid_heat_1, qid_heat, 'Straight after starting',   0),
    (oid_heat_2, qid_heat, 'After running a while',     1),
    (oid_heat_3, qid_heat, 'Only under heavy load',     2),
    (oid_heat_4, qid_heat, 'Randomly / no pattern',     3),
    -- leak
    (oid_leak_1, qid_leak, 'Oil or lubricant',   0),
    (oid_leak_2, qid_leak, 'Water or coolant',   1),
    (oid_leak_3, qid_leak, 'Air or gas',         2),
    (oid_leak_4, qid_leak, 'Not sure',           3),
    -- vibration
    (oid_vibration_1, qid_vibration, 'Slight — barely noticeable', 0),
    (oid_vibration_2, qid_vibration, 'Moderate — affects work',    1),
    (oid_vibration_3, qid_vibration, 'Severe — hard to operate',   2),
    (oid_vibration_4, qid_vibration, 'Only at certain speeds',     3),
    -- performance
    (oid_perf_1, qid_performance, 'Just today',               0),
    (oid_perf_2, qid_performance, 'A few days',               1),
    (oid_perf_3, qid_performance, 'A week or more',           2),
    (oid_perf_4, qid_performance, 'Gradually getting worse',  3),
    -- error
    (oid_error_1, qid_error, 'Error code on display',     0),
    (oid_error_2, qid_error, 'Alarm sound only',          1),
    (oid_error_3, qid_error, 'Warning light is on',       2),
    (oid_error_4, qid_error, 'Multiple warnings at once', 3),
    -- other
    (oid_other_1, qid_other, 'Critical — machine is stopped', 0),
    (oid_other_2, qid_other, 'High — production affected',    1),
    (oid_other_3, qid_other, 'Medium — can still work',       2),
    (oid_other_4, qid_other, 'Low — just want it checked',    3);

  -- -------------------------------------------------------------------------
  -- Outcomes — V1: all use empty conditions (fallback rules, confidence = 0.5)
  -- Admins add specific-answer rules via the admin panel in future iterations.
  -- -------------------------------------------------------------------------

  INSERT INTO public.diagnosis_outcomes
    (id, issue_category_id, title, description, recommended_action, urgency, conditions)
  VALUES
    (out_power, 'power',
      'Faulty start capacitor or power relay',
      'Electrical faults in the starting circuit are the most common cause of a machine that won''t power on.',
      'A technician visit is recommended to inspect the electrical system safely.',
      'high', '[]'::JSONB),

    (out_noise, 'noise',
      'Worn bearing or loose internal component',
      'Unusual sounds typically indicate mechanical wear or a fastener that has worked loose during operation.',
      'Schedule a service visit before the issue worsens or causes further damage.',
      'medium', '[]'::JSONB),

    (out_heat, 'heat',
      'Blocked air vents or failing cooling system',
      'Restricted airflow or a degraded cooling circuit prevents the machine from dissipating heat effectively.',
      'Stop using the machine until inspected to prevent further damage.',
      'high', '[]'::JSONB),

    (out_leak, 'leak',
      'Degraded seal or cracked hose',
      'Fluid leaks almost always originate from a failed seal, O-ring, or hose connector.',
      'Replace the affected seal or hose as soon as possible.',
      'medium', '[]'::JSONB),

    (out_vibration, 'vibration',
      'Imbalanced component or loose mounting',
      'Excessive vibration points to an out-of-balance rotating part or fasteners that have loosened over time.',
      'Tighten all mounting bolts and check for worn rotating components.',
      'medium', '[]'::JSONB),

    (out_performance, 'performance',
      'Clogged filter or calibration drift',
      'Gradual performance loss is most often caused by a blocked filter restricting flow or a sensor that has drifted out of spec.',
      'Clean or replace filters and run a full calibration check.',
      'low', '[]'::JSONB),

    (out_error, 'error',
      'Sensor fault or software error',
      'Active error codes indicate the machine''s own diagnostics have detected a problem — usually a sensor, actuator, or firmware issue.',
      'Note the exact error code and escalate to our support team for diagnosis.',
      'medium', '[]'::JSONB),

    (out_other, 'other',
      'Requires manual inspection by a technician',
      'Without a clearly identifiable symptom pattern, a hands-on inspection is the most reliable next step.',
      'Our team will review your report and contact you to arrange an inspection.',
      'low', '[]'::JSONB);

  -- -------------------------------------------------------------------------
  -- Parts
  -- -------------------------------------------------------------------------

  INSERT INTO public.parts (id, name, part_number, description, price) VALUES
    (part_valve,  'Pressure Relief Valve', 'PRV-2200',  'Standard replacement valve, fits most models',            89.00),
    (part_seal,   'Seal Kit (Complete)',   'SK-4400-C', 'Full seal replacement kit including O-rings',             45.00),
    (part_filter, 'Oil Filter Cartridge',  'OF-110',    'OEM-compatible filter, recommended 3-month replacement',  22.50);

  -- -------------------------------------------------------------------------
  -- Outcome → Parts mappings
  -- -------------------------------------------------------------------------

  INSERT INTO public.outcome_parts (outcome_id, part_id, sort_order) VALUES
    -- Leak: seal kit first (primary fix), then filter (replace at same time)
    (out_leak,        part_seal,   0),
    (out_leak,        part_filter, 1),
    -- Heat: filter (most common cooling restriction)
    (out_heat,        part_filter, 0),
    -- Performance: filter first, valve second (pressure check)
    (out_performance, part_filter, 0),
    (out_performance, part_valve,  1);

END $$;
