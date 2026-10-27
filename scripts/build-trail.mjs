// Builds a trek's trail from OpenStreetMap into src/lib/trails/<slug>.json:
//   stops   each overnight stop, placed by Nominatim (OSM's place search), with its height and
//           how far along the trail it is
//   line    the walking path between them, routed along OSM's paths by BRouter (hiking profile),
//           thinned to ~10 m accuracy so pages load it quickly
//   side    side trips that aren't on the way (summit viewpoints), as points only
//   days    the day-by-day itinerary: where each day walks from and to, distance, metres up and
//           down (measured along the line), and where you sleep
// The data is OpenStreetMap's (ODbL): anything that shows it must credit OpenStreetMap.
// Run: node scripts/build-trail.mjs <slug>     (the stops for each trek are listed below)

import { writeFile, mkdir } from "node:fs/promises";

const UA = { "User-Agent": "TrailToTides/1.0 (hello@trailtotides.com)" };

// Stops in walking order; "near" narrows the place search when a name is common.
// days: { to } walks from the last night's stop to `to` (via any places listed);
// { rest } stays put; { travel } is a non-walking day. `side` adds an out-and-back climb.
const TREKS = {
  "everest-base-camp": {
    near: "Solukhumbu, Nepal",
    stops: ["Lukla", "Phakding", "Namche Bazaar", "Tengboche", "Dingboche", "Lobuche", "Gorak Shep", "Everest Base Camp"],
    side: ["Kala Patthar"],
    extra: ["Pheriche"],
    days: [
      { to: "Phakding", note: "Fly into Lukla in the morning and walk down the Dudh Kosi valley" },
      { to: "Namche Bazaar", note: "The big climb of the trek: the Namche hill, with a first view of Everest" },
      { rest: "Acclimatisation day: a short climb above Namche and back to sleep low" },
      { to: "Tengboche", note: "Across the valley side to the monastery, facing Ama Dablam" },
      { to: "Dingboche", note: "Through Pangboche into the Imja valley" },
      { rest: "Acclimatisation day: climb partway up Nangkartshang and back" },
      { to: "Lobuche", note: "Past the climbers' memorials at Thukla" },
      { to: "Gorak Shep", via: ["Everest Base Camp"], note: "On to Gorak Shep, then out to Base Camp and back" },
      { to: "Pheriche", side: { name: "Kala Patthar", km: 4.2, up: 480 }, note: "Kala Patthar before sunrise for the Everest view, then down" },
      { to: "Namche Bazaar", note: "A long descent back through Pangboche and Tengboche" },
      { to: "Lukla", note: "Back to the airstrip. Flights out are early the next morning: keep a spare day, as weather cancels them" },
    ],
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function place(name, near) {
  for (const q of [`${name}, ${near}`, name]) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&extratags=1`;
    const [hit] = await fetch(url, { headers: UA }).then((r) => r.json());
    await sleep(1100); // Nominatim allows one request a second
    if (hit) return { name, lat: +(+hit.lat).toFixed(5), lng: +(+hit.lon).toFixed(5), ele: hit.extratags?.ele ? Math.round(+hit.extratags.ele) : null };
  }
  throw new Error(`Couldn't find "${name}" in OpenStreetMap`);
}

async function leg(a, b) {
  const url = `https://brouter.de/brouter?lonlats=${a.lng},${a.lat}|${b.lng},${b.lat}&profile=hiking-mountain&alternativeidx=0&format=geojson`;
  const res = await fetch(url, { headers: UA });
  const text = await res.text();
  if (!res.ok || !text.startsWith("{")) throw new Error(`No route ${a.name} → ${b.name}: ${text.slice(0, 120)}`);
  await sleep(1500);
  const f = JSON.parse(text).features[0];
  return { coords: f.geometry.coordinates.map(([lng, lat, ele]) => [lat, lng, Math.round(ele)]), ascent: +f.properties["filtered ascend"] };
}

// Metres between two [lat, lng] points
function dist([la1, lo1], [la2, lo2]) {
  const R = 6371000, toRad = Math.PI / 180;
  const dLa = (la2 - la1) * toRad, dLo = (lo2 - lo1) * toRad;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * toRad) * Math.cos(la2 * toRad) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
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
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    let max = 0, at = -1;
    for (let i = s + 1; i < e; i++) {
      const d = Math.abs((x2 - x1) * (y1 - xy[i][1]) - (x1 - xy[i][0]) * (y2 - y1)) / len;
      if (d > max) { max = d; at = i; }
    }
    if (max > tol) { keep[at] = 1; stack.push([s, at], [at, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}

const slug = process.argv[2];
const trek = TREKS[slug];
if (!trek) {
  console.error(`Usage: node scripts/build-trail.mjs <slug>\nKnown: ${Object.keys(TREKS).join(", ")}`);
  process.exit(1);
}

const stops = [];
for (const s of trek.stops) stops.push(await place(s, trek.near));
const side = [];
for (const s of trek.side ?? []) side.push(await place(s, trek.near));

let full = [];
let ascent = 0;
for (let i = 0; i < stops.length - 1; i++) {
  const l = await leg(stops[i], stops[i + 1]);
  ascent += l.ascent;
  full = full.concat(i === 0 ? l.coords : l.coords.slice(1));
}

// The router starts and ends on the nearest mapped path, which can be a little off the village
// point; join the ends to the first and last stop so the line meets its pins
const first = stops[0], last = stops[stops.length - 1];
if (dist(full[0], [first.lat, first.lng]) > 20) full.unshift([first.lat, first.lng, first.ele ?? full[0][2]]);
if (dist(full[full.length - 1], [last.lat, last.lng]) > 20) full.push([last.lat, last.lng, last.ele ?? full[full.length - 1][2]]);

// Distance along the full-resolution path, then each stop's km mark (nearest path point)
const cum = [0];
for (let i = 1; i < full.length; i++) cum.push(cum[i - 1] + dist(full[i - 1], full[i]));
for (const s of stops) {
  let best = 0, bestD = Infinity;
  full.forEach((p, i) => { const d = dist(p, [s.lat, s.lng]); if (d < bestD) { bestD = d; best = i; } });
  s.km = +(cum[best] / 1000).toFixed(1);
  s.ele ??= full[best][2];
}

// ── Itinerary ────────────────────────────────────────────────────────────────
// Each day's distance and climb are measured along the line between the nearest line points to
// where it starts and ends (either direction, so return days work too). Places off the line
// (Pheriche) are matched to their nearest point and the day is marked approximate.
const places = new Map([...stops, ...side].map((p) => [p.name, p]));
for (const n of trek.extra ?? []) places.set(n, await place(n, trek.near));
// Some places have no surveyed height in OpenStreetMap: use the trail's height nearest to them
const fillEle = () => { for (const p of places.values()) if (p.ele == null) p.ele = full[nearestIdx(p).i][2]; };
const nearestIdx = (p) => {
  let best = 0, bestD = Infinity;
  full.forEach((q, i) => { const d = dist(q, [p.lat, p.lng]); if (d < bestD) { bestD = d; best = i; } });
  return { i: best, off: bestD };
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
fillEle();
const days = [];
let at = places.get(trek.stops[0]);
(trek.days ?? []).forEach((d, n) => {
  const day = n + 1;
  if (d.rest) { days.push({ day, kind: "rest", from: at.name, to: at.name, sleepEle: at.ele, note: d.rest }); return; }
  if (d.travel) { days.push({ day, kind: "travel", from: at.name, to: null, sleepEle: null, note: d.travel }); return; }
  const route = [at, ...(d.via ?? []).map((v) => places.get(v)), places.get(d.to)];
  if (route.some((p) => !p)) throw new Error(`Day ${day}: unknown place in ${JSON.stringify(d)}`);
  let km = 0, up = 0, down = 0, approx = false;
  for (let k = 0; k < route.length - 1; k++) {
    const A = nearestIdx(route[k]), B = nearestIdx(route[k + 1]);
    approx ||= A.off > 300 || B.off > 300;
    const s = stretch(A.i, B.i);
    km += s.km; up += s.up; down += s.down;
  }
  if (d.side) { km += d.side.km; up += d.side.up; down += d.side.up; }
  const to = places.get(d.to);
  days.push({
    day, kind: "walk", from: at.name, to: to.name, via: [...(d.via ?? []), ...(d.side ? [d.side.name] : [])],
    km: +km.toFixed(1), up: Math.round(up / 10) * 10, down: Math.round(down / 10) * 10, approx,
    sleepEle: to.ele, note: d.note ?? "",
  });
  at = to;
});
const sleepPlaces = [...new Map(days.filter((d) => d.to).map((d) => [d.to, places.get(d.to)])).values()]
  .map(({ name, lat, lng, ele }) => ({ name, lat, lng, ele }));

const line = simplify(full, 10).map(([la, lo, e]) => [+la.toFixed(5), +lo.toFixed(5), e]);
const trail = {
  slug,
  source: "© OpenStreetMap contributors (ODbL); route by BRouter",
  builtAt: new Date().toISOString().slice(0, 10),
  lengthKm: +(cum[cum.length - 1] / 1000).toFixed(1),
  ascentM: Math.round(stretch(0, full.length - 1).up / 10) * 10, // smoothed, like the daily figures
  maxEleM: Math.max(...full.map((p) => p[2])),
  stops,
  side,
  days,
  sleepPlaces,
  line,
};

await mkdir("src/lib/trails", { recursive: true });
await writeFile(`src/lib/trails/${slug}.json`, JSON.stringify(trail));
console.log(`${slug}: ${trail.lengthKm} km one way, +${trail.ascentM} m, highest ${trail.maxEleM} m, ${full.length} → ${line.length} points`);
for (const s of stops) console.log(`  km ${String(s.km).padStart(5)}  ${s.name} (${s.ele} m)`);
for (const s of side) console.log(`  side trip: ${s.name} (${s.ele} m)`);
for (const d of days) console.log(`  day ${String(d.day).padStart(2)} ${d.kind.padEnd(6)} ${d.from} → ${d.to ?? ""}${d.km != null ? `  ${d.km} km +${d.up} −${d.down}${d.approx ? " (approx)" : ""}` : ""}`);
