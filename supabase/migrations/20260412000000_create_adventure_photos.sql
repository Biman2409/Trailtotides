-- Adventure community photos for Trail to Tides

CREATE TABLE IF NOT EXISTS public.adventure_photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL,
  user_id uuid NOT NULL,
  username text NOT NULL,
  avatar_id int,
  caption text DEFAULT '',
  url text NOT NULL,
  path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_adventure_photos_slug ON public.adventure_photos(slug);

ALTER TABLE public.adventure_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public read adventure_photos"
  ON public.adventure_photos FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Auth insert adventure_photos"
  ON public.adventure_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Own delete adventure_photos"
  ON public.adventure_photos FOR DELETE
  USING (auth.uid() = user_id);
