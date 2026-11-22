// Server and build-time only (it reads the full offers file): works out each adventure's lead
// price exactly as the adventure page does. The browser reads the result from leadPrices.json.
import { adventures } from "./data";
import operatorOffers from "./operatorOffers.json";
import type { OperatorOffer } from "./operatorOffer";
import { sortOps, knownFull, totalOf } from "./operatorRank";
import type { LeadPrice } from "./leadPrices";

/** Every operator's price on every adventure, priced the way the adventure page prices it:
 *  the full trip (fee, GST, transport) when their own page gives it, else their headline fee */
export function computeOperatorPrices(): Record<string, Record<string, { price: number; full: boolean }>> {
  const offers = operatorOffers as Record<string, Record<string, OperatorOffer>>;
  const out: Record<string, Record<string, { price: number; full: boolean }>> = {};
  for (const a of adventures) {
    for (const o of a.operators) {
      const op = offers[a.slug]?.[o.name] ? { ...o, offer: offers[a.slug][o.name] } : o;
      const price = totalOf(op);
      if (!Number.isFinite(price) || price <= 0) continue;
      (out[a.slug] ??= {})[o.name] = { price: Math.round(price), full: knownFull(op) };
    }
  }
  return out;
}

export function computeLeadPrices(): Record<string, LeadPrice> {
  const offers = operatorOffers as Record<string, Record<string, OperatorOffer>>;
  const out: Record<string, LeadPrice> = {};
  for (const a of adventures) {
    const ops = a.operators.map((o) => (offers[a.slug]?.[o.name] ? { ...o, offer: offers[a.slug][o.name] } : o));
    const top = sortOps(ops)[0];
    if (!top) continue;
    const price = totalOf(top);
    if (!Number.isFinite(price) || price <= 0) continue;
    out[a.slug] = { price: Math.round(price), full: knownFull(top), operator: top.name };
  }
  return out;
}
