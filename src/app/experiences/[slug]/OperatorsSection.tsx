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

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      <table className="w-full min-w-[360px] border-collapse">
        {/* Operator column headers */}
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <th className="w-[100px] px-3 py-3 text-left" />
            {operators.map((op, i) => (
              <th key={i} className="px-3 py-3 text-center min-w-[130px]"
                style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-white font-bold text-[13px] leading-tight">{op.name}</p>
                <div className="flex items-center justify-center gap-0.5 mt-1.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(op.rating) ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/10"}`} />
                  ))}
                  <span className="text-white/25 text-[9px] ml-1">{op.rating}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Price */}
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <td className="px-3 py-3">
              <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wide">Price</span>
            </td>
            {operators.map((op, i) => {
              const isBest = prices[i] === minPrice;
              return (
                <td key={i} className="px-3 py-3 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-black text-[15px]" style={{ color: isBest ? "#4ade80" : "rgba(255,255,255,0.85)" }}>{op.priceFrom}</span>
                    {isBest && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                        Best price
                      </span>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Departures */}
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
            <td className="px-3 py-3">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3 h-3 text-white/25" />
                <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wide">Dates</span>
              </div>
            </td>
            {operators.map((op, i) => {
              const count = op.departureDates?.length ?? 0;
              const isBest = count > 0 && count === maxBatches;
              return (
                <td key={i} className="px-3 py-3 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                  {count === 0
                    ? <span className="text-[11px] text-white/20">On request</span>
                    : <div className="flex flex-col items-center gap-1.5">
                        <span className="font-bold text-[13px]" style={{ color: isBest ? "#ff7d47" : "rgba(255,255,255,0.65)" }}>
                          {count} batch{count !== 1 ? "es" : ""}
                        </span>
                        <div className="flex flex-wrap justify-center gap-1">
                          {op.departureDates!.slice(0, 3).map((d, j) => (
                            <span key={j} className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,81,0,0.08)", color: "#ff9d70" }}>
                              {formatDate(d)}
                            </span>
                          ))}
                          {op.departureDates!.length > 3 && (
                            <span className="text-[8px] text-white/25">+{op.departureDates!.length - 3}</span>
                          )}
                        </div>
                      </div>
                  }
                </td>
              );
            })}
          </tr>

          {/* Cloakroom */}
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <td className="px-3 py-3">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-white/25" />
                <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wide">Cloakroom</span>
              </div>
            </td>
            {operators.map((op, i) => (
              <td key={i} className="px-3 py-3 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                {op.cloakroom
                  ? <div className="flex flex-col items-center gap-0.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(99,102,241,0.15)" }}>
                        <Check className="w-3.5 h-3.5 text-indigo-300" />
                      </div>
                      <span className="text-[9px] text-indigo-300/70">{op.cloakroom_charge ? `₹${op.cloakroom_charge}` : "Free"}</span>
                    </div>
                  : <X className="w-3.5 h-3.5 text-white/15 mx-auto" />
                }
              </td>
            ))}
          </tr>

          {/* Porter */}
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
            <td className="px-3 py-3">
              <div className="flex items-center gap-1.5">
                <Package className="w-3 h-3 text-white/25" />
                <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wide">Porter</span>
              </div>
            </td>
            {operators.map((op, i) => (
              <td key={i} className="px-3 py-3 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                {op.offloading
                  ? <div className="flex flex-col items-center gap-0.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(20,184,166,0.15)" }}>
                        <Check className="w-3.5 h-3.5 text-teal-300" />
                      </div>
                      <span className="text-[9px] text-teal-300/70">{op.offloading_charge ? `₹${op.offloading_charge}/kg` : "Incl."}</span>
                    </div>
                  : <X className="w-3.5 h-3.5 text-white/15 mx-auto" />
                }
              </td>
            ))}
          </tr>

          {/* CTA row */}
          <tr>
            <td className="px-3 py-3" />
            {operators.map((op, i) => (
              <td key={i} className="px-3 py-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                <button
                  onClick={() => op.website && window.open(op.website, "_blank", "noopener,noreferrer")}
                  disabled={!op.website}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-30 hover:brightness-110"
                  style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                >
                  Book <ExternalLink className="w-3 h-3" />
                </button>
              </td>
            ))}
          </tr>
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
