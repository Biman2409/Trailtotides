import { NextResponse } from "next/server";
import { adventures } from "@/lib/data";
import { getPublishedStories } from "@/lib/stories";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  type: "adventure" | "story" | "operator";
  image?: string;
}

export async function GET() {
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