import type { Trail } from "./shared";

// Each walking day as a stretch of the trail's profile, from where it starts to where it sleeps,
// for the elevation charts (the trek guide's and the map's itinerary panel)

export interface DayBand { day: number; from: number; to: number; label: string }

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

export function dayBands(trail: Trail): DayBand[] {
  const bands: DayBand[] = [];
  let cursor = 0;
  const kmOf = (name: string, from: number) =>
    trail.stops.find((s) => s.name === name && s.km >= from - 0.05)?.km ?? trail.stops.find((s) => s.name === name)?.km;
  for (const d of trail.days.filter((x) => x.kind === "walk")) {
    const a0 = kmOf(d.from, cursor), a1 = d.to ? kmOf(d.to, a0 ?? cursor) : undefined;
    if (a0 == null || a1 == null || Math.abs(a1 - a0) < 0.2) continue;
    bands.push({ day: d.day, from: a0, to: a1, label: `${d.from} to ${d.to}, ${d.km} km, up ${fmt(d.up ?? 0)} m${d.note ? `. ${d.note}` : ""}` });
    cursor = Math.max(a0, a1);
  }
  return bands;
}
