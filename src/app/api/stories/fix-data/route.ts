import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stories as staticStories } from "@/lib/data";
import { saveStoryToStorage } from "@/lib/stories";
import type { StoryDB } from "@/lib/stories";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Convert a static story to StoryDB shape */
function staticToDB(s: any): StoryDB {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    body: s.body || "",
    author_name: s.author,
    author_role: s.authorRole || "",
    author_bio: s.authorBio || "",
    author_avatar: s.authorAvatar || "",
    hero_image: s.heroImage,
    tags: s.tags || [],
    region: s.region,
    adventure_date: s.adventureDate || s.date || "",
    status: "published",
    submitted_by: s.submittedBy || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function POST() {
  const log: string[] = [];

  try {
    // 1. Fix the "riding-through-a-revolution" story region in DB
    const { data: dbStories, error: dbError } = await admin
      .from("stories")
      .select("*")
      .eq("slug", "riding-through-a-revolution");

    if (dbError) {
      log.push(`DB query error: ${dbError.message}`);
    } else if (dbStories && dbStories.length > 0) {
      const { error: updateErr } = await admin
        .from("stories")
        .update({
          region: "Nepal",
          adventure_date: "Sep 2024",
          updated_at: new Date().toISOString(),
        })
        .eq("slug", "riding-through-a-revolution");

      if (updateErr) {
        log.push(`DB update error: ${updateErr.message}`);
      } else {
        log.push("Updated riding-through-a-revolution region to Nepal in DB");
      }
    } else {
      log.push("No DB record found for riding-through-a-revolution");
    }

    // 2. Fix all stories in storage (story-data bucket)
    let storageFixed = 0;
    try {
      const { data: files } = await admin.storage.from("story-data").list("stories");
      if (files && files.length > 0) {
        for (const file of files) {
          if (!file.name.endsWith(".json")) continue;
          const { data } = await admin.storage.from("story-data").download(`stories/${file.name}`);
          if (!data) continue;
          const text = await data.text();
          const story = JSON.parse(text) as StoryDB;

          // Find matching static story for correct data
          const staticStory = staticStories.find((s) => s.slug === story.slug);

          let changed = false;
          if (staticStory) {
            if (staticStory.region && story.region !== staticStory.region) {
              story.region = staticStory.region;
              changed = true;
            }
            if (staticStory.adventureDate && story.adventure_date !== staticStory.adventureDate) {
              story.adventure_date = staticStory.adventureDate;
              changed = true;
            }
          }

          // Also ensure adventure_date is not empty
          if (!story.adventure_date && staticStory?.adventureDate) {
            story.adventure_date = staticStory.adventureDate;
            changed = true;
          }

          if (changed) {
            const json = JSON.stringify(story);
            const bytes = new TextEncoder().encode(json);
            await admin.storage
              .from("story-data")
              .upload(`stories/${file.name}`, bytes, {
                contentType: "application/json",
                upsert: true,
              });
            storageFixed++;
            log.push(`Fixed storage: ${story.slug} - region=${story.region}, date=${story.adventure_date}`);
          }
        }
      }
    } catch (e: any) {
      log.push(`Storage fix error: ${e.message}`);
    }

    log.push(`Fixed ${storageFixed} stories in storage`);

    // 3. Re-seed any missing stories to storage
    let seeded = 0;
    for (const s of staticStories) {
      const story = staticToDB(s);
      const saved = await saveStoryToStorage(story);
      if (saved) {
        seeded++;
        log.push(`Seeded ${s.slug} to storage`);
      }
    }
    log.push(`Seeded ${seeded} stories to storage`);

    return NextResponse.json({ success: true, log });
  } catch (err: any) {
    log.push(`FATAL: ${err.message}`);
    return NextResponse.json({ error: err.message, log }, { status: 500 });
  }
}