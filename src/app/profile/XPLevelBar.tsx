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
    { label: "Check-ins", icon: <MapPin className="w-3 h-3" />,       count: xp.checkIns, xpPer: 50,  color: "#fbbf24" },
    { label: "Reviews",   icon: <MessageSquare className="w-3 h-3" />, count: xp.reviews,  xpPer: 30,  color: "#60a5fa" },
    { label: "Photos",    icon: <Camera className="w-3 h-3" />,        count: xp.photos,   xpPer: 20,  color: "#f43f5e" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
    >

      {/* ── Hero row: badge + name + XP ── */}
      <div className="px-5 pt-5 pb-5 flex items-center gap-4">
        {/* Level badge */}
        <div
          className="shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
          style={{
            background: `${currentLevel.color}18`,
            border: `1.5px solid ${currentLevel.color}55`,
            boxShadow: `0 0 20px ${currentLevel.color}25`,
          }}
        >
          <span className="text-2xl leading-none">{currentLevel.icon}</span>
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest" style={{ color: currentLevel.color }}>
            LVL {currentLevel.level}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-white font-black text-lg leading-none tracking-tight">{currentLevel.name}</h3>
            {streak >= 3 && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.3)" }}
              >
                <Flame className="w-2.5 h-2.5" />{streak}d
              </span>
            )}
          </div>
          <p className="text-white/30 text-[11px] mb-2">{currentLevel.perk}</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm font-black" style={{ color: currentLevel.color }}>
              <Zap className="w-3.5 h-3.5" />{xp.total.toLocaleString()} XP
            </span>
            {streakMultiplier > 1 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(251,146,60,0.12)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.25)" }}
              >
                {streakMultiplier}× streak
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-5 pb-5">
        {/* Labels */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold" style={{ color: `${currentLevel.color}99` }}>
            {currentLevel.icon} {currentLevel.name}
          </span>
          {nextLevel ? (
            <span className="text-[10px] font-semibold text-white/30">
              {nextLevel.icon} {nextLevel.name}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-white/30">✦ Max Rank</span>
          )}
        </div>

        {/* Track */}
        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${currentLevel.color}cc, ${currentLevel.color})`,
            }}
          />
          {/* Shimmer sweep */}
          <div
            className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.4s ease-in-out infinite",
            }}
          />
        </div>

        {/* XP numbers under bar */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-white/25 tabular-nums">{progressMin.toLocaleString()} XP</span>
          {nextLevel ? (
            <span className="text-[9px] font-semibold" style={{ color: `${currentLevel.color}70` }}>
              {xpToNext.toLocaleString()} XP to go
            </span>
          ) : (
            <span className="text-[9px] text-white/25">Max level reached</span>
          )}
          <span className="text-[9px] text-white/25 tabular-nums">{progressMax === currentLevel.minXP + 1 ? "—" : progressMax.toLocaleString()} XP</span>
        </div>
      </div>

      {/* ── XP Breakdown ── */}
      <div
        className="px-5 py-4 grid grid-cols-3 gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {breakdown.map((item) => {
          const earned = item.count * item.xpPer;
          const maxEarned = Math.max(...breakdown.map((b) => b.count * b.xpPer), 1);
          const barPct = (earned / maxEarned) * 100;
          return (
            <div
              key={item.label}
              className="rounded-xl p-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-1.5 mb-2" style={{ color: item.color }}>
                {item.icon}
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{item.label}</span>
              </div>
              <p className="text-white font-black text-base leading-none">{item.count}</p>
              <p className="text-[9px] mt-0.5" style={{ color: `${item.color}80` }}>+{earned} XP</p>
              <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${barPct}%`, background: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Level ladder ── */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/20 mb-3">Rank Ladder</p>
        <div className="flex items-start gap-1">
          {LEVELS.map((l, i) => {
            const reached = xp.total >= l.minXP;
            const isCurrent = l.level === currentLevel.level;
            return (
              <div key={l.level} className="flex-1 flex flex-col items-center gap-1.5 relative">
                {/* Connector line between nodes */}
                {i > 0 && (
                  <div
                    className="absolute top-3.5 right-1/2 h-px"
                    style={{
                      left: "-50%",
                      background: xp.total >= l.minXP ? `${l.color}50` : "rgba(255,255,255,0.06)",
                    }}
                  />
                )}
                {/* Node */}
                <div
                  className="relative w-7 h-7 rounded-xl flex items-center justify-center text-sm z-10 transition-all duration-300"
                  style={
                    isCurrent
                      ? { background: `${l.color}25`, border: `2px solid ${l.color}`, boxShadow: `0 0 12px ${l.color}50`, transform: "scale(1.15)" }
                      : reached
                      ? { background: `${l.color}18`, border: `1.5px solid ${l.color}50` }
                      : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", opacity: 0.35 }
                  }
                >
                  {reached ? l.icon : <span className="text-white/20 text-[10px] font-bold">{l.level}</span>}
                </div>
                <span
                  className="text-[8px] font-semibold text-center leading-tight"
                  style={{ color: isCurrent ? l.color : reached ? `${l.color}70` : "rgba(255,255,255,0.18)" }}
                >
                  {l.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Streak callout ── */}
      {streak > 0 && (
        <div
          className="px-5 py-3 flex items-center gap-3"
          style={{ borderTop: "1px solid rgba(251,146,60,0.12)", background: "rgba(251,146,60,0.04)" }}
        >
          <Flame className="w-4 h-4 text-orange-400 shrink-0" />
          <div className="flex-1">
            <p className="text-orange-400 text-xs font-bold">
              {streak === 1 ? "Streak started!" : `${streak}-day streak 🔥`}
            </p>
            <p className="text-white/30 text-[10px]">
              {streak >= 7
                ? "2× XP active — legendary run"
                : streak >= 3
                ? "1.5× XP active — keep going!"
                : "Earn XP tomorrow for a streak bonus"}
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
