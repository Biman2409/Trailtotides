import { NextRequest, NextResponse } from "next/server";
import { adventures } from "@/lib/data";
import { getPublishedStories } from "@/lib/stories";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  type: "adventure" | "story" | "operator";
  image?: string;
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

  // Adventures
  for (const a of adventures) {
    results.push({
      id: a.id,
      title: a.name,
      subtitle: `${a.type} · ${a.state} · ${a.difficulty}`,
      url: `/experiences/${a.slug}`,
      type: "adventure",
      image: a.heroImage,
    });
  }

  // Stories
  try {
    const stories = await getPublishedStories();
    for (const s of stories) {
      results.push({
        id: s.id,
        title: s.title,
        subtitle: `by ${s.author_name} · ${s.region}`,
        url: `/stories/${s.slug}`,
        type: "story",
        image: s.hero_image,
      });
    }
  } catch {}

  return NextResponse.json({ results });
}