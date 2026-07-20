"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import {
  Trophy, Crown, Globe, Brain,
  Footprints, Waves, ScanEye,
  Timer, Dumbbell, MountainSnow, Wind, Shield,
  Zap, Pickaxe, Wand,
} from "@/lib/localIcons";
import { getAchievements, type Achievement } from "@/lib/achievements";
import type { ACE } from "@/lib/ace";

function Flame9000Icon({ size }: { size: "sm" | "md" }) {
  const cls = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const fs = size === "sm" ? "5px" : "6px";
  return (
    <span className="relative inline-flex items-center justify-center">
      <Zap className={cls} />
      <span style={{ position: "absolute", bottom: -1, right: -3, fontSize: fs, fontWeight: 900, lineHeight: 1, color: "#ff3d00", textShadow: "0 0 4px #ff3d0099", letterSpacing: "-0.04em" }}>9K</span>
    </span>
  );
}

const ICON_SM: Record<string, React.ReactNode> = {
  Flame9000:    <Flame9000Icon size="sm" />,
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
  Flame9000:    <Flame9000Icon size="md" />,
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
      <div className="rounded-xl px-3.5 py-3 text-left" style={{ background: "var(--bg-surface-2)", border: `1px solid ${badge.color}40`, boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px var(--border-subtle)" }}>
        <p className="font-bold text-[11px] leading-tight mb-1.5" style={{ color: badge.color }}>{badge.name}</p>
        <p className="text-[10px] leading-snug" style={{ color: "var(--text-secondary)" }}>{badge.description}</p>
      </div>
      <div className="absolute w-2.5 h-2.5" style={{ bottom: -5, left: pos.arrowLeft, transform: "translateX(-50%) rotate(45deg)", background: "var(--bg-surface-2)", borderRight: `1px solid ${badge.color}40`, borderBottom: `1px solid ${badge.color}40` }} />
    </div>,
    document.body
  );
}

// ─── Trophy card ──────────────────────────────────────────────────────────────

function TrophyCard({ badge, index, small = false }: { badge: Achievement; index: number; small?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pinned,  setPinned]  = useState(false);
  const tooltip     = hovered || pinned;
  const closeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(t);
  }, [index]);

  const isSpecial = badge.tier === "tier1";
  const sz = small ? 40 : 52;
  const borderRadius = "10px";

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col items-center text-center transition-all duration-500 select-none cursor-pointer"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)" }}
      onMouseEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); setHovered(true); }}
      onMouseLeave={() => { closeTimer.current = setTimeout(() => setHovered(false), 120); }}
      onClick={() => setPinned(v => !v)}
    >
      <Tooltip badge={badge} visible={tooltip} anchorRef={cardRef} />
      <div
        className="relative flex items-center justify-center mb-1.5 transition-transform duration-150 hover:scale-105 overflow-hidden"
        style={{
          width: sz,
          height: sz,
          borderRadius,
          background: `${badge.color}10`,
          border: `1.5px solid ${badge.color}${isSpecial ? "55" : "30"}`,
          boxShadow: isSpecial ? `0 0 10px ${badge.color}20` : "none",
        }}
      >
        <span style={{ color: badge.color, display: "flex" }}>
          {small ? (ICON_SM[badge.icon] ?? <Trophy className="w-4 h-4" />) : (ICON_MD[badge.icon] ?? <Trophy className="w-5 h-5" />)}
        </span>
      </div>
      <p className="leading-tight font-bold w-full text-center" style={{ color: badge.color, fontSize: small ? "8px" : "10px", wordBreak: "break-word", lineHeight: 1.2 }}>
        {badge.name}
      </p>
    </div>
  );
}

// ─── Compact row (single-column list variant) ──────────────────────────────────

function TrophyRow({ badge, index }: { badge: Achievement; index: number }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pinned,  setPinned]  = useState(false);
  const tooltip     = hovered || pinned;
  const closeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 40);
    return () => clearTimeout(t);
  }, [index]);

  const isSpecial = badge.tier === "tier1";

  return (
    <div
      ref={rowRef}
      className="relative inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all duration-300 select-none cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(4px)",
        background: `${badge.color}0a`,
        border: `1px solid ${badge.color}${isSpecial ? "40" : "25"}`,
      }}
      onMouseEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); setHovered(true); }}
      onMouseLeave={() => { closeTimer.current = setTimeout(() => setHovered(false), 120); }}
      onClick={() => setPinned(v => !v)}
    >
      <Tooltip badge={badge} visible={tooltip} anchorRef={rowRef} />
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: `${badge.color}12`,
          border: `1.5px solid ${badge.color}${isSpecial ? "55" : "30"}`,
          boxShadow: isSpecial ? `0 0 8px ${badge.color}20` : "none",
        }}
      >
        <span style={{ color: badge.color, display: "flex" }}>
          {ICON_SM[badge.icon] ?? <Trophy className="w-3.5 h-3.5" />}
        </span>
      </div>
      <p className="text-[10.5px] font-semibold leading-tight whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
        {badge.name}
      </p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  ace: ACE;
  heading?: string | false;
  /** "grid" (default) = tiered card grid. "list" = compact single-column, height-capped, expandable. */
  variant?: "grid" | "list";
  /** Collapsed height (px) for the "list" variant — matches it to an adjacent element (e.g. the radar chart). */
  maxListHeight?: number;
}

export default function AchievementBadges({ ace, heading, variant = "grid", maxListHeight = 216 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const achievements = getAchievements(ace);

  useEffect(() => {
    if (variant !== "list") return;
    const el = contentRef.current;
    if (!el) return;
    setOverflowing(el.scrollHeight > maxListHeight + 1);
  }, [variant, maxListHeight, achievements.length]);

  if (achievements.length === 0) return null;

  const special = achievements.filter(a => a.tier === "tier1");
  const domain  = achievements.filter(a => a.tier === "tier2");
  const axis    = achievements.filter(a => a.tier === "tier3");

  if (variant === "list") {
    const ordered = [...special, ...domain, ...axis];
    return (
      <div style={{ minWidth: 0 }}>
        {heading !== false && (
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold mb-3" style={{ color: "var(--text-tertiary)" }}>
            {heading ?? "Achievements"}
          </p>
        )}
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{
              border: "1px solid var(--border-subtle)",
              maxHeight: expanded ? contentRef.current?.scrollHeight ?? 2000 : maxListHeight,
            }}
          >
            <div ref={contentRef} className="flex flex-wrap gap-2 p-2">
              {ordered.map((b, i) => <TrophyRow key={b.id} badge={b} index={i} />)}
            </div>
          </div>
          {!expanded && overflowing && (
            <div
              className="absolute bottom-0 left-0 right-0 h-10 rounded-b-2xl pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent, var(--bg-surface))" }}
            />
          )}
        </div>
        {overflowing && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-2 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wide transition-colors"
            style={{ color: "var(--text-tertiary)" }}
          >
            {expanded ? "Show less" : `Show all ${ordered.length}`}
            <ChevronRight className="w-3 h-3 transition-transform duration-200" style={{ transform: expanded ? "rotate(90deg)" : "none" }} />
          </button>
        )}
      </div>
    );
  }

  const hasHighTier = special.length > 0 || domain.length > 0;

  // If Tier 1 or Tier 2 earned: show those in primary row, axis in dropdown
  // If only Tier 3 earned: show axis badges in primary row
  const primary   = hasHighTier ? [...special, ...domain] : axis;
  const secondary = hasHighTier ? axis : [];
  const hasMore   = secondary.length > 0;

  return (
    <div className="space-y-3" style={{ minWidth: 0 }}>
      {/* Heading + expand toggle */}
      <div className="flex items-center justify-between gap-2">
        {heading !== false && (
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: "var(--text-tertiary)" }}>
            {heading ?? "Achievements"}
          </p>
        )}
        {hasMore && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-[9px] font-semibold transition-colors whitespace-nowrap"
            style={{ color: "var(--text-tertiary)" }}
          >
            {expanded ? "Show less" : `+${secondary.length} more`}
          </button>
        )}
      </div>

      {/* Primary row */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(primary.length, 4)}, 1fr)` }}>
        {primary.map((b, i) => (
          <TrophyCard key={b.id} badge={b} index={i} small={b.tier === "tier3"} />
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
