"use client";

import { useEffect, useState } from "react";
import { X, Star, ExternalLink, ArrowUpDown } from "lucide-react";
import { type OperatorCardData } from "./OperatorCard";
import { parsePrice } from "@/lib/price";

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

// One labelled fact in an operator row: small-caps label over the value
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] tracking-[0.1em] lowercase leading-none mb-1" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>{label}</dt>
      <dd className="text-[14px] leading-snug" style={{ color: "var(--text-primary)" }}>{children}</dd>
    </div>
  );
}

const muted = { color: "var(--text-tertiary)" };

function CompareDrawer({
  operators,
  computedRatings,
  onClose,
}: {
  operators: OperatorCardData[];
  computedRatings: Record<string, ComputedRating>;
  onClose: () => void;
}) {
  const prices = operators.map(o => parsePrice(o.priceFrom));
  const minPrice = Math.min(...prices);
  // The Travellers fact only appears once any operator here has a traveller rating
  const hasTraveller = operators.some(o => travellerRating(o, computedRatings));

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

  // A bottom sheet on phones, a centred card from tablet up; the page's own
  // surfaces, type and orange, one operator per row with its facts in a small grid
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
        className="w-full sm:max-w-3xl max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>side by side</p>
            <h2 id="compare-title" className="text-[20px] !font-normal tracking-[-0.01em] !text-[#ff5100]">Compare {operators.length} operators</h2>
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

        {/* Operators */}
        <ul className="overflow-y-auto flex-1">
          {operators.map((op, i) => {
            const isBestPrice = prices[i] === minPrice;
            const count = op.departureDates?.length ?? 0;
            const traveller = travellerRating(op, computedRatings);
            return (
              <li key={op.name} className="px-5 py-4" style={i > 0 ? { borderTop: "1px solid var(--border-subtle)" } : undefined}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                    <p className="text-[15px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{op.name}</p>
                    {op.verified && <span className="text-[12px]" style={{ color: "#3fa877" }}>verified</span>}
                    {isBestPrice && <span className="text-[12px] text-[#ff5100]">· lowest price</span>}
                  </div>
                  <button
                    onClick={() => op.website && window.open(op.website, "_blank", "noopener,noreferrer")}
                    disabled={!op.website}
                    className="shrink-0 h-9 px-4 inline-flex items-center gap-1.5 rounded-full text-[13px] font-medium text-[#ff5100] transition-colors hover:bg-[rgba(255,81,0,0.06)] disabled:opacity-40"
                    style={{ border: "1px solid rgba(255,81,0,0.55)" }}
                  >
                    Book <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <dl className={`grid grid-cols-3 ${hasTraveller ? "sm:grid-cols-6" : "sm:grid-cols-5"} gap-x-4 gap-y-3`}>
                  <Fact label="price from"><span className="font-medium" style={isBestPrice ? { color: "#ff5100" } : undefined}>{op.priceFrom}</span></Fact>
                  <Fact label="google">
                    {op.googleRating
                      ? <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#ff8a4c] fill-[#ff8a4c]" />{op.googleRating}</span>
                      : <span style={muted}>—</span>}
                  </Fact>
                  {hasTraveller && (
                    <Fact label="travellers">
                      {traveller
                        ? <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#ff8a4c] fill-[#ff8a4c]" />{traveller.avg} <span className="text-[12px]" style={muted}>({traveller.count})</span></span>
                        : <span style={muted}>—</span>}
                    </Fact>
                  )}
                  <Fact label="departures">
                    {count === 0
                      ? <span style={muted}>On request</span>
                      : <>{op.departureDates!.slice(0, 2).map(formatDate).join(", ")}{count > 2 && <span style={muted}> +{count - 2}</span>}</>}
                  </Fact>
                  <Fact label="cloakroom">
                    {op.cloakroom ? <>{op.cloakroom_charge ? `₹${op.cloakroom_charge}` : "Free"}</> : <span style={muted}>No</span>}
                  </Fact>
                  <Fact label="porter">
                    {op.offloading ? <>{op.offloading_charge ? `₹${op.offloading_charge}/kg` : "Included"}</> : <span style={muted}>No</span>}
                  </Fact>
                </dl>
              </li>
            );
          })}
        </ul>

        {hasTraveller && (
          <p className="px-5 py-2.5 text-[12px] shrink-0" style={{ color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)" }}>
            Travellers: ratings from Trail to Tides users who went with that operator.
          </p>
        )}
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

  if (operators.length === 0) {
    return <p className="text-black/30 dark:text-white/25 text-xs text-center py-6">No operators listed yet for this adventure.</p>;
  }

  // Single operator — simple card
  if (operators.length === 1) {
    const op = operators[0];
    const traveller = travellerRating(op, computedRatings);
    return (
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
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] tracking-[0.1em] lowercase leading-none mb-1" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>from</p>
            <p className="text-[16px] font-medium" style={{ color: "var(--text-primary)" }}>{op.priceFrom}</p>
          </div>
        </div>
        <button
          onClick={() => op.website && window.open(op.website, "_blank", "noopener,noreferrer")}
          disabled={!op.website}
          className="mt-3 w-full h-11 flex items-center justify-center gap-1.5 rounded-full text-[14px] font-medium text-[#ff5100] transition-colors hover:bg-[rgba(255,81,0,0.06)] disabled:opacity-40"
          style={{ border: "1px solid rgba(255,81,0,0.55)" }}
        >
          View on {op.name}&apos;s site <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Multiple operators — summary + compare button
  const prices = operators.map(o => parsePrice(o.priceFrom));
  const minPrice = Math.min(...prices);
  const minPriceOp = operators[prices.indexOf(minPrice)];
  const googleRatings = operators.map(op => op.googleRating).filter(Boolean);
  const avgGoogle = googleRatings.length > 0 ? googleRatings.reduce((a, b) => a + b, 0) / googleRatings.length : null;
  // Travellers: weighted by number of ratings, across all operators
  const travellerRatings = operators.map(op => travellerRating(op, computedRatings)).filter((r): r is ComputedRating => !!r);
  const travellerCount = travellerRatings.reduce((n, r) => n + r.count, 0);
  const avgTraveller = travellerCount > 0 ? travellerRatings.reduce((s, r) => s + r.avg * r.count, 0) / travellerCount : null;

  return (
    <>
      {drawerOpen && (
        <CompareDrawer
          operators={operators}
          computedRatings={computedRatings}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      <div className="space-y-3">
        {/* Summary — the same bordered, hairline-split band as the stats strip */}
        <dl className="rounded-2xl overflow-hidden grid grid-cols-3 gap-px" style={{ border: "1px solid var(--border-default)", background: "var(--border-subtle)" }}>
          {[
            { label: "operators", value: <>{operators.length}</> },
            { label: "from", value: <>{minPriceOp.priceFrom}</> },
            ...(avgGoogle !== null || avgTraveller !== null ? [{
              // "Operator", so it isn't read as the trek's own rating (that's the traveller reviews)
              label: "operator ratings",
              value: (
                <span className="flex flex-col gap-0.5">
                  {avgGoogle !== null && <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#ff8a4c] fill-[#ff8a4c]" />{avgGoogle.toFixed(1)} <span className="font-normal text-[13px]" style={{ color: "var(--text-secondary)" }}>Google</span></span>}
                  {avgTraveller !== null && <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#ff8a4c] fill-[#ff8a4c]" />{avgTraveller.toFixed(1)} <span className="font-normal text-[13px]" style={{ color: "var(--text-secondary)" }}>Travellers ({travellerCount})</span></span>}
                </span>
              ),
            }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="px-3.5 py-2 min-w-0" style={{ background: "var(--bg-surface)" }}>
              <dt className="text-[11.5px] tracking-[0.1em] lowercase leading-none mb-1.5" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>{label}</dt>
              <dd className="text-[15px] font-medium leading-snug" style={{ color: "var(--text-primary)" }}>{value}</dd>
            </div>
          ))}
        </dl>

        {/* Compare — the secondary (outline) pill; the solid pill is the sidebar's */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-full h-11 px-5 flex items-center justify-center gap-2 rounded-full text-[14px] font-medium transition-colors text-[#ff5100] hover:bg-[rgba(255,81,0,0.06)]"
          style={{ border: "1px solid rgba(255,81,0,0.55)" }}
        >
          <ArrowUpDown className="w-4 h-4" />
          Compare all operators
          <span className="text-[13px] font-normal" style={{ color: "var(--text-secondary)" }}>· price, ratings, dates, services</span>
        </button>
      </div>
    </>
  );
}
