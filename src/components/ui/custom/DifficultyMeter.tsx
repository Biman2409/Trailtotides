"use client";

import React from "react";

export const DIFFICULTY_CONFIG: Record<string, { level: number; color: string; glow: string; label: string }> = {
  Easy:     { level: 1, color: "#10b981", glow: "#10b98155", label: "Easy" },
  Moderate: { level: 2, color: "#38bdf8", glow: "#38bdf855", label: "Moderate" },
  Hard:     { level: 3, color: "#a78bfa", glow: "#a78bfa55", label: "Hard" },
  Advanced: { level: 4, color: "#ff5100", glow: "#ff510055", label: "Advanced" },
  Extreme:  { level: 5, color: "#ef4444", glow: "#ef444455", label: "Extreme" },
};

interface DifficultyMeterProps {
  difficulty: string;
  className?: string;
}

export default function DifficultyMeter({ difficulty, className = "" }: DifficultyMeterProps) {
  const cfg = DIFFICULTY_CONFIG[difficulty] ?? { level: 1, color: "#10b981", glow: "#10b98155", label: difficulty };
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 h-5 rounded-full text-[10px] font-bold tracking-tight shadow-sm ${className}`}
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <span className="font-bold leading-none" style={{ color: cfg.color, textShadow: `0 0 8px ${cfg.glow}` }}>
        {cfg.label}
      </span>
      <div className="flex items-center gap-[3px]">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= cfg.level;
          const isLast = i === cfg.level;
          return (
            <div
              key={i}
              style={{
                width: i === cfg.level ? 14 : 5,
                height: 3,
                borderRadius: 99,
                background: filled ? cfg.color : "rgba(255,255,255,0.12)",
                boxShadow: filled && isLast ? `0 0 6px ${cfg.color}, 0 0 12px ${cfg.glow}` : "none",
                transition: "all 0.2s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
