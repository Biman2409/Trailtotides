import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { badCode, groupIdFor, requireUser } from "../../../shared";

type Ctx = { params: Promise<{ code: string; userId: string }> };

// DELETE — the owner removes a member (RLS refuses anyone else too)
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { code, userId } = await params;
  const invalid = badCode(code);
  if (invalid) return invalid;
  if (!z.uuid().safeParse(userId).success) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const group = await groupIdFor(auth.supabase, code);
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (group.owner_id !== auth.user.id) return NextResponse.json({ error: "Only the group's owner can remove people" }, { status: 403 });

  const { data, error } = await auth.supabase
    .from("match_group_members").delete().eq("group_id", group.id).eq("user_id", userId).select("user_id");
  if (error) return NextResponse.json({ error: "Couldn't remove them" }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
