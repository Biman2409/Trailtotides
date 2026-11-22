import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { SEED_REVIEWS } from "@/lib/seedReviews";
import { rateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const reviewSchema = z.object({
  slug: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(1).max(2000),
});

// GET /api/reviews?slug=<slug>  — fetch reviews for an adventure
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  // Team notes: shown as such, never counted as traveller reviews
  const seedReviews = (SEED_REVIEWS[slug] ?? []).map(({ user_id: _unused, ...r }) => { void _unused; return { ...r, member: false, mine: false }; });

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
    console.error("reviews GET error:", error);
    return NextResponse.json({ error: "Could not load reviews" }, { status: 500 });
  }

  // Avatars from each reviewer's account, looked up one by one (one adventure has few
  // reviewers; listing every account stops working past 1,000 of them)
  const dbReviews = data ?? [];
  const uniqueUserIds = [...new Set(dbReviews.map((r) => r.user_id as string))];
  const avatarMap: Record<string, number | null> = {};
  await Promise.all(uniqueUserIds.slice(0, 200).map(async (id) => {
    const { data: u } = await admin.auth.admin.getUserById(id);
    avatarMap[id] = u?.user?.user_metadata?.avatar_id ?? null;
  }));
  // Who wrote it stays private: the browser gets "a member wrote this" and "you wrote this",
  // never the account id
  const { data: { user } } = await (await createServerClient()).auth.getUser();
  const enrichedDb = dbReviews.map(({ user_id, ...r }) => ({ ...r, avatar_id: avatarMap[user_id] ?? null, member: true, mine: !!user && user.id === user_id }));

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

  const { allowed } = rateLimit(`review-post:${user.id}`, 20, 30 * 60_000);
  if (!allowed) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }
  const { slug, rating, body } = parsed.data;

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

  if (error) {
    console.error("reviews POST error:", error);
    return NextResponse.json({ error: "Could not submit review" }, { status: 500 });
  }
  // The adventure page is cached; refresh its rating
  revalidatePath(`/experiences/${slug}`);
  const { user_id: _omit, ...review } = data;
  void _omit;
  return NextResponse.json({ review: { ...review, avatar_id, member: true, mine: true } });
}

// DELETE /api/reviews?id=<id>  — delete own review
export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data: deleted, error } = await admin
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("adventure_slug");

  if (error) {
    console.error("reviews DELETE error:", error);
    return NextResponse.json({ error: "Could not delete review" }, { status: 500 });
  }
  deleted?.forEach((r) => revalidatePath(`/experiences/${r.adventure_slug}`));
  return NextResponse.json({ success: true });
}
