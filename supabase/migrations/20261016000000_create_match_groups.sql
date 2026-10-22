-- Stored Group Match groups.
--
-- Before this, a group lived only in its share link (?m=Name~levels~tag,...): anyone holding
-- the link saw every member's eight capability levels and could remove anyone. Now a group is
-- a row with an owner, every seat is a real account, and only members can read it.
--
--   match_groups         one row per group; invite_code is the secret in /matchmaker/group/<code>
--   match_group_members  one row per (group, account) with a snapshot of the eight levels (1–5)
--
-- Access rules (RLS):
--   * members read their group and its members; nobody else reads anything
--   * joining goes through join_match_group(), which checks the invite code and the 8-person cap
--   * a member updates only their own name/levels and can leave; the owner can remove anyone
--   * when the owner leaves, the longest-standing member becomes owner; an empty group is deleted
-- Only the eight capability levels are stored — never health answers.

CREATE TABLE IF NOT EXISTS public.match_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Our group' CHECK (char_length(name) BETWEEN 1 AND 40),
  invite_code text NOT NULL UNIQUE CHECK (invite_code ~ '^[0-9a-f]{12}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.match_group_members (
  group_id uuid NOT NULL REFERENCES public.match_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 24),
  -- stamina, power, strength, agility, water, altitude, focus, nerve (AXES order in lib/fitness)
  ace smallint[] NOT NULL CHECK (array_length(ace, 1) = 8 AND 1 <= ALL(ace) AND 5 >= ALL(ace)),
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS match_group_members_user_idx ON public.match_group_members (user_id);

ALTER TABLE public.match_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_group_members ENABLE ROW LEVEL SECURITY;

-- Membership test that doesn't go through RLS (a policy on match_group_members that queried
-- match_group_members directly would recurse).
CREATE OR REPLACE FUNCTION public.is_match_group_member(gid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.match_group_members WHERE group_id = gid AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_match_group_owner(gid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.match_groups WHERE id = gid AND owner_id = auth.uid());
$$;

-- match_groups: members read; the owner renames, resets the invite code or deletes.
-- Rows are created only by create_match_group() so a group never exists without its owner seat.
DO $$ BEGIN
  CREATE POLICY "Members read their groups" ON public.match_groups
    FOR SELECT TO authenticated USING (public.is_match_group_member(id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owner updates group" ON public.match_groups
    FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owner deletes group" ON public.match_groups
    FOR DELETE TO authenticated USING (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ownership moves only through the leave trigger below, never by a direct update
REVOKE UPDATE ON public.match_groups FROM authenticated, anon;
GRANT UPDATE (name, invite_code) ON public.match_groups TO authenticated;

-- match_group_members: members read each other; you edit only your own seat; you can leave,
-- and the owner can remove anyone. Seats are added only by create/join functions.
DO $$ BEGIN
  CREATE POLICY "Members read fellow members" ON public.match_group_members
    FOR SELECT TO authenticated USING (public.is_match_group_member(group_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Members update own seat" ON public.match_group_members
    FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Leave or owner removes" ON public.match_group_members
    FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_match_group_owner(group_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- A seat can't be moved to another group or account
REVOKE UPDATE ON public.match_group_members FROM authenticated, anon;
GRANT UPDATE (display_name, ace, updated_at) ON public.match_group_members TO authenticated;
REVOKE INSERT ON public.match_groups, public.match_group_members FROM authenticated, anon;

-- ─── Functions ────────────────────────────────────────────────────────────────

-- 48 random bits from a v4 uuid (its first 12 hex digits carry no version bits)
CREATE OR REPLACE FUNCTION public.new_match_group_code()
RETURNS text
LANGUAGE sql VOLATILE SET search_path = ''
AS $$ SELECT left(replace(gen_random_uuid()::text, '-', ''), 12); $$;

CREATE OR REPLACE FUNCTION public.create_match_group(p_name text, p_display_name text, p_ace smallint[])
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  uid uuid := auth.uid();
  gid uuid;
  code text := public.new_match_group_code();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated' USING ERRCODE = '28000'; END IF;
  INSERT INTO public.match_groups (owner_id, name, invite_code) VALUES (uid, p_name, code) RETURNING id INTO gid;
  INSERT INTO public.match_group_members (group_id, user_id, display_name, ace) VALUES (gid, uid, p_display_name, p_ace);
  RETURN code;
END $$;

-- Joining again just refreshes your seat. Locks the group row so two joins can't both take
-- the eighth seat.
CREATE OR REPLACE FUNCTION public.join_match_group(p_code text, p_display_name text, p_ace smallint[])
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  uid uuid := auth.uid();
  gid uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated' USING ERRCODE = '28000'; END IF;
  SELECT id INTO gid FROM public.match_groups WHERE invite_code = p_code FOR UPDATE;
  IF gid IS NULL THEN RAISE EXCEPTION 'group not found' USING ERRCODE = 'P0002'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.match_group_members WHERE group_id = gid AND user_id = uid)
     AND (SELECT count(*) FROM public.match_group_members WHERE group_id = gid) >= 8 THEN
    RAISE EXCEPTION 'group full' USING ERRCODE = 'P0001', HINT = 'group_full';
  END IF;

  INSERT INTO public.match_group_members (group_id, user_id, display_name, ace)
  VALUES (gid, uid, p_display_name, p_ace)
  ON CONFLICT (group_id, user_id) DO UPDATE SET display_name = EXCLUDED.display_name, ace = EXCLUDED.ace, updated_at = now();
  RETURN gid;
END $$;

-- What someone holding an invite (but not yet a member) may see: the group's name, who started
-- it and how many have joined — no levels, no other names.
CREATE OR REPLACE FUNCTION public.match_group_preview(p_code text)
RETURNS TABLE (name text, owner_name text, member_count int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT g.name,
         (SELECT m.display_name FROM public.match_group_members m WHERE m.group_id = g.id AND m.user_id = g.owner_id),
         (SELECT count(*)::int FROM public.match_group_members m WHERE m.group_id = g.id)
  FROM public.match_groups g
  WHERE g.invite_code = p_code AND auth.uid() IS NOT NULL;
$$;

-- When the owner's seat goes, hand the group to whoever joined earliest; delete it when empty.
CREATE OR REPLACE FUNCTION public.match_group_after_leave()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  heir uuid;
BEGIN
  SELECT user_id INTO heir FROM public.match_group_members WHERE group_id = OLD.group_id ORDER BY joined_at, user_id LIMIT 1;
  IF heir IS NULL THEN
    DELETE FROM public.match_groups WHERE id = OLD.group_id;
  ELSE
    UPDATE public.match_groups SET owner_id = heir WHERE id = OLD.group_id AND owner_id = OLD.user_id;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS match_group_after_leave ON public.match_group_members;
CREATE TRIGGER match_group_after_leave AFTER DELETE ON public.match_group_members
  FOR EACH ROW EXECUTE FUNCTION public.match_group_after_leave();

REVOKE ALL ON FUNCTION public.create_match_group(text, text, smallint[]) FROM public, anon;
REVOKE ALL ON FUNCTION public.join_match_group(text, text, smallint[]) FROM public, anon;
REVOKE ALL ON FUNCTION public.match_group_preview(text) FROM public, anon;
REVOKE ALL ON FUNCTION public.match_group_after_leave() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_match_group(text, text, smallint[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_match_group(text, text, smallint[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_group_preview(text) TO authenticated;
