-- Gives every user a permanent, human-readable ID shown on their profile
-- and Adventure Passport — separate from the internal uuid.
--
-- Two independent sequences, since admins and regular users get different
-- formats:
--   admin:  'TTT' + sequence number   (TTT1, TTT2, TTT3, ...)
--   user:   sequence number, zero-padded to 4 digits (0001, 0002, ...)
--
-- A person's public_id is assigned once and never changes afterwards (like
-- a real passport number) — promoting an existing user to admin later does
-- NOT retroactively switch their id to the TTT scheme; that's a separate,
-- manual decision left to whoever performs the promotion.

CREATE SEQUENCE IF NOT EXISTS public.admin_public_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.user_public_id_seq START 1;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_id text UNIQUE;

-- Backfill anyone who doesn't have one yet, oldest account first — today
-- that's just the original admin account, which becomes TTT1.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE role = 'admin' AND public_id IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.profiles SET public_id = 'TTT' || nextval('public.admin_public_id_seq') WHERE id = r.id;
  END LOOP;

  FOR r IN SELECT id FROM public.profiles WHERE role = 'user' AND public_id IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.profiles SET public_id = lpad(nextval('public.user_public_id_seq')::text, 4, '0') WHERE id = r.id;
  END LOOP;
END $$;

-- Every future signup starts as role='user' (see handle_new_user below), so
-- new accounts always draw from the numeric sequence — the very next
-- person to sign up gets 0001 if no one has yet.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, username, public_id)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'username',
    lpad(nextval('public.user_public_id_seq')::text, 4, '0')
  );
  RETURN new;
END;
$$;
