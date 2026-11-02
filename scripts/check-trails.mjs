// Checks every built trail (src/lib/trails/<slug>.json) for the things that make a trail look
// wrong on the map or its figures wrong on the page, and writes research/trail-quality.md.
//   straight      line segments over 250 m: an unmapped gap bridged in a straight line, or a
//                 path OpenStreetMap maps with very few points
//   spikes        a height far off its neighbours, or a step steeper than 1 in 1: the elevation
//                 model jumping at a cliff edge rather than the path
//   off-line      an overnight stop more than 300 m from the line, so a day's figures are measured
//                 to the wrong point
//   stop height   a stop's own height far from the line's height where it meets it
//   published     the trail's length or top height far from what the trek page says
//   days          the day lengths not adding up to the trail, or a day well beyond a usual trek day
// Run: node scripts/check-trails.mjs [<slug> ...]   (no network; reads the built files only)

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";

const DIR = "src/lib/trails";
const DATA = await readFile("src/lib/data.ts", "utf8");

function dist([la1, lo1], [la2, lo2]) {
  const R = 6371000, r = Math.PI / 180;
  const h = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// What the trek page says: the first distance and altitude after the trek's slug in data.ts
function published(slug) {
  const at = DATA.indexOf(`slug: "${slug}"`);
  if (at < 0) return {};
  const block = DATA.slice(at, at + 4000);
  const km = block.match(/\bdistance: "([\d,.]+)\s*km/i)?.[1];
  const alt = block.match(/\baltitude: "([\d,]+)\s*m/i)?.[1];
  return { km: km ? Number(km.replace(/,/g, "")) : null, alt: alt ? Number(alt.replace(/,/g, "")) : null };
}

function check(t) {
  const issues = [];
  const add = (kind, text, severity = "check") => issues.push({ kind, text, severity });
  const line = t.line;

  // Distance along the line to each point, to say where along the trail a problem is
  const cum = [0];
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + dist(line[i - 1], line[i]));
  const at = (i) => `km ${(cum[i] / 1000).toFixed(1)}`;

  // Straight segments. The line is thinned to 10 m accuracy, so a few hundred metres straight is
  // usually a path that really runs straight; only very long ones suggest a bridged gap
  const straight = [];
  for (let i = 1; i < line.length; i++) {
    const d = dist(line[i - 1], line[i]);
    if (d > 500) straight.push({ i, d });
  }
  if (straight.length) {
    const worst = straight.sort((a, b) => b.d - a.d).slice(0, 3).map((x) => `${Math.round(x.d)} m at ${at(x.i)}`).join(", ");
    add("straight", `${straight.length} straight segment${straight.length === 1 ? "" : "s"} over 500 m (${worst})`);
  }

  // Elevation spikes: a point far from both neighbours, or a step steeper than 1 in 1
  const spikes = [];
  for (let i = 1; i < line.length - 1; i++) {
    const [, , e0] = line[i - 1], [, , e] = line[i], [, , e1] = line[i + 1];
    const off = e - (e0 + e1) / 2;
    if (Math.abs(off) > 60 && Math.sign(e - e0) !== Math.sign(e1 - e)) spikes.push({ i, off });
  }
  const steep = [];
  for (let i = 1; i < line.length; i++) {
    const d = dist(line[i - 1], line[i]);
    if (d > 20 && Math.abs(line[i][2] - line[i - 1][2]) > d) steep.push(i);
  }
  if (spikes.length) add("spikes", `${spikes.length} height spike${spikes.length === 1 ? "" : "s"} (worst ${Math.round(Math.max(...spikes.map((s) => Math.abs(s.off))))} m at ${at(spikes.sort((a, b) => Math.abs(b.off) - Math.abs(a.off))[0].i)})`, spikes.length > 3 ? "fix" : "check");
  if (steep.length) add("spikes", `${steep.length} step${steep.length === 1 ? "" : "s"} steeper than 1 in 1 (first at ${at(steep[0])})`, "check");

  // Overnight stops: distance to the line, and height against the line's height there
  for (const s of [...(t.stops ?? []), ...(t.sleepPlaces ?? [])]) {
    let best = Infinity, bi = 0;
    line.forEach((p, i) => { const d = dist([s.lat, s.lng], p); if (d < best) { best = d; bi = i; } });
    if (best > 300) add("off-line", `${s.name} is ${Math.round(best)} m from the line`, best > 1000 ? "fix" : "check");
    if (s.ele != null && Math.abs(s.ele - line[bi][2]) > 150) add("stop height", `${s.name}: stop at ${s.ele} m, line at ${line[bi][2]} m where it passes`);
  }
  // A stop listed twice (stops and sleepPlaces) is reported once
  const seen = new Set();
  for (let k = issues.length - 1; k >= 0; k--) { const key = issues[k].kind + issues[k].text; if (seen.has(key)) issues.splice(k, 1); else seen.add(key); }

  // Days. The line is drawn one way; out-and-back treks walk most of it twice, so their days
  // add up to about double the line
  const walk = (t.days ?? []).filter((d) => d.kind === "walk");
  const dayKm = walk.reduce((s, d) => s + (d.km ?? 0), 0);
  const outAndBack = walk.length > 0 && dayKm > t.lengthKm * 1.5;
  if (walk.length && !outAndBack && Math.abs(dayKm - t.lengthKm) > Math.max(1, t.lengthKm * 0.1)) add("days", `days add up to ${dayKm.toFixed(1)} km but the trail is ${t.lengthKm} km`);
  for (const d of walk) {
    if (d.km > 25) add("days", `day ${d.day} (${d.from} to ${d.to}) is ${d.km} km`);
    if (d.up > 1500) add("days", `day ${d.day} (${d.from} to ${d.to}) climbs ${d.up} m`);
  }

  // Against the trek page: its distance is the whole walk (both ways for an out-and-back), and
  // its top height may be a side trip (Kala Patthar, Gokyo Ri) kept apart from the line
  const pub = published(t.slug);
  const walked = walk.length ? dayKm : t.lengthKm;
  if (pub.km && (walked < pub.km * 0.7 || walked > pub.km * 1.3)) add("published", `the days walk ${walked.toFixed(1)} km; the trek page says ${pub.km} km`, "fix");
  const top = Math.max(t.maxEleM, ...(t.side ?? []).map((s) => s.ele ?? 0));
  if (pub.alt && Math.abs(top - pub.alt) > 200) add("published", `highest point ${top} m; the trek page says ${pub.alt} m`);

  if (t.approxKm > 0) add("estimated", `${t.approxKm} km drawn along the terrain (no mapped path)`, "check");
  return { slug: t.slug, km: t.lengthKm, ascent: t.ascentM, approx: t.approxKm, pts: line.length, issues };
}

const only = process.argv.slice(2);
const files = (await readdir(DIR)).filter((f) => f.endsWith(".json") && (!only.length || only.includes(f.replace(/\.json$/, ""))));
const results = [];
for (const f of files) results.push(check(JSON.parse(await readFile(`${DIR}/${f}`, "utf8"))));
results.sort((a, b) => b.issues.filter((i) => i.severity === "fix").length - a.issues.filter((i) => i.severity === "fix").length || b.issues.length - a.issues.length);

const clean = results.filter((r) => !r.issues.length);
const lines = [
  `# Trail quality`,
  ``,
  `${results.length} trails checked: ${results.filter((r) => r.issues.some((i) => i.severity === "fix")).length} need fixing, ${results.filter((r) => r.issues.length && !r.issues.some((i) => i.severity === "fix")).length} worth a look, ${clean.length} clean.`,
  ``,
  ...results.filter((r) => r.issues.length).flatMap((r) => [
    `## ${r.slug} (${r.km} km, ${r.ascent} m up${r.approx ? `, ${r.approx} km estimated` : ""})`,
    ...r.issues.map((i) => `- ${i.severity === "fix" ? "**Fix**" : "Check"} · ${i.kind}: ${i.text}`),
    ``,
  ]),
  clean.length ? `## Clean\n\n${clean.map((r) => r.slug).join(", ")}` : "",
];
await mkdir("research", { recursive: true });
await writeFile("research/trail-quality.md", lines.join("\n") + "\n");
console.log(lines.join("\n"));
