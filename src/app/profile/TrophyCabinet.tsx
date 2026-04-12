"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import {
  Lock, Trophy, Crown, Globe, Brain,
  Footprints, Waves, ScanEye,
  Timer, Dumbbell, MountainSnow, Wind, Shield,
  Zap, Pickaxe, Wand, Star, MessageSquare, Camera, Images,
} from "@/lib/localIcons";
import { getAchievements, getActivityAchievements, AXIS_BADGES, DOMAIN_BADGES, SPECIAL_BADGES, ACTIVITY_BADGES } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import { loadProfile } from "@/lib/matchmaker";
import { loadXP } from "@/lib/xp";

const ICON = (name: string, size: number): React.ReactNode => {
  const s = { width: size, height: size } as React.CSSProperties;
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
    Star:           <Star           style={s} />,
    MessageSquare:  <MessageSquare  style={s} />,
    Camera:         <Camera         style={s} />,
    Images:         <Images         style={s} />,
  };
  return map[name] ?? <Trophy style={s} />;
};

const TIER1_ALL: Achievement[] = SPECIAL_BADGES.map(b => ({ ...b }));
const TIER2_ALL: Achievement[] = DOMAIN_BADGES.map(b => ({ ...b }));
const TIER3_ALL: Achievement[] = Object.values(AXIS_BADGES).map(b => ({ ...b, tier: "axis" as const }));
const TIER_ACTIVITY_ALL: Achievement[] = ACTIVITY_BADGES.map(b => ({ id: b.id, name: b.name, description: b.description, color: b.color, icon: b.icon, tier: "activity" as const }));

// ─── Popover ──────────────────────────────────────────────────────────────────
function Popover({ badge, anchorRect, onClose }: {
  badge: Achievement;
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const isSpecial = badge.tier === "special";
  const POPOVER_W = 280;
  const GAP = 10;

  const anchorCenterX = anchorRect.left + anchorRect.width / 2;
  const rawLeft = anchorCenterX - POPOVER_W / 2;
  const left = Math.max(8, Math.min(rawLeft, window.innerWidth - POPOVER_W - 8));
  const top = anchorRect.top + window.scrollY - GAP;
  const arrowLeft = anchorCenterX - left - 6;

  return (
    <div
      className="fixed z-[9999]"
      style={{ left, top, transform: "translateY(-100%)", width: POPOVER_W, pointerEvents: "none" }}
    >
      <div
        className="rounded-xl p-3.5 shadow-2xl"
        style={{
          pointerEvents: "auto",
          background: "#0f1923",
          border: `1px solid ${badge.color}35`,
          boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px ${badge.color}15`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="relative shrink-0 flex items-center justify-center overflow-hidden rounded-xl"
            style={{ width: 40, height: 40, background: isSpecial ? `linear-gradient(145deg,${badge.color}30,${badge.color}12)` : `${badge.color}14`, border: `1.5px solid ${badge.color}55`, color: badge.color, boxShadow: `0 0 14px ${badge.color}40` }}
          >
            {ICON(badge.icon, 20)}
            {isSpecial && <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(110deg,transparent 25%,rgba(255,255,255,0.16) 50%,transparent 75%)", backgroundSize: "200% 100%", animation: "trophy-shine 3.5s ease-in-out infinite" }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs leading-none mb-1.5" style={{ color: badge.color }}>{badge.name}</p>
            <p className="text-white/50 text-[11px] leading-snug">{badge.description}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
            <X className="w-3 h-3" />
          </button>
        </div>
        {/* Arrow pointing down to badge */}
        <div className="absolute" style={{ bottom: -5, left: Math.max(8, Math.min(arrowLeft, POPOVER_W - 20)), width: 10, height: 10, background: "#0f1923", border: `1px solid ${badge.color}35`, borderTop: "none", borderLeft: "none", transform: "rotate(45deg)" }} />
      </div>
    </div>
  );
}

// ─── Trophy cell ──────────────────────────────────────────────────────────────
function TrophyCell({ badge, earned, boxSize, xl = false, isActive, onToggle }: {
  badge: Achievement;
  earned: boolean;
  boxSize: number;
  xl?: boolean;
  isActive: boolean;
  onToggle: (badge: Achievement | null, rect: DOMRect | null) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const iconSize = Math.round(boxSize * (xl ? 0.44 : 0.40));
  const isSpecial = badge.tier === "special";

  if (!earned) {
    return (
      <div className="flex flex-col items-center gap-1 select-none" style={{ opacity: 0.16 }}>
        <div style={{ width: boxSize, height: boxSize, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock style={{ width: Math.round(boxSize * 0.33), height: Math.round(boxSize * 0.33) }} className="text-white/20" />
        </div>
        <p className="text-center font-medium text-white/18 leading-tight" style={{ fontSize: 7, width: boxSize + 8 }}>{badge.name}</p>
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = btnRef.current?.getBoundingClientRect() ?? null;
    onToggle(isActive ? null : badge, isActive ? null : rect);
  };

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
          <span
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.16) 50%, transparent 75%)", backgroundSize: "200% 100%", animation: "trophy-shine 3.5s ease-in-out infinite" }}
          />
        )}
      </div>
      <p className="font-semibold text-center leading-tight" style={{ color: isActive ? badge.color : `${badge.color}99`, fontSize: xl ? 8.5 : 7, width: boxSize + 8 }}>{badge.name}</p>
    </button>
  );
}

// ─── Tier label ───────────────────────────────────────────────────────────────
function TierLabel({ tier, label, color, earned, total }: { tier: string; label: string; color: string; earned: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[8.5px] font-black uppercase tracking-[0.2em]" style={{ color }}>{tier}</span>
      <span className="text-[8.5px] text-white/22 font-medium">{label}</span>
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
  const [active, setActive] = useState<Achievement | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActive(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active]);

  // Close on scroll
  useEffect(() => {
    if (!active) return;
    const handler = () => setActive(null);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [active]);

  const handleToggle = useCallback((badge: Achievement | null, rect: DOMRect | null) => {
    setActive(badge);
    setAnchorRect(rect);
  }, []);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then(p => { if (!cancelled) { setStored(p); setMounted(true); } });
    });
    return () => { cancelled = true; };
  }, []);

  if (!mounted) return null;

  // Activity badges from XP (always available)
  const xpState = loadXP();
  const activityAchievements = getActivityAchievements(xpState);
  const activityEarnedIds = new Set(activityAchievements.map(a => a.id));
  const tActivityEarned = TIER_ACTIVITY_ALL.filter(b => activityEarnedIds.has(b.id)).length;

  if (!stored) {
    // Show activity badges even without ACE profile
    const totalPossibleNoACE = TIER_ACTIVITY_ALL.length;
    return (
      <div ref={containerRef} className="rounded-2xl overflow-visible relative" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}>
        <style>{`
          @keyframes trophy-shine { 0%{background-position:200% center} 60%{background-position:-200% center} 100%{background-position:-200% center} }
          @keyframes popover-in { from{opacity:0;transform:translateY(calc(-100% + 6px))} to{opacity:1;transform:translateY(-100%)} }
        `}</style>
        <div className="flex items-center justify-between px-4 py-2.5 border-b rounded-t-2xl" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[8.5px] uppercase tracking-[0.2em] font-bold text-white/25">All Trophies</p>
          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={tActivityEarned > 0 ? { background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {tActivityEarned} / {totalPossibleNoACE} unlocked
          </span>
        </div>
        <div className="px-4 py-4 rounded-b-2xl">
          <TierLabel tier="Activity" label="Earned by exploring" color="#34d399" earned={tActivityEarned} total={TIER_ACTIVITY_ALL.length} />
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))" }}>
            {TIER_ACTIVITY_ALL.map(b => (
              <TrophyCell key={b.id} badge={b} earned={activityEarnedIds.has(b.id)} boxSize={32} isActive={active?.id === b.id} onToggle={handleToggle} />
            ))}
          </div>
        </div>
        <div className="px-4 py-3 rounded-b-2xl" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
          <p className="text-white/25 text-xs text-center">Complete your <a href="/ace" className="text-[#ff5100]/70 hover:text-[#ff5100] underline underline-offset-2 transition-colors">ACE assessment</a> to unlock skill trophies</p>
        </div>
        {active && anchorRect && (
          <div style={{ animation: "popover-in 0.15s ease forwards" }}>
            <Popover badge={active} anchorRect={anchorRect} onClose={() => setActive(null)} />
          </div>
        )}
      </div>
    );
  }

  const achievements = getAchievements(stored.ace);
  const earnedIds = new Set([...achievements.map(a => a.id), ...activityAchievements.map(a => a.id)]);
  const totalEarned = earnedIds.size;
  const totalPossible = TIER1_ALL.length + TIER2_ALL.length + TIER3_ALL.length + TIER_ACTIVITY_ALL.length;
  const t1Earned = TIER1_ALL.filter(b => earnedIds.has(b.id)).length;
  const t2Earned = TIER2_ALL.filter(b => earnedIds.has(b.id)).length;
  const t3Earned = TIER3_ALL.filter(b => earnedIds.has(b.id)).length;

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
          <TierLabel tier="Tier 1" label="The absolute pinnacle" color="#fbbf24" earned={t1Earned} total={TIER1_ALL.length} />
          <div className="flex flex-wrap gap-3 items-start">
            {TIER1_ALL.map(b => cell(b, 52, true))}
          </div>
        </div>
        <div className="flex-1 px-4 py-4">
          <TierLabel tier="Tier 2" label="The domain master" color="#f97316" earned={t2Earned} total={TIER2_ALL.length} />
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))" }}>
            {TIER2_ALL.map(b => cell(b, 38))}
          </div>
        </div>
      </div>

      {/* Row 2 — Tier 3 */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <TierLabel tier="Tier 3" label="The axis elite" color="#60a5fa" earned={t3Earned} total={TIER3_ALL.length} />
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))" }}>
          {TIER3_ALL.map(b => cell(b, 32))}
        </div>
      </div>

      {/* Row 3 — Activity */}
      <div className="px-4 py-4 rounded-b-2xl" style={{ background: "rgba(52,211,153,0.015)" }}>
        <TierLabel tier="Activity" label="Earned by exploring" color="#34d399" earned={tActivityEarned} total={TIER_ACTIVITY_ALL.length} />
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))" }}>
          {TIER_ACTIVITY_ALL.map(b => cell(b, 32))}
        </div>
      </div>

      {/* Popover — anchored to badge, above it */}
      {active && anchorRect && (
        <div style={{ animation: "popover-in 0.15s ease forwards" }}>
          <Popover badge={active} anchorRect={anchorRect} onClose={() => setActive(null)} />
        </div>
      )}
    </div>
  );
}
