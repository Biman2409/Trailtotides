"use client";

import { useXP } from "@/contexts/XPContext";
import { LEVELS } from "@/lib/xp";

export default function XPLevelBar() {
  const { xp, currentLevel, nextLevel } = useXP();

  const progressMin = currentLevel.minXP;
  const progressMax = nextLevel ? nextLevel.minXP : currentLevel.minXP + 1;
  const progressPct = nextLevel
    ? Math.min(100, ((xp.total - progressMin) / (progressMax - progressMin)) * 100)
    : 100;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Top row: level name + XP total */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
            style={{
              background: `${currentLevel.color}18`,
              border: `1.5px solid ${currentLevel.color}40`,
              color: currentLevel.color,
              boxShadow: `0 0 14px ${currentLevel.color}25`,
            }}
          >
            {currentLevel.level}
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">{currentLevel.name}</p>
            <p className="text-white/30 text-[10px] mt-0.5">Level {currentLevel.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-black text-base leading-none" style={{ color: currentLevel.color }}>
            {xp.total.toLocaleString()}
          </p>
          <p className="text-white/25 text-[10px] mt-0.5">Total XP</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/25 text-[9px] font-semibold uppercase tracking-[0.15em]">
            {nextLevel ? `Progress to ${nextLevel.name}` : "Max Level Reached"}
          </span>
          {nextLevel && (
            <span className="text-white/30 text-[9px] font-medium">
              {xp.total - progressMin} / {progressMax - progressMin} XP
            </span>
          )}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${currentLevel.color}90, ${currentLevel.color})`,
              boxShadow: `0 0 8px ${currentLevel.color}60`,
            }}
          />
        </div>

        {/* XP breakdown */}
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { label: "Check-ins", value: xp.checkIns, xp: xp.checkIns * 50, color: "#fbbf24" },
            { label: "Reviews",   value: xp.reviews,  xp: xp.reviews * 30,  color: "#60a5fa" },
            { label: "Photos",    value: xp.photos,   xp: xp.photos * 20,   color: "#f43f5e" },
          ].map(item => (
            <div key={item.label} className="flex-1 text-center">
              <p className="font-black text-sm leading-none" style={{ color: item.color }}>{item.value}</p>
              <p className="text-white/25 text-[9px] mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Level ladder */}
      <div
        className="px-4 py-3 flex items-center justify-between gap-1"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.012)" }}
      >
        {LEVELS.map(l => {
          const reached = xp.total >= l.minXP;
          return (
            <div key={l.level} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black transition-all"
                style={reached
                  ? { background: `${l.color}25`, border: `1.5px solid ${l.color}70`, color: l.color, boxShadow: `0 0 8px ${l.color}30` }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.2)" }
                }
              >
                {l.level}
              </div>
              <span
                className="text-[7.5px] font-semibold leading-tight text-center"
                style={{ color: reached ? `${l.color}99` : "rgba(255,255,255,0.18)", maxWidth: 48 }}
              >
                {l.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
