-- Book clicks: every time a visitor leaves for an operator's website from a Book button.
--
--   /api/outbound      adds a row (server, service role); no personal data is stored
--   admin dashboard    counts them on the overview
--
-- Access rules (RLS): on, with no policies, so only the service role can read or write.

CREATE TABLE IF NOT EXISTS public.outbound_clicks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Which adventure the visitor was looking at (null from the operators directory)
  adventure_slug text CHECK (adventure_slug IS NULL OR char_length(adventure_slug) <= 120),
  operator text NOT NULL CHECK (char_length(operator) BETWEEN 1 AND 200),
  -- Host only, e.g. indiahikes.com
  destination_host text CHECK (destination_host IS NULL OR char_length(destination_host) <= 200),
  -- Which button: compare, sidebar, mobile_bar, map, operators_page, operators_list
  source text NOT NULL CHECK (char_length(source) BETWEEN 1 AND 40),
  -- Set when the visitor was signed in, so repeat clicks can be told apart
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS outbound_clicks_created_idx ON public.outbound_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS outbound_clicks_operator_idx ON public.outbound_clicks (operator, created_at DESC);

ALTER TABLE public.outbound_clicks ENABLE ROW LEVEL SECURITY;
