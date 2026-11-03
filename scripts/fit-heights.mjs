// Makes a built trail tell one story about height. The line's heights come from a 90 m elevation
// model, which reads narrow summits and passes low; the stops carry their published heights
// (trek-configs ele). Left as they are, a pass's dot floats above the profile and a day's climb
// doesn't add up to the change in where you sleep. This:
//   1. bends the line to each stop's height, along a 35% slope either side of it, so the profile
//      runs through the stop instead of under it
//   2. names the line's highest point when it is a pass a day crosses but not a stop, so the
//      header's high point is the real one (Gadsar Pass, Kongmaru La)
//   3. adds the bend to the climbs of the days that cross it, and to the trail's total
//   4. sets the highest point from the line, the stops and the side trips
// Called by build-trail.mjs before it saves; run on the saved trails without a rebuild with
//   node scripts/fit-heights.mjs [<slug> ...]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const dist = ([a, b], [c, d]) => { const R = 6371000, r = Math.PI / 180; const h = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const GRADE = 0.35; // a stop's height spreads along the line at this slope
const NEAR = 300; // a stop further than this from the line isn't on it (side trips, off-line camps)
const PASS = /\b(pass|la|top|khal|ri|ghati|danda)\b/i;

const along = (line) => { const c = [0]; for (let i = 1; i < line.length; i++) c.push(c[i - 1] + dist(line[i - 1], line[i])); return c; };
const nearest = (line, p, from = 0) => {
  const look = (lo) => { let b = lo, bd = Infinity; for (let i = lo; i < line.length; i++) { const d = dist(line[i], [p.lat, p.lng]); if (d < bd) { bd = d; b = i; } } return { i: b, off: bd }; };
  const a = look(from);
  return a.off <= NEAR || from === 0 ? a : look(0);
};
// Climb between two line points, as the builder counts it: heights averaged over ±150 m, then
// only changes of 15 m or more
function climb(h, cum, a, b) {
  const sm = h.map((_, i) => { let s = 0, n = 0; for (let k = i; k >= 0 && cum[i] - cum[k] <= 150; k--) { s += h[k]; n++; } for (let k = i + 1; k < h.length && cum[k] - cum[i] <= 150; k++) { s += h[k]; n++; } return s / n; });
  const step = a <= b ? 1 : -1; let up = 0, down = 0, ref = sm[a];
  for (let k = a + step; step > 0 ? k <= b : k >= b; k += step) { const d = sm[k] - ref; if (d >= 15) { up += d; ref = sm[k]; } else if (d <= -15) { down -= d; ref = sm[k]; } }
  return { up, down };
}

export function fitTrail(t) {
  const line = t.line, cum = along(line);
  const before = line.map((p) => p[2]);

  // 1. Bend the line to the stops' heights, at the km the profile draws each stop at
  const total = cum[cum.length - 1];
  for (const s of t.stops) {
    if (s.ele == null) continue;
    if (nearest(line, s).off > NEAR) continue;
    let at = cum.findIndex((c) => (c / total) * t.lengthKm >= s.km);
    if (at < 0) at = line.length - 1;
    const n = { i: at };
    if (Math.abs(line[n.i][2] - s.ele) < 15) continue;
    const up = s.ele > line[n.i][2];
    for (let k = 0; k < line.length; k++) {
      const cone = s.ele - (up ? 1 : -1) * GRADE * Math.abs(cum[k] - cum[n.i]);
      if (up ? cone > line[k][2] : cone < line[k][2]) line[k][2] = Math.round(cone);
    }
  }

  // 2. Name the highest point when it is a pass the itinerary crosses but not a stop
  let pi = 0; line.forEach((p, i) => { if (p[2] > line[pi][2]) pi = i; });
  const named = Math.max(...t.stops.map((s) => s.ele ?? 0));
  if (line[pi][2] > named + 40) {
    // The day whose stretch of line holds the peak, from where it starts to where it ends
    const at = (name, from) => { const p = t.sleepPlaces.find((s) => s.name === name) ?? t.stops.find((s) => s.name === name); return p ? nearest(line, p, from) : null; };
    let idx = 0, pass = null;
    for (const d of t.days) {
      if (d.kind !== "walk") continue;
      const A = at(d.from, idx), B = A && at(d.to, A.i);
      if (!A || !B) continue;
      if (Math.min(A.i, B.i) <= pi && pi <= Math.max(A.i, B.i)) {
        const cands = (d.via ?? []).filter((v) => PASS.test(v) && !t.stops.some((s) => s.name === v) && !t.side.some((s) => s.name === v));
        if (cands.length === 1) pass = cands[0];
        break;
      }
      idx = B.i;
    }
    if (pass) {
      const km = +(cum[pi] / cum[cum.length - 1] * t.lengthKm).toFixed(1);
      const stop = { name: pass, lat: line[pi][0], lng: line[pi][1], ele: line[pi][2], km };
      const k = t.stops.findIndex((s) => s.km > km);
      t.stops.splice(k < 0 ? t.stops.length : k, 0, stop);
    }
  }

  // Where you sleep is the stop's height
  for (const d of t.days) {
    const s = t.stops.find((p) => p.name === (d.to ?? d.from));
    if (s && d.sleepEle != null) d.sleepEle = s.ele;
  }
  for (const p of t.sleepPlaces) { const s = t.stops.find((q) => q.name === p.name); if (s) p.ele = s.ele; }

  // 3. The bend's extra climb, day by day and in all
  const after = line.map((p) => p[2]);
  const changed = after.some((h, i) => h !== before[i]);
  {
    let idx = 0;
    for (const d of t.days) {
      if (d.kind !== "walk") continue;
      const A = t.sleepPlaces.find((s) => s.name === d.from) ?? t.stops.find((s) => s.name === d.from);
      const B = t.sleepPlaces.find((s) => s.name === d.to) ?? t.stops.find((s) => s.name === d.to);
      if (!A || !B) continue;
      const a = nearest(line, A, idx);
      // A day out and back to the same place climbs whatever its via stops on the line add
      const viaStops = (d.via ?? []).map((v) => t.stops.find((s) => s.name === v)).filter(Boolean);
      const pts = [a, ...viaStops.map((v) => nearest(line, v, a.i)), nearest(line, B, a.i)];
      if (pts.some((p) => p.off > NEAR)) {
        // Routed off the line (down another valley): its ends are where you slept, so the day's
        // net climb is the change in sleeping height; the difference goes on the longer side
        const prev = t.days[t.days.indexOf(d) - 1];
        const gap = prev?.sleepEle != null && d.sleepEle != null ? (d.sleepEle - prev.sleepEle) - (d.up - d.down) : 0;
        if (Math.abs(gap) > 30) { if (d.down >= d.up) d.down = Math.max(0, Math.round((d.down - gap) / 10) * 10); else d.up = Math.max(0, Math.round((d.up + gap) / 10) * 10); }
        continue;
      }
      if (!changed) { idx = pts[pts.length - 1].i; continue; }
      let dUp = 0, dDown = 0;
      for (let j = 1; j < pts.length; j++) {
        const x = climb(before, cum, pts[j - 1].i, pts[j].i), y = climb(after, cum, pts[j - 1].i, pts[j].i);
        dUp += y.up - x.up; dDown += y.down - x.down;
      }
      d.up = Math.max(0, Math.round((d.up + dUp) / 10) * 10);
      d.down = Math.max(0, Math.round((d.down + dDown) / 10) * 10);
      idx = pts[pts.length - 1].i;
    }
    const x = climb(before, cum, 0, line.length - 1), y = climb(after, cum, 0, line.length - 1);
    if (changed) t.ascentM = Math.round((t.ascentM + y.up - x.up) / 10) * 10;
  }

  // 4. The highest point, side trips included
  t.maxEleM = Math.max(...line.map((p) => p[2]), ...[...t.stops, ...t.side].map((p) => p.ele ?? 0));
  return t;
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/fit-heights.mjs")) {
  const DIR = "src/lib/trails/";
  const only = process.argv.slice(2);
  for (const f of readdirSync(DIR).filter((f) => f.endsWith(".json") && (!only.length || only.includes(f.slice(0, -5))))) {
    const t = JSON.parse(readFileSync(DIR + f, "utf8"));
    const was = JSON.stringify(t);
    fitTrail(t);
    if (JSON.stringify(t) !== was) { writeFileSync(DIR + f, JSON.stringify(t)); console.log(`${t.slug}: fitted (highest ${t.maxEleM} m, +${t.ascentM} m)`); }
  }
}
