// Builds a circuit trail from treks already built, joined by the drives between their trailheads:
// src/lib/trails/<slug>.json, the same shape as a trek's, plus
//   drives  [{ fromKm, toKm, from, to }] the stretches of the line that are by road (routed by
//           BRouter's car profile over OpenStreetMap), so the site draws them as roads, the 3D view
//           drives them by car, and the GPX gives them as separate road tracks
// and days that can mix the two: a day's km, up and down are on foot; driveKm is by road.
// Walking pieces are cut from the treks' own lines (and their unmapped stretches carried over), so
// fix a trek in trek-configs.mjs, rebuild it, then rebuild the circuit.
// Run: node scripts/build-circuit.mjs [<slug>]   (needs network: BRouter, elevation tiles)
// Then node scripts/sync-trek-facts.mjs for the trek page's days, distance and height.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { copernicusHeights } from "./copernicus.mjs";
import { dist } from "./osm.mjs";

const UA = { "User-Agent": process.env.MAP_CONTACT ? `trail-builder/1.0 (${process.env.MAP_CONTACT})` : "trail-builder/1.0" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── The circuits ─────────────────────────────────────────────────────────────
// pieces, in order: { walk: "<trek slug>", from: "<its stop>", to: "<its stop>" } (either direction)
// or { drive: [lat, lng] or "<place name in this circuit>" , name }: by road from where the last
// piece ended. places: named points the days can end at, besides the treks' stops.
// days: { to: "<place>", note } walks or drives (or both) on to that place, the next time the line
// reaches it; { rest: "<note>" } stays put; { rest, side: { trek, name } } climbs one of a trek's side
// trips from where you are and back (copied from that trek, as its walking pieces are).
const HELANG = [30.52601, 79.50671]; // where the Urgam road meets the Badrinath highway
// Private cars stop at Sonprayag; shared jeeps run the last 5 km of road to Gaurikund, routed here
// along the road on foot's profile (the car profile won't take it) and still counted as by road
const SONPRAYAG = [30.63548, 78.99982];
const CIRCUITS = {
  "panch-kedar": {
    source: "Kedarnath, Madhmaheshwar, Tungnath, Rudranath and Kalpeshwar treks, joined by road",
    start: { name: "Guptkashi", at: [30.52832, 79.08178] },
    pieces: [
      { drive: SONPRAYAG, name: "Sonprayag" },
      { drive: "Gaurikund", profile: "hiking-mountain" },
      { walk: "kedarnath", from: "Gaurikund", to: "Kedarnath" },
      { walk: "kedarnath", from: "Kedarnath", to: "Gaurikund" },
      { drive: SONPRAYAG, name: "Sonprayag", profile: "hiking-mountain" },
      { drive: "Ransi" },
      { walk: "madhmaheshwar", from: "Ransi", to: "Madhmaheshwar" },
      { walk: "madhmaheshwar", from: "Madhmaheshwar", to: "Ransi" },
      { drive: "Chopta" },
      { walk: "tungnath-chandrashila", from: "Chopta", to: "Chandrashila" },
      { walk: "tungnath-chandrashila", from: "Chandrashila", to: "Chopta" },
      { drive: "Sagar" },
      { walk: "rudranath", from: "Sagar", to: "Rudranath" },
      // On from Rudranath on foot, the old way down to Kalpeshwar, not back to the road
      { walk: "rudranath-kalpeshwar", from: "Rudranath", to: "Kalpeshwar" },
      { walk: "kalpeshwar", from: "Kalpeshwar", to: "Urgam" },
      { drive: HELANG, name: "Helang" },
    ],
    days: [
      { to: "Kedarnath", note: "A short drive from Guptkashi to Sonprayag and Gaurikund, then the pilgrim path up the Mandakini to Kedarnath, the first of the five" },
      { rest: "Darshan at Kedarnath, and the short climb to Bhukund Bhairavnath temple above it", side: { trek: "kedarnath", name: "Bhukund Bhairavnath temple" } },
      { to: "Ransi", note: "Down to Gaurikund, then by road through Guptkashi and Ukhimath to Ransi" },
      { to: "Gaundar", note: "Down to the Madhmaheshwar Ganga and along it to Gaundar village" },
      { to: "Madhmaheshwar", note: "Up through Bantoli and Nanu to the meadow temple facing Chaukhamba, the second of the five" },
      { rest: "A morning at Budha Madhmaheshwar on the meadow above", side: { trek: "madhmaheshwar", name: "Budha Madhmaheshwar" } },
      { to: "Chopta", note: "All the way down to Ransi, then by road over to Chopta" },
      { to: "Sagar", note: "Up to Tungnath, the third and highest of the five, and on to Chandrashila; back down to Chopta and by road through Mandal to Sagar" },
      { to: "Panar", note: "From Sagar up through oak forest and the Lyuti meadows to Panar bugyal" },
      { to: "Rudranath", note: "Over Pitradhar to Rudranath, the fourth of the five, a rock shrine high on the meadows" },
      { to: "Dumak", note: "The old way down from Rudranath through forest and over ridges to Dumak village" },
      { to: "Bansi Narayan", note: "Up to the old Vishnu temple at Bansi Narayan" },
      { to: "Helang", note: "Down to Kalpeshwar, the fifth of the five, then through the Urgam valley and by road to Helang on the Badrinath highway" },
    ],
  },
};

// ── Geometry ─────────────────────────────────────────────────────────────────
const cumKm = (line) => { const c = [0]; for (let i = 1; i < line.length; i++) c.push(c[i - 1] + dist(line[i - 1], line[i]) / 1000); return c; };
// The part of a trek's line between two of its stops, walked from the first to the second. Cut at
// the line's points nearest the stops: a stop's km is measured on the full line before it was
// thinned, so it runs a little past the end of the saved one
const nearestIdx = (line, s) => line.reduce((best, q, i) => (dist(q, [s.lat, s.lng]) < dist(line[best], [s.lat, s.lng]) ? i : best), 0);
function cut(line, A, B) {
  const i = nearestIdx(line, A), j = nearestIdx(line, B);
  const part = line.slice(Math.min(i, j), Math.max(i, j) + 1);
  return { part: i <= j ? part : part.reverse(), i, j };
}
// Douglas–Peucker, ~flat projection
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const k = Math.cos((pts[0][0] * Math.PI) / 180) * 111320, xy = pts.map(([la, lo]) => [lo * k, la * 110540]);
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop(); let max = 0, at = -1;
    const [x1, y1] = xy[s], [x2, y2] = xy[e], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    for (let i = s + 1; i < e; i++) { const d = Math.abs(dy * xy[i][0] - dx * xy[i][1] + x2 * y1 - y2 * x1) / L; if (d > max) { max = d; at = i; } }
    if (max > tol) { keep[at] = 1; stack.push([s, at], [at, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}
async function carRoute(a, b, profile = "car-fast") {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const url = `https://brouter.de/brouter?lonlats=${a[1]},${a[0]}|${b[1]},${b[0]}&profile=${profile}&alternativeidx=0&format=geojson`;
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(90000) });
      const text = await res.text(); await sleep(1500);
      if (!res.ok || !text.startsWith("{")) throw new Error(text.slice(0, 80));
      const pts = JSON.parse(text).features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const line = simplify(pts, 8);
      const ele = await copernicusHeights(line);
      return line.map((p, i) => [+p[0].toFixed(5), +p[1].toFixed(5), Math.round(ele[i])]);
    } catch (e) { console.warn(`  car route retry (${e.message})`); await sleep(5000 * (attempt + 1)); }
  }
  throw new Error(`no road route ${a} → ${b}`);
}
// Climb and descent on foot, ignoring the elevation model's small wobbles (10 m either way)
function upDown(pts) {
  let up = 0, down = 0, ref = pts[0]?.[2] ?? 0;
  for (const p of pts) { const d = p[2] - ref; if (d > 10) { up += d; ref = p[2]; } else if (d < -10) { down -= d; ref = p[2]; } }
  return { up: Math.round(up / 10) * 10, down: Math.round(down / 10) * 10 };
}

async function build(slug) {
  const C = CIRCUITS[slug];
  const trails = {};
  const load = async (s) => (trails[s] ??= JSON.parse(await readFile(`src/lib/trails/${s}.json`, "utf8")));
  const line = [];            // [lat, lng, ele]
  const drives = [], unmapped = [], places = new Map();
  const kmNow = () => (line.length ? cumKm(line).at(-1) : 0);
  const place = (name, p) => { if (!places.has(name)) places.set(name, { name, lat: p[0], lng: p[1], ele: p[2] ?? null }); };
  const append = (pts) => { if (line.length && dist(line.at(-1), pts[0]) < 5) pts = pts.slice(1); line.push(...pts); };
  let here = C.start.at, hereName = C.start.name;
  place(C.start.name, [...C.start.at, (await copernicusHeights([C.start.at]))[0]]);

  for (const piece of C.pieces) {
    const k0 = kmNow();
    if (piece.drive) {
      const name = piece.name ?? piece.drive;
      const to = Array.isArray(piece.drive) ? piece.drive : [places.get(piece.drive)?.lat, places.get(piece.drive)?.lng];
      // A named stop of a trek still to come: look it up there
      let target = to;
      if (!Array.isArray(piece.drive) && target[0] == null) {
        for (const p of C.pieces) if (p.walk) { const t = await load(p.walk); const s = t.stops.find((x) => x.name === piece.drive); if (s) { target = [s.lat, s.lng]; break; } }
      }
      console.log(`  drive ${hereName} → ${name}`);
      const road = await carRoute(here, target, piece.profile);
      append(road);
      drives.push({ fromKm: +k0.toFixed(2), toKm: +kmNow().toFixed(2), from: hereName, to: name });
      place(name, road.at(-1));
      here = [road.at(-1)[0], road.at(-1)[1]]; hereName = name;
    } else {
      const t = await load(piece.walk);
      const A = t.stops.find((s) => s.name === piece.from), B = t.stops.find((s) => s.name === piece.to);
      if (!A || !B) throw new Error(`${piece.walk}: no stop ${!A ? piece.from : piece.to}`);
      const { part, i: iA, j: iB } = cut(t.line, A, B);
      // Km on the trek's saved line (the unmapped stretches are on the full one: scaled to it)
      const tc = cumKm(t.line), scale = tc.at(-1) / t.lengthKm, kA = tc[iA] / scale, kB = tc[iB] / scale;
      console.log(`  walk ${piece.walk}: ${A.name} → ${B.name}, ${Math.abs(tc[iB] - tc[iA]).toFixed(1)} km`);
      // Where the road ends short of the trailhead, the line goes straight on (a few metres)
      append(part);
      // The trek's stretches with no mapped path, moved to where this piece sits on the circuit
      for (const u of t.unmapped ?? []) {
        const lo = Math.max(Math.min(kA, kB), u.fromKm), hi = Math.min(Math.max(kA, kB), u.toKm);
        if (hi <= lo) continue;
        const f = (k) => k0 + Math.abs(k - kA) * scale;
        const [x, y] = [f(lo), f(hi)].sort((p, q) => p - q);
        unmapped.push({ fromKm: +x.toFixed(2), toKm: +y.toFixed(2) });
      }
      for (const s of t.stops) place(s.name, [s.lat, s.lng, s.ele]);
      for (const s of t.sleepPlaces ?? []) place(s.name, [s.lat, s.lng, s.ele]);
      here = [B.lat, B.lng]; hereName = B.name;
    }
  }

  // Days: each walks or drives on to the next time the line reaches its place
  const cum = cumKm(line);
  const nearestFrom = (p, from) => { let best = -1, bd = Infinity; for (let i = from; i < line.length; i++) { const d = dist(line[i], [p.lat, p.lng]); if (d < bd) { bd = d; best = i; } if (bd < 30 && d > 2000) break; } return { i: best, d: bd }; };
  const onRoad = (k) => drives.some((d) => k > d.fromKm + 1e-6 && k <= d.toKm + 1e-6);
  const days = [], sideTrips = [], side = [];
  let idx = 0, from = C.start.name, day = 0;
  for (const d of C.days) {
    day++;
    if (d.rest) {
      // A trek's side trip from here, carried over as it was built there
      const st = d.side && (await load(d.side.trek)).sideTrips?.find((x) => x.name === d.side.name && x.from === from);
      if (d.side && !st) throw new Error(`day ${day}: ${d.side.trek} has no side trip ${d.side.name} from ${from}`);
      if (st) {
        if (!sideTrips.includes(st)) sideTrips.push(st);
        const pt = (await load(d.side.trek)).side.find((x) => x.name === st.name) ?? { name: st.name, lat: st.line.at(-1)[0], lng: st.line.at(-1)[1], ele: st.ele };
        if (!side.some((x) => x.name === pt.name)) side.push(pt);
        days.push({ day, kind: "rest", from, to: from, via: [st.name], km: +(2 * st.km).toFixed(1), up: st.up + st.down, down: st.down + st.up, sleepEle: places.get(from)?.ele ?? null, note: d.rest });
      } else days.push({ day, kind: "rest", from, to: from, sleepEle: places.get(from)?.ele ?? null, note: d.rest });
      continue;
    }
    const p = places.get(d.to);
    if (!p) throw new Error(`day ${day}: no place ${d.to}`);
    const { i, d: off } = nearestFrom(p, idx);
    if (off > 500) throw new Error(`day ${day}: ${d.to} is ${Math.round(off)} m off the line`);
    // Climb and descent on foot only: each walking run is counted on its own, so a drive between
    // two (up a road to the next trailhead) adds nothing
    let walk = 0, drive = 0, up = 0, down = 0, run = [];
    const close = () => { if (run.length > 1) { const r = upDown(run); up += r.up; down += r.down; } run = []; };
    for (let j = idx + 1; j <= i; j++) {
      const s = cum[j] - cum[j - 1];
      if (onRoad(cum[j])) { drive += s; close(); } else { walk += s; if (!run.length) run.push(line[j - 1]); run.push(line[j]); }
    }
    close();
    days.push({
      day, kind: walk > 0.05 ? "walk" : "drive", from, to: d.to, km: +walk.toFixed(1), up, down,
      ...(drive > 0.05 ? { driveKm: Math.round(drive) } : {}), sleepEle: p.ele, note: d.note,
    });
    idx = i; from = d.to;
  }

  const walkLine = line.filter((_, j) => !j || !onRoad(cum[j]));
  const stopsOut = [...places.values()].map((p) => ({ ...p, km: +(cum[nearestFrom(p, 0).i] ?? 0).toFixed(1) }))
    .filter((p) => nearestFrom(p, 0).d < 500).sort((a, b) => a.km - b.km);
  const sleepPlaces = [...new Set(days.map((d) => d.to))].map((n) => places.get(n)).map(({ name, lat, lng, ele }) => ({ name, lat, lng, ele }));
  const trail = {
    slug,
    source: `© OpenStreetMap contributors (ODbL); route by BRouter. ${C.source}`,
    builtAt: new Date().toISOString().slice(0, 10),
    lengthKm: +cum.at(-1).toFixed(1),
    ascentM: days.reduce((s, d) => s + (d.up ?? 0), 0),
    maxEleM: Math.max(...walkLine.map((p) => p[2]), ...side.map((p) => p.ele ?? 0)),
    approxKm: +unmapped.reduce((s, u) => s + u.toKm - u.fromKm, 0).toFixed(1),
    stops: stopsOut,
    side,
    sideTrips,
    detours: [],
    unmapped,
    drives,
    days,
    sleepPlaces,
    line,
  };
  await writeFile(`src/lib/trails/${slug}.json`, JSON.stringify(trail));
  const roadKm = drives.reduce((s, d) => s + d.toKm - d.fromKm, 0);
  console.log(`${slug}: ${trail.lengthKm} km (${(trail.lengthKm - roadKm).toFixed(1)} on foot, ${roadKm.toFixed(1)} by road), +${trail.ascentM} m on foot, highest ${trail.maxEleM} m, ${line.length} points`);
  for (const d of days) console.log(`  day ${String(d.day).padStart(2)} ${d.kind.padEnd(5)} ${d.from} → ${d.to}${d.km != null ? `  ${d.km} km on foot +${d.up} −${d.down}` : ""}${d.driveKm ? `, ${d.driveKm} km by road` : ""}`);
}

// index.ts imports every built trail (the same as build-trail.mjs writes)
async function writeIndex() {
  const slugs = (await readdir("src/lib/trails")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
  const id = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/^([0-9])/, "_$1");
  const src = await readFile("src/lib/trails/index.ts", "utf8");
  const head = src.slice(0, src.indexOf('import type { Trail } from "./shared";'));
  await writeFile("src/lib/trails/index.ts", `${head}import type { Trail } from "./shared";
${slugs.map((s) => `import ${id(s)} from "./${s}.json";`).join("\n")}

export * from "./shared";

const TRAILS: Record<string, Trail> = {
${slugs.map((s) => `  "${s}": ${id(s)} as unknown as Trail,`).join("\n")}
};

export const TRAIL_SLUGS = Object.keys(TRAILS);

export function getTrail(slug: string): Trail | null {
  return TRAILS[slug] ?? null;
}
`);
}

const want = process.argv.slice(2).filter((a) => !a.startsWith("--"));
for (const s of want.length ? want : Object.keys(CIRCUITS)) await build(s);
await writeIndex();
