// Shared, client-safe helpers for showing stories (the listing, the article and the submit preview)
import { AVATARS } from "@/lib/avatars";
import type { StoryDB } from "@/lib/stories";
import type { Story } from "@/lib/data";

export const BADGE_TAGS = ["Featured", "TTT Original"];

/** Shown when a story has no photo, so a card or hero never renders empty */
export const FALLBACK_HERO = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80";

/** Every adventure type on the site, live and coming soon, grouped as on the home page's "Find your format".
 *  Each has an icon in ADVENTURE_TYPE_ICONS. */
export const STORY_ACTIVITY_GROUPS = [
  { label: "Earth", types: ["Trekking", "Mountaineering", "Rock Climbing", "Scrambling", "Motorcycling", "Cycling", "Jeep Safari", "Caving", "Urban Adventure"] },
  { label: "Water", types: ["River Rafting", "Kayaking", "Diving", "Surfing", "Snorkelling"] },
  { label: "Snow", types: ["Skiing", "Snowboarding", "Ice Climbing", "Ice Skating"] },
  { label: "Air", types: ["Paragliding", "Skydiving", "Hot Air Balloon", "Hang Gliding"] },
] as const;

export const STORY_ACTIVITIES = STORY_ACTIVITY_GROUPS.flatMap((g) => g.types) as [string, ...string[]];

// next/image only optimises hosts listed in next.config; a pasted URL on any other host
// would throw, so those load as-is instead
const OPTIMISED_HOSTS = [/\.supabase\.co$/, /^images\.unsplash\.com$/];
export function storyImage(src: string | undefined | null): { src: string; unoptimized: boolean } {
  const s = (src ?? "").trim();
  if (!s) return { src: FALLBACK_HERO, unoptimized: false };
  if (s.startsWith("/")) return { src: s, unoptimized: false };
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" && u.protocol !== "http:") return { src: FALLBACK_HERO, unoptimized: false };
    return { src: s, unoptimized: !OPTIMISED_HOSTS.some((re) => re.test(u.hostname)) };
  } catch {
    return { src: FALLBACK_HERO, unoptimized: false };
  }
}

export function pickAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATARS[Math.abs(hash) % AVATARS.length].src;
}

/** Every line break starts a new paragraph: writers on phones rarely leave a blank line */
export function splitParagraphs(body: string): string[] {
  return body.split(/\n+/).map((p) => p.trim()).filter(Boolean);
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function readMinutes(text: string): number {
  return Math.max(1, Math.round(wordCount(text) / 220));
}

/** The activity a story is about: the first tag that isn't a badge or the place itself */
export function storyActivity(tags: string[], region: string): string | undefined {
  return tags.find((t) => !BADGE_TAGS.includes(t) && t.toLowerCase() !== region.toLowerCase());
}

export type StoryView = Story & { body: string; date: string };

export function mapStory(s: StoryDB): StoryView {
  const tags = s.tags ?? [];
  const activity = storyActivity(tags, s.region);
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    body: s.body ?? "",
    author: s.author_name,
    authorRole: s.author_role,
    authorBio: s.author_bio,
    authorAvatar: s.author_avatar || pickAvatar(s.author_name),
    heroImage: s.hero_image || FALLBACK_HERO,
    tags,
    pillTags: activity ? [activity] : [],
    region: s.region,
    date: s.date,
    adventureDate: s.date,
    submittedBy: s.submitted_by || undefined,
    baseLikes: s.baseLikes ?? 50,
  };
}
