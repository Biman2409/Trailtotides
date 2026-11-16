// Server and build-time only (it reads the full offers file): works out each adventure's lead
// price exactly as the adventure page does. The browser reads the result from leadPrices.json.
import { adventures } from "./data";
import operatorOffers from "./operatorOffers.json";
import type { OperatorOffer } from "./operatorOffer";
import { sortOps, knownFull, totalOf } from "./operatorRank";
import type { LeadPrice } from "./leadPrices";

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
