import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { stories as staticStories } from "@/lib/data";

export interface StoryDB {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author_name: string;
  author_role: string;
  author_bio: string;
  author_avatar: string;
  hero_image: string;
  read_time: string;
  tags: string[];
  region: string;
  date: string;
  status: string;
  baseLikes?: number;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

const STORAGE_BUCKET = "story-data";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Convert a static story (from data.ts) to StoryDB shape */
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
    read_time: s.readTime,
    tags: s.tags || [],
    region: s.region,
    date: s.date,
    status: "published",
    submitted_by: s.submittedBy || null,
    created_at: s.created_at || "",
    updated_at: s.updated_at || "",
  };
}

/** Try fetching stories from Supabase Storage (JSON file list) */
async function getFromStorage(): Promise<StoryDB[]> {
  try {
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.find((b) => b.name === STORAGE_BUCKET)) return [];

    const { data: files } = await admin.storage.from(STORAGE_BUCKET).list("stories");
    if (!files?.length) return [];

    const stories: StoryDB[] = [];
    for (const file of files) {
      if (!file.name.endsWith(".json")) continue;
      const { data } = await admin.storage.from(STORAGE_BUCKET).download(`stories/${file.name}`);
      if (!data) continue;
      const text = await data.text();
      try {
        const story = JSON.parse(text) as StoryDB;
        stories.push(story);
      } catch {}
    }
    return stories.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  } catch {
    return [];
  }
}

/** Fetch a single story from Storage by slug */
async function getSingleFromStorage(slug: string): Promise<StoryDB | null> {
  try {
    const { data } = await admin.storage.from(STORAGE_BUCKET).download(`stories/${slug}.json`);
    if (!data) return null;
    const text = await data.text();
    return JSON.parse(text) as StoryDB;
  } catch {
    return null;
  }
}

/** Save a story to Storage as JSON */
export async function saveStoryToStorage(story: StoryDB): Promise<boolean> {
  try {
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.find((b) => b.name === STORAGE_BUCKET)) {
      await admin.storage.createBucket(STORAGE_BUCKET, { public: false });
    }

    const json = JSON.stringify(story);
    const bytes = new TextEncoder().encode(json);
    const { error } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(`stories/${story.slug}.json`, bytes, {
        contentType: "application/json",
        upsert: true,
      });
    return !error;
  } catch {
    return false;
  }
}

export async function getPublishedStories(): Promise<StoryDB[]> {
  // 1. Try Supabase DB (stories table)
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from("stories")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) return data;
  } catch {}

  // 2. Try Supabase Storage
  const storage = await getFromStorage();
  if (storage.length > 0) return storage;

  // 3. Fallback to static data
  return staticStories.map(staticToDB);
}

export async function getStoryBySlug(slug: string): Promise<StoryDB | null> {
  // 1. Try Supabase DB
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from("stories")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (data) return data;
  } catch {}

  // 2. Try Supabase Storage
  const stored = await getSingleFromStorage(slug);
  if (stored) return stored;

  // 3. Fallback to static data
  const s = staticStories.find((s) => s.slug === slug);
  return s ? staticToDB(s) : null;
}