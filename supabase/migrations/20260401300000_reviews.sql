-- =============================================================================
-- Reviews — customer ratings and feedback for completed jobs
-- =============================================================================

CREATE TABLE public.reviews (
  id             UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID     NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  technician_id  UUID     REFERENCES public.profiles(id),
  job_id         UUID     REFERENCES public.technician_jobs(id),
  rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  is_published   BOOLEAN  NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_reviews_user_id    ON public.reviews (user_id);
CREATE INDEX idx_reviews_technician ON public.reviews (technician_id);
CREATE INDEX idx_reviews_published  ON public.reviews (is_published);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read published reviews + their own
CREATE POLICY "reviews: read published or own"
  ON public.reviews FOR SELECT TO authenticated
  USING (is_published = TRUE OR user_id = auth.uid());

-- Users submit their own reviews
CREATE POLICY "reviews: own insert"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins manage all (publish, unpublish, delete)
CREATE POLICY "reviews: admin all"
  ON public.reviews FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

GRANT SELECT, INSERT ON public.reviews TO authenticated;
