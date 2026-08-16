import type { Month } from "./data";

const MONTH_ORDER: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const ENDING_SOON_WEEKS = 6;
const OPENS_SOON_WEEKS = 8;

export type SeasonUrgency =
  | { kind: "ending"; weeksLeft: number }
  | { kind: "in-season" }
  | { kind: "upcoming"; weeksUntil: number };

export function getSeasonUrgency(bestMonths: Month[], today: Date = new Date()): SeasonUrgency | null {
  if (!bestMonths || bestMonths.length === 0 || bestMonths.length >= 12) return null;

  const monthSet = new Set(bestMonths);
  const curIdx = today.getMonth();

  if (monthSet.has(MONTH_ORDER[curIdx])) {
    // Walk forward from the current month to find the end of this contiguous run.
    let endIdx = curIdx;
    let steps = 0;
    while (steps < 11 && monthSet.has(MONTH_ORDER[(endIdx + 1) % 12])) {
      endIdx = (endIdx + 1) % 12;
      steps++;
    }
    const endYear = today.getFullYear() + (endIdx < curIdx ? 1 : 0);
    const endDate = new Date(endYear, endIdx + 1, 0, 23, 59, 59); // last day of endIdx month
    const weeksLeft = Math.max(1, Math.ceil((endDate.getTime() - today.getTime()) / MS_PER_WEEK));
    if (weeksLeft <= ENDING_SOON_WEEKS) {
      return { kind: "ending", weeksLeft };
    }
    return { kind: "in-season" };
  }

  for (let offset = 1; offset <= 12; offset++) {
    const idx = (curIdx + offset) % 12;
    if (monthSet.has(MONTH_ORDER[idx])) {
      const startYear = today.getFullYear() + (idx <= curIdx ? 1 : 0);
      const startDate = new Date(startYear, idx, 1);
      const weeksUntil = Math.ceil((startDate.getTime() - today.getTime()) / MS_PER_WEEK);
      if (weeksUntil <= OPENS_SOON_WEEKS) {
        return { kind: "upcoming", weeksUntil };
      }
      return null;
    }
  }
  return null;
}
