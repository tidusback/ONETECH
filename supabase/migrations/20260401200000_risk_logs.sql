-- =============================================================================
-- Risk Logs — platform security audit trail and anomaly flagging
-- =============================================================================

CREATE TABLE public.risk_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   TEXT        NOT NULL,
  severity     TEXT        NOT NULL DEFAULT 'medium'
                 CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status       TEXT        NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  description  TEXT        NOT NULL,
  actor_id     UUID        REFERENCES public.profiles(id),
  metadata     JSONB       NOT NULL DEFAULT '{}'::JSONB,
  resolved_at  TIMESTAMPTZ,
  resolved_by  UUID        REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER risk_logs_updated_at
  BEFORE UPDATE ON public.risk_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_risk_logs_severity ON public.risk_logs (severity);
CREATE INDEX idx_risk_logs_status   ON public.risk_logs (status);
CREATE INDEX idx_risk_logs_created  ON public.risk_logs (created_at DESC);

ALTER TABLE public.risk_logs ENABLE ROW LEVEL SECURITY;

-- Admins only — risk data is internal
CREATE POLICY "risk_logs: admin all"
  ON public.risk_logs FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

GRANT SELECT, INSERT, UPDATE ON public.risk_logs TO authenticated;
