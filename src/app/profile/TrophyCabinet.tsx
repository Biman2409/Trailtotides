"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lock, Trophy, Crown,
  Activity, PackageOpen, TrendingUp, Footprints,
  Waves, Mountain, Crosshair, WifiOff,
  Gauge, Layers, Globe, Brain, X,
} from "lucide-react";
import { getAchievements, AXIS_BADGES, DOMAIN_BADGES, SPECIAL_BADGES } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import { loadProfile } from "@/lib/matchmaker";

const ICON = (name: string, size: number): React.ReactNode => {
  const s = { width: size, height: size } as React.CSSProperties;
  const map: Record<string, React.ReactNode> = {
    Crown: <Crown style={s} />, Trophy: <Trophy style={s} />,
    Gauge: <Gauge style={s} />, Layers: <Layers style={s} />,
    Globe: <Globe style={s} />, Brain: <Brain style={s} />,
    Activity: <Activity style={s} />, PackageOpen: <PackageOpen style={s} />,
    TrendingUp: <TrendingUp style={s} />, Footprints: <Footprints style={s} />,
    Waves: <Waves style={s} />, Mountain: <Mountain style={s} />,
    Crosshair: <Crosshair style={s} />, WifiOff: <WifiOff style={s} />,
  };
  return map[name] ?? <Trophy style={s} />;
};

const TIER1_ALL: Achievement[] = SPECIAL_BADGES.map(b => ({ ...b }));
const TIER2_ALL: Achievement[] = DOMAIN_BADGES.map(b => ({ ...b }));
const TIER3_ALL: Achievement[] = Object.values(AXIS_BADGES).map(b => ({ ...b, tier: "axis" as const }));

// ─── Trophy cell ──────────────────────────────────────────────────────────────
function TrophyCell({ badge, earned, boxSize, xl = false, isActive, onToggle }: {
  badge: Achievement;
  earned: boolean;
  boxSize: number;
  xl?: boolean;
  isActive: boolean;
  onToggle: (badge: Achievement | null) => void;
}) {
  const iconSize = Math.round(boxSize * (xl ? 0.44 : 0.40));
  const isSpecial = badge.tier === "special";

  if (!earned) {
    return (
      <div className="flex flex-col items-center gap-1 select-none" style={{ opacity: 0.16 }}>
        <div style={{ width: boxSize, height: boxSize, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock style={{ width: Math.round(boxSize * 0.33), height: Math.round(boxSize * 0.33) }} className="text-white/20" />
        </div>
        <p className="text-center font-medium text-white/18 leading-tight truncate" style={{ fontSize: 7, width: boxSize + 8 }}>{badge.name}</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1 cursor-pointer select-none focus:outline-none"
      onClick={() => onToggle(isActive ? null : badge)}
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
      <p className="font-semibold text-center leading-tight truncate" style={{ color: isActive ? badge.color : `${badge.color}99`, fontSize: xl ? 8.5 : 7, width: boxSize + 8 }}>{badge.name}</p>
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

// ─── Detail panel ─────────────────────────────────────────────────────────────
function DetailPanel({ badge, onClose }: { badge: Achievement; onClose: () => void }) {
  const isSpecial = badge.tier === "special";
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-t"
      style={{
        borderColor: `${badge.color}22`,
        background: `linear-gradient(90deg, ${badge.color}0e 0%, transparent 80%)`,
        animation: "detail-in 0.15s ease forwards",
      }}
    >
      <div
        className="relative shrink-0 flex items-center justify-center overflow-hidden"
        style={{ width: 36, height: 36, borderRadius: 8, background: isSpecial ? `linear-gradient(145deg,${badge.color}30,${badge.color}12)` : `${badge.color}14`, border: `1.5px solid ${badge.color}55`, color: badge.color, boxShadow: `0 0 14px ${badge.color}40` }}
      >
        {ICON(badge.icon, 18)}
        {isSpecial && <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(110deg,transparent 25%,rgba(255,255,255,0.16) 50%,transparent 75%)", backgroundSize: "200% 100%", animation: "trophy-shine 3.5s ease-in-out infinite" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[11px] leading-none mb-1" style={{ color: badge.color }}>{badge.name}</p>
        <p className="text-white/45 text-[10px] leading-snug">{badge.description}</p>
      </div>
      <button type="button" onClick={onClose} className="shrink-0 p-1 rounded-lg hover:bg-white/6 transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TrophyCabinet() {
  const [stored, setStored] = useState<ReturnType<typeof loadProfile>>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<Achievement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleToggle = useCallback((badge: Achievement | null) => setActive(badge), []);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then(p => { if (!cancelled) { setStored(p); setMounted(true); } });
    });
    return () => { cancelled = true; };
  }, []);

  if (!mounted) return null;

  if (!stored) {
    return (
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.05),rgba(167,139,250,0.02))", border: "1px dashed rgba(167,139,250,0.18)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <Trophy className="w-3.5 h-3.5 text-violet-400/50" />
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

  const cell = (b: Achievement, size: number, xl = false) => (
    <TrophyCell key={b.id} badge={b} earned={earnedIds.has(b.id)} boxSize={size} xl={xl} isActive={active?.id === b.id} onToggle={handleToggle} />
  );

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}>
      <style>{`
        @keyframes trophy-shine { 0%{background-position:200% center} 60%{background-position:-200% center} 100%{background-position:-200% center} }
        @keyframes detail-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[8.5px] uppercase tracking-[0.2em] font-bold text-white/25">All Trophies</p>
        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={totalEarned > 0 ? { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {totalEarned} / {totalPossible} unlocked
        </span>
      </div>

      {/* Row 1 — Tier 1 + Tier 2 */}
      <div className="flex items-stretch border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="px-4 py-4 shrink-0" style={{ background: "linear-gradient(160deg,rgba(251,191,36,0.06) 0%,transparent 70%)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          <TierLabel tier="Tier 1" label="Only the absolute pinnacle" color="#fbbf24" earned={t1Earned} total={TIER1_ALL.length} />
          <div className="flex gap-4 items-start">
            {TIER1_ALL.map(b => cell(b, 56, true))}
          </div>
        </div>
        <div className="flex-1 px-4 py-4">
          <TierLabel tier="Tier 2" label="The domain master" color="#f97316" earned={t2Earned} total={TIER2_ALL.length} />
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
            {TIER2_ALL.map(b => cell(b, 38))}
          </div>
        </div>
      </div>

      {/* Row 2 — Tier 3 */}
      <div className="px-4 py-4">
        <TierLabel tier="Tier 3" label="The capability elite" color="#60a5fa" earned={t3Earned} total={TIER3_ALL.length} />
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(8, minmax(0,1fr))" }}>
          {TIER3_ALL.map(b => cell(b, 32))}
        </div>
      </div>

      {/* Detail panel — shown when a trophy is active */}
      {active && <DetailPanel badge={active} onClose={() => setActive(null)} />}
    </div>
  );
}
