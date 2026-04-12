"use client";

import { useMemo } from "react";
import { Flame, TrendingUp, Mountain, Globe, Map } from "lucide-react";
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

export default function TrekStreakCounter() {
  const { log, loading } = useTripLog();

  const stats = useMemo(() => {
    const entries = log
      .map((e) => ({ entry: e, adv: adventures.find((a) => a.slug === e.slug) }))
      .filter((x) => x.adv);

    const total = entries.length;

    // State streak: consecutive unique states
    const states = new Set(entries.map((x) => x.adv!.state));
    const statesCount = states.size;

    // Type breakdown
    const typeCounts: Record<string, number> = {};
    for (const { adv } of entries) {
      if (adv) typeCounts[adv.type] = (typeCounts[adv.type] || 0) + 1;
    }
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

    // Current streak: consecutive days with at least one log (sorted desc)
    const days = entries
      .map((x) => new Date(x.entry.date).toDateString())
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    if (days.length > 0) {
      streak = 1;
      for (let i = 1; i < days.length; i++) {
        const prev = new Date(days[i - 1]);
        const curr = new Date(days[i]);
        const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) streak++;
        else break;
      }
    }

    // Difficulty breakdown
    const diffCounts: Record<string, number> = {};
    for (const { adv } of entries) {
      if (adv) {
        const d = adv.difficulty;
        diffCounts[d] = (diffCounts[d] || 0) + 1;
      }
    }
    const hardCount =
      (diffCounts["Hard"] || 0) + (diffCounts["Advanced"] || 0) + (diffCounts["Extreme"] || 0);

    return { total, statesCount, streak, topType, hardCount, typeCounts };
  }, [log]);

  if (loading || stats.total === 0) return null;

  const statCards = [
    {
      icon: <Mountain className="w-4 h-4 text-[#ff5100]" />,
      value: stats.total,
      label: "Adventures Done",
      color: "#ff5100",
    },
    {
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      value: stats.streak,
      label: stats.streak === 1 ? "Day Streak" : "Day Streak",
      color: "#fbbf24",
    },
    {
      icon: <Globe className="w-4 h-4 text-sky-400" />,
      value: stats.statesCount,
      label: "States Explored",
      color: "#38bdf8",
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-violet-400" />,
      value: stats.hardCount,
      label: "Hard+ Done",
      color: "#a78bfa",
    },
  ];

  const typeEntries = Object.entries(stats.typeCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Map className="w-3.5 h-3.5 text-[#ff5100]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
          Your Adventure Stats
        </p>
      </div>

      {/* Stat grid */}
      <div
        className="grid grid-cols-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center gap-1 py-4 px-2"
            style={i < 3 ? { borderRight: "1px solid rgba(255,255,255,0.05)" } : {}}
          >
            <div className="mb-1">{s.icon}</div>
            <span
              className="text-xl font-bold tabular-nums leading-none"
              style={{ color: s.color }}
            >
              {s.value}
            </span>
            <span className="text-[9px] text-white/30 text-center leading-tight">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Type breakdown */}
      {typeEntries.length > 0 && (
        <div className="px-4 py-3.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25 mb-3">
            By Type
          </p>
          <div className="space-y-2">
            {typeEntries.slice(0, 5).map(([type, count]) => {
              const pct = Math.round((count / stats.total) * 100);
              const emoji = TYPE_ICONS[type as AdventureType] ?? "⚡";
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs w-5 text-center flex-none">{emoji}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #ff5100, #ff7d47)",
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-none">
                    <span className="text-white/40 text-[10px] w-14 truncate">{type}</span>
                    <span className="text-white/25 text-[9px] tabular-nums">{count}×</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
