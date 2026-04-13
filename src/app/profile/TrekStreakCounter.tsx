"use client";

import { useMemo } from "react";
import { Mountain, Globe, Layers, Clock } from "lucide-react";
import { useTripLog } from "@/contexts/TripLogContext";
import { adventures } from "@/lib/data";
import type { AdventureType } from "@/lib/data";

const TYPE_ICONS: Partial<Record<AdventureType, string>> = {
  Trekking: "🥾",
  Biking: "🏍",
  Cycling: "🚴",
  Diving: "🤿",
  Kayaking: "🛶",
  Skiing: "⛷",
  Mountaineering: "🧗",
  "Rock Climbing": "🪨",
  Scrambling: "⛰",
  Paragliding: "🪂",
};

const TYPE_COLORS: Partial<Record<AdventureType, string>> = {
  Trekking: "#f97316",
  Biking: "#eab308",
  Cycling: "#84cc16",
  Diving: "#3b82f6",
  Kayaking: "#22d3ee",
  Skiing: "#a78bfa",
  Mountaineering: "#f43f5e",
  "Rock Climbing": "#10b981",
  Scrambling: "#f59e0b",
  Paragliding: "#e879f9",
};

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

    const typeCounts: Record<string, number> = {};
    for (const { adv } of entries) {
      if (adv) typeCounts[adv.type] = (typeCounts[adv.type] || 0) + 1;
    }

    const totalDays = entries.reduce((sum, { adv }) => sum + (adv ? parseDays(adv.durationDays) : 0), 0);

    return { total, statesCount: states.size, typesCount: uniqueTypes.size, totalDays, typeCounts };
  }, [log]);

  if (loading || stats.total === 0) return null;

  const statCards = [
    { icon: <Mountain className="w-4 h-4" />, value: stats.total,        label: "Adventures",      color: "#ff5100" },
    { icon: <Layers    className="w-4 h-4" />, value: stats.typesCount,   label: "Types",           color: "#a78bfa" },
    { icon: <Globe     className="w-4 h-4" />, value: stats.statesCount,  label: "States",          color: "#38bdf8" },
    { icon: <Clock     className="w-4 h-4" />, value: stats.totalDays,    label: "Days in the Wild",color: "#10b981" },
  ];

  const typeEntries = Object.entries(stats.typeCounts).sort((a, b) => b[1] - a[1]);

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

      {/* Type breakdown */}
      {typeEntries.length > 0 && (
        <div className="px-4 py-3.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25 mb-3">By Type</p>
          <div className="space-y-2">
            {typeEntries.slice(0, 5).map(([type, count]) => {
              const pct   = Math.round((count / stats.total) * 100);
              const emoji = TYPE_ICONS[type as AdventureType] ?? "⚡";
              const color = TYPE_COLORS[type as AdventureType] ?? "#ff5100";
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-28 flex items-center gap-2 shrink-0">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                      {emoji}
                    </div>
                    <span className="text-white/50 text-[11px] truncate">{type}</span>
                  </div>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="text-white/50 text-xs w-5 text-right font-mono shrink-0">{count}×</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
