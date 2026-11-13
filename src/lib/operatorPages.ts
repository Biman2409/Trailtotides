// Operator pages (/operators/[slug]): one page per operator listed on our adventures, with
// what they run, their prices and every start date they publish.
import { adventures, allListedOperators, type Adventure } from "@/lib/data";
import operatorOffers from "@/lib/operatorOffers.json";
import { fullTripCost, type OperatorOffer } from "@/lib/operatorOffer";
import { parsePrice } from "@/lib/price";
import type { Departure } from "@/app/experiences/[slug]/DepartureCalendar";

const OFFERS = operatorOffers as Record<string, Record<string, OperatorOffer>>;

/** "Trek The Himalayas" → "trek-the-himalayas" */
export const operatorSlug = (name: string) =>
  name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Today's date in India (YYYY-MM-DD), where the treks and the operators are */
export const todayInIndia = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

type DatedOperator = { name: string; priceFrom: string; website?: string; departureDates?: string[]; offer?: OperatorOffer };

/** One operator's start dates for one adventure, one per day, priced the way the comparison prices them */
export function departuresOf(o: DatedOperator, trek?: Pick<Adventure, "name" | "slug">): Departure[] {
  const dates = [...new Set([...(o.departureDates ?? []), ...(o.offer?.departures ?? [])]
    .map((d) => d.slice(0, 10))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))];
  const fee = (o.offer && fullTripCost(o.offer)) ?? parsePrice(o.priceFrom);
  return dates.map((date) => ({
    date,
    operator: o.name,
    url: o.offer?.url ?? o.website,
    price: Number.isFinite(fee) && fee > 0 ? fee : undefined,
    days: o.offer?.days,
    ...(trek ? { trek: trek.name, trekSlug: trek.slug } : {}),
  }));
}

export type OperatorTrek = {
  adventure: Adventure;
  priceFrom: string;
  /** Full trip cost when we read it from the operator's page, else the headline price */
  price?: number;
  offer?: OperatorOffer;
  departures: Departure[];
};

export type OperatorPage = {
  slug: string;
  name: string;
  verified: boolean;
  website?: string;
  googleRating: number;
  treks: OperatorTrek[];
  departures: Departure[];
};

function build(op: (typeof allListedOperators)[number]): OperatorPage {
  const treks: OperatorTrek[] = adventures.flatMap((a) => {
    const listing = a.operators.find((o) => o.name === op.name);
    if (!listing) return [];
    const offer = OFFERS[a.slug]?.[op.name];
    const full = offer && fullTripCost(offer);
    const headline = parsePrice(listing.priceFrom);
    return [{
      adventure: a,
      priceFrom: listing.priceFrom,
      price: full ?? (Number.isFinite(headline) ? headline : undefined),
      offer,
      departures: departuresOf({ ...listing, offer }, a),
    }];
  });
  return {
    slug: operatorSlug(op.name),
    name: op.name,
    verified: op.verified,
    website: op.website,
    googleRating: op.googleRating,
    treks,
    departures: treks.flatMap((t) => t.departures),
  };
}

export const operatorPages = (): OperatorPage[] => allListedOperators.map(build);

export function getOperatorPage(slug: string): OperatorPage | undefined {
  const op = allListedOperators.find((o) => operatorSlug(o.name) === slug);
  return op && build(op);
}
