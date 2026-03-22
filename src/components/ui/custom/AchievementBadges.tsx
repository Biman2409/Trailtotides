"use client";

import { useEffect, useState } from "react";
import {
  Flame, Zap, Dumbbell, Compass, Waves, Mountain, Shield, Wind,
  Trophy, Crown, Gauge, Layers, Globe, Brain,
} from "lucide-react";
import { getAchievements, type Achievement } from "@/lib/achievements";
import type { ACE } from "@/lib/ace";

// ─── Icon map — add new icons here if you add new badges ──────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  Flame:    <Flame    className="w-3.5 h-3.5" />,
  Zap:      <Zap      className="w-3.5 h-3.5" />,
  Dumbbell: <Dumbbell className="w-3.5 h-3.5" />,
  Compass:  <Compass  className="w-3.5 h-3.5" />,
  Waves:    <Waves    className="w-3.5 h-3.5" />,
  Mountain: <Mountain className="w-3.5 h-3.5" />,
  Shield:   <Shield   className="w-3.5 h-3.5" />,
  Wind:     <Wind     className="w-3.5 h-3.5" />,
  Trophy:   <Trophy   className="w-3.5 h-3.5" />,
  Crown:    <Crown    className="w-4 h-4" />,
  Gauge:    <Gauge    className="w-3.5 h-3.5" />,
  Layers:   <Layers   className="w-3.5 h-3.5" />,
  Globe:    <Globe    className="w-3.5 h-3.5" />,
  Brain:    <Brain    className="w-3.5 h-3.5" />,
};

// ─── Individual badge chip ─────────────────────────────────────────────────────

function BadgeChip({ badge, index }: { badge: Achievement; index: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const isApex = badge.id === "full-apex";
  const isSpecial = badge.tier === "special";

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        background: isApex
          ? `linear-gradient(135deg, ${badge.color}22 0%, ${badge.color}0e 100%)`
          : `${badge.color}12`,
        border: `1px solid ${badge.color}${isApex ? "45" : "28"}`,
        boxShadow: isApex ? `0 0 14px ${badge.color}30` : undefined,
      }}
      title={badge.description}
    >
      {/* Icon */}
      <span style={{ color: badge.color }}>
        {ICON_MAP[badge.icon] ?? <Trophy className="w-3.5 h-3.5" />}
      </span>

      {/* Name */}
      <span
        className={`text-[10px] font-bold tracking-wide leading-none whitespace-nowrap ${isSpecial ? "text-[11px]" : ""}`}
        style={{ color: badge.color }}
      >
        {badge.name}
      </span>

      {/* Special shimmer dot for Full Apex */}
      {isApex && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: badge.color }}
        />
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  ace: ACE;
  /** Optional heading override. Pass false to hide heading entirely. */
  heading?: string | false;
}

export default function AchievementBadges({ ace, heading }: Props) {
  const achievements = getAchievements(ace);
  if (achievements.length === 0) return null;

  const apex    = achievements.filter((a) => a.tier === "special");
  const domains = achievements.filter((a) => a.tier === "domain");
  const axes    = achievements.filter((a) => a.tier === "axis");

  return (
    <div className="space-y-3">
      {heading !== false && (
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/30">
          {heading ?? "Achievements"}
        </p>
      )}

      {/* Special / domain badges on their own row — prominent */}
      {(apex.length > 0 || domains.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {[...apex, ...domains].map((b, i) => (
            <BadgeChip key={b.id} badge={b} index={i} />
          ))}
        </div>
      )}

      {/* Per-axis badges */}
      {axes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {axes.map((b, i) => (
            <BadgeChip key={b.id} badge={b} index={(apex.length + domains.length) + i} />
          ))}
        </div>
      )}
    </div>
  );
}
