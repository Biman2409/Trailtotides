// The one "from" price per adventure, shared by every page that shows one, so a card, the price
// filter, the map and the adventure page never disagree. Built by scripts/build-lead-prices.ts.
import type { Adventure } from "./data";
import { getLowestPrice } from "./data";
import leadPrices from "./leadPrices.json";

export interface LeadPrice {
  /** Per person, in rupees */
  price: number;
  /** True: the full trip (fee, GST, transport from the pick-up city). False: the operator's headline fee */
  full: boolean;
  /** Whose price it is */
  operator: string;
}

const LEAD = leadPrices as Record<string, LeadPrice>;

/** The adventure's lead price, as its own page shows it; null when no operator gives one */
export function leadPriceOf(a: Pick<Adventure, "slug" | "operators">): LeadPrice | null {
  if (LEAD[a.slug]) return LEAD[a.slug];
  // An adventure added since the file was built: its lowest headline fee
  const p = getLowestPrice(a);
  return p === null ? null : { price: p, full: false, operator: "" };
}

/** Just the number, for sorting, filtering and "from ₹…" */
export function fromPrice(a: Pick<Adventure, "slug" | "operators">): number | null {
  return leadPriceOf(a)?.price ?? null;
}
