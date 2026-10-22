-- Group wishlist: adventures a Group Match group is considering, and each member's vote.
--
--   match_group_picks  one row per (group, adventure); added_by is who suggested it
--   match_group_votes  one row per (group, adventure, member): 1 = I'm in, -1 = not for me
--
-- Access rules (RLS), using the membership helpers from 20261016000000_create_match_groups.sql:
--   * members read their group's picks and votes; nobody else reads anything
--   * members add picks as themselves; whoever added a pick, or the owner, can remove it
--   * each member sets, changes or clears only their own vote
-- Votes of someone who has left are ignored by the app (only current members are counted).

CREATE TABLE IF NOT EXISTS public.match_group_picks (
  group_id uuid NOT NULL REFERENCES public.match_groups(id) ON DELETE CASCADE,
  slug text NOT NULL CHECK (char_length(slug) BETWEEN 1 AND 120),
  added_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, slug)
);

CREATE TABLE IF NOT EXISTS public.match_group_votes (
  group_id uuid NOT NULL,
  slug text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote smallint NOT NULL CHECK (vote IN (-1, 1)),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, slug, user_id),
  FOREIGN KEY (group_id, slug) REFERENCES public.match_group_picks (group_id, slug) ON DELETE CASCADE
);

ALTER TABLE public.match_group_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_group_votes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Members read picks" ON public.match_group_picks
    FOR SELECT TO authenticated USING (public.is_match_group_member(group_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Members add picks" ON public.match_group_picks
    FOR INSERT TO authenticated WITH CHECK (added_by = auth.uid() AND public.is_match_group_member(group_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Adder or owner removes picks" ON public.match_group_picks
    FOR DELETE TO authenticated USING (added_by = auth.uid() OR public.is_match_group_owner(group_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Members read votes" ON public.match_group_votes
    FOR SELECT TO authenticated USING (public.is_match_group_member(group_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Members cast own vote" ON public.match_group_votes
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_match_group_member(group_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Members change own vote" ON public.match_group_votes
    FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.is_match_group_member(group_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Members clear own vote" ON public.match_group_votes
    FOR DELETE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS match_group_votes_group_idx ON public.match_group_votes (group_id);
