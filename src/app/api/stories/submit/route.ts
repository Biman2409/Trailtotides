import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      excerpt,
      body: storyBody,
      authorName,
      authorRole,
      dateOfAdventure,
      region,
      tags,
      heroImageUrl,
    } = body;

    if (!title || !excerpt || !storyBody || !authorName || !dateOfAdventure || !region) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Pull contact info from the logged-in user's session + profile
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let email: string | null = null;
    let phone: string | null = null;

    if (user) {
      email = user.email ?? null;
      // Fetch phone from profiles table
      const adminClient = await createAdminClient();
      const { data: profile } = await adminClient
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .single();
      phone = profile?.phone ?? null;
    }

    const adminClient = await createAdminClient();

    const { error } = await adminClient.from("story_submissions").insert({
      title,
      excerpt,
      body: storyBody,
      author_name: authorName,
      author_role: authorRole || null,
      email,
      phone,
      date_of_adventure: dateOfAdventure,
      region,
      tags: tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      hero_image_url: heroImageUrl || null,
      status: "pending",
    });

    if (error) {
      console.error("story_submissions insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("story submit route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
