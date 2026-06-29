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

    // Get logged-in user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `story-${Date.now()}`;

    const adminClient = await createAdminClient();

    // Auto-populate avatar from user's profile picture
    const avatarId = user?.user_metadata?.avatar_id;
    const authorAvatar = avatarId ? `/avatars/avatar-${avatarId}.png` : "";

    // Insert into stories table with pending status
    const { error } = await adminClient.from("stories").insert({
      slug,
      title,
      excerpt,
      body: storyBody,
      author_name: authorName,
      author_role: authorRole || "",
      author_bio: authorBio || "",
      author_avatar: authorAvatar,
      hero_image: heroImageUrl || "",
      read_time: "5 min read",
      tags: [region],
      region,
      date: dateOfAdventure,
      status: "pending",
      submitted_by: user?.id ?? null,
    });

    if (error) {
      console.error("story submission db error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("story submit route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}