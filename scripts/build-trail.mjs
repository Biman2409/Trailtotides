// Builds a trek's trail from OpenStreetMap into src/lib/trails/<slug>.json:
//   stops   each overnight stop, placed by Nominatim (OSM's place search), with its height and
//           how far along the trail it is
//   line    the walking path between them, routed along OSM's paths by BRouter (hiking profile),
//           thinned to ~10 m accuracy so pages load it quickly
//   side    side trips that aren't on the way (summit viewpoints), as points only
//   days    the day-by-day itinerary: where each day walks from and to, distance, metres up and
//           down (measured along the line), and where you sleep
// The data is OpenStreetMap's (ODbL): anything that shows it must credit OpenStreetMap.
// Remote campsites are often missing from OpenStreetMap, so a stop can carry its own coordinates
// (`at`), and a stretch with no mapped path is drawn straight with heights from Open-Meteo's
// elevation model; those stretches are counted in `approxKm`.
// Run: node scripts/build-trail.mjs <slug> [<slug> ...]   or   all
// The stops and days for each trek are in ./trek-configs.mjs. Rewrites src/lib/trails/index.ts.

import { writeFile, readFile, readdir, mkdir } from "node:fs/promises";
import { TREKS } from "./trek-configs.mjs";

const UA = { "User-Agent": "TrailToTides/1.0 (hello@trailtotides.com)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Each adventure's own map point, to keep place searches inside its region
const DATA = await readFile("src/lib/data.ts", "utf8");
function centre(slug) {
  const at = DATA.indexOf(`slug: "${slug}"`);
  const b = DATA.slice(at, at + 6000);
  return [+b.match(/\blat: (-?[0-9.]+)/)[1], +b.match(/\blng: (-?[0-9.]+)/)[1]];
}

// Metres between two [lat, lng] points
function dist([la1, lo1], [la2, lo2]) {
  const R = 6371000, toRad = Math.PI / 180;
  const dLa = (la2 - la1) * toRad, dLo = (lo2 - lo1) * toRad;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * toRad) * Math.cos(la2 * toRad) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Heights from Open-Meteo's elevation model, 100 points a request
async function heights(pts) {
  const out = [];
  for (let i = 0; i < pts.length; i += 100) {
    const part = pts.slice(i, i + 100);
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${part.map((p) => p[0]).join(",")}&longitude=${part.map((p) => p[1]).join(",")}`;
    const j = await fetch(url).then((r) => r.json());
    out.push(...j.elevation.map((e) => Math.round(e)));
  }
  return out;
}

const found = new Map();
async function place(stop, trek) {
  const s = typeof stop === "string" ? { name: stop } : stop;
  if (found.has(s.name)) return found.get(s.name);
  const [cla, clo] = trek.centre;
  const box = `&viewbox=${clo - 0.8},${cla + 0.8},${clo + 0.8},${cla - 0.8}&bounded=1`;
  let hit = null;
  for (const q of [`${s.q ?? s.name}, ${trek.near}`, s.q ?? s.name]) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&extratags=1${box}`;
    // A path or stream named "A to B" sits between places, not at one
    [hit] = (await fetch(url, { headers: UA }).then((r) => r.json())).filter((h) => !["highway", "waterway", "boundary"].includes(h.class));
    await sleep(1100); // Nominatim allows one request a second
    if (hit) break;
  }
  // Given coordinates are approximate; a mapped place close to them is more exact, one far
  // away is a different place with the same name. A hit on a place already used for another
  // stop is the search falling back to a looser match
  if (hit && s.at && dist([+hit.lat, +hit.lon], s.at) > 2000) hit = null;
  if (hit && [...found.values()].some((p) => dist([p.lat, p.lng], [+hit.lat, +hit.lon]) < 300)) hit = null;
  let p;
  if (hit) p = { name: s.name, lat: +(+hit.lat).toFixed(5), lng: +(+hit.lon).toFixed(5), ele: hit.extratags?.ele ? Math.round(+hit.extratags.ele) : null, from: "osm" };
  else if (s.at) p = { name: s.name, lat: s.at[0], lng: s.at[1], ele: s.ele ?? null, from: "given" };
  else throw new Error(`Couldn't find "${s.name}" in OpenStreetMap: give it coordinates (at)`);
  if (p.ele == null) p.ele = (await heights([[p.lat, p.lng]]))[0];
  found.set(s.name, p);
  return p;
}

async function leg(a, b) {
  const straight = dist([a.lat, a.lng], [b.lat, b.lng]);
  try {
    const url = `https://brouter.de/brouter?lonlats=${a.lng},${a.lat}|${b.lng},${b.lat}&profile=hiking-mountain&alternativeidx=0&format=geojson`;
    const res = await fetch(url, { headers: UA });
    const text = await res.text();
    await sleep(1500);
    if (!res.ok || !text.startsWith("{")) throw new Error(text.slice(0, 80).replace(/\s+/g, " "));
    const coords = JSON.parse(text).features[0].geometry.coordinates.map(([lng, lat, ele]) => [lat, lng, Math.round(ele)]);
    let len = 0;
    for (let i = 1; i < coords.length; i++) len += dist(coords[i - 1], coords[i]);
    // A path that wanders far from the stops means the real one isn't mapped: the router has
    // found a long way round by road, or snapped to a path in the next valley
    const offA = dist(coords[0], [a.lat, a.lng]), offB = dist(coords[coords.length - 1], [b.lat, b.lng]);
    if (len > Math.max(3 * straight, straight + 8000)) throw new Error(`a ${(len / 1000).toFixed(1)} km detour for ${(straight / 1000).toFixed(1)} km`);
    if (offA > 1500 || offB > 1500) throw new Error(`nearest path is ${Math.round(Math.max(offA, offB))} m away`);
    return { coords, approxKm: 0 };
  } catch (e) {
    console.warn(`  ! ${a.name} → ${b.name}: ${e.message}; drawn straight`);
    const n = Math.max(2, Math.ceil(straight / 100));
    const pts = Array.from({ length: n + 1 }, (_, i) => [a.lat + ((b.lat - a.lat) * i) / n, a.lng + ((b.lng - a.lng) * i) / n]);
    const ele = await heights(pts);
    return { coords: pts.map((p, i) => [p[0], p[1], ele[i]]), approxKm: straight / 1000 };
  }
}

// Douglas–Peucker on a local flat projection: keeps the shape within `tol` metres
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const k = Math.cos((pts[0][0] * Math.PI) / 180) * 111320;
  const xy = pts.map(([la, lo]) => [lo * k, la * 110540]);
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    const [x1, y1] = xy[s], [x2, y2] = xy[e];
    const len = Math.hypot(x2 - x1, y2 - y1);
    let max = 0, at = -1;
    for (let i = s + 1; i < e; i++) {
      // A loop starts and ends at one point: measure from that point instead of a line
      const d = len < 1 ? Math.hypot(xy[i][0] - x1, xy[i][1] - y1) : Math.abs((x2 - x1) * (y1 - xy[i][1]) - (x1 - xy[i][0]) * (y2 - y1)) / len;
      if (d > max) { max = d; at = i; }
    }
    if (max > tol) { keep[at] = 1; stack.push([s, at], [at, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}

async function build(slug) {
  const trek = { ...TREKS[slug], centre: TREKS[slug].centre ?? centre(slug) };
  found.clear();
  const name = (s) => (typeof s === "string" ? s : s.name);

  const stops = [];
  for (const s of trek.stops) stops.push({ ...(await place(s, trek)) });
  // A stop far from the one before is a different place with the same name
  stops.forEach((s, i) => {
    const gap = i ? dist([stops[i - 1].lat, stops[i - 1].lng], [s.lat, s.lng]) : 0;
    if (gap > 25000) throw new Error(`${s.name} is ${Math.round(gap / 1000)} km from ${stops[i - 1].name}: give it coordinates (at)`);
  });
  const side = [];
  for (const s of trek.side ?? []) side.push(await place(s, trek));
  for (const s of trek.extra ?? []) await place(s, trek);

  // The line, leg by leg; each stop's position on it is where its leg starts or ends
  let full = [];
  let approxKm = 0;
  const at = [0];
  for (let i = 0; i < stops.length - 1; i++) {
    const l = await leg(stops[i], stops[i + 1]);
    approxKm += l.approxKm;
    full = full.concat(i === 0 ? l.coords : l.coords.slice(1));
    at.push(full.length - 1);
  }

  // The router starts and ends on the nearest mapped path, which can be a little off the village
  // point; join the ends to the first and last stop so the line meets its pins
  const first = stops[0], last = stops[stops.length - 1];
  if (dist(full[0], [first.lat, first.lng]) > 20) { full.unshift([first.lat, first.lng, first.ele ?? full[0][2]]); at.forEach((v, i) => (at[i] = i ? v + 1 : 0)); }
  if (dist(full[full.length - 1], [last.lat, last.lng]) > 20) { full.push([last.lat, last.lng, last.ele ?? full[full.length - 1][2]]); at[at.length - 1] = full.length - 1; }

  const cum = [0];
  for (let i = 1; i < full.length; i++) cum.push(cum[i - 1] + dist(full[i - 1], full[i]));
  stops.forEach((s, i) => { s.km = +(cum[at[i]] / 1000).toFixed(1); });

  // The elevation model throws single-point spikes, hundreds of metres off, where a path runs
  // under a cliff or along a gorge. A height more than 120 m from the median of its ±250 m of
  // trail takes that median; stops keep the heights OpenStreetMap surveys give them
  const pinned = new Set(at.filter((k) => stops.some((s) => s.ele != null && dist(full[k], [s.lat, s.lng]) < 30)));
  const raw = full.map((p) => p[2]);
  full.forEach((p, i) => {
    if (pinned.has(i)) return;
    const near = [];
    for (let k = i; k >= 0 && cum[i] - cum[k] <= 250; k--) near.push(raw[k]);
    for (let k = i + 1; k < full.length && cum[k] - cum[i] <= 250; k++) near.push(raw[k]);
    if (near.length < 4) return;
    near.sort((a, b) => a - b);
    const median = near[near.length >> 1];
    if (Math.abs(raw[i] - median) > 120) p[2] = median;
  });

  // Camps the map doesn't have, placed a typical share of the way along the trail between two
  // mapped stops. Their position is an estimate, so days that reach them are marked approximate
  const estimated = new Set();
  for (const [campName, [a, b, frac]] of Object.entries(trek.camps ?? {})) {
    const ia = stops.findIndex((s) => s.name === a);
    const ib = stops.findIndex((s, i) => i > ia && s.name === b);
    if (ia < 0 || ib < 0) throw new Error(`Camp ${campName}: ${a} and ${b} must be stops in that order`);
    const target = cum[at[ia]] + frac * (cum[at[ib]] - cum[at[ia]]);
    let k = at[ia];
    while (k < at[ib] && cum[k] < target) k++;
    found.set(campName, { name: campName, lat: +full[k][0].toFixed(5), lng: +full[k][1].toFixed(5), ele: full[k][2], from: "estimated" });
    estimated.add(campName);
  }

  // ── Itinerary ──────────────────────────────────────────────────────────────
  // Each day's distance and climb are measured along the line between the nearest line points to
  // where it starts and ends. The search looks ahead of where the last day ended first, so loops
  // that pass a place twice count the right visit; return days fall back to the whole line.
  const nearestIdx = (p, from = 0) => {
    const look = (lo) => {
      let best = lo, bestD = Infinity;
      for (let i = lo; i < full.length; i++) { const d = dist(full[i], [p.lat, p.lng]); if (d < bestD) { bestD = d; best = i; } }
      return { i: best, off: bestD };
    };
    const ahead = look(from);
    return ahead.off <= 300 || from === 0 ? ahead : look(0);
  };
  // The elevation model is noisy where a path hugs a steep valley side, so heights are averaged
  // over ±150 m of trail first; climbs then count only changes of 15 m or more
  const smooth = full.map((_, i) => {
    let s = 0, n = 0;
    for (let k = i; k >= 0 && cum[i] - cum[k] <= 150; k--) { s += full[k][2]; n++; }
    for (let k = i + 1; k < full.length && cum[k] - cum[i] <= 150; k++) { s += full[k][2]; n++; }
    return s / n;
  });
  function stretch(a, b) {
    const step = a <= b ? 1 : -1;
    let up = 0, down = 0, ref = smooth[a];
    for (let k = a + step; step > 0 ? k <= b : k >= b; k += step) {
      const d = smooth[k] - ref;
      if (d >= 15) { up += d; ref = smooth[k]; } else if (d <= -15) { down -= d; ref = smooth[k]; }
    }
    return { km: Math.abs(cum[b] - cum[a]) / 1000, up, down };
  }

  const days = [];
  let here = found.get(name(trek.stops[0]));
  let hereIdx = 0;
  (trek.days ?? []).forEach((d, n) => {
    const day = n + 1;
    if (d.rest) { days.push({ day, kind: "rest", from: here.name, to: here.name, sleepEle: here.ele, note: d.rest }); return; }
    if (d.travel) { days.push({ day, kind: "travel", from: here.name, to: null, sleepEle: null, note: d.travel }); return; }
    const route = [...(d.via ?? []), d.to].map((v) => found.get(v));
    if (route.some((p) => !p)) throw new Error(`Day ${day}: unknown place in ${JSON.stringify(d)}`);
    let km = 0, up = 0, down = 0, approx = false, idx = hereIdx;
    for (const p of route) {
      const B = nearestIdx(p, idx);
      approx ||= B.off > 300 || estimated.has(p.name);
      const s = stretch(idx, B.i);
      km += s.km; up += s.up; down += s.down;
      idx = B.i;
    }
    if (d.side) { km += d.side.km; up += d.side.up; down += d.side.up; }
    const to = found.get(d.to);
    days.push({
      day, kind: "walk", from: here.name, to: to.name, via: [...(d.via ?? []), ...(d.side ? [d.side.name] : [])],
      km: +km.toFixed(1), up: Math.round(up / 10) * 10, down: Math.round(down / 10) * 10, approx,
      sleepEle: to.ele, note: d.note ?? "",
    });
    here = to;
    hereIdx = idx;
  });
  const sleepPlaces = [...new Map(days.filter((d) => d.to).map((d) => [d.to, found.get(d.to)])).values()]
    .map(({ name, lat, lng, ele }) => ({ name, lat, lng, ele }));

  const line = simplify(full, 10).map(([la, lo, e]) => [+la.toFixed(5), +lo.toFixed(5), e]);
  const strip = ({ name, lat, lng, ele, km }) => (km == null ? { name, lat, lng, ele } : { name, lat, lng, ele, km });
  const trail = {
    slug,
    source: "© OpenStreetMap contributors (ODbL); route by BRouter",
    builtAt: new Date().toISOString().slice(0, 10),
    lengthKm: +(cum[cum.length - 1] / 1000).toFixed(1),
    ascentM: Math.round(stretch(0, full.length - 1).up / 10) * 10, // smoothed, like the daily figures
    maxEleM: Math.max(...full.map((p) => p[2])),
    approxKm: +approxKm.toFixed(1),
    stops: stops.map(strip),
    side: side.map(strip),
    days,
    sleepPlaces,
    line,
  };

  await mkdir("src/lib/trails", { recursive: true });
  await writeFile(`src/lib/trails/${slug}.json`, JSON.stringify(trail));
  console.log(`${slug}: ${trail.lengthKm} km, +${trail.ascentM} m, highest ${trail.maxEleM} m, ${trail.approxKm} km drawn straight, ${full.length} → ${line.length} points`);
  stops.forEach((s, i) => {
    const gap = i ? (dist([stops[i - 1].lat, stops[i - 1].lng], [s.lat, s.lng]) / 1000).toFixed(1) : "";
    console.log(`  km ${String(s.km).padStart(5)}  ${s.name} (${s.ele} m, ${s.from}, ${s.lat},${s.lng})${gap ? `  ${gap} km from last` : ""}`);
  });
  for (const s of side) console.log(`  side trip: ${s.name} (${s.ele} m, ${s.from})`);
  for (const n of estimated) { const p = found.get(n); console.log(`  camp (estimated): ${n} (${p.ele} m, ${p.lat},${p.lng})`); }
  for (const d of days) console.log(`  day ${String(d.day).padStart(2)} ${d.kind.padEnd(6)} ${d.from} → ${d.to ?? ""}${d.km != null ? `  ${d.km} km +${d.up} −${d.down}${d.approx ? " (approx)" : ""}` : ""}`);
}

// index.ts imports every built trail, so it is rewritten from the files on disk
async function writeIndex() {
  const slugs = (await readdir("src/lib/trails")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
  const id = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/^([0-9])/, "_$1");
  const out = `// Trek trails built from OpenStreetMap by scripts/build-trail.mjs, which rewrites this file.
// The data is OpenStreetMap's (ODbL), so anything that shows a trail must credit
// "© OpenStreetMap contributors".
// JSON imports type their arrays loosely, hence "as unknown as Trail".
// Server only: importing this bundles every trail. Browser code uses ./shared and fetches one
// trail at a time from /trails/<slug>.json.

import type { Trail } from "./shared";
${slugs.map((s) => `import ${id(s)} from "./${s}.json";`).join("\n")}

export * from "./shared";

const TRAILS: Record<string, Trail> = {
${slugs.map((s) => `  "${s}": ${id(s)} as unknown as Trail,`).join("\n")}
};

export const TRAIL_SLUGS = Object.keys(TRAILS);

export function getTrail(slug: string): Trail | null {
  return TRAILS[slug] ?? null;
}
`;
  await writeFile("src/lib/trails/index.ts", out.replace(/\n/g, "\r\n"));
}

const args = process.argv.slice(2);
const slugs = args[0] === "all" ? Object.keys(TREKS) : args;
if (!slugs.length || slugs.some((s) => !TREKS[s])) {
  console.error(`Usage: node scripts/build-trail.mjs <slug> [<slug> ...] | all\nKnown: ${Object.keys(TREKS).join(", ")}`);
  process.exit(1);
}
const failed = [];
for (const s of slugs) {
  try { await build(s); } catch (e) { failed.push(s); console.error(`${s}: FAILED ${e.message}`); }
}
await writeIndex();
if (failed.length) { console.error(`Failed: ${failed.join(", ")}`); process.exitCode = 1; }
