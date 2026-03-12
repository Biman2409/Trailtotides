import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { username } = await request.json();

  const adminClient = await createAdminClient();
  const { data: allUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const match = allUsers?.users.find(
    (u: { user_metadata?: { username?: string }; email?: string }) =>
      (u.user_metadata?.username ?? "").toLowerCase() === (username ?? "").toLowerCase()
  );

  if (!match?.email) {
    return NextResponse.json({ error: "No account found with that username." }, { status: 400 });
  }

  return NextResponse.json({ email: match.email });
}
