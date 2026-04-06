import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";

// GET — load ACE profile for the logged-in user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ profile: null });

  // Read from user_metadata (always available, no schema change needed)
  const aceProfile = user.user_metadata?.ace_profile ?? null;
  return NextResponse.json({ profile: aceProfile });
}

// POST — save ACE profile for the logged-in user
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();

  // Store in user_metadata via admin client — persists across devices/sessions
  const admin = createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      ace_profile: body,
    },
  });

  return NextResponse.json({ ok: true });
}
