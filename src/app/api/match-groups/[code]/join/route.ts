import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { aceSchema, badCode, displayNameSchema, readJson, requireUser } from "../../shared";

type Ctx = { params: Promise<{ code: string }> };

const joinSchema = z.object({ displayName: displayNameSchema, ace: aceSchema });

// POST — join with an invite code (joining again just refreshes your seat)
export async function POST(req: NextRequest, { params }: Ctx) {
  const { code } = await params;
  const invalid = badCode(code);
  if (invalid) return invalid;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const parsed = joinSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile" }, { status: 400 });

  const { error } = await auth.supabase.rpc("join_match_group", {
    p_code: code, p_display_name: parsed.data.displayName, p_ace: parsed.data.ace,
  });
  if (error) {
    if (error.message.includes("group full")) return NextResponse.json({ error: "This group is full" }, { status: 409 });
    if (error.message.includes("group not found")) return NextResponse.json({ error: "Group not found" }, { status: 404 });
    return NextResponse.json({ error: "Couldn't join the group" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
