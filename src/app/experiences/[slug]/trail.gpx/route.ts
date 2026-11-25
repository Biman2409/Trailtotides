import { adventures } from "@/lib/data";
import { getTrail, TRAIL_SLUGS, lineBetweenKm, NO_TRACK, NO_TRACK_NOTE, stretchPlace, trailDriveKm, trailWalkKm, type TrailStretch } from "@/lib/trails";

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

  // The main route: one track, or for a circuit of treks joined by road, a track per stretch, each
  // marked on foot or by road (a GPS app can then show the drives differently, or skip them)
  const mainTrks = (() => {
    if (!trail.drives?.length) return `  <trk>
    <name>${esc(adventure.name)}</name>
    <desc>${esc(`The main route, ${trail.lengthKm} km one way.${unmappedText}`)}</desc>
    <trkseg>
${pts(trail.line)}
    </trkseg>
  </trk>`;
    const r = Math.PI / 180, cum = [0];
    for (let i = 1; i < trail.line.length; i++) {
      const [a, b] = [trail.line[i - 1], trail.line[i]];
      const h = Math.sin(((b[0] - a[0]) * r) / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(((b[1] - a[1]) * r) / 2) ** 2;
      cum.push(cum[i - 1] + 2 * 6371 * Math.asin(Math.sqrt(h)));
    }
    // Split points: every drive's start and end, so the line alternates foot, road, foot…
    const marks = [0, ...trail.drives.flatMap((d) => [d.fromKm, d.toKm]), cum[cum.length - 1]].filter((k, i, a) => !i || k > a[i - 1] + 0.01);
    const out: string[] = [];
    for (let m = 0; m < marks.length - 1; m++) {
      const lo = marks[m], hi = marks[m + 1];
      const seg = trail.line.filter((_, i) => cum[i] >= lo - 1e-6 && cum[i] <= hi + 1e-6);
      if (seg.length < 2) continue;
      const drive = trail.drives.find((d) => Math.abs(d.fromKm - lo) < 0.02 && Math.abs(d.toKm - hi) < 0.02);
      // A walk runs from where the last drive ended to where the next one starts; when that's the
      // same place it went out and back, to its highest stop
      const before = [...trail.drives].reverse().find((d) => d.toKm <= lo + 0.02), after = trail.drives.find((d) => d.fromKm >= hi - 0.02);
      const from = drive?.from ?? before?.to ?? trail.stops[0].name, to = drive?.to ?? after?.from ?? trail.stops[trail.stops.length - 1].name;
      const top = trail.stops.filter((s) => s.km > lo && s.km < hi).reduce<(typeof trail.stops)[number] | null>((a, s) => (!a || (s.ele ?? 0) > (a.ele ?? 0) ? s : a), null);
      const walkName = from === to && top ? `${from} to ${top.name} and back` : `${from} to ${to}`;
      out.push(`  <trk>
    <name>${esc(drive ? `By road: ${from} to ${to}` : `On foot: ${walkName}`)}</name>
    <desc>${esc(drive ? `By road, ${Math.round(hi - lo)} km (a road route computed by BRouter, not walked).` : `On foot, ${(hi - lo).toFixed(1)} km.`)}</desc>
    <type>${drive ? "Drive" : "Hike"}</type>
    <trkseg>
${pts(seg)}
    </trkseg>
  </trk>`);
    }
    return out.join("\n");
  })();

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Trail to Tides" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${esc(adventure.name)}</name>
    <desc>${esc(`${trail.drives?.length ? `A circuit of ${trailWalkKm(trail)} km on foot and ${trailDriveKm(trail)} km by road from ${trail.stops[0].name}, as separate tracks marked Hike and Drive` : `${trail.lengthKm} km one way from ${trail.stops[0].name}`}${(trail.sideTrips ?? []).length ? `, plus ${trail.sideTrips!.length === 1 ? "a side trip" : `${trail.sideTrips!.length} side trips`} (${trail.sideTrips!.map((s) => s.name).join(", ")}) as separate tracks` : ""}. A planned route computed from OpenStreetMap paths (BRouter), not a recorded GPS track.${unmappedText} Check the route with your operator: paths change after landslides and snow.`)}</desc>
    <copyright author="OpenStreetMap contributors"><license>https://opendatacommons.org/licenses/odbl/</license></copyright>
    <link href="${page}"><text>Trail to Tides</text></link>
  </metadata>
${trail.stops.map((s, i) => wpt(s, i === 0 ? "Start" : `Km ${s.km} from ${trail.stops[0].name}`)).join("\n")}
${trail.side.map((s) => wpt(s, "Side trip")).join("\n")}
${ends.join("\n")}
${mainTrks}
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
