"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Lock, Trophy, Crown,
  Activity, PackageOpen, TrendingUp, Footprints,
  Waves, Mountain, Crosshair, WifiOff,
  Gauge, Layers, Globe, Brain,
} from "lucide-react";
import { getAchievements, AXIS_BADGES, DOMAIN_BADGES, SPECIAL_BADGES } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import { loadProfile } from "@/lib/matchmaker";

const ICON = (name: string, size: number): React.ReactNode => {
  const s = { width: size, height: size } as React.CSSProperties;
  const map: Record<string, React.ReactNode> = {
    Crown:       <Crown       style={s} />,
    Trophy:      <Trophy      style={s} />,
    Gauge:       <Gauge       style={s} />,
    Layers:      <Layers      style={s} />,
    Globe:       <Globe       style={s} />,
    Brain:       <Brain       style={s} />,
    Activity:    <Activity    style={s} />,
    PackageOpen: <PackageOpen style={s} />,
    TrendingUp:  <TrendingUp  style={s} />,
    Footprints:  <Footprints  style={s} />,
    Waves:       <Waves       style={s} />,
    Mountain:    <Mountain    style={s} />,
    Crosshair:   <Crosshair   style={s} />,
    WifiOff:     <WifiOff     style={s} />,
  };
  return map[name] ?? <Trophy style={s} />;
};

const TIER1_ALL: Achievement[] = SPECIAL_BADGES.map(b => ({ ...b }));
const TIER2_ALL: Achievement[] = DOMAIN_BADGES.map(b => ({ ...b }));
const TIER3_ALL: Achievement[] = Object.values(AXIS_BADGES).map(b => ({ ...b, tier: "axis" as const }));

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const TT_W = 180;
function Tooltip({ badge, anchorEl }: { badge: Achievement; anchorEl: HTMLDivElement }) {
  const [pos, setPos] = useState<{ left: number; bottom: number; arrowLeft: number } | null>(null);
  useEffect(() => {
    const r = anchorEl.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const vw = window.innerWidth;
    let left = cx - TT_W / 2, arrowLeft = TT_W / 2;
    if (left < 10) { arrowLeft -= 10 - left; left = 10; }
    else if (left + TT_W > vw - 10) { const s = left + TT_W - (vw - 10); arrowLeft += s; left -= s; }
    setPos({ left, bottom: window.innerHeight - r.top + 10, arrowLeft: Math.max(12, Math.min(TT_W - 12, arrowLeft)) });
  }, [anchorEl]);
  if (!pos) return null;
  return createPortal(
    <div className="pointer-events-none" style={{ position: "fixed", bottom: pos.bottom, left: pos.left, width: TT_W, zIndex: 9999, animation: "tt-in 0.12s ease forwards" }}>
      <style>{`@keyframes tt-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(10,8,14,0.98)", border: `1px solid ${badge.color}45`, boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)` }}>
        <p className="font-bold text-[11px] mb-1" style={{ color: badge.color }}>{badge.name}</p>
        <p className="text-white/50 text-[10px] leading-snug">{badge.description}</p>
      </div>
      <div className="absolute w-2.5 h-2.5" style={{ bottom: -5, left: pos.arrowLeft, transform: "translateX(-50%) rotate(45deg)", background: "rgba(10,8,14,0.98)", borderRight: `1px solid ${badge.color}45`, borderBottom: `1px solid ${badge.color}45` }} />
    </div>,
    document.body
  );
}

// ─── Trophy cell ──────────────────────────────────────────────────────────────
function TrophyCell({ badge, earned, boxSize, xl = false, activeId, setActiveId }: {
  badge: Achievement; earned: boolean; boxSize: number; xl?: boolean;
  activeId: string | null; setActiveId: (id: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const iconSize = xl ? Math.round(boxSize * 0.44) : Math.round(boxSize * 0.40);
  const isSpecial = badge.tier === "special";
  const isActive = activeId === badge.id;

  useEffect(() => {
    if (!isActive) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setActiveId(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isActive, setActiveId]);

  if (!earned) {
    return (
      <div className="flex flex-col items-center gap-1.5 select-none" style={{ opacity: 0.14 }}>
        <div style={{ width: boxSize, height: boxSize, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock style={{ width: Math.round(boxSize * 0.33), height: Math.round(boxSize * 0.33) }} className="text-white/20" />
        </div>
        <p className="text-center font-medium text-white/15 leading-tight" style={{ fontSize: 7, maxWidth: boxSize + 10, wordBreak: "break-word" }}>{badge.name}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1.5 cursor-pointer select-none"
      onClick={() => setActiveId(isActive ? null : badge.id)}
    >
      {isActive && ref.current && <Tooltip badge={badge} anchorEl={ref.current} />}
      <div
        className="relative flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{
          width: boxSize, height: boxSize,
          borderRadius: 10,
          transform: isActive ? "scale(1.14) translateY(-2px)" : "scale(1)",
          background: isSpecial
            ? `linear-gradient(145deg, ${badge.color}38 0%, ${badge.color}16 100%)`
            : `linear-gradient(145deg, ${badge.color}20 0%, ${badge.color}0e 100%)`,
          border: `1.5px solid ${badge.color}${isActive ? "90" : isSpecial ? "55" : "30"}`,
          boxShadow: isActive
            ? `0 0 32px ${badge.color}80, 0 0 14px ${badge.color}45, inset 0 1px 0 rgba(255,255,255,0.15)`
            : isSpecial
              ? `0 0 24px ${badge.color}50, 0 0 8px ${badge.color}25, inset 0 1px 0 rgba(255,255,255,0.12)`
              : `0 0 8px ${badge.color}20, inset 0 1px 0 rgba(255,255,255,0.06)`,
          color: badge.color,
        }}
      >
        {/* Inner bevel highlight */}
        <span className="absolute inset-x-0 top-0 h-[40%] pointer-events-none rounded-t-[9px]"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.09) 0%, transparent 100%)" }} />
        {ICON(badge.icon, iconSize)}
        {/* Shine sweep — Tier 1 only */}
        {isSpecial && (
          <span className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.2) 50%, transparent 75%)", backgroundSize: "200% 100%", animation: "trophy-shine 3.5s ease-in-out infinite" }} />
        )}
        {/* Pulse ring — Tier 1 only */}
        {isSpecial && (
          <span className="absolute inset-0 animate-ping opacity-10" style={{ borderRadius: 10, border: `2px solid ${badge.color}` }} />
        )}
      </div>
      <p className="font-semibold text-center leading-tight transition-colors duration-150"
        style={{ color: isActive ? badge.color : `${badge.color}99`, fontSize: xl ? 9 : 7.5, maxWidth: boxSize + 12, wordBreak: "break-word" }}>
        {badge.name}
      </p>
    </div>
  );
}

// ─── Shelf ────────────────────────────────────────────────────────────────────
// A physical shelf: spot-lit from above, wood-like ledge at the bottom
function Shelf({ children, lightColor, label, sublabel, count, total }: {
  children: React.ReactNode;
  lightColor: string;
  label: string;
  sublabel: string;
  count: number;
  total: number;
}) {
  return (
    <div className="relative">
      {/* Spot light from top */}
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 80px at 50% 0%, ${lightColor}14 0%, transparent 100%)` }} />

      {/* Shelf interior */}
      <div className="relative px-5 pt-5 pb-6">
        {/* Row label */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[8px] font-black uppercase tracking-[0.25em]" style={{ color: lightColor }}>{label}</span>
          <span className="text-[8px] text-white/20 font-medium">{sublabel}</span>
          <span className="ml-auto text-[8px] font-bold px-2 py-px rounded-full tabular-nums"
            style={count > 0
              ? { background: `${lightColor}12`, color: lightColor, border: `1px solid ${lightColor}28` }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {count}&thinsp;/&thinsp;{total}
          </span>
        </div>
        {children}
      </div>

      {/* Shelf ledge */}
      <div className="relative h-[7px] mx-0"
        style={{
          background: "linear-gradient(to bottom, #2a2118 0%, #1a1510 60%, #0e0c09 100%)",
          boxShadow: `0 3px 10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 20px ${lightColor}18`,
        }}>
        {/* Wood grain lines */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(0,0,0,0.25) 28px, rgba(0,0,0,0.25) 29px)" }} />
        {/* Ledge front edge highlight */}
        <div className="absolute inset-x-0 bottom-0 h-[2px]"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.5), rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.04) 60%, rgba(0,0,0,0.5))" }} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TrophyCabinet() {
  const [stored, setStored] = useState<ReturnType<typeof loadProfile>>(null);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setActiveId(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSetActive = useCallback((id: string | null) => setActiveId(id), []);

  useEffect(() => {
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then(p => { setStored(p); setMounted(true); });
    });
  }, []);

  if (!mounted) return null;

  if (!stored) {
    return (
      <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.05) 0%, rgba(167,139,250,0.02) 100%)", border: "1px dashed rgba(167,139,250,0.18)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <Trophy className="w-4 h-4 text-violet-400/50" />
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
            <Lock className="w-1.5 h-1.5 text-violet-400/60" />
          </div>
        </div>
        <div>
          <p className="text-white/55 font-semibold text-sm">Trophies locked</p>
          <p className="text-white/28 text-xs mt-0.5">Complete your ACE assessment to start earning</p>
        </div>
      </div>
    );
  }

  const achievements = getAchievements(stored.ace);
  const earnedIds = new Set(achievements.map(a => a.id));
  const totalEarned = earnedIds.size;
  const totalPossible = TIER1_ALL.length + TIER2_ALL.length + TIER3_ALL.length;
  const t1Earned = TIER1_ALL.filter(b => earnedIds.has(b.id)).length;
  const t2Earned = TIER2_ALL.filter(b => earnedIds.has(b.id)).length;
  const t3Earned = TIER3_ALL.filter(b => earnedIds.has(b.id)).length;

  const cell = (b: Achievement, boxSize: number, xl = false) => (
    <TrophyCell key={b.id} badge={b} earned={earnedIds.has(b.id)} boxSize={boxSize} xl={xl} activeId={activeId} setActiveId={handleSetActive} />
  );

  return (
    <div className="overflow-hidden"
      style={{
        borderRadius: 18,
        // Cabinet outer frame — dark walnut
        background: "linear-gradient(175deg, #1c1610 0%, #110e0a 100%)",
        border: "1.5px solid #2e2418",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.4)",
      }}>

      <style>{`
        @keyframes trophy-shine {
          0%   { background-position: 200% center; }
          60%  { background-position: -200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      {/* ── Cabinet top bar ── */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
        <div className="flex items-center gap-2">
          {/* Decorative cabinet knobs */}
          <div className="flex gap-1.5">
            {["#fbbf24", "#f97316", "#60a5fa"].map(c => (
              <div key={c} className="w-2 h-2 rounded-full"
                style={{ background: `radial-gradient(circle at 35% 35%, ${c}cc, ${c}55)`, boxShadow: `0 0 4px ${c}40` }} />
            ))}
          </div>
          <span className="text-[9px] uppercase tracking-[0.24em] font-bold text-white/30 ml-1">Trophy Cabinet</span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full tabular-nums"
          style={totalEarned > 0
            ? { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }
            : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {totalEarned}&thinsp;/&thinsp;{totalPossible} unlocked
        </span>
      </div>

      {/* ── Cabinet interior glass panel ── */}
      <div style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.012) 0%, rgba(0,0,0,0.08) 100%)" }}>

        {/* ── Shelf 1 — Tier 1 Pinnacle ── */}
        <Shelf lightColor="#fbbf24" label="Tier 1" sublabel="The absolute pinnacle" count={t1Earned} total={TIER1_ALL.length}>
          <div className="flex gap-5 items-end justify-center flex-wrap">
            {TIER1_ALL.map(b => cell(b, 68, true))}
          </div>
        </Shelf>

        {/* ── Shelf 2 — Tier 2 Domain ── */}
        <Shelf lightColor="#f97316" label="Tier 2" sublabel="The domain master" count={t2Earned} total={TIER2_ALL.length}>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            {TIER2_ALL.map(b => cell(b, 46))}
          </div>
        </Shelf>

        {/* ── Shelf 3 — Tier 3 Axis ── */}
        <Shelf lightColor="#60a5fa" label="Tier 3" sublabel="The capability elite" count={t3Earned} total={TIER3_ALL.length}>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}>
            {TIER3_ALL.map(b => cell(b, 38))}
          </div>
        </Shelf>

      </div>

      {/* ── Cabinet base ── */}
      <div className="h-3"
        style={{
          background: "linear-gradient(to bottom, #1a1410 0%, #0e0a07 100%)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
        }} />
    </div>
  );
}
