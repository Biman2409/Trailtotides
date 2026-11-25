// For each stretch of a trail with no tracking data (unmapped, see scripts/mark-unmapped.mjs),
// looks through the GPS tracks fetched for research (research/ultrajourneys/tracks, GPX or KML)
// for one that walks it: passes within 150 m of both ends. For a match it says how far our
// straight line is from the track (median and worst, metres) and which post it came from, with
// that post's licence note, so the line can be checked or steered (through points), never copied
// unless the licence allows. Writes nothing; prints one line per gap as JSON.
// Run: node scripts/research/compare-gap-tracks.mjs [<slug> ...]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { lineBetweenKm } from "../trail-geo.mjs";

const dist = ([la1, lo1], [la2, lo2]) => { const R = 6371000, r = Math.PI / 180; const h = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const UJ = "research/ultrajourneys";

// Every fetched track, as ordered [lat, lng] pieces, with the post it came from
const idx = existsSync(`${UJ}/index.json`) ? JSON.parse(readFileSync(`${UJ}/index.json`, "utf8")) : {};
const index = Array.isArray(idx) ? idx : idx.posts ?? [];
const postOf = (file) => index.find((p) => JSON.stringify(p).includes(file));
const tracks = [];
for (const f of existsSync(`${UJ}/tracks`) ? readdirSync(`${UJ}/tracks`) : []) {
  const s = readFileSync(`${UJ}/tracks/${f}`, "utf8");
  const pieces = [];
  if (/\.gpx$/i.test(f)) for (const seg of s.split(/<trkseg>|<rte>/).slice(1)) pieces.push([...seg.matchAll(/<(?:trkpt|rtept)[^>]*lat="([-\d.]+)"[^>]*lon="([-\d.]+)"/g)].map((m) => [+m[1], +m[2]]));
  else if (/\.kml$/i.test(f)) for (const m of s.matchAll(/<coordinates>([\s\S]*?)<\/coordinates>/g)) pieces.push(m[1].trim().split(/\s+/).map((c) => c.split(",").map(Number)).filter((c) => c.length >= 2).map(([lo, la]) => [la, lo]));
  for (const pts of pieces) if (pts.length > 2) tracks.push({ file: f, pts });
}

const DIR = "src/lib/trails/";
const args = process.argv.slice(2);
const slugs = args.length ? args : readdirSync(DIR).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
for (const slug of slugs) {
  const t = JSON.parse(readFileSync(`${DIR}${slug}.json`, "utf8"));
  const lines = [{ label: "main", line: t.line, gaps: t.unmapped ?? [] }, ...[...(t.sideTrips ?? []), ...(t.detours ?? [])].map((s) => ({ label: s.name ?? `${s.from}→${s.to}`, line: s.line, gaps: s.unmapped ?? [] }))];
  for (const { label, line, gaps } of lines) for (const g of gaps) {
    const seg = lineBetweenKm(line, g.fromKm, g.toKm);
    if (seg.length < 2) continue;
    const a = seg[0], b = seg[seg.length - 1];
    let best = null;
    for (const tr of tracks) {
      const ia = tr.pts.reduce((bi, p, i) => (dist(p, a) < dist(tr.pts[bi], a) ? i : bi), 0);
      const ib = tr.pts.reduce((bi, p, i) => (dist(p, b) < dist(tr.pts[bi], b) ? i : bi), 0);
      const offA = dist(tr.pts[ia], a), offB = dist(tr.pts[ib], b);
      if (offA > 150 || offB > 150 || ia === ib) continue;
      const part = ia < ib ? tr.pts.slice(ia, ib + 1) : tr.pts.slice(ib, ia + 1).reverse();
      // How far the track strays from our straight line: each track point to the segment a–b
      const k = Math.cos((a[0] * Math.PI) / 180);
      const off = part.map((p) => { const dx = (b[1] - a[1]) * k, dy = b[0] - a[0], L = dx * dx + dy * dy; const tt = L ? Math.max(0, Math.min(1, (((p[1] - a[1]) * k) * dx + (p[0] - a[0]) * dy) / L)) : 0; return dist(p, [a[0] + tt * dy, a[1] + (tt * dx) / k]); }).sort((x, y) => x - y);
      const r = { file: tr.file, ends: Math.round(Math.max(offA, offB)), median: Math.round(off[off.length >> 1]), worst: Math.round(off[off.length - 1]), points: part.length };
      if (!best || r.ends < best.ends) best = r;
    }
    const post = best && postOf(best.file);
    console.log(JSON.stringify({ slug, line: label, fromKm: g.fromKm, toKm: g.toKm, track: best, post: post ? { url: post.url, licence: (post.licence ?? []).join(" / ") || null } : null }));
  }
}
console.error(`${tracks.length} track pieces from ${new Set(tracks.map((t) => t.file)).size} files`);
