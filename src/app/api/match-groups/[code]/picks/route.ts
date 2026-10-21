import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adventures } from "@/lib/data";
import type { GroupPick } from "@/lib/matchGroups";
import { badCode, groupIdFor, readJson, requireUser } from "../../shared";

// The group wishlist: adventures the group is considering, and each member's vote.
// Members only (RLS); votes from people who have since left aren't counted.

type Ctx = { params: Promise<{ code: string }> };
const MAX_PICKS = 30;
const known = new Set(adventures.map((a) => a.slug));
const slugSchema = z.string().refine((s) => known.has(s), "Unknown adventure");
const addSchema = z.object({ slug: slugSchema });
const voteSchema = z.object({ slug: slugSchema, vote: z.union([z.literal(1), z.literal(-1), z.literal(0)]) });

async function setup(code: string) {
  const invalid = badCode(code);
  if (invalid) return { error: invalid } as const;
  const auth = await requireUser();
  if ("error" in auth) return { error: auth.error } as const;
  const group = await groupIdFor(auth.supabase, code);
  if (!group) return { error: NextResponse.json({ error: "Group not found" }, { status: 404 }) } as const;
  return { ...auth, group } as const;
}

async function listPicks(s: Exclude<Awaited<ReturnType<typeof setup>>, { error: unknown }>): Promise<GroupPick[]> {
  const [{ data: picks }, { data: votes }, { data: members }] = await Promise.all([
    s.supabase.from("match_group_picks").select("slug, added_by, created_at").eq("group_id", s.group.id).order("created_at"),
    s.supabase.from("match_group_votes").select("slug, user_id, vote").eq("group_id", s.group.id),
    s.supabase.from("match_group_members").select("user_id").eq("group_id", s.group.id),
  ]);
  const current = new Set((members ?? []).map((m) => m.user_id as string));
  return (picks ?? []).map((p) => ({
    slug: p.slug as string,
    addedBy: p.added_by as string,
    createdAt: p.created_at as string,
    votes: Object.fromEntries((votes ?? [])
      .filter((v) => v.slug === p.slug && current.has(v.user_id as string))
      .map((v) => [v.user_id as string, v.vote as 1 | -1])),
  }));
}

// GET — the group's picks with everyone's votes
export async function GET(_req: NextRequest, { params }: Ctx) {
  const s = await setup((await params).code);
  if ("error" in s) return s.error;
  return NextResponse.json({ picks: await listPicks(s) });
}

// POST — suggest an adventure (counts as your "I'm in")
export async function POST(req: NextRequest, { params }: Ctx) {
  const s = await setup((await params).code);
  if ("error" in s) return s.error;
  const parsed = addSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "Pick an adventure" }, { status: 400 });

  const { count } = await s.supabase.from("match_group_picks").select("slug", { count: "exact", head: true }).eq("group_id", s.group.id);
  if ((count ?? 0) >= MAX_PICKS) return NextResponse.json({ error: `The group wishlist holds up to ${MAX_PICKS} adventures` }, { status: 400 });

  const { error } = await s.supabase.from("match_group_picks")
    .upsert({ group_id: s.group.id, slug: parsed.data.slug, added_by: s.user.id }, { onConflict: "group_id,slug", ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: "Couldn't add it" }, { status: 500 });
  await s.supabase.from("match_group_votes")
    .upsert({ group_id: s.group.id, slug: parsed.data.slug, user_id: s.user.id, vote: 1, updated_at: new Date().toISOString() });
  return NextResponse.json({ picks: await listPicks(s) });
}

// PATCH — your vote on a pick: 1 = I'm in, -1 = not for me, 0 = clear it
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const s = await setup((await params).code);
  if ("error" in s) return s.error;
  const parsed = voteSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid vote" }, { status: 400 });

  const { slug, vote } = parsed.data;
  const { error } = vote === 0
    ? await s.supabase.from("match_group_votes").delete().eq("group_id", s.group.id).eq("slug", slug).eq("user_id", s.user.id)
    : await s.supabase.from("match_group_votes").upsert({ group_id: s.group.id, slug, user_id: s.user.id, vote, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "Couldn't save your vote" }, { status: 500 });
  return NextResponse.json({ picks: await listPicks(s) });
}

// DELETE ?slug= — remove a pick (whoever added it, or the owner; RLS enforces it)
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const s = await setup((await params).code);
  if ("error" in s) return s.error;
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing adventure" }, { status: 400 });
  const { error } = await s.supabase.from("match_group_picks").delete().eq("group_id", s.group.id).eq("slug", slug);
  if (error) return NextResponse.json({ error: "Couldn't remove it" }, { status: 500 });
  return NextResponse.json({ picks: await listPicks(s) });
}
