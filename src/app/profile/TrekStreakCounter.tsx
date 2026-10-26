"use client";

import { useMemo } from "react";
import { Layers, Globe, Sun, Info } from "lucide-react";
import { useTripLog } from "@/contexts/TripLogContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { adventures } from "@/lib/data";

const ORANGE = "#ff5100";

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

  // Completed and wishlisted counts are in the activity strip (and are the lists below), so this row
  // is just what those trips add up to. "+n" is what finishing the wishlist would add.
  const showDelta = stats.wishCount > 0;
  return (
    <div className="mb-5 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
      <div className="grid grid-cols-3">
        {[
          { value: stats.types,     delta: stats.wishTypesNew,  label: "types",            icon: Layers },
          { value: stats.states,    delta: stats.wishStatesNew, label: "regions",          icon: Globe  },
          { value: stats.totalDays, delta: stats.wishDaysMore,  label: "days in the wild", icon: Sun    },
        ].map(({ value, delta, label, icon: Icon }, i) => (
          // A third of a phone is too narrow for icon and label side by side: drop the icon, let the label wrap
          <div key={label} className="flex items-center gap-2.5 px-2.5 sm:px-3 py-3 min-w-0" style={i < 2 ? { borderRight: "1px solid var(--border-subtle)" } : {}}>
            <Icon className="hidden sm:block w-4 h-4 shrink-0" style={{ color: value > 0 ? ORANGE : "var(--text-muted)" }} />
            <span className="min-w-0">
              <span className="flex items-baseline gap-1">
                <span className="text-[18px] leading-none font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</span>
                {showDelta && delta > 0 && <span className="text-[12px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>+{delta}</span>}
              </span>
              <span className="block text-[12px] leading-tight mt-1 tracking-[0.06em] lowercase sm:truncate" style={{ color: "var(--text-tertiary)", fontVariant: "small-caps" }}>{label}</span>
            </span>
          </div>
        ))}
      </div>
      {showDelta && (stats.wishTypesNew > 0 || stats.wishStatesNew > 0 || stats.wishDaysMore > 0) && (
        <p className="flex items-center gap-1.5 px-3 py-2 text-[12px]" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}>
          <Info className="w-3.5 h-3.5 shrink-0" />
          +n is what you&apos;d add by finishing your wishlist
        </p>
      )}
    </div>
  );
}
