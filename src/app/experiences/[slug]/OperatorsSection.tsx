"use client";

import { useEffect, useState } from "react";
import { X, Star, CalendarDays, Briefcase, Package, ExternalLink, Check, ArrowUpDown, ChevronDown } from "lucide-react";
import { type OperatorCardData } from "./OperatorCard";

interface ComputedRating {
  avg: number;
  count: number;
  display: string;
  computed: boolean;
}

function parsePrice(p: string): number {
  const n = parseInt(p.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? Infinity : n;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch { return d; }
}

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
  const maxBatches = Math.max(...operators.map(o => o.departureDates?.length ?? 0));

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

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[88vh] flex flex-col rounded-t-2xl overflow-hidden"
        style={{ background: "#0e1420", border: "1px solid rgba(255,255,255,0.09)", borderBottom: "none" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <p className="text-white font-bold text-sm">Compare Operators</p>
            <p className="text-white/35 text-xs mt-0.5">{operators.length} operators · side-by-side</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse min-w-[560px]">
            <thead className="sticky top-0 z-10" style={{ background: "#0e1420" }}>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th className="px-5 py-3 text-left w-[180px]">
                  <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Operator</span>
                </th>
                {[
                  { label: "Price", icon: null },
                  { label: "Rating", icon: <Star className="w-3 h-3" /> },
                  { label: "Departures", icon: <CalendarDays className="w-3 h-3" /> },
                  { label: "Cloakroom", icon: <Briefcase className="w-3 h-3" /> },
                  { label: "Porter", icon: <Package className="w-3 h-3" /> },
                ].map((col, i) => (
                  <th key={i} className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-white/25">
                      {col.icon}
                      <span className="text-[10px] font-bold uppercase tracking-widest">{col.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operators.map((op, i) => {
                const isBestPrice = prices[i] === minPrice;
                const count = op.departureDates?.length ?? 0;
                const isMostDates = count > 0 && count === maxBatches;
                const norm = op.name.trim().toLowerCase();
                const cr = computedRatings[norm];
                const displayRating = cr?.computed ? cr.avg : op.googleRating;
                const isComputed = !!cr?.computed;

                return (
                  <tr
                    key={i}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      background: isBestPrice ? "rgba(74,222,128,0.03)" : "transparent",
                    }}
                  >
                    {/* Operator name + book */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isBestPrice && (
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#4ade80" }} />
                        )}
                        <div className="min-w-0">
                          <p className="text-white/90 font-bold text-[13px] leading-tight truncate">{op.name}</p>
                          {op.verified && (
                            <span className="text-[8px] font-bold text-emerald-400/70 uppercase tracking-widest">Verified</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => op.website && window.open(op.website, "_blank", "noopener,noreferrer")}
                        disabled={!op.website}
                        className="mt-2 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all disabled:opacity-30 hover:brightness-110"
                        style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                      >
                        Book <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-black text-[15px]" style={{ color: isBestPrice ? "#4ade80" : "rgba(255,255,255,0.8)" }}>
                          {op.priceFrom}
                        </span>
                        {isBestPrice && (
                          <span className="inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2m0 8v2"/>
                            </svg>
                            Best price
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(displayRating) ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/10"}`} />
                          ))}
                        </div>
                        <span className="text-[11px] text-white/60 font-semibold">{displayRating}</span>
                        <span className="text-[8px]" style={{ color: isComputed ? "#4ade80" : "rgba(255,255,255,0.2)" }}>
                          {isComputed ? `${cr.count} reviews` : "Google"}
                        </span>
                      </div>
                    </td>

                    {/* Departures */}
                    <td className="px-4 py-4 text-center">
                      {count === 0
                        ? <span className="text-[10px] text-white/20">On request</span>
                        : <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-[13px]" style={{ color: isMostDates ? "#ff7d47" : "rgba(255,255,255,0.65)" }}>{count}</span>
                            <div className="flex flex-wrap justify-center gap-0.5">
                              {op.departureDates!.slice(0, 2).map((d, j) => (
                                <span key={j} className="text-[8px] px-1 py-0.5 rounded" style={{ background: "rgba(255,81,0,0.08)", color: "#ff9d70" }}>{formatDate(d)}</span>
                              ))}
                              {count > 2 && <span className="text-[8px] text-white/25">+{count - 2}</span>}
                            </div>
                          </div>
                      }
                    </td>

                    {/* Cloakroom */}
                    <td className="px-4 py-4 text-center">
                      {op.cloakroom
                        ? <div className="flex flex-col items-center gap-0.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(99,102,241,0.12)" }}>
                              <Check className="w-3.5 h-3.5 text-indigo-300" />
                            </div>
                            <span className="text-[8px] text-indigo-300/60">{op.cloakroom_charge ? `₹${op.cloakroom_charge}` : "Free"}</span>
                          </div>
                        : <X className="w-4 h-4 text-white/10 mx-auto" />
                      }
                    </td>

                    {/* Porter */}
                    <td className="px-4 py-4 text-center">
                      {op.offloading
                        ? <div className="flex flex-col items-center gap-0.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(20,184,166,0.12)" }}>
                              <Check className="w-3.5 h-3.5 text-teal-300" />
                            </div>
                            <span className="text-[8px] text-teal-300/60">{op.offloading_charge ? `₹${op.offloading_charge}/kg` : "Incl."}</span>
                          </div>
                        : <X className="w-4 h-4 text-white/10 mx-auto" />
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex items-center gap-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-emerald-400/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2m0 8v2"/>
            </svg>
            <span className="text-[10px] text-white/30">Best price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 opacity-60" />
            <span className="text-[10px] text-white/30">Community rating</span>
          </div>
          <button onClick={onClose} className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors">
            Close
          </button>
        </div>
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
    return <p className="text-white/25 text-xs text-center py-6">No operators listed yet for this adventure.</p>;
  }

  // Single operator — simple card
  if (operators.length === 1) {
    const op = operators[0];
    const norm = op.name.trim().toLowerCase();
    const cr = computedRatings[norm];
    const displayRating = cr?.computed ? cr.avg : op.googleRating;
    const isComputed = !!cr?.computed;
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)" }}>
        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-white/90 font-bold text-sm">{op.name}</p>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map(s => <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(displayRating) ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/10"}`} />)}
              <span className="text-white/40 text-[10px] ml-1">{displayRating}</span>
              <span className="text-[8px] ml-1" style={{ color: isComputed ? "#4ade80" : "rgba(255,255,255,0.18)" }}>
                {isComputed ? `${cr.count} reviews` : "Google"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider text-white/30">from</div>
            <div className="font-black text-sm text-white/90">{op.priceFrom}</div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <button
            onClick={() => op.website && window.open(op.website, "_blank", "noopener,noreferrer")}
            disabled={!op.website}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold disabled:opacity-30"
            style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.18)" }}
          >
            Get Details <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Multiple operators — summary + compare button
  const prices = operators.map(o => parsePrice(o.priceFrom));
  const minPrice = Math.min(...prices);
  const minPriceOp = operators[prices.indexOf(minPrice)];
  const allRatings = operators.map(op => {
    const cr = computedRatings[op.name.trim().toLowerCase()];
    return cr?.computed ? cr.avg : op.googleRating;
  }).filter(Boolean);
  const avgRating = allRatings.length > 0 ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) : null;

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
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className="rounded-xl p-3 flex flex-col gap-1"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/25">Operators</span>
            <span className="font-black text-xl text-white/80">{operators.length}</span>
          </div>
          <div
            className="rounded-xl p-3 flex flex-col gap-1"
            style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)" }}
          >
            <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400/50">From</span>
            <span className="font-black text-base text-emerald-300/90">{minPriceOp.priceFrom}</span>
          </div>
          {avgRating !== null && (
            <div
              className="rounded-xl p-3 flex flex-col gap-1"
              style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)" }}
            >
              <span className="text-[8px] font-bold uppercase tracking-widest text-amber-400/50">Avg. Rating</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="font-black text-base text-amber-300/90">{avgRating.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Compare button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all hover:brightness-110 active:scale-[0.99]"
          style={{
            background: "linear-gradient(135deg, rgba(255,81,0,0.08) 0%, rgba(255,125,71,0.05) 100%)",
            border: "1px solid rgba(255,81,0,0.2)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <ArrowUpDown className="w-4 h-4 text-[#ff5100]/70" />
            <div className="text-left">
              <p className="text-white/80 text-[13px] font-bold leading-none">Compare All Operators</p>
              <p className="text-white/30 text-[10px] mt-0.5">Price · Rating · Dates · Services</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#ff5100]/50 -rotate-90 shrink-0" />
        </button>
      </div>
    </>
  );
}
