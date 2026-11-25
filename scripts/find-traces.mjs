// For each unmapped stretch of a trail (marked by scripts/mark-unmapped.mjs), looks for a GPS
// track people have uploaded to OpenStreetMap (public traces, ODbL) that walks it: one that passes
// within 80 m of both ends of the stretch. A match is saved to scripts/tracks/<slug>-km<from>.json
// ([lat, lng] in walking order) for the builder to follow, and listed; no match is listed too.
// Run: node scripts/find-traces.mjs [<slug> ...]   (needs network; ~1 s a request)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { lineBetweenKm } from "./trail-geo.mjs";

const UA = { "User-Agent": process.env.MAP_CONTACT ? `trail-builder/1.0 (${process.env.MAP_CONTACT})` : "trail-builder/1.0" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dist = ([la1, lo1], [la2, lo2]) => { const R = 6371000, r = Math.PI / 180; const h = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };

// Uploaded traces in a box: identifiable ones come as separate tracks with their points in order
async function traces([s, w, n, e]) {
  const out = [];
  for (let page = 0; page < 5; page++) {
    const url = `https://api.openstreetmap.org/api/0.6/trackpoints?bbox=${w.toFixed(4)},${s.toFixed(4)},${e.toFixed(4)},${n.toFixed(4)}&page=${page}`;
    const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`OSM ${res.status}`);
    const xml = await res.text();
    await sleep(1000);
    let count = 0;
    for (const trk of xml.split("<trk>").slice(1)) {
      const name = trk.match(/<url>([^<]+)<\/url>/)?.[1] ?? trk.match(/<name>([^<]+)<\/name>/)?.[1] ?? "anonymous";
      for (const seg of trk.split("<trkseg>").slice(1)) {
        const pts = [...seg.matchAll(/<trkpt lat="([-\d.]+)" lon="([-\d.]+)"/g)].map((m) => [+m[1], +m[2]]);
        count += pts.length;
        if (pts.length > 1) out.push({ name, pts, ordered: !/anonymous/.test(name) });
      }
    }
    if (count < 5000) break;
  }
  return out;
}

const DIR = "src/lib/trails/";
const args = process.argv.slice(2);
const slugs = args.length ? args : readdirSync(DIR).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
for (const slug of slugs) {
  const t = JSON.parse(readFileSync(`${DIR}${slug}.json`, "utf8"));
  for (const u of t.unmapped ?? []) {
    const seg = lineBetweenKm(t.line, u.fromKm, u.toKm);
    if (seg.length < 2) continue;
    const a = seg[0], b = seg[seg.length - 1];
    const lat = seg.map((p) => p[0]), lng = seg.map((p) => p[1]);
    const box = [Math.min(...lat) - 0.004, Math.min(...lng) - 0.004, Math.max(...lat) + 0.004, Math.max(...lng) + 0.004];
    let found = null, seen = 0;
    try {
      for (const tr of await traces(box)) {
        seen++;
        if (!tr.ordered) continue;
        const ia = tr.pts.reduce((bi, p, i) => (dist(p, a) < dist(tr.pts[bi], a) ? i : bi), 0);
        const ib = tr.pts.reduce((bi, p, i) => (dist(p, b) < dist(tr.pts[bi], b) ? i : bi), 0);
        if (dist(tr.pts[ia], a) > 80 || dist(tr.pts[ib], b) > 80 || ia === ib) continue;
        const part = ia < ib ? tr.pts.slice(ia, ib + 1) : tr.pts.slice(ib, ia + 1).reverse();
        found = { name: tr.name, part };
        break;
      }
    } catch (e) { console.log(`${slug} km ${u.fromKm}–${u.toKm}: FAILED ${e.message}`); continue; }
    if (found) {
      const file = `${slug}-km${u.fromKm.toFixed(1)}`;
      writeFileSync(`scripts/tracks/${file}.json`, JSON.stringify(found.part.map(([la, lo]) => [+la.toFixed(5), +lo.toFixed(5)])));
      console.log(`${slug} km ${u.fromKm}–${u.toKm}: FOUND an uploaded GPS track (${found.name}), ${found.part.length} points → scripts/tracks/${file}.json`);
    } else console.log(`${slug} km ${u.fromKm}–${u.toKm}: no uploaded GPS track walks it (${seen} track pieces nearby)`);
  }
}
