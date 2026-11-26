import { GUIDES, TOPICS, guideBySlug } from "@/lib/adventurepedia";
import { guideOgImage, OG_SIZE } from "@/lib/guideOg";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "An Adventurepedia guide on Trail to Tides";

export function generateStaticParams() {
  return GUIDES.filter((g) => !g.custom).map((g) => ({ slug: g.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug)!;
  return guideOgImage({ kicker: TOPICS.find((t) => t.id === g.topic)?.label ?? "Guide", title: g.title, summary: g.summary });
}
