import type { Adventure } from "@/lib/data";

// The one number that says most about an adventure of each kind: how high a trek goes, how far
// a ride runs, how big a river's rapids get. Cards show it beside the place and type.

const BY_ALTITUDE = new Set(["Trekking", "Mountaineering", "Scrambling", "Rock Climbing", "Skiing", "Paragliding"]);
const BY_DISTANCE = new Set(["Motorcycling", "Cycling", "Jeep Safari"]);
const BY_GRADE = new Set(["River Rafting", "Kayaking"]);

/** "5,359m (Tanglang La)" → "5,359m" */
const altitude = (a: Adventure) => a.altitude?.match(/[\d,]+\s*m/)?.[0]?.replace(/\s+/g, "") ?? "";
/** "490km" → "490 km" */
const distance = (a: Adventure) => a.distance?.match(/[\d,.]+\s*km/i)?.[0]?.replace(/\s*km/i, " km") ?? "";

export function keyStat(a: Adventure): string {
  if (BY_GRADE.has(a.type)) return a.rapidGrade ?? "";
  if (BY_DISTANCE.has(a.type)) return distance(a) || altitude(a);
  if (a.type === "Diving") return a.depth ?? "";
  if (BY_ALTITUDE.has(a.type)) return altitude(a);
  return altitude(a) || distance(a);
}
