import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { INVITE_CODE_RE, levelsToAce, type GroupPreview, type GroupSummary, type StoredGroup } from "@/lib/matchGroups";

type Supabase = Awaited<ReturnType<typeof createClient>>;

interface MemberRow { user_id: string; display_name: string; ace: number[]; joined_at: string; updated_at: string }

/** The group behind an invite code — null unless the signed-in user is a member (RLS). */
export async function loadGroup(supabase: Supabase, code: string): Promise<StoredGroup | null> {
  if (!INVITE_CODE_RE.test(code)) return null;
  const { data } = await supabase
    .from("match_groups")
    .select("id, name, invite_code, owner_id, created_at, match_group_members(user_id, display_name, ace, joined_at, updated_at)")
    .eq("invite_code", code)
    .maybeSingle();
  if (!data) return null;
  const rows = ((data.match_group_members ?? []) as MemberRow[]).sort((a, b) => a.joined_at.localeCompare(b.joined_at));
  return {
    id: data.id,
    name: data.name,
    code: data.invite_code,
    ownerId: data.owner_id,
    createdAt: data.created_at,
    members: rows.map((r) => ({ userId: r.user_id, name: r.display_name, ace: levelsToAce(r.ace), joinedAt: r.joined_at, updatedAt: r.updated_at })),
  };
}

/** Name and head count for someone holding the invite who hasn't joined yet. */
export async function previewGroup(supabase: Supabase, code: string): Promise<GroupPreview | null> {
  if (!INVITE_CODE_RE.test(code)) return null;
  const { data } = await supabase.rpc("match_group_preview", { p_code: code });
  const row = Array.isArray(data) ? data[0] : null;
  return row ? { name: row.name, ownerName: row.owner_name ?? null, memberCount: row.member_count ?? 0 } : null;
}

/** Every group the signed-in user belongs to, newest first. */
export async function listMyGroups(supabase: Supabase, userId: string): Promise<GroupSummary[]> {
  const { data } = await supabase
    .from("match_groups")
    .select("name, invite_code, owner_id, created_at, match_group_members(count)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((g) => ({
    name: g.name,
    code: g.invite_code,
    isOwner: g.owner_id === userId,
    memberCount: (g.match_group_members as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));
}

/** The signed-in user as GroupClient needs them: id plus a first name to prefill joins with. */
export function viewerFrom(user: { id: string; user_metadata?: Record<string, unknown> }) {
  const meta = user.user_metadata ?? {};
  const firstName = String(meta.full_name ?? "").trim().split(/\s+/)[0] || String(meta.username ?? "").trim();
  return { id: user.id, name: firstName.slice(0, 24) };
}
