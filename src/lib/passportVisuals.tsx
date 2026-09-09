// ─── Adventure Passport — shared visual system ─────────────────────────────
// Pure geometry, constants, and presentational components used by BOTH the
// server-rendered share images (src/app/api/passport/route.tsx, next/og —
// which restricts JSX to explicit display:"flex" and forbids bare Fragments
// and CSS calc()) and the interactive client-side book
// (src/app/profile/PassportBook.tsx). Every component here obeys those
// restrictions so it renders correctly in both contexts.

import { TYPE_ICON_DEFS } from "@/lib/mapMarkerIcons";

export const INK = "#241a12";
export const PAPER = "#f5ecd6";
export const GOLD = "#c9a24d";

export const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export function fmtDate(d: Date) { return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
export function parseISODate(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); }
export function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s; }
export function tint(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Reference pixel size the map+stamp layout is computed and drawn at — the
// share image uses it natively, the interactive book scales a container to
// this size and shrinks it back down with a CSS transform to fit responsively.
export const PASSPORT_MAP_W = 640, PASSPORT_MAP_H = 731;

export const DIFFICULTY_LEVEL: Record<string, number> = { Easy: 1, Moderate: 2, Hard: 3, Advanced: 4, Extreme: 5 };
export const DIFFICULTY_COLOR: Record<string, string> = { Easy: "#10b981", Moderate: "#38bdf8", Hard: "#a78bfa", Advanced: "#ff5100", Extreme: "#ef4444" };
// A stamp's size is the one visible signal of how hard the adventure was.
export const DIFFICULTY_STAMP_SIZE: Record<string, number> = { Easy: 84, Moderate: 100, Hard: 118, Advanced: 138, Extreme: 160 };

// Simplified India outline (mainland + a few largest islands), decimated from
// public/india-boundary.geojson, projected into a fixed 420x480 coordinate
// space. Stamp positions use the same projection so they line up with the
// silhouette regardless of what pixel size the map is rendered at.
export const INDIA_PATH =
  "M138.8,65.7 L143.5,65.5 L147.5,64.7 L151.2,61.8 L156.6,59.7 L161.9,59.7 L166.3,60.4 L169.3,63.8 L172.5,65.7 L176.4,64.7 L176.2,68.5 L174.8,73.8 L170.6,76.5 L167.2,79.7 L165.9,83.1 L162.1,85.6 L158,87.1 L158,91 L159.4,95.7 L163.7,96.6 L164.3,100.5 L165.1,104.6 L161,106.1 L157.4,107.4 L154.9,103.8 L150.9,105.8 L153.1,110 L155.4,114.1 L156.5,118.3 L156.1,122.2 L159.7,120.5 L162.8,123.3 L166.1,126.6 L170.8,127.3 L175.2,129.6 L177.2,132.7 L182.2,134.3 L186.3,137.2 L182.8,139.1 L179.1,142.3 L177.3,145.8 L176.4,149.7 L173.7,153.7 L178.1,158.2 L181.9,159 L186.2,161.3 L190.9,164.9 L195.9,167.5 L201.4,168.8 L207.9,170.8 L211.7,173.6 L217.8,175.6 L223.4,175 L227.2,174.2 L231.1,175.3 L235.6,177.7 L238.5,180.8 L242.3,182.8 L247.7,182.2 L251.4,186.1 L256.5,185.9 L263.2,188 L267.9,186.4 L272.2,188.2 L277.9,187.6 L281.9,187.5 L282.8,182.4 L280.5,178.5 L281.1,173.6 L283,169.1 L285,167 L289.4,165.6 L292.2,169.2 L291,173.9 L291.2,177.6 L292.7,180.7 L297,182.8 L302.2,183.2 L306.5,184.1 L312.2,181.8 L318.1,183.4 L325,183.2 L331.2,182.7 L336.1,181.1 L335.2,176.7 L333.6,174.1 L329.2,173 L331.9,170.1 L336.6,169.1 L340.9,169.1 L343.4,165.7 L348.2,162.8 L352.2,159 L357.5,157.8 L361.8,155.4 L365.9,152.7 L369.4,149.8 L373.8,151.1 L378.2,151.9 L381.8,150.9 L385.9,148.7 L390.8,149.3 L391.3,152.9 L394.8,154.2 L397.1,157.7 L394.5,160.1 L397.7,158.8 L401,161.9 L405.6,163.3 L407,167.3 L403.3,170.1 L401,173.6 L403.7,178 L400.3,177.8 L396.8,175.4 L391.7,176.6 L387.4,179.8 L383.5,182.5 L379.2,185 L376.2,187.8 L377.2,192.6 L375.7,197.1 L372.2,200.8 L369.4,204.6 L370.9,208.7 L367.6,213.4 L364.9,219.2 L362.1,222.2 L357.3,220.8 L353.5,219.8 L353.4,223.7 L353.3,228.8 L352.6,233.6 L350.2,235.5 L349.5,240.4 L350,244.8 L348.1,247.9 L345.1,246.5 L342.6,247.2 L342.1,242.7 L340.9,237.8 L339.6,233.2 L339,228.6 L337.6,225.4 L334.2,224.5 L333,228.6 L332.2,233.1 L328.4,234.2 L326.3,231.1 L325.3,231.2 L323.4,226.4 L324.2,223.4 L326.2,219.9 L329.8,218.2 L332.5,218.4 L334.4,215.7 L337.6,213.2 L338.2,208.7 L340.2,207.6 L336.2,205.2 L330.8,205.3 L326.1,205.1 L320.8,205 L316,205 L310.6,204.6 L305.2,203.4 L305.6,198.2 L305.6,194.3 L303.2,191.4 L302.6,192.6 L299.3,193.5 L295.9,190.8 L293.5,187.8 L294.8,190.4 L291,189.8 L289.8,188.9 L286.2,186.3 L286.8,187.6 L284.9,190.9 L282,194.4 L284.4,197 L287.7,200.4 L291.8,201.2 L293.3,204.3 L289.2,204.6 L286.6,206.9 L283.8,208.3 L281.2,211.2 L284.5,215.3 L289.7,216.6 L290.5,220.8 L288.2,223.9 L290.2,227.5 L290.1,230.5 L293.5,231.8 L292.7,236 L293.2,240.2 L294.5,244.7 L294.2,248.8 L295,252.1 L292.5,252.6 L291.1,252.6 L290.7,248.1 L288.9,247.5 L287.6,249.8 L286.8,252.5 L285.9,251.9 L284.1,253.9 L282.6,248.6 L281.3,245.3 L280.5,249.3 L275.7,252.7 L270.2,254 L266.3,256.4 L265.7,261.9 L267,264.8 L264.8,267.2 L264,269.7 L262.9,271.1 L259.1,274.9 L255.1,276.7 L249.3,278.3 L246.5,279.7 L241.3,283 L237,286.8 L234.1,290.8 L231,294.7 L226.7,298.6 L221.4,301.3 L217.9,305.1 L213.3,308.6 L208.2,311.2 L202.8,316.8 L204.4,317.1 L204.1,319.7 L202.5,321.7 L197.6,323.9 L193.2,324.2 L188.5,327.4 L186.1,332.1 L183.3,332.5 L180.4,330.7 L175.6,334.3 L173.5,339.1 L173.7,345.5 L174.7,350.5 L174.6,356.1 L175.9,361.7 L176.6,366.5 L175.7,371.7 L174.5,376.4 L171.6,381.1 L169.5,386.7 L170,391.5 L170.4,396.4 L170.5,404.1 L167.5,405.4 L164.6,405.7 L161.8,410.1 L158.4,415 L159.6,419.5 L157.3,420.2 L152.1,421.8 L147.6,425.2 L147,429.1 L144,433.3 L139.1,436.1 L133.5,433.5 L129.2,428.9 L126.2,424.6 L125.6,424.1 L124.1,420.5 L122.6,417 L121.6,410.7 L120.7,408.5 L119.2,404 L117.2,399.5 L116.2,395.4 L115,391.7 L112,387.1 L109,383.6 L106.3,380.1 L103.9,374.9 L102.4,371.4 L101,365.7 L100.4,361.4 L99.3,357.6 L97.2,352.8 L96.3,349.7 L95,346.8 L93.2,344.5 L90.5,340.6 L89.6,337.1 L87.8,334.1 L85.2,329.9 L83.5,325.7 L82.8,323.6 L83.5,322.1 L82.6,320.6 L81.6,316.6 L81.6,314.4 L81.1,311.5 L80.2,307.6 L78.8,302.9 L77.7,299.8 L78.8,299.5 L76.8,296.9 L76.6,294.1 L77.6,292 L77.4,289 L77.2,286.6 L75.1,289 L75.6,285.1 L75.6,283.9 L75.4,281.6 L73.6,277.6 L74.2,273.5 L75.9,268.6 L76.3,264.9 L75.6,262 L75,260.5 L72.8,260.3 L72.6,257.8 L74.2,255 L76.4,252.5 L71.5,252.5 L74.4,248.3 L71.3,247.3 L75.4,244.7 L72.5,244 L69,243.7 L67.2,247.8 L67.5,250.5 L67.9,253.7 L65.5,258.8 L60.8,261 L57.3,262.8 L52.2,264.7 L48,265.4 L42.9,262.9 L37.7,259.2 L33.3,254.2 L28.4,250.1 L23.7,245.4 L24.2,242.5 L27.7,244.2 L31.6,243 L34.4,242.4 L38.1,240.5 L41.3,237.9 L41.7,235.3 L39,234.7 L34.9,236.4 L31.4,237.6 L27.7,236.7 L23.8,234.9 L19.1,232.4 L18.9,230.4 L16.9,228 L17,225.4 L20.5,222.8 L16.2,224.1 L14.3,226.7 L14.1,225.3 L13.1,224.1 L16,221.3 L20.6,218.3 L23.4,217.5 L28.8,217.2 L34.2,218.6 L39.2,216.8 L45,215.2 L48.2,217.9 L52.4,215.2 L51.9,211.4 L49.1,205.3 L46.3,200.2 L42.2,198.2 L38.5,193.6 L39.7,186.9 L33.3,184.9 L31,179.4 L35.6,174.7 L39.2,169.3 L44.9,166.6 L49.6,170.7 L56.4,168.6 L62.6,167.5 L66.3,162.3 L69.3,156.7 L74.6,153.9 L79.1,149.9 L82.1,144.1 L86,139.5 L90.9,136.9 L90.8,133.5 L94.1,130.6 L97,127.3 L100.5,124.6 L98.6,122.2 L99.3,118.5 L99.5,114.3 L103.8,111.9 L108.6,110.9 L108,107.5 L103.7,106.5 L100.1,104.4 L99.9,102.6 L94.2,101.1 L88,98.6 L86.2,93.2 L85.8,87.2 L83.3,80.9 L86.8,76.8 L91.9,73.7 L90.6,69.7 L88.4,65.2 L81.8,63.3 L78.5,60.6 L72.8,61 L72,55.3 L78.4,51.1 L84.6,48.9 L86.9,46.8 L93.3,46.3 L101,44.5 L106.8,44.8 L111,48.9 L117.7,51.2 L131,60.9 Z M348.7,362.1 L348.7,363 L348.3,363.7 L349.1,364.1 L349.1,364.9 L348.8,365.2 L348.2,364.8 L347.7,364.7 L348,365.3 L348.4,365.6 L348.7,366.1 L348.8,366.6 L348.6,367.4 L348.6,368.2 L348.3,369 L347.6,369.4 L347.4,368.7 L346.9,368.6 L346.7,368.9 L346.9,369.5 L347.2,370.2 L346.8,369.7 L346.4,370.4 L346.2,371.1 L345.4,370.7 L345.3,369.9 L345.4,369.5 L345.4,368.7 L345.5,368.3 L345.8,367.8 L345.5,367.5 L345.8,366.6 L345.9,366.1 L346,365.5 L345.9,364.8 L346.5,364.3 L346.3,364.1 L346.4,363.3 L347.1,362.8 L347.4,362.3 L347.9,362.1 L348.4,361.9 Z M344.1,380 L344.4,380.6 L344.7,381.3 L344.6,382.1 L344.4,382.4 L345.2,382.4 L344.5,382.7 L344.6,383.4 L344.4,384.2 L344.8,384 L345.3,384.4 L345.2,385.2 L345,386 L344.8,386.9 L344.2,387.1 L344,387.6 L344,388.1 L344.3,387.5 L344.6,387.9 L344.7,388.7 L344.4,389.5 L344.1,389.8 L343.3,389.5 L343.1,388.9 L343,388.3 L342.8,387.9 L342.7,387 L342.1,387 L342,386 L342,385.2 L341.6,384.9 L342,384.1 L342.5,384.3 L342.8,385.1 L342.8,384.2 L342.9,383.4 L343,382.5 L343,381.7 L343.3,380.8 L343.6,380.5 L344,379.8 Z M346.8,370.7 L346.9,371 L347.2,371.4 L347.4,371.9 L347.3,372.5 L347.6,373 L347.9,373.5 L347.7,373.9 L347.6,374.5 L347.6,374.8 L347.7,375.4 L347.8,376 L347.7,376.5 L347.3,376.6 L347.3,376.9 L347,377.4 L346.7,377 L346.3,376.8 L346.2,376.9 L346.7,377.2 L346.3,377.3 L345.7,377.2 L345.5,376.9 L345.7,377.3 L346,377.8 L346.4,378.2 L346.5,378.6 L346,378.9 L345.5,378.8 L345,378.9 L344.4,379 L344.1,378.5 L344.1,377.9 L344.1,377.3 L344.1,376.7 L344.1,376.2 L344.1,375.6 L344.2,375 L344.1,374.7 L344.6,374.4 L344.9,374 L345.2,374.4 L345.2,373.8 L345.1,373.8 L344.6,374 L344.6,373.5 L344.5,372.9 L344.5,372.3 L344.5,371.8 L344.6,371.8 L345.2,371.9 L345.3,371.2 L345.8,371 L346.2,371.2 L346.7,370.9 L346.8,370.7 Z";

export const PROJ = { minLng: 68.1762, maxLng: 97.395, minLat: 8.0737, maxLat: 37.0976, W: 420, H: 480, scale: 13.511848535874162, offX: 12.6, offY: 43.91672963982097 };
export function project(lng: number, lat: number) {
  const x = (lng - PROJ.minLng) * PROJ.scale + PROJ.offX;
  const y = (PROJ.maxLat - lat) * PROJ.scale + PROJ.offY;
  return { xPct: (x / PROJ.W) * 100, yPct: (y / PROJ.H) * 100 };
}

// ─── Polygon geometry — shared by stamp outlines and the ACE radar ─────────

export function polygonVertices(cx: number, cy: number, r: number, sides: number, rotateDeg = -90): [number, number][] {
  const verts: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides + (rotateDeg * Math.PI) / 180;
    verts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return verts;
}
export function ptsStr(verts: [number, number][]): string {
  return verts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}
export function radarVertices(cx: number, cy: number, values: number[], maxVal: number, maxR: number, rotateDeg = -90): [number, number][] {
  const sides = values.length;
  const verts: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides + (rotateDeg * Math.PI) / 180;
    const r = (Math.max(0, Math.min(maxVal, values[i])) / maxVal) * maxR;
    verts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return verts;
}
export function tickLines(cx: number, cy: number, rInner: number, rOuter: number, count: number): [number, number, number, number][] {
  const lines: [number, number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    lines.push([cx + rInner * Math.cos(angle), cy + rInner * Math.sin(angle), cx + rOuter * Math.cos(angle), cy + rOuter * Math.sin(angle)]);
  }
  return lines;
}

// ─── Stamp shapes — a small, explainable system with four factors ─────────
// 1. SHAPE   — which ACE domain the adventure demands most (Engine/Chassis/
//              Elements/Mind), so the outline itself carries meaning
// 2. COLOR   — difficulty tier
// 3. SIZE    — difficulty tier
// 4. SEED    — the adventure's own slug drives rotation + a subtle per-stamp
//              size variance, so two stamps of the same domain and tier
//              still never look identical, and the same adventure always
//              redraws the same stamp (stable across re-shares)

export function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}
// Deterministic PRNG (mulberry32) — same seed always produces the same
// sequence, unlike Math.random(), so a re-generated passport is stable.
export function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// A real ink stamp is never exactly the same size twice — a ±8% seeded
// wobble on top of the difficulty-tier base size, so two adventures in the
// same tier don't look like clones of each other.
export function sizeJitter(seed: number): number {
  return 0.92 + mulberry32(seed * 13 + 5)() * 0.16;
}

export type StampDomain = "engine" | "chassis" | "elements" | "mind";
export interface ACELike { stamina: number; power: number; strength: number; agility: number; water: number; altitude: number; focus: number; nerve: number }
/** Which ACE domain an adventure leans on hardest — decides the stamp's shape family. */
export function dominantDomain(ace: ACELike): StampDomain {
  const sums: Record<StampDomain, number> = {
    engine: ace.stamina + ace.power,
    chassis: ace.strength + ace.agility,
    elements: ace.water + ace.altitude,
    mind: ace.focus + ace.nerve,
  };
  return (Object.keys(sums) as StampDomain[]).reduce((best, d) => (sums[d] > sums[best] ? d : best), "engine");
}

// Small 5-point star — used for the rank badge icon, not a stamp shape.
export function starVertices(cx: number, cy: number, rOuter: number, rInner: number, points: number, rotateDeg = -90): [number, number][] {
  const verts: [number, number][] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = i * step + (rotateDeg * Math.PI) / 180;
    verts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return verts;
}
// Mechanical cog — Engine (stamina/power) is the domain about output and
// drive, so it gets teeth, not a plain polygon.
export function gearVertices(cx: number, cy: number, rOuter: number, rInner: number, teeth: number, rotateDeg = -90): [number, number][] {
  const step = (Math.PI * 2) / teeth;
  const toothHalf = step * 0.22;
  const gapHalf = step * 0.16;
  const rot = (rotateDeg * Math.PI) / 180;
  const verts: [number, number][] = [];
  for (let i = 0; i < teeth; i++) {
    const center = i * step + rot;
    const rootCenter = center + step / 2;
    const a1 = center - toothHalf, a2 = center + toothHalf;
    const a3 = rootCenter - gapHalf, a4 = rootCenter + gapHalf;
    verts.push([cx + rOuter * Math.cos(a1), cy + rOuter * Math.sin(a1)]);
    verts.push([cx + rOuter * Math.cos(a2), cy + rOuter * Math.sin(a2)]);
    verts.push([cx + rInner * Math.cos(a3), cy + rInner * Math.sin(a3)]);
    verts.push([cx + rInner * Math.cos(a4), cy + rInner * Math.sin(a4)]);
  }
  return verts;
}
// Compass rose — Mind (focus/nerve) is about bearing and precision, so its
// mark alternates long cardinal spikes with short intercardinal ones.
export function compassVertices(cx: number, cy: number, rLong: number, rShort: number, rInner: number, points: number, rotateDeg = -90): [number, number][] {
  const angStep = Math.PI / points;
  const rot = (rotateDeg * Math.PI) / 180;
  const verts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const spikeAngle = i * 2 * angStep + rot;
    const valleyAngle = spikeAngle + angStep;
    const r = i % 2 === 0 ? rLong : rShort;
    verts.push([cx + r * Math.cos(spikeAngle), cy + r * Math.sin(spikeAngle)]);
    verts.push([cx + rInner * Math.cos(valleyAngle), cy + rInner * Math.sin(valleyAngle)]);
  }
  return verts;
}
// A scalloped seal outline built from two harmonics — Elements (water/
// altitude) reads as organic and hand-carved rather than a hard-edged
// polygon; the second, weaker ripple keeps any single stamp from looking
// like a stamped-out template of every other one.
export function burstVertices(cx: number, cy: number, rBase: number, waveAmp: number, waveCount: number, rotateDeg = -90): [number, number][] {
  const totalPoints = waveCount * 10;
  const verts: [number, number][] = [];
  for (let i = 0; i < totalPoints; i++) {
    const angle = (Math.PI * 2 * i) / totalPoints + (rotateDeg * Math.PI) / 180;
    const r = rBase + waveAmp * Math.sin(waveCount * angle) + waveAmp * 0.3 * Math.sin(waveCount * 3 * angle);
    verts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return verts;
}
// Maps a unit-space silhouette (authored around the origin, radius ~1) to a
// rotated, scaled position — shared by every hand-authored point shape below.
export function unitVertices(cx: number, cy: number, r: number, unit: [number, number][], rotateDeg: number): [number, number][] {
  const rad = (rotateDeg * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  return unit.map(([ux, uy]) => {
    const x = ux * r, y = uy * r;
    return [cx + x * cos - y * sin, cy + x * sin + y * cos];
  });
}
// Unit heraldic shield (notched top, bulging shoulders, tapered point) —
// Chassis (strength/agility) gets a load-bearing, structural mark.
export const SHIELD_UNIT: [number, number][] = [
  [-0.7, -1], [-0.12, -0.82], [0, -0.98], [0.12, -0.82], [0.7, -1],
  [1, -0.42], [0.55, 0.55], [0, 1.15], [-0.55, 0.55], [-1, -0.42],
];
// Unit beveled lozenge — an armored, faceted alternative to the shield.
export const LOZENGE_UNIT: [number, number][] = [
  [0, -1.15], [0.5, -0.62], [0.85, 0], [0.5, 0.62],
  [0, 1.15], [-0.5, 0.62], [-0.85, 0], [-0.5, -0.62],
];
// A real entry-stamp classic: a scalloped OVAL rather than a circle. Unlike
// the polygon shapes, an ellipse can't be rotated by an angle offset alone
// (its curvature isn't uniform), so points are built axis-aligned in unit
// space and then rotated as real coordinates, same as the hand-authored
// shields/lozenges above.
export function ovalBurstVertices(cx: number, cy: number, rx: number, ry: number, waveAmp: number, waveCount: number, rotateDeg: number): [number, number][] {
  const totalPoints = waveCount * 10;
  const rad = (rotateDeg * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const verts: [number, number][] = [];
  for (let i = 0; i < totalPoints; i++) {
    const angle = (Math.PI * 2 * i) / totalPoints;
    const scale = 1 + waveAmp * Math.sin(waveCount * angle);
    const ux = rx * scale * Math.cos(angle), uy = ry * scale * Math.sin(angle);
    verts.push([cx + ux * cos - uy * sin, cy + ux * sin + uy * cos]);
  }
  return verts;
}
/** Builds the outline for a domain+seed at a given radius; variant picks between two real-stamp-inspired silhouettes per domain. */
export function domainVertices(domain: StampDomain, cx: number, cy: number, r: number, rotate: number, variant: 0 | 1): [number, number][] {
  switch (domain) {
    case "engine": return variant === 0 ? gearVertices(cx, cy, r, r * 0.72, 8, rotate) : starVertices(cx, cy, r, r * 0.82, 16, rotate);
    case "chassis": return variant === 0 ? unitVertices(cx, cy, r * 1.05, SHIELD_UNIT, rotate) : unitVertices(cx, cy, r, LOZENGE_UNIT, rotate);
    case "elements": return variant === 0 ? burstVertices(cx, cy, r * 0.92, r * 0.12, 9, rotate) : ovalBurstVertices(cx, cy, r * 1.12, r * 0.86, 0.09, 9, rotate);
    case "mind": return variant === 0 ? compassVertices(cx, cy, r, r * 0.6, r * 0.32, 8, rotate) : polygonVertices(cx, cy, r, 8, rotate);
  }
}

// ─── Trip trophies — 2-3 badges earned by ONE specific completed adventure,
// derived from that adventure's own stats (not the account-wide achievement
// system in lib/achievements.ts). Every adventure has enough data to earn at
// least the domain+difficulty trophy; altitude/distance ones only appear
// when that adventure actually has the field. ──────────────────────────────

export interface TripTrophy { icon: string; label: string }

const DOMAIN_WORD: Record<StampDomain, string> = { engine: "ENDURANCE", chassis: "POWER", elements: "WILD", mind: "FEARLESS" };
const DIFFICULTY_EPITHET: Record<string, string> = { Easy: "WANDERER", Moderate: "EXPLORER", Hard: "WARRIOR", Advanced: "CHAMPION", Extreme: "MASTER" };
const DISTANCE_VERB: Record<string, string> = { Motorcycling: "RIDDEN", Cycling: "CYCLED", Trekking: "TREKKED", Scrambling: "TREKKED", "Rock Climbing": "CLIMBED" };

export function deriveTripTrophies(opts: {
  type: string; difficulty: string; domain: StampDomain; altitude?: string; distance?: string;
}): TripTrophy[] {
  const trophies: TripTrophy[] = [];

  if (opts.altitude) {
    const passMatch = opts.altitude.match(/\(([^)]+)\)/);
    const value = opts.altitude.split("(")[0].trim();
    trophies.push({
      icon: "MountainSnow",
      label: passMatch ? `${passMatch[1].toUpperCase()} CONQUERED` : `${value.toUpperCase()} SUMMIT`,
    });
  }

  if (opts.distance) {
    const verb = DISTANCE_VERB[opts.type] ?? "COVERED";
    trophies.push({ icon: "type", label: `${opts.distance.toUpperCase()} ${verb}` });
  }

  trophies.push({
    icon: opts.difficulty === "Advanced" || opts.difficulty === "Extreme" ? "Crown" : "Award",
    label: `${DOMAIN_WORD[opts.domain]} ${DIFFICULTY_EPITHET[opts.difficulty] ?? "EXPLORER"}`,
  });

  return trophies.slice(0, 3);
}

export function TypeIcon({ type, size, color }: { type: string; size: number; color: string }) {
  const def = TYPE_ICON_DEFS[type] ?? TYPE_ICON_DEFS.Mountaineering;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {(def.paths ?? []).map((d, i) => (
        <path key={`p${i}`} d={d} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {(def.circles ?? []).map((c, i) => (
        <circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} stroke={color} strokeWidth={1.8} />
      ))}
    </svg>
  );
}

// Every stamp gets a faint ink wash, a main ring, a dashed inner ring, and a
// burst of postmark ticks; Extreme adventures earn one more outer ring. The
// silhouette itself names what the adventure demands (domain), while the
// seed gives it a free full-circle rotation so no two stamps ever align —
// the visual weight and shape both say something about what it took to earn
// this particular mark.
export function StampOutline({ seed, domain, size, color, tier }: { seed: number; domain: StampDomain; size: number; color: string; tier: number }) {
  const cx = size / 2, cy = size / 2;
  const rand = mulberry32(seed);
  const rand01 = rand();
  // A shield or lozenge rotated off-axis stops reading as that shape, but
  // the gear/rosette/burst/oval/compass/octagon families all read fine at
  // any angle — only chassis stays close to upright.
  const rotate = domain === "chassis" ? (rand01 - 0.5) * 30 : rand01 * 360;
  // Second draw from the same seeded sequence picks which of the two
  // real-stamp-inspired silhouettes this domain uses — still fully
  // deterministic per adventure.
  const variant: 0 | 1 = rand() < 0.5 ? 0 : 1;
  const rOuter = size * 0.47, rMid = size * 0.35;
  const ticks = tickLines(cx, cy, size * 0.5, size * 0.57, tier >= 4 ? 24 : 16);

  const outline = [
    <polygon key="o1" points={ptsStr(domainVertices(domain, cx, cy, rOuter, rotate, variant))} fill={tint(color, 0.06)} stroke={color} strokeWidth={3} />,
    <polygon key="o2" points={ptsStr(domainVertices(domain, cx, cy, rMid, rotate, variant))} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.65} />,
    ...(tier >= 5 ? [<polygon key="o3" points={ptsStr(domainVertices(domain, cx, cy, size * 0.44, rotate, variant))} fill="none" stroke={color} strokeWidth={1} opacity={0.5} />] : []),
  ];

  const tickEls = tier >= 3 ? ticks.map(([x1, y1, x2, y2], i) => (
    <line key={`t${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.2} opacity={0.45} strokeLinecap="round" />
  )) : [];

  return (
    <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0 }}>
      {[...tickEls, ...outline]}
    </svg>
  );
}

// ─── Achievement badge icons — a small curated set covering every icon name
// used in lib/achievements.ts, drawn the same way as the type icons above ───

type BadgeIconDef = { paths?: string[]; circles?: { cx: number; cy: number; r: number }[]; lines?: { x1: number; y1: number; x2: number; y2: number }[] };
export const BADGE_ICON_DEFS: Record<string, BadgeIconDef> = {
  Timer: { lines: [{ x1: 10, y1: 2, x2: 14, y2: 2 }, { x1: 12, y1: 14, x2: 15, y2: 11 }], circles: [{ cx: 12, cy: 14, r: 8 }] },
  Dumbbell: { paths: [
    "M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z",
    "m2.5 21.5 1.4-1.4", "m20.1 3.9 1.4-1.4",
    "M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z",
    "m9.6 14.4 4.8-4.8",
  ] },
  MountainSnow: { paths: ["m8 3 4 8 5-5 5 15H2L8 3z", "M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19"] },
  Footprints: { paths: [
    "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",
    "M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",
    "M16 17h4", "M4 13h4",
  ] },
  Waves: { paths: [
    "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
  ] },
  ScanEye: { paths: [
    "M3 7V5a2 2 0 0 1 2-2h2", "M17 3h2a2 2 0 0 1 2 2v2", "M21 17v2a2 2 0 0 1-2 2h-2", "M7 21H5a2 2 0 0 1-2-2v-2",
    "M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0",
  ], circles: [{ cx: 12, cy: 12, r: 1 }] },
  Shield: { paths: ["M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"] },
  Zap: { paths: ["M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"] },
  Pickaxe: { paths: [
    "M14.531 12.469 6.619 20.38a1 1 0 1 1-3-3l7.912-7.912",
    "M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393",
    "M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z",
    "M19.686 8.314a12.501 12.501 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.319",
  ] },
  Brain: { paths: [
    "M12 18V5", "M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4", "M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5",
    "M17.997 5.125a4 4 0 0 1 2.526 5.77", "M18 18a4 4 0 0 0 2-7.464", "M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517",
    "M6 18a4 4 0 0 1-2-7.464", "M6.003 5.125a4 4 0 0 0-2.526 5.77",
  ] },
  Crown: { paths: [
    "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
    "M5 21h14",
  ] },
  Flame9000: { paths: ["M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"] },
  Award: { paths: ["M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"], circles: [{ cx: 12, cy: 8, r: 6 }] },
  CheckCircle2: { paths: ["m9 12 2 2 4-4"], circles: [{ cx: 12, cy: 12, r: 10 }] },
  Compass: { paths: ["m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"], circles: [{ cx: 12, cy: 12, r: 10 }] },
  Heart: { paths: ["M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"] },
  Star: { paths: ["M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"] },
  Camera: { paths: ["M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"], circles: [{ cx: 12, cy: 13, r: 3 }] },
  Trophy: { paths: [
    "M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978", "M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",
    "M18 9h1.5a1 1 0 0 0 0-5H18", "M4 22h16", "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z", "M6 9H4.5a1 1 0 0 1 0-5H6",
  ] },
};

export function BadgeIcon({ name, size, color }: { name: string; size: number; color: string }) {
  const def = BADGE_ICON_DEFS[name] ?? BADGE_ICON_DEFS.Trophy;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {(def.paths ?? []).map((d, i) => (
        <path key={`p${i}`} d={d} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {(def.circles ?? []).map((c, i) => (
        <circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} stroke={color} strokeWidth={2} />
      ))}
      {(def.lines ?? []).map((l, i) => (
        <line key={`l${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth={2} strokeLinecap="round" />
      ))}
    </svg>
  );
}

// ─── ACE radar — the axes always in this order, an octagon whichever way you cut it ─

export const RADAR_AXES = ["stamina", "power", "strength", "agility", "water", "altitude", "focus", "nerve"] as const;
export const RADAR_AXIS_LABELS: Record<string, string> = {
  stamina: "Stamina", power: "Power", strength: "Strength", agility: "Agility",
  water: "Water", altitude: "Altitude", focus: "Focus", nerve: "Nerve",
};
export const RADAR_AXIS_SHORT: Record<string, string> = {
  stamina: "STA", power: "PWR", strength: "STR", agility: "AGI",
  water: "WTR", altitude: "ALT", focus: "FOC", nerve: "NRV",
};

// ACE rank — same tiers as the /ace page's "Adventure Rank" ladder, keyed
// off the sum of all 8 self-assessment axes (max 40).
export const ACE_RANKS = [
  { min: 40, label: "Apex", color: "#a78bfa" },
  { min: 32, label: "Vanguard", color: "#f97316" },
  { min: 24, label: "Trailblazer", color: "#f59e0b" },
  { min: 16, label: "Navigator", color: "#4ade80" },
  { min: 8, label: "Pathfinder", color: "#22d3ee" },
];
export function getAceRank(sum: number) {
  return ACE_RANKS.find((r) => sum >= r.min) ?? null;
}

/**
 * A short physics relaxation in real pixel space: every stamp repels its
 * neighbors by its own visual radius (including the postmark tick burst),
 * pulled back toward its true geographic location by a weak spring each
 * step, then clamped to the map bounds — so the layout stays close to the
 * real map but nothing actually overlaps. Returns dispX/dispY as percentages
 * of (mapW, mapH), same coordinate space `project()` already uses.
 */
export function declutterStamps<T extends { lng: number; lat: number; difficulty: string; slug: string }>(
  items: T[], mapW: number, mapH: number
): (T & { dispX: number; dispY: number; stampScale: number })[] {
  const stampScale = items.length <= 8 ? 1 : Math.max(0.64, 1 - (items.length - 8) * 0.028);
  type Node = T & { x: number; y: number; ox: number; oy: number; r: number };
  const nodes: Node[] = items.map((s) => {
    const { xPct, yPct } = project(s.lng, s.lat);
    const size = (DIFFICULTY_STAMP_SIZE[s.difficulty] ?? 100) * stampScale * sizeJitter(hashSeed(s.slug));
    const x = (xPct / 100) * mapW, y = (yPct / 100) * mapH;
    return { ...s, x, y, ox: x, oy: y, r: size * 0.57 };
  });
  const PADDING = 5;
  for (let iter = 0; iter < 400; iter++) {
    for (const n of nodes) {
      n.x += (n.ox - n.x) * 0.02;
      n.y += (n.oy - n.y) * 0.02;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const minDist = a.r + b.r + PADDING;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          if (dist < 0.001) dist = 0.001;
          const overlap = (minDist - dist) / 2;
          const ux = dx / dist, uy = dy / dist;
          a.x -= ux * overlap; a.y -= uy * overlap;
          b.x += ux * overlap; b.y += uy * overlap;
        }
      }
    }
    for (const n of nodes) {
      n.x = Math.max(n.r, Math.min(mapW - n.r, n.x));
      n.y = Math.max(n.r, Math.min(mapH - n.r, n.y));
    }
  }
  return nodes.map((n) => ({ ...n, dispX: (n.x / mapW) * 100, dispY: (n.y / mapH) * 100, stampScale }));
}
