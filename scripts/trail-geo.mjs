// Small line helpers for the trail scripts (the site has the same in src/lib/trails/shared.ts)
const dist = ([la1, lo1], [la2, lo2]) => { const R = 6371000, r = Math.PI / 180; const h = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };

/** The part of `line` between two km marks, its ends placed exactly (a gap can be one long segment) */
export function lineBetweenKm(line, fromKm, toKm) {
  const out = [];
  let km = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], d = dist(a, b) / 1000, k0 = km, k1 = km + d;
    km = k1;
    if (k1 < fromKm || k0 > toKm || !d) continue;
    const at = (k) => { const f = (k - k0) / d; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
    if (!out.length) out.push(at(Math.max(fromKm, k0)));
    out.push(k1 <= toKm ? [b[0], b[1]] : at(toKm));
  }
  return out;
}
