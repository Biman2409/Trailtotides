import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { saveStoryToStorage } from "@/lib/stories";

function calcReadTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const min = Math.max(1, Math.round(words / 200));
  return `${min} min read`;
}

function calcTags(title: string, excerpt: string, region: string): string[] {
  const tags = [region];
  const words = (title + " " + excerpt).toLowerCase();
  const keywords = [
    "trekking", "motorcycling", "cycling", "diving", "kayaking", "skiing",
    "mountaineering", "rock climbing", "jeep safari", "road trip", "solo",
    "himalayas", "desert", "coast", "island", "northeast", "urban",
    "camping", "rafting", "paragliding", "high altitude", "expedition",
  ];
  for (const kw of keywords) {
    if (words.includes(kw) && !tags.includes(kw)) {
      tags.push(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  }
  return tags.slice(0, 6);
}

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

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Generate a slug from the title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
    if (!slug) slug = `story-${Date.now()}`;

    // Fetch avatar from user's profile picture
    let authorAvatar = "";
    const avatarId = user?.user_metadata?.avatar_id;
    if (avatarId) authorAvatar = `/avatars/avatar-${avatarId}.png`;

    // AI-calculated values
    const readTime = calcReadTime(storyBody);
    const tagList = calcTags(title, excerpt, region);

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
      author_avatar: authorAvatar,
      hero_image: heroImageUrl || "",
      read_time: readTime,
      tags: tagList,
      region,
      adventure_date: dateOfAdventure,
      status: "pending" as const,
      submitted_by: user?.id ?? null,
      created_at: now,
      updated_at: now,
    };

    // Try Supabase DB first
    const adminClient = await createAdminClient();
    const { error } = await adminClient.from("stories").insert(storyRecord);

    if (!error) {
      // Also save to story-submissions bucket so admin can see it
      try {
        const { data: buckets } = await adminClient.storage.listBuckets();
        if (!buckets?.find(b => b.name === "story-submissions")) {
          await adminClient.storage.createBucket("story-submissions", { public: false });
        }
        const json = JSON.stringify(storyRecord);
        const bytes = new TextEncoder().encode(json);
        await adminClient.storage
          .from("story-submissions")
          .upload(storyRecord.slug + ".json", bytes, {
            contentType: "application/json",
            upsert: true,
          });
      } catch {}
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