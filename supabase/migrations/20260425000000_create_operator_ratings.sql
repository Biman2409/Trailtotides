-- Operator ratings submitted by users during adventure reviews

CREATE TABLE IF NOT EXISTS public.operator_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  adventure_slug text NOT NULL,
  operator_name text NOT NULL,          -- normalized lowercase trim
  operator_name_display text NOT NULL,  -- original casing as entered
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE (adventure_slug, operator_name, user_id)
);

ALTER TABLE public.operator_ratings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users insert own rating" ON public.operator_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users view own rating" ON public.operator_ratings
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access" ON public.operator_ratings
    FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
