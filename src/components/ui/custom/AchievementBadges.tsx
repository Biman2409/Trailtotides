"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Flame, Zap, Dumbbell, Compass, Waves, Mountain, Shield, Wind,
  Trophy, Crown, Gauge, Layers, Globe, Brain,
} from "lucide-react";
import { getAchievements, type Achievement } from "@/lib/achievements";
import type { ACE } from "@/lib/ace";

// ─── Icon map — two sizes: "sm" for axis badges, "md" for domain/special ──────
const ICON_MAP_SM: Record<string, React.ReactNode> = {
  Flame:    <Flame    className="w-4 h-4" />,
  Zap:      <Zap      className="w-4 h-4" />,
  Dumbbell: <Dumbbell className="w-4 h-4" />,
  Compass:  <Compass  className="w-4 h-4" />,
  Waves:    <Waves    className="w-4 h-4" />,
  Mountain: <Mountain className="w-4 h-4" />,
  Shield:   <Shield   className="w-4 h-4" />,
  Wind:     <Wind     className="w-4 h-4" />,
  Trophy:   <Trophy   className="w-4 h-4" />,
  Crown:    <Crown    className="w-4 h-4" />,
  Gauge:    <Gauge    className="w-4 h-4" />,
  Layers:   <Layers   className="w-4 h-4" />,
  Globe:    <Globe    className="w-4 h-4" />,
  Brain:    <Brain    className="w-4 h-4" />,
};

const ICON_MAP_MD: Record<string, React.ReactNode> = {
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

// ─── Tooltip — rendered via portal so it's never clipped ─────────────────────

const TOOLTIP_W = 176;
const EDGE_PAD  = 10;

function Tooltip({ badge, visible, anchorRef }: {
  badge: Achievement;
  visible: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<{ left: number; top: number; arrowLeft: number } | null>(null);

  useEffect(() => {
    if (!visible || !anchorRef.current) { setPos(null); return; }
    const rect = anchorRef.current.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const vw = window.innerWidth;

    let left = cardCenterX - TOOLTIP_W / 2;
    let arrowLeft = TOOLTIP_W / 2;

    if (left < EDGE_PAD) {
      arrowLeft = arrowLeft - (EDGE_PAD - left);
      left = EDGE_PAD;
    } else if (left + TOOLTIP_W > vw - EDGE_PAD) {
      const shift = (left + TOOLTIP_W) - (vw - EDGE_PAD);
      arrowLeft = arrowLeft + shift;
      left = left - shift;
    }

    // Place above the card, account for scroll
    const top = rect.top + window.scrollY - 8;
    setPos({ left, top, arrowLeft: Math.max(12, Math.min(TOOLTIP_W - 12, arrowLeft)) });
  }, [visible, anchorRef]);

  if (!pos) return null;

  return createPortal(
    <div
      className="pointer-events-none transition-all duration-200"
      style={{
        position:  "absolute",
        top:       pos.top,
        left:      pos.left,
        width:     TOOLTIP_W,
        transform: `translateY(${visible ? -100 : "calc(-100% + 6px)"})`,
        opacity:   visible ? 1 : 0,
        zIndex:    9999,
      }}
    >
      <div
        className="rounded-xl px-3.5 py-3 text-left"
        style={{
          background: "rgba(14,14,18,0.98)",
          border:     `1px solid ${badge.color}40`,
          boxShadow:  `0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        <p className="font-bold text-[11px] leading-tight mb-1.5" style={{ color: badge.color }}>
          {badge.name}
        </p>
        <p className="text-white/55 text-[10px] leading-snug">
          {badge.description}
        </p>
      </div>
      {/* Arrow */}
      <div
        className="absolute w-2.5 h-2.5"
        style={{
          bottom:     -5,
          left:       pos.arrowLeft,
          transform:  "translateX(-50%) rotate(45deg)",
          background: "rgba(14,14,18,0.98)",
          borderRight:`1px solid ${badge.color}40`,
          borderBottom:`1px solid ${badge.color}40`,
        }}
      />
    </div>,
    document.body
  );
}

// ─── Trophy card ──────────────────────────────────────────────────────────────

function TrophyCard({ badge, index, small = false }: { badge: Achievement; index: number; small?: boolean }) {
  const [visible, setVisible]   = useState(false);
  const [tooltip, setTooltip]   = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(t);
  }, [index]);

  // Close tooltip after a delay (allows moving into tooltip on desktop)
  const startClose = () => {
    closeTimer.current = setTimeout(() => setTooltip(false), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const isApex    = badge.id === "full-apex";
  const isDomain  = badge.tier === "domain";
  const isSpecial = badge.tier === "special";

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col items-center text-center transition-all duration-500 select-none cursor-pointer"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
      }}
      onMouseEnter={() => { cancelClose(); setTooltip(true); }}
      onMouseLeave={startClose}
      onClick={() => setTooltip((v) => !v)}
    >
      <Tooltip badge={badge} visible={tooltip} anchorRef={cardRef} />

      {/* Trophy body */}
      <div
        className="relative flex items-center justify-center rounded-xl mb-1.5 transition-transform duration-150 hover:scale-110"
        style={{
          width:  small ? 40 : isApex ? 64 : isDomain ? 56 : 48,
          height: small ? 40 : isApex ? 64 : isDomain ? 56 : 48,
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
          {small
            ? (ICON_MAP_SM[badge.icon] ?? <Trophy className="w-4 h-4" />)
            : (ICON_MAP_MD[badge.icon] ?? <Trophy className="w-5 h-5" />)
          }
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
        className="leading-tight font-bold w-full text-center"
        style={{
          color:    badge.color,
          fontSize: small ? "8px" : isApex ? "11px" : isDomain ? "10px" : "9.5px",
          wordBreak: "break-word",
          whiteSpace: small ? "normal" : "nowrap",
          lineHeight: 1.2,
        }}
      >
        {badge.name}
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

      {/* Per-axis trophies — 6-col grid so all fit on one line */}
      {axes.length > 0 && (
        <div className="grid grid-cols-6 gap-1.5">
          {axes.map((b, i) => (
            <TrophyCard key={b.id} badge={b} index={(apex.length + domains.length) + i} small />
          ))}
        </div>
      )}
    </div>
  );
}
