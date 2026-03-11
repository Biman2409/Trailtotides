"use client";

import { useState } from "react";
import type { ERT } from "@/lib/data";
import {
  EXERTION_LABELS,
  RISK_LABELS,
  TECHNICALITY_LABELS,
  EXERTION_DESCRIPTIONS,
  RISK_DESCRIPTIONS,
  TECHNICALITY_DESCRIPTIONS,
} from "@/lib/ert";

interface Props {
  ert: ERT;
  size?: "sm" | "md";
}

const segmentColor = (val: number) => {
  if (val <= 1) return { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.4)", text: "#86efac" };
  if (val === 2) return { bg: "rgba(132,204,22,0.15)", border: "rgba(132,204,22,0.4)", text: "#bef264" };
  if (val === 3) return { bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.4)", text: "#fde047" };
  if (val === 4) return { bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.4)", text: "#fdba74" };
  return { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", text: "#fca5a5" };
};

type TooltipKey = "e" | "r" | "t" | null;

export default function ERTBadge({ ert, size = "md" }: Props) {
  const [tooltip, setTooltip] = useState<TooltipKey>(null);

  const isSmall = size === "sm";
  const textSize = isSmall ? "text-[9px]" : "text-[10px]";
  const padding = isSmall ? "px-2 py-0.5" : "px-2.5 py-1";

  const segments: { key: TooltipKey; label: string; val: number; title: string; desc: string }[] = [
    {
      key: "e",
      label: `E${ert.e}`,
      val: ert.e,
      title: `Exertion · ${EXERTION_LABELS[ert.e]}`,
      desc: EXERTION_DESCRIPTIONS[ert.e],
    },
    {
      key: "r",
      label: `R${ert.r}`,
      val: ert.r,
      title: `Risk · ${RISK_LABELS[ert.r]}`,
      desc: RISK_DESCRIPTIONS[ert.r],
    },
    {
      key: "t",
      label: `T${ert.t}`,
      val: ert.t,
      title: `Technicality · ${TECHNICALITY_LABELS[ert.t]}`,
      desc: TECHNICALITY_DESCRIPTIONS[ert.t],
    },
  ];

  return (
    <div className="relative inline-flex items-center gap-0.5">
      {segments.map((seg, i) => {
        const col = segmentColor(seg.val);
        const isActive = tooltip === seg.key;
        return (
          <div key={seg.key} className="relative">
            <button
              onMouseEnter={() => setTooltip(seg.key)}
              onFocus={() => setTooltip(seg.key)}
              onMouseLeave={() => setTooltip(null)}
              onBlur={() => setTooltip(null)}
              className={`${textSize} ${padding} font-bold tracking-tight leading-none transition-all ${
                i === 0 ? "rounded-l-full" : i === 2 ? "rounded-r-full" : ""
              }`}
              style={{
                background: col.bg,
                border: `1px solid ${isActive ? col.text : col.border}`,
                color: col.text,
                outline: "none",
              }}
            >
              {seg.label}
            </button>

            {/* Tooltip */}
            {isActive && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                style={{ minWidth: 180 }}
              >
                <div
                  className="rounded-lg p-2.5 text-left shadow-xl"
                  style={{
                    background: "rgba(15,20,30,0.97)",
                    border: `1px solid ${col.border}`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <p className="text-[10px] font-bold mb-1" style={{ color: col.text }}>
                    {seg.title}
                  </p>
                  <p className="text-[10px] text-white/60 leading-snug">{seg.desc}</p>
                </div>
                {/* Arrow */}
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: `5px solid ${col.border}`,
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
