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

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-3.5 h-3.5" />, Zap: <Zap className="w-3.5 h-3.5" />,
  Dumbbell: <Dumbbell className="w-3.5 h-3.5" />, Compass: <Compass className="w-3.5 h-3.5" />,
  Waves: <Waves className="w-3.5 h-3.5" />, Mountain: <Mountain className="w-3.5 h-3.5" />,
  Shield: <Shield className="w-3.5 h-3.5" />, Wind: <Wind className="w-3.5 h-3.5" />,
  Trophy: <Trophy className="w-3.5 h-3.5" />, Crown: <Crown className="w-4 h-4" />,
  Gauge: <Gauge className="w-3.5 h-3.5" />, Layers: <Layers className="w-3.5 h-3.5" />,
  Globe: <Globe className="w-3.5 h-3.5" />, Brain: <Brain className="w-3.5 h-3.5" />,
};

const ICONS_T1: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="w-5 h-5" />, Crown: <Crown className="w-6 h-6" />,
};

// ─── All possible trophies ────────────────────────────────────────────────────
const TIER1_ALL: Achievement[] = SPECIAL_BADGES.map(b => ({ ...b }));
const TIER2_ALL: Achievement[] = DOMAIN_BADGES.map(b => ({ ...b }));
const TIER3_ALL: Achievement[] = Object.values(AXIS_BADGES).map(b => ({ ...b, tier: "axis" as const }));

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const TOOLTIP_W = 176;
function Tooltip({ badge, visible, anchorRef }: { badge: Achievement | null; visible: boolean; anchorRef: React.RefObject<HTMLDivElement | null> }) {
  const [pos, setPos] = useState<{ left: number; bottom: number; arrowLeft: number } | null>(null);
  useEffect(() => {
    if (!visible || !anchorRef.current || !badge) { setPos(null); return; }
    const rect = anchorRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const vw = window.innerWidth;
    let left = cx - TOOLTIP_W / 2;
    let arrowLeft = TOOLTIP_W / 2;
    if (left < 10) { arrowLeft -= (10 - left); left = 10; }
    else if (left + TOOLTIP_W > vw - 10) { const s = (left + TOOLTIP_W) - (vw - 10); arrowLeft += s; left -= s; }
    setPos({ left, bottom: window.innerHeight - rect.top + 8, arrowLeft: Math.max(12, Math.min(TOOLTIP_W - 12, arrowLeft)) });
  }, [visible, anchorRef, badge]);
  if (!pos || !badge) return null;
  return createPortal(
    <div className="pointer-events-none transition-all duration-200" style={{ position: "fixed", bottom: pos.bottom + (visible ? 0 : -4), left: pos.left, width: TOOLTIP_W, opacity: visible ? 1 : 0, zIndex: 9999 }}>
      <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(14,14,18,0.98)", border: `1px solid ${badge.color}40`, boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}>
        <p className="font-bold text-[11px] mb-1" style={{ color: badge.color }}>{badge.name}</p>
        <p className="text-white/50 text-[10px] leading-snug">{badge.description}</p>
      </div>
      <div className="absolute w-2.5 h-2.5" style={{ bottom: -5, left: pos.arrowLeft, transform: "translateX(-50%) rotate(45deg)", background: "rgba(14,14,18,0.98)", borderRight: `1px solid ${badge.color}40`, borderBottom: `1px solid ${badge.color}40` }} />
    </div>,
    document.body
  );
}

// ─── Badge pill ───────────────────────────────────────────────────────────────
function BadgePill({ badge, earned, tier }: { badge: Achievement; earned: boolean; tier: 1 | 2 | 3 }) {
  const [tip, setTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const isT1 = tier === 1;
  const size = isT1 ? 44 : tier === 2 ? 36 : 30;
  const iconNode = isT1
    ? (ICONS_T1[badge.icon] ?? <Crown className="w-6 h-6" />)
    : (ICONS[badge.icon] ?? <Trophy className="w-3.5 h-3.5" />);

  if (!earned) {
    return (
      <div className="flex flex-col items-center gap-1 opacity-25 select-none">
        <div className="rounded-xl flex items-center justify-center" style={{ width: size, height: size, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Lock className="w-3 h-3 text-white/20" />
        </div>
        <p className="text-[7px] text-white/20 text-center font-medium leading-tight" style={{ maxWidth: size + 4, wordBreak: "break-word" }}>{badge.name}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1 cursor-pointer"
      onMouseEnter={() => { if (timer.current) clearTimeout(timer.current); setTip(true); }}
      onMouseLeave={() => { timer.current = setTimeout(() => setTip(false), 120); }}
      onClick={() => setTip(v => !v)}
    >
      <Tooltip badge={badge} visible={tip} anchorRef={ref} />
      <div
        className="relative rounded-xl flex items-center justify-center transition-transform duration-150 hover:scale-110"
        style={{
          width: size, height: size,
          background: isT1 ? `linear-gradient(145deg, ${badge.color}30 0%, ${badge.color}12 100%)` : `${badge.color}14`,
          border: `1.5px solid ${badge.color}${isT1 ? "55" : tier === 2 ? "35" : "28"}`,
          boxShadow: isT1 ? `0 0 20px ${badge.color}50, 0 0 8px ${badge.color}25` : tier === 2 ? `0 0 10px ${badge.color}30` : `0 0 6px ${badge.color}18`,
          color: badge.color,
        }}
      >
        {iconNode}
        {isT1 && <span className="absolute inset-0 rounded-xl animate-ping opacity-15" style={{ border: `2px solid ${badge.color}` }} />}
      </div>
      <p className="font-bold text-center leading-tight" style={{ color: badge.color, fontSize: "7.5px", maxWidth: size + 4, wordBreak: "break-word" }}>{badge.name}</p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function TrophyCabinet() {
  const [stored, setStored] = useState<ReturnType<typeof loadProfile>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then((profile) => { setStored(profile); setMounted(true); });
    });
  }, []);

  if (!mounted) return null;

  if (!stored) {
    return (
      <div className="rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.05) 0%, rgba(167,139,250,0.02) 100%)", border: "1px dashed rgba(167,139,250,0.18)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <Trophy className="w-5 h-5 text-violet-400/50" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
            <Lock className="w-2 h-2 text-violet-400/60" />
          </div>
        </div>
        <div>
          <p className="text-white/55 font-semibold text-sm">Trophies locked</p>
          <p className="text-white/28 text-xs mt-0.5">Complete your ACE assessment to start earning trophies</p>
        </div>
      </div>
    );
  }

  const achievements = getAchievements(stored.ace);
  const earnedIds = new Set(achievements.map(a => a.id));
  const totalEarned = earnedIds.size;
  const totalPossible = TIER1_ALL.length + TIER2_ALL.length + TIER3_ALL.length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(14,14,18,0) 60%)" }}>

      {/* Cabinet header */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/30">All Trophies</p>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: totalEarned > 0 ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.05)", color: totalEarned > 0 ? "#fbbf24" : "rgba(255,255,255,0.2)", border: totalEarned > 0 ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.08)" }}>
          {totalEarned} / {totalPossible}
        </span>
      </div>

      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>

        {/* Tier I */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: "#fbbf24" }}>Tier I</span>
            <span className="text-[8px] text-white/25 font-medium">— Apex. The absolute pinnacle.</span>
            {TIER1_ALL.filter(b => earnedIds.has(b.id)).length > 0 && (
              <span className="ml-auto text-[7.5px] font-bold px-1.5 py-px rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                {TIER1_ALL.filter(b => earnedIds.has(b.id)).length}/{TIER1_ALL.length}
              </span>
            )}
          </div>
          <div className="flex gap-5">
            {TIER1_ALL.map(b => <BadgePill key={b.id} badge={b} earned={earnedIds.has(b.id)} tier={1} />)}
          </div>
        </div>

        {/* Tier II */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: "#f97316" }}>Tier II</span>
            <span className="text-[8px] text-white/25 font-medium">— Domain mastery. Two axes maxed.</span>
            {TIER2_ALL.filter(b => earnedIds.has(b.id)).length > 0 && (
              <span className="ml-auto text-[7.5px] font-bold px-1.5 py-px rounded-full" style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)" }}>
                {TIER2_ALL.filter(b => earnedIds.has(b.id)).length}/{TIER2_ALL.length}
              </span>
            )}
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            {TIER2_ALL.map(b => <BadgePill key={b.id} badge={b} earned={earnedIds.has(b.id)} tier={2} />)}
          </div>
        </div>

        {/* Tier III */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: "#60a5fa" }}>Tier III</span>
            <span className="text-[8px] text-white/25 font-medium">— Elite axis. Single capability maxed.</span>
            {TIER3_ALL.filter(b => earnedIds.has(b.id)).length > 0 && (
              <span className="ml-auto text-[7.5px] font-bold px-1.5 py-px rounded-full" style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}>
                {TIER3_ALL.filter(b => earnedIds.has(b.id)).length}/{TIER3_ALL.length}
              </span>
            )}
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            {TIER3_ALL.map(b => <BadgePill key={b.id} badge={b} earned={earnedIds.has(b.id)} tier={3} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
