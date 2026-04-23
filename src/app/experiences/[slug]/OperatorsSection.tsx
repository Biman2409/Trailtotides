"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import OperatorCard, { type OperatorCardData } from "./OperatorCard";

export default function OperatorsSection({ operators }: { operators: OperatorCardData[] }) {
  const [compareMode, setCompareMode] = useState(false);

  if (operators.length === 0) {
    return (
      <p className="text-white/25 text-xs text-center py-6">No operators listed yet for this adventure.</p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-white/35 text-[11px]">{operators.length} operator{operators.length !== 1 ? "s" : ""} available</p>
        {operators.length > 1 && (
          <button
            onClick={() => setCompareMode(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
            style={compareMode
              ? { background: "rgba(255,81,0,0.15)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.3)" }
              : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            <SlidersHorizontal className="w-3 h-3" />
            {compareMode ? "Exit Compare" : "Compare"}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className={`grid gap-3 ${compareMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        {operators.map((op) => (
          <OperatorCard key={op.name} op={op} compareMode={compareMode} />
        ))}
      </div>
    </div>
  );
}
