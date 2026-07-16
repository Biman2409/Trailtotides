"use client";

import { useMemo } from "react";
import { CheckCircle2, Layers, Globe, Sun, Heart, Info } from "lucide-react";
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
      {/* Completed ↔ Wishlist */}
      <div className="grid grid-cols-2 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
        {[
          { value: stats.total,     label: "Completed",  color: "#10b981", icon: CheckCircle2 },
          { value: stats.wishCount, label: "Wishlisted", color: "#f43f5e", icon: Heart        },
        ].map(({ value, label, color, icon: Icon }, i) => (
          <div key={label}
            className="flex items-center gap-2.5 px-3 py-3"
            style={i === 0 ? { borderRight: "1px solid var(--border-subtle)" } : {}}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
              <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-black tabular-nums leading-none" style={{ color }}>{value}</span>
              <span className="text-[8px] uppercase tracking-wide font-bold leading-none" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary stats row */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
      <div className="grid grid-cols-3">
        {[
          { value: stats.types,     delta: stats.wishTypesNew,  label: "Types",            color: "#22d3ee", icon: Layers },
          { value: stats.states,    delta: stats.wishStatesNew, label: "States",           color: "#a78bfa", icon: Globe  },
          { value: stats.totalDays, delta: stats.wishDaysMore,  label: "Days in the Wild", color: "#f97316", icon: Sun    },
        ].map(({ value, delta, label, color, icon: Icon }, i) => (
          <div key={label}
            className="flex items-center gap-2.5 px-3 py-3"
            style={i < 2 ? { borderRight: "1px solid var(--border-subtle)" } : {}}>
            {/* Icon */}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
              <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            {/* Number + label stacked */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-[16px] font-black tabular-nums leading-none" style={{ color }}>{value}</span>
                {delta > 0 && stats.wishCount > 0 && (
                  <span className="text-[9px] font-black tabular-nums" style={{ color: "#f43f5e" }}>+{delta}</span>
                )}
              </div>
              <span className="text-[8px] uppercase tracking-wide font-bold leading-none truncate" style={{ color: "rgba(255,255,255,0.25)" }}>{label}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Wishlist delta footnote */}
      {stats.wishCount > 0 && (stats.wishTypesNew > 0 || stats.wishStatesNew > 0 || stats.wishDaysMore > 0) && (
        <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <Info className="w-2.5 h-2.5 shrink-0" style={{ color: "var(--text-muted)" }} />
          <span className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>
            <span style={{ color: "#f43f5e90" }}>+n</span> shows what you&apos;d gain by completing your wishlist
          </span>
        </div>
      )}
      </div>
    </div>
  );
}
