import type { OperatorOffer } from "@/lib/operatorOffer";

// What an adventure page knows about each operator; OperatorsSection draws the cards.
export type OperatorCardData = {
  name: string;
  googleRating: number;
  priceFrom: string;
  website?: string;
  verified?: boolean;
  /** ISO date the price was last checked */
  priceCheckedAt?: string;
  departureDates?: string[];
  notes?: string | null;
  cloakroom?: boolean;
  cloakroom_charge?: string | null;
  offloading?: boolean;
  offloading_charge?: string | null;
  /** Everything read from the operator's own page for this trek (scripts/import-operator-offers.ts) */
  offer?: OperatorOffer;
};
