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
  /** walk: a trekking day; rest: acclimatisation, sleep in the same place; travel: not on foot */
  kind: "walk" | "rest" | "travel";
  from: string;
  /** Where you sleep that night (null on a travel day out) */
  to: string | null;
  /** Places visited on the way (Base Camp, a summit viewpoint) */
  via?: string[];
  km?: number;
  up?: number;
  down?: number;
  /** The day starts or ends off the mapped line, so its figures are estimates */
  approx?: boolean;
  sleepEle: number | null;
  note: string;
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
  /** Side trips off the main line (summit viewpoints), as points */
  side: Omit<TrailStop, "km">[];
  /** Day-by-day plan, start to finish */
  days: TrailDay[];
  /** Every place the itinerary sleeps, once each, in order (for weather) */
  sleepPlaces: { name: string; lat: number; lng: number; ele: number | null }[];
  /** [lat, lng, elevation in m], thinned to ~10 m accuracy */
  line: [number, number, number][];
}

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
