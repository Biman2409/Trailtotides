"use client";

import { useMemo } from "react";
import { useTripLog } from "@/contexts/TripLogContext";
import { adventures } from "@/lib/data";

function parseDays(durationDays: string): number {
  const match = durationDays.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

export default function TrekStreakCounter() {
  const { log, loading } = useTripLog();

  const stats = useMemo(() => {
    const entries = log
      .map(e => ({ entry: e, adv: adventures.find(a => a.slug === e.slug) }))
      .filter(x => x.adv);
    const total      = entries.length;
    const states     = new Set(entries.map(x => x.adv!.state)).size;
    const types      = new Set(entries.map(x => x.adv!.type)).size;
    const totalDays  = entries.reduce((sum, { adv }) => sum + (adv ? parseDays(adv.durationDays) : 0), 0);
    return { total, states, types, totalDays };
  }, [log]);

  if (loading || stats.total === 0) return null;

  const items = [
    { value: stats.total,    label: "Adventures",       color: "#f97316" },
    { value: stats.types,    label: "Types",            color: "#22d3ee" },
    { value: stats.states,   label: "States",           color: "#a78bfa" },
    { value: stats.totalDays,label: "Days in the Wild", color: "#10b981" },
  ];

  return (
    <div className="grid grid-cols-4 rounded-xl overflow-hidden mb-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      {items.map(({ value, label, color }, i) => (
        <div
          key={label}
          className="flex flex-col items-center justify-center py-3 px-2 gap-0.5"
          style={i < items.length - 1 ? { borderRight: "1px solid rgba(255,255,255,0.06)" } : {}}
        >
          <span className="text-lg font-black tabular-nums leading-none" style={{ color }}>{value}</span>
          <span className="text-[8px] text-white/28 text-center leading-tight">{label}</span>
        </div>
      ))}
    </div>
  );
}
