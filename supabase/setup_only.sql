-- ============================================================
-- Trail to Tides - Full Supabase Setup
-- Paste this into SQL Editor and click Run
-- ============================================================

-- 1. Profiles (user profiles synced from auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  username text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admin read all" ON public.profiles FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, username)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email, new.raw_user_meta_data ->> 'user_name');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL,
  body text NOT NULL DEFAULT '',
  author_name text NOT NULL,
  author_role text NOT NULL DEFAULT '',
  author_bio text DEFAULT '',
  author_avatar text DEFAULT '',
  hero_image text NOT NULL,
  read_time text NOT NULL DEFAULT '5 min read',
  tags text[] DEFAULT '{}',
  region text NOT NULL DEFAULT 'Himalayas',
  date text NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'pending')),
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Anyone can read published stories" ON public.stories FOR SELECT USING (status = 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth users can insert stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Authors can update own stories" ON public.stories FOR UPDATE USING (auth.uid() = submitted_by); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Service role full access" ON public.stories FOR ALL TO service_role USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Story views
CREATE TABLE IF NOT EXISTS public.story_views (
  slug text NOT NULL PRIMARY KEY,
  views integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Anyone can read story views" ON public.story_views FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Service role full access views" ON public.story_views FOR ALL TO service_role USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.increment_story_views(story_slug text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE new_views integer;
BEGIN
  INSERT INTO public.story_views (slug, views) VALUES (story_slug, 1)
  ON CONFLICT (slug) DO UPDATE SET views = story_views.views + 1, updated_at = now()
  RETURNING story_views.views INTO new_views;
  RETURN new_views;
END;
$$;

INSERT INTO public.story_views (slug, views) VALUES ('the-night-photi-la-tested-us', 2553), ('riding-through-a-revolution', 2532) ON CONFLICT (slug) DO NOTHING;

-- 4. Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Service role read all" ON public.contact_messages FOR SELECT TO service_role USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users view own messages" ON public.messages FOR SELECT USING (auth.uid() IN (sender_id, recipient_id)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. Operator profiles
CREATE TABLE IF NOT EXISTS public.operator_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  company_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  website text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.operator_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id uuid NOT NULL REFERENCES public.operator_profiles(id) ON DELETE CASCADE,
  adventure_slug text NOT NULL,
  operator_name text NOT NULL,
  price_from text NOT NULL,
  exact_dates text[] DEFAULT '{}',
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Operators view own profile" ON public.operator_profiles FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Operators insert profile" ON public.operator_profiles FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Operators view own submissions" ON public.operator_submissions FOR SELECT USING (operator_id IN (SELECT id FROM public.operator_profiles WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Operators insert submissions" ON public.operator_submissions FOR INSERT WITH CHECK (operator_id IN (SELECT id FROM public.operator_profiles WHERE user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Service role full access profiles" ON public.operator_profiles FOR ALL TO service_role USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Service role full access submissions" ON public.operator_submissions FOR ALL TO service_role USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. Saved adventures
CREATE TABLE IF NOT EXISTS public.saved_adventures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL,
  saved_at timestamptz DEFAULT now(),
  UNIQUE (user_id, slug)
);

ALTER TABLE public.saved_adventures ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users view own saved" ON public.saved_adventures FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users insert own saved" ON public.saved_adventures FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users delete own saved" ON public.saved_adventures FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. Adventure community photos
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
CREATE POLICY IF NOT EXISTS "Public read adventure_photos" ON public.adventure_photos FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Auth insert adventure_photos" ON public.adventure_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Own delete adventure_photos" ON public.adventure_photos FOR DELETE USING (auth.uid() = user_id);

-- 9. Operator ratings
CREATE TABLE IF NOT EXISTS public.operator_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  adventure_slug text NOT NULL,
  operator_name text NOT NULL,
  operator_name_display text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE (adventure_slug, operator_name, user_id)
);

ALTER TABLE public.operator_ratings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users insert own rating" ON public.operator_ratings FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users view own rating" ON public.operator_ratings FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Service role full access" ON public.operator_ratings FOR ALL TO service_role USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;