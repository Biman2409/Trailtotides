import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { saveStoryToStorage } from "@/lib/stories";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";
import { STORY_ACTIVITIES } from "@/lib/storyView";

// Messages are shown to the writer as-is, so they say what to fix
const storySubmitSchema = z.object({
  title: z.string().trim().min(1, "Add a title.").max(200, "The title is too long."),
  excerpt: z.string().trim().min(1, "Add a short hook.").max(500, "The hook is too long."),
  body: z.string().trim().min(200, "The story is too short. Tell us a bit more.").max(40000, "The story is too long for one post."),
  authorName: z.string().trim().min(1, "Add your name.").max(100),
  authorRole: z.string().trim().max(100).optional(),
  authorBio: z.string().trim().max(1000).optional(),
  dateOfAdventure: z.string().trim().min(1, "Add when it happened.").max(50),
  region: z.string().trim().min(1, "Add where it happened.").max(100),
  activity: z.enum(STORY_ACTIVITIES).optional().or(z.literal("")),
  // https only: the photo is shown on the public site
  heroImageUrl: z.string().trim().max(2000).refine((u) => {
    try { return new URL(u).protocol === "https:"; } catch { return false; }
  }, "The photo link must start with https://"),
});

// The chosen activity leads, so cards and filters show it; then the place, then keywords from the text
function calcTags(title: string, excerpt: string, region: string, activity?: string): string[] {
  const tags = activity ? [activity, region] : [region];
  const words = (title + " " + excerpt).toLowerCase();
  const keywords = [
    "trekking", "motorcycling", "cycling", "diving", "kayaking", "skiing",
    "mountaineering", "rock climbing", "jeep safari", "road trip", "solo",
    "himalayas", "desert", "coast", "island", "northeast", "urban",
    "camping", "rafting", "paragliding", "high altitude", "expedition",
  ];
  for (const kw of keywords) {
    // Title case ("Rock Climbing") so it matches the activity names and their icons
    if (words.includes(kw) && !tags.some((t) => t.toLowerCase() === kw)) {
      tags.push(kw.replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  }
  return tags.slice(0, 6);
}

export async function POST(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(`story-submit:${getClientIp(req)}`, 5, 30 * 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const parsed = storySubmitSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Some fields are missing or invalid." }, { status: 400 });
    }
    const {
      title,
      excerpt,
      body: storyBody,
      authorName,
      authorRole,
      authorBio,
      dateOfAdventure,
      region,
      activity,
      heroImageUrl,
    } = parsed.data;

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
    const tagList = calcTags(title, excerpt, region, activity || undefined);

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
      hero_image: heroImageUrl,
      tags: tagList,
      region,
      date: dateOfAdventure,
      status: "pending" as const,
      submitted_by: user?.id ?? null,
      created_at: now,
      updated_at: now,
    };

    // Save to the `stories` table — the single source of truth for both the
    // admin moderation queue and the public site.
    const adminClient = await createAdminClient();
    let { error } = await adminClient.from("stories").insert(storyRecord);

    // `slug` is UNIQUE — two submissions with the same/similar title collide
    // (e.g. two "My First Trek" posts). Retry once with a disambiguated slug
    // instead of failing the submission outright.
    if (error?.code === "23505") {
      storyRecord.slug = `${slug}-${Date.now().toString(36).slice(-5)}`;
      ({ error } = await adminClient.from("stories").insert(storyRecord));
    }

    if (!error) {
      return NextResponse.json({ success: true });
    }

    // If the table doesn't exist on this project yet, fall back to Storage so
    // the submission isn't lost outright.
    if (error.message?.includes("Could not find the table")) {
      const saved = await saveStoryToStorage(storyRecord);
      if (!saved) {
        return NextResponse.json({ error: "Could not save story. Please try again." }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    console.error("story submission db error:", error);
    return NextResponse.json({ error: "Could not save story. Please try again." }, { status: 500 });
  } catch (err) {
    console.error("story submit route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}