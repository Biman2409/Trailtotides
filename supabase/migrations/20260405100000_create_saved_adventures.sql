-- Saved adventures (wishlist) for Trail to Tides users

CREATE TABLE IF NOT EXISTS public.saved_adventures (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug       text NOT NULL,
  saved_at   timestamptz DEFAULT now(),
  UNIQUE (user_id, slug)
);

ALTER TABLE public.saved_adventures ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users view own saved" ON public.saved_adventures
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own saved" ON public.saved_adventures
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users delete own saved" ON public.saved_adventures
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
