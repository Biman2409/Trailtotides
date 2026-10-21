import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { aceSchema, badCode, displayNameSchema, groupIdFor, readJson, requireUser } from "../../shared";

type Ctx = { params: Promise<{ code: string }> };

const updateSchema = z.object({
  displayName: displayNameSchema.optional(),
  ace: aceSchema.optional(),
}).refine((u) => u.displayName !== undefined || u.ace !== undefined);

// PATCH — update your own name and/or levels in this group
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { code } = await params;
  const invalid = badCode(code);
  if (invalid) return invalid;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const parsed = updateSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });

  const group = await groupIdFor(auth.supabase, code);
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const { data, error } = await auth.supabase
    .from("match_group_members")
    .update({
      ...(parsed.data.displayName !== undefined ? { display_name: parsed.data.displayName } : {}),
      ...(parsed.data.ace !== undefined ? { ace: parsed.data.ace } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("group_id", group.id)
    .eq("user_id", auth.user.id)
    .select("user_id");
  if (error) return NextResponse.json({ error: "Couldn't update your levels" }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "You're not in this group" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// DELETE — leave the group (if you owned it, the longest-standing member takes over)
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { code } = await params;
  const invalid = badCode(code);
  if (invalid) return invalid;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const group = await groupIdFor(auth.supabase, code);
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const { error } = await auth.supabase.from("match_group_members").delete().eq("group_id", group.id).eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: "Couldn't leave the group" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
