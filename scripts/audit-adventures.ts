// Audit: every adventure record, its ACE profile and its operators, as one table plus problems.
// Run: node --import ./tests/register.mjs scripts/audit-adventures.ts
import { adventures } from "../src/lib/data";
import { getACE, hasRealACE, computeDifficulty } from "../src/lib/ace";
const rows = adventures.map((a) => {
  const ace = getACE(a);
  const sum = Object.values(ace).reduce((x, y) => x + y, 0);
  return { slug: a.slug, type: a.type, state: a.state, region: a.region, declared: a.difficulty, computed: computeDifficulty(ace), sum, real: hasRealACE(a),
    ace: Object.values(ace).join(""), alt: a.altitude ?? "", days: a.durationDays, lat: a.lat, lng: a.lng, ops: a.operators.length,
    months: a.bestMonths.join(","), feat: a.featured };
});
console.table(rows.map(({ slug, type, declared, computed, sum, real, ace, alt, days, ops }) => ({ slug: slug.slice(0, 34), type, declared, computed, sum, real, ace, alt, days, ops })));
const problems: string[] = [];
const seen = new Map<string, string>();
for (const a of adventures) {
  for (const k of ["name", "slug", "id"] as const) { const v = String(a[k]).toLowerCase(); if (seen.has(k + v)) problems.push(`duplicate ${k}: ${v}`); seen.set(k + v, a.slug); }
  if (!(a.lat > 5 && a.lat < 37.5 && a.lng > 67 && a.lng < 98)) problems.push(`${a.slug}: coordinates outside India/Nepal box (${a.lat}, ${a.lng})`);
  for (const f of ["description", "whoFor", "whoNot", "safetyNotes", "heroImage", "bestSeason", "tagline"] as const) if (!a[f] || String(a[f]).trim().length < 5) problems.push(`${a.slug}: missing ${f}`);
  if (!a.bestMonths?.length) problems.push(`${a.slug}: no bestMonths`);
  if (!a.altitude && !["Diving", "River Rafting", "Kayaking"].includes(a.type)) problems.push(`${a.slug}: no altitude`);
  if (!a.distance && ["Trekking", "Motorcycling", "Cycling"].includes(a.type)) problems.push(`${a.slug}: no distance`);
  const ace = getACE(a);
  if (!hasRealACE(a)) problems.push(`${a.slug}: ACE is an estimate (no hand-set profile)`);
  if (a.ace && hasRealACE(a)) for (const [k, v] of Object.entries(a.ace)) if (!Number.isInteger(v) || v < 0 || v > 5) problems.push(`${a.slug}: ACE ${k}=${v} out of range`);
  if (["Diving", "River Rafting", "Kayaking"].includes(a.type) && ace.water === 0) problems.push(`${a.slug}: water activity with water 0`);
  if (!["Diving", "River Rafting", "Kayaking"].includes(a.type) && ace.water > 0) problems.push(`${a.slug}: water ${ace.water} on a ${a.type}`);
  const altM = a.altitude ? Number(a.altitude.replace(/[^\d.]/g, "")) : 0;
  if (altM >= 5000 && ace.altitude < 5) problems.push(`${a.slug}: ${altM}m but altitude axis ${ace.altitude}`);
  if (altM >= 4000 && altM < 5000 && ace.altitude < 4) problems.push(`${a.slug}: ${altM}m but altitude axis ${ace.altitude}`);
  if (altM > 0 && altM < 3000 && ace.altitude > 2) problems.push(`${a.slug}: ${altM}m but altitude axis ${ace.altitude}`);
  if (a.difficulty !== computeDifficulty(ace)) problems.push(`${a.slug}: declared ${a.difficulty} vs ACE-derived ${computeDifficulty(ace)}`);
  if (a.operators.length === 0) problems.push(`${a.slug}: no operators`);
  for (const o of a.operators) { if (!o.website) problems.push(`${a.slug}: operator ${o.name} has no website`); if (!o.priceFrom) problems.push(`${a.slug}: operator ${o.name} has no price`); }
}
console.log(`\n${adventures.length} adventures, ${problems.length} findings`);
console.log(problems.join("\n"));
