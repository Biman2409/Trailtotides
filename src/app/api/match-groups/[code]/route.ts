import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loadGroup } from "@/lib/matchGroupsServer";
import { badCode, groupIdFor, groupNameSchema, readJson, requireUser } from "../shared";

type Ctx = { params: Promise<{ code: string }> };

const patchSchema = z.union([
  z.object({ name: groupNameSchema }),
  z.object({ resetInvite: z.literal(true) }),
]);

// GET — the whole group, members only
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { code } = await params;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const group = await loadGroup(auth.supabase, code);
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  return NextResponse.json({ group });
}

// PATCH — the owner renames the group or resets the invite link (the old link stops working)
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { code } = await params;
  const invalid = badCode(code);
  if (invalid) return invalid;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const parsed = patchSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid change" }, { status: 400 });

  const group = await groupIdFor(auth.supabase, code);
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (group.owner_id !== auth.user.id) return NextResponse.json({ error: "Only the group's owner can do that" }, { status: 403 });

  if ("name" in parsed.data) {
    const { error } = await auth.supabase.from("match_groups").update({ name: parsed.data.name }).eq("id", group.id);
    if (error) return NextResponse.json({ error: "Couldn't rename the group" }, { status: 500 });
    return NextResponse.json({ ok: true, code });
  }

  const { data: next } = await auth.supabase.rpc("new_match_group_code");
  if (typeof next !== "string") return NextResponse.json({ error: "Couldn't reset the link" }, { status: 500 });
  const { error } = await auth.supabase.from("match_groups").update({ invite_code: next }).eq("id", group.id);
  if (error) return NextResponse.json({ error: "Couldn't reset the link" }, { status: 500 });
  return NextResponse.json({ ok: true, code: next });
}
