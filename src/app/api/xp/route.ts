import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { XP_REWARDS, type XPAction } from "@/lib/xp";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Ensure table exists ──────────────────────────────────────────────────────

async function ensureTable() {
  await admin.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS xp_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        action text NOT NULL,
        adventure_slug text,
        xp integer NOT NULL,
        created_at timestamptz DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS xp_events_user_id_idx ON xp_events(user_id);
    `,
  }).catch(() => {}); // silently ignore if rpc unavailable
}

// ─── GET /api/xp — fetch user total ──────────────────────────────────────────

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ xp: 0, events: [] });

  const { data, error } = await admin
    .from("xp_events")
    .select("action, adventure_slug, xp, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ xp: 0, events: [] });

  const total = (data ?? []).reduce((sum, e) => sum + e.xp, 0);
  return NextResponse.json({ xp: total, events: data ?? [] });
}

// ─── POST /api/xp — award XP ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const action = body.action as XPAction;
  const slug: string | null = body.slug ?? null;

  if (!action || !(action in XP_REWARDS)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const xp = XP_REWARDS[action];

  // ── Dedup rules ──────────────────────────────────────────────────────────────
  const { data: existing } = await admin
    .from("xp_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("action", action)
    .eq("adventure_slug", slug ?? "")
    .limit(1);

  // One-time global actions
  if (["ace_complete", "wishlist", "compare"].includes(action) && existing && existing.length > 0) {
    return NextResponse.json({ awarded: false, reason: "already_awarded" });
  }

  // Per-adventure once actions
  if (["checkin", "review", "trip_log"].includes(action) && slug && existing && existing.length > 0) {
    return NextResponse.json({ awarded: false, reason: "already_awarded" });
  }

  // Photo cap: max 3 per adventure
  if (action === "photo" && slug) {
    const { count } = await admin
      .from("xp_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action", "photo")
      .eq("adventure_slug", slug);
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ awarded: false, reason: "photo_cap_reached" });
    }
  }

  // Insert event
  const { error } = await admin.from("xp_events").insert({
    user_id: user.id,
    action,
    adventure_slug: slug ?? "",
    xp,
  });

  if (error) {
    // Try to create table and retry once
    await ensureTable();
    const { error: err2 } = await admin.from("xp_events").insert({
      user_id: user.id,
      action,
      adventure_slug: slug ?? "",
      xp,
    });
    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
  }

  // Return new total
  const { data: allEvents } = await admin
    .from("xp_events")
    .select("xp")
    .eq("user_id", user.id);

  const newTotal = (allEvents ?? []).reduce((s, e) => s + e.xp, 0);
  return NextResponse.json({ awarded: true, xp, newTotal });
}
