-- ============================================================
-- Part Requests — order request / manual fulfillment flow
-- ============================================================

-- Monotonically-increasing sequence for human-readable order numbers
CREATE SEQUENCE IF NOT EXISTS part_request_seq START 1000;

-- ──────────────────────────────────────────────────────────────
-- Table: part_requests
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS part_requests (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number   text        UNIQUE NOT NULL
                               DEFAULT ('TRXR-' || TO_CHAR(now(), 'YYYYMMDD') || '-'
                                        || LPAD(NEXTVAL('part_request_seq')::text, 4, '0')),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Status lifecycle
  status           text        NOT NULL DEFAULT 'pending',

  -- Customer contact details (snapshot at submission time)
  customer_name    text        NOT NULL,
  customer_email   text        NOT NULL,
  customer_company text,
  customer_phone   text,

  -- Logistics
  shipping_address text,

  -- Notes
  notes            text,        -- from customer
  admin_notes      text,        -- internal / team only

  -- Timestamps
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  confirmed_at     timestamptz,
  shipped_at       timestamptz,
  delivered_at     timestamptz,

  CONSTRAINT part_requests_status_check CHECK (
    status IN ('pending','reviewing','quoted','confirmed','processing','shipped','delivered','cancelled')
  )
);

-- ──────────────────────────────────────────────────────────────
-- Table: part_request_items
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS part_request_items (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   uuid        NOT NULL REFERENCES part_requests(id) ON DELETE CASCADE,
  part_number  text        NOT NULL,
  part_name    text        NOT NULL,
  part_category text       NOT NULL DEFAULT '',
  quantity     integer     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS part_requests_user_id_idx    ON part_requests(user_id);
CREATE INDEX IF NOT EXISTS part_requests_status_idx     ON part_requests(status);
CREATE INDEX IF NOT EXISTS part_requests_created_at_idx ON part_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS part_request_items_req_idx   ON part_request_items(request_id);

-- ──────────────────────────────────────────────────────────────
-- updated_at trigger
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_part_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER part_requests_updated_at
  BEFORE UPDATE ON part_requests
  FOR EACH ROW EXECUTE FUNCTION update_part_requests_updated_at();

-- ──────────────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────────────
ALTER TABLE part_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_request_items ENABLE ROW LEVEL SECURITY;

-- part_requests ─────────────────────────────────────────────

-- Customers see their own requests
CREATE POLICY "own_requests_select"
  ON part_requests FOR SELECT
  USING (user_id = auth.uid());

-- Admins see all requests
CREATE POLICY "admin_requests_select"
  ON part_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Authenticated users can submit a new request (must own the row)
CREATE POLICY "insert_own_request"
  ON part_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Admins can update status / admin_notes on any request
CREATE POLICY "admin_update_requests"
  ON part_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Customers may cancel their own pending or reviewing requests only
CREATE POLICY "customer_cancel_request"
  ON part_requests FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('pending', 'reviewing'))
  WITH CHECK (status = 'cancelled');

-- part_request_items ────────────────────────────────────────

-- Customers see items that belong to their requests
CREATE POLICY "own_items_select"
  ON part_request_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM part_requests
      WHERE part_requests.id = request_id
        AND part_requests.user_id = auth.uid()
    )
  );

-- Admins see all items
CREATE POLICY "admin_items_select"
  ON part_request_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users may insert items into their own requests
CREATE POLICY "insert_own_items"
  ON part_request_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM part_requests
      WHERE part_requests.id = request_id
        AND part_requests.user_id = auth.uid()
    )
  );
