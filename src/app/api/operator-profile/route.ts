import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const { data } = await adminClient.storage.from("operator-profiles").download(`${user.id}.json`);
  if (!data) return NextResponse.json({ logo_url: null });

  try {
    const profile = JSON.parse(await data.text());
    return NextResponse.json({ logo_url: profile.logo_url ?? null });
  } catch {
    return NextResponse.json({ logo_url: null });
  }
}
