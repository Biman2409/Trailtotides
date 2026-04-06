"use client";

import { useState, useEffect, useRef } from "react";
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

// Single icon map keyed by the icon string stored on each badge
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
const TT_W = 172;
function Tooltip({ badge, visible, anchorRef }: { badge: Achievement | null; visible: boolean; anchorRef: React.RefObject<HTMLDivElement | null> }) {
  const [pos, setPos] = useState<{ left: number; bottom: number; arrowLeft: number } | null>(null);
  useEffect(() => {
    if (!visible || !anchorRef.current || !badge) { setPos(null); return; }
    const r = anchorRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const vw = window.innerWidth;
    let left = cx - TT_W / 2, arrowLeft = TT_W / 2;
    if (left < 10) { arrowLeft -= 10 - left; left = 10; }
    else if (left + TT_W > vw - 10) { const s = left + TT_W - (vw - 10); arrowLeft += s; left -= s; }
    setPos({ left, bottom: window.innerHeight - r.top + 8, arrowLeft: Math.max(12, Math.min(TT_W - 12, arrowLeft)) });
  }, [visible, anchorRef, badge]);
  if (!pos || !badge) return null;
  return createPortal(
    <div className="pointer-events-none transition-all duration-200" style={{ position: "fixed", bottom: pos.bottom + (visible ? 0 : -4), left: pos.left, width: TT_W, opacity: visible ? 1 : 0, zIndex: 9999 }}>
      <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(14,14,18,0.98)", border: `1px solid ${badge.color}40`, boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}>
        <p className="font-bold text-[11px] mb-1" style={{ color: badge.color }}>{badge.name}</p>
        <p className="text-white/50 text-[10px] leading-snug">{badge.description}</p>
      </div>
      <div className="absolute w-2.5 h-2.5" style={{ bottom: -5, left: pos.arrowLeft, transform: "translateX(-50%) rotate(45deg)", background: "rgba(14,14,18,0.98)", borderRight: `1px solid ${badge.color}40`, borderBottom: `1px solid ${badge.color}40` }} />
    </div>,
    document.body
  );
}

// ─── Trophy cell ──────────────────────────────────────────────────────────────
function TrophyCell({ badge, earned, boxSize, xl = false, shape: _shape = "square" }: {
  badge: Achievement; earned: boolean; boxSize: number; xl?: boolean; shape?: "circle" | "diamond" | "square";
}) {
  const [tip, setTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref   = useRef<HTMLDivElement>(null);
  const iconSize = xl ? Math.round(boxSize * 0.45) : Math.round(boxSize * 0.40);
  const isSpecial = badge.tier === "special";
  const borderRadius = "10px";

  if (!earned) {
    return (
      <div className="flex flex-col items-center gap-1.5 select-none" style={{ opacity: 0.18 }}>
        <div style={{ width: boxSize, height: boxSize, borderRadius, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock style={{ width: Math.round(boxSize * 0.35), height: Math.round(boxSize * 0.35) }} className="text-white/25" />
        </div>
        <p className="text-center font-medium text-white/20 leading-tight" style={{ fontSize: 7.5, maxWidth: boxSize + 10, wordBreak: "break-word" }}>{badge.name}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1.5 cursor-pointer"
      onMouseEnter={() => { if (timer.current) clearTimeout(timer.current); setTip(true); }}
      onMouseLeave={() => { timer.current = setTimeout(() => setTip(false), 120); }}
      onClick={() => setTip(v => !v)}
    >
      <Tooltip badge={badge} visible={tip} anchorRef={ref} />
      <div
        className="relative flex items-center justify-center transition-transform duration-150 hover:scale-110 overflow-hidden"
        style={{
          width: boxSize, height: boxSize,
          borderRadius,
          background: isSpecial
            ? `linear-gradient(145deg, ${badge.color}32 0%, ${badge.color}14 100%)`
            : `${badge.color}16`,
          border: `1.5px solid ${badge.color}${isSpecial ? "60" : "32"}`,
          boxShadow: isSpecial
            ? `0 0 28px ${badge.color}55, 0 0 10px ${badge.color}28`
            : `0 0 10px ${badge.color}22`,
          color: badge.color,
        }}
      >
        {ICON(badge.icon, iconSize)}

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
          <span className="absolute inset-0 animate-ping opacity-10" style={{ borderRadius, border: `2px solid ${badge.color}` }} />
        )}
      </div>
      <p className="font-semibold text-center leading-tight" style={{ color: badge.color, fontSize: xl ? 9 : 7.5, maxWidth: boxSize + 12, wordBreak: "break-word" }}>{badge.name}</p>
    </div>
  );
}

// ─── Tier label row ───────────────────────────────────────────────────────────
function TierLabel({ tier, label, color, earned, total }: { tier: string; label: string; color: string; earned: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-3.5">
      <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color }}>{tier}</span>
      <span className="text-[9px] text-white/25 font-medium">{label}</span>
      {earned > 0 && (
        <span className="ml-auto text-[8px] font-bold px-1.5 py-px rounded-full" style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
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

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}>
      <style>{`
        @keyframes trophy-shine {
          0%   { background-position: 200% center; }
          60%  { background-position: -200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/25">Trophy Cabinet</p>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={totalEarned > 0 ? { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {totalEarned} / {totalPossible} unlocked
        </span>
      </div>

      {/* Row 1 — Tier 1 + Tier 2 */}
      <div className="flex items-stretch border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>

        {/* Tier 1 — Apex (larger, prominent) */}
        <div className="px-5 py-5 shrink-0" style={{ background: "linear-gradient(160deg, rgba(251,191,36,0.07) 0%, transparent 70%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <TierLabel tier="Tier 1" label="To the absolute pinnacle" color="#fbbf24" earned={t1Earned} total={TIER1_ALL.length} />
          <div className="flex gap-5 items-start">
            {TIER1_ALL.map(b => <TrophyCell key={b.id} badge={b} earned={earnedIds.has(b.id)} boxSize={64} xl shape="square" />)}
          </div>
        </div>

        {/* Tier 2 — Domain */}
        <div className="flex-1 px-5 py-5">
          <TierLabel tier="Tier 2" label="The domain master" color="#f97316" earned={t2Earned} total={TIER2_ALL.length} />
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            {TIER2_ALL.map(b => <TrophyCell key={b.id} badge={b} earned={earnedIds.has(b.id)} boxSize={42} shape="square" />)}
          </div>
        </div>

      </div>

      {/* Row 2 — Tier 3 */}
      <div className="px-5 py-5">
        <TierLabel tier="Tier 3" label="The capability elite" color="#60a5fa" earned={t3Earned} total={TIER3_ALL.length} />
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}>
          {TIER3_ALL.map(b => <TrophyCell key={b.id} badge={b} earned={earnedIds.has(b.id)} boxSize={36} />)}
        </div>
      </div>

    </div>
  );
}
