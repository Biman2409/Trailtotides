import { ACTIVITIES, ELEMENTS, activityBySlug } from "@/lib/activityGuides";
import { guideOgImage, OG_SIZE } from "@/lib/guideOg";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "An Adventurepedia guide on Trail to Tides";

export function generateStaticParams() {
  return ACTIVITIES.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = activityBySlug((await params).slug)!;
  return guideOgImage({ kicker: ELEMENTS.find((e) => e.id === a.element)?.label ?? "Adventure", title: `${a.type} in India`, summary: a.what });
}
