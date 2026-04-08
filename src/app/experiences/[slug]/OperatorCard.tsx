"use client";

import { useState } from "react";
import { Star, ShieldCheck, AlertTriangle, CalendarDays, Briefcase, Package, ChevronDown } from "lucide-react";
import OperatorButton from "./OperatorButton";

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
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return d; }
}

export default function OperatorCard({ op, verified }: { op: OperatorCardData; verified: boolean }) {
  const [batchesOpen, setBatchesOpen] = useState(false);
  const hasBatches = op.departureDates && op.departureDates.length > 0;
  const hasFacilities = op.cloakroom || op.offloading;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={
        verified
          ? {
              background: "linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(5,150,105,0.03) 100%)",
              border: "1px solid rgba(16,185,129,0.18)",
            }
          : {
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }
      }
    >
      <div className="p-5 flex flex-col gap-4">
        {/* Name / rating / price row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-col gap-1">
              {verified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <ShieldCheck className="w-3 h-3" />Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <AlertTriangle className="w-3 h-3" />Unverified
                </span>
              )}
              <span className="font-semibold text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{op.name}</span>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(op.rating) ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/10"}`} />
              ))}
              <span className="text-white/35 text-xs ml-1">{op.rating}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>From</div>
            <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{op.priceFrom}</div>
          </div>
        </div>

        {/* Facilities */}
        {hasFacilities && (
          <div className="flex flex-wrap gap-2">
            {op.cloakroom && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }}>
                <Briefcase className="w-3 h-3 shrink-0" />
                Cloakroom
                {op.cloakroom_charge
                  ? <span className="text-white/40 ml-0.5">· ₹{op.cloakroom_charge}</span>
                  : <span className="text-white/40 ml-0.5">· Free</span>}
              </div>
            )}
            {op.offloading && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: "rgba(20,184,166,0.1)", color: "#5eead4", border: "1px solid rgba(20,184,166,0.2)" }}>
                <Package className="w-3 h-3 shrink-0" />
                Porter / Offloading
                {op.offloading_charge
                  ? <span className="text-white/40 ml-0.5">· ₹{op.offloading_charge}/kg</span>
                  : <span className="text-white/40 ml-0.5">· Included</span>}
              </div>
            )}
          </div>
        )}

        {/* Batches accordion toggle */}
        {hasBatches && (
          <button
            onClick={() => setBatchesOpen(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left"
            style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.14)" }}
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-[#ff7d47]" />
              <span className="text-[#ff7d47] text-xs font-semibold">
                {op.departureDates!.length} Departure Batch{op.departureDates!.length !== 1 ? "es" : ""}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#ff7d47]/60 transition-transform ${batchesOpen ? "rotate-180" : ""}`} />
          </button>
        )}

        {/* Batch date grid */}
        {hasBatches && batchesOpen && (
          <div className="grid grid-cols-2 gap-1.5">
            {op.departureDates!.map((d, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.12)" }}>
                <span className="text-[10px] font-bold text-white/30 shrink-0">B{i + 1}</span>
                <span className="text-xs font-mono text-[#ff9d70]">{formatDate(d)}</span>
              </div>
            ))}
          </div>
        )}

        {op.notes && (
          <p className="text-white/35 text-xs leading-relaxed border-t border-white/6 pt-3">{op.notes}</p>
        )}

        <OperatorButton
          website={op.website ?? ""}
          label={verified ? "Get Details" : "Visit Website"}
          variant={verified ? "primary" : "secondary"}
        />
      </div>
    </div>
  );
}
