-- Migration: technician_dashboard
-- Creates tables for the technician-facing experience:
-- leads (job opportunities), jobs (assigned work orders),
-- points (earnings log), rewards catalog, and redemptions.

-- ---------------------------------------------------------------------------
-- Sequence helpers for readable IDs
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS technician_lead_seq;
CREATE SEQUENCE IF NOT EXISTS technician_job_seq;

-- ---------------------------------------------------------------------------
-- technician_leads — job opportunities posted by admin
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technician_leads (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_number      text        NOT NULL UNIQUE DEFAULT (
    'TRXL-' || to_char(now(), 'YYYYMMDD') || '-' ||
    lpad(nextval('technician_lead_seq')::text, 4, '0')
  ),
  title            text        NOT NULL,
  description      text,
  category         text,                          -- CNC | Press | Welding | etc.
  location_city    text,
  location_province text,
  urgency          text        NOT NULL DEFAULT 'normal'
                     CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  status           text        NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open', 'assigned', 'closed', 'expired')),
  assigned_to      uuid        REFERENCES public.profiles(id),
  created_by       uuid        REFERENCES public.profiles(id),
  expires_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER technician_leads_updated_at
  BEFORE UPDATE ON public.technician_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.technician_leads ENABLE ROW LEVEL SECURITY;

-- Approved technicians can view open leads
CREATE POLICY "tech_leads_select_approved"
  ON public.technician_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.technician_applications
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

-- Admins see all and can manage
CREATE POLICY "tech_leads_admin_all"
  ON public.technician_leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- technician_jobs — work orders assigned to a specific technician
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technician_jobs (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number         text        NOT NULL UNIQUE DEFAULT (
    'TRXJ-' || to_char(now(), 'YYYYMMDD') || '-' ||
    lpad(nextval('technician_job_seq')::text, 4, '0')
  ),
  lead_id            uuid        REFERENCES public.technician_leads(id),
  technician_id      uuid        NOT NULL REFERENCES public.profiles(id),
  title              text        NOT NULL,
  description        text,
  category           text,
  customer_name      text,
  customer_phone     text,
  location_address   text,
  location_city      text,
  location_province  text,
  scheduled_date     timestamptz,
  status             text        NOT NULL DEFAULT 'assigned'
                       CHECK (status IN ('assigned', 'en_route', 'on_site', 'completed', 'cancelled')),
  completion_notes   text,
  admin_notes        text,
  points_awarded     integer,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  completed_at       timestamptz
);

CREATE TRIGGER technician_jobs_updated_at
  BEFORE UPDATE ON public.technician_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.technician_jobs ENABLE ROW LEVEL SECURITY;

-- Technicians see only their own jobs
CREATE POLICY "tech_jobs_select_own"
  ON public.technician_jobs FOR SELECT
  USING (auth.uid() = technician_id);

-- Technicians can update their own jobs (status changes, completion notes)
CREATE POLICY "tech_jobs_update_own"
  ON public.technician_jobs FOR UPDATE
  USING (auth.uid() = technician_id AND status NOT IN ('completed', 'cancelled'))
  WITH CHECK (auth.uid() = technician_id);

-- Admins manage all jobs
CREATE POLICY "tech_jobs_admin_all"
  ON public.technician_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- technician_points — points transaction log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technician_points (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id  uuid        NOT NULL REFERENCES public.profiles(id),
  job_id         uuid        REFERENCES public.technician_jobs(id),
  points         integer     NOT NULL,             -- positive = earned, negative = spent
  reason         text        NOT NULL DEFAULT 'job_completed'
                   CHECK (reason IN ('job_completed', 'bonus', 'adjustment', 'redemption')),
  note           text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.technician_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tech_points_select_own"
  ON public.technician_points FOR SELECT
  USING (auth.uid() = technician_id);

CREATE POLICY "tech_points_admin_all"
  ON public.technician_points FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- technician_rewards — reward catalog (admin-managed)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technician_rewards (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  description  text,
  points_cost  integer     NOT NULL CHECK (points_cost > 0),
  category     text        NOT NULL DEFAULT 'voucher'
                 CHECK (category IN ('voucher', 'tool', 'merchandise', 'cash_equivalent')),
  is_active    boolean     NOT NULL DEFAULT true,
  stock        integer,                            -- null = unlimited
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.technician_rewards ENABLE ROW LEVEL SECURITY;

-- All technicians can view the rewards catalog
CREATE POLICY "tech_rewards_select_tech"
  ON public.technician_rewards FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('technician', 'admin')
    )
  );

CREATE POLICY "tech_rewards_admin_all"
  ON public.technician_rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed initial rewards catalog
INSERT INTO public.technician_rewards (title, description, points_cost, category) VALUES
  ('Fuel Voucher — R50',        'Redeemable at any major fuel station.',           500,  'voucher'),
  ('Fuel Voucher — R100',       'Redeemable at any major fuel station.',           1000, 'voucher'),
  ('Tool Store Credit — R100',  'Credit usable at partner tool supply stores.',    1000, 'tool'),
  ('Tool Store Credit — R250',  'Credit usable at partner tool supply stores.',    2500, 'tool'),
  ('Grocery Voucher — R200',    'Redeemable at Pick n Pay / Checkers.',            2000, 'voucher'),
  ('Trivelox Work Shirt',       'Branded technician work shirt. State your size.', 300,  'merchandise'),
  ('Trivelox Tool Bag',         'Heavy-duty branded canvas tool bag.',             800,  'merchandise'),
  ('R500 Cash Equivalent',      'Processed as an EFT transfer to your account.',   5000, 'cash_equivalent')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- technician_reward_redemptions — redemption history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technician_reward_redemptions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id  uuid        NOT NULL REFERENCES public.profiles(id),
  reward_id      uuid        NOT NULL REFERENCES public.technician_rewards(id),
  points_spent   integer     NOT NULL,
  status         text        NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'processed', 'rejected')),
  note           text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  processed_at   timestamptz
);

ALTER TABLE public.technician_reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tech_redemptions_select_own"
  ON public.technician_reward_redemptions FOR SELECT
  USING (auth.uid() = technician_id);

CREATE POLICY "tech_redemptions_insert_own"
  ON public.technician_reward_redemptions INSERT
  WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "tech_redemptions_admin_all"
  ON public.technician_reward_redemptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
