import { getTrail, TRAIL_SLUGS } from "@/lib/trails";

// One trail as JSON (/trails/<slug>.json), for the Adventure Map to draw when an adventure is
// opened. Built at deploy time, so it's a static file served from the CDN.

export const dynamic = "force-static";

export function generateStaticParams() {
  return TRAIL_SLUGS.map((slug) => ({ file: `${slug}.json` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const trail = file.endsWith(".json") ? getTrail(file.slice(0, -5)) : null;
  if (!trail) return Response.json({ error: "No trail" }, { status: 404 });
  return Response.json(trail, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
