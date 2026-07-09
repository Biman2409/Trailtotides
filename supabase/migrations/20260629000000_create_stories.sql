-- Stories table for Trail to Tides
-- Author and profile images linked via profiles table (user_id)

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

-- Story views table (already exists conceptually, formalize it)
CREATE TABLE IF NOT EXISTS public.story_views (
  slug text NOT NULL PRIMARY KEY,
  views integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Everyone can read published stories
DO $$ BEGIN
  CREATE POLICY "Anyone can read published stories" ON public.stories FOR SELECT USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Authenticated users can submit stories (draft/pending status)
DO $$ BEGIN
  CREATE POLICY "Auth users can insert stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Story authors can update their own stories
DO $$ BEGIN
  CREATE POLICY "Authors can update own stories" ON public.stories FOR UPDATE USING (auth.uid() = submitted_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Service role full access
DO $$ BEGIN
  CREATE POLICY "Service role full access" ON public.stories FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Story views: anyone can read
DO $$ BEGIN
  CREATE POLICY "Anyone can read story views" ON public.story_views FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Service role full access for views
DO $$ BEGIN
  CREATE POLICY "Service role full access views" ON public.story_views FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed the existing 2 stories
INSERT INTO public.stories (slug, title, excerpt, body, author_name, author_role, author_bio, author_avatar, hero_image, read_time, tags, region, date, status)
VALUES
  (
    'the-night-photi-la-tested-us',
    'The Night Photi La Tested Us',
    'A ride to Umling La, a detour to Demchok, and the mountain that watched over us. Some trips are planned. Some trips are reckless. And some trips stay with you forever.',
    '',
    'Nishant Ingle',
    'Rider',
    'Spends most of the year running a business. Once a year, the suit comes off, the saddle goes on, and he goes all in — no guided tours, no safety nets. Just one raw, unscripted adventure that most people only ever dream about.',
    '/avatars/avatar-5.png',
    'https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/story-submissions/photi-la.jpeg',
    '15 min read',
    ARRAY['Featured', 'TTT Original', 'Ladakh', 'Motorcycling', 'Motorcycle', 'Umling La', 'Himalayas', 'High Altitude', 'Road Trip', 'Demchok', 'Adventure Travel', 'India'],
    'Ladakh',
    'July 2022',
    'published'
  ),
  (
    'riding-through-a-revolution',
    'Riding through a revolution',
    'Riding to Nepal and landing in the middle of the Gen Z revolution. We made the best of it however we could.',
    '',
    'Aditya Yadav',
    'A jack of all trades',
    'I read relentlessly and write poetry to ground myself. A mountaineer and skier at heart, I find joy navigating riverbeds on my Himalayan. Anchored by amazing friends, I keep chasing new extremes. Ultimately, my chief occupation is living a life of love. Everything else is fluff.',
    '/avatars/avatar-10.png',
    'https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/story-submissions/riding-through-revolution-hero.jpeg',
    '8 min read',
    ARRAY['Featured', 'TTT Original', 'Nepal', 'Motorcycling', 'Motorcycle', 'Road Trip', 'Himalayas', 'Kathmandu', 'Adventure Travel', 'Overland', 'Solo Rider', 'Travel Story'],
    'Himalayas',
    'Sep 2024',
    'published'
  );

-- Seed views for existing stories
INSERT INTO public.story_views (slug, views) VALUES
  ('the-night-photi-la-tested-us', 342),
  ('riding-through-a-revolution', 156)
ON CONFLICT (slug) DO NOTHING;

-- Stored procedure for incrementing story views (used by API)
CREATE OR REPLACE FUNCTION public.increment_story_views(story_slug text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_views integer;
BEGIN
  INSERT INTO public.story_views (slug, views)
  VALUES (story_slug, 1)
  ON CONFLICT (slug)
  DO UPDATE SET views = story_views.views + 1, updated_at = now()
  RETURNING story_views.views INTO new_views;
  RETURN new_views;
END;
$$;