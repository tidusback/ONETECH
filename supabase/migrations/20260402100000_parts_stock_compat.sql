-- =============================================================================
-- Parts — add stock tracking and compatibility notes
-- =============================================================================
-- stock        — NULL means unlimited / not tracked; integer >= 0 means tracked quantity
-- compatibility — free-text comma-separated models (e.g. "CAT 320C, Volvo EC210, Komatsu PC200")
--                kept as plain text for simplicity; no lookup table needed at this stage

ALTER TABLE public.parts
  ADD COLUMN IF NOT EXISTS stock         integer     CHECK (stock IS NULL OR stock >= 0),
  ADD COLUMN IF NOT EXISTS compatibility text;

COMMENT ON COLUMN public.parts.stock
  IS 'Available quantity. NULL = not tracked (unlimited). 0 = out of stock.';

COMMENT ON COLUMN public.parts.compatibility
  IS 'Free-text list of compatible machine models, comma-separated.';
