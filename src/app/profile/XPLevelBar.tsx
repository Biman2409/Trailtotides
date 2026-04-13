"use client";

import { useXP } from "@/contexts/XPContext";
import { LEVELS } from "@/lib/xp";
import { Flame, MapPin, MessageSquare, Camera, ChevronRight, Lock } from "lucide-react";

const MILESTONES = [
  { xp: 50,   label: "First check-in",        icon: "🥾", desc: "Visited your first adventure" },
  { xp: 150,  label: "Trailhead reached",      icon: "🧭", desc: "Earned Explorer rank" },
  { xp: 300,  label: "3 adventures checked",   icon: "⛺", desc: "Camped at 3 destinations" },
  { xp: 400,  label: "Trailblazer",            icon: "⛰️",  desc: "Earned Trailblazer rank" },
  { xp: 600,  label: "10 reviews written",     icon: "📝", desc: "Shared your trail knowledge" },
  { xp: 900,  label: "Summit Seeker",          icon: "🏔️",  desc: "Earned Summit Seeker rank" },
  { xp: 1200, label: "Photo expedition",       icon: "📷", desc: "Uploaded 20+ adventure photos" },
  { xp: 1800, label: "Legend status",          icon: "🌟", desc: "Reached the highest tier" },
];

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

  const earnedMilestones = MILESTONES.filter(m => xp.total >= m.xp);
  const nextMilestone = MILESTONES.find(m => xp.total < m.xp);

  return (
    <div className="space-y-3">

      {/* ── Hero card ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 60% at 20% 50%, ${currentLevel.color}10, transparent)` }}
        />

        <div className="relative px-5 pt-5 pb-4">
          {/* Level badge + info */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center"
              style={{
                background: `${currentLevel.color}15`,
                border: `1.5px solid ${currentLevel.color}40`,
                boxShadow: `0 0 24px ${currentLevel.color}20`,
              }}
            >
              <span className="text-xl leading-none">{currentLevel.icon}</span>
              <span className="text-[8px] font-black mt-1 uppercase tracking-widest" style={{ color: currentLevel.color }}>
                LV {currentLevel.level}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h3 className="text-white font-black text-[17px] leading-none tracking-tight">{currentLevel.name}</h3>
                {streak >= 3 && (
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                    style={{ background: "rgba(251,146,60,0.12)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.25)" }}
                  >
                    <Flame className="w-2.5 h-2.5" />{streak}d streak
                    {streakMultiplier > 1 && <span className="ml-0.5 font-black">{streakMultiplier}×</span>}
                  </span>
                )}
              </div>
              <p className="text-white/30 text-[11px] mb-2.5 leading-snug">{currentLevel.perk}</p>

              {/* XP stat row */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-black tabular-nums" style={{ color: currentLevel.color }}>
                  {xp.total.toLocaleString()} XP
                </span>
                {nextLevel && (
                  <span className="text-[10px] text-white/25 font-medium">
                    {xpToNext.toLocaleString()} to {nextLevel.name}
                  </span>
                )}
                {!nextLevel && (
                  <span className="text-[10px] font-bold" style={{ color: currentLevel.color + "80" }}>Max rank</span>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-1">
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${currentLevel.color}99, ${currentLevel.color})` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-white/20">{progressMin.toLocaleString()} XP</span>
            <span className="text-[9px] font-mono text-white/20">{progressMax === currentLevel.minXP + 1 ? "∞" : progressMax.toLocaleString()} XP</span>
          </div>
        </div>

        {/* XP sources strip */}
        <div
          className="px-5 py-3 grid grid-cols-3 gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          {[
            { label: "Check-ins", icon: <MapPin className="w-3 h-3" />, count: xp.checkIns, xpEach: 50, color: "#fbbf24" },
            { label: "Reviews",   icon: <MessageSquare className="w-3 h-3" />, count: xp.reviews,  xpEach: 30, color: "#60a5fa" },
            { label: "Photos",    icon: <Camera className="w-3 h-3" />,        count: xp.photos,   xpEach: 20, color: "#f43f5e" },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1" style={{ color: item.color + "99" }}>
                {item.icon}
                <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
              </div>
              <p className="text-white font-black text-base leading-none">{item.count}</p>
              <p className="text-[9px] mt-0.5" style={{ color: item.color + "60" }}>+{item.count * item.xpEach} XP</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rank ladder ── */}
      <div
        className="rounded-2xl px-5 py-4"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-4">Rank Ladder</p>
        <div className="relative flex items-center justify-between">
          {/* Track line */}
          <div className="absolute left-0 right-0 top-[18px] h-px" style={{ background: "rgba(255,255,255,0.06)", zIndex: 0 }} />
          <div
            className="absolute left-0 top-[18px] h-px transition-all duration-700"
            style={{
              width: `${((currentLevel.level - 1) / (LEVELS.length - 1)) * 100}%`,
              background: `linear-gradient(90deg, ${LEVELS[0].color}, ${currentLevel.color})`,
              zIndex: 1,
            }}
          />
          {LEVELS.map(l => {
            const reached = xp.total >= l.minXP;
            const isCurrent = l.level === currentLevel.level;
            return (
              <div key={l.level} className="relative z-10 flex flex-col items-center gap-1.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-300"
                  style={
                    isCurrent
                      ? { background: `${l.color}25`, border: `2px solid ${l.color}`, boxShadow: `0 0 16px ${l.color}50`, transform: "scale(1.15)" }
                      : reached
                      ? { background: `${l.color}15`, border: `1.5px solid ${l.color}40` }
                      : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", opacity: 0.3 }
                  }
                >
                  {reached ? l.icon : <span className="text-[10px] font-black text-white/20">{l.level}</span>}
                </div>
                <span
                  className="text-[8px] font-semibold text-center leading-tight w-12"
                  style={{ color: isCurrent ? l.color : reached ? `${l.color}70` : "rgba(255,255,255,0.18)" }}
                >
                  {l.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Milestones ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Milestones</p>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,125,71,0.1)", color: "#ff7d47", border: "1px solid rgba(255,125,71,0.2)" }}>
            {earnedMilestones.length} / {MILESTONES.length}
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          {MILESTONES.map((m, i) => {
            const earned = xp.total >= m.xp;
            const isNext = m === nextMilestone;
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3 transition-colors"
                style={isNext ? { background: "rgba(255,125,71,0.03)" } : {}}
              >
                <div
                  className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-base"
                  style={
                    earned
                      ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }
                      : { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", opacity: 0.35 }
                  }
                >
                  {earned ? m.icon : <Lock className="w-3 h-3 text-white/20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-semibold leading-tight ${earned ? "text-white/80" : "text-white/25"}`}>{m.label}</p>
                  <p className={`text-[10px] mt-0.5 ${earned ? "text-white/30" : "text-white/15"}`}>{m.desc}</p>
                </div>
                <div className="shrink-0 text-right">
                  {earned ? (
                    <span className="text-[9px] font-bold text-emerald-400/70">Earned</span>
                  ) : isNext ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[9px] font-bold" style={{ color: "#ff7d47" }}>Next</span>
                      <span className="text-[9px] text-white/20 tabular-nums">{(m.xp - xp.total)} XP away</span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-mono text-white/15 tabular-nums">{m.xp} XP</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Next action nudge ── */}
      {nextMilestone && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: "rgba(255,125,71,0.05)", border: "1px solid rgba(255,125,71,0.12)" }}
        >
          <span className="text-lg shrink-0">{nextMilestone.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white/70 leading-tight">Next: {nextMilestone.label}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{nextMilestone.xp - xp.total} XP needed</p>
          </div>
          <div className="h-1.5 flex-1 max-w-[80px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (xp.total / nextMilestone.xp) * 100)}%`,
                background: "linear-gradient(90deg, #ff5100, #ff7d47)",
              }}
            />
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
        </div>
      )}
    </div>
  );
}
