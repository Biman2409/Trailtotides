// Audit: how often the match score calls someone "Ready" or "Stretch" despite a large gap on one axis.
// Run: node --import ./tests/register.mjs scripts/audit-ace.ts
import { adventures } from "../src/lib/data";
import { getACE, computeMatchScore, type ACE } from "../src/lib/ace";
import { bucketFor, AXES } from "../src/lib/fitness";
import { TIER_LIST, getTierLabel } from "../src/lib/tiers";
let pairs = 0, readyGap2 = 0, readyGap3 = 0, stretchGap3 = 0; const examples: string[] = [];
// Every profile with one weak axis (1 or 2) and every other axis at 3, 4 or 5
for (const base of [3, 4, 5]) for (const weakAxis of AXES) for (const weak of [1, 2]) {
  const ace = Object.fromEntries(AXES.map((ax) => [ax, ax === weakAxis ? weak : base])) as unknown as ACE;
  for (const a of adventures) {
    const req = getACE(a); const s = computeMatchScore(ace, req); const b = bucketFor(s).key; pairs++;
    const maxGap = Math.max(...AXES.map((ax) => (req[ax] > 0 ? req[ax] - ace[ax] : 0)));
    if (b === "ready" && maxGap >= 3) { readyGap3++; if (examples.length < 8) examples.push(`${a.slug}: ${weakAxis}=${weak} (needs ${req[weakAxis]}), rest ${base} -> ${s}% Ready`); }
    else if (b === "ready" && maxGap === 2) readyGap2++;
    if (b === "stretch" && maxGap >= 3) stretchGap3++;
  }
}
console.log({ pairs, readyGap2, readyGap3, stretchGap3 }); console.log(examples.join("\n"));
// Rank coverage over every possible total 8..40
const counts: Record<string, number> = {}; for (let t = 8; t <= 40; t++) counts[getTierLabel(t)] = (counts[getTierLabel(t)] ?? 0) + 1;
console.log("totals per rank", counts, TIER_LIST.map((t) => `${t.label}>=${t.minScore}`).join(" "));
