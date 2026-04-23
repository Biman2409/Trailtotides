"use client";

import { useState } from "react";
import { Star, CalendarDays, Briefcase, Package, ChevronDown, ExternalLink } from "lucide-react";

export type OperatorCardData = {
  name: string;
  rating: number;
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

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch { return d; }
}

export default function OperatorCard({ op, compareMode }: { op: OperatorCardData; compareMode?: boolean }) {
  const [batchesOpen, setBatchesOpen] = useState(false);
  const hasBatches = op.departureDates && op.departureDates.length > 0;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200 flex flex-col"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}
    >
      <div className="p-3.5 flex flex-col gap-2.5 flex-1">

        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white/90 font-bold text-[13px] leading-snug truncate">{op.name}</p>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(op.rating) ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/10"}`} />
              ))}
              <span className="text-white/25 text-[10px] ml-1">{op.rating}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] uppercase tracking-wider text-white/30 leading-none mb-0.5">from</div>
            <div className="font-black text-sm text-white/90">{op.priceFrom}</div>
          </div>
        </div>

        {/* Compare mode: facilities row always visible */}
        {compareMode && (
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${op.cloakroom ? "text-indigo-300" : "text-white/18"}`}
              style={{ background: op.cloakroom ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${op.cloakroom ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)"}` }}>
              <Briefcase className="w-2.5 h-2.5 shrink-0" />
              <span>{op.cloakroom ? `Cloakroom${op.cloakroom_charge ? ` ₹${op.cloakroom_charge}` : " free"}` : "No cloakroom"}</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${op.offloading ? "text-teal-300" : "text-white/18"}`}
              style={{ background: op.offloading ? "rgba(20,184,166,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${op.offloading ? "rgba(20,184,166,0.2)" : "rgba(255,255,255,0.05)"}` }}>
              <Package className="w-2.5 h-2.5 shrink-0" />
              <span>{op.offloading ? `Porter${op.offloading_charge ? ` ₹${op.offloading_charge}/kg` : " incl."}` : "No porter"}</span>
            </div>
            <div className={`col-span-2 flex items-center gap-1 px-2 py-1 rounded-md ${hasBatches ? "text-[#ff7d47]" : "text-white/18"}`}
              style={{ background: hasBatches ? "rgba(255,81,0,0.07)" : "rgba(255,255,255,0.02)", border: `1px solid ${hasBatches ? "rgba(255,81,0,0.15)" : "rgba(255,255,255,0.05)"}` }}>
              <CalendarDays className="w-2.5 h-2.5 shrink-0" />
              <span>{hasBatches ? `${op.departureDates!.length} departure${op.departureDates!.length > 1 ? "s" : ""}` : "Dates on request"}</span>
            </div>
          </div>
        )}

        {/* Default mode: batches toggle */}
        {!compareMode && hasBatches && (
          <>
            <button
              onClick={() => setBatchesOpen(v => !v)}
              className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-colors"
              style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.12)" }}
            >
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3 h-3 text-[#ff7d47]" />
                <span className="text-[#ff7d47] text-[11px] font-semibold">
                  {op.departureDates!.length} batch{op.departureDates!.length !== 1 ? "es" : ""}
                </span>
              </div>
              <ChevronDown className={`w-3 h-3 text-[#ff7d47]/50 transition-transform ${batchesOpen ? "rotate-180" : ""}`} />
            </button>
            {batchesOpen && (
              <div className="flex flex-wrap gap-1.5">
                {op.departureDates!.map((d, i) => (
                  <span key={i} className="text-[10px] font-medium px-2 py-1 rounded-md" style={{ background: "rgba(255,81,0,0.06)", color: "#ff9d70", border: "1px solid rgba(255,81,0,0.1)" }}>
                    {formatDate(d)}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {!compareMode && (op.cloakroom || op.offloading) && (
          <div className="flex flex-wrap gap-1.5">
            {op.cloakroom && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: "rgba(99,102,241,0.08)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.15)" }}>
                <Briefcase className="w-2.5 h-2.5" />
                Cloakroom{op.cloakroom_charge ? ` · ₹${op.cloakroom_charge}` : " · Free"}
              </span>
            )}
            {op.offloading && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: "rgba(20,184,166,0.08)", color: "#5eead4", border: "1px solid rgba(20,184,166,0.15)" }}>
                <Package className="w-2.5 h-2.5" />
                Porter{op.offloading_charge ? ` · ₹${op.offloading_charge}/kg` : " · Incl."}
              </span>
            )}
          </div>
        )}

        {op.notes && !compareMode && (
          <p className="text-white/30 text-[11px] leading-relaxed">{op.notes}</p>
        )}

      </div>

      {/* CTA */}
      <div className="px-3.5 pb-3.5">
        <button
          onClick={() => op.website && window.open(op.website, "_blank", "noopener,noreferrer")}
          disabled={!op.website}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
          style={{ background: "rgba(255,81,0,0.08)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.18)" }}
        >
          Get Details
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
