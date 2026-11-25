import { adventures } from "@/lib/data";
import { getTrail, TRAIL_SLUGS, lineBetweenKm, NO_TRACK, NO_TRACK_NOTE, stretchPlace, type TrailStretch } from "@/lib/trails";

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

  const pts = (line: [number, number, number][]) => line.map(([lat, lng, ele]) => `      <trkpt lat="${lat}" lon="${lng}"><ele>${ele}</ele></trkpt>`).join("\n");
  // Stretches with no mapped path or GPS track: named in the description, marked where they start and end
  const unmapped = trail.unmapped ?? [];
  const where = (u: TrailStretch) => `km ${u.fromKm.toFixed(1)}–${u.toKm.toFixed(1)} ${stretchPlace(trail, u)}`;
  const unmappedText = unmapped.length
    ? ` ${NO_TRACK}: ${unmapped.map(where).join("; ")}. ${NO_TRACK_NOTE}`
    : "";
  const ends = unmapped.flatMap((u) => {
    const seg = lineBetweenKm(trail.line, u.fromKm, u.toKm);
    if (seg.length < 2) return [];
    const note = `${NO_TRACK} (${where(u)}). ${NO_TRACK_NOTE}`;
    return [
      wpt({ lat: seg[0][0], lng: seg[0][1], ele: null, name: `No tracking data from here (km ${u.fromKm.toFixed(1)})` }, note),
      wpt({ lat: seg[seg.length - 1][0], lng: seg[seg.length - 1][1], ele: null, name: `Tracking data resumes (km ${u.toKm.toFixed(1)})` }, note),
    ];
  });
  const sideTrks = (trail.sideTrips ?? []).map((s) => `  <trk>
    <name>${esc(`Side trip: ${s.name}`)}</name>
    <desc>${esc(`A side trip, out and back from ${s.from}: ${s.km} km each way${s.ele != null ? ` to ${s.ele} m` : ""}.${(s.unmapped ?? []).length ? ` ${NO_TRACK}, drawn straight: ${s.unmapped!.map((u) => `km ${u.fromKm.toFixed(1)}–${u.toKm.toFixed(1)} from ${s.from}`).join("; ")}.` : ""}`)}</desc>
    <type>Side trip</type>
    <trkseg>
${pts(s.line)}
    </trkseg>
  </trk>`);
  const detourTrks = (trail.detours ?? []).map((s) => `  <trk>
    <name>${esc(`${s.from} to ${s.to}`)}</name>
    <desc>${esc(`Part of the trek: the day from ${s.from} to ${s.to} goes this way, not back along the main track (${s.km} km).${(s.unmapped ?? []).length ? ` ${NO_TRACK}, drawn straight: ${s.unmapped!.map((u) => `km ${u.fromKm.toFixed(1)}–${u.toKm.toFixed(1)} from ${s.from}`).join("; ")}.` : ""}`)}</desc>
    <trkseg>
${pts(s.line)}
    </trkseg>
  </trk>`);

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Trail to Tides" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${esc(adventure.name)}</name>
    <desc>${esc(`${trail.lengthKm} km one way from ${trail.stops[0].name}${(trail.sideTrips ?? []).length ? `, plus ${trail.sideTrips!.length === 1 ? "a side trip" : `${trail.sideTrips!.length} side trips`} (${trail.sideTrips!.map((s) => s.name).join(", ")}) as separate tracks` : ""}. A planned route computed from OpenStreetMap paths (BRouter), not a recorded GPS track.${unmappedText} Check the route with your operator: paths change after landslides and snow.`)}</desc>
    <copyright author="OpenStreetMap contributors"><license>https://opendatacommons.org/licenses/odbl/</license></copyright>
    <link href="${page}"><text>Trail to Tides</text></link>
  </metadata>
${trail.stops.map((s, i) => wpt(s, i === 0 ? "Start" : `Km ${s.km} from ${trail.stops[0].name}`)).join("\n")}
${trail.side.map((s) => wpt(s, "Side trip")).join("\n")}
${ends.join("\n")}
  <trk>
    <name>${esc(adventure.name)}</name>
    <desc>${esc(`The main route, ${trail.lengthKm} km one way.${unmappedText}`)}</desc>
    <trkseg>
${pts(trail.line)}
    </trkseg>
  </trk>
${[...sideTrks, ...detourTrks].join("\n")}
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
