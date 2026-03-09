import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") ?? "";

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ available: false });
  }

  const supabase = await createAdminClient();

  // Search through auth users' metadata for matching username
  // listUsers returns pages of users; for small apps this is fine
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) return NextResponse.json({ available: true }); // fail open

  const taken = data.users.some(
    (u) => (u.user_metadata?.username ?? "").toLowerCase() === username.toLowerCase()
  );

  return NextResponse.json({ available: !taken });
}
