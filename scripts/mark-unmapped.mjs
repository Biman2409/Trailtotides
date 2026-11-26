// Finds where a trail runs with no mapped path under it, so the site can say exactly where:
// every 20 m of the line, the distance to the nearest walkable way OpenStreetMap has. Stretches
// of 150 m or more over 40 m from any way are "unmapped" (drawn along the terrain or from GPS
// tracks); gaps under 100 m between two of them join them into one.
// Writes, on each trail: unmapped [{ fromKm, toKm }] on the main line, on each side trip and
// detour, and approxKm (the main line's unmapped km, which the GPX and the trail panel quote).
// Called by build-trail.mjs before it saves; run on saved trails with
//   node scripts/mark-unmapped.mjs [<slug> ...]   (needs network: one Overpass query a trail)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { waysNear, dist } from "./osm.mjs";

const OFF = 40, MIN = 150, JOIN = 100;
// A reference GPS track a trek follows is given as guide points every 350–400 m, and the line
// between them is drawn along the terrain: within this of the guide points' chain counts as on it
const REF_OFF = 150;

/** [{ fromKm, toKm }] of `line` ([lat, lng, ...][]) away from every way in `ways` (and from every chain in `refs`, by REF_OFF) */
export function unmappedStretches(line, ways, refs = []) {
  const nearWay = nearness(ways, 0.001), nearRef = refs.length ? nearness(refs, 0.003) : () => Infinity;
  const off = (p) => nearWay(p) > OFF && nearRef(p) > REF_OFF;
  // The line every 20 m
  const pts = [];
  let km = 0;
  for (let i = 0; i < line.length; i++) {
    if (i) {
      const a = line[i - 1], b = line[i], d = dist(a, b), n = Math.max(1, Math.ceil(d / 20));
      for (let k = 1; k <= n; k++) pts.push({ p: [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n], km: (km + (d * k) / n) / 1000 });
      km += d;
    } else pts.push({ p: line[0], km: 0 });
  }
  const runs = [];
  for (let i = 0; i < pts.length; i++) {
    if (!off(pts[i].p)) continue;
    let j = i;
    while (j + 1 < pts.length && off(pts[j + 1].p)) j++;
    runs.push({ fromKm: pts[i].km, toKm: pts[j].km });
    i = j;
  }
  const joined = [];
  for (const r of runs) {
    const last = joined.at(-1);
    if (last && (r.fromKm - last.toKm) * 1000 < JOIN) last.toKm = r.toKm; else joined.push({ ...r });
  }
  return joined.filter((r) => (r.toKm - r.fromKm) * 1000 >= MIN).map((r) => ({ fromKm: +r.fromKm.toFixed(2), toKm: +r.toKm.toFixed(2) }));
}

/** How far a point is from the nearest segment of `ways`, via a grid of `cell` degrees */
function nearness(ways, cell) {
  const grid = new Map(), key = (la, lo) => `${Math.floor(la / cell)},${Math.floor(lo / cell)}`;
  for (const w of ways) for (let i = 1; i < w.length; i++) {
    const a = w[i - 1], b = w[i];
    const n = Math.max(1, Math.ceil(dist(a, b) / 80));
    for (let k = 0; k <= n; k++) { const la = a[0] + ((b[0] - a[0]) * k) / n, lo = a[1] + ((b[1] - a[1]) * k) / n; const g = key(la, lo); if (!grid.has(g)) grid.set(g, new Set()); grid.get(g).add(`${a[0]},${a[1]},${b[0]},${b[1]}`); }
  }
  const segDist = (p, s) => {
    const [a0, a1, b0, b1] = s.split(",").map(Number), k = Math.cos((p[0] * Math.PI) / 180);
    const dx = (b1 - a1) * k, dy = b0 - a0, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, (((p[1] - a1) * k) * dx + (p[0] - a0) * dy) / L)) : 0;
    return dist(p, [a0 + t * dy, a1 + (t * dx) / k]);
  };
  return (p) => {
    const [gy, gx] = [Math.floor(p[0] / cell), Math.floor(p[1] / cell)];
    let best = Infinity;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) for (const s of grid.get(`${gy + dy},${gx + dx}`) ?? []) best = Math.min(best, segDist(p, s));
    return best;
  };
}

const total = (s) => +s.reduce((n, r) => n + r.toKm - r.fromKm, 0).toFixed(1);

/** Marks the trail's main line, side trips and detours; returns the main line's unmapped km */
export async function markTrail(t) {
  const lines = [t.line, ...(t.sideTrips ?? []).map((s) => s.line), ...(t.detours ?? []).map((s) => s.line)];
  const all = lines.flat();
  const lat = all.map((p) => p[0]), lng = all.map((p) => p[1]);
  const ways = await waysNear([Math.min(...lat) - 0.005, Math.min(...lng) - 0.005, Math.max(...lat) + 0.005, Math.max(...lng) + 0.005]);
  // No ways at all means no data for the area, not a trail with no paths: don't mark it unmapped
  if (!ways.length) throw new Error("no map data for this area");
  // An uploaded GPS track a gap was drawn along (scripts/tracks/<slug>-km*.json) is tracking data too
  const tracksDir = new URL("./tracks/", import.meta.url);
  for (const f of readdirSync(tracksDir).filter((x) => x.startsWith(`${t.slug}-km`))) ways.push(JSON.parse(readFileSync(new URL(f, tracksDir), "utf8")));
  // and so is a recorded track a leg follows (a stop's `track` in trek-configs: Kareri, Chandrakhani)
  const { TREKS } = await import("./trek-configs.mjs");
  for (const s of TREKS[t.slug]?.stops ?? []) if (s?.track) ways.push(JSON.parse(readFileSync(new URL(`${s.track}.json`, tracksDir), "utf8")));
  // and so are the guide points read off a reference GPS track (a trek's `guide`), leg by leg
  const trek = TREKS[t.slug], refs = [];
  const at = (s) => (Array.isArray(s?.at) ? s.at : null);
  // A leg's stops join its chain only when they're as close to it as guide points are to each other:
  // a stop 2 km from the first guide point is a stretch the track doesn't cover
  const joins = (p, q) => p && q && dist(p, q) <= 500;
  // Guide points placed from the map rather than read off a track (`mapOnly`) aren't tracking data
  const mapOnly = new Set((trek?.mapOnly ?? []).map(([la, lo]) => `${la},${lo}`));
  (trek?.guide ?? []).forEach((g0, i) => { const g = (g0 ?? []).filter(([la, lo]) => !mapOnly.has(`${la},${lo}`)); const a = at(trek.stops[i]), b = at(trek.stops[i + 1]); if (g?.length) refs.push([...(joins(a, g[0]) ? [a] : []), ...g, ...(joins(b, g.at(-1)) ? [b] : [])]); });
  // and a gap closed from a reference track (`gapGuides`): its chain of guide points
  for (const chain of trek?.gapGuides ?? []) if (chain.length > 1) refs.push(chain);
  // and a side trip's guide points (its `guide`), joined to the summit when it's close
  for (const x of trek?.side ?? []) if (x?.guide?.length) refs.push([...x.guide, ...(x.at && dist(x.at, x.guide.at(-1)) <= 500 ? [x.at] : [])]);
  t.unmapped = unmappedStretches(t.line, ways, refs);
  t.approxKm = total(t.unmapped);
  for (const s of [...(t.sideTrips ?? []), ...(t.detours ?? [])]) { s.unmapped = unmappedStretches(s.line, ways, refs); s.approxKm = total(s.unmapped); }
  return t.approxKm;
}

// Run directly (not imported by build-trail.mjs)
if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/mark-unmapped.mjs")) {
  const DIR = "src/lib/trails/";
  const args = process.argv.slice(2);
  const slugs = args.length ? args : readdirSync(DIR).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
  for (const slug of slugs) {
    const t = JSON.parse(readFileSync(`${DIR}${slug}.json`, "utf8"));
    const before = t.approxKm ?? 0;
    try {
      await markTrail(t);
      writeFileSync(`${DIR}${slug}.json`, JSON.stringify(t));
      const extra = [...(t.sideTrips ?? []), ...(t.detours ?? [])].filter((s) => s.unmapped.length).map((s) => `${s.name ?? `${s.from}→${s.to}`} ${s.approxKm} km`);
      console.log(`${slug}: ${t.unmapped.length} unmapped stretch(es), ${t.approxKm} km (was declared ${before} km)${t.unmapped.length ? ": " + t.unmapped.map((r) => `km ${r.fromKm}–${r.toKm}`).join(", ") : ""}${extra.length ? ` | side/detours: ${extra.join(", ")}` : ""}`);
    } catch (e) { console.error(`${slug}: FAILED ${e.message}`); }
  }
}
