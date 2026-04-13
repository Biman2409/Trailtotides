"use client";

import { useMemo } from "react";
import { Mountain, Globe, Layers, Clock } from "lucide-react";
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
      .map((e) => ({ entry: e, adv: adventures.find((a) => a.slug === e.slug) }))
      .filter((x) => x.adv);

    const total = entries.length;
    const states = new Set(entries.map((x) => x.adv!.state));
    const uniqueTypes = new Set(entries.map((x) => x.adv!.type));

    const totalDays = entries.reduce((sum, { adv }) => sum + (adv ? parseDays(adv.durationDays) : 0), 0);

    return { total, statesCount: states.size, typesCount: uniqueTypes.size, totalDays };
  }, [log]);

  if (loading || stats.total === 0) return null;

  const statCards = [
    { icon: <Mountain className="w-4 h-4" />, value: stats.total,        label: "Adventures",      color: "#ff5100" },
    { icon: <Layers    className="w-4 h-4" />, value: stats.typesCount,   label: "Types",           color: "#a78bfa" },
    { icon: <Globe     className="w-4 h-4" />, value: stats.statesCount,  label: "States",          color: "#38bdf8" },
    { icon: <Clock     className="w-4 h-4" />, value: stats.totalDays,    label: "Days in the Wild",color: "#10b981" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>

      {/* Stat grid */}
      <div className="grid grid-cols-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center gap-1 py-4 px-2"
            style={i < 3 ? { borderRight: "1px solid rgba(255,255,255,0.05)" } : {}}
          >
            <span style={{ color: s.color }} className="opacity-60 mb-0.5">{s.icon}</span>
            <span className="text-xl font-black tabular-nums leading-none" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[9px] text-white/30 text-center leading-tight mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
