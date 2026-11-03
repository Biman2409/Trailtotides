// Checks that each built trail agrees with itself and with its trek page, and writes
// research/trail-consistency.md. What the site shows from one trail should tell one story:
//   profile dot   a stop's surveyed height (labels, itinerary) far from the elevation profile there
//   sleep height  a day's sleeping height far from the profile where you sleep
//   day km        a day's distance against the line between where it starts and ends
//   day climb     a day's metres up and down against the profile between the same points
//   high point    the highest stop or side trip well below the profile's peak: the top is a
//                 ridge with no name, or a pass that isn't a stop (the page then shows it unnamed)
//   page ...      the trek page's distance, days, altitude and base camp against the trail
// Run: node scripts/check-consistency.mjs   (no network; reads the built files only)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const ROOT = ".";
const DIR = `${ROOT}/src/lib/trails/`;
const DATA = readFileSync(`${ROOT}/src/lib/data.ts`, "utf8");
const dist = ([a, b], [c, d]) => { const R = 6371000, r = Math.PI / 180; const h = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const pub = (slug) => {
  const at = DATA.indexOf(`slug: "${slug}"`); const b = DATA.slice(at, at + 4000);
  const g = (re) => b.match(re)?.[1];
  return { alt: +(g(/\baltitude: "([\d,]+)/) ?? "0").replace(/,/g, ""), km: +(g(/\bdistance: "([\d.]+)/) ?? 0), days: +(g(/\bdurationDays: "(\d+)/) ?? 0), base: g(/\bbaseCamp: "([^"]+)"/) };
};
const out = [];
for (const f of readdirSync(DIR).filter((f) => f.endsWith(".json")).sort()) {
  const t = JSON.parse(readFileSync(DIR + f, "utf8"));
  const L = t.line, cum = [0];
  for (let i = 1; i < L.length; i++) cum.push(cum[i - 1] + dist(L[i - 1], L[i]));
  const kk = t.lengthKm * 1000 / cum[cum.length - 1]; for (let i = 0; i < cum.length; i++) cum[i] *= kk; // as the chart now does
  const near = (lat, lng, from = 0) => { const look = (lo) => { let b = lo, bd = Infinity; for (let i = lo; i < L.length; i++) { const d = dist([lat, lng], L[i]); if (d < bd) { bd = d; b = i; } } return { i: b, off: bd }; }; const a = look(from); return a.off <= 300 || from === 0 ? a : look(0); };
  const eleAtKm = (km) => { let i = cum.findIndex((c) => c >= km * 1000); if (i < 0) i = L.length - 1; return L[i][2]; };
  const issues = [];
  const add = (kind, text) => issues.push(`${kind}: ${text}`);

  // A. Stops drawn as dots on the profile at their own height, against the line's height there
  for (const s of t.stops) {
    if (s.ele == null) continue;
    const h = eleAtKm(s.km);
    if (Math.abs(s.ele - h) > 60) add("profile dot", `${s.name} drawn at ${s.ele} m, the profile is ${h} m at km ${s.km}`);
  }
  // B. Header high point (highest stop or side trip) against the profile's peak
  const hp = [...t.stops, ...t.side].reduce((a, s) => ((s.ele ?? 0) > (a.ele ?? 0) ? s : a), t.stops[0]);
  const peak = Math.max(...L.map((p) => p[2]));
  if ((hp.ele ?? 0) < peak - 60 || ((hp.ele ?? 0) > peak + 60 && !t.side.includes(hp))) add("high point", `header says ${hp.name} ${hp.ele} m, the profile peaks at ${peak} m`);
  // C. Each day's sleeping height against the profile where you sleep
  for (const d of t.days) {
    if (d.kind !== "walk" || d.sleepEle == null) continue;
    const p = t.sleepPlaces.find((s) => s.name === d.to); if (!p) continue;
    const n = near(p.lat, p.lng);
    if (n.off < 300 && Math.abs(d.sleepEle - L[n.i][2]) > 75) add("sleep height", `day ${d.day} sleeps at ${d.to} ${d.sleepEle} m, the profile there is ${L[n.i][2]} m`);
  }
  // D. Each walking day's km against the line between where it starts and ends (one-way days)
  // E. Its metres up/down against the profile between the same points
  const pos = new Map(t.sleepPlaces.map((s) => [s.name, s]));
  let idx = 0;
  for (const d of t.days) {
    if (d.kind !== "walk") continue;
    const A = pos.get(d.from), B = pos.get(d.to); if (!A || !B || d.via?.length || d.from === d.to) { continue; }
    const a = near(A.lat, A.lng, idx), b = near(B.lat, B.lng, a.i); idx = b.i;
    if (a.off > 300 || b.off > 300) continue;
    const km = Math.abs(cum[b.i] - cum[a.i]) / 1000;
    if (Math.abs(km - d.km) > Math.max(1, 0.2 * d.km)) add("day km", `day ${d.day} ${d.from} → ${d.to}: itinerary ${d.km} km, along the line ${km.toFixed(1)} km`);
    const step = a.i <= b.i ? 1 : -1; let up = 0, down = 0, ref = L[a.i][2];
    for (let k = a.i + step; step > 0 ? k <= b.i : k >= b.i; k += step) { const x = L[k][2] - ref; if (x >= 15) { up += x; ref = L[k][2]; } else if (x <= -15) { down -= x; ref = L[k][2]; } }
    const net = L[b.i][2] - L[a.i][2];
    if (Math.abs(d.up - d.down - net) > 120) add("day climb", `day ${d.day} ${d.from} → ${d.to}: +${d.up} −${d.down} (net ${d.up - d.down}) but the profile goes ${L[a.i][2]} → ${L[b.i][2]} m (net ${net})`);
    if (up > 200 && Math.abs(up - d.up) > Math.max(150, 0.35 * up)) add("day climb", `day ${d.day} ${d.from} → ${d.to}: +${d.up} m, the profile climbs ~${Math.round(up)} m`);
  }
  // F. Itinerary sleeping heights against the stops list for the same place
  for (const s of t.stops) {
    const sp = pos.get(s.name);
    if (sp && sp.ele != null && s.ele != null && sp.ele !== s.ele) add("two heights", `${s.name}: stop ${s.ele} m, itinerary ${sp.ele} m`);
  }
  // G. Trek page facts against the trail
  const P = pub(t.slug);
  const walk = Math.round(t.days.reduce((s, d) => s + (d.kind === "walk" ? d.km ?? 0 : 0), 0));
  if (P.km && Math.abs(P.km - walk) > 1) add("page distance", `page ${P.km} km, itinerary ${walk} km`);
  if (P.days && P.days !== t.days.length) add("page days", `page ${P.days} days, itinerary ${t.days.length}`);
  if (P.alt && Math.abs(P.alt - Math.max(hp.ele ?? 0, peak)) > 30) add("page altitude", `page ${P.alt} m, trail high point ${hp.name} ${hp.ele} m (profile peak ${peak} m)`);
  if (P.base && P.base !== t.days[0]?.from) add("page base camp", `page "${P.base}", day 1 starts at "${t.days[0]?.from}"`);
  out.push({ slug: t.slug, issues });
}
const md = ["# Trail consistency", "", `${out.length} trails checked: ${out.filter((r) => r.issues.length).length} with something to look at.`, ""];
for (const r of out) if (r.issues.length) md.push(`## ${r.slug}`, ...r.issues.map((i) => `- ${i}`), "");
md.push("## Clean", "", out.filter((r) => !r.issues.length).map((r) => r.slug).join(", "), "");
writeFileSync("research/trail-consistency.md", md.join("\n"));
console.log(`${out.length} trails checked: ${out.filter((r) => r.issues.length).length} with something to look at. Wrote research/trail-consistency.md`);
