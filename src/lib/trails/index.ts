// Trek trails built from OpenStreetMap by scripts/build-trail.mjs. One JSON file per trek; add
// it to TRAILS below once it has been checked on a map. The data is OpenStreetMap's (ODbL), so
// anything that shows a trail must credit "© OpenStreetMap contributors".

import everestBaseCamp from "./everest-base-camp.json";

export interface TrailStop {
  name: string;
  lat: number;
  lng: number;
  ele: number | null;
  /** Kilometres from the start, along the trail */
  km: number;
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
  /** [lat, lng, elevation in m], thinned to ~10 m accuracy */
  line: [number, number, number][];
}

const TRAILS: Record<string, Trail> = {
  "everest-base-camp": everestBaseCamp as Trail,
};

export const TRAIL_SLUGS = Object.keys(TRAILS);

export function getTrail(slug: string): Trail | null {
  return TRAILS[slug] ?? null;
}

/** Highest named point on the way (stops carry OpenStreetMap's surveyed heights) */
export function trailHighPoint(t: Trail): TrailStop {
  return t.stops.reduce((hi, s) => ((s.ele ?? 0) > (hi.ele ?? 0) ? s : hi), t.stops[0]);
}

/** Distance along the line (km) against elevation (m), for the profile chart */
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
