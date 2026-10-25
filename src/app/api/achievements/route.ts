import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { loadUserBadges, claimNewBadges } from "@/lib/userAchievements";
import { rateLimit } from "@/lib/rateLimit";

// GET — everything the Trophy Cabinet needs: earned badge ids plus the counts
// behind them, so locked badges can show progress.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ace, totalXP, engagement, earned } = await loadUserBadges(await createAdminClient(), user);
  return NextResponse.json({ ace, totalXP, engagement, earnedIds: earned.map((b) => b.id) });
}

// POST — badges earned since the last check, for the "unlocked" pop-up.
// Body: { known?: string[] } — ids this browser announced before this was kept on the account.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`achievements:${user.id}`, 40, 5 * 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const known = Array.isArray(body?.known) ? (body.known as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 100) : undefined;

  const admin = await createAdminClient();
  const { earned } = await loadUserBadges(admin, user);
  const fresh = await claimNewBadges(admin, user.id, earned.map((b) => b.id), known);
  return NextResponse.json({ newIds: fresh });
}
