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

// ─── Icon maps by size ────────────────────────────────────────────────────────
const ICON: Record<string, (sz: number) => React.ReactNode> = {
  Flame:    sz => <Flame    style={{ width: sz, height: sz }} />,
  Zap:      sz => <Zap      style={{ width: sz, height: sz }} />,
  Dumbbell: sz => <Dumbbell style={{ width: sz, height: sz }} />,
  Compass:  sz => <Compass  style={{ width: sz, height: sz }} />,
  Waves:    sz => <Waves    style={{ width: sz, height: sz }} />,
  Mountain: sz => <Mountain style={{ width: sz, height: sz }} />,
  Shield:   sz => <Shield   style={{ width: sz, height: sz }} />,
  Wind:     sz => <Wind     style={{ width: sz, height: sz }} />,
  Trophy:   sz => <Trophy   style={{ width: sz, height: sz }} />,
  Crown:    sz => <Crown    style={{ width: sz, height: sz }} />,
  Gauge:    sz => <Gauge    style={{ width: sz, height: sz }} />,
  Layers:   sz => <Layers   style={{ width: sz, height: sz }} />,
  Globe:    sz => <Globe    style={{ width: sz, height: sz }} />,
  Brain:    sz => <Brain    style={{ width: sz, height: sz }} />,
};

const TIER1_ALL: Achievement[] = SPECIAL_BADGES.map(b => ({ ...b }));
const TIER2_ALL: Achievement[] = DOMAIN_BADGES.map(b => ({ ...b }));
const TIER3_ALL: Achievement[] = Object.values(AXIS_BADGES).map(b => ({ ...b, tier: "axis" as const }));

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const TT_W = 172;

function Tooltip({ badge, visible, anchorRef }: {
  badge: Achievement | null;
  visible: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<{ left: number; bottom: number; arrowLeft: number } | null>(null);

  useEffect(() => {
    if (!visible || !anchorRef.current || !badge) { setPos(null); return; }
    const r = anchorRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const vw = window.innerWidth;
    let left = cx - TT_W / 2;
    let arrowLeft = TT_W / 2;
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

// ─── Single trophy cell ───────────────────────────────────────────────────────
function Trophy_({ badge, earned, boxSize, iconSize }: {
  badge: Achievement;
  earned: boolean;
  boxSize: number;
  iconSize: number;
}) {
  const [tip, setTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isSpecial = badge.tier === "special";

  const startClose = () => { timer.current = setTimeout(() => setTip(false), 120); };
  const cancelClose = () => { if (timer.current) clearTimeout(timer.current); };

  if (!earned) {
    return (
      <div className="flex flex-col items-center gap-1 select-none" style={{ opacity: 0.22 }}>
        <div className="rounded-xl flex items-center justify-center" style={{ width: boxSize, height: boxSize, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Lock style={{ width: iconSize - 4, height: iconSize - 4 }} className="text-white/25" />
        </div>
        <p className="text-center font-medium text-white/20 leading-tight" style={{ fontSize: 7, maxWidth: boxSize + 6, wordBreak: "break-word" }}>{badge.name}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1 cursor-pointer"
      onMouseEnter={() => { cancelClose(); setTip(true); }}
      onMouseLeave={startClose}
      onClick={() => setTip(v => !v)}
    >
      <Tooltip badge={badge} visible={tip} anchorRef={ref} />
      <div
        className="relative rounded-xl flex items-center justify-center transition-transform duration-150 hover:scale-110"
        style={{
          width: boxSize, height: boxSize,
          background: isSpecial ? `linear-gradient(145deg, ${badge.color}30 0%, ${badge.color}12 100%)` : `${badge.color}14`,
          border: `1.5px solid ${badge.color}${isSpecial ? "55" : "30"}`,
          boxShadow: isSpecial ? `0 0 18px ${badge.color}50, 0 0 6px ${badge.color}25` : `0 0 8px ${badge.color}20`,
          color: badge.color,
        }}
      >
        {(ICON[badge.icon] ?? ICON["Trophy"])(iconSize)}
        {isSpecial && <span className="absolute inset-0 rounded-xl animate-ping opacity-15" style={{ border: `2px solid ${badge.color}` }} />}
      </div>
      <p className="font-bold text-center leading-tight" style={{ color: badge.color, fontSize: 7.5, maxWidth: boxSize + 6, wordBreak: "break-word" }}>{badge.name}</p>
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
      <div className="rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.05) 0%, rgba(167,139,250,0.02) 100%)", border: "1px dashed rgba(167,139,250,0.18)" }}>
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

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(160deg, rgba(255,255,255,0.025) 0%, rgba(14,14,18,0) 60%)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/25">All Trophies</p>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: totalEarned > 0 ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.05)", color: totalEarned > 0 ? "#fbbf24" : "rgba(255,255,255,0.2)", border: totalEarned > 0 ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.07)" }}>
          {totalEarned} / {totalPossible}
        </span>
      </div>

      {/* Row 1: Tier I + Tier II combined */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-start gap-0">

          {/* Tier I block */}
          <div className="shrink-0">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: "#fbbf24" }}>I</span>
              <span className="text-[8px] text-white/22">Apex</span>
              {TIER1_ALL.filter(b => earnedIds.has(b.id)).length > 0 && (
                <span className="text-[7px] font-bold px-1.5 py-px rounded-full" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                  {TIER1_ALL.filter(b => earnedIds.has(b.id)).length}/{TIER1_ALL.length}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {TIER1_ALL.map(b => <Trophy_ key={b.id} badge={b} earned={earnedIds.has(b.id)} boxSize={46} iconSize={20} />)}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 self-stretch w-px shrink-0" style={{ background: "rgba(255,255,255,0.07)" }} />

          {/* Tier II block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: "#f97316" }}>II</span>
              <span className="text-[8px] text-white/22">Domain Mastery</span>
              {TIER2_ALL.filter(b => earnedIds.has(b.id)).length > 0 && (
                <span className="text-[7px] font-bold px-1.5 py-px rounded-full" style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", border: "1px solid rgba(249,115,22,0.2)" }}>
                  {TIER2_ALL.filter(b => earnedIds.has(b.id)).length}/{TIER2_ALL.length}
                </span>
              )}
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
              {TIER2_ALL.map(b => <Trophy_ key={b.id} badge={b} earned={earnedIds.has(b.id)} boxSize={38} iconSize={15} />)}
            </div>
          </div>

        </div>
      </div>

      {/* Row 2: Tier III */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: "#60a5fa" }}>III</span>
          <span className="text-[8px] text-white/22">Elite Axis</span>
          {TIER3_ALL.filter(b => earnedIds.has(b.id)).length > 0 && (
            <span className="text-[7px] font-bold px-1.5 py-px rounded-full" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
              {TIER3_ALL.filter(b => earnedIds.has(b.id)).length}/{TIER3_ALL.length}
            </span>
          )}
        </div>
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}>
          {TIER3_ALL.map(b => <Trophy_ key={b.id} badge={b} earned={earnedIds.has(b.id)} boxSize={34} iconSize={13} />)}
        </div>
      </div>

    </div>
  );
}
