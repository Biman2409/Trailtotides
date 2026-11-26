// The whole itinerary as one line, for "Fly the trail": the trail data draws a trek one way
// (Lukla to Base Camp), with side trips (Kala Patthar) and days that leave the line (Gorak Shep to
// Pheriche) routed separately. Here they're joined day by day in the order you walk them: out
// along the line, up each side trip and back, down any detour, and home the way the itinerary
// goes, often back along the line. Each day's stretch of the joined line is kept, so the fly-through
// shows the right day as the walker goes.
import type { Trail, TrailStop } from "@/lib/trails/shared";

type P = [number, number, number];
export interface FlyBand { day: number; from: number; to: number; label: string }
export interface FlyRoute {
  /** The trail with its line, length and stops' km measured along the whole itinerary */
  trail: Trail;
  bands: FlyBand[];
  /** Side trips' tops, where the walker reaches them */
  summits: { name: string; ele: number | null; km: number }[];
  /** True when the itinerary covers more than the one-way line */
  extended: boolean;
}

const R = 6371, RAD = Math.PI / 180;
const dist = (a: { 0: number; 1: number }, b: { 0: number; 1: number }) => {
  const h = Math.sin(((b[0] - a[0]) * RAD) / 2) ** 2 + Math.cos(a[0] * RAD) * Math.cos(b[0] * RAD) * Math.sin(((b[1] - a[1]) * RAD) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
/** A place this close to the line (km) is on it */
const ON_LINE = 0.6;
/** …and this close (km) to a stop is passing it again */
const NEAR_STOP = 0.15;

export function flyRoute(trail: Trail): FlyRoute {
  const main = trail.line;
  // Circuits joined by drives are built as the whole itinerary already; a trail without days
  // has nothing to follow
  if (trail.drives?.length || !trail.days.length || main.length < 2) return asIs(trail);

  const cum: number[] = [0];
  for (let i = 1; i < main.length; i++) cum.push(cum[i - 1] + dist(main[i - 1], main[i]));
  const scale = trail.lengthKm > 0 ? cum[cum.length - 1] / trail.lengthKm : 1;
  const nearestIdx = (ll: { 0: number; 1: number }) => { let b = 0, bd = Infinity; for (let i = 0; i < main.length; i++) { const d = dist(ll, main[i]); if (d < bd) { bd = d; b = i; } } return { i: b, d: bd }; };
  const coords = (name: string): [number, number] | null => {
    const s = trail.stops.find((x) => x.name === name) ?? trail.sleepPlaces.find((x) => x.name === name);
    return s ? [s.lat, s.lng] : null;
  };
  const idxAtKm = (k: number) => { let b = 0; for (let i = 0; i < cum.length; i++) if (Math.abs(cum[i] - k) < Math.abs(cum[b] - k)) b = i; return b; };
  /** Every point where the line passes a place. A line can pass one twice (a loop back to the
   *  start, a descent that rejoins the way up), so a walk picks the right pass by where it is */
  const passes = (name: string): number[] => {
    // Stops carry km on the trail's own scale (its stated length), not raw point-to-point distance
    const at = trail.stops.filter((s) => s.name === name).map((s) => idxAtKm(s.km * scale));
    // A stop's km says exactly where the line first passes it. A line can pass it again (the way
    // down rejoining the way up), found by distance: close when the line runs through the place,
    // so switchbacks winding near a village aren't taken for it; looser for a camp beside the line
    const c = coords(name);
    if (c) {
      // Each time the line comes within reach of the place is one pass, however much it winds
      // about while near: its closest point
      const ds = main.map((p) => dist(c, p));
      const reach = at.length || Math.min(...ds) <= NEAR_STOP ? NEAR_STOP : ON_LINE;
      for (let i = 0; i < ds.length; i++) {
        if (ds[i] > reach) continue;
        let j = i, best = i;
        while (j + 1 < ds.length && ds[j + 1] <= reach) { j++; if (ds[j] < ds[best]) best = j; }
        // A stop already marks this pass
        if (!at.some((k) => k >= i && k <= j)) at.push(best);
        i = j;
      }
    }
    return [...new Set(at)].sort((x, y) => x - y);
  };
  /** The pass of a place to walk to from point `from`: the next one ahead, else the nearest behind */
  const target = (name: string, from: number): number | null => {
    const ps = passes(name);
    if (!ps.length) return null;
    return ps.find((i) => i > from) ?? ps.filter((i) => i <= from).pop() ?? null;
  };

  const out: P[] = [main[0]];
  const push = (pts: P[]) => { for (const p of pts) { const l = out[out.length - 1]; if (dist(l, p) > 0.001) out.push(p); } };
  // On the trail's own scale (its stated length over the drawn line), as the itinerary measures days
  const kmNow = () => { let k = 0; for (let i = 1; i < out.length; i++) k += dist(out[i - 1], out[i]); return k / scale; };
  const alongMain = (a: number, b: number) => push(a <= b ? main.slice(a, b + 1) : main.slice(b, a + 1).reverse());

  let here = trail.days.find((d) => d.from)?.from ?? trail.stops[0].name;
  /** Where you are on the main line, or null when off it (down a detour, at a camp beside it) */
  let cur: number | null = 0;
  let extended = false;
  const summits: FlyRoute["summits"] = [];
  const bands: FlyBand[] = [];

  /** Walk from where you are to a named place, by whatever route the data has */
  const go = (to: string): boolean => {
    if (to === here) return true;
    const det = trail.detours?.find((d) => (d.from === here && d.to === to) || (d.from === to && d.to === here));
    if (det) { push(det.from === here ? det.line : [...det.line].reverse()); here = to; cur = null; extended = true; return true; }
    if (cur == null) {
      // Off the line (a camp beside it, the end of a detour): rejoin it where the way to `to` is
      // shortest, counting the off-line link a little dearer and any climb up to it, so a camp in
      // the next valley rejoins down that valley rather than over the ridge to the nearest point
      const p = out[out.length - 1];
      const ends = passes(to);
      let best: { join: number; b: number; cost: number } | null = null;
      for (let j = 0; j < main.length; j++) {
        const link = dist(p, main[j]);
        if (link > 3) continue;
        const b = ends.length ? ends.reduce((x, y) => (Math.abs(cum[y] - cum[j]) < Math.abs(cum[x] - cum[j]) ? y : x)) : null;
        if (b == null) break;
        const cost = link * 1.3 + Math.abs(cum[b] - cum[j]) + Math.max(0, main[j][2] - p[2]) / 100;
        if (!best || cost < best.cost) best = { join: j, b, cost };
      }
      if (best) { alongMain(best.join, best.b); here = to; cur = best.b; extended = true; return true; }
    }
    const from = cur ?? nearestIdx(out[out.length - 1]).i;
    const b = target(to, from);
    if (b != null) { if (b < from || cur == null) extended = true; alongMain(from, b); here = to; cur = b; return true; }
    // A camp a little off the line: walk to the nearest point, then a short link to it
    const tc = coords(to);
    if (tc) {
      const n = nearestIdx(tc);
      if (n.d < 3) { alongMain(from, n.i); push([[tc[0], tc[1], main[n.i][2]]]); here = to; cur = null; extended = true; return true; }
    }
    return false;
  };
  /** A side trip from where you are: up and back */
  const sideTrip = (name: string): boolean => {
    const t = trail.sideTrips?.find((x) => x.name === name && x.from === here);
    if (!t || t.line.length < 2) return false;
    push(t.line);
    summits.push({ name: t.name, ele: t.ele, km: kmNow() });
    push([...t.line].reverse());
    extended = true;
    return true;
  };

  for (const d of [...trail.days].sort((x, y) => x.day - y.day)) {
    if (d.kind === "travel") continue;
    const start = kmNow();
    if (d.from && d.from !== here) go(d.from);
    const done = new Set<string>();
    for (const v of d.via ?? []) { if (sideTrip(v)) done.add(v); else if (go(v)) done.add(v); }
    if (d.to && d.kind !== "rest") go(d.to);
    // A side trip from the night's camp the same day (a summit after arriving)
    for (const v of d.via ?? []) if (!done.has(v) && d.to && here === d.to && sideTrip(v)) done.add(v);
    const end = kmNow();
    if (end - start >= 0.2 && d.to) bands.push({ day: d.day, from: start, to: end, label: `Day ${d.day}: ${d.from} to ${d.to}${d.km != null ? `, ${d.km} km` : ""}` });
  }

  // Nothing beyond the one-way line: the original, untouched
  if (!extended) return asIs(trail);

  const total = kmNow();
  // Each stop at the first point of the joined line that reaches it
  const cumOut: number[] = [0];
  for (let i = 1; i < out.length; i++) cumOut.push(cumOut[i - 1] + dist(out[i - 1], out[i]));
  const firstKm = (s: TrailStop) => { let b = 0, bd = Infinity; for (let i = 0; i < out.length; i++) { const d = dist([s.lat, s.lng], out[i]); if (d < bd - 0.05) { bd = d; b = i; } } return cumOut[b] / scale; };
  const stops = trail.stops.map((s) => ({ ...s, km: Math.round(firstKm(s) * 100) / 100 }));
  return {
    trail: { ...trail, line: out, lengthKm: Math.round(total * 10) / 10, stops, unmapped: [] },
    bands, summits, extended: true,
  };
}

function asIs(trail: Trail): FlyRoute {
  return { trail, bands: [], summits: [], extended: false };
}
