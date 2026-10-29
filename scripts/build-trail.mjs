// Builds a trek's trail from OpenStreetMap into src/lib/trails/<slug>.json:
//   stops   each overnight stop, found in OSM's named places around the trek (Overpass), by any
//           name or spelling it carries, else by Nominatim (OSM's place search), with its height
//           and how far along the trail it is
//   line    the walking path between them, routed along OSM's paths by BRouter (hiking profile)
//           through every camp and pass OSM has; where BRouter can't connect two points, over the
//           mapped paths near them with only the gaps between paths bridged. Thinned to ~10 m
//           accuracy so pages load it quickly
//   side    side trips that aren't on the way (summit viewpoints), as points only
//   days    the day-by-day itinerary: where each day walks from and to, distance, metres up and
//           down (measured along the line), and where you sleep
// The data is OpenStreetMap's (ODbL): anything that shows it must credit OpenStreetMap.
// Remote campsites are often missing from OpenStreetMap, so a stop can carry its own coordinates
// (`at`), camps OSM lacks are placed along the trail (`camps`), and stretches with no mapped
// path are drawn along the terrain (scripts/terrain.mjs); those stretches are
// counted in `approxKm`.
// Run: node scripts/build-trail.mjs <slug> [<slug> ...]   or   all  (or the Build trails GitHub Action)
// The stops and days for each trek are in ./trek-configs.mjs. Rewrites src/lib/trails/index.ts.
// Then run sync-trek-facts.mjs so the trek's duration, distance and base camp follow the itinerary.

import { writeFile, readFile, readdir, mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { TREKS } from "./trek-configs.mjs";
import { placesNear, matchPlace, pathRoute } from "./osm.mjs";
import { terrainPath, satellitePreview } from "./terrain.mjs";

const UA = { "User-Agent": "TrailToTides/1.0 (hello@trailtotides.com)" };

// Every log line carries the seconds since the build started, to show where the time goes
const T0 = Date.now();
for (const k of ["log", "warn", "error"]) {
  const f = console[k].bind(console);
  console[k] = (...a) => f(`[${String(Math.round((Date.now() - T0) / 1000)).padStart(4)}s]`, ...a);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A map service request, tried up to five times with a time limit on each: these free services
// drop connections and rate-limit now and then. Returns the parsed JSON, or the text with text: true
async function request(url, { headers = UA, timeout = 60000, text = false } = {}) {
  let last;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeout) });
      if (res.ok) return text ? await res.text() : await res.json();
      last = new Error(`${new URL(url).host} ${res.status} ${(await res.text()).slice(0, 120).replace(/\s+/g, " ")}`);
      if (res.status >= 400 && res.status < 500 && res.status !== 429) throw last; // a bad request won't improve
    } catch (e) {
      // fetch's own "fetch failed" hides the network error in its cause
      if (e.cause) e.message += ` (${e.cause.code ?? e.cause.message ?? e.cause})`;
      last = e;
      if (e.message?.match(/ 4\d\d /) && !e.message.includes(" 429 ")) throw e;
    }
    await sleep(5000 * 2 ** (attempt - 1)); // 5, 10, 20, 40 s
  }
  throw last;
}

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
    const part = pts.slice(i, i + 100).map(([la, lo]) => [+la.toFixed(5), +lo.toFixed(5)]);
    out.push(...(await heightsOf(part)));
  }
  return out;
}

// Heights from Open-Meteo (Copernicus 90 m), else from OpenTopoData (SRTM 90 m)
async function heightsOf(part) {
  try {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${part.map((p) => p[0]).join(",")}&longitude=${part.map((p) => p[1]).join(",")}`;
    const j = await request(url, { headers: {} });
    if (!Array.isArray(j.elevation)) throw new Error(`Open-Meteo: ${j.reason ?? "no heights"}`);
    await sleep(300); // Open-Meteo's free tier limits requests a minute
    return j.elevation.map((e) => Math.round(e));
  } catch (e) {
    console.warn(`  heights: Open-Meteo failed (${e.message}), trying OpenTopoData`);
    const url = `https://api.opentopodata.org/v1/srtm90m?locations=${part.map((p) => p.join(",")).join("|")}`;
    const j = await request(url, { headers: {} });
    await sleep(1100); // OpenTopoData allows one request a second
    return j.results.map((r) => Math.round(r.elevation ?? 0));
  }
}

const found = new Map();
// Every named place OpenStreetMap has around the trek being built (see placesNear)
let index = [];
const taken = (lat, lng) => [...found.values()].some((p) => dist([p.lat, p.lng], [lat, lng]) < 300);

async function place(stop, trek, prev = null) {
  const s = typeof stop === "string" ? { name: stop } : stop;
  if (found.has(s.name)) return found.get(s.name);
  // A position checked against GPS tracks and the published height is used as it is
  if (s.exact) {
    const p = { name: s.name, lat: s.at[0], lng: s.at[1], ele: s.ele ?? (await heights([s.at]))[0], from: "given" };
    found.set(s.name, p);
    return p;
  }
  // First the trek's own place list, which knows campsites, passes and lakes by every name they
  // carry; given coordinates must be within 2 km of the match
  for (const n of [s.name, s.q].filter(Boolean)) {
    // Without coordinates, a stop is looked for within a day's walk of the one before (two
    // villages along one trek can share a name), or near the trek's centre for the first
    const where = s.at ? { near: s.at, maxD: 2000 } : prev ? { near: [prev.lat, prev.lng], maxD: s.optional ? 5000 : 25000 } : { near: trek.centre, maxD: 80000 };
    const m = matchPlace(index, n, { as: s.name, ...where });
    if (m && !taken(m.lat, m.lng)) {
      // The middle of a big meadow or lake can be far from the camp on its edge: when the stop
      // has its own coordinates, they stay, and OSM only confirms the place (and its height)
      const [lat, lng] = m.area && s.at ? s.at : [+m.lat.toFixed(5), +m.lng.toFixed(5)];
      const p = { name: s.name, lat, lng, ele: (m.area && s.at ? null : m.ele) ?? (await heights([[lat, lng]]))[0], from: "osm" };
      found.set(s.name, p);
      return p;
    }
  }
  // An optional stop is taken only from the trek's OSM place list: no looser search, no guess
  if (s.optional) return null;
  const [cla, clo] = trek.centre;
  const box = `&viewbox=${clo - 0.8},${cla + 0.8},${clo + 0.8},${cla - 0.8}&bounded=1`;
  let hit = null;
  for (const q of [`${s.q ?? s.name}, ${trek.near}`, s.q ?? s.name]) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&extratags=1${box}`;
    // A path or stream named "A to B" sits between places, not at one
    [hit] = (await request(url, { timeout: 30000 })).filter((h) => !["highway", "waterway", "boundary"].includes(h.class));
    await sleep(1100); // Nominatim allows one request a second
    if (hit) break;
  }
  // Given coordinates are approximate; a mapped place close to them is more exact, one far
  // away is a different place with the same name. A hit on a place already used for another
  // stop is the search falling back to a looser match
  if (hit && s.at && dist([+hit.lat, +hit.lon], s.at) > 2000) hit = null;
  if (hit && taken(+hit.lat, +hit.lon)) hit = null;
  let p;
  if (hit) p = { name: s.name, lat: +(+hit.lat).toFixed(5), lng: +(+hit.lon).toFixed(5), ele: hit.extratags?.ele ? Math.round(+hit.extratags.ele) : null, from: "osm" };
  else if (s.at) p = { name: s.name, lat: s.at[0], lng: s.at[1], ele: s.ele ?? null, from: "given" };
  else throw new Error(`Couldn't find "${s.name}" in OpenStreetMap: give it coordinates (at)`);
  if (p.ele == null) p.ele = (await heights([[p.lat, p.lng]]))[0];
  found.set(s.name, p);
  return p;
}

// A recorded GPS track (scripts/tracks/<file>.json, [[lat, lng], ...]) for a stretch OpenStreetMap
// maps badly or not at all: the part of it between the two places. A place up to a kilometre off
// the track is joined to it along the terrain (alongTerrain)
function fromTrack(file, a, b) {
  const pts = JSON.parse(readFileSync(new URL(`./tracks/${file}.json`, import.meta.url), "utf8"));
  const nearest = (p) => pts.reduce((best, q, i) => (dist(q, [p.lat, p.lng]) < dist(pts[best], [p.lat, p.lng]) ? i : best), 0);
  const i = nearest(a), j = nearest(b);
  const part = i <= j ? pts.slice(i, j + 1) : pts.slice(j, i + 1).reverse();
  const offA = dist(part[0], [a.lat, a.lng]), offB = dist(part[part.length - 1], [b.lat, b.lng]);
  if (offA > 1000 || offB > 1000) throw new Error(`track ${file} passes ${Math.round(Math.max(offA, offB))} m from ${offA > offB ? a.name : b.name}`);
  return [[a.lat, a.lng], ...part, [b.lat, b.lng]];
}

async function leg(a, b, track) {
  const straight = dist([a.lat, a.lng], [b.lat, b.lng]);
  console.log(`  leg ${a.name} → ${b.name} (${(straight / 1000).toFixed(1)} km apart)${track ? ` along the track ${track}` : ""}`);
  if (track) {
    const coords = fromTrack(track, a, b);
    const ele = await heights(coords);
    return { coords: coords.map((p, i) => [p[0], p[1], ele[i]]), approxKm: 0 };
  }
  try {
    const url = `https://brouter.de/brouter?lonlats=${a.lng},${a.lat}|${b.lng},${b.lat}&profile=hiking-mountain&alternativeidx=0&format=geojson`;
    const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(90000) });
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
    // BRouter gives up when one piece of path is missing; route over the mapped paths ourselves,
    // jumping only the short gaps between them, which are counted as off the mapped paths
    try {
      // Short jumps between paths first; if the paths still don't join, longer ones, so a leg with
      // one unmapped stretch (a summit off the path, a gully) is off the mapped paths only across that
      let r = null, len = 0;
      for (const opts of [{}, { bridge: 1500, reach: 3000 }]) {
        r = await pathRoute([a.lat, a.lng], [b.lat, b.lng], opts);
        len = 0;
        if (r) for (let i = 1; i < r.coords.length; i++) len += dist(r.coords[i - 1], r.coords[i]);
        if (r && len <= Math.max(3 * straight, straight + 8000) && r.bridgedM < 0.6 * len) break;
        r = null;
      }
      if (r) {
        console.warn(`  ~ ${a.name} → ${b.name}: ${e.message}; routed over mapped paths, ${(r.bridgedM / 1000).toFixed(1)} of ${(len / 1000).toFixed(1)} km bridged`);
        const ele = await heights(r.coords);
        return { coords: r.coords.map((p, i) => [p[0], p[1], ele[i]]), approxKm: r.bridgedM / 1000 };
      }
    } catch (e2) { console.warn(`  ! path search failed: ${e2.message}`); }
    console.warn(`  ! ${a.name} → ${b.name}: ${e.message}; drawn along the terrain`);
    // Only the ends: the leg is drawn along the terrain between them (see alongTerrain)
    const ele = await heights([[a.lat, a.lng], [b.lat, b.lng]]);
    return { coords: [[a.lat, a.lng, ele[0]], [b.lat, b.lng, ele[1]]], approxKm: straight / 1000 };
  }
}

// A line with long straight segments — a gap no mapped path fills, or a path OpenStreetMap maps
// with few points — is drawn along the terrain instead (scripts/terrain.mjs): every segment over
// 250 m becomes the easiest walking route between its ends. Up to a kilometre the ends are points
// of a real path, so the route keeps close to the segment; longer gaps may wander further. Long
// ones are saved as satellite previews for checking by eye.
const previews = [];
async function alongTerrain(coords) {
  // A straight run of points (BRouter splits long path edges) is one segment for this purpose
  coords = simplify(coords, 3);
  const out = [coords[0]];
  for (let i = 1; i < coords.length; i++) {
    const p = coords[i - 1], q = coords[i], d = dist(p, q);
    if (d > 250) {
      const long = d > 1000;
      try {
        const path = await terrainPath([p[0], p[1]], [q[0], q[1]], { halfWidth: Math.min(long ? 0.4 * d : 0.25 * d, 800), step: d > 3000 ? 25 : 15, keep: long ? 0.0005 : 0.003 });
        if (path) {
          out.push(...path.slice(1, -1));
          if (d > 500) previews.push({ km: d / 1000, line: [p, ...path, q] });
        }
      } catch (e) { console.warn(`  ! terrain unavailable (${e.message}): a ${(d / 1000).toFixed(1)} km segment stays straight`); }
    }
    out.push(q);
  }
  return out;
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
  previews.length = 0;
  const name = (s) => (typeof s === "string" ? s : s.name);
  // One Overpass query for every named place around the trek: its centre and given coordinates
  // (a stop written as a plain string has no coordinates: "Lukla".at is a string method, not a place)
  const pts = [trek.centre, ...trek.stops.filter((s) => Array.isArray(s.at)).map((s) => s.at)];
  const lats = pts.map((p) => p[0]), lngs = pts.map((p) => p[1]);
  try {
    index = await placesNear([Math.min(...lats) - 0.15, Math.min(...lngs) - 0.15, Math.max(...lats) + 0.15, Math.max(...lngs) + 0.15]);
    console.log(`${slug}: ${index.length} named places in OpenStreetMap around the trek`);
  } catch (e) { index = []; console.warn(`${slug}: place list unavailable (${e.message}), using place search only`); }

  const stops = [];
  const skipped = new Set(); // optional stops and side trips OSM doesn't have
  for (const s of trek.stops) {
    const p = await place(s, trek, stops[stops.length - 1]);
    if (p) stops.push({ ...p, track: s.track });
    else { skipped.add(s.name); console.log(`  optional stop not in OpenStreetMap, left out: ${s.name}`); }
  }
  // A stop far from the one before is a different place with the same name
  stops.forEach((s, i) => {
    const gap = i ? dist([stops[i - 1].lat, stops[i - 1].lng], [s.lat, s.lng]) : 0;
    if (gap > 25000) throw new Error(`${s.name} is ${Math.round(gap / 1000)} km from ${stops[i - 1].name}: give it coordinates (at)`);
  });
  const side = [];
  for (const s of trek.side ?? []) {
    const p = await place(s, trek, stops.at(-1));
    if (p) side.push(p);
    else { skipped.add(typeof s === "string" ? s : s.name); console.log(`  optional side trip not in OpenStreetMap, left out: ${s.name}`); }
  }
  for (const s of trek.extra ?? []) await place(s, trek);

  // Camps and passes OpenStreetMap has, found near where they should be, are routed through, so
  // the line crosses the right pass and reaches the real campsite
  const segDist = (p, a, b) => { // metres from p to the straight line a–b, roughly
    const k = Math.cos((a.lat * Math.PI) / 180), ax = a.lng * k, bx = b.lng * k, px = p.lng * k;
    const dx = bx - ax, dy = b.lat - a.lat, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (p.lat - a.lat) * dy) / L)) : 0;
    return dist([p.lat, p.lng], [a.lat + t * dy, (ax + t * dx) / k]);
  };
  const via = stops.slice(0, -1).map(() => []);
  for (const [campName, [a, b, frac, aka = [], campAt]] of Object.entries(trek.camps ?? {})) {
    const ia = stops.findIndex((s) => s.name === a);
    const ib = stops.findIndex((s, i) => i > ia && s.name === b);
    if (ia < 0 || ib < 0) throw new Error(`Camp ${campName}: ${a} and ${b} must be stops in that order`);
    const A = stops[ia], B = stops[ib];
    const guess = [A.lat + frac * (B.lat - A.lat), A.lng + frac * (B.lng - A.lng)];
    const maxD = Math.max(2500, 0.6 * dist([A.lat, A.lng], [B.lat, B.lng]));
    // The camp's own name first, then the other names it goes by (aka)
    // A camp OpenStreetMap doesn't have, placed from GPS tracks and trekkers' waypoints (at)
    const m = campAt ? { lat: campAt[0], lng: campAt[1] } : [campName, ...aka].map((n) => matchPlace(index, n, { near: guess, maxD, as: campName })).find(Boolean);
    if (!m || (!campAt && taken(m.lat, m.lng))) {
      // Names nearby that start the same way, in case OSM spells the camp differently
      const stem = campName.toLowerCase().replace(/[^a-z]/g, "").slice(0, 4);
      const near = index.filter((p) => p.names.some((n) => n.toLowerCase().replace(/[^a-z]/g, "").startsWith(stem)) && dist(guess, [p.lat, p.lng]) < 15000);
      if (near.length) console.log(`  ? ${campName} not matched; nearby: ${near.slice(0, 6).map((p) => `${p.name} (${p.kind}, ${(dist(guess, [p.lat, p.lng]) / 1000).toFixed(1)} km)`).join(", ")}`);
      continue;
    }
    const p = { name: campName, lat: +m.lat.toFixed(5), lng: +m.lng.toFixed(5), ele: m.ele ?? (await heights([[m.lat, m.lng]]))[0], from: campAt ? "given" : "osm" };
    found.set(campName, p);
    let li = ia;
    for (let i = ia; i < ib; i++) if (segDist(p, stops[i], stops[i + 1]) < segDist(p, stops[li], stops[li + 1])) li = i;
    via[li].push(p);
  }
  via.forEach((v, i) => v.sort((p, q) => dist([stops[i].lat, stops[i].lng], [p.lat, p.lng]) - dist([stops[i].lat, stops[i].lng], [q.lat, q.lng])));

  // The line, leg by leg; each stop's position on it is where its leg starts or ends
  let full = [];
  let approxKm = 0;
  const at = [0];
  for (let i = 0; i < stops.length - 1; i++) {
    const chain = [stops[i], ...via[i], stops[i + 1]];
    for (let k = 0; k < chain.length - 1; k++) {
      const l = await leg(chain[k], chain[k + 1], stops[i + 1].track); // camps on a tracked leg follow the track too
      // The router starts and ends on the nearest mapped path: a summit or camp off the paths is
      // joined to it, so the line reaches every stop (drawn along the terrain by alongTerrain)
      const A = chain[k], B = chain[k + 1];
      // (the line's heights are the elevation model's, not a stop's published height)
      if (k + i > 0 && dist(l.coords[0], [A.lat, A.lng]) > 30) { l.coords.unshift([A.lat, A.lng, (await heights([[A.lat, A.lng]]))[0]]); l.approxKm += dist(l.coords[0], l.coords[1]) / 1000; }
      const end = l.coords[l.coords.length - 1];
      if (dist(end, [B.lat, B.lng]) > 30) { l.approxKm += dist(end, [B.lat, B.lng]) / 1000; l.coords.push([B.lat, B.lng, (await heights([[B.lat, B.lng]]))[0]]); }
      l.coords = await alongTerrain(l.coords);
      approxKm += l.approxKm;
      full = full.concat(full.length ? l.coords.slice(1) : l.coords);
    }
    at.push(full.length - 1);
  }

  // The router starts and ends on the nearest mapped path, which can be a little off the village
  // point; join the ends to the first and last stop so the line meets its pins
  const first = stops[0], last = stops[stops.length - 1];
  if (dist(full[0], [first.lat, first.lng]) > 20) { full.unshift([first.lat, first.lng, (await heights([[first.lat, first.lng]]))[0]]); at.forEach((v, i) => (at[i] = i ? v + 1 : 0)); }
  if (dist(full[full.length - 1], [last.lat, last.lng]) > 20) { full.push([last.lat, last.lng, (await heights([[last.lat, last.lng]]))[0]]); at[at.length - 1] = full.length - 1; }

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
  // A step steeper than 1 in 1 (plus 40 m of noise) between neighbouring points is the elevation
  // model jumping between a cliff edge and the valley floor, not the path: no trail climbs that
  // steeply for long. The heights are limited to that slope walking forwards and backwards, and
  // the two averaged, so a step is spread over the stretch around it
  const limit = (order) => {
    const h = full.map((p) => p[2]);
    for (let n = 1; n < order.length; n++) {
      const i = order[n], j = order[n - 1], max = 40 + dist(full[i], full[j]);
      h[i] = Math.min(h[j] + max, Math.max(h[j] - max, h[i]));
    }
    return h;
  };
  const idx = full.map((_, i) => i);
  const fwd = limit(idx), back = limit([...idx].reverse());
  full.forEach((p, i) => { p[2] = Math.round((fwd[i] + back[i]) / 2); });

  // Camps the map doesn't have, placed a typical share of the way along the trail between two
  // mapped stops. Their position is an estimate, so days that reach them are marked approximate
  const estimated = new Set();
  for (const [campName, [a, b, frac]] of Object.entries(trek.camps ?? {})) {
    if (found.has(campName)) continue; // found in OpenStreetMap and routed through
    const ia = stops.findIndex((s) => s.name === a);
    const ib = stops.findIndex((s, i) => i > ia && s.name === b);
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

  // A day that ends somewhere off the line (a descent through the next valley, as to Pheriche on
  // the way down from Everest) is routed on its own and measured along that route
  async function offLine(from, to) {
    const l = await leg({ name: from.name, lat: from.lat, lng: from.lng }, to);
    const c = await alongTerrain(l.coords);
    const ce = c.some((p) => p[2] == null) ? await heights(c) : c.map((p) => p[2]);
    const cc = [0];
    for (let i = 1; i < c.length; i++) cc.push(cc[i - 1] + dist(c[i - 1], c[i]));
    const sm = c.map((_, i) => {
      let t = 0, n = 0;
      for (let k = 0; k < c.length; k++) if (Math.abs(cc[k] - cc[i]) <= 150) { t += ce[k]; n++; }
      return t / n;
    });
    let up = 0, down = 0, ref = sm[0];
    for (const h of sm) { const d = h - ref; if (d >= 15) { up += d; ref = h; } else if (d <= -15) { down -= d; ref = h; } }
    console.log(`  ${from.name} → ${to.name} is off the line: routed on its own, ${(cc[cc.length - 1] / 1000).toFixed(1)} km`);
    return { km: cc[cc.length - 1] / 1000, up, down, approx: l.approxKm > 0.5 };
  }

  const days = [];
  let here = found.get(name(trek.stops[0]));
  let hereIdx = 0;
  for (const [n, d] of (trek.days ?? []).entries()) {
    const day = n + 1;
    if (d.rest) { days.push({ day, kind: "rest", from: here.name, to: here.name, sleepEle: here.ele, note: d.rest }); continue; }
    if (d.travel) { days.push({ day, kind: "travel", from: here.name, to: null, sleepEle: null, note: d.travel }); continue; }
    const vias = (d.via ?? []).filter((v) => !skipped.has(v));
    const route = [...vias, d.to].map((v) => found.get(v));
    if (route.some((p) => !p)) throw new Error(`Day ${day}: unknown place in ${JSON.stringify(d)}`);
    let km = 0, up = 0, down = 0, approx = false, idx = hereIdx;
    let at0 = here;
    for (const p of route) {
      const B = nearestIdx(p, idx);
      // Estimated where you sleep makes the day's figures estimates; a pass placed by estimate
      // along the line only labels it, so it doesn't
      approx ||= estimated.has(p.name) && p === route[route.length - 1];
      const s = B.off > 300 ? await offLine(at0, p) : stretch(idx, B.i);
      approx ||= !!s.approx;
      km += s.km; up += s.up; down += s.down;
      idx = B.i;
      at0 = p;
    }
    if (d.side) { km += d.side.km; up += d.side.up; down += d.side.up; }
    const to = found.get(d.to);
    days.push({
      day, kind: "walk", from: here.name, to: to.name, via: [...vias, ...(d.side ? [d.side.name] : [])],
      km: +km.toFixed(1), up: Math.round(up / 10) * 10, down: Math.round(down / 10) * 10, approx,
      sleepEle: to.ele, note: d.note ?? "",
    });
    here = to;
    hereIdx = idx;
  }
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
    // A place's published height counts when the elevation model reads it lower (see trek-configs)
    maxEleM: Math.max(...full.map((p) => p[2]), ...[...stops, ...side].map((p) => p.ele ?? 0)),
    approxKm: +approxKm.toFixed(1),
    stops: stops.map(strip),
    side: side.map(strip),
    days,
    sleepPlaces,
    line,
  };

  await mkdir("src/lib/trails", { recursive: true });
  // The map services fail now and then, and a leg they fail on is drawn off the mapped paths: a build with
  // more straight km than the trail already saved is worse, so the saved one is kept. Unless the stops
  // have moved: then the saved trail goes to the wrong places, however well mapped
  const prev = await readFile(`src/lib/trails/${slug}.json`, "utf8").then(JSON.parse).catch(() => null);
  const where = (t) => [...t.stops, ...t.side].map((p) => `${p.name}@${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join("|");
  if (prev && (prev.approxKm ?? 0) + 0.1 < trail.approxKm && where(prev) === where(trail)) {
    console.log(`${slug}: KEPT the saved trail (${prev.approxKm ?? 0} km off the mapped paths) over this build's ${trail.approxKm} km`);
    return;
  }
  await writeFile(`src/lib/trails/${slug}.json`, JSON.stringify(trail));
  // The longest stretches drawn along the terrain, on satellite imagery, for checking by eye
  // (only for small runs: a preview is a few MB, too many to keep for a full rebuild)
  if (process.env.TRAIL_PREVIEWS && Number(process.env.TRAIL_COUNT ?? 1) <= 4) {
    const longest = [...previews].sort((x, y) => y.km - x.km).slice(0, 4);
    for (const [n, p] of longest.entries()) {
      const file = `research/previews/${slug}-${n + 1}.png`;
      try { if (await satellitePreview(file, p.line.map(([la, lo]) => [la, lo]), [p.line[0], p.line[p.line.length - 1]])) console.log(`  preview: ${file} (${p.km.toFixed(1)} km drawn along the terrain)`); }
      catch (e) { console.warn(`  ! preview failed: ${e.message}`); }
    }
  }
  console.log(`${slug}: ${trail.lengthKm} km, +${trail.ascentM} m, highest ${trail.maxEleM} m, ${trail.approxKm} km off the mapped paths (drawn along the terrain), ${full.length} → ${line.length} points`);
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
  await writeFile("src/lib/trails/index.ts", out);
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
