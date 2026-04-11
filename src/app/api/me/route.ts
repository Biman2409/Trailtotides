import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    avatar_id: user.user_metadata?.avatar_id ?? null,
  });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const avatar_id = body.avatar_id !== undefined ? body.avatar_id : user.user_metadata?.avatar_id;

  await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, avatar_id },
  });

  return NextResponse.json({ success: true });
}
