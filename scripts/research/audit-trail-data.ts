// Audit: every trek's trail and GPX data and the trek page facts built from it, as one list of
// problems. Checks what the other checks don't: treks with no trail, the GPX's points (numbers,
// heights), stops without heights or names, page facts that disagree with the trail, and
// published heights far from the elevation model.
// Run: node --import ./tests/register.mjs scripts/research/audit-trail-data.ts
import { adventures } from "../../src/lib/data";
import { getTrail, TRAIL_SLUGS } from "../../src/lib/trails";

const out: string[] = [];
const num = (s: unknown) => { const m = String(s ?? "").replace(/,/g, "").match(/[\d.]+/); return m ? +m[0] : NaN; };
const treks = adventures.filter((a: any) => /trek/i.test(a.category ?? a.type ?? a.activity ?? "") || TRAIL_SLUGS.includes(a.slug));
const kinds = new Map<string, number>();
for (const a of adventures as any[]) { const k = a.category ?? a.type ?? a.activity ?? "?"; kinds.set(k, (kinds.get(k) ?? 0) + 1); }
console.log("adventure kinds:", JSON.stringify([...kinds]));
for (const a of adventures as any[]) {
  const t: any = getTrail(a.slug);
  const isTrek = /trek/i.test(a.category ?? a.type ?? a.activity ?? "");
  if (!t) { if (isTrek) out.push(`${a.slug}\tno-trail\tno trail, map or GPX`); continue; }
  const bad = t.line.filter((p: any) => !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || !Number.isFinite(p[2]));
  if (bad.length) out.push(`${a.slug}\tgpx\t${bad.length} line points with a missing coordinate or height`);
  if (t.line.length < 20) out.push(`${a.slug}\tgpx\tonly ${t.line.length} points`);
  for (const s of t.stops) {
    if (!s.name) out.push(`${a.slug}\tgpx\ta stop with no name`);
    if (s.ele == null) out.push(`${a.slug}\tgpx\t${s.name} has no height`);
  }
  for (const k of ["sideTrips", "detours"]) for (const s of t[k] ?? []) if (s.line.some((p: any) => !p.slice(0, 3).every(Number.isFinite))) out.push(`${a.slug}\tgpx\t${k} ${s.name ?? s.from} has bad points`);
  const maxLine = Math.max(...t.line.map((p: any) => p[2]));
  const pageAlt = num(a.altitude), pageKm = num(a.distance);
  if (Number.isFinite(pageAlt) && Math.abs(pageAlt - t.maxEleM) > 100) out.push(`${a.slug}\tpage\taltitude ${a.altitude} on the page; the trail tops out at ${t.maxEleM} m`);
  if (Number.isFinite(pageAlt) && pageAlt - maxLine > 150) out.push(`${a.slug}\theight\tpage gives ${pageAlt} m; the elevation model's highest point on the line is ${Math.round(maxLine)} m`);
  const walk = (t.days ?? []).reduce((s: number, d: any) => s + (d.km ?? 0), 0);
  if (Number.isFinite(pageKm) && walk && Math.abs(pageKm - walk) > Math.max(2, walk * 0.08)) out.push(`${a.slug}\tpage\tdistance ${a.distance} on the page; the itinerary walks ${walk.toFixed(1)} km`);
  const dur = num(a.duration), days = (t.days ?? []).length;
  if (Number.isFinite(dur) && days && dur !== days) out.push(`${a.slug}\tpage\tduration ${a.duration} on the page; the itinerary has ${days} days`);
  if (a.lat != null && t.line.length) { const r = Math.PI / 180; const dmin = Math.min(...t.line.map((p: any) => 6371000 * Math.hypot((p[0] - a.lat) * r, (p[1] - a.lng) * r * Math.cos(a.lat * r)))); if (dmin > 500) out.push(`${a.slug}\tpage\tmap pin ${Math.round(dmin)} m from the trail`); }
  for (const s of t.stops) { const p = t.line.reduce((b: any, q: any) => (Math.hypot(q[0] - s.lat, q[1] - s.lng) < Math.hypot(b[0] - s.lat, b[1] - s.lng) ? q : b)); if (s.ele != null && Math.abs(s.ele - p[2]) > 200) out.push(`${a.slug}\theight\t${s.name}: given ${s.ele} m, elevation model ${Math.round(p[2])} m there`); }
}
console.log(out.join("\n"));
console.log(`\n${out.length} findings; ${TRAIL_SLUGS.length} trails`);
