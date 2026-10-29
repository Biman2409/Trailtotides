// Turns a story's hashtags into links to real pages on the site, for readers and for search
// engines. A tag that leads nowhere useful is dropped and a relevant one is put in its place,
// so every hashtag under a story goes somewhere.
import { adventures } from "@/lib/data";
import { DESTINATIONS } from "@/lib/destinations";
import { matchesSearch } from "@/lib/exploreHelpers";
import { BADGE_TAGS, STORY_ACTIVITIES } from "@/lib/storyView";

export interface StoryTag { label: string; href: string }

const LIVE_TYPES = [...new Set(adventures.map((a) => a.type as string))];

// Words people tag with that mean one of the site's adventure types
const TYPE_ALIASES: Record<string, string> = {
  motorcycle: "Motorcycling", motorbike: "Motorcycling", bike: "Motorcycling", biking: "Motorcycling", "bike trip": "Motorcycling",
  trek: "Trekking", hike: "Trekking", hiking: "Trekking", rafting: "River Rafting", scuba: "Diving", "scuba diving": "Diving",
  climbing: "Rock Climbing", cycle: "Cycling", bicycle: "Cycling",
};

// Guides a tag can point to, with the hashtag each one reads as and the words that call for it
const GUIDE_TAGS: { slug: string; label: string; words: RegExp }[] = [
  { slug: "altitude-sickness", label: "Altitude Sickness", words: /\b(altitude|ams|summit|high pass|\d,?\d{3} ?(m|ft)|breathless|thin air)\b/i },
  { slug: "riding-the-high-passes", label: "High Passes", words: /\b(pass|la\b|ride|rider|riding|motorcycl|bike|bikes)\b/i },
  { slug: "what-to-pack", label: "Packing List", words: /\b(pack|gear|layers?|kit|poncho|rain liner|jacket)\b/i },
  { slug: "choosing-a-season", label: "Best Time To Go", words: /\b(monsoon|winter|snow|rain|season|weather|hail)\b/i },
  { slug: "permits-and-documents", label: "Permits", words: /\b(permit|border|customs|passport|visa|inner line)\b/i },
  { slug: "insurance-and-emergencies", label: "Travel Safety", words: /\b(emergency|rescue|accident|injur|fever|landslide|stranded)\b/i },
  { slug: "offline-maps", label: "Offline Maps", words: /\b(network|signal|map|lost|shortcut|gps)\b/i },
  { slug: "river-rafting", label: "Rafting Guide", words: /\b(raft|rapids?|river)\b/i },
  { slug: "getting-fit", label: "Trek Fitness", words: /\b(fit|fitness|training|knees|stamina)\b/i },
  { slug: "choosing-an-operator", label: "Choosing An Operator", words: /\b(operator|guide|tour|agency|company)\b/i },
  { slug: "leave-no-trace", label: "Leave No Trace", words: /\b(litter|plastic|waste|campsite|camping)\b/i },
];

const byLabel = (t: string) => t.trim().toLowerCase();
const destinationFor = (t: string) => DESTINATIONS.find((d) => byLabel(d.name) === byLabel(t));
const typeFor = (t: string) => LIVE_TYPES.find((x) => byLabel(x) === byLabel(t)) ?? (TYPE_ALIASES[byLabel(t)] && LIVE_TYPES.includes(TYPE_ALIASES[byLabel(t)]) ? TYPE_ALIASES[byLabel(t)] : undefined);
const guideFor = (t: string) => GUIDE_TAGS.find((g) => byLabel(g.label) === byLabel(t) || g.slug === t.toLowerCase().replace(/\s+/g, "-"));
const hasTrips = (q: string) => adventures.some((a) => matchesSearch(a, q));

/** Where one tag leads, or null when no page fits it */
function resolve(tag: string): StoryTag | null {
  const d = destinationFor(tag);
  if (d) return { label: d.name, href: `/destinations/${d.slug}` };
  const type = typeFor(tag);
  if (type) return { label: type, href: `/explore?type=${encodeURIComponent(type)}` };
  const g = guideFor(tag);
  if (g) return { label: g.label, href: `/adventurepedia/${g.slug}` };
  if ((STORY_ACTIVITIES as readonly string[]).includes(tag)) return { label: tag, href: `/stories?activity=${encodeURIComponent(tag)}` };
  if (hasTrips(tag)) return { label: tag, href: `/explore?q=${encodeURIComponent(tag)}` };
  return null;
}

/**
 * The story's hashtags, every one a link. Tags that lead nowhere are swapped for ones that fit the
 * story: its place, its activity, then the guides its text calls for. Never fewer than `min`.
 */
export function storyTags(story: { tags: string[]; region: string; text: string }, activity?: string, min = 6, max = 10): StoryTag[] {
  const out: StoryTag[] = [];
  const add = (t: StoryTag | null) => {
    if (t && out.length < max && !out.some((o) => o.href === t.href || byLabel(o.label) === byLabel(t.label))) out.push(t);
  };

  const own = story.tags.filter((t) => !BADGE_TAGS.includes(t));
  own.forEach((t) => add(resolve(t)));
  const wanted = Math.max(min, own.length);

  // Replacements, most relevant first
  const place = story.region.trim();
  if (place) add(resolve(place));
  if (activity) add(resolve(activity));
  if (activity && place && LIVE_TYPES.includes(activity) && adventures.some((a) => a.type === activity && matchesSearch(a, place))) {
    add({ label: `${activity} in ${place}`, href: `/explore?type=${encodeURIComponent(activity)}&q=${encodeURIComponent(place)}` });
  }
  for (const g of GUIDE_TAGS) {
    if (out.length >= wanted) break;
    if (g.words.test(story.text)) add({ label: g.label, href: `/adventurepedia/${g.slug}` });
  }
  // Still short: the guides every trip needs
  for (const slug of ["choosing-a-season", "choosing-an-operator", "what-to-pack"]) {
    if (out.length >= wanted) break;
    const g = GUIDE_TAGS.find((x) => x.slug === slug)!;
    add({ label: g.label, href: `/adventurepedia/${g.slug}` });
  }
  return out;
}

/** Search phrases for the page: the hashtags, plus activity and place put the way people search */
export function storyKeywords(tags: StoryTag[], region: string, activity?: string): string[] {
  const place = region.trim();
  const words = [
    ...tags.map((t) => t.label),
    ...(activity && place ? [`${activity} in ${place}`, `${place} ${activity.toLowerCase()} story`, `${activity.toLowerCase()} trip ${place}`] : []),
    ...(place ? [`${place} travel story`, `${place} adventure`] : []),
    "adventure travel India", "Trail to Tides stories",
  ];
  return [...new Set(words.map((w) => w.trim()).filter(Boolean))];
}
