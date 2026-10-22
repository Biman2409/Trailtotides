-- Adventure reviews: one per user per adventure, shown on the adventure page and in the passport.
--
--   /api/reviews        reads by adventure, adds (one per user per adventure), deletes your own
--   admin dashboard     lists every review and deletes any
--   passport            reads your own reviews for your stamps
--
-- Access rules (RLS):
--   * anyone can read reviews: they're public on the adventure page
--   * all writes go through the server with the service role, which checks who's signed in,
--     so there are no insert, update or delete policies

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_slug text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Name shown on the review, taken from the account when it's posted
  username text NOT NULL CHECK (char_length(username) BETWEEN 1 AND 100),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- The API checks this too; the constraint stops two quick posts both getting through
  UNIQUE (adventure_slug, user_id)
);
CREATE INDEX IF NOT EXISTS reviews_adventure_idx ON public.reviews (adventure_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_user_idx ON public.reviews (user_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Let the API see the new table straight away
NOTIFY pgrst, 'reload schema';
