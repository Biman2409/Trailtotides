import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listMyGroups } from "@/lib/matchGroupsServer";
import { aceSchema, displayNameSchema, groupNameSchema, readJson, requireUser } from "./shared";

const createSchema = z.object({
  name: groupNameSchema.optional().catch(undefined),
  displayName: displayNameSchema,
  ace: aceSchema,
});

// GET — the groups the caller belongs to
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ groups: await listMyGroups(auth.supabase, auth.user.id) });
}

// POST — start a group with the caller as owner and first member
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const parsed = createSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid group" }, { status: 400 });

  const { data: code, error } = await auth.supabase.rpc("create_match_group", {
    p_name: parsed.data.name ?? "Our group",
    p_display_name: parsed.data.displayName,
    p_ace: parsed.data.ace,
  });
  if (error || typeof code !== "string") return NextResponse.json({ error: "Couldn't create the group" }, { status: 500 });
  return NextResponse.json({ code });
}
