import { createAdminClient } from "@/lib/supabase/server";
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
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Convert a static story (from data.ts) to StoryDB shape */
function staticToDB(s: any): StoryDB {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    body: "",
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
    created_at: "",
    updated_at: "",
  };
}

export async function getPublishedStories(): Promise<StoryDB[]> {
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from("stories")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) return data;
  } catch {}
  // Fallback to static data
  return staticStories.map(staticToDB);
}

export async function getStoryBySlug(slug: string): Promise<StoryDB | null> {
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
  // Fallback to static data
  const s = staticStories.find((s) => s.slug === slug);
  return s ? staticToDB(s) : null;
}