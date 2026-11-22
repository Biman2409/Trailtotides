// Search, sorting and small fact helpers for the Explore page (and its cards / list rows).
import { getLowestPrice, type Adventure, type Month } from "@/lib/data";
import { fromPrice } from "@/lib/leadPrices";
import { getACE, computeDifficulty } from "@/lib/ace";
import { editDistance, matchesWords } from "@/lib/textMatch";

export const MONTHS: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "4,298m (Hampta Pass)" → 4298. */
export function maxAltitudeM(a: Adventure): number | null {
  const m = a.altitude?.match(/([\d,]+)\s*m/i);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

export function formatAltitude(a: Adventure): string | null {
  const n = maxAltitudeM(a);
  return n ? `${n.toLocaleString("en-IN")}m` : null;
}

/** "10 days" / "5–6 Days" → 10 / 5 (shortest stated). */
export function days(a: Adventure): number {
  const m = (a.durationRange ?? a.durationDays).match(/\d+/);
  return m ? Number(m[0]) : 99;
}

const LEVEL: Record<string, number> = { Easy: 1, Moderate: 2, Hard: 3, Advanced: 4, Extreme: 5 };
export const difficultyLevel = (a: Adventure) => LEVEL[computeDifficulty(getACE(a))] ?? 3;

// ─── Search ──────────────────────────────────────────────────────────────────
// Every word must match somewhere (name, place, activity, tags, tagline) — so "himachal trek"
// finds treks in Himachal instead of looking for that exact phrase. Synonyms: src/lib/textMatch.ts

function haystack(a: Adventure): string {
  return [
    a.name, a.state, a.region, a.type, a.tagline, a.baseCamp ?? "", a.startingPoint ?? "",
    computeDifficulty(getACE(a)), ...(a.tags ?? []), ...a.bestMonths,
  ].join(" ").toLowerCase();
}

export function matchesSearch(a: Adventure, query: string): boolean {
  return matchesWords(haystack(a), query);
}

/** "Did you mean" — closest adventure names and places to a query that found nothing. */
export function searchSuggestions(all: Adventure[], query: string, limit = 3): string[] {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return [];
  const terms = [...new Set(all.flatMap((a) => [a.name, a.state, ...a.name.split(/\s+/)]))].filter((t) => t.length > 3);
  return terms
    .map((t) => ({ t, d: editDistance(q, t.toLowerCase().slice(0, Math.max(q.length, 4))) }))
    .filter((x) => x.d <= Math.max(2, Math.floor(q.length / 3)))
    .sort((x, y) => x.d - y.d || x.t.length - y.t.length)
    .slice(0, limit)
    .map((x) => x.t);
}

// Searches for places and activities that aren't on the site yet
const COMING_SOON: [RegExp, string, string][] = [
  [/\b(goa|gokarna|konkan|coast|coastal|beach|beaches|surf|surfing|kerala|varkala|kovalam|andaman|havelock|lakshadweep|island|islands|dive|diving|scuba|snorkel|snorkelling|kayak|kayaking)\b/, "Coast and island adventures", "🌊"],
  [/\b(paraglid\w*|bir|billing|skydiv\w*|balloon|hang ?glid\w*)\b/, "Air adventures", "🪂"],
  [/\b(ski|skiing|gulmarg|auli|snowboard\w*|ice skat\w*|ice climb\w*)\b/, "Snow sports", "⛷️"],
  [/\b(western ghats|sahyadri|maharashtra|karnataka|coorg|munnar|ooty|nilgiris?|tamil nadu)\b/, "Western Ghats adventures", "🌿"],
  [/\b(meghalaya|northeast|north east|arunachal|nagaland|assam|shillong|cherrapunji|tawang)\b/, "Northeast adventures", "🌧️"],
  [/\b(rajasthan|desert|thar|jaisalmer|rann|kutch)\b/, "Desert adventures", "🏜️"],
  [/\b(rock climb\w*|bouldering|caving|cave|caves|jeep safari|safari)\b/, "Those adventures", "🧗"],
];

export function comingSoonFor(query: string): { label: string; icon: string } | null {
  const q = query.toLowerCase();
  const hit = COMING_SOON.find(([re]) => re.test(q));
  return hit ? { label: hit[1], icon: hit[2] } : null;
}

// ─── Sorting ─────────────────────────────────────────────────────────────────

export type SortKey = "recommended" | "match" | "price" | "shortest" | "highest" | "az";

export const SORT_LABELS: Record<SortKey, string> = {
  recommended: "Recommended",
  match: "Best match for me",
  price: "Price: low to high",
  shortest: "Shortest first",
  highest: "Highest altitude",
  az: "A – Z",
};

/**
 * "Recommended": bookable first (an operator and a price, so the list never opens on a trek
 * nobody runs), then in season now, then easier before harder (so the list doesn't open on a
 * wall of Extreme treks), then Editor's Choice, then the most bookable (more operators).
 */
export function sortAdventures(list: Adventure[], key: SortKey, opts: { monthIdx: number; score?: (a: Adventure) => number }): Adventure[] {
  const out = [...list];
  const month = MONTHS[opts.monthIdx];
  // The price the card shows (the full trip when known), so the order matches what people read
  const price = (a: Adventure) => fromPrice(a) ?? Number.MAX_SAFE_INTEGER;
  switch (key) {
    case "match":
      if (opts.score) return out.sort((x, y) => opts.score!(y) - opts.score!(x));
      return out;
    case "price": return out.sort((x, y) => price(x) - price(y));
    case "shortest": return out.sort((x, y) => days(x) - days(y));
    case "highest": return out.sort((x, y) => (maxAltitudeM(y) ?? 0) - (maxAltitudeM(x) ?? 0));
    case "az": return out.sort((x, y) => x.name.localeCompare(y.name));
    default:
      return out.sort((x, y) =>
        Number(getLowestPrice(y) !== null) - Number(getLowestPrice(x) !== null) ||
        Number(y.bestMonths.includes(month)) - Number(x.bestMonths.includes(month)) ||
        difficultyLevel(x) - difficultyLevel(y) ||
        Number(!!y.editorChoice) - Number(!!x.editorChoice) ||
        (y.operators?.length ?? 0) - (x.operators?.length ?? 0)
      );
  }
}

// ─── Trust ───────────────────────────────────────────────────────────────────

/** Most recent operator price check, if the data records one (Operator.priceCheckedAt). */
export function latestPriceCheck(a: Adventure): Date | null {
  const dates = (a.operators ?? [])
    .map((o) => (o.priceCheckedAt ? new Date(o.priceCheckedAt) : null))
    .filter((d): d is Date => !!d && !Number.isNaN(d.getTime()));
  return dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
}
