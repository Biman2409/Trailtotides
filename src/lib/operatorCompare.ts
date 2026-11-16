import type { OperatorCardData } from "@/app/experiences/[slug]/OperatorCard";
import { parsePrice } from "@/lib/price";
import { SERVICE_LABELS, serviceStates, inr, fullTripCost, finePrint, type ServiceKey, type ServiceState } from "@/lib/operatorOffer";
import { knownFull, fullNote } from "@/lib/operatorRank";

// The operator comparison as data: every operator gets the same fields, in the same order and
// the same units, and a field nobody has filled reads "Not listed" rather than being dropped or
// guessed. The adventure page draws it (OperatorCompare.tsx); tests check it on the real data.

/** How many operators can sit side by side and still be read on a laptop or a phone */
export const MAX_COMPARE = 4;
export const NOT_LISTED = "Not listed";

/** yes: included · extra: a paid add-on · no: not included · missing: the operator doesn't say */
export type Tone = "yes" | "extra" | "no" | "missing";

export interface Cell {
  text: string;
  /** A short second line: where a price starts from, a review count */
  sub?: string;
  tone?: Tone;
  /** Several lines (fine print) */
  list?: string[];
  /** A link the cell opens (the operator's booking page) */
  href?: string;
  /** The number "best" is judged on; cells without one take no part */
  score?: number;
}

export interface Field {
  key: string;
  label: string;
  /** What the row means, for the label's second line */
  hint?: string;
  /** Which way is better; rows without it highlight nothing */
  better?: "low" | "high";
  cells: Cell[];
  /** Per operator: true where this operator has the best value in the row */
  best: boolean[];
}

export interface Section { title: string; fields: Field[] }
export interface Rating { avg: number; count: number }

const missing = (sub?: string): Cell => ({ text: NOT_LISTED, tone: "missing", sub });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-12-05" → "5 Dec"; with the year when asked ("12 Nov 2026"). Fixed format, so server and browser agree */
export function shortDate(iso: string, withYear = false): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]}${withYear ? ` ${y}` : ""}`;
}

/** The GST an operator states, or the rate their with-GST fee implies */
export function gstOf(op: OperatorCardData): string | undefined {
  const o = op.offer;
  if (!o) return undefined;
  if (o.gstRate !== undefined) return `+${Math.round(o.gstRate * 100)}%`;
  if (!o.feeTotal) return undefined;
  const pct = o.feeBase ? Math.round((o.feeTotal / o.feeBase - 1) * 100) : 0;
  return pct > 0 ? `+${pct}%` : "Included in the fee";
}

/** "1 guide per 6" from lines such as "Guide Ratio is 6:1" or "1 guide for every 10 trekkers" */
export function guideRatio(op: OperatorCardData): { who: string; per: number } | undefined {
  for (const line of op.offer?.included ?? []) {
    if (!/guide|sherpa|leader/i.test(line)) continue;
    const who = /sherpa/i.test(line) ? "sherpa" : "guide";
    const pair = line.match(/(\d+)\s*(?:[a-z]+\s*)?:\s*(\d+)/i);
    if (pair) {
      const [a, b] = [Number(pair[1]), Number(pair[2])];
      if (Math.min(a, b) === 1 && Math.max(a, b) > 1) return { who, per: Math.max(a, b) };
    }
    const every = line.match(/(\d+)\s*(?:guide|sherpa|leader)s?\s*(?:for|per)\s*(?:every\s*)?(\d+)/i);
    if (every && Number(every[1]) > 0) return { who, per: Math.round(Number(every[2]) / Number(every[1])) };
  }
  return undefined;
}

// Insurance for the trekker, not the line about the operator insuring their own staff
const STAFF = /staff|porters?|wages|salary|of trekking guides|guides? and/i;

function insuranceState(op: OperatorCardData): { state: ServiceState; note?: string } {
  const o = op.offer;
  if (!o) return { state: "unknown" };
  const incl = o.included.find((l) => /insurance/i.test(l) && !STAFF.test(l));
  if (incl) return { state: "included", note: /indian/i.test(incl) ? "Indian nationals only" : undefined };
  if (o.addOns.insurance) return { state: "extra" };
  if (o.notIncluded.some((l) => /insurance/i.test(l))) return { state: "not-included" };
  return { state: "unknown" };
}

/** Upcoming exact start dates, soonest first */
function upcoming(op: OperatorCardData, today: string): string[] {
  const all = op.departureDates?.length ? op.departureDates : op.offer?.departures ?? [];
  return [...new Set(all.filter((d) => d >= today))].sort();
}

/** Batch months from this month on ("Nov 2026" style), in order */
function upcomingMonths(op: OperatorCardData, today: string): string[] {
  const now = today.slice(0, 7);
  return (op.offer?.batches ?? [])
    .map((b) => { const [mon, yr] = b.split(" "); const m = MONTHS.indexOf(mon) + 1; return { b, key: m ? `${yr}-${String(m).padStart(2, "0")}` : "" }; })
    .filter((x) => x.key && x.key >= now)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((x) => x.b.split(" ")[0]);
}

const priced = (n: number, o: { addOnsPlusGst?: boolean }, perDay?: boolean) => `${inr(n)}${perDay ? " a day" : ""}${o.addOnsPlusGst ? " + GST" : ""}`;

/** One inclusion row's cell: the service state in words, with the price when it's a paid extra */
function serviceCell(op: OperatorCardData, key: ServiceKey | "insurance"): Cell {
  const o = op.offer;
  if (!o) {
    // Operators who listed themselves here state cloakroom and offloading directly; an unticked
    // box usually means nobody filled it in, so only a stated yes counts
    if (key === "cloakroom" && op.cloakroom) return op.cloakroom_charge ? { text: `₹${op.cloakroom_charge}`, tone: "extra", sub: "paid extra" } : { text: "Included", tone: "yes" };
    if (key === "offloading" && op.offloading) return op.offloading_charge ? { text: `₹${op.offloading_charge}/kg`, tone: "extra", sub: "paid extra" } : { text: "Included", tone: "yes" };
    return missing();
  }
  if (key === "insurance") {
    const { state, note } = insuranceState(op);
    if (state === "included") return { text: "Included", tone: "yes", sub: note };
    if (state === "extra") return { text: priced(o.addOns.insurance!, o), tone: "extra", sub: "paid extra" };
    if (state === "not-included") return { text: "Not included", tone: "no" };
    return missing();
  }
  const state = serviceStates(o)[key];
  if (state === "included") return { text: "Included", tone: "yes" };
  if (state === "extra") {
    const price = key === "transport" ? o.addOns.transport : key === "offloading" ? o.addOns.offloading : undefined;
    const route = key === "transport" && o.transportRoute && o.transportRoute.length < 48 && /\bfrom\b|\bto\b|[–-]/.test(o.transportRoute) ? o.transportRoute : undefined;
    return price ? { text: priced(price, o, key === "offloading" && o.offloadingPerDay), tone: "extra", sub: route ?? "paid extra" } : { text: "Paid extra", tone: "extra" };
  }
  if (state === "not-included") return { text: "Not included", tone: "no" };
  return missing();
}

/** The inclusion rows, in this order, for every operator */
export const INCLUSION_ROWS: { key: ServiceKey | "insurance"; label: string }[] = [
  { key: "meals", label: SERVICE_LABELS.meals },
  { key: "stay", label: SERVICE_LABELS.stay },
  { key: "permits", label: SERVICE_LABELS.permits },
  { key: "transport", label: "Transport from base city" },
  { key: "offloading", label: "Porter / mule for your bag" },
  { key: "leader", label: SERVICE_LABELS.leader },
  { key: "safety", label: SERVICE_LABELS.safety },
  { key: "gear", label: SERVICE_LABELS.gear },
  { key: "cloakroom", label: SERVICE_LABELS.cloakroom },
  { key: "insurance", label: "Trek insurance" },
];

/** Marks the best cell(s) in a row: only when two or more operators have a value and they differ */
function withBest(f: Omit<Field, "best">): Field {
  const scores = f.cells.map((c) => c.score).filter((s): s is number => s !== undefined && Number.isFinite(s));
  if (!f.better || scores.length < 2 || scores.every((s) => s === scores[0])) return { ...f, best: f.cells.map(() => false) };
  const target = f.better === "low" ? Math.min(...scores) : Math.max(...scores);
  return { ...f, best: f.cells.map((c) => c.score === target) };
}

/**
 * Every field for the chosen operators, grouped. `travellers` lines up with `ops`: the rating
 * Trail to Tides travellers gave each operator, or null. `today` is an ISO date.
 */
export function compareOperators(ops: OperatorCardData[], travellers: (Rating | null)[], today: string): Section[] {
  const field = (key: string, label: string, cell: (op: OperatorCardData, i: number) => Cell, more: Partial<Omit<Field, "key" | "label" | "cells" | "best">> = {}) =>
    withBest({ key, label, cells: ops.map(cell), ...more });

  const included = ops.map((op) => INCLUSION_ROWS.map((r) => serviceCell(op, r.key)));

  return [
    {
      title: "Price per person",
      fields: [
        field("fee", "Price from", (op) => {
          const n = op.offer?.feeBase ?? parsePrice(op.priceFrom);
          return Number.isFinite(n) && n > 0 ? { text: inr(n), score: n, sub: "trek fee" } : missing();
        }, { better: "low", hint: "the fee as listed" }),
        field("gst", "GST", (op) => { const g = gstOf(op); return g ? { text: g } : missing(); }),
        field("full", "Full trip", (op) => {
          if (!knownFull(op)) return missing(op.offer ? undefined : "only the fee is listed");
          const n = fullTripCost(op.offer!)!;
          return { text: inr(n), sub: fullNote(op), score: n };
        }, { better: "low", hint: "fee + GST + paid transport" }),
        field("perday", "Per day", (op) => {
          const full = op.offer && fullTripCost(op.offer);
          if (!full || !op.offer?.days) return missing();
          const n = full / op.offer.days;
          return { text: inr(n), score: Math.round(n) };
        }, { better: "low", hint: "full trip ÷ days" }),
      ],
    },
    {
      title: "The trip",
      fields: [
        field("days", "Duration", (op) => op.offer?.days ? { text: `${op.offer.days} day${op.offer.days === 1 ? "" : "s"}` } : missing()),
        field("route", "Starts / ends", (op) => op.offer?.startEnd ? { text: op.offer.startEnd } : missing()),
        field("dates", "Departures", (op) => {
          const exact = upcoming(op, today);
          if (exact.length) return { text: exact.slice(0, 3).map((d) => shortDate(d)).join(", "), sub: exact.length > 3 ? `+${exact.length - 3} more dates` : "next start dates", score: Date.parse(exact[0]) };
          const months = upcomingMonths(op, today);
          if (months.length) return { text: months.slice(0, 4).join(", "), sub: months.length > 4 ? `+${months.length - 4} more months` : "batch months" };
          return missing();
        }, { better: "low", hint: "soonest start highlighted" }),
        field("group", "Max group size", (op) => op.offer?.groupSize ? { text: `${op.offer.groupSize} people`, score: op.offer.groupSize } : missing(), { better: "low" }),
        field("ratio", "Guide ratio", (op) => { const r = guideRatio(op); return r ? { text: `1 ${r.who} per ${r.per}`, score: r.per } : missing(); }, { better: "low" }),
        field("grade", "Their grade", (op) => op.offer?.difficulty ? { text: op.offer.difficulty } : missing()),
      ],
    },
    {
      title: "What's included",
      fields: [
        field("count", "Included", (_op, i) => {
          if (!ops[i].offer && included[i].every((c) => c.tone === "missing")) return missing();
          const n = included[i].filter((c) => c.tone === "yes").length;
          return { text: `${n} of ${INCLUSION_ROWS.length}`, score: n };
        }, { better: "high", hint: "of the items below" }),
        ...INCLUSION_ROWS.map((r, k) => field(r.key, r.label, (_op, i) => included[i][k])),
      ],
    },
    {
      title: "Policies",
      fields: [
        field("cancellation", "Cancellation policy", (op) => {
          const line = [...(op.offer?.included ?? []), ...(op.offer?.notIncluded ?? []), op.offer?.priceNote ?? ""]
            .find((l) => /cancellation polic|refund/i.test(l) && !/flight/i.test(l));
          return line ? { text: line } : missing();
        }),
        field("fine", "Fine print", (op) => {
          const lines = op.offer ? finePrint(op.offer) : [];
          return lines.length ? { text: `${lines.length} note${lines.length === 1 ? "" : "s"}`, list: lines } : missing();
        }),
      ],
    },
    {
      title: "Ratings",
      fields: [
        field("google", "Google rating", (op) => op.googleRating > 0 ? { text: `${op.googleRating.toFixed(1)} ★`, sub: "review count not listed", score: op.googleRating } : missing(), { better: "high" }),
        field("travellers", "Traveller rating", (_op, i) => {
          const t = travellers[i];
          return t ? { text: `${t.avg.toFixed(1)} ★`, sub: `${t.count} review${t.count === 1 ? "" : "s"} on Trail to Tides`, score: t.avg } : { text: "No reviews yet", tone: "missing" };
        }, { better: "high" }),
      ],
    },
    {
      title: "Trust and booking",
      fields: [
        field("verified", "Verified", (op) => op.verified ? { text: "Verified", tone: "yes", sub: "listing reviewed by us" } : { text: "Not yet", tone: "missing" }),
        field("checked", "Price checked", (op) => {
          const d = op.offer?.checkedAt ?? op.priceCheckedAt;
          return d ? { text: shortDate(d, true), sub: op.offer ? "on their trek page" : undefined } : missing();
        }),
        field("book", "Book on", (op) => {
          const url = op.offer?.url ?? op.website;
          if (!url) return missing();
          let host = url;
          try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { /* keep the raw text */ }
          return { text: host, href: url, sub: op.offer?.url ? "their page for this trek" : "their website" };
        }),
      ],
    },
  ];
}

/** The headline winners for the strip above the table: lowest price, most included, best rated, smallest group */
export function highlights(sections: Section[], ops: OperatorCardData[]): { key: string; label: string; value: string; names: string[] }[] {
  const byKey = new Map(sections.flatMap((s) => s.fields).map((f) => [f.key, f]));
  const pick = (key: string, label: string) => {
    const f = byKey.get(key);
    if (!f || !f.best.some(Boolean)) return null;
    const i = f.best.indexOf(true);
    return { key, label, value: f.cells[i].text, names: ops.filter((_, k) => f.best[k]).map((o) => o.name) };
  };
  const price = pick("full", "Lowest full trip") ?? pick("fee", "Lowest price");
  return [price, pick("count", "Most included"), pick("google", "Best Google rating"), pick("group", "Smallest group")].filter((x): x is NonNullable<typeof x> => !!x);
}
