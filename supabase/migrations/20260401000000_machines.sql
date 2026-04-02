-- =============================================================================
-- Machines — user-owned equipment registry
-- =============================================================================

CREATE TABLE public.machines (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  model           TEXT,
  serial_number   TEXT,
  category        TEXT,
  manufacturer    TEXT,
  year            SMALLINT,
  status          TEXT        NOT NULL DEFAULT 'operational'
                    CHECK (status IN ('operational', 'needs-service', 'out-of-service', 'archived')),
  warranty_status TEXT        NOT NULL DEFAULT 'unknown'
                    CHECK (warranty_status IN ('under-warranty', 'out-of-warranty', 'unknown')),
  purchased_at    DATE,
  notes           TEXT,
  image_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER machines_updated_at
  BEFORE UPDATE ON public.machines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_machines_user_id ON public.machines (user_id);
CREATE INDEX idx_machines_status  ON public.machines (status);

ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

-- Users manage their own machines
CREATE POLICY "machines: own all"
  ON public.machines FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins see all
CREATE POLICY "machines: admin all"
  ON public.machines FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.machines TO authenticated;
