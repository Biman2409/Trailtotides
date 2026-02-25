import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    // Upsert: if row doesn't exist create it, otherwise increment
    const { data, error } = await supabase.rpc("increment_story_views", { story_slug: slug });

    if (error) {
      // Fallback: manual upsert
      const { data: existing } = await supabase
        .from("story_views")
        .select("views")
        .eq("slug", slug)
        .single();

      if (existing) {
        await supabase
          .from("story_views")
          .update({ views: existing.views + 1, updated_at: new Date().toISOString() })
          .eq("slug", slug);
        return NextResponse.json({ views: existing.views + 1 });
      } else {
        await supabase
          .from("story_views")
          .insert({ slug, views: 1 });
        return NextResponse.json({ views: 1 });
      }
    }

    return NextResponse.json({ views: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const { data, error } = await supabase
    .from("story_views")
    .select("views")
    .eq("slug", slug)
    .single();

  if (error || !data) return NextResponse.json({ views: 0 });
  return NextResponse.json({ views: data.views });
}
