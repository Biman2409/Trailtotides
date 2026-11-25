import type { Trail } from "./shared";

// Each walking day as a stretch of the trail's profile, from where it starts to where it sleeps,
// for the elevation charts (the trek guide's and the map's itinerary panel).
// A place is found on the line by where it is, not by name among the stops: camps aren't stops, and
// a loop passes a village twice (Namche on the way up and down). The search runs forward from
// where the last day ended, so a loop's return days sit at the end of the chart; on a trek that
// comes back the way it went there is nothing ahead, so the place is found behind, and the return
// day's band runs right to left over the way in (the chart labels both days on that stretch).

export interface DayBand { day: number; from: number; to: number; label: string }

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");
const NEAR = 300; // metres: a place further than this from the line isn't on it

export function dayBands(trail: Trail): DayBand[] {
  const L = trail.line;
  if (L.length < 2) return [];
  const r = Math.PI / 180;
  const dist = (a: number[], b: number[]) => { const h = Math.sin(((b[0] - a[0]) * r) / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(((b[1] - a[1]) * r) / 2) ** 2; return 2 * 6371000 * Math.asin(Math.sqrt(h)); };
  // km along the line, scaled as trailProfile scales it, so bands sit on the chart's km
  const cum = [0];
  for (let i = 1; i < L.length; i++) cum.push(cum[i - 1] + dist(L[i - 1], L[i]) / 1000);
  const k = trail.lengthKm > 0 ? trail.lengthKm / cum[cum.length - 1] : 1;
  const where = new Map<string, number[]>();
  for (const p of [...trail.side, ...trail.stops, ...trail.sleepPlaces]) where.set(p.name, [p.lat, p.lng]);
  // The line point nearest a place, ahead of `from` when it is on the line there, else anywhere
  const locate = (name: string, from: number) => {
    const at = where.get(name);
    if (!at) return null;
    const look = (lo: number) => { let bi = lo, bd = Infinity; for (let i = lo; i < L.length; i++) { const d = dist(L[i], at); if (d < bd) { bd = d; bi = i; } } return { i: bi, d: bd }; };
    const ahead = look(from);
    const best = ahead.d <= NEAR || from === 0 ? ahead : look(0);
    return best.d <= NEAR ? best.i : null;
  };

  const bands: DayBand[] = [];
  let cursor = 0;
  for (const d of trail.days) {
    if (d.kind !== "walk" || !d.to) continue;
    const a0 = locate(d.from, cursor);
    if (a0 == null) continue;
    // A day that leaves the line (a detour down another valley) is shaded only up to where it leaves
    const detour = (trail.detours ?? []).find((t) => t.to === d.to && (d.from === t.from || d.via?.includes(t.from)));
    const a1 = detour ? locate(detour.from, a0) : locate(d.to, a0);
    if (a1 == null) continue;
    cursor = a1;
    if (Math.abs(cum[a1] - cum[a0]) * k < 0.2) continue;
    bands.push({ day: d.day, from: cum[a0] * k, to: cum[a1] * k, label: `${d.from} to ${d.to}, ${d.km} km, up ${fmt(d.up ?? 0)} m${d.note ? `. ${d.note}` : ""}` });
  }
  return bands;
}
