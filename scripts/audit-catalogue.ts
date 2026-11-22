// Audit: catalogue data quality — duplicates, coordinates, seasons, prices, images, operators, cross-surface lead price.
// Run: node --import ./tests/register.mjs scripts/audit-catalogue.ts
import fs from "node:fs";
import { adventures, getLowestPrice } from "../src/lib/data";
import { difficultyOf } from "../src/lib/ace";
import leadPrices from "../src/lib/leadPrices.json";

const issues: Record<string, string[]> = {};
const add = (k: string, m: string) => (issues[k] ??= []).push(m);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Rough bounding boxes for the states used
const BOX: Record<string, [number, number, number, number]> = {
  Uttarakhand: [28.7, 31.5, 77.5, 81.1], "Himachal Pradesh": [30.3, 33.3, 75.5, 79.1], Ladakh: [32.2, 36.0, 75.3, 80.4],
  "Jammu & Kashmir": [32.2, 35.2, 73.3, 76.9], "Jammu and Kashmir": [32.2, 35.2, 73.3, 76.9], Sikkim: [27.0, 28.2, 88.0, 88.95],
  "West Bengal": [21.5, 27.3, 85.8, 89.9], Nepal: [26.3, 30.5, 80.0, 88.3],
};

const names = new Map<string, string>(), slugs = new Set<string>(), coords = new Map<string, string>(), heroes = new Map<string, string[]>();
for (const a of adventures) {
  if (slugs.has(a.slug)) add("duplicate slug", a.slug); slugs.add(a.slug);
  const n = a.name.toLowerCase().replace(/\btrek\b|[^a-z]/g, "");
  if (names.has(n)) add("near-duplicate name", `${a.slug} ~ ${names.get(n)}`); names.set(n, a.slug);
  const c = `${a.lat.toFixed(3)},${a.lng.toFixed(3)}`;
  if (coords.has(c)) add("same coordinates", `${a.slug} = ${coords.get(c)} (${c})`); coords.set(c, a.slug);
  const box = BOX[a.state];
  if (!box) add("state without bounding box (unchecked coords)", `${a.slug}: ${a.state}`);
  else if (a.lat < box[0] || a.lat > box[1] || a.lng < box[2] || a.lng > box[3]) add("coordinates outside state", `${a.slug}: ${a.lat},${a.lng} not in ${a.state}`);
  (heroes.get(a.heroImage) ?? heroes.set(a.heroImage, []).get(a.heroImage)!).push(a.slug);
  if (a.heroImage.startsWith("/") && !fs.existsSync("public" + a.heroImage.split("?")[0])) add("hero image file missing", `${a.slug}: ${a.heroImage}`);
  for (const f of ["description", "whoFor", "whoNot", "safetyNotes", "bestSeason", "tagline"] as const) if (!a[f] || String(a[f]).trim().length < 10) add("missing/short field", `${a.slug}.${f}`);
  if (!a.altitude && a.type === "Trekking") add("trek without altitude", a.slug);
  if (!a.distance && a.type === "Trekking") add("trek without distance", a.slug);
  if (!a.bestMonths.length) add("no bestMonths", a.slug);
  // bestSeason text vs bestMonths
  const seasonMonths = MONTHS.filter((m) => new RegExp(`\\b${m}`, "i").test(a.bestSeason));
  if (seasonMonths.length >= 2) {
    const [s, e] = [MONTHS.indexOf(seasonMonths[0]), MONTHS.indexOf(seasonMonths[seasonMonths.length - 1])];
    if (/[–-]/.test(a.bestSeason) && seasonMonths.length === 2) {
      const range: string[] = []; for (let i = s; ; i = (i + 1) % 12) { range.push(MONTHS[i]); if (i === e || range.length > 12) break; }
      const bm = new Set(a.bestMonths as string[]);
      const missing = range.filter((m) => !bm.has(m)), extra = [...bm].filter((m) => !range.includes(m));
      if (missing.length || extra.length) add("bestSeason text vs bestMonths", `${a.slug}: "${a.bestSeason}" vs [${a.bestMonths.join(",")}]${missing.length ? " missing " + missing : ""}${extra.length ? " extra " + extra : ""}`);
    }
  }
  const days = parseInt(a.durationDays); if (!days) add("unparseable durationDays", `${a.slug}: ${a.durationDays}`);
  // operators
  const opNames = new Set<string>();
  for (const o of a.operators) {
    if (opNames.has(o.name)) add("operator listed twice on one adventure", `${a.slug}: ${o.name}`); opNames.add(o.name);
    const p = parseInt(o.priceFrom.replace(/[^\d]/g, ""));
    if (!p) add("operator price unparseable", `${a.slug}/${o.name}: ${o.priceFrom}`);
    else if (p < 3000 || p > 400000) add("operator price out of range", `${a.slug}/${o.name}: ${o.priceFrom}`);
    if (!o.website) add("operator without website", `${a.slug}/${o.name}`);
    if (!o.priceCheckedAt) add("operator price has no checked date", `${a.slug}/${o.name}`);
    else if ((Date.now() - Date.parse(o.priceCheckedAt)) / 864e5 > 90) add("operator price checked >90 days ago", `${a.slug}/${o.name}: ${o.priceCheckedAt}`);
    if (!o.googleRating) add("operator rating 0", `${a.slug}/${o.name}`);
  }
  // lead price consistency
  const lp = (leadPrices as Record<string, unknown>)[a.slug] as { price?: number } | number | undefined;
  const lead = typeof lp === "number" ? lp : lp?.price;
  const low = getLowestPrice(a);
  if (a.operators.length && lead != null && low != null && lead !== low) add("leadPrices.json vs lowest operator priceFrom", `${a.slug}: lead ${lead} vs lowest ${low}`);
  if (a.featured && !a.operators.length) add("featured but no operators", a.slug);
  if (a.editorChoice && !a.operators.length) add("editor's choice but no operators", a.slug);
  if (/[Ee]xtreme/.test(difficultyOf(a)) && a.type === "Trekking") add("trek rated Extreme", a.slug);
}
for (const [img, s] of heroes) if (s.length > 1) add("hero image shared", `${img}: ${s.join(", ")}`);

console.log(`${adventures.length} adventures, types:`, Object.entries(adventures.reduce((m, a) => ((m[a.type] = (m[a.type] || 0) + 1), m), {} as Record<string, number>)));
console.log("difficulty spread:", Object.entries(adventures.reduce((m, a) => ((m[difficultyOf(a)] = (m[difficultyOf(a)] || 0) + 1), m), {} as Record<string, number>)));
console.log("operators per adventure:", Object.entries(adventures.reduce((m, a) => ((m[a.operators.length] = (m[a.operators.length] || 0) + 1), m), {} as Record<string, number>)));
for (const [k, v] of Object.entries(issues)) { console.log(`\n## ${k} (${v.length})`); v.slice(0, 15).forEach((x) => console.log("  " + x)); if (v.length > 15) console.log(`  …+${v.length - 15}`); }
