import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient, createAdminClient } from "@/lib/supabase/server";
import { loadUserBadges } from "@/lib/userAchievements";
import { NextRequest, NextResponse } from "next/server";
import { XP_REWARDS, XP_CAPS, xpFromEvents, type XPAction } from "@/lib/xp";
import { rateLimit } from "@/lib/rateLimit";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "user-data";
const xpPath = (userId: string) => `xp/${userId}.json`;

interface XPEvent {
  action: string;
  adventure_slug: string;
  xp: number;
  created_at: string;
  revoked?: boolean;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

async function ensureBucket() {
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.find(b => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: false });
  }
}

async function readEvents(userId: string): Promise<XPEvent[]> {
  const { data } = await admin.storage.from(BUCKET).download(xpPath(userId));
  if (!data) return [];
  try {
    const parsed = JSON.parse(await data.text());
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeEvents(userId: string, events: XPEvent[]): Promise<boolean> {
  const blob = new Blob([JSON.stringify(events)], { type: "application/json" });
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(xpPath(userId), blob, { upsert: true });
  if (error) {
    // Bucket might not exist — create it and retry
    await ensureBucket();
    const { error: err2 } = await admin.storage
      .from(BUCKET)
      .upload(xpPath(userId), blob, { upsert: true });
    if (err2) return false;
  }
  return true;
}

// ─── GET /api/xp ─────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ xp: 0, events: [], engagement: {} });

  // Counts come from the same place as the badges, so the stats strip and the
  // Trophy Cabinet agree (XP for wishlist/compare is only given once)
  const { totalXP, events, engagement } = await loadUserBadges(await createAdminClient(), user);
  return NextResponse.json({ xp: totalXP, events, engagement });
}

// ─── POST /api/xp ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`xp-award:${user.id}`, 40, 5 * 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json();
  const action = body.action as XPAction;
  const slug: string = body.slug ?? "";

  if (!action || !(action in XP_REWARDS)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const xp = XP_REWARDS[action];
  const events = await readEvents(user.id);
  const active = events.filter(e => !e.revoked);

  const matchSlug = (e: XPEvent) => e.adventure_slug === slug;
  const matchAction = (e: XPEvent) => e.action === action;

  // One-time global actions (first time ever, regardless of slug)
  if (["ace_complete", "wishlist", "compare"].includes(action)) {
    if (active.some(matchAction)) {
      return NextResponse.json({ awarded: false, reason: "already_awarded" });
    }
  }

  // Per-adventure once actions
  if (["review", "trip_log"].includes(action)) {
    if (active.some(e => matchAction(e) && matchSlug(e))) {
      return NextResponse.json({ awarded: false, reason: "already_awarded" });
    }
  }

  // Each action earns XP only up to its cap (see XP_CAPS) — together they top out at 9,000
  if (active.filter(matchAction).length >= XP_CAPS[action]) {
    return NextResponse.json({ awarded: false, reason: "cap_reached" });
  }

  // Photo cap: max 3 per adventure
  if (action === "photo" && slug) {
    const photoCount = active.filter(
      e => e.action === "photo" && e.adventure_slug === slug
    ).length;
    if (photoCount >= 3) {
      return NextResponse.json({ awarded: false, reason: "photo_cap_reached" });
    }
  }

  const newEvent: XPEvent = {
    action,
    adventure_slug: slug,
    xp,
    created_at: new Date().toISOString(),
  };

  const updated = [...events, newEvent];
  const ok = await writeEvents(user.id, updated);
  if (!ok) return NextResponse.json({ error: "Failed to save XP" }, { status: 500 });

  const newTotal = xpFromEvents(updated);
  return NextResponse.json({ awarded: true, xp, newTotal });
}

// ─── DELETE /api/xp — revoke XP for an action+slug ───────────────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = rateLimit(`xp-revoke:${user.id}`, 40, 5 * 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json();
  const action = body.action as XPAction;
  const slug: string = body.slug ?? "";

  if (!action || !(action in XP_REWARDS)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const events = await readEvents(user.id);

  // Revoke the most recent matching active event
  let revoked = false;
  const updated = events.map(e => {
    if (!revoked && !e.revoked && e.action === action && e.adventure_slug === slug) {
      revoked = true;
      return { ...e, revoked: true };
    }
    return e;
  });

  if (!revoked) return NextResponse.json({ revoked: false, reason: "not_found" });

  await writeEvents(user.id, updated);
  const newTotal = xpFromEvents(updated);
  return NextResponse.json({ revoked: true, newTotal });
}
