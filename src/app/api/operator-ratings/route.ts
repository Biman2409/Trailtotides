import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MIN_RATINGS_FOR_COMPUTED = 5;

// GET /api/operator-ratings?slug=<slug>
// Returns aggregated ratings per operator for the adventure.
// { ratings: { [operatorNameNorm]: { avg: number; count: number; display: string } } }
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const { data, error } = await admin
    .from("operator_ratings")
    .select("operator_name, operator_name_display, rating")
    .eq("adventure_slug", slug);

  if (error) {
    if (error.code === "PGRST205" || error.message?.includes("operator_ratings")) {
      return NextResponse.json({ ratings: {} });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregate by normalized operator name
  const agg: Record<string, { sum: number; count: number; display: string }> = {};
  for (const row of data ?? []) {
    const key = row.operator_name;
    if (!agg[key]) agg[key] = { sum: 0, count: 0, display: row.operator_name_display };
    agg[key].sum += row.rating;
    agg[key].count += 1;
  }

  const ratings: Record<string, { avg: number; count: number; display: string; computed: boolean }> = {};
  for (const [key, val] of Object.entries(agg)) {
    ratings[key] = {
      avg: Math.round((val.sum / val.count) * 10) / 10,
      count: val.count,
      display: val.display,
      computed: val.count >= MIN_RATINGS_FOR_COMPUTED,
    };
  }

  return NextResponse.json({ ratings });
}

// POST /api/operator-ratings
// Body: { slug, operatorName, rating }
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, operatorName, rating } = await req.json();
  if (!slug || !operatorName?.trim() || !rating) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  const norm = operatorName.trim().toLowerCase();

  const { error } = await admin
    .from("operator_ratings")
    .upsert(
      {
        adventure_slug: slug,
        operator_name: norm,
        operator_name_display: operatorName.trim(),
        user_id: user.id,
        rating,
      },
      { onConflict: "adventure_slug,operator_name,user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
