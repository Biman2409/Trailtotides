import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { XP_REWARDS, type XPAction } from "@/lib/xp";

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
  if (!user) return NextResponse.json({ xp: 0, events: [] });

  const events = await readEvents(user.id);
  const total = events.reduce((sum, e) => sum + (e.xp ?? 0), 0);
  const sorted = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return NextResponse.json({ xp: total, events: sorted });
}

// ─── POST /api/xp ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const action = body.action as XPAction;
  const slug: string = body.slug ?? "";

  if (!action || !(action in XP_REWARDS)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const xp = XP_REWARDS[action];
  const events = await readEvents(user.id);

  const matchSlug = (e: XPEvent) => e.adventure_slug === slug;
  const matchAction = (e: XPEvent) => e.action === action;

  // One-time global actions
  if (action === "ace_complete") {
    if (events.some(matchAction)) {
      return NextResponse.json({ awarded: false, reason: "already_awarded" });
    }
  }

  // Per-adventure once actions
  if (["wishlist", "compare", "checkin", "review", "trip_log"].includes(action)) {
    if (events.some(e => matchAction(e) && matchSlug(e))) {
      return NextResponse.json({ awarded: false, reason: "already_awarded" });
    }
  }

  // Photo cap: max 3 per adventure
  if (action === "photo" && slug) {
    const photoCount = events.filter(
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

  const newTotal = updated.reduce((s, e) => s + (e.xp ?? 0), 0);
  return NextResponse.json({ awarded: true, xp, newTotal });
}
