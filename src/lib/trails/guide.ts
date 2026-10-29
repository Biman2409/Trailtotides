// The trek guide: what each day of a trail's itinerary asks of you, worked out from the trail's
// line and stops. Server side, so the page ships only the numbers and small profiles.

import { haversineKm } from "@/lib/geo";
import type { Trail, TrailDay } from "./shared";

export interface GuideDay {
  day: TrailDay;
  /** Highest point walked that day (m), from the trail line */
  highM: number | null;
  /** Where the day's high point is, when it's a named place on the way */
  highAt: string | null;
  /** Walking time in hours, low and high */
  hours: [number, number] | null;
  /** Sleeping height change from the night before (m) */
  sleepGain: number | null;
  /** Up to 48 heights along the day's walk, for a small profile */
  profile: number[];
  /** Sleeping height rises too fast for the altitude: more than 500 m above 3,000 m */
  fastGain: boolean;
}

export interface Guide {
  days: GuideDay[];
  walkKm: number;
  climbM: number;
  highM: number;
  highAt: string;
  highNightM: number;
  highNightAt: string;
  nightsAbove3000: number;
  nightsAbove4000: number;
  longestDay: TrailDay | null;
  biggestClimbDay: TrailDay | null;
}

/**
 * Walking time by Naismith's rule as trekkers use it in the Himalaya: 4 km an hour, plus an hour
 * for each 500 m up and each 1,000 m down, slowed above 3,000 m where breathing sets the pace.
 */
function walkingHours(d: TrailDay, highM: number | null): [number, number] | null {
  if (d.kind !== "walk" || d.km == null) return null;
  const base = d.km / 4 + (d.up ?? 0) / 500 + (d.down ?? 0) / 1000;
  const thin = highM && highM > 3000 ? 1 + Math.min(0.4, (highM - 3000) / 5000) : 1;
  const h = base * thin;
  const round = (x: number) => Math.max(1, Math.round(x * 2) / 2);
  return [round(h * 0.85), round(h * 1.2)];
}

/** Where on the line each place is: the nearest point, searching ahead of where the last day ended */
function nearestIndex(trail: Trail, p: { lat: number; lng: number }, from: number): { i: number; off: number } {
  const look = (lo: number) => {
    let best = lo, bestD = Infinity;
    for (let i = lo; i < trail.line.length; i++) {
      const [la, lo2] = trail.line[i];
      const d = haversineKm(la, lo2, p.lat, p.lng);
      if (d < bestD) { bestD = d; best = i; }
    }
    return { i: best, off: bestD };
  };
  const ahead = look(from);
  return ahead.off <= 0.3 || from === 0 ? ahead : look(0);
}

function thin(values: number[], n: number): number[] {
  if (values.length <= n) return values;
  return Array.from({ length: n }, (_, k) => values[Math.round((k * (values.length - 1)) / (n - 1))]);
}

export function trekGuide(trail: Trail): Guide {
  const places = new Map<string, { lat: number; lng: number; ele: number | null }>();
  for (const s of [...trail.stops, ...trail.sleepPlaces]) places.set(s.name, s);
  const side = new Set(trail.side.map((s) => s.name));
  const stopAt = trail.stops.map((s) => ({ name: s.name, ele: s.ele }));

  let idx = 0;
  let lastSleep: number | null = trail.stops[0]?.ele ?? null;
  const days: GuideDay[] = trail.days.map((d) => {
    if (d.kind !== "walk") {
      const g: GuideDay = { day: d, highM: null, highAt: null, hours: null, sleepGain: d.sleepEle != null && lastSleep != null ? d.sleepEle - lastSleep : null, profile: [], fastGain: false };
      if (d.sleepEle != null) lastSleep = d.sleepEle;
      return g;
    }
    // The day's stretch of line: from where yesterday ended, through its stops, to where you sleep
    const route = [...(d.via ?? []).filter((v) => !side.has(v)), d.to].map((n) => (n ? places.get(n) : undefined)).filter(Boolean) as { lat: number; lng: number }[];
    const heights: number[] = [];
    let a = idx;
    for (const p of route) {
      const b = nearestIndex(trail, p, idx).i;
      const step = a <= b ? 1 : -1;
      for (let k = a; step > 0 ? k <= b : k >= b; k += step) heights.push(trail.line[k][2]);
      a = b;
      idx = b;
    }
    // A side trip (Kala Patthar, Gokyo Ri) is the day's high point when it's higher than the line
    const sideHigh = (d.via ?? []).filter((v) => side.has(v)).map((v) => trail.side.find((s) => s.name === v)).filter((s) => s?.ele != null);
    let highM = heights.length ? Math.max(...heights) : null;
    let highAt: string | null = null;
    // A place on the way whose published height is above the line's (a lake or meadow the
    // elevation model reads low) is the day's high point at that height
    const onWay = [...(d.via ?? []).filter((v) => !side.has(v)), d.to].map((n) => stopAt.find((s) => s.name === n));
    for (const s of [...sideHigh, ...onWay]) if (s && s.ele != null && (highM == null || s.ele > highM)) { highM = s.ele; highAt = s.name; }
    if (!highAt && highM != null) {
      // Name the high point when a stop on the way stands within 30 m of it
      const named = [...(d.via ?? []), d.to].map((n) => stopAt.find((s) => s.name === n)).find((s) => s?.ele != null && Math.abs((s.ele ?? 0) - highM!) <= 30);
      // Else a pass the day crosses, whose height may only be estimated, is where the top is
      const pass = (d.via ?? []).find((v) => !side.has(v) && /\b(pass|la|top|ghati|jot|col)\b/i.test(v));
      highAt = named?.name ?? pass ?? null;
    }
    const sleepGain = d.sleepEle != null && lastSleep != null ? d.sleepEle - lastSleep : null;
    const fastGain = sleepGain != null && d.sleepEle != null && d.sleepEle > 3000 && sleepGain > 500;
    if (d.sleepEle != null) lastSleep = d.sleepEle;
    return { day: d, highM, highAt, hours: walkingHours(d, highM), sleepGain, profile: thin(heights, 48), fastGain };
  });

  const walks = trail.days.filter((d) => d.kind === "walk");
  const nights = trail.days.filter((d) => d.to && d.sleepEle != null);
  const highNight = nights.reduce<TrailDay | null>((hi, d) => ((d.sleepEle ?? 0) > (hi?.sleepEle ?? -1) ? d : hi), null);
  const highDay = days.reduce<GuideDay | null>((hi, g) => ((g.highM ?? 0) > (hi?.highM ?? -1) ? g : hi), null);

  return {
    days,
    walkKm: Math.round(walks.reduce((s, d) => s + (d.km ?? 0), 0)),
    climbM: Math.round(walks.reduce((s, d) => s + (d.up ?? 0), 0) / 10) * 10,
    highM: highDay?.highM ?? trail.maxEleM,
    highAt: highDay?.highAt ?? (highDay ? `on day ${highDay.day.day}` : ""),
    highNightM: highNight?.sleepEle ?? 0,
    highNightAt: highNight?.to ?? "",
    nightsAbove3000: nights.filter((d) => (d.sleepEle ?? 0) > 3000).length,
    nightsAbove4000: nights.filter((d) => (d.sleepEle ?? 0) > 4000).length,
    longestDay: walks.reduce<TrailDay | null>((hi, d) => ((d.km ?? 0) > (hi?.km ?? -1) ? d : hi), null),
    biggestClimbDay: walks.reduce<TrailDay | null>((hi, d) => ((d.up ?? 0) > (hi?.up ?? -1) ? d : hi), null),
  };
}
