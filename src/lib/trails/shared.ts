// Trail types and helpers with no trail data in them, so browser code can use them without
// bundling every trail. The data lives in ./index (server) and is fetched per trail from
// /trails/<slug>.json in the browser.

export interface TrailStop {
  name: string;
  lat: number;
  lng: number;
  ele: number | null;
  /** Kilometres from the start, along the trail */
  km: number;
}

/** One day of the itinerary. Distances and climbs are measured along the trail line. */
export interface TrailDay {
  day: number;
  /** walk: a trekking day (it may start or end with a drive: driveKm); rest: acclimatisation,
   *  sleep in the same place; drive: by road the whole day; travel: not on foot, not drawn */
  kind: "walk" | "rest" | "travel" | "drive";
  from: string;
  /** Where you sleep that night (null on a travel day out) */
  to: string | null;
  /** Places visited on the way (Base Camp, a summit viewpoint) */
  via?: string[];
  /** On foot (the climbs too) */
  km?: number;
  up?: number;
  down?: number;
  /** By road the same day, to or from a trailhead (a circuit of treks: see Trail.drives) */
  driveKm?: number;
  /** The day starts or ends off the mapped line, so its figures are estimates */
  approx?: boolean;
  sleepEle: number | null;
  note: string;
}

/** A stretch of a line, in km from its start */
export interface TrailStretch { fromKm: number; toKm: number }

/** A stretch of the line driven by road between two treks' trailheads */
export interface TrailDrive extends TrailStretch { from: string; to: string }

/** An out-and-back trip off the main line (a summit, a lake), routed and drawn */
export interface TrailSideTrip {
  name: string;
  /** Where it starts and comes back to */
  from: string;
  ele: number | null;
  /** One way */
  km: number;
  up: number;
  down: number;
  approxKm?: number;
  /** Stretches of its line with no mapped path under them */
  unmapped?: TrailStretch[];
  line: [number, number, number][];
}

/** A day's way that leaves the main line (a different way down), routed and drawn */
export interface TrailDetour {
  from: string;
  to: string;
  km: number;
  approxKm?: number;
  unmapped?: TrailStretch[];
  line: [number, number, number][];
}

export interface Trail {
  slug: string;
  source: string;
  builtAt: string;
  /** One way, start to the last stop */
  lengthKm: number;
  ascentM: number;
  maxEleM: number;
  /** Kilometres drawn straight because no path is mapped there; their figures are estimates */
  approxKm?: number;
  stops: TrailStop[];
  /** Stretches of the main line with no mapped path or GPS track (drawn straight between their ends) */
  unmapped?: TrailStretch[];
  /** Stretches of the main line by road (a circuit of treks joined by drives: scripts/build-circuit.mjs) */
  drives?: TrailDrive[];
  /** Side trips off the main line (summit viewpoints), as points */
  side: Omit<TrailStop, "km">[];
  /** The way to each side trip the itinerary makes, routed */
  sideTrips?: TrailSideTrip[];
  /** Days that leave the main line, routed */
  detours?: TrailDetour[];
  /** Day-by-day plan, start to finish */
  days: TrailDay[];
  /** Every place the itinerary sleeps, once each, in order (for weather) */
  sleepPlaces: { name: string; lat: number; lng: number; ele: number | null }[];
  /** [lat, lng, elevation in m], thinned to ~10 m accuracy */
  line: [number, number, number][];
}

/** The drive a km mark of the line is on, if it's on one */
export const driveAt = (t: Pick<Trail, "drives">, km: number) => t.drives?.find((d) => km > d.fromKm && km <= d.toKm) ?? null;

/** Km by road over the itinerary's days */
export const trailDriveKm = (t: Trail) => Math.round(t.days.reduce((s, d) => s + (d.driveKm ?? 0), 0));

/** What the site says wherever a stretch has no mapped path and no GPS track */
export const NO_TRACK = "Tracking data unavailable for this section";
export const NO_TRACK_NOTE = "No mapped path or GPS track exists here, so the line is drawn straight between the known points. Follow your guide.";
/** What a trek's page and GPX say where accurate GPS data stops short of the trek: past a point the
 * route has never been recorded, so nothing is drawn there */
export const TRAIL_END_NOTES: Record<string, string> = {
};
/** What a trek's page says when it has no trail at all */
export const NO_GPX_NOTE = "GPX data isn't available for this trek: no recorded GPS track of the route exists yet, so it isn't drawn on the map.";

/** The part of a line between two km marks, for drawing a stretch of it */
export function lineBetweenKm(line: [number, number, number][], fromKm: number, toKm: number): [number, number][] {
  const R = 6371, r = Math.PI / 180;
  const d = (a: number[], b: number[]) => { const h = Math.sin(((b[0] - a[0]) * r) / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(((b[1] - a[1]) * r) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  // Its ends placed exactly: an unmapped gap is often one long straight segment
  const out: [number, number][] = [];
  let km = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], len = d(a, b), k0 = km, k1 = km + len;
    km = k1;
    if (k1 < fromKm || k0 > toKm || !len) continue;
    const at = (k: number): [number, number] => { const f = (k - k0) / len; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
    if (!out.length) out.push(at(Math.max(fromKm, k0)));
    out.push(k1 <= toKm ? [b[0], b[1]] : at(toKm));
  }
  return out;
}

/** Where on the main line a km mark falls, as "between A and B" (or "near A") */
export function stretchPlace(t: Trail, s: TrailStretch): string {
  const before = [...t.stops].reverse().find((p) => p.km <= s.fromKm + 0.05);
  const after = t.stops.find((p) => p.km >= s.toKm - 0.05);
  if (before && after && before !== after) return `between ${before.name} and ${after.name}`;
  return `near ${(before ?? after ?? t.stops[0]).name}`;
}

/** The side trip a day makes, if it makes one */
export const sideTripOn = (t: Trail, d: TrailDay) => (t.sideTrips ?? []).find((s) => d.via?.includes(s.name) && s.from === d.from);

/** Where the browser loads one trail from */
export const trailUrl = (slug: string) => `/trails/${slug}.json`;

/** Kilometres walked over the itinerary, there and back where the trek returns: the trek's distance */
/** Nightly sleeping-height gains, checked against the 300 to 500 m rule above 3,000 m */
export function acclimatisation(trail: Trail) {
  const nights = trail.days.filter((d) => d.sleepEle != null);
  const startEle = trail.stops[0]?.ele ?? nights[0]?.sleepEle ?? 0;
  let prev = startEle;
  const jumps: { day: number; from: number; to: number; gain: number; place: string }[] = [];
  for (const d of nights) {
    const ele = d.sleepEle!;
    const gain = ele - prev;
    if (ele > 3000 && gain > 500) jumps.push({ day: d.day, from: prev, to: ele, gain, place: d.to ?? d.from });
    prev = ele;
  }
  const highestSleep = Math.max(...nights.map((d) => d.sleepEle!), startEle);
  const restDays = trail.days.filter((d) => d.kind === "rest").length;
  return { startEle, highestSleep, restDays, jumps, nights: nights.length };
}

export const trailWalkKm = (t: Trail) => Math.round(t.days.reduce((s, d) => s + (d.kind === "walk" ? d.km ?? 0 : 0), 0));

/** Where the trip starts (day 1) and ends (the last night's stop, or day 1's start if it ends on a travel day) */
export function trailEnds(t: Trail): { from: string; to: string } {
  const from = t.days[0]?.from ?? t.stops[0].name;
  const to = [...t.days].reverse().find((d) => d.to)?.to ?? from;
  return { from, to };
}

/** The route in words: "A → B", or "Out and back from A" when it ends where it began
 *  ("Dhundi → Dhundi" looks like a typo) */
export function trailRoute(t: Trail): string {
  const { from, to } = trailEnds(t);
  return from === to ? `Out and back from ${from}` : `${from} → ${to}`;
}

/** Metres climbed over the itinerary's days */
export const trailClimbM = (t: Trail) => Math.round(t.days.reduce((s, d) => s + (d.up ?? 0), 0) / 10) * 10;

/** Highest named point on the way (stops carry OpenStreetMap's surveyed heights) */
/** The trail's highest point: side trips (a summit off the line) count, and where the line
 *  climbs higher than any named place (a ridge with no name on the map), that point, unnamed */
export function trailHighPoint(t: Trail): { name: string | null; ele: number } {
  const named = [...t.stops, ...t.side].reduce((hi, s) => ((s.ele ?? 0) > (hi.ele ?? 0) ? s : hi), t.stops[0]);
  const peak = Math.max(...t.line.map((p) => p[2]));
  return peak > (named.ele ?? 0) + 40 ? { name: null, ele: peak } : { name: named.name, ele: named.ele ?? peak };
}

/** Distance along the line (km) against elevation (m), for profile charts. The stored line is
 *  thinned, which cuts corners and comes out a few % short; its km are stretched to the trail's
 *  measured length so they match the stops' km, the itinerary and lengthKm */
export function trailProfile(t: Trail): { km: number; ele: number }[] {
  const out: { km: number; ele: number }[] = [];
  let km = 0;
  t.line.forEach((p, i) => {
    if (i > 0) {
      const [la1, lo1] = t.line[i - 1], [la2, lo2] = p;
      const r = Math.PI / 180;
      const h = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2;
      km += 2 * 6371 * Math.asin(Math.sqrt(h));
    }
    out.push({ km, ele: p[2] });
  });
  const k = km > 0 && t.lengthKm > 0 ? t.lengthKm / km : 1;
  return out.map((p) => ({ km: p.km * k, ele: p.ele }));
}
