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
  Flame:    <Flame    className="w-5 h-5" />,
  Zap:      <Zap      className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  Compass:  <Compass  className="w-5 h-5" />,
  Waves:    <Waves    className="w-5 h-5" />,
  Mountain: <Mountain className="w-5 h-5" />,
  Shield:   <Shield   className="w-5 h-5" />,
  Wind:     <Wind     className="w-5 h-5" />,
  Trophy:   <Trophy   className="w-5 h-5" />,
  Crown:    <Crown    className="w-6 h-6" />,
  Gauge:    <Gauge    className="w-5 h-5" />,
  Layers:   <Layers   className="w-5 h-5" />,
  Globe:    <Globe    className="w-5 h-5" />,
  Brain:    <Brain    className="w-5 h-5" />,
};

// ─── Trophy card ──────────────────────────────────────────────────────────────

function TrophyCard({ badge, index }: { badge: Achievement; index: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(t);
  }, [index]);

  const isApex   = badge.id === "full-apex";
  const isDomain = badge.tier === "domain";
  const isSpecial = badge.tier === "special";

  return (
    <div
      className="flex flex-col items-center text-center transition-all duration-500 select-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
      }}
      title={badge.description}
    >
      {/* Trophy body */}
      <div
        className="relative flex items-center justify-center rounded-2xl mb-2"
        style={{
          width:  isApex ? 64 : isDomain ? 56 : 48,
          height: isApex ? 64 : isDomain ? 56 : 48,
          background: isApex
            ? `linear-gradient(145deg, ${badge.color}30 0%, ${badge.color}12 100%)`
            : `${badge.color}14`,
          border: `1.5px solid ${badge.color}${isApex ? "55" : isDomain ? "38" : "28"}`,
          boxShadow: isApex
            ? `0 0 24px ${badge.color}40, 0 0 8px ${badge.color}20`
            : isDomain
            ? `0 0 12px ${badge.color}25`
            : `0 0 6px ${badge.color}15`,
        }}
      >
        <span style={{ color: badge.color }}>
          {ICON_MAP[badge.icon] ?? <Trophy className="w-5 h-5" />}
        </span>

        {/* Apex pulse ring */}
        {isApex && (
          <span
            className="absolute inset-0 rounded-2xl animate-ping opacity-20"
            style={{ border: `2px solid ${badge.color}` }}
          />
        )}
      </div>

      {/* Label */}
      <p
        className="leading-tight font-bold whitespace-nowrap"
        style={{
          color:    badge.color,
          fontSize: isApex ? "11px" : isDomain ? "10px" : "9.5px",
        }}
      >
        {badge.name}
      </p>

      {/* Tier label */}
      <p className="text-white/20 mt-0.5" style={{ fontSize: "8px" }}>
        {isApex ? "LEGENDARY" : isSpecial ? "SPECIAL" : isDomain ? "DOMAIN" : "ELITE"}
      </p>
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
    <div className="space-y-4">
      {heading !== false && (
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/30">
          {heading ?? "Achievements"}
        </p>
      )}

      {/* Special + domain trophies — larger, on their own row */}
      {(apex.length > 0 || domains.length > 0) && (
        <div className="flex flex-wrap gap-4">
          {[...apex, ...domains].map((b, i) => (
            <TrophyCard key={b.id} badge={b} index={i} />
          ))}
        </div>
      )}

      {/* Per-axis trophies — smaller grid */}
      {axes.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {axes.map((b, i) => (
            <TrophyCard key={b.id} badge={b} index={(apex.length + domains.length) + i} />
          ))}
        </div>
      )}
    </div>
  );
}
