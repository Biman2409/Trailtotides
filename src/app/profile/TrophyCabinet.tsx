"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Lock } from "lucide-react";
import {
  Trophy, Crown, Globe, Brain,
  Footprints, Waves, ScanEye,
  Timer, Dumbbell, MountainSnow, Wind, Shield,
  Zap, Pickaxe, Wand,
  CheckCircle2, Star, Heart, Map, Compass, TrendingUp, Award,
} from "@/lib/localIcons";
import {
  getAchievements, AXIS_BADGES, DOMAIN_BADGES, SPECIAL_BADGES, XP_BADGES, TYPE_BADGES,
} from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import { loadProfile } from "@/lib/matchmaker";
import { adventures as advData } from "@/lib/data";

const ICON = (name: string, size: number): React.ReactNode => {
  const s = { width: size, height: size } as React.CSSProperties;
  if (name === "Flame9000") {
    const fs = Math.round(size * 0.28);
    return (
      <span style={{ position: "relative", display: "inline-flex", ...s }}>
        <Zap style={s} />
        <span style={{ position: "absolute", bottom: 0, right: -2, fontSize: fs, fontWeight: 900, lineHeight: 1, color: "#ff3d00", textShadow: "0 0 6px #ff3d0088", letterSpacing: "-0.04em" }}>9K</span>
      </span>
    );
  }
  const map: Record<string, React.ReactNode> = {
    Crown:          <Crown          style={s} />,
    Trophy:         <Trophy         style={s} />,
    Globe:          <Globe          style={s} />,
    Brain:          <Brain          style={s} />,
    Footprints:     <Footprints     style={s} />,
    Waves:          <Waves          style={s} />,
    ScanEye:        <ScanEye        style={s} />,
    Timer:          <Timer          style={s} />,
    Dumbbell:       <Dumbbell       style={s} />,
    MountainSnow:   <MountainSnow   style={s} />,
    Wind:           <Wind           style={s} />,
    Shield:         <Shield         style={s} />,
    Zap:            <Zap            style={s} />,
    Pickaxe:        <Pickaxe        style={s} />,
    Wand:           <Wand           style={s} />,
    CheckCircle2:   <CheckCircle2   style={s} />,
    Star:           <Star           style={s} />,
    Heart:          <Heart          style={s} />,
    Map:            <Map            style={s} />,
    Compass:        <Compass        style={s} />,
    TrendingUp:     <TrendingUp     style={s} />,
    Award:          <Award          style={s} />,
  };
  return map[name] ?? <Trophy style={s} />;
};

const TIER1_ALL: Achievement[] = SPECIAL_BADGES.map(b => ({ ...b }));
const TIER2_ALL: Achievement[] = DOMAIN_BADGES.map(b => ({ ...b }));
const TIER3_ALL: Achievement[] = Object.values(AXIS_BADGES).map(b => ({ ...b, tier: "axis" as const }));
const TIERXP_ALL: Achievement[]   = XP_BADGES.map(b => ({ ...b }));
const TIERTYPE_ALL: Achievement[] = TYPE_BADGES.map(b => ({ ...b }));

// ─── Popover ──────────────────────────────────────────────────────────────────
function Popover({ badge, anchorRect, onClose, locked }: {
  badge: Achievement;
  anchorRect: DOMRect;
  onClose: () => void;
  locked?: boolean;
}) {
  const isSpecial = badge.tier === "special";
  const POPOVER_W = 280;
  const GAP = 10;

  const anchorCenterX = anchorRect.left + anchorRect.width / 2;
  const rawLeft = anchorCenterX - POPOVER_W / 2;
  const left = Math.max(8, Math.min(rawLeft, window.innerWidth - POPOVER_W - 8));
  const top = anchorRect.top - GAP;
  const arrowLeft = anchorCenterX - left - 6;

  const borderColor = locked ? "rgba(255,255,255,0.12)" : `${badge.color}35`;
  const iconBg      = locked ? "rgba(255,255,255,0.06)" : (isSpecial ? `linear-gradient(145deg,${badge.color}30,${badge.color}12)` : `${badge.color}14`);
  const iconBorder  = locked ? "rgba(255,255,255,0.12)" : `${badge.color}55`;
  const iconColor   = locked ? "rgba(255,255,255,0.25)" : badge.color;

  return createPortal(
    <div className="fixed z-[9999]" style={{ left, top, transform: "translateY(-100%)", width: POPOVER_W }}>
      <div className="rounded-xl p-3.5 shadow-2xl" style={{
        background: "#0f1923",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px ${locked ? "rgba(255,255,255,0.05)" : `${badge.color}15`}`,
      }}>
        <div className="flex items-start gap-3">
          <div className="relative shrink-0 flex items-center justify-center overflow-hidden rounded-xl"
            style={{ width: 40, height: 40, background: iconBg, border: `1.5px solid ${iconBorder}`, color: iconColor }}>
            {locked ? <Lock style={{ width: 18, height: 18 }} /> : ICON(badge.icon, 20)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="font-bold text-xs leading-none" style={{ color: locked ? "rgba(255,255,255,0.4)" : badge.color }}>{badge.name}</p>
              {locked && (
                <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Locked
                </span>
              )}
            </div>
            <p className="text-white/50 text-[11px] leading-snug mb-2">{badge.description}</p>
            {locked && "condition" in badge && badge.condition && (
              <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Lock style={{ width: 9, height: 9, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {badge.condition as string}
                </span>
              </div>
            )}
          </div>
          <button type="button" onClick={onClose}
            className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="absolute" style={{ bottom: -5, left: Math.max(8, Math.min(arrowLeft, POPOVER_W - 20)), width: 10, height: 10, background: "#0f1923", border: `1px solid ${borderColor}`, borderTop: "none", borderLeft: "none", transform: "rotate(45deg)" }} />
      </div>
    </div>,
    document.body
  );
}

// ─── Trophy cell ──────────────────────────────────────────────────────────────
function TrophyCell({ badge, earned, boxSize, xl = false, isActive, onToggle }: {
  badge: Achievement;
  earned: boolean;
  boxSize: number;
  xl?: boolean;
  isActive: boolean;
  onToggle: (badge: Achievement | null, rect: DOMRect | null, locked: boolean) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const iconSize = Math.round(boxSize * (xl ? 0.44 : 0.40));
  const isSpecial = badge.tier === "special";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = btnRef.current?.getBoundingClientRect() ?? null;
    onToggle(isActive ? null : badge, isActive ? null : rect, !earned);
  };

  if (!earned) {
    return (
      <button
        ref={btnRef}
        type="button"
        className="flex flex-col items-center gap-1 cursor-pointer select-none focus:outline-none group"
        onClick={handleClick}
      >
        <div className="flex items-center justify-center transition-all group-hover:scale-105"
          style={{ width: boxSize, height: boxSize, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"}`, boxShadow: isActive ? "0 0 12px rgba(255,255,255,0.08)" : "none" }}>
          <Lock style={{ width: Math.round(boxSize * 0.33), height: Math.round(boxSize * 0.33) }} className="text-white/25" />
        </div>
        <p className="text-center font-medium leading-tight" style={{ fontSize: 7, width: boxSize + 8, color: "rgba(255,255,255,0.3)" }}>{badge.name}</p>
      </button>
    );
  }

  return (
    <button
      ref={btnRef}
      type="button"
      className="flex flex-col items-center gap-1 cursor-pointer select-none focus:outline-none"
      onClick={handleClick}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          width: boxSize, height: boxSize, borderRadius: 8,
          transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
          transform: isActive ? "scale(1.1)" : "scale(1)",
          background: isSpecial
            ? `linear-gradient(145deg, ${badge.color}30 0%, ${badge.color}12 100%)`
            : `${badge.color}14`,
          border: `1.5px solid ${badge.color}${isActive ? "90" : isSpecial ? "55" : "28"}`,
          boxShadow: isActive
            ? `0 0 22px ${badge.color}60`
            : isSpecial
              ? `0 0 18px ${badge.color}40`
              : `0 0 8px ${badge.color}18`,
          color: badge.color,
        }}
      >
        {ICON(badge.icon, iconSize)}
        {isSpecial && (
          <span className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.16) 50%, transparent 75%)", backgroundSize: "200% 100%", animation: "trophy-shine 3.5s ease-in-out infinite" }} />
        )}
      </div>
      <p className="font-semibold text-center leading-tight" style={{ color: isActive ? badge.color : `${badge.color}99`, fontSize: xl ? 8.5 : 7, width: boxSize + 8 }}>{badge.name}</p>
    </button>
  );
}

// ─── Tier label ───────────────────────────────────────────────────────────────
function TierLabel({ label, color, earned, total }: { label: string; color: string; earned: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[8.5px] font-black uppercase tracking-[0.2em]" style={{ color }}>{label}</span>
      {earned > 0 && (
        <span className="ml-auto text-[7.5px] font-bold px-1.5 py-px rounded-full" style={{ background: `${color}10`, color, border: `1px solid ${color}22` }}>
          {earned}/{total}
        </span>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TrophyCabinet() {
  const [stored, setStored] = useState<ReturnType<typeof loadProfile>>(null);
  const [mounted, setMounted] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [engagement, setEngagement] = useState({ completed: 0, reviews: 0, wishlisted: 0 });
  const [active, setActive] = useState<Achievement | null>(null);
  const [activeLocked, setActiveLocked] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active]);

  const handleToggle = useCallback((badge: Achievement | null, rect: DOMRect | null, locked: boolean) => {
    setActive(badge);
    setAnchorRect(rect);
    setActiveLocked(locked);
  }, []);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then(p => { if (!cancelled) { setStored(p); setMounted(true); } });
    });
    fetch("/api/xp").then(r => r.ok ? r.json() : null).then(data => {
      if (!cancelled && data?.xp != null) {
        setTotalXP(data.xp);
        // Count engagement from events
        const events: { action: string; adventure_slug?: string }[] = data.events ?? [];
        const uniq = (action: string) => new Set(events.filter(e => e.action === action).map(e => e.adventure_slug)).size;
        const completedSlugs = [...new Set(events.filter(e => e.action === "trip_log").map(e => e.adventure_slug).filter(Boolean))] as string[];
        const byType: Record<string, number> = {};
        for (const slug of completedSlugs) {
          const adv = advData.find(a => a.slug === slug);
          if (adv?.type) byType[adv.type] = (byType[adv.type] ?? 0) + 1;
        }
        const distinctTypes = Object.keys(byType).length;
        setEngagement({ completed: uniq("trip_log"), reviews: uniq("review"), wishlisted: uniq("wishlist"), byType, distinctTypes });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!mounted) return null;

  if (!stored) {
    return (
      <div ref={containerRef} className="rounded-2xl overflow-visible relative" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}>
        <style>{`
          @keyframes trophy-shine { 0%{background-position:200% center} 60%{background-position:-200% center} 100%{background-position:-200% center} }
          @keyframes popover-in { from{opacity:0;transform:translateY(calc(-100% + 6px))} to{opacity:1;transform:translateY(-100%)} }
        `}</style>
        <div className="px-4 py-3 rounded-2xl" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[8.5px] uppercase tracking-[0.2em] font-bold text-white/25 mb-1">All Trophies</p>
        </div>
        <div className="px-4 py-6 rounded-b-2xl text-center">
          <p className="text-white/25 text-xs">Complete your <a href="/ace" className="text-[#ff5100]/70 hover:text-[#ff5100] underline underline-offset-2 transition-colors">ACE assessment</a> to unlock trophies</p>
        </div>
      </div>
    );
  }

  const achievements = getAchievements(stored.ace, totalXP, engagement);
  const earnedIds = new Set(achievements.map(a => a.id));
  const totalEarned = earnedIds.size;
  const totalPossible  = TIER1_ALL.length + TIER2_ALL.length + TIER3_ALL.length + TIERXP_ALL.length + TIERTYPE_ALL.length;
  const t1Earned    = TIER1_ALL.filter(b => earnedIds.has(b.id)).length;
  const t2Earned    = TIER2_ALL.filter(b => earnedIds.has(b.id)).length;
  const t3Earned    = TIER3_ALL.filter(b => earnedIds.has(b.id)).length;
  const txpEarned   = TIERXP_ALL.filter(b => earnedIds.has(b.id)).length;
  const ttypeEarned = TIERTYPE_ALL.filter(b => earnedIds.has(b.id)).length;

  const cell = (b: Achievement, size: number, xl = false) => (
    <TrophyCell key={b.id} badge={b} earned={earnedIds.has(b.id)} boxSize={size} xl={xl} isActive={active?.id === b.id} onToggle={handleToggle} />
  );

  return (
    <div ref={containerRef} className="rounded-2xl overflow-visible relative" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}>
      <style>{`
        @keyframes trophy-shine { 0%{background-position:200% center} 60%{background-position:-200% center} 100%{background-position:-200% center} }
        @keyframes popover-in { from{opacity:0;transform:translateY(calc(-100% + 6px))} to{opacity:1;transform:translateY(-100%)} }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b rounded-t-2xl" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[8.5px] uppercase tracking-[0.2em] font-bold text-white/25">All Trophies</p>
        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={totalEarned > 0 ? { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {totalEarned} / {totalPossible} unlocked
        </span>
      </div>

      {/* Row 1 — Tier 1 + Tier 2 */}
      <div className="flex flex-col sm:flex-row sm:items-stretch border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="px-4 py-4 sm:shrink-0 border-b sm:border-b-0 sm:border-r" style={{ background: "linear-gradient(160deg,rgba(251,191,36,0.06) 0%,transparent 70%)", borderColor: "rgba(255,255,255,0.05)" }}>
          <TierLabel label="Apex · Rarest of the Rare" color="#fbbf24" earned={t1Earned} total={TIER1_ALL.length} />
          <div className="flex flex-wrap gap-3 items-start">
            {TIER1_ALL.map(b => cell(b, 52, true))}
          </div>
        </div>
        <div className="flex-1 px-4 py-4">
          <TierLabel label="Domain · Dual-Axis Mastery" color="#f97316" earned={t2Earned} total={TIER2_ALL.length} />
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))" }}>
            {TIER2_ALL.map(b => cell(b, 38))}
          </div>
        </div>
      </div>

      {/* Row 2 — Tier 3 */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <TierLabel label="Axis Elite · Maxed Single Stats" color="#60a5fa" earned={t3Earned} total={TIER3_ALL.length} />
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))" }}>
          {TIER3_ALL.map(b => cell(b, 32))}
        </div>
      </div>

      {/* Row 3 — XP & Engagement trophies */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "linear-gradient(160deg,rgba(16,185,129,0.04) 0%,transparent 60%)" }}>
        <TierLabel label="Milestones · XP & Engagement" color="#10b981" earned={txpEarned} total={TIERXP_ALL.length} />
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))" }}>
          {TIERXP_ALL.map(b => cell(b, 36))}
        </div>
      </div>

      {/* Row 4 — Adventure type trophies */}
      <div className="px-4 py-4 rounded-b-2xl" style={{ background: "linear-gradient(160deg,rgba(251,191,36,0.03) 0%,transparent 60%)" }}>
        <TierLabel label="Type Mastery · Discipline Trophies" color="#fbbf24" earned={ttypeEarned} total={TIERTYPE_ALL.length} />
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))" }}>
          {TIERTYPE_ALL.map(b => cell(b, 36))}
        </div>
      </div>

      {/* Popover */}
      {active && anchorRect && (
        <div style={{ animation: "popover-in 0.15s ease forwards" }}>
          <Popover badge={active} anchorRect={anchorRect} onClose={() => setActive(null)} locked={activeLocked} />
        </div>
      )}
    </div>
  );
}
