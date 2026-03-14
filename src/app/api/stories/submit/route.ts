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
      authorBio,
      dateOfAdventure,
      region,
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
      const adminClient = await createAdminClient();
      const { data: profile } = await adminClient
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .single();
      phone = profile?.phone ?? null;
    }

    const adminClient = await createAdminClient();

    // Build submission object
    const submission = {
      id: crypto.randomUUID(),
      title,
      excerpt,
      body: storyBody,
      author_name: authorName,
      author_role: authorRole || null,
      author_bio: authorBio || null,
      email,
      phone,
      date_of_adventure: dateOfAdventure,
      region,
      hero_image_url: heroImageUrl || null,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    // Store as JSON file in Supabase Storage bucket "story-submissions"
    const fileName = `${submission.created_at.replace(/[:.]/g, "-")}_${submission.id}.json`;
    const fileContent = JSON.stringify(submission, null, 2);

    const { error } = await adminClient.storage
      .from("story-submissions")
      .upload(fileName, new Blob([fileContent], { type: "application/json" }), {
        contentType: "application/json",
        upsert: false,
      });

    if (error) {
      console.error("story submission storage error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("story submit route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
