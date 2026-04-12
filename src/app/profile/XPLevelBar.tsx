"use client";

import { useXP } from "@/contexts/XPContext";
import { LEVELS } from "@/lib/xp";
import { Zap, Flame, MapPin, MessageSquare, Camera } from "lucide-react";

export default function XPLevelBar() {
  const { xp, currentLevel, nextLevel } = useXP();

  const progressMin = currentLevel.minXP;
  const progressMax = nextLevel ? nextLevel.minXP : currentLevel.minXP + 1;
  const progressPct = nextLevel
    ? Math.min(100, ((xp.total - progressMin) / (progressMax - progressMin)) * 100)
    : 100;
  const xpToNext = nextLevel ? nextLevel.minXP - xp.total : 0;
  const streak = xp.streak ?? 0;
  const streakMultiplier = streak >= 7 ? 2 : streak >= 3 ? 1.5 : 1;

  const breakdown = [
    { label: "Check-ins", icon: <MapPin className="w-3 h-3" />,      count: xp.checkIns, base: 50,  color: "#fbbf24" },
    { label: "Reviews",   icon: <MessageSquare className="w-3 h-3" />, count: xp.reviews,  base: 30,  color: "#60a5fa" },
    { label: "Photos",    icon: <Camera className="w-3 h-3" />,       count: xp.photos,   base: 20,  color: "#f43f5e" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>

      {/* ── Hero row ── */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-4">
        {/* Level badge */}
        <div
          className="relative shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${currentLevel.color}22, ${currentLevel.color}0a)`,
            border: `1.5px solid ${currentLevel.color}50`,
            boxShadow: `0 0 24px ${currentLevel.color}30`,
          }}
        >
          <span className="text-2xl leading-none">{currentLevel.icon}</span>
          <span className="text-[9px] font-black mt-0.5 uppercase tracking-widest" style={{ color: currentLevel.color }}>
            LVL {currentLevel.level}
          </span>
        </div>

        {/* Name + XP */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-black text-lg leading-none tracking-tight">{currentLevel.name}</h3>
            {streak >= 3 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.3)" }}>
                <Flame className="w-2.5 h-2.5" />{streak}d
              </span>
            )}
          </div>
          <p className="text-white/35 text-[11px] mt-0.5">{currentLevel.perk}</p>

          {/* XP total + streak bonus */}
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-sm font-black" style={{ color: currentLevel.color }}>
              <Zap className="w-3.5 h-3.5" />{xp.total.toLocaleString()} XP
            </span>
            {streakMultiplier > 1 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(251,146,60,0.12)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.25)" }}>
                {streakMultiplier}× streak bonus
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/25 text-[9px] font-semibold uppercase tracking-[0.15em]">
            {nextLevel ? `${nextLevel.icon} ${nextLevel.name}` : "✦ Max Level"}
          </span>
          {nextLevel && (
            <span className="text-white/30 text-[9px]">{xpToNext} XP to go</span>
          )}
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${currentLevel.color}80, ${currentLevel.color})`,
              boxShadow: `0 0 12px ${currentLevel.color}70`,
            }}
          >
            {/* shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
          </div>
        </div>
        <p className="text-white/20 text-[9px] mt-1 text-right">{Math.round(progressPct)}% complete</p>
      </div>

      {/* ── Breakdown ── */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-3">
        {breakdown.map(item => {
          const earned = item.count * item.base;
          const maxInBreakdown = Math.max(...breakdown.map(b => b.count * b.base), 1);
          const pct = (earned / maxInBreakdown) * 100;
          return (
            <div key={item.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-1.5 mb-2" style={{ color: item.color }}>
                {item.icon}
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{item.label}</span>
              </div>
              <p className="text-white font-black text-base leading-none">{item.count}</p>
              <p className="text-[9px] mt-0.5" style={{ color: `${item.color}80` }}>+{earned} XP</p>
              <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: item.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Level ladder ── */}
      <div className="px-5 py-3 flex items-center gap-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
        {LEVELS.map((l, i) => {
          const reached = xp.total >= l.minXP;
          const isCurrent = l.level === currentLevel.level;
          return (
            <div key={l.level} className="flex-1 flex flex-col items-center gap-1">
              {/* connector line */}
              {i > 0 && (
                <div className="absolute" />
              )}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm transition-all duration-300 ${isCurrent ? "scale-110" : ""}`}
                style={reached
                  ? { background: `${l.color}20`, border: `1.5px solid ${l.color}60`, boxShadow: isCurrent ? `0 0 12px ${l.color}50` : "none" }
                  : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", opacity: 0.4 }
                }
              >
                {reached ? l.icon : <span className="text-white/20 text-[10px] font-bold">{l.level}</span>}
              </div>
              <span className="text-[7px] font-semibold text-center leading-tight"
                style={{ color: reached ? `${l.color}90` : "rgba(255,255,255,0.15)", maxWidth: 44 }}>
                {l.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Streak callout ── */}
      {streak > 0 && (
        <div className="px-5 py-3 flex items-center gap-3" style={{ borderTop: "1px solid rgba(251,146,60,0.1)", background: "rgba(251,146,60,0.04)" }}>
          <Flame className="w-4 h-4 text-orange-400 shrink-0" />
          <div className="flex-1">
            <p className="text-orange-400 text-xs font-bold">
              {streak === 1 ? "Started a streak!" : `${streak}-day streak 🔥`}
            </p>
            <p className="text-white/30 text-[10px]">
              {streak >= 7 ? "2× XP active — legendary run" : streak >= 3 ? "1.5× XP active — keep going!" : "Earn XP tomorrow for a streak bonus"}
            </p>
          </div>
          {streakMultiplier > 1 && (
            <span className="text-sm font-black text-orange-400">{streakMultiplier}×</span>
          )}
        </div>
      )}
    </div>
  );
}
