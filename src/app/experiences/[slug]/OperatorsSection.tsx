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
  const maxRating = Math.max(...operators.map(o => o.rating));
  const maxBatches = Math.max(...operators.map(o => o.departureDates?.length ?? 0));

  const rows: { label: string; icon: React.ReactNode; render: (op: OperatorCardData, i: number) => React.ReactNode }[] = [
    {
      label: "Price",
      icon: <span className="text-[10px]">₹</span>,
      render: (op, i) => {
        const isBest = prices[i] === minPrice;
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-black text-sm" style={{ color: isBest ? "#4ade80" : "rgba(255,255,255,0.85)" }}>{op.priceFrom}</span>
            {isBest && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80" }}>Best</span>}
          </div>
        );
      },
    },
    {
      label: "Rating",
      icon: <Star className="w-3 h-3" />,
      render: (op, i) => {
        const isBest = op.rating === maxRating;
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(op.rating) ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/10"}`} />
              ))}
            </div>
            <span className="text-[10px] text-white/40">{op.rating}</span>
          </div>
        );
      },
    },
    {
      label: "Departures",
      icon: <CalendarDays className="w-3 h-3" />,
      render: (op, i) => {
        const count = op.departureDates?.length ?? 0;
        const isBest = count > 0 && count === maxBatches;
        if (count === 0) return <span className="text-[11px] text-white/25">On request</span>;
        return (
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-[13px]" style={{ color: isBest ? "#ff7d47" : "rgba(255,255,255,0.7)" }}>{count}</span>
            <div className="flex flex-wrap justify-center gap-1 max-w-[100px]">
              {op.departureDates!.slice(0, 3).map((d, j) => (
                <span key={j} className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,81,0,0.08)", color: "#ff9d70" }}>{formatDate(d)}</span>
              ))}
              {op.departureDates!.length > 3 && <span className="text-[8px] text-white/25">+{op.departureDates!.length - 3}</span>}
            </div>
          </div>
        );
      },
    },
    {
      label: "Cloakroom",
      icon: <Briefcase className="w-3 h-3" />,
      render: (op) => op.cloakroom
        ? <div className="flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
              <Check className="w-3 h-3 text-indigo-300" />
            </div>
            <span className="text-[9px] text-indigo-300/70">{op.cloakroom_charge ? `₹${op.cloakroom_charge}` : "Free"}</span>
          </div>
        : <X className="w-3.5 h-3.5 text-white/15" />,
    },
    {
      label: "Porter",
      icon: <Package className="w-3 h-3" />,
      render: (op) => op.offloading
        ? <div className="flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(20,184,166,0.15)" }}>
              <Check className="w-3 h-3 text-teal-300" />
            </div>
            <span className="text-[9px] text-teal-300/70">{op.offloading_charge ? `₹${op.offloading_charge}/kg` : "Incl."}</span>
          </div>
        : <X className="w-3.5 h-3.5 text-white/15" />,
    },
  ];

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
      {/* Operator name headers */}
      <div className="grid" style={{ gridTemplateColumns: `120px repeat(${operators.length}, 1fr)` }}>
        <div className="px-3 py-3 border-b border-r" style={{ borderColor: "rgba(255,255,255,0.07)" }} />
        {operators.map((op, i) => (
          <div key={i} className="px-3 py-3 border-b text-center" style={{ borderColor: "rgba(255,255,255,0.07)", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined }}>
            <p className="text-white/85 font-bold text-[12px] leading-tight truncate">{op.name}</p>
          </div>
        ))}
      </div>

      {/* Attribute rows */}
      {rows.map((row, ri) => (
        <div key={ri} className="grid" style={{ gridTemplateColumns: `120px repeat(${operators.length}, 1fr)`, background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
          {/* Label */}
          <div className="flex items-center gap-2 px-3 py-3.5 border-r" style={{ borderColor: "rgba(255,255,255,0.07)", borderTop: ri > 0 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
            <span className="text-white/30">{row.icon}</span>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wide">{row.label}</span>
          </div>
          {/* Values */}
          {operators.map((op, oi) => (
            <div key={oi} className="flex items-center justify-center px-2 py-3.5"
              style={{ borderTop: ri > 0 ? "1px solid rgba(255,255,255,0.04)" : undefined, borderLeft: oi > 0 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
              {row.render(op, oi)}
            </div>
          ))}
        </div>
      ))}

      {/* CTA row */}
      <div className="grid border-t" style={{ gridTemplateColumns: `120px repeat(${operators.length}, 1fr)`, borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="px-3 py-3 border-r" style={{ borderColor: "rgba(255,255,255,0.07)" }} />
        {operators.map((op, i) => (
          <div key={i} className="px-2 py-3" style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined }}>
            <button
              onClick={() => op.website && window.open(op.website, "_blank", "noopener,noreferrer")}
              disabled={!op.website}
              className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-[10px] font-semibold transition-all disabled:opacity-30"
              style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.18)" }}
            >
              Book <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>
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
      <p className="text-white/25 text-[10px]">{operators.length} operators — compare side by side</p>
      <CompareTable operators={operators} />
    </div>
  );
}
