-- =============================================================================
-- Custom Requests — bespoke service requests from customers
-- =============================================================================

CREATE SEQUENCE IF NOT EXISTS custom_request_seq START 1000;

CREATE TABLE public.custom_requests (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT           NOT NULL UNIQUE DEFAULT (
    'TRXC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
    LPAD(NEXTVAL('custom_request_seq')::TEXT, 4, '0')
  ),
  user_id        UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title          TEXT           NOT NULL,
  description    TEXT,
  category       TEXT,
  budget         NUMERIC(12, 2),
  status         TEXT           NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new', 'reviewing', 'quoted', 'accepted', 'declined', 'completed')),
  admin_notes    TEXT,
  quoted_price   NUMERIC(12, 2),
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER custom_requests_updated_at
  BEFORE UPDATE ON public.custom_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_custom_requests_user_id ON public.custom_requests (user_id);
CREATE INDEX idx_custom_requests_status  ON public.custom_requests (status);

ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Customers see their own
CREATE POLICY "custom_requests: own select"
  ON public.custom_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "custom_requests: own insert"
  ON public.custom_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins manage all
CREATE POLICY "custom_requests: admin all"
  ON public.custom_requests FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

GRANT SELECT, INSERT, UPDATE ON public.custom_requests TO authenticated;
