import type { OperatorCardData } from "@/app/experiences/[slug]/OperatorCard";
import { parsePrice } from "@/lib/price";
import { serviceStates, inr, fullTripCost, transportExtra } from "@/lib/operatorOffer";

// How operators are priced and ranked on an adventure page. Shared by the server-rendered page
// (sidebar card, mobile Book bar) and the browser (Where to book list, compare table), so every
// "from" price and "cheapest" on the page names the same operator and the same number.

/** What the trip costs per person from the pick-up city: fee with GST plus paid transport */
export function totalOf(op: OperatorCardData): number {
  return (op.offer && fullTripCost(op.offer)) ?? parsePrice(op.priceFrom);
}

/** True when we know the full price from the operator's own page, not just a headline fee */
export const knownFull = (op: OperatorCardData) => !!op.offer && fullTripCost(op.offer) !== undefined;

/** Where the full price starts from: "Dehradun" out of "Dehradun to Sankri & return" */
export function fromCity(op: OperatorCardData): string | undefined {
  // A bare word like "Transportation" is a heading caught by the import, not a route: say nothing
  // rather than "from Transportation"
  const route = op.offer?.transportRoute;
  if (route && !/\bfrom\b|\bto\b|[–-]/.test(route)) return undefined;
  const s = (route ?? op.offer?.startEnd)?.replace(/^\(|\)$/g, "");
  // "…cost from Rishikesh" names the city outright; otherwise it's the first place in the route
  const from = s?.match(/\bfrom ([A-Z][A-Za-z]+)/)?.[1];
  const city = from ?? (s?.split(/\s+(?:to|–|-)\s+|\s*\(/)[0]?.trim() || undefined);
  return city && !/transport/i.test(city) ? city : undefined;
}

/** How a transport cell reads when transport isn't a priced extra */
export function transportNote(op: OperatorCardData): string {
  const t = op.offer ? serviceStates(op.offer).transport : "unknown";
  return t === "included" ? "In the fee" : t === "not-included" ? "Own travel" : "Not stated";
}

/** The small line under a full-trip price: where it starts from, or why transport isn't in it */
export function fullNote(op: OperatorCardData): string {
  const note = op.offer && transportExtra(op.offer) === undefined ? transportNote(op) : "";
  if (note === "Own travel") return "own travel to the start";
  if (note === "Not stated") return "transport not stated";
  if (note === "In the fee") return "transport included";
  const city = fromCity(op);
  return city ? `with transport from ${city}` : "with transport";
}

/**
 * The order operators appear in: those whose full price we know first, cheapest first; the ones
 * with only a headline fee follow, since that fee can leave out GST and transport
 */
export function sortOps(operators: OperatorCardData[]): OperatorCardData[] {
  return [...operators].sort((a, b) => Number(knownFull(b)) - Number(knownFull(a)) || totalOf(a) - totalOf(b));
}

/** The price to lead with for one operator: the full trip when known, else their headline fee */
export function leadPrice(op: OperatorCardData): { price: string; full: boolean } {
  return knownFull(op) ? { price: inr(fullTripCost(op.offer!)!), full: true } : { price: op.priceFrom, full: false };
}
