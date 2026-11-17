"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Star, ExternalLink, ArrowUpDown, Check, ChevronDown, BadgeCheck, X } from "lucide-react";
import { type OperatorCardData } from "./OperatorCard";
import OperatorCompare from "./OperatorCompare";
import { openOperator } from "@/lib/outbound";
import { inr, fullTripCost } from "@/lib/operatorOffer";
import { totalOf, knownFull, fullNote, sortOps } from "@/lib/operatorRank";
import { MAX_COMPARE, shortDate, type Rating } from "@/lib/operatorCompare";

/** Other parts of the page (the sidebar and the mobile Book bar) open the comparison with this event */
export const OPEN_COMPARE_EVENT = "ttt:open-compare";

// Google ratings always show; traveller ratings sit beside them once an operator
// has any (from the first one, with their count for weight) and are left out until then.
function travellerRating(op: OperatorCardData, ratings: Record<string, Rating>) {
  return ratings[op.name.trim().toLowerCase()] ?? null;
}

const muted = { color: "var(--text-tertiary)" };
const best = { color: "var(--accent-ink)", fontWeight: 600 } as const;
const star = <Star className="w-3 h-3 text-[#ff8a4c] fill-[#ff8a4c] shrink-0" />;

/** The next start date ("next 5 Dec"), or the batch months ("Jul, Aug") when only those are listed */
function nextDeparture(op: OperatorCardData): string | undefined {
  const today = new Date().toISOString().slice(0, 10);
  const exact = (op.departureDates?.length ? op.departureDates : op.offer?.departures ?? []).filter((d) => d >= today).sort();
  if (exact.length) return `next ${shortDate(exact[0])}`;
  const months = op.offer?.batches ?? [];
  return months.length ? months.slice(0, 3).map((m) => m.slice(0, 3)).join(", ") : undefined;
}

/** A tick box that reads as part of the row, with a 40px tap target */
function CompareTick({ op, on, disabled, onToggle }: { op: OperatorCardData; on: boolean; disabled: boolean; onToggle: () => void }) {
  return (
    <label className={`shrink-0 -m-2 p-2 flex items-center ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
      title={disabled ? `Up to ${MAX_COMPARE} at a time: untick one first` : undefined}>
      <input type="checkbox" className="peer sr-only" checked={on} disabled={disabled} onChange={onToggle}
        aria-label={`Compare ${op.name}`} />
      <span aria-hidden
        className="w-[22px] h-[22px] rounded-md flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#ff5100] peer-focus-visible:ring-offset-1"
        style={on ? { background: "#ff5100", border: "1px solid #ff5100" } : { border: "1.5px solid var(--border-default)", background: "var(--bg-card)" }}>
        {on && <Check className="w-3.5 h-3.5 text-[#1c1814]" strokeWidth={3} />}
      </span>
    </label>
  );
}

export default function OperatorsSection({ operators, slug }: { operators: OperatorCardData[]; slug: string }) {
  const [computedRatings, setComputedRatings] = useState<Record<string, Rating>>({});
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [nudge, setNudge] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const listed = sortOps(operators);

  useEffect(() => {
    fetch(`/api/operator-ratings?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { if (d.ratings) setComputedRatings(d.ratings); })
      .catch(() => {});
  }, [slug]);

  const toggle = useCallback((name: string) => {
    setSelected((s) => (s.includes(name) ? s.filter((n) => n !== name) : s.length >= MAX_COMPARE ? s : [...s, name]));
    setNudge(false);
  }, []);

  // Opens the comparison on what's ticked; with nothing ticked and few enough operators, on all of
  // them; otherwise asks the reader to tick some first
  const startCompare = useCallback(() => {
    if (operators.length === 1) {
      setSelected([operators[0].name]);
      setOpen(true);
    } else if (selected.length >= 2) {
      setOpen(true);
    } else if (selected.length === 0 && operators.length <= MAX_COMPARE) {
      setSelected(sortOps(operators).map((o) => o.name));
      setOpen(true);
    } else {
      setNudge(true);
      barRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selected.length, operators]);

  // The sidebar and mobile Book bar open the comparison straight away, not just scroll to it
  useEffect(() => {
    window.addEventListener(OPEN_COMPARE_EVENT, startCompare);
    return () => window.removeEventListener(OPEN_COMPARE_EVENT, startCompare);
  }, [startCompare]);

  const close = useCallback(() => setOpen(false), []);

  if (operators.length === 0) {
    return <p className="text-black/30 dark:text-white/25 text-xs text-center py-6">No operators listed yet for this adventure.</p>;
  }

  const dialog = open && (
    <OperatorCompare all={listed} selected={selected} onToggle={toggle} ratings={computedRatings} slug={slug} onClose={close} />
  );

  // Single operator — simple card, with the full details a tap away
  if (operators.length === 1) {
    const op = operators[0];
    const traveller = travellerRating(op, computedRatings);
    return (
      <>
        {dialog}
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
                {op.offer?.days ? <span>{op.offer.days}-day trip</span> : null}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] tracking-[0.1em] lowercase leading-none mb-1" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>from</p>
              <p className="text-[16px] font-medium" style={{ color: "var(--text-primary)" }}>{op.priceFrom}</p>
              {op.offer?.gstRate ? <p className="text-[12px]" style={muted}>+{Math.round(op.offer.gstRate * 100)}% GST</p> : null}
            </div>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <button
              onClick={startCompare}
              className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-full text-[14px] font-medium transition-colors hover:bg-[rgba(255,81,0,0.06)]"
              style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            >
              {op.offer ? "What's included, dates and extras" : "All the details"}
            </button>
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

  // Multiple operators: tick the ones to compare, then open them side by side
  // The cheapest few up front; the rest a tap away, so a trek with a dozen operators stays short
  const SHOWN = 5;
  const hidden = listed.length - SHOWN > 1 ? listed.length - SHOWN : 0;
  // Ticked operators stay in view even when the list is folded
  const visible = hidden && !showAll ? listed.filter((o, i) => i < SHOWN || selected.includes(o.name)) : listed;
  const anyKnown = listed.some(knownFull);
  const lowest = Math.min(...listed.filter((o) => !anyKnown || knownFull(o)).map(totalOf).filter((n) => Number.isFinite(n) && n > 0));
  // Where the fee-only operators start, when the list has both kinds of price
  const firstFeeOnly = anyKnown ? visible.findIndex((o) => !knownFull(o)) : -1;
  const grouped = firstFeeOnly > 0;
  const full = selected.length >= MAX_COMPARE;
  const few = operators.length <= MAX_COMPARE;
  const ready = selected.length >= 2 || (selected.length === 0 && few);

  const prompt = selected.length === 0
    ? few ? `Tick operators, or compare all ${operators.length}` : `Tick up to ${MAX_COMPARE} to compare`
    : selected.length === 1 ? "Tick one more to compare"
      : `${selected.length} of ${MAX_COMPARE} picked`;

  return (
    <>
      {dialog}

      <div className="space-y-3">
        <ul className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
          {visible.map((op, i) => {
            const fullPrice = knownFull(op) ? fullTripCost(op.offer!)! : undefined;
            const isLowest = totalOf(op) === lowest && (!anyKnown || knownFull(op));
            const traveller = travellerRating(op, computedRatings);
            const next = nextDeparture(op);
            const url = op.offer?.url ?? op.website;
            const on = selected.includes(op.name);
            const meta = [
              op.offer?.days ? `${op.offer.days}-day trip` : null,
              next,
            ].filter(Boolean).join(" · ");
            return (
              <Fragment key={op.name}>
              {/* Two price groups, each cheapest first: without these headings the prices read as unsorted */}
              {grouped && (i === 0 || i === firstFeeOnly) && (
                <li className="px-4 pt-2.5 pb-1.5 text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", fontVariant: "small-caps", background: "var(--bg-page)", ...(i > 0 ? { borderTop: "1px solid var(--border-subtle)" } : {}) }}>
                  {i === 0 ? "full trip price · cheapest first" : "trek fee only · gst and transport may be extra"}
                </li>
              )}
              {/* Phones stack the name over the price and Book; wider screens keep one row */}
              <li className="flex items-start sm:items-center gap-3 px-4 py-3 transition-colors"
                style={{ ...(i > 0 || grouped ? { borderTop: "1px solid var(--border-subtle)" } : {}), ...(on ? { background: "rgba(255,81,0,0.06)" } : {}) }}>
                <div className="pt-0.5 sm:pt-0">
                  <CompareTick op={op} on={on} disabled={!on && full} onToggle={() => toggle(op.name)} />
                </div>
                <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="min-w-0 sm:flex-1">
                    {isLowest && <span className="block text-[11px] font-bold uppercase tracking-wider leading-none mb-1" style={{ color: "var(--accent-ink)" }}>{fullPrice ? "Lowest full price" : "Lowest price"}</span>}
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
                      <p className="text-[15px] font-semibold leading-tight" style={isLowest ? best : { color: "var(--text-primary)" }}>{fullPrice ? inr(fullPrice) : op.priceFrom || "On request"}</p>
                      <p className="text-[12px] leading-tight mt-0.5 sm:max-w-[200px]" style={muted}>{fullPrice ? fullNote(op) : op.offer?.gstRate ? `fee only, +${Math.round(op.offer.gstRate * 100)}% GST` : "fee only"}</p>
                    </div>
                    <button
                      onClick={() => { if (url) openOperator({ url, operator: op.name, source: "compare", slug }); }}
                      disabled={!url}
                      aria-label={`Visit site: book on ${op.name}'s website (opens their site)`}
                      className="shrink-0 h-9 px-3.5 inline-flex items-center gap-1 rounded-full text-[12.5px] font-semibold text-[#ff5100] transition-colors hover:bg-[rgba(255,81,0,0.08)] disabled:opacity-40"
                      style={{ border: "1px solid rgba(255,81,0,0.55)" }}
                    >
                      {url ? <>Visit site <ExternalLink className="w-3 h-3" aria-hidden /></> : "No website listed"}
                    </button>
                  </div>
                </div>
              </li>
              </Fragment>
            );
          })}
        </ul>
        {hidden > 0 && (
          <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}
            className="-mt-1 inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--accent-ink)" }}>
            {showAll ? "Show fewer" : `Show all ${listed.length} operators`}
            <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: showAll ? "rotate(180deg)" : undefined }} />
          </button>
        )}

        {/* The compare bar: sticks to the bottom of the screen while the list is in view, above the
            phone nav bar (about 80px) that shows while the Book bar steps aside for this list */}
        <div ref={barRef} className="sticky bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] lg:bottom-4 z-[5] rounded-2xl px-3 py-2.5 flex items-center gap-3 transition-shadow"
          style={{
            background: "var(--bg-surface)",
            border: `1px solid ${nudge ? "#ff5100" : selected.length ? "rgba(255,81,0,0.45)" : "var(--border-default)"}`,
            boxShadow: selected.length ? "0 8px 24px rgba(0,0,0,0.12)" : undefined,
          }}>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium leading-tight" style={{ color: nudge ? "var(--accent-ink)" : "var(--text-primary)" }} aria-live="polite">{prompt}</p>
            {selected.length > 0 && (
              <p className="text-[12px] leading-tight mt-0.5 truncate" style={muted}>{selected.join(" · ")}</p>
            )}
          </div>
          {selected.length > 0 && (
            <button type="button" onClick={() => { setSelected([]); setNudge(false); }} aria-label="Clear the ticked operators"
              className="shrink-0 h-9 px-2.5 inline-flex items-center gap-1 rounded-full text-[12.5px] transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.07]" style={{ color: "var(--text-secondary)" }}>
              <X className="w-3.5 h-3.5" aria-hidden /><span className="hidden sm:inline">Clear</span>
            </button>
          )}
          <button
            type="button"
            onClick={startCompare}
            aria-disabled={!ready}
            className={`shrink-0 h-10 px-4 inline-flex items-center gap-1.5 rounded-full text-[13.5px] font-semibold transition-colors ${ready ? "text-[#1c1814] bg-[#ff5100] hover:bg-[#e64900]" : "text-[#ff5100]"}`}
            style={ready ? undefined : { border: "1px solid rgba(255,81,0,0.55)", opacity: 0.6 }}
          >
            <ArrowUpDown className="w-4 h-4 shrink-0" aria-hidden />
            {selected.length >= 2 ? `Compare ${selected.length}` : few && selected.length === 0 ? `Compare all ${operators.length}` : "Compare"}
          </button>
        </div>
      </div>
    </>
  );
}
