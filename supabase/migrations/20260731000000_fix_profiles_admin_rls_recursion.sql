-- Fixes "infinite recursion detected in policy for relation profiles".
--
-- The original "Admin read all" policy queried public.profiles from within
-- a policy defined on public.profiles, so Postgres re-evaluated the same
-- policy for the subquery, recursing forever. This broke every query
-- against profiles made through the request-scoped (RLS-subject) client,
-- including the admin role check in requireAdmin() that gates every admin
-- server action, and the /admin page's own access check.
--
-- Fix: move the admin check into a SECURITY DEFINER function, which runs
-- as the function owner and so its internal query bypasses RLS instead of
-- re-triggering the policy.

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = uid AND role = 'admin');
$$;

DROP POLICY IF EXISTS "Admin read all" ON public.profiles;
CREATE POLICY "Admin read all" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));

-- Separately: handle_new_user() read the metadata key "user_name", but
-- signup (src/app/auth/actions.ts) writes it as "username" — so
-- profiles.username has been silently NULL for every signup, defeating its
-- UNIQUE constraint as a real uniqueness guarantee. Fix the trigger and
-- backfill existing rows from auth metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, username)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'username'
  );
  RETURN new;
END;
$$;

UPDATE public.profiles p
SET username = u.raw_user_meta_data ->> 'username'
FROM auth.users u
WHERE p.id = u.id
  AND p.username IS NULL
  AND u.raw_user_meta_data ->> 'username' IS NOT NULL;
