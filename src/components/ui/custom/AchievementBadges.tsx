"use client";

import { useEffect, useRef, useState } from "react";
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

// ─── Tooltip ──────────────────────────────────────────────────────────────────

const TOOLTIP_W = 180;
const EDGE_PAD  = 8; // min px from screen edge

function Tooltip({ badge, visible, anchorRef }: { badge: Achievement; visible: boolean; anchorRef: React.RefObject<HTMLDivElement | null> }) {
  const tierLabel =
    badge.id === "full-apex" ? "Legendary" :
    badge.tier === "special" ? "Special" :
    badge.tier === "domain"  ? "Domain Mastery" : "Elite Axis";

  // Compute horizontal offset so tooltip stays within viewport
  let shiftX = 0;
  let arrowX = "50%";
  if (visible && anchorRef.current) {
    const rect = anchorRef.current.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    // Default: tooltip centered on card
    let tipLeft = cardCenterX - TOOLTIP_W / 2;
    const tipRight = tipLeft + TOOLTIP_W;
    const vw = window.innerWidth;

    if (tipLeft < EDGE_PAD) {
      const overflow = EDGE_PAD - tipLeft;
      shiftX = overflow;
      // move arrow back so it still points at card center
      arrowX = `${Math.max(12, TOOLTIP_W / 2 - overflow)}px`;
    } else if (tipRight > vw - EDGE_PAD) {
      const overflow = tipRight - (vw - EDGE_PAD);
      shiftX = -overflow;
      arrowX = `${Math.min(TOOLTIP_W - 12, TOOLTIP_W / 2 + overflow)}px`;
    }
  }

  return (
    <div
      className="absolute bottom-full mb-2.5 z-50 pointer-events-none transition-all duration-200"
      style={{
        left: "50%",
        transform: `translateX(calc(-50% + ${shiftX}px)) translateY(${visible ? 0 : 4}px)`,
        opacity: visible ? 1 : 0,
        width: TOOLTIP_W,
      }}
    >
      <div
        className="rounded-xl px-3.5 py-3 text-left"
        style={{
          background: "rgba(14,14,18,0.97)",
          border: `1px solid ${badge.color}35`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        <p className="font-bold text-[11px] leading-tight mb-1" style={{ color: badge.color }}>
          {badge.name}
        </p>
        <p className="text-white/50 text-[10px] leading-snug mb-2">
          {badge.description}
        </p>
        <span
          className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
          style={{ background: `${badge.color}18`, color: `${badge.color}cc` }}
        >
          {tierLabel}
        </span>
      </div>
      {/* Arrow — tracks card center */}
      <div
        className="absolute -bottom-[5px] w-2.5 h-2.5"
        style={{
          left: arrowX,
          transform: "translateX(-50%) rotate(45deg)",
          background: "rgba(14,14,18,0.97)",
          borderRight: `1px solid ${badge.color}35`,
          borderBottom: `1px solid ${badge.color}35`,
        }}
      />
    </div>
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
