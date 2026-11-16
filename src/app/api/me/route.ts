import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    avatar_id: user.user_metadata?.avatar_id ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  // A preset avatar is a small whole number (or null for the default badge); nothing else is stored
  if (body.avatar_id !== undefined && body.avatar_id !== null && !(Number.isInteger(body.avatar_id) && body.avatar_id >= 0 && body.avatar_id < 1000)) {
    return NextResponse.json({ error: "Invalid avatar" }, { status: 400 });
  }
  const avatar_id = body.avatar_id !== undefined ? body.avatar_id : user.user_metadata?.avatar_id;
  // Picking a preset character (or the default rank badge) supersedes any
  // uploaded photo — the two are mutually exclusive, whichever was set last.
  const avatar_url = body.avatar_id !== undefined ? null : (user.user_metadata?.avatar_url ?? null);

  await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, avatar_id, avatar_url },
  });

  return NextResponse.json({ success: true });
}
