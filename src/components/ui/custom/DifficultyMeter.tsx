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
      className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 h-5 rounded-full text-[10px] font-bold tracking-tight backdrop-blur-md ${className}`}
      style={{ background: "rgba(10,8,6,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Segmented meter — filled up to the difficulty level, at a glance */}
      <div className="flex items-center gap-[2px] shrink-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="rounded-full"
            style={{
              width: 3,
              height: 6,
              background: i <= cfg.level ? cfg.color : "rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </div>
      <span className="leading-none text-white/85">{cfg.label}</span>
    </div>
  );
}
