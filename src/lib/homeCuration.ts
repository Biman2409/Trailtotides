// Picks and orders the adventure rows on the home page. Pure functions, so the server
// can use them (Editor's Choice, In season now) and the browser can too (Picked for you).
import type { Adventure, Month } from "@/lib/data";
import { getACE, computeDifficulty, computeMatchScore, type ACE } from "@/lib/ace";

export const MONTHS: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const LEVEL: Record<string, number> = { Easy: 1, Moderate: 2, Hard: 3, Advanced: 4, Extreme: 5 };
const level = (a: Adventure) => LEVEL[computeDifficulty(getACE(a))] ?? 3;
// India-first platform: domestic trips lead, international ones fill in.
const isDomestic = (a: Adventure) => !/nepal|bhutan/i.test(a.state);
const isBookable = (a: Adventure) => (a.operators?.length ?? 0) > 0;

/** Current month index in India, so the "in season" row flips at IST midnight, not UTC. */
export function currentMonthIndexIST(now = new Date()): number {
  return Number(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata", month: "numeric" })) - 1;
}

/**
 * Editor's Choice, mixed so the row isn't a wall of Extreme treks: deal picks round-robin across
 * difficulty tiers (easiest first, domestic first within a tier), then show them easiest → hardest.
 */
export function pickEditorsMix(all: Adventure[], count = 6): Adventure[] {
  const pool = all.filter((a) => a.editorChoice);
  const tiers = new Map<number, Adventure[]>();
  for (const a of pool) {
    const l = level(a);
    if (!tiers.has(l)) tiers.set(l, []);
    tiers.get(l)!.push(a);
  }
  for (const list of tiers.values()) list.sort((x, y) => Number(isDomestic(y)) - Number(isDomestic(x)));

  const order = [...tiers.keys()].sort((x, y) => x - y);
  const picked: Adventure[] = [];
  while (picked.length < count && order.some((l) => tiers.get(l)!.length > 0)) {
    for (const l of order) {
      const next = tiers.get(l)!.shift();
      if (next && picked.length < count) picked.push(next);
    }
  }
  return picked.sort((x, y) => level(x) - level(y));
}

export interface SeasonPick {
  adventure: Adventure;
  /** Months left in the current season window, including this one. */
  monthsLeft: number;
  /** Last month of the current window, e.g. "Nov". */
  endsIn: Month;
}

/**
 * Adventures in their best season this month. Windows closing soonest come first (that's the
 * urgency worth surfacing), then bookable ones (with operators), then easier before harder.
 */
export function inSeasonNow(all: Adventure[], monthIdx: number): { picks: SeasonPick[]; total: number } {
  const month = MONTHS[monthIdx];
  const live = all.filter((a) => a.bestMonths.includes(month));
  const picks = live.map((a) => {
    let monthsLeft = 0;
    while (monthsLeft < 12 && a.bestMonths.includes(MONTHS[(monthIdx + monthsLeft) % 12])) monthsLeft++;
    return { adventure: a, monthsLeft, endsIn: MONTHS[(monthIdx + monthsLeft - 1) % 12] };
  });
  picks.sort((x, y) =>
    x.monthsLeft - y.monthsLeft ||
    Number(isDomestic(y.adventure)) - Number(isDomestic(x.adventure)) ||
    Number(isBookable(y.adventure)) - Number(isBookable(x.adventure)) ||
    level(x.adventure) - level(y.adventure)
  );
  return { picks, total: live.length };
}

/** Best fitness matches for a Matchmaker profile; in-season ones break ties. */
export function pickedForProfile(all: Adventure[], ace: ACE, monthIdx: number, count = 8): Adventure[] {
  const month = MONTHS[monthIdx];
  return all
    .map((a) => ({ a, score: computeMatchScore(ace, getACE(a)), inSeason: a.bestMonths.includes(month) }))
    .sort((x, y) => y.score - x.score || Number(y.inSeason) - Number(x.inSeason))
    .slice(0, count)
    .map((x) => x.a);
}

/** Adventures like the ones someone saved: same activity, same state, similar difficulty. */
export function similarToSaved(all: Adventure[], savedSlugs: Set<string>, count = 8): Adventure[] {
  const saved = all.filter((a) => savedSlugs.has(a.slug));
  if (saved.length === 0) return [];
  return all
    .filter((a) => !savedSlugs.has(a.slug))
    .map((a) => {
      let score = 0;
      for (const s of saved) {
        if (a.type === s.type) score += 3;
        if (a.state === s.state) score += 2;
        score += Math.max(0, 2 - Math.abs(level(a) - level(s)));
      }
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, count)
    .map((x) => x.a);
}
