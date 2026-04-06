"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Lock, Trophy, Crown } from "lucide-react";
import {
  Flame, Zap, Dumbbell, Compass, Waves, Mountain, Shield, Wind,
  Gauge, Layers, Globe, Brain,
} from "lucide-react";
import { getAchievements, AXIS_BADGES, DOMAIN_BADGES, SPECIAL_BADGES } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import { loadProfile } from "@/lib/matchmaker";

// ─── Icon maps ────────────────────────────────────────────────────────────────
const ICON_SM: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-4 h-4" />, Zap: <Zap className="w-4 h-4" />,
  Dumbbell: <Dumbbell className="w-4 h-4" />, Compass: <Compass className="w-4 h-4" />,
  Waves: <Waves className="w-4 h-4" />, Mountain: <Mountain className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />, Wind: <Wind className="w-4 h-4" />,
  Trophy: <Trophy className="w-4 h-4" />, Crown: <Crown className="w-4 h-4" />,
  Gauge: <Gauge className="w-4 h-4" />, Layers: <Layers className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />, Brain: <Brain className="w-4 h-4" />,
};

const ICON_LG: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-6 h-6" />, Zap: <Zap className="w-6 h-6" />,
  Dumbbell: <Dumbbell className="w-6 h-6" />, Compass: <Compass className="w-6 h-6" />,
  Waves: <Waves className="w-6 h-6" />, Mountain: <Mountain className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />, Wind: <Wind className="w-6 h-6" />,
  Trophy: <Trophy className="w-6 h-6" />, Crown: <Crown className="w-7 h-7" />,
  Gauge: <Gauge className="w-6 h-6" />, Layers: <Layers className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />, Brain: <Brain className="w-6 h-6" />,
};

// ─── All possible trophies by tier ───────────────────────────────────────────

// Tier 1 — Apex: only Full Apex (all 8 maxed) + Multi-Domain Elite (4+ maxed but not full)
const TIER1_ALL: Achievement[] = SPECIAL_BADGES.map(b => ({ ...b }));

// Tier 2 — Combo: 2-parameter domain mastery badges
const TIER2_ALL: Achievement[] = DOMAIN_BADGES.map(b => ({ ...b }));

// Tier 3 — Single axis elite badges
const TIER3_ALL: Achievement[] = Object.values(AXIS_BADGES).map(b => ({ ...b, tier: "axis" as const }));

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const TOOLTIP_W = 180;
const EDGE_PAD = 10;

function Tooltip({ badge, visible, anchorRef }: {
  badge: Achievement | null;
  visible: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<{ left: number; bottom: number; arrowLeft: number } | null>(null);

  useEffect(() => {
    if (!visible || !anchorRef.current || !badge) { setPos(null); return; }
    const rect = anchorRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const vw = window.innerWidth;
    let left = centerX - TOOLTIP_W / 2;
    let arrowLeft = TOOLTIP_W / 2;
    if (left < EDGE_PAD) { arrowLeft -= (EDGE_PAD - left); left = EDGE_PAD; }
    else if (left + TOOLTIP_W > vw - EDGE_PAD) { const shift = (left + TOOLTIP_W) - (vw - EDGE_PAD); arrowLeft += shift; left -= shift; }
    const bottom = window.innerHeight - rect.top + 8;
    setPos({ left, bottom, arrowLeft: Math.max(12, Math.min(TOOLTIP_W - 12, arrowLeft)) });
  }, [visible, anchorRef, badge]);

  if (!pos || !badge) return null;

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

// ─── Trophy badge item ────────────────────────────────────────────────────────
function TrophyItem({ badge, earned, size = "md" }: { badge: Achievement; earned: boolean; size?: "sm" | "md" | "lg" }) {
  const [tooltip, setTooltip] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const startClose = () => { closeTimer.current = setTimeout(() => setTooltip(false), 120); };
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };

  const isSpecial = badge.tier === "special";
  const w = size === "lg" ? 64 : size === "md" ? 52 : 40;
  const icon = size === "lg" ? (ICON_LG[badge.icon] ?? <Crown className="w-7 h-7" />) : (ICON_SM[badge.icon] ?? <Trophy className="w-4 h-4" />);

  if (!earned) {
    return (
      <div className="flex flex-col items-center gap-1.5 opacity-30">
        <div className="rounded-xl flex items-center justify-center" style={{ width: w, height: w, background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }}>
          <Lock className="w-4 h-4 text-white/20" />
        </div>
        <p className="text-[7.5px] font-semibold text-center text-white/20 leading-tight" style={{ wordBreak: "break-word", maxWidth: w }}>{badge.name}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1.5 cursor-pointer"
      onMouseEnter={() => { cancelClose(); setTooltip(true); }}
      onMouseLeave={startClose}
      onClick={() => setTooltip(v => !v)}
    >
      <Tooltip badge={badge} visible={tooltip} anchorRef={ref} />
      <div
        className="relative rounded-xl flex items-center justify-center transition-transform duration-150 hover:scale-110"
        style={{
          width: w, height: w,
          background: isSpecial
            ? `linear-gradient(145deg, ${badge.color}28 0%, ${badge.color}10 100%)`
            : `${badge.color}14`,
          border: `1.5px solid ${badge.color}${isSpecial ? "55" : "30"}`,
          boxShadow: isSpecial ? `0 0 22px ${badge.color}45, 0 0 8px ${badge.color}25` : `0 0 10px ${badge.color}20`,
          color: badge.color,
        }}
      >
        {icon}
        {isSpecial && (
          <span className="absolute inset-0 rounded-xl animate-ping opacity-15" style={{ border: `2px solid ${badge.color}` }} />
        )}
      </div>
      <p className="font-bold text-center leading-tight" style={{ color: badge.color, fontSize: size === "lg" ? "10px" : "8px", wordBreak: "break-word", maxWidth: w + 8 }}>{badge.name}</p>
    </div>
  );
}

// ─── Tier row ─────────────────────────────────────────────────────────────────
function TierRow({
  label, sublabel, accentColor, all, earned, size, cols,
}: {
  label: string;
  sublabel: string;
  accentColor: string;
  all: Achievement[];
  earned: Set<string>;
  size?: "sm" | "md" | "lg";
  cols: number;
}) {
  const earnedCount = all.filter(b => earned.has(b.id)).length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${accentColor}20`, background: `linear-gradient(145deg, ${accentColor}08 0%, rgba(14,14,18,0) 60%)` }}>
      {/* Tier header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: `${accentColor}14` }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>{label}</span>
            {earnedCount > 0 && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}>
                {earnedCount}/{all.length}
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/30 mt-0.5">{sublabel}</p>
        </div>
        {earnedCount === 0 && (
          <Lock className="w-3.5 h-3.5 text-white/15" />
        )}
      </div>

      {/* Trophies grid */}
      <div className="px-5 py-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {all.map((badge) => (
            <TrophyItem key={badge.id} badge={badge} earned={earned.has(badge.id)} size={size} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function TrophyCabinet() {
  const [stored, setStored] = useState<ReturnType<typeof loadProfile>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then((profile) => {
        setStored(profile);
        setMounted(true);
      });
    });
  }, []);

  if (!mounted) return null;

  // No profile — show locked cabinet with a prompt
  if (!stored) {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(167,139,250,0.02) 100%)", border: "1px dashed rgba(167,139,250,0.2)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.08) 0%, transparent 70%)" }} />
        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <Trophy className="w-6 h-6 text-violet-400/50" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
            <Lock className="w-2 h-2 text-violet-400/70" />
          </div>
        </div>
        <div>
          <p className="text-white/60 font-semibold text-sm">Trophies are locked</p>
          <p className="text-white/30 text-xs mt-1">Complete your ACE assessment to start earning trophies</p>
        </div>
      </div>
    );
  }

  const achievements = getAchievements(stored.ace);
  const earnedIds = new Set(achievements.map(a => a.id));
  const totalEarned = earnedIds.size;
  const totalPossible = TIER1_ALL.length + TIER2_ALL.length + TIER3_ALL.length;

  return (
    <div className="space-y-4">
      {/* Overall count */}
      {totalEarned > 0 && (
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
          >
            {totalEarned} / {totalPossible} Unlocked
          </span>
        </div>
      )}

      {/* Tier 1 — Apex */}
      <TierRow
        label="Tier I — Apex"
        sublabel="Multi-domain mastery. The absolute pinnacle."
        accentColor="#fbbf24"
        all={TIER1_ALL}
        earned={earnedIds}
        size="lg"
        cols={TIER1_ALL.length}
      />

      {/* Tier 2 — Domain Combo */}
      <TierRow
        label="Tier II — Domain Mastery"
        sublabel="Both axes in a domain maxed simultaneously."
        accentColor="#f97316"
        all={TIER2_ALL}
        earned={earnedIds}
        size="md"
        cols={4}
      />

      {/* Tier 3 — Single Axis */}
      <TierRow
        label="Tier III — Elite Axis"
        sublabel="Single capability pushed to its absolute limit."
        accentColor="#60a5fa"
        all={TIER3_ALL}
        earned={earnedIds}
        size="sm"
        cols={4}
      />
    </div>
  );
}
