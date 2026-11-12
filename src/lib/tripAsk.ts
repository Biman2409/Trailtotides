// Reads the hard facts out of a trip question (when, how long, from where) so Compass.AI can hold
// every pick to them: "a weekend trek near Delhi in December" must not return a 7-day trek that's
// only open in July. Pure functions, no React.

import type { Adventure, Month } from "./data";
import { haversineKm } from "./geo";

const MONTHS: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_WORDS: [RegExp, Month][] = MONTHS.map((m, i) => [
  new RegExp(`\\b${["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"][i]}\\b|\\b${m.toLowerCase()}\\b`),
  m,
]);
const SEASON_WORDS: [RegExp, Month[], string][] = [
  [/\bwinter\b|\bsnow trek/, ["Dec", "Jan", "Feb"], "in winter"],
  [/\bsummer\b/, ["Apr", "May", "Jun"], "in summer"],
  [/\bmonsoon\b|\brains?\b/, ["Jul", "Aug"], "in the monsoon"],
  [/\bautumn\b|\bpost[- ]monsoon\b/, ["Sep", "Oct", "Nov"], "in autumn"],
  [/\bspring\b/, ["Mar", "Apr"], "in spring"],
];

/** Where people start from; the map's "Near me" uses the same cities */
export const CITIES: [string, number, number, RegExp][] = [
  ["Delhi", 28.6139, 77.209, /\b(delhi|new delhi|ncr|gurgaon|gurugram|noida)\b/],
  ["Mumbai", 19.076, 72.8777, /\b(mumbai|bombay)\b/],
  ["Bengaluru", 12.9716, 77.5946, /\b(bengaluru|bangalore)\b/],
  ["Kolkata", 22.5726, 88.3639, /\b(kolkata|calcutta)\b/],
  ["Chennai", 13.0827, 80.2707, /\bchennai\b/],
  ["Hyderabad", 17.385, 78.4867, /\bhyderabad\b/],
  ["Pune", 18.5204, 73.8567, /\bpune\b/],
  ["Chandigarh", 30.7333, 76.7794, /\bchandigarh\b/],
  ["Dehradun", 30.3165, 78.0322, /\bdehradun\b/],
  ["Ahmedabad", 23.0225, 72.5714, /\bahmedabad\b/],
];

export type TripAsk = {
  months: Month[];
  /** Trip length in days, inclusive */
  days: { min: number; max: number } | null;
  city: { name: string; lat: number; lng: number } | null;
  /** How far from the city still counts, when one was named */
  maxKm: number | null;
  /** Words for the answer: "a weekend", "in December", "near Delhi" */
  label: { when?: string; length?: string; where?: string };
};

const WORD_NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

export function parseTrip(query: string, now = new Date()): TripAsk {
  const q = query.toLowerCase();
  const label: TripAsk["label"] = {};

  // When
  let months: Month[] = MONTH_WORDS.filter(([re]) => re.test(q)).map(([, m]) => m);
  // "may" is also a verb; only take it with a cue around it
  if (months.includes("May") && !/\b(in|during|this|next|of|by|early|late|mid)[- ]may\b|\bmay\s+\d{4}\b/.test(q)) months = months.filter((m) => m !== "May");
  if (/\bthis month\b|\bright now\b|\bnow\b/.test(q)) months.push(MONTHS[now.getMonth()]);
  if (/\bnext month\b/.test(q)) months.push(MONTHS[(now.getMonth() + 1) % 12]);
  if (!months.length) for (const [re, ms, words] of SEASON_WORDS) if (re.test(q)) { months.push(...ms); label.when = words; break; }
  months = [...new Set(months)];
  if (months.length && !label.when) label.when = `in ${months.length === 1 ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][MONTHS.indexOf(months[0])] : months.join("/")}`;

  // How long
  let days: TripAsk["days"] = null;
  const range = /(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})\s*[- ]?days?\b/.exec(q);
  const single = /\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\s*[- ]?(?:days?|d)\b/.exec(q);
  if (range) days = { min: +range[1], max: +range[2] };
  else if (single) { const n = WORD_NUM[single[1]] ?? +single[1]; days = { min: Math.max(1, n - 1), max: n + 1 }; label.length = `${n} days`; }
  else if (/\blong weekend\b/.test(q)) { days = { min: 1, max: 4 }; label.length = "a long weekend"; }
  else if (/\bweekend\b/.test(q)) { days = { min: 1, max: 3 }; label.length = "a weekend"; }
  else if (/\b(a|one) week\b|\bweek[- ]long\b/.test(q)) { days = { min: 6, max: 8 }; label.length = "a week"; }
  else if (/\btwo weeks\b|\bfortnight\b/.test(q)) { days = { min: 11, max: 16 }; label.length = "two weeks"; }
  else if (/\b(short|quick)\b/.test(q)) { days = { min: 1, max: 4 }; label.length = "a short trip"; }
  if (range) label.length = `${range[1]}–${range[2]} days`;

  // From where
  const hit = CITIES.find(([, , , re]) => re.test(q));
  const city = hit ? { name: hit[0], lat: hit[1], lng: hit[2] } : null;
  // A weekend only works within a night's drive; otherwise "near" is a long day's travel
  const maxKm = city ? (days && days.max <= 4 ? 550 : /\b(near|close to|around|from)\b/.test(q) ? 800 : null) : null;
  if (city) label.where = `${maxKm ? "near" : "from"} ${city.name}`;

  return { months, days, city, maxKm, label };
}

export const hasTrip = (t: TripAsk) => t.months.length > 0 || !!t.days || !!t.city;

/** Shortest listed length, e.g. "4–5 days" → 4 */
export function tripDays(a: Pick<Adventure, "durationDays">): number {
  const n = parseInt(a.durationDays, 10);
  return Number.isFinite(n) ? n : 99;
}

export function kmFrom(t: TripAsk, a: Pick<Adventure, "lat" | "lng">): number {
  return t.city ? haversineKm(t.city.lat, t.city.lng, a.lat, a.lng) : 0;
}

export type Check = "months" | "days" | "city";
function fits(a: Adventure, t: TripAsk, skip: Set<Check>): boolean {
  if (!skip.has("months") && t.months.length && !t.months.some((m) => a.bestMonths.includes(m))) return false;
  if (!skip.has("days") && t.days) { const d = tripDays(a); if (d < t.days.min || d > t.days.max) return false; }
  if (!skip.has("city") && t.city && t.maxKm && kmFrom(t, a) > t.maxKm) return false;
  return true;
}

/**
 * Keeps the adventures that fit every condition asked for. When none do, drops conditions one at
 * a time (distance first, then length, then month) until some fit, and says which it dropped.
 * Nearer adventures come first when a city was named; otherwise the input order is kept.
 */
export function applyTrip(list: Adventure[], t: TripAsk): { list: Adventure[]; relaxed: Check[] } {
  if (!hasTrip(t)) return { list, relaxed: [] };
  const order: Check[][] = [[], ["city"], ["days"], ["city", "days"], ["months"], ["city", "months"], ["days", "months"]];
  for (const skip of order) {
    const kept = list.filter((a) => fits(a, t, new Set(skip)));
    if (kept.length) {
      const sorted = t.city ? [...kept].sort((x, y) => kmFrom(t, x) - kmFrom(t, y)) : kept;
      return { list: sorted, relaxed: skip };
    }
  }
  return { list: [], relaxed: ["months", "days", "city"] };
}

/** Which of the asked-for conditions this adventure misses */
export function failingChecks(a: Adventure, t: TripAsk): Check[] {
  return (["months", "days", "city"] as Check[]).filter((c) => !fits(a, t, new Set((["months", "days", "city"] as Check[]).filter((x) => x !== c))));
}

export function fitsTrip(a: Adventure, t: TripAsk): boolean {
  return fits(a, t, new Set());
}

/** "for a weekend in December near Delhi" */
export function tripPhrase(t: TripAsk, relaxed: Check[] = []): string {
  const parts = [
    !relaxed.includes("days") && t.label.length ? `for ${t.label.length}` : "",
    !relaxed.includes("months") && t.label.when ? t.label.when : "",
    !relaxed.includes("city") && t.label.where ? t.label.where : "",
  ].filter(Boolean);
  return parts.join(" ");
}

/** An honest line when a condition had to be dropped, or "" */
export function relaxedNote(t: TripAsk, relaxed: Check[]): string {
  const dropped = relaxed.map((c) =>
    c === "city" && t.city ? `within reach of ${t.city.name}${t.label.length ? ` for ${t.label.length}` : ""}`
      : c === "days" && t.label.length ? `${t.label.length} long`.replace(/^a weekend long$/, "weekend-length").replace(/^a short trip long$/, "short")
      : c === "months" && t.label.when ? `in season ${t.label.when}`
      : "").filter(Boolean);
  return dropped.length ? `Nothing on Trail to Tides fits all of that. These are the closest, though not ${dropped.join(" or ")}:` : "";
}
