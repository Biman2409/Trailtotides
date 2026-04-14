"use client";

import { useMemo } from "react";
import { CheckCircle2, Layers, Globe, Sun, Heart, ArrowRight } from "lucide-react";
import { useTripLog } from "@/contexts/TripLogContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { adventures } from "@/lib/data";

function parseDays(durationDays: string): number {
  const match = durationDays.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

export default function TrekStreakCounter() {
  const { log, loading: logLoading } = useTripLog();
  const { saved, loading: wishLoading } = useWishlist();

  const stats = useMemo(() => {
    const entries = log
      .map(e => ({ entry: e, adv: adventures.find(a => a.slug === e.slug) }))
      .filter(x => x.adv);
    const total     = entries.length;
    const doneStates = new Set(entries.map(x => x.adv!.state));
    const doneTypes  = new Set(entries.map(x => x.adv!.type));
    const states    = doneStates.size;
    const types     = doneTypes.size;
    const totalDays = entries.reduce((sum, { adv }) => sum + (adv ? parseDays(adv.durationDays) : 0), 0);
    const wishCount = saved.size;

    // Wishlist deltas — new unique values not already in completed set
    const wishEntries = [...saved]
      .map(slug => adventures.find(a => a.slug === slug))
      .filter(Boolean) as (typeof adventures)[0][];

    const wishStatesNew = new Set(wishEntries.map(a => a.state).filter(s => !doneStates.has(s))).size;
    const wishTypesNew  = new Set(wishEntries.map(a => a.type).filter(t => !doneTypes.has(t))).size;
    const wishDaysMore  = wishEntries.reduce((sum, a) => sum + parseDays(a.durationDays), 0);

    return { total, states, types, totalDays, wishCount, wishStatesNew, wishTypesNew, wishDaysMore };
  }, [log, saved]);

  if (logLoading || wishLoading || (stats.total === 0 && stats.wishCount === 0)) return null;

  return (
    <div className="mb-5 space-y-2">
      {/* Completed ↔ Wishlist conversion graphic */}
      <div className="flex items-center gap-2 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Completed */}
        <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#10b98118", border: "1px solid #10b98130" }}>
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
          </div>
          <div>
            <p className="text-[20px] font-black tabular-nums leading-none" style={{ color: "#10b981" }}>{stats.total}</p>
            <p className="text-[8px] uppercase tracking-wide font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>Completed</p>
          </div>
        </div>

        {/* Arrow connector */}
        <div className="flex flex-col items-center gap-0.5 px-1 shrink-0">
          <ArrowRight className="w-3 h-3" style={{ color: "rgba(255,255,255,0.12)" }} />
          <span className="text-[7px] font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.1)" }}>next</span>
        </div>

        {/* Wishlist */}
        <div className="flex-1 flex items-center gap-2.5 px-4 py-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#f43f5e18", border: "1px solid #f43f5e30" }}>
            <Heart className="w-3.5 h-3.5" style={{ color: "#f43f5e" }} />
          </div>
          <div>
            <p className="text-[20px] font-black tabular-nums leading-none" style={{ color: "#f43f5e" }}>{stats.wishCount}</p>
            <p className="text-[8px] uppercase tracking-wide font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>Wishlisted</p>
          </div>
        </div>
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          { value: stats.types,     delta: stats.wishTypesNew,  label: "Types",            color: "#22d3ee", icon: Layers },
          { value: stats.states,    delta: stats.wishStatesNew, label: "States",           color: "#a78bfa", icon: Globe  },
          { value: stats.totalDays, delta: stats.wishDaysMore,  label: "Days in the Wild", color: "#f97316", icon: Sun    },
        ].map(({ value, delta, label, color, icon: Icon }, i) => (
          <div key={label}
            className="flex flex-col items-center justify-center py-3 px-2 gap-1.5"
            style={i < 2 ? { borderRight: "1px solid rgba(255,255,255,0.06)" } : {}}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
              <Icon className="w-3 h-3" style={{ color }} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[14px] font-black tabular-nums leading-none" style={{ color }}>{value}</span>
              {delta > 0 && stats.wishCount > 0 && (
                <span className="text-[9px] font-black tabular-nums" style={{ color: "#f43f5e" }}>+{delta}</span>
              )}
            </div>
            <span className="text-[7px] uppercase tracking-wide font-semibold text-center leading-tight" style={{ color: "rgba(255,255,255,0.22)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
