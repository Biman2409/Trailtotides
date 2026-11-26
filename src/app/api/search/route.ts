import { NextRequest, NextResponse } from "next/server";
import { adventures } from "@/lib/data";
import { getPublishedStories } from "@/lib/stories";
import { GUIDES } from "@/lib/adventurepedia";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { difficultyOf } from "@/lib/ace";
import { DESTINATIONS } from "@/lib/destinations";
import { operatorPages } from "@/lib/operatorPages";
import { fromPrice } from "@/lib/leadPrices";
import { stripEmphasis } from "@/lib/emphasis";
import { hasTrekGuide, trekGuideHref } from "@/lib/trekGuides";
import { ACTIVITIES, activityHref } from "@/lib/activityGuides";

// The index Compass.AI search matches as you type, everywhere on the site (the hero, the header,
// Explore, the map): adventures, places, trek guides, operators, Adventurepedia and stories.
// Small enough to send whole and match in the browser; the AI's picks come from /api/chat.

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  type: "adventure" | "place" | "trek-guide" | "operator" | "guide" | "story";
  image?: string;
  /** Matched but not shown: tags, region, base camp, best months */
  keywords?: string;
  /** Adventures: what the result row shows beside the name */
  meta?: { days?: string; difficulty?: string; price?: number | null };
}

export async function GET(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(`search:${getClientIp(req)}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const results: SearchResult[] = [];

  for (const a of adventures) {
    results.push({
      id: a.id,
      title: a.name,
      subtitle: `${a.type} · ${a.state}`,
      url: `/experiences/${a.slug}`,
      type: "adventure",
      image: a.heroImage,
      keywords: [a.region, a.baseCamp, a.tagline, ...(a.tags ?? []), ...(a.bestMonths ?? []), stripEmphasis(a.description ?? "").slice(0, 200)].filter(Boolean).join(" "),
      meta: { days: a.durationDays, difficulty: difficultyOf(a), price: fromPrice(a) },
    });
  }

  // Places: each destination, with how many adventures it has
  for (const d of DESTINATIONS) {
    results.push({
      id: `place-${d.slug}`,
      title: d.name,
      subtitle: `Destination · ${d.adventures.length} ${d.adventures.length === 1 ? "adventure" : "adventures"}`,
      url: `/destinations/${d.slug}`,
      type: "place",
      keywords: [...new Set(d.adventures.map((a) => a.type))].join(" "),
    });
  }

  // Trek guides: the deep guide per trek, for "how to reach", "permits", "best time"
  for (const a of adventures.filter(hasTrekGuide)) {
    results.push({
      id: `trek-guide-${a.slug}`,
      title: `${a.name} guide`,
      subtitle: "Trek guide · how to reach, permits, best time, packing",
      url: trekGuideHref(a.slug),
      type: "trek-guide",
      keywords: "guide how to reach permit best time itinerary packing",
    });
  }

  for (const o of operatorPages()) {
    results.push({
      id: `operator-${o.slug}`,
      title: o.name,
      subtitle: `Operator · ${o.treks.length} ${o.treks.length === 1 ? "listing" : "listings"}`,
      url: `/operators/${o.slug}`,
      type: "operator",
      keywords: o.treks.map((t) => t.adventure.name).join(" "),
    });
  }

  for (const g of GUIDES) {
    results.push({
      id: `guide-${g.slug}`,
      title: g.short,
      subtitle: `Adventurepedia · ${g.title}`,
      url: `/adventurepedia/${g.slug}`,
      type: "guide",
    });
  }

  // Every kind of adventure has a full guide, live or coming soon
  for (const a of ACTIVITIES) {
    results.push({
      id: `activity-${a.slug}`,
      title: `${a.type} in India`,
      subtitle: `Adventurepedia · Full guide to ${a.type.toLowerCase()}`,
      url: activityHref(a),
      type: "guide",
      keywords: `${a.type} ${a.where.join(" ")}`,
    });
  }

  try {
    const stories = await getPublishedStories();
    for (const s of stories) {
      results.push({
        id: s.id,
        title: s.title,
        subtitle: `Story by ${s.author_name} · ${s.region}`,
        url: `/stories/${s.slug}`,
        type: "story",
        image: s.hero_image,
      });
    }
  } catch {}

  return NextResponse.json({ results });
}
