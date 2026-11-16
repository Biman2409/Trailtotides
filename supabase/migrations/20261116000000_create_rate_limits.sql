-- Shared rate limits: one counter per key (e.g. "chat:<ip>") across every server instance.
--
--   src/lib/rateLimit.ts  rateLimitShared() calls rate_limit_hit() for the routes that cost money
--                         or storage (Compass.AI, uploads, comments); until this runs it falls
--                         back to the per-instance counter, so applying it is safe at any time
--
-- Access rules (RLS): on, with no policies; only the service role can call the function.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text PRIMARY KEY CHECK (char_length(key) <= 200),
  count integer NOT NULL,
  reset_at timestamptz NOT NULL
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Counts one hit and says whether it's within the limit, in one atomic statement
CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
RETURNS TABLE (allowed boolean, retry_after_ms bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c integer;
  r timestamptz;
BEGIN
  INSERT INTO public.rate_limits AS rl (key, count, reset_at)
  VALUES (p_key, 1, now() + make_interval(secs => p_window_seconds))
  ON CONFLICT (key) DO UPDATE SET
    count = CASE WHEN rl.reset_at <= now() THEN 1 ELSE rl.count + 1 END,
    reset_at = CASE WHEN rl.reset_at <= now() THEN now() + make_interval(secs => p_window_seconds) ELSE rl.reset_at END
  RETURNING rl.count, rl.reset_at INTO c, r;

  -- Now and then, clear out windows that ended over an hour ago
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits WHERE reset_at < now() - interval '1 hour';
  END IF;

  RETURN QUERY SELECT c <= p_limit, CASE WHEN c <= p_limit THEN 0::bigint ELSE greatest(0, (extract(epoch FROM (r - now())) * 1000))::bigint END;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_hit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(text, integer, integer) TO service_role;
