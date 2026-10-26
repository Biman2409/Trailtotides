import { adventures, type Adventure, type Month } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";
import { parsePrice } from "@/lib/price";

// Destination pages (/destinations/<slug>): every region with at least two adventures,
// built from the adventure data so they stay in step with it. An adventure listed under
// "Himachal Pradesh / Ladakh" belongs to both.

export interface Destination { slug: string; name: string; adventures: Adventure[] }

const MIN_ADVENTURES = 2;
const DIFFICULTY_ORDER = ["Easy", "Moderate", "Hard", "Advanced", "Extreme"];
export const MONTHS: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function build(): Destination[] {
  const byName = new Map<string, Adventure[]>();
  for (const a of adventures) {
    for (const part of a.state.split("/").map((s) => s.trim()).filter(Boolean)) {
      byName.set(part, [...(byName.get(part) ?? []), a]);
    }
  }
  return [...byName.entries()]
    .filter(([, list]) => list.length >= MIN_ADVENTURES)
    .map(([name, list]) => ({ slug: slugify(name), name, adventures: list }))
    .sort((x, y) => y.adventures.length - x.adventures.length);
}

export const DESTINATIONS = build();

export const destinationBySlug = (slug: string) => DESTINATIONS.find((d) => d.slug === slug);

/** The destination page for an adventure's region, if it has one */
export const destinationFor = (a: Adventure) => DESTINATIONS.find((d) => d.adventures.includes(a));

export const difficultyOf = (a: Adventure) => computeDifficulty(getACE(a));

/** Cheapest operator price for an adventure, in rupees (0 when none is listed) */
export function lowestPrice(a: Adventure): number {
  const prices = a.operators.map((o) => parsePrice(o.priceFrom)).filter((p) => Number.isFinite(p) && p > 0);
  return prices.length ? Math.min(...prices) : 0;
}

const days = (a: Adventure) => parseInt(a.durationDays, 10) || 0;
// "5,359m (Tanglang La)" → 5359
const metres = (a: Adventure) => parseInt((a.altitude?.match(/[\d,]+/)?.[0] ?? "").replace(/,/g, ""), 10) || 0;
/** The altitude without its pass name: "5,359m" */
export const altitudeOf = (a: Adventure) => a.altitude?.match(/[\d,]+\s*m/)?.[0] ?? "";

/** The facts a destination page and its description are written from */
export function destinationFacts(d: Destination) {
  const list = d.adventures;
  const allTreks = list.every((a) => a.type === "Trekking");
  const noun = allTreks ? "treks" : "treks and adventures";
  const byDifficulty = DIFFICULTY_ORDER
    .map((level) => ({ level, items: list.filter((a) => difficultyOf(a) === level) }))
    .filter((g) => g.items.length > 0);
  const byDays = [...list].sort((a, b) => days(a) - days(b));
  const highest = [...list].sort((a, b) => metres(b) - metres(a))[0];
  const priced = list.filter((a) => lowestPrice(a) > 0).sort((a, b) => lowestPrice(a) - lowestPrice(b));
  const monthCounts = MONTHS.map((m) => list.filter((a) => a.bestMonths?.includes(m)).length);
  const peak = Math.max(...monthCounts);
  const bestMonths = MONTHS.filter((_, i) => peak > 0 && monthCounts[i] >= peak * 0.75);
  return {
    noun,
    count: list.length,
    byDifficulty,
    easiest: byDifficulty[0]?.items[0],
    hardest: byDifficulty[byDifficulty.length - 1]?.items[0],
    shortest: byDays[0],
    longest: byDays[byDays.length - 1],
    minDays: days(byDays[0]),
    maxDays: days(byDays[byDays.length - 1]),
    highest: metres(highest) > 0 ? highest : undefined,
    cheapest: priced[0],
    minPrice: priced[0] ? lowestPrice(priced[0]) : 0,
    monthCounts,
    bestMonths,
  };
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
