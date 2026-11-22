-- Audit 2026-11-22, PRIV-01 and OPS-02.
--
-- 1. Health answers (ACE™ medical flags) move out of user_metadata, which Supabase copies into
--    the login token, so they travelled in a cookie with every request and could be read by any
--    script on the page. They now live in ace_medical: row security on and no policies, so only
--    the server (service role) can read or write it. src/lib/aceMedicalStore.ts reads the table
--    and falls back to the old metadata until step 3 below has run.
--
-- 2. profiles.role allowed only 'user' and 'admin', so every write of 'operator' (operator
--    sign-up, approving a listing) failed silently. Operators are now a valid role. Only the
--    service role can change role (see the guard trigger in 20261122000000).
--
-- 3. After the code that reads the table is live: remove the old copies from user_metadata.
--
-- Safe to run more than once.

-- ── 1. private health answers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ace_medical (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  flags jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ace_medical ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ace_medical FROM anon, authenticated;

INSERT INTO public.ace_medical (user_id, flags, updated_at)
SELECT id, raw_user_meta_data -> 'ace_medical', now()
FROM auth.users
WHERE jsonb_typeof(raw_user_meta_data -> 'ace_medical') = 'object'
ON CONFLICT (user_id) DO NOTHING;

-- ── 2. operator role ────────────────────────────────────────────────────────
DO $$
DECLARE c text;
BEGIN
  FOR c IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'public.profiles'::regclass AND contype = 'c'
             AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', c);
  END LOOP;
END $$;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'operator'));

-- ── 3. remove the old copies (run once the new code is deployed) ────────────
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'ace_medical'
WHERE raw_user_meta_data ? 'ace_medical';
