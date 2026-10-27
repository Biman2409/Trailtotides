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

/** Highest named point on the way (stops carry OpenStreetMap's surveyed heights) */
export function trailHighPoint(t: Trail): TrailStop {
  return t.stops.reduce((hi, s) => ((s.ele ?? 0) > (hi.ele ?? 0) ? s : hi), t.stops[0]);
}

/** Distance along the line (km) against elevation (m), for profile charts */
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
  return out;
}
