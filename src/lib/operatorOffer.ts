// One operator's offer for one adventure, as collected from the operator's own trek page.
// Written by scripts/import-operator-offers.ts; every field is optional because operators
// publish different things. The comparison shows a row only when someone has a value for it.
export type OperatorOffer = {
  listedAs: string;
  days?: number;
  maxAltM?: number;
  distanceKm?: number;
  /** The operator's own grade, as written (e.g. "Easy · BRS 2") */
  difficulty?: string;
  /** Per person, before GST */
  feeBase?: number;
  /** e.g. 0.05 */
  gstRate?: number;
  /** Per person, GST included */
  feeTotal?: number;
  priceNote?: string;
  /** Months with open batches on the collection date, e.g. "Nov 2026" */
  batches: string[];
  /** Start date of every listed batch (ISO), when the operator's page lists exact dates */
  departures?: string[];
  startEnd?: string;
  groupSize?: number;
  addOns: { offloading?: number; transport?: number; insurance?: number; singleTent?: number };
  /** True when the add-on prices above are before GST */
  addOnsPlusGst?: boolean;
  transportRoute?: string;
  /** Offloading is priced per bag per day, not for the whole trek */
  offloadingPerDay?: boolean;
  cloakroom?: boolean;
  included: string[];
  notIncluded: string[];
  /** The operator's page for this trek */
  url?: string;
  /** ISO date the page was read */
  checkedAt?: string;
};

export type ServiceKey = "meals" | "stay" | "leader" | "permits" | "transport" | "gear" | "cloakroom" | "offloading" | "safety";

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  meals: "Meals on the trek",
  stay: "Tents / stays",
  leader: "Trek leader & guides",
  permits: "Permits & entry fees",
  transport: "Transport to base",
  gear: "Microspikes & gaiters",
  cloakroom: "Cloakroom",
  offloading: "Backpack offloading",
  safety: "First aid & oxygen",
};

// Words that put an inclusion line under each service
const MATCH: Record<ServiceKey, RegExp> = {
  meals: /\bmeals?\b|breakfast|dinner|veg\b|food\b/i,
  stay: /accommodation|tent|camping|guest ?house|homestay|stay\b|hotel|lodge/i,
  leader: /leader|guide|instructor|trek lead/i,
  permits: /permit|entry fee|forest fee|park fee/i,
  transport: /transport|pick ?up|drop\b|tempo|cab\b|vehicle/i,
  gear: /microspike|gaiter|crampon/i,
  cloakroom: /cloak ?room/i,
  offloading: /offload|porter|mule/i,
  safety: /first ?aid|oxygen|medical kit|oximeter/i,
};

export type ServiceState = "included" | "extra" | "not-included" | "unknown";

/**
 * Reads the inclusion and exclusion lists into a yes / paid extra / no per service, so operators
 * line up row by row. "extra" means a priced add-on exists; unknown means the page doesn't say.
 */
export function serviceStates(o: OperatorOffer): Record<ServiceKey, ServiceState> {
  const out = {} as Record<ServiceKey, ServiceState>;
  for (const key of Object.keys(MATCH) as ServiceKey[]) {
    const re = MATCH[key];
    // Exclusions win over inclusions: "Transport (if not booked with us)" is listed as not included
    const notIncl = o.notIncluded.some((l) => re.test(l) && !/personal|transit|during the transit|any kind|foreign|non-indian|\bNRI\b/i.test(l));
    let incl = o.included.some((l) => re.test(l));
    // Porters/mules for the group's kit are included by many; personal-bag offloading is the extra
    if (key === "offloading") incl = o.included.some((l) => /offload/i.test(l) && !/personal/i.test(l));
    if (key === "cloakroom" && o.cloakroom !== undefined) { out[key] = o.cloakroom ? "included" : "not-included"; continue; }
    const paid = (key === "transport" && o.addOns.transport) || (key === "offloading" && o.addOns.offloading);
    if (paid && !incl) out[key] = "extra";
    else if (incl && !(notIncl && (key === "transport" || key === "offloading"))) out[key] = "included";
    else if (notIncl) out[key] = paid ? "extra" : "not-included";
    else out[key] = "unknown";
  }
  return out;
}

/** Transport to the start, with GST where the operator adds it; undefined when it isn't a priced extra */
export function transportExtra(o: OperatorOffer): number | undefined {
  if (serviceStates(o).transport !== "extra" || !o.addOns.transport) return undefined;
  return o.addOns.transport * (o.addOnsPlusGst ? 1 + (o.gstRate ?? 0.05) : 1);
}

/** Fee with GST plus paid transport: what the trip costs from the operator's pick-up city */
export function fullTripCost(o: OperatorOffer): number | undefined {
  const fee = o.feeTotal ?? o.feeBase;
  if (!fee) return undefined;
  return fee + (transportExtra(o) ?? 0);
}

/** Lines worth reading before booking: the operator's own price caveats and conditions */
export function finePrint(o: OperatorOffer): string[] {
  const out: string[] = [];
  if (o.priceNote) out.push(o.priceNote);
  for (const l of o.notIncluded) if (/foreign national|membership|medical certificate|fitness certificate|age limit|\bage\b \d/i.test(l)) out.push(l);
  return [...new Set(out)];
}

/** "₹1,600" */
export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
