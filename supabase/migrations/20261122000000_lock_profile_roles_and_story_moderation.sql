-- Security fix (audit 2026-11-22, SEC-01 and SEC-02).
--
-- 1. profiles: "Users update own profile" had no column limit, so any signed-in user could send
--    PATCH /rest/v1/profiles {"role":"admin"} with their own session and pass requireAdmin().
--    Users may now update only their display fields. Rows are created by handle_new_user()
--    (SECURITY DEFINER) or the server's service role, so users need no INSERT at all.
--    A trigger also refuses role / public_id changes from anyone but the service role or the
--    database owner, in case a broad grant is ever added back.
--
-- 2. stories: signed-in users could INSERT a story (status defaults to 'published', so it went
--    live at once) and UPDATE their own story, including its status. Submissions go through
--    /api/stories/submit with the service role and land as 'pending'; moderation is admin-only.
--
-- Safe to run more than once.

-- ── profiles ────────────────────────────────────────────────────────────────
REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (full_name, phone, username, email, avatar_url, updated_at) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.guard_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF (NEW.role IS DISTINCT FROM OLD.role
      OR NEW.public_id IS DISTINCT FROM OLD.public_id
      OR NEW.id IS DISTINCT FROM OLD.id)
     AND coalesce(auth.role(), '') <> 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin', 'service_role')
  THEN
    RAISE EXCEPTION 'Only an admin can change role or public_id' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_privileged_columns ON public.profiles;
CREATE TRIGGER guard_profile_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileged_columns();

-- ── stories ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Auth users can insert stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can update own stories" ON public.stories;
REVOKE INSERT, UPDATE, DELETE ON public.stories FROM anon, authenticated;
ALTER TABLE public.stories ALTER COLUMN status SET DEFAULT 'pending';
