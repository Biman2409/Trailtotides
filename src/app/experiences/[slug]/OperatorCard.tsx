// What an adventure page knows about each operator; OperatorsSection draws the cards.
export type OperatorCardData = {
  name: string;
  googleRating: number;
  priceFrom: string;
  website?: string;
  verified?: boolean;
  departureDates?: string[];
  notes?: string | null;
  cloakroom?: boolean;
  cloakroom_charge?: string | null;
  offloading?: boolean;
  offloading_charge?: string | null;
};
