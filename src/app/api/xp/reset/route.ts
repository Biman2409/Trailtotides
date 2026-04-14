import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "user-data";
const xpPath = (userId: string) => `xp/${userId}.json`;

export async function DELETE() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blob = new Blob(["[]"], { type: "application/json" });
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(xpPath(user.id), blob, { upsert: true });

  if (error) return NextResponse.json({ error: "Failed to reset XP" }, { status: 500 });

  return NextResponse.json({ reset: true });
}
