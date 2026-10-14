// Search, sorting and small fact helpers for the Explore page (and its cards / list rows).
import { getLowestPrice, type Adventure, type Month } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";

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
// finds treks in Himachal instead of looking for that exact phrase.

const SYNONYMS: Record<string, string[]> = {
  trek: ["trekking"], treks: ["trekking"], hike: ["trekking"], hiking: ["trekking"],
  bike: ["motorcycling", "cycling"], biking: ["motorcycling", "cycling"], ride: ["motorcycling", "cycling"],
  motorbike: ["motorcycling"], cycle: ["cycling"], climb: ["mountaineering", "rock climbing"],
  kashmir: ["jammu & kashmir"], himachal: ["himachal pradesh"], uk: ["uttarakhand"],
  beginner: ["easy", "moderate"], easy: ["easy"], winter: ["dec", "jan", "feb"], snow: ["winter", "snow"],
  lake: ["lake", "lakes"], lakes: ["lake", "lakes"], pass: ["pass"], summit: ["summit", "peak"],
};

function haystack(a: Adventure): string {
  return [
    a.name, a.state, a.region, a.type, a.tagline, a.baseCamp ?? "", a.startingPoint ?? "",
    computeDifficulty(getACE(a)), ...(a.tags ?? []), ...a.bestMonths,
  ].join(" ").toLowerCase();
}

export function matchesSearch(a: Adventure, query: string): boolean {
  const words = query.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 1);
  if (words.length === 0) return true;
  const hay = haystack(a);
  return words.every((w) => hay.includes(w) || (SYNONYMS[w] ?? []).some((s) => hay.includes(s)));
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
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
 * "Recommended": in season now first, then easier before harder (so the list doesn't open on a
 * wall of Extreme treks), then Editor's Choice, then the most bookable (more operators).
 */
export function sortAdventures(list: Adventure[], key: SortKey, opts: { monthIdx: number; score?: (a: Adventure) => number }): Adventure[] {
  const out = [...list];
  const month = MONTHS[opts.monthIdx];
  const price = (a: Adventure) => getLowestPrice(a) ?? Number.MAX_SAFE_INTEGER;
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
