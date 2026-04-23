"use client";

import { X, Star, CalendarDays, Briefcase, Package, ExternalLink, Check } from "lucide-react";
import { type OperatorCardData } from "./OperatorCard";

function parsePrice(p: string): number {
  const n = parseInt(p.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? Infinity : n;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch { return d; }
}

function CompareTable({ operators }: { operators: OperatorCardData[] }) {
  const prices = operators.map(o => parsePrice(o.priceFrom));
  const minPrice = Math.min(...prices);
  const maxBatches = Math.max(...operators.map(o => o.departureDates?.length ?? 0));

  const COLS = [
    { label: "Price",     icon: null },
    { label: "Rating",    icon: <Star className="w-3 h-3" /> },
    { label: "Dates",     icon: <CalendarDays className="w-3 h-3" /> },
    { label: "Cloakroom", icon: <Briefcase className="w-3 h-3" /> },
    { label: "Porter",    icon: <Package className="w-3 h-3" /> },
    { label: "",          icon: null },
  ];

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      <table className="w-full border-collapse">
        {/* Attribute column headers */}
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <th className="px-4 py-3 text-left min-w-[140px]">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wide">Operator</span>
            </th>
            {COLS.map((col, i) => (
              <th key={i} className="px-3 py-3 text-center min-w-[80px]"
                style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-center gap-1 text-white/30">
                  {col.icon}
                  {col.label && <span className="text-[10px] font-semibold uppercase tracking-wide">{col.label}</span>}
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
            return (
              <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                {/* Operator name */}
                <td className="px-4 py-3.5">
                  <p className="text-white/90 font-bold text-[13px] leading-tight">{op.name}</p>
                </td>

                {/* Price */}
                <td className="px-3 py-3.5 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-black text-[14px]" style={{ color: isBestPrice ? "#4ade80" : "rgba(255,255,255,0.8)" }}>{op.priceFrom}</span>
                    {isBestPrice && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                        Best
                      </span>
                    )}
                  </div>
                </td>

                {/* Rating */}
                <td className="px-3 py-3.5 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-2 h-2 ${s <= Math.round(op.rating) ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/10"}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-white/35">{op.rating}</span>
                  </div>
                </td>

                {/* Dates */}
                <td className="px-3 py-3.5 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                  {count === 0
                    ? <span className="text-[10px] text-white/20">On request</span>
                    : <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-[12px]" style={{ color: isMostDates ? "#ff7d47" : "rgba(255,255,255,0.65)" }}>{count}</span>
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
                <td className="px-3 py-3.5 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                  {op.cloakroom
                    ? <div className="flex flex-col items-center gap-0.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(99,102,241,0.15)" }}>
                          <Check className="w-3 h-3 text-indigo-300" />
                        </div>
                        <span className="text-[8px] text-indigo-300/60">{op.cloakroom_charge ? `₹${op.cloakroom_charge}` : "Free"}</span>
                      </div>
                    : <X className="w-3.5 h-3.5 text-white/12 mx-auto" />
                  }
                </td>

                {/* Porter */}
                <td className="px-3 py-3.5 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                  {op.offloading
                    ? <div className="flex flex-col items-center gap-0.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(20,184,166,0.15)" }}>
                          <Check className="w-3 h-3 text-teal-300" />
                        </div>
                        <span className="text-[8px] text-teal-300/60">{op.offloading_charge ? `₹${op.offloading_charge}/kg` : "Incl."}</span>
                      </div>
                    : <X className="w-3.5 h-3.5 text-white/12 mx-auto" />
                  }
                </td>

                {/* Book CTA */}
                <td className="px-3 py-3.5" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                  <button
                    onClick={() => op.website && window.open(op.website, "_blank", "noopener,noreferrer")}
                    disabled={!op.website}
                    className="flex items-center justify-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-30 hover:brightness-110"
                    style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                  >
                    Book <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function OperatorsSection({ operators }: { operators: OperatorCardData[] }) {
  if (operators.length === 0) {
    return <p className="text-white/25 text-xs text-center py-6">No operators listed yet for this adventure.</p>;
  }

  if (operators.length === 1) {
    const op = operators[0];
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)" }}>
        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-white/90 font-bold text-sm">{op.name}</p>
            <div className="flex items-center gap-0.5 mt-1">
              {[1,2,3,4,5].map(s => <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(op.rating) ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/10"}`} />)}
              <span className="text-white/25 text-[10px] ml-1">{op.rating}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider text-white/30">from</div>
            <div className="font-black text-sm text-white/90">{op.priceFrom}</div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <button onClick={() => op.website && window.open(op.website, "_blank", "noopener,noreferrer")} disabled={!op.website}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold disabled:opacity-30"
            style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.18)" }}>
            Get Details <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-white/25 text-[10px]">{operators.length} operators</p>
      <CompareTable operators={operators} />
    </div>
  );
}
