"use client";

import { Fragment, useEffect, useState } from "react";
import { X, Star, ExternalLink, ArrowUpDown, Check, Minus, ChevronDown, BadgeCheck } from "lucide-react";
import { type OperatorCardData } from "./OperatorCard";
import { parsePrice } from "@/lib/price";
import { openOperator } from "@/lib/outbound";
import { SERVICE_LABELS, serviceStates, inr, fullTripCost, transportExtra, finePrint, type ServiceKey, type ServiceState } from "@/lib/operatorOffer";

/** Other parts of the page (the sidebar and the mobile Book bar) open the comparison with this event */
export const OPEN_COMPARE_EVENT = "ttt:open-compare";

interface ComputedRating {
  avg: number;
  count: number;
}

// Google ratings always show; traveller ratings sit beside them once an operator
// has any (from the first one, with their count for weight) and are left out until then.
function travellerRating(op: OperatorCardData, ratings: Record<string, ComputedRating>) {
  return ratings[op.name.trim().toLowerCase()] ?? null;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch { return d; }
}

const muted = { color: "var(--text-tertiary)" };
const best = { color: "var(--accent-ink)", fontWeight: 600 } as const;
const star = <Star className="w-3 h-3 text-[#ff8a4c] fill-[#ff8a4c] shrink-0" />;
const none = <span style={muted}>—</span>;

/** What the trip costs per person from the pick-up city: fee with GST plus paid transport */
function totalOf(op: OperatorCardData): number {
  return (op.offer && fullTripCost(op.offer)) ?? parsePrice(op.priceFrom);
}

/** Where the full price starts from: "Dehradun" out of "Dehradun to Sankri & return" */
function fromCity(op: OperatorCardData): string | undefined {
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
function transportNote(op: OperatorCardData): string {
  const t = op.offer ? serviceStates(op.offer).transport : "unknown";
  return t === "included" ? "In the fee" : t === "not-included" ? "Own travel" : "Not stated";
}

/** True when we know the full price from the operator's own page, not just a headline fee */
const knownFull = (op: OperatorCardData) => !!op.offer && fullTripCost(op.offer) !== undefined;

/** The small line under a full-trip price: where it starts from, or why transport isn't in it */
function fullNote(op: OperatorCardData): string {
  const note = op.offer && transportExtra(op.offer) === undefined ? transportNote(op) : "";
  if (note === "Own travel") return "own travel to the start";
  if (note === "Not stated") return "transport not stated";
  if (note === "In the fee") return "transport included";
  const city = fromCity(op);
  return city ? `with transport from ${city}` : "with transport";
}

/**
 * The order operators appear in, here and in the table: those whose full price we know first,
 * cheapest first; the ones with only a headline fee follow, since that fee can leave out GST and transport
 */
function sortOps(operators: OperatorCardData[]): OperatorCardData[] {
  return [...operators].sort((a, b) => Number(knownFull(b)) - Number(knownFull(a)) || totalOf(a) - totalOf(b));
}

/** The next start date ("5 Dec"), or the batch months ("Jul, Aug") when only those are listed */
function nextDeparture(op: OperatorCardData): string | undefined {
  const today = new Date().toISOString().slice(0, 10);
  const exact = (op.departureDates?.length ? op.departureDates : op.offer?.departures ?? []).filter((d) => d >= today).sort();
  if (exact.length) return `next ${formatDate(exact[0])}`;
  const months = op.offer?.batches ?? [];
  return months.length ? months.slice(0, 3).map((m) => m.slice(0, 3)).join(", ") : undefined;
}

/** The next exact start dates when the operator lists them ("5 Dec, 12 Dec +15"), else the batch months */
function datesOf(op: OperatorCardData): React.ReactNode {
  const today = new Date().toISOString().slice(0, 10);
  const exact = op.departureDates?.length ? op.departureDates : (op.offer?.departures ?? []).filter((d) => d >= today);
  if (exact.length) return <>{exact.slice(0, 2).map(formatDate).join(", ")}{exact.length > 2 && <span style={muted}> +{exact.length - 2}</span>}</>;
  const months = op.offer?.batches ?? [];
  if (months.length) return <>{months.slice(0, 3).map((m) => m.slice(0, 3)).join(", ")}{months.length > 3 && <span style={muted}> +{months.length - 3}</span>}</>;
  return null;
}

function ServiceCell({ state, price, plusGst, perDay }: { state: ServiceState; price?: number; plusGst?: boolean; perDay?: boolean }) {
  if (state === "included") return <span className="inline-flex items-center gap-1" style={{ color: "#3fa877" }}><Check className="w-3.5 h-3.5" />Included</span>;
  if (state === "extra") return <span>{price ? `${inr(price)}${perDay ? " a day" : ""}${plusGst ? " + GST" : ""}` : "Extra"}</span>;
  if (state === "not-included") return <span className="inline-flex items-center gap-1" style={muted}><Minus className="w-3.5 h-3.5" />Not included</span>;
  return none;
}

/** A row has a cell per operator, or one `span` across all of them */
type Row = { key: string; label: string; cell: (op: OperatorCardData, i: number) => React.ReactNode; has: (op: OperatorCardData) => boolean; span?: React.ReactNode };
type Group = { title: string; rows: Row[] };

/**
 * Operators are columns (lowest total first), facts are rows in groups, the best value in each
 * row is highlighted, and the label column stays put while the table scrolls sideways. A row only
 * appears when at least one operator has a value for it, so the table grows as data comes in.
 */
function CompareTable({ operators, computedRatings, slug }: { operators: OperatorCardData[]; computedRatings: Record<string, ComputedRating>; slug: string }) {
  const [showLists, setShowLists] = useState(false);
  const ops = sortOps(operators);
  const totals = ops.map(totalOf);
  const anyKnown = ops.some(knownFull);
  const minTotal = Math.min(...totals.filter((n, i) => Number.isFinite(n) && n > 0 && (!anyKnown || knownFull(ops[i]))));
  const google = ops.map((o) => o.googleRating ?? 0);
  const bestGoogle = Math.max(...google);
  const travellers = ops.map((o) => travellerRating(o, computedRatings));
  const bestTraveller = Math.max(...travellers.map((t) => t?.avg ?? 0));
  const services = ops.map((o) => (o.offer ? serviceStates(o.offer) : null));
  const svc = (i: number, k: ServiceKey): ServiceState => services[i]?.[k] ?? "unknown";
  // Services every operator with details includes go on one line; the rest get a row each
  const withDetails = ops.map((o, i) => (o.offer ? i : -1)).filter((i) => i >= 0);
  const noDetails = ops.filter((o) => !o.offer);
  const sharedIncluded = withDetails.length > 1
    ? (Object.keys(SERVICE_LABELS) as ServiceKey[]).filter((k) => withDetails.every((i) => svc(i, k) === "included"))
    : [];
  // Transport priced as an extra already has its row under the price; don't repeat it
  const transportPriced = ops.some((o) => !!o.offer && transportExtra(o.offer) !== undefined);
  const groupSizes = ops.map((o) => o.offer?.groupSize ?? Infinity);
  const smallestGroup = Math.min(...groupSizes);
  const perDay = ops.map((o) => (o.offer?.days && o.offer && fullTripCost(o.offer) ? fullTripCost(o.offer)! / o.offer.days : Infinity));
  const minPerDay = Math.min(...perDay);
  const fine = ops.map((o) => (o.offer ? finePrint(o.offer) : []));

  const allGroups: Group[] = [
    {
      title: "Price per person",
      rows: [
        { key: "fee", label: "trek fee", has: () => true, cell: (op) => op.offer?.feeBase ? inr(op.offer.feeBase) : op.priceFrom || none },
        { key: "gst", label: "gst", has: (op) => op.offer?.gstRate !== undefined, cell: (op) => op.offer?.gstRate !== undefined ? `+${Math.round(op.offer.gstRate * 100)}%` : none },
        { key: "total", label: "with gst", has: (op) => !!op.offer?.feeTotal, cell: (op) => op.offer?.feeTotal ? inr(op.offer.feeTotal) : none },
        { key: "transport", label: "+ transport", has: (op) => !!op.offer && transportExtra(op.offer) !== undefined, cell: (op) => !op.offer ? none : transportExtra(op.offer) !== undefined ? inr(transportExtra(op.offer)!) : <span style={muted}>{transportNote(op)}</span> },
        {
          key: "full", label: "full trip", has: (op) => !!op.offer && fullTripCost(op.offer) !== undefined,
          cell: (op, i) => {
            const full = op.offer && fullTripCost(op.offer);
            if (!full) return none;
            const where = fullNote(op);
            return (
              <span className="flex flex-col">
                <span className="text-[14px] font-semibold" style={totals[i] === minTotal ? best : { color: "var(--text-primary)" }}>{inr(full)}</span>
                <span className="text-[11.5px]" style={muted}>{where}</span>
              </span>
            );
          },
        },
        { key: "perday", label: "per day", has: (op) => !!op.offer?.days && !!op.offer && fullTripCost(op.offer) !== undefined, cell: (op, i) => Number.isFinite(perDay[i]) ? <span style={perDay[i] === minPerDay && ops.length > 1 ? best : undefined}>{inr(perDay[i])}</span> : none },
      ],
    },
    {
      title: "The trip",
      rows: [
        { key: "days", label: "days", has: (op) => !!op.offer?.days, cell: (op) => op.offer?.days ?? none },
        { key: "route", label: "starts / ends", has: (op) => !!op.offer?.startEnd, cell: (op) => op.offer?.startEnd ?? none },
        { key: "dates", label: "departures", has: (op) => !!datesOf(op), cell: (op) => datesOf(op) ?? <span style={muted}>On request</span> },
        { key: "group", label: "max group", has: (op) => !!op.offer?.groupSize, cell: (op, i) => op.offer?.groupSize ? <span style={groupSizes[i] === smallestGroup && ops.length > 1 ? best : undefined}>{op.offer.groupSize}</span> : none },
        { key: "grade", label: "their grade", has: (op) => !!op.offer?.difficulty, cell: (op) => op.offer?.difficulty ?? none },
      ],
    },
    {
      title: "What's included",
      rows: [
        ...(sharedIncluded.length ? [{
          key: "shared",
          label: "all include",
          has: () => true,
          cell: () => null,
          // One line for what every operator includes, so the rows below show only what differs
          span: (
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
              {sharedIncluded.map((k) => <span key={k} className="inline-flex items-center gap-1" style={{ color: "#3fa877" }}><Check className="w-3.5 h-3.5" />{SERVICE_LABELS[k]}</span>)}
              {noDetails.length > 0 && <span className="text-[12px]" style={muted}>({noDetails.map((o) => o.name).join(", ")}: not listed)</span>}
            </span>
          ),
        }] : []),
        ...(Object.keys(SERVICE_LABELS) as ServiceKey[]).filter((k) => !sharedIncluded.includes(k) && !(k === "transport" && transportPriced)).map((k) => ({
        key: k,
        label: SERVICE_LABELS[k].toLowerCase(),
        // Shown when someone states it either way; a row of dashes says nothing
        has: (op: OperatorCardData) => (!!op.offer && serviceStates(op.offer)[k] !== "unknown") || (k === "cloakroom" && !!op.cloakroom) || (k === "offloading" && !!op.offloading),
        cell: (op: OperatorCardData, i: number) => {
          // Operators who listed themselves state cloakroom and offloading directly
          // A "no" here usually means nobody filled it in, so only a stated yes is shown
          if (!op.offer && k === "cloakroom") return op.cloakroom ? (op.cloakroom_charge ? `₹${op.cloakroom_charge}` : <ServiceCell state="included" />) : none;
          if (!op.offer && k === "offloading") return op.offloading ? (op.offloading_charge ? `₹${op.offloading_charge}/kg` : <ServiceCell state="included" />) : none;
          const price = k === "transport" ? op.offer?.addOns.transport : k === "offloading" ? op.offer?.addOns.offloading : undefined;
          return <ServiceCell state={svc(i, k)} price={price} plusGst={op.offer?.addOnsPlusGst} perDay={k === "offloading" && op.offer?.offloadingPerDay} />;
        },
      })),
      ],
    },
    {
      title: "Paid extras",
      rows: [
        { key: "insurance", label: "insurance", has: (op) => !!op.offer?.addOns.insurance, cell: (op) => op.offer?.addOns.insurance ? `${inr(op.offer.addOns.insurance)}${op.offer.addOnsPlusGst ? " + GST" : ""}` : none },
        { key: "single", label: "single tent / room", has: (op) => !!op.offer?.addOns.singleTent, cell: (op) => op.offer?.addOns.singleTent ? `${inr(op.offer.addOns.singleTent)}${op.offer.addOnsPlusGst ? " + GST" : ""}` : none },
      ],
    },
    {
      title: "Worth knowing",
      rows: [
        { key: "fine", label: "fine print", has: () => fine.some((f) => f.length > 0), cell: (_op, i) => fine[i].length
          ? <ul className="space-y-1.5 text-[12px] leading-snug" style={{ color: "var(--text-secondary)" }}>{fine[i].map((l, k) => <li key={k}>{l}</li>)}</ul> : none },
      ],
    },
    {
      title: "Ratings",
      rows: [
        { key: "google", label: "google", has: (op) => !!op.googleRating, cell: (op) => op.googleRating
          ? <span className="inline-flex items-center gap-1" style={op.googleRating === bestGoogle ? best : undefined}>{star}{op.googleRating}</span> : none },
        { key: "travellers", label: "travellers", has: () => travellers.some(Boolean), cell: (_op, i) => travellers[i]
          ? <span className="inline-flex items-center gap-1" style={travellers[i]!.avg === bestTraveller ? best : undefined}>{star}{travellers[i]!.avg} <span className="text-[11px]" style={muted}>({travellers[i]!.count})</span></span> : none },
      ],
    },
  ];
  const groups = allGroups
    .map((g) => ({ ...g, rows: g.rows.filter((r) => ops.some(r.has)) }))
    .filter((g) => g.rows.length > 0);

  const hasLists = ops.some((o) => (o.offer?.included.length ?? 0) + (o.offer?.notIncluded.length ?? 0) > 0);
  const checked = ops.map((o) => o.offer?.checkedAt ?? o.priceCheckedAt).filter(Boolean).sort().pop();
  const colW = 148;
  const labelCell = "sticky left-0 z-[1] px-3 py-2.5 text-[11px] tracking-[0.1em] lowercase align-top text-left font-normal";
  const labelStyle = { color: "var(--text-secondary)", fontVariant: "small-caps", background: "var(--bg-surface)", width: 128, minWidth: 128 } as const;

  const isLowest = (op: OperatorCardData, i: number) => totals[i] === minTotal && ops.length > 1 && (!anyKnown || knownFull(op));
  // Solid for the lowest full price, outlined for the rest, so a row of buttons doesn't shout
  const bookButton = (op: OperatorCardData, i: number) => (
    <button
      onClick={() => { const url = op.offer?.url ?? op.website; if (url) openOperator({ url, operator: op.name, source: "compare", slug }); }}
      disabled={!op.website && !op.offer?.url}
      className={`w-full h-9 inline-flex items-center justify-center gap-1 rounded-full text-[12.5px] font-semibold disabled:opacity-40 transition-colors ${isLowest(op, i) ? "text-white" : "text-[#ff5100] hover:bg-[rgba(255,81,0,0.08)]"}`}
      style={isLowest(op, i) ? { background: "#ff5100" } : { border: "1px solid rgba(255,81,0,0.55)" }}
    >
      Book <ExternalLink className="w-3 h-3" />
    </button>
  );

  return (
    // One scroller for both directions, so the operator row stays on top and the labels on the left
    <div className="overflow-auto flex-1 min-h-0" style={{ containerType: "inline-size" }}>
        <table className="w-full border-collapse text-[13px]" style={{ minWidth: 128 + ops.length * colW }}>
          <thead>
            <tr>
              <th className={`${labelCell} top-0 !z-[3]`} style={{ ...labelStyle, boxShadow: "inset 0 -1px 0 var(--border-default)" }} />
              {ops.map((op, i) => (
                <th key={op.name} scope="col" className="sticky top-0 z-[2] px-2.5 pt-3 pb-2.5 text-left align-bottom font-normal" style={{ minWidth: colW, background: "var(--bg-surface)", boxShadow: "inset 0 -1px 0 var(--border-default)" }}>
                  {isLowest(op, i) && <span className="block text-[10px] font-bold uppercase tracking-wider text-[#ff5100] mb-0.5">{knownFull(op) ? "Lowest full price" : "Lowest price"}</span>}
                  <span className="block text-[14px] font-semibold leading-tight line-clamp-2" style={{ color: "var(--text-primary)" }}>{op.name}</span>
                  {op.verified
                    ? <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "#3fa877" }}><BadgeCheck className="w-3 h-3" />verified</span>
                    : <span className="text-[11px]" style={muted}>not yet verified</span>}
                  <div className="mt-2">{bookButton(op, i)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <Fragment key={g.title}>
                <tr>
                  <th colSpan={ops.length + 1} scope="colgroup" className="text-left px-3 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-primary)" }}>
                    <span className="sticky left-3">{g.title}</span>
                  </th>
                </tr>
                {g.rows.map((r) => (
                  <tr key={r.key} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <th scope="row" className={labelCell} style={labelStyle}>{r.label}</th>
                    {r.span !== undefined
                      ? <td colSpan={ops.length} className="px-2.5 py-2.5 align-top leading-snug">{r.span}</td>
                      : ops.map((op, i) => <td key={op.name} className="px-2.5 py-2.5 align-top leading-snug" style={{ color: "var(--text-primary)" }}>{r.cell(op, i)}</td>)}
                  </tr>
                ))}
              </Fragment>
            ))}
            {showLists && (
              <tr style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <th scope="row" className={labelCell} style={labelStyle}>in their words</th>
                {ops.map((op) => (
                  <td key={op.name} className="px-2.5 py-2.5 align-top text-[12px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                    {op.offer?.included.length ? (
                      <>
                        <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Included</p>
                        <ul className="space-y-1 mb-3">{op.offer.included.map((l, k) => <li key={k}>{l}</li>)}</ul>
                      </>
                    ) : null}
                    {op.offer?.notIncluded.length ? (
                      <>
                        <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Not included</p>
                        <ul className="space-y-1">{op.offer.notIncluded.map((l, k) => <li key={k}>{l}</li>)}</ul>
                      </>
                    ) : null}
                    {!op.offer?.included.length && !op.offer?.notIncluded.length && none}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      {/* Held to the visible width while the table scrolls sideways */}
      <div className="sticky left-0 px-3 pt-2 pb-3 space-y-2" style={{ width: "100cqw" }}>
        {hasLists && (
          <button type="button" onClick={() => setShowLists((v) => !v)} aria-expanded={showLists}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#ff5100]">
            {showLists ? "Hide" : "Show"} each operator&apos;s full inclusions
            <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: showLists ? "rotate(180deg)" : undefined }} />
          </button>
        )}
        <p className="text-[11.5px] leading-relaxed" style={muted}>
          Highlighted: the best value in each row. &ldquo;Full trip&rdquo; is the fee with the GST each operator states, plus their transport from the pick-up city when it&apos;s a paid extra; columns run cheapest first.
          {checked ? ` Prices and inclusions read from each operator's own page, last checked ${formatDate(checked)}; confirm with them before you book.` : " Confirm prices and dates with the operator before you book."}
          {travellers.some(Boolean) ? " Travellers: ratings from Trail to Tides users who went with that operator." : ""}
        </p>
      </div>
    </div>
  );
}

function CompareDrawer({
  operators,
  computedRatings,
  slug,
  onClose,
}: {
  operators: OperatorCardData[];
  computedRatings: Record<string, ComputedRating>;
  slug: string;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent scroll bleed
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // A bottom sheet on phones, a centred card from tablet up
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-5xl max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2 shrink-0" aria-hidden><span className="w-10 h-1 rounded-full" style={{ background: "var(--border-default)" }} /></div>
        <div className="flex items-start justify-between gap-4 px-5 pt-3 sm:pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>side by side</p>
            <h2 id="compare-title" className="text-[20px] !font-normal tracking-[-0.01em] !text-[#ff5100]">
              {operators.length === 1 ? `${operators[0].name}: the details` : `Compare ${operators.length} operators`}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.07]"
            style={{ color: "var(--text-secondary)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <CompareTable operators={operators} computedRatings={computedRatings} slug={slug} />
      </div>
    </div>
  );
}

export default function OperatorsSection({ operators, slug }: { operators: OperatorCardData[]; slug: string }) {
  const [computedRatings, setComputedRatings] = useState<Record<string, ComputedRating>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/operator-ratings?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { if (d.ratings) setComputedRatings(d.ratings); })
      .catch(() => {});
  }, [slug]);

  // The sidebar and mobile Book bar open the comparison straight away, not just scroll to it
  useEffect(() => {
    const open = () => setDrawerOpen(true);
    window.addEventListener(OPEN_COMPARE_EVENT, open);
    return () => window.removeEventListener(OPEN_COMPARE_EVENT, open);
  }, []);

  if (operators.length === 0) {
    return <p className="text-black/30 dark:text-white/25 text-xs text-center py-6">No operators listed yet for this adventure.</p>;
  }

  const drawer = drawerOpen && (
    <CompareDrawer slug={slug} operators={operators} computedRatings={computedRatings} onClose={() => setDrawerOpen(false)} />
  );

  // Single operator — simple card, with the full details a tap away when we have them
  if (operators.length === 1) {
    const op = operators[0];
    const traveller = travellerRating(op, computedRatings);
    return (
      <>
        {drawer}
        <div className="rounded-2xl px-4 py-3.5" style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>{op.name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
                {op.googleRating ? (
                  <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#ff8a4c] fill-[#ff8a4c]" />{op.googleRating} Google</span>
                ) : null}
                {traveller && (
                  <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#ff8a4c] fill-[#ff8a4c]" />{traveller.avg} Travellers ({traveller.count})</span>
                )}
                {op.offer?.days ? <span>{op.offer.days} days</span> : null}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] tracking-[0.1em] lowercase leading-none mb-1" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>from</p>
              <p className="text-[16px] font-medium" style={{ color: "var(--text-primary)" }}>{op.priceFrom}</p>
              {op.offer?.gstRate ? <p className="text-[11.5px]" style={muted}>+{Math.round(op.offer.gstRate * 100)}% GST</p> : null}
            </div>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            {op.offer && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-full text-[14px] font-medium transition-colors hover:bg-[rgba(255,81,0,0.06)]"
                style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              >
                What&apos;s included, dates and extras
              </button>
            )}
            <button
              onClick={() => { const url = op.offer?.url ?? op.website; if (url) openOperator({ url, operator: op.name, source: "compare", slug }); }}
              disabled={!op.website && !op.offer?.url}
              className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-full text-[14px] font-medium text-[#ff5100] transition-colors hover:bg-[rgba(255,81,0,0.06)] disabled:opacity-40"
              style={{ border: "1px solid rgba(255,81,0,0.55)" }}
            >
              View on {op.name}&apos;s site <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </>
    );
  }

  // Multiple operators — every one listed in the table's order, the full comparison a tap away
  const listed = sortOps(operators);
  const anyKnown = listed.some(knownFull);
  const lowest = Math.min(...listed.filter((o) => !anyKnown || knownFull(o)).map(totalOf).filter((n) => Number.isFinite(n) && n > 0));
  const withDetails = operators.filter((o) => o.offer).length;

  return (
    <>
      {drawer}

      <div className="space-y-3">
        <ul className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
          {listed.map((op, i) => {
            const full = knownFull(op) ? fullTripCost(op.offer!)! : undefined;
            const isLowest = totalOf(op) === lowest && (!anyKnown || knownFull(op));
            const traveller = travellerRating(op, computedRatings);
            const next = nextDeparture(op);
            const url = op.offer?.url ?? op.website;
            const meta = [
              op.offer?.days ? `${op.offer.days} days` : null,
              next,
            ].filter(Boolean).join(" · ");
            return (
              // Phones stack the name over the price and Book; wider screens keep one row
              <li key={op.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3" style={i > 0 ? { borderTop: "1px solid var(--border-subtle)" } : undefined}>
                <div className="min-w-0 sm:flex-1">
                  {isLowest && <span className="block text-[10px] font-bold uppercase tracking-wider text-[#ff5100] leading-none mb-1">{full ? "Lowest full price" : "Lowest price"}</span>}
                  <p className="flex items-center gap-1.5 text-[14.5px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                    <span className="truncate">{op.name}</span>
                    {op.verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#3fa877" }} aria-label="Verified operator" />}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[12.5px]" style={{ color: "var(--text-secondary)" }}>
                    {op.googleRating ? <span className="inline-flex items-center gap-1">{star}{op.googleRating}<span style={muted}>Google</span></span> : null}
                    {traveller && <span className="inline-flex items-center gap-1">{star}{traveller.avg}<span style={muted}>Travellers ({traveller.count})</span></span>}
                    {meta && <span>{meta}</span>}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="sm:text-right">
                  <p className="text-[15px] font-semibold leading-tight" style={isLowest ? best : { color: "var(--text-primary)" }}>{full ? inr(full) : op.priceFrom || "On request"}</p>
                  <p className="text-[11.5px] leading-tight mt-0.5 sm:max-w-[150px]" style={muted}>{full ? fullNote(op) : op.offer?.gstRate ? `fee only, +${Math.round(op.offer.gstRate * 100)}% GST` : "fee only"}</p>
                </div>
                <button
                  onClick={() => { if (url) openOperator({ url, operator: op.name, source: "compare", slug }); }}
                  disabled={!url}
                  aria-label={`Book with ${op.name}`}
                  className="shrink-0 h-9 px-3.5 inline-flex items-center gap-1 rounded-full text-[12.5px] font-semibold text-[#ff5100] transition-colors hover:bg-[rgba(255,81,0,0.08)] disabled:opacity-40"
                  style={{ border: "1px solid rgba(255,81,0,0.55)" }}
                >
                  Book <ExternalLink className="w-3 h-3" />
                </button>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Compare — the secondary (outline) pill; the solid pill is the sidebar's */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-full h-11 px-5 flex items-center justify-center gap-2 rounded-full text-[14px] font-medium transition-colors text-[#ff5100] hover:bg-[rgba(255,81,0,0.06)]"
          style={{ border: "1px solid rgba(255,81,0,0.55)" }}
        >
          <ArrowUpDown className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Compare side by side</span>
          <span className="hidden sm:inline text-[13px] font-normal" style={{ color: "var(--text-secondary)" }}>
            · {withDetails > 0 ? "price with GST, inclusions, dates, extras" : "price, ratings, dates"}
          </span>
        </button>
      </div>
    </>
  );
}
