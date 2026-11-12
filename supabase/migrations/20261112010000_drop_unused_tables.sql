-- Drop tables and a function the site no longer reads or writes (checked 2026-11-12).
--   adventure_photos, saved_adventures, messages,
--   operator_submissions, operator_profiles   → empty; photos, wishlists and operator data live in Storage buckets
--   story_views + increment_story_views()     → 2 old view counts the site no longer shows
-- No CASCADE: if anything still depends on one of these, the whole script stops and nothing is dropped.
BEGIN;

DROP FUNCTION IF EXISTS public.increment_story_views(text);

DROP TABLE IF EXISTS public.operator_submissions;  -- references operator_profiles, so it goes first
DROP TABLE IF EXISTS public.operator_profiles;
DROP TABLE IF EXISTS public.adventure_photos;
DROP TABLE IF EXISTS public.saved_adventures;
DROP TABLE IF EXISTS public.story_views;
DROP TABLE IF EXISTS public.messages;

COMMIT;
