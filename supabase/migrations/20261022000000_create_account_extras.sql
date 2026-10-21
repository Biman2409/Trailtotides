-- What a free account unlocks beyond the wishlist.
--
--   saved_comparisons      a named compare of 2–3 adventures; share_code is the secret in /compare/<code>
--   saved_searches         a map search (its link params) that can email when new adventures match it
--   quote_requests         a traveller's request for prices, sent to the adventure's verified operators
--   wishlist_alert_state   what the daily alerts job last told each user about each saved adventure
--
-- Access rules (RLS):
--   * users read, add and delete only their own comparisons, searches and quote requests
--   * a shared comparison is read by its code on the server (service role), never through RLS
--   * wishlist_alert_state has no policies: only the alerts job (service role) touches it

CREATE TABLE IF NOT EXISTS public.saved_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  slugs text[] NOT NULL CHECK (array_length(slugs, 1) BETWEEN 2 AND 3),
  share_code text NOT NULL UNIQUE CHECK (share_code ~ '^[0-9a-f]{12}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS saved_comparisons_user_idx ON public.saved_comparisons (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  -- The map's link params, e.g. type=Trekking&state=Uttarakhand&near=30.32,78.03&r=250
  query text NOT NULL CHECK (char_length(query) <= 500),
  alerts boolean NOT NULL DEFAULT true,
  -- Matches already known, so an alert only ever lists new ones
  seen_slugs text[] NOT NULL DEFAULT '{}',
  last_alerted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS saved_searches_user_idx ON public.saved_searches (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL,
  operators text[] NOT NULL CHECK (array_length(operators, 1) BETWEEN 1 AND 5),
  start_date date NOT NULL,
  flexible boolean NOT NULL DEFAULT false,
  group_size smallint NOT NULL CHECK (group_size BETWEEN 1 AND 50),
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quote_requests_user_idx ON public.quote_requests (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.wishlist_alert_state (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL,
  -- Lowest price last seen, in rupees; a drop below it is worth an email
  last_price integer,
  -- The season (e.g. '2026-11') already announced, so each opening is told once
  season_alerted text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, slug)
);

ALTER TABLE public.saved_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_alert_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users read own comparisons" ON public.saved_comparisons FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users add own comparisons" ON public.saved_comparisons FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users delete own comparisons" ON public.saved_comparisons FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users read own searches" ON public.saved_searches FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users add own searches" ON public.saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users update own searches" ON public.saved_searches FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users delete own searches" ON public.saved_searches FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users read own quote requests" ON public.quote_requests FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users add own quote requests" ON public.quote_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
