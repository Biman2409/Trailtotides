import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { saveStoryToStorage } from "@/lib/stories";

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
      authorAvatar,
      readTime,
      tags,
    } = body;

    if (!title || !excerpt || !storyBody || !authorName || !dateOfAdventure || !region) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Generate a slug from the title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
    if (!slug) slug = `story-${Date.now()}`;

    // Auto-populate avatar from user's profile picture if not provided
    let finalAvatar = authorAvatar || "";
    if (!finalAvatar) {
      const avatarId = user?.user_metadata?.avatar_id;
      if (avatarId) finalAvatar = `/avatars/avatar-${avatarId}.png`;
    }

    // Parse tags into array, merge with region
    const tagList: string[] = [];
    if (tags) {
      tagList.push(...tags.split(",").map((t: string) => t.trim()).filter(Boolean));
    }
    if (!tagList.includes(region)) tagList.unshift(region);

    const finalReadTime = readTime || "5 min read";
    const now = new Date().toISOString();

    const storyRecord = {
      id: crypto.randomUUID(),
      slug,
      title,
      excerpt,
      body: storyBody,
      author_name: authorName,
      author_role: authorRole || "",
      author_bio: authorBio || "",
      author_avatar: finalAvatar,
      hero_image: heroImageUrl || "",
      read_time: finalReadTime,
      tags: tagList,
      region,
      date: dateOfAdventure,
      status: "pending" as const,
      submitted_by: user?.id ?? null,
      created_at: now,
      updated_at: now,
    };

    // Try Supabase DB first
    const adminClient = await createAdminClient();
    const { error } = await adminClient.from("stories").insert(storyRecord);

    if (!error) {
      return NextResponse.json({ success: true });
    }

    // If table doesn't exist, fallback to Storage
    if (error.message?.includes("Could not find the table")) {
      const saved = await saveStoryToStorage(storyRecord);
      if (saved) return NextResponse.json({ success: true });
      return NextResponse.json({ error: "Could not save story. Please try again." }, { status: 500 });
    }

    console.error("story submission db error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } catch (err) {
    console.error("story submit route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}