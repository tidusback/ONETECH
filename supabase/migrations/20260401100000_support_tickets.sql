-- =============================================================================
-- Support Tickets — customer support request lifecycle
-- =============================================================================

CREATE SEQUENCE IF NOT EXISTS support_ticket_seq START 1000;

CREATE TABLE public.support_tickets (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number  TEXT        NOT NULL UNIQUE DEFAULT (
    'TRX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
    LPAD(NEXTVAL('support_ticket_seq')::TEXT, 4, '0')
  ),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject        TEXT        NOT NULL,
  description    TEXT,
  status         TEXT        NOT NULL DEFAULT 'open'
                   CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  priority       TEXT        NOT NULL DEFAULT 'medium'
                   CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category       TEXT,
  assigned_to    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at    TIMESTAMPTZ
);

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_support_tickets_user_id  ON public.support_tickets (user_id);
CREATE INDEX idx_support_tickets_status   ON public.support_tickets (status);
CREATE INDEX idx_support_tickets_assigned ON public.support_tickets (assigned_to);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Customers see their own tickets
CREATE POLICY "support_tickets: own select"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Customers submit tickets
CREATE POLICY "support_tickets: own insert"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins manage all tickets
CREATE POLICY "support_tickets: admin all"
  ON public.support_tickets FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
