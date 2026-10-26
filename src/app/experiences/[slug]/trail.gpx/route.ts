import { adventures } from "@/lib/data";
import { getTrail, TRAIL_SLUGS } from "@/lib/trails";

// The trail as a GPX file, for phone map apps (Organic Maps, OsmAnd, Gaia) that navigate offline.
// Stops are waypoints; the walking line is a track. Built at deploy time, one file per trail.

export const dynamic = "force-static";

export function generateStaticParams() {
  return TRAIL_SLUGS.map((slug) => ({ slug }));
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trail = getTrail(slug);
  const adventure = adventures.find((a) => a.slug === slug);
  if (!trail || !adventure) return new Response("No trail for this adventure", { status: 404 });

  const page = `https://www.trailtotides.com/experiences/${slug}`;
  const wpt = (p: { lat: number; lng: number; ele: number | null; name: string }, desc: string) =>
    `  <wpt lat="${p.lat}" lon="${p.lng}">${p.ele != null ? `<ele>${p.ele}</ele>` : ""}<name>${esc(p.name)}</name><desc>${esc(desc)}</desc></wpt>`;

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Trail to Tides" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${esc(adventure.name)}</name>
    <desc>${esc(`${trail.lengthKm} km one way from ${trail.stops[0].name}. Check the route with your operator: paths change after landslides and snow.`)}</desc>
    <copyright author="OpenStreetMap contributors"><license>https://opendatacommons.org/licenses/odbl/</license></copyright>
    <link href="${page}"><text>Trail to Tides</text></link>
  </metadata>
${trail.stops.map((s, i) => wpt(s, i === 0 ? "Start" : `Km ${s.km} from ${trail.stops[0].name}`)).join("\n")}
${trail.side.map((s) => wpt(s, "Side trip")).join("\n")}
  <trk>
    <name>${esc(adventure.name)}</name>
    <trkseg>
${trail.line.map(([lat, lng, ele]) => `      <trkpt lat="${lat}" lon="${lng}"><ele>${ele}</ele></trkpt>`).join("\n")}
    </trkseg>
  </trk>
</gpx>
`;

  return new Response(gpx, {
    headers: {
      "Content-Type": "application/gpx+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-trail-to-tides.gpx"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
