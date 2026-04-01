-- Migration: technician_applications
-- Full technician job application with multi-step data and lifecycle status.
-- Storage bucket for uploaded documents is also provisioned here.

-- ---------------------------------------------------------------------------
-- Ensure set_updated_at() trigger function exists (may already exist from
-- earlier migrations — using CREATE OR REPLACE is safe)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technician_applications (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Step 1: Personal details
  full_name            text        NOT NULL,
  phone                text,
  bio                  text,

  -- Step 2: Location & service area
  city                 text,
  province             text,
  service_radius_km    integer     DEFAULT 50,
  service_areas        text[]      NOT NULL DEFAULT '{}',

  -- Step 3: Experience
  years_experience     integer,
  departments          text[]      NOT NULL DEFAULT '{}',  -- field_service | workshop | electrical | mechanical | parts_supply
  machine_categories   text[]      NOT NULL DEFAULT '{}',  -- CNC | Press | Welding | Compressor | etc.

  -- Step 4: Skills
  skills               text[]      NOT NULL DEFAULT '{}',

  -- Step 5: Documents
  id_document_url      text,
  qualification_urls   text[]      NOT NULL DEFAULT '{}',

  -- Agreement
  agreed_to_terms      boolean     NOT NULL DEFAULT false,
  agreed_at            timestamptz,

  -- Lifecycle status
  status               text        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'requires_info')),
  rejection_reason     text,
  admin_notes          text,
  reviewed_by          uuid        REFERENCES public.profiles(id),
  reviewed_at          timestamptz,

  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  -- One application per user
  UNIQUE (user_id)
);

-- Auto-update updated_at on every row change
CREATE TRIGGER technician_applications_updated_at
  BEFORE UPDATE ON public.technician_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.technician_applications ENABLE ROW LEVEL SECURITY;

-- Applicant can read their own application
CREATE POLICY "tech_app_select_own"
  ON public.technician_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Applicant can insert their own application
CREATE POLICY "tech_app_insert_own"
  ON public.technician_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Applicant can update while status is pending or requires_info
CREATE POLICY "tech_app_update_own"
  ON public.technician_applications FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('pending', 'requires_info'))
  WITH CHECK (auth.uid() = user_id);

-- Admin can read all applications
CREATE POLICY "tech_app_admin_select"
  ON public.technician_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update any application (status changes, notes)
CREATE POLICY "tech_app_admin_update"
  ON public.technician_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: technician-docs bucket (private)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'technician-docs',
  'technician-docs',
  false,
  10485760, -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Applicant can upload documents into their own folder: {user_id}/...
CREATE POLICY "tech_docs_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'technician-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Applicant can read their own documents
CREATE POLICY "tech_docs_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'technician-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Applicant can delete their own documents (e.g. to replace a file)
CREATE POLICY "tech_docs_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'technician-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin can read all documents
CREATE POLICY "tech_docs_admin_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'technician-docs'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
