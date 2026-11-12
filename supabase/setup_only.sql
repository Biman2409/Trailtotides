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
  public_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS public.admin_public_id_seq START 0;
CREATE SEQUENCE IF NOT EXISTS public.user_public_id_seq START 1;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- SECURITY DEFINER avoids the infinite-recursion error you get from querying
-- public.profiles directly inside a policy defined on public.profiles.
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE
AS $$ SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = uid AND role = 'admin'); $$;
DROP POLICY IF EXISTS "Admin read all" ON public.profiles;
CREATE POLICY "Admin read all" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, username, public_id)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email, new.raw_user_meta_data ->> 'username', lpad(nextval('public.user_public_id_seq')::text, 4, '0'));
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill anyone who doesn't have a public_id yet, oldest account first.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE role = 'admin' AND public_id IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.profiles SET public_id = 'TTT' || nextval('public.admin_public_id_seq') WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id FROM public.profiles WHERE role = 'user' AND public_id IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.profiles SET public_id = lpad(nextval('public.user_public_id_seq')::text, 4, '0') WHERE id = r.id;
  END LOOP;
END $$;

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

-- 3. Contact messages
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

-- 4. Operator ratings
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