"use client";

import { useState } from "react";
import type { ACE, AceAxis } from "@/lib/ace";
import { ACE_AXES, ACE_AXIS_COLORS, ACE_AXIS_LABELS, ACE_SCALE_LABELS } from "@/lib/ace";

interface Props {
  ace: ACE;
  size?: "sm" | "md";
  dark?: boolean;
  /** If true, show all 8 axes. If false (default), show only axes with value > 0 */
  showAll?: boolean;
}

const levelColor = (val: number, dark: boolean) => {
  if (val === 0) return dark
    ? { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.2)" }
    : { bg: "rgba(0,0,0,0.04)",      border: "rgba(0,0,0,0.06)",      text: "rgba(0,0,0,0.2)" };
  if (dark) {
    if (val === 1) return { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",  text: "#86efac" };
    if (val === 2) return { bg: "rgba(132,204,22,0.12)", border: "rgba(132,204,22,0.3)", text: "#bef264" };
    if (val === 3) return { bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.3)",  text: "#fde047" };
    if (val === 4) return { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)", text: "#fdba74" };
    return               { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  text: "#fca5a5" };
  }
  if (val === 1) return { bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)",  text: "#16a34a" };
  if (val === 2) return { bg: "rgba(101,163,13,0.1)", border: "rgba(101,163,13,0.3)", text: "#65a30d" };
  if (val === 3) return { bg: "rgba(202,138,4,0.1)",  border: "rgba(202,138,4,0.3)",  text: "#b45309" };
  if (val === 4) return { bg: "rgba(234,88,12,0.1)",  border: "rgba(234,88,12,0.3)",  text: "#c2410c" };
  return               { bg: "rgba(220,38,38,0.1)",  border: "rgba(220,38,38,0.3)",  text: "#b91c1c" };
};

export default function ACEBadge({ ace, size = "md", dark = false, showAll = false }: Props) {
  const [tooltip, setTooltip] = useState<AceAxis | null>(null);

  const isSmall = size === "sm";
  const textSize = isSmall ? "text-[9px]" : "text-[10px]";
  const padding = isSmall ? "px-1.5 py-0.5" : "px-2 py-1";

  const axes = showAll
    ? ACE_AXES
    : (ACE_AXES.filter((k) => ace[k] > 0) as AceAxis[]);

  if (axes.length === 0) return null;

  return (
    <div className="relative inline-flex flex-wrap items-center gap-0.5">
      {axes.map((key) => {
        const val = ace[key];
        const col = levelColor(val, dark);
        const axisColor = ACE_AXIS_COLORS[key];
        const isActive = tooltip === key;

        return (
          <div key={key} className="relative">
            <button
              onMouseEnter={() => setTooltip(key)}
              onFocus={() => setTooltip(key)}
              onMouseLeave={() => setTooltip(null)}
              onBlur={() => setTooltip(null)}
              className={`${textSize} ${padding} font-bold tracking-tight leading-none transition-all rounded-md`}
              style={{
                background: col.bg,
                border: `1px solid ${isActive ? col.text : col.border}`,
                color: isActive ? axisColor : col.text,
                outline: "none",
              }}
            >
              {ACE_AXIS_LABELS[key].slice(0, 3).toUpperCase()}{val > 0 ? ` ${val}` : ""}
            </button>

            {isActive && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                style={{ minWidth: 170 }}
              >
                <div
                  className="rounded-lg p-2.5 text-left shadow-xl"
                  style={{
                    background: "rgba(12,16,28,0.97)",
                    border: `1px solid ${axisColor}40`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: axisColor }} />
                    <p className="text-[10px] font-bold" style={{ color: axisColor }}>
                      {ACE_AXIS_LABELS[key]}
                    </p>
                    <p className="text-[10px] font-bold ml-auto" style={{ color: axisColor }}>
                      {val}/5
                    </p>
                  </div>
                  <p className="text-[10px] text-white/55 leading-snug">
                    {ACE_SCALE_LABELS[val]} demand
                  </p>
                </div>
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: `4px solid ${axisColor}40`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
