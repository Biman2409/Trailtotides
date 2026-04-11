import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { adventures } from "@/lib/data";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/reviews?slug=<slug>  — fetch reviews for an adventure
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const adventure = adventures.find((a) => a.slug === slug);
  const seedReviews = adventure?.seedReviews ?? [];

  const { data, error } = await admin
    .from("reviews")
    .select("id, username, rating, body, created_at, user_id")
    .eq("adventure_slug", slug)
    .order("created_at", { ascending: false });

  if (error) {
    // Table not yet created — serve seed reviews so the UI looks great immediately
    if (error.code === "PGRST205" || error.message?.includes("reviews")) {
      return NextResponse.json({ reviews: seedReviews, tableReady: false });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich DB reviews with avatar_id from user metadata
  const dbReviews = data ?? [];
  const uniqueUserIds = [...new Set(dbReviews.map((r) => r.user_id))];
  const avatarMap: Record<string, number | null> = {};
  if (uniqueUserIds.length > 0) {
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of users ?? []) {
      if (uniqueUserIds.includes(u.id)) {
        avatarMap[u.id] = u.user_metadata?.avatar_id ?? null;
      }
    }
  }
  const enrichedDb = dbReviews.map((r) => ({ ...r, avatar_id: avatarMap[r.user_id] ?? null }));

  // Merge: real DB reviews first, then seed reviews that don't duplicate
  const dbIds = new Set(enrichedDb.map((r) => r.id));
  const merged = [
    ...enrichedDb,
    ...seedReviews.filter((r) => !dbIds.has(r.id)),
  ];

  return NextResponse.json({ reviews: merged, tableReady: true });
}

// POST /api/reviews  — submit a review (auth required)
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, rating, body } = await req.json();
  if (!slug || !rating || !body?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const username =
    user.user_metadata?.username ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Explorer";
  const avatar_id: number | null = user.user_metadata?.avatar_id ?? null;

  // One review per user per adventure
  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("adventure_slug", slug)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this adventure" }, { status: 409 });
  }

  const { data, error } = await admin
    .from("reviews")
    .insert({ adventure_slug: slug, user_id: user.id, username, rating, body: body.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: { ...data, avatar_id } });
}

// DELETE /api/reviews?id=<id>  — delete own review
export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await admin
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
