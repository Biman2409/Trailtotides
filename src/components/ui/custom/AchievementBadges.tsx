"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Trophy, Crown, Globe, Brain,
  Footprints, Waves, ScanEye,
  Timer, Dumbbell, MountainSnow, Wind, Shield,
  Zap, Pickaxe, Wand,
} from "@/lib/localIcons";
import { getAchievements, type Achievement } from "@/lib/achievements";
import type { ACE } from "@/lib/ace";

const ICON_SM: Record<string, React.ReactNode> = {
  Trophy:       <Trophy       className="w-4 h-4" />,
  Crown:        <Crown        className="w-4 h-4" />,
  Globe:        <Globe        className="w-4 h-4" />,
  Brain:        <Brain        className="w-4 h-4" />,
  Footprints:   <Footprints   className="w-4 h-4" />,
  Waves:        <Waves        className="w-4 h-4" />,
  ScanEye:      <ScanEye      className="w-4 h-4" />,
  Timer:        <Timer        className="w-4 h-4" />,
  Dumbbell:     <Dumbbell     className="w-4 h-4" />,
  MountainSnow: <MountainSnow className="w-4 h-4" />,
  Wind:         <Wind         className="w-4 h-4" />,
  Shield:       <Shield       className="w-4 h-4" />,
  Zap:          <Zap          className="w-4 h-4" />,
  Pickaxe:      <Pickaxe      className="w-4 h-4" />,
  Wand:         <Wand         className="w-4 h-4" />,
};

const ICON_MD: Record<string, React.ReactNode> = {
  Trophy:       <Trophy       className="w-5 h-5" />,
  Crown:        <Crown        className="w-6 h-6" />,
  Globe:        <Globe        className="w-5 h-5" />,
  Brain:        <Brain        className="w-5 h-5" />,
  Footprints:   <Footprints   className="w-5 h-5" />,
  Waves:        <Waves        className="w-5 h-5" />,
  ScanEye:      <ScanEye      className="w-5 h-5" />,
  Timer:        <Timer        className="w-5 h-5" />,
  Dumbbell:     <Dumbbell     className="w-5 h-5" />,
  MountainSnow: <MountainSnow className="w-5 h-5" />,
  Wind:         <Wind         className="w-5 h-5" />,
  Shield:       <Shield       className="w-5 h-5" />,
  Zap:          <Zap          className="w-5 h-5" />,
  Pickaxe:      <Pickaxe      className="w-5 h-5" />,
  Wand:         <Wand         className="w-5 h-5" />,
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────

const TOOLTIP_W = 176;
const EDGE_PAD  = 10;

function Tooltip({ badge, visible, anchorRef }: {
  badge: Achievement;
  visible: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<{ left: number; bottom: number; arrowLeft: number } | null>(null);

  useEffect(() => {
    if (!visible || !anchorRef.current) { setPos(null); return; }
    const rect = anchorRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const vw = window.innerWidth;
    let left = cx - TOOLTIP_W / 2;
    let arrowLeft = TOOLTIP_W / 2;
    if (left < EDGE_PAD) { arrowLeft -= EDGE_PAD - left; left = EDGE_PAD; }
    else if (left + TOOLTIP_W > vw - EDGE_PAD) { const s = (left + TOOLTIP_W) - (vw - EDGE_PAD); arrowLeft += s; left -= s; }
    setPos({ left, bottom: window.innerHeight - rect.top + 8, arrowLeft: Math.max(12, Math.min(TOOLTIP_W - 12, arrowLeft)) });
  }, [visible, anchorRef]);

  if (!pos) return null;

  return createPortal(
    <div
      className="pointer-events-none transition-all duration-200"
      style={{ position: "fixed", bottom: pos.bottom + (visible ? 0 : -4), left: pos.left, width: TOOLTIP_W, opacity: visible ? 1 : 0, zIndex: 9999 }}
    >
      <div className="rounded-xl px-3.5 py-3 text-left" style={{ background: "rgba(14,14,18,0.98)", border: `1px solid ${badge.color}40`, boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)" }}>
        <p className="font-bold text-[11px] leading-tight mb-1.5" style={{ color: badge.color }}>{badge.name}</p>
        <p className="text-white/55 text-[10px] leading-snug">{badge.description}</p>
      </div>
      <div className="absolute w-2.5 h-2.5" style={{ bottom: -5, left: pos.arrowLeft, transform: "translateX(-50%) rotate(45deg)", background: "rgba(14,14,18,0.98)", borderRight: `1px solid ${badge.color}40`, borderBottom: `1px solid ${badge.color}40` }} />
    </div>,
    document.body
  );
}

// ─── Trophy card ──────────────────────────────────────────────────────────────

function TrophyCard({ badge, index, small = false }: { badge: Achievement; index: number; small?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(t);
  }, [index]);

  const isSpecial = badge.tier === "special";
  const sz = small ? 40 : 52;
  const borderRadius = "10px";

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col items-center text-center transition-all duration-500 select-none cursor-pointer"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)" }}
      onMouseEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); setTooltip(true); }}
      onMouseLeave={() => { closeTimer.current = setTimeout(() => setTooltip(false), 120); }}
      onClick={() => setTooltip(v => !v)}
    >
      <Tooltip badge={badge} visible={tooltip} anchorRef={cardRef} />
      <div
        className="relative flex items-center justify-center mb-1.5 transition-transform duration-150 hover:scale-110 overflow-hidden"
        style={{
          width: sz,
          height: sz,
          borderRadius,
          background: isSpecial
            ? `linear-gradient(145deg, ${badge.color}32 0%, ${badge.color}14 100%)`
            : `${badge.color}16`,
          border: `1.5px solid ${badge.color}${isSpecial ? "60" : "32"}`,
          boxShadow: isSpecial
            ? `0 0 20px ${badge.color}50, 0 0 8px ${badge.color}28`
            : `0 0 8px ${badge.color}20`,
        }}
      >
        <span style={{ color: badge.color, display: "flex" }}>
          {small ? (ICON_SM[badge.icon] ?? <Trophy className="w-4 h-4" />) : (ICON_MD[badge.icon] ?? <Trophy className="w-5 h-5" />)}
        </span>
        {/* Sweeping shine — Tier 1 only */}
        {isSpecial && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.18) 50%, transparent 75%)",
              backgroundSize: "200% 100%",
              animation: "trophy-shine 3.5s ease-in-out infinite",
            }}
          />
        )}
        {/* Pulse ring — Tier 1 only */}
        {isSpecial && (
          <span className="absolute inset-0 animate-ping opacity-12" style={{ borderRadius, border: `2px solid ${badge.color}` }} />
        )}
      </div>
      <p className="leading-tight font-bold w-full text-center" style={{ color: badge.color, fontSize: small ? "8px" : "10px", wordBreak: "break-word", lineHeight: 1.2 }}>
        {badge.name}
      </p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  ace: ACE;
  heading?: string | false;
}

export default function AchievementBadges({ ace, heading }: Props) {
  const [expanded, setExpanded] = useState(false);

  const achievements = getAchievements(ace);
  if (achievements.length === 0) return null;

  const special = achievements.filter(a => a.tier === "special");
  const domain  = achievements.filter(a => a.tier === "domain");
  const axis    = achievements.filter(a => a.tier === "axis");

  const hasHighTier = special.length > 0 || domain.length > 0;

  // If Tier 1 or Tier 2 earned: show those in primary row, axis in dropdown
  // If only Tier 3 earned: show axis badges in primary row
  const primary   = hasHighTier ? [...special, ...domain] : axis;
  const secondary = hasHighTier ? axis : [];
  const hasMore   = secondary.length > 0;

  return (
    <div className="space-y-3" style={{ minWidth: 0 }}>
      <style>{`@keyframes trophy-shine{0%{background-position:200% center}60%{background-position:-200% center}100%{background-position:-200% center}}`}</style>
      {/* Heading + expand toggle */}
      <div className="flex items-center justify-between gap-2">
        {heading !== false && (
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/30">
            {heading ?? "Achievements"}
          </p>
        )}
        {hasMore && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-[9px] font-semibold transition-colors whitespace-nowrap"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {expanded ? "Show less" : `+${secondary.length} more`}
          </button>
        )}
      </div>

      {/* Primary row */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(primary.length, 4)}, 1fr)` }}>
        {primary.map((b, i) => (
          <TrophyCard key={b.id} badge={b} index={i} small={b.tier === "axis"} />
        ))}
      </div>

      {/* Secondary (axis) row — in dropdown */}
      {expanded && secondary.length > 0 && (
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {secondary.map((b, i) => (
            <TrophyCard key={b.id} badge={b} index={primary.length + i} small />
          ))}
        </div>
      )}
    </div>
  );
}
