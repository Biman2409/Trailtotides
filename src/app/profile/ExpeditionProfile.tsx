"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp, Camera, Heart, GitCompare, Star, Trophy, CheckCircle2 } from "lucide-react";
import { getTier, getNextTier, getProgressPct, XP_TIERS, XP_LABELS, type XPAction } from "@/lib/xp";

interface XPEvent {
  action: string;
  adventure_slug: string;
  xp: number;
  created_at: string;
}

const ACTION_ICON: Record<string, React.ReactNode> = {
  ace_complete: <Star className="w-3 h-3" />,
  checkin:      <Trophy className="w-3 h-3" />,
  review:       <Star className="w-3 h-3" />,
  photo:        <Camera className="w-3 h-3" />,
  wishlist:     <Heart className="w-3 h-3" />,
  compare:      <GitCompare className="w-3 h-3" />,
  trip_log:     <CheckCircle2 className="w-3 h-3" />,
};

const STATS = [
  { action: "checkin"  as XPAction, label: "Check-ins", color: "#fbbf24" },
  { action: "trip_log" as XPAction, label: "Trips",     color: "#10b981" },
  { action: "review"   as XPAction, label: "Reviews",   color: "#f97316" },
  { action: "photo"    as XPAction, label: "Photos",    color: "#3b82f6" },
  { action: "wishlist" as XPAction, label: "Saved",     color: "#f43f5e" },
  { action: "compare"  as XPAction, label: "Compared",  color: "#a78bfa" },
];

export default function ExpeditionProfile() {
  const [xp, setXp] = useState<number>(0);
  const [events, setEvents] = useState<XPEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLadder, setShowLadder] = useState(false);

  useEffect(() => {
    fetch("/api/xp")
      .then(r => r.json())
      .then(d => { setXp(d.xp ?? 0); setEvents(d.events ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tier = getTier(xp);
  const next = getNextTier(xp);
  const pct  = getProgressPct(xp);
  const xpToNext = next ? next.minXP - xp : 0;
  const countOf = (action: XPAction) => events.filter(e => e.action === action).length;
  const recent = events.slice(0, 5);

  if (loading) {
    return (
      <div className="rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", height: 100 }} />
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}>

      {/* ── Header row: tier + XP + progress ── */}
      <div
        className="px-4 py-3.5 flex items-center gap-3"
        style={{ background: `linear-gradient(135deg, ${tier.color}10 0%, transparent 60%)`, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Tier badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base"
          style={{ background: `${tier.color}18`, border: `1.5px solid ${tier.color}38`, color: tier.color, boxShadow: `0 0 14px ${tier.color}28` }}
        >
          {tier.level}
        </div>

        {/* Name + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold leading-none" style={{ color: tier.color }}>{tier.name}</span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${tier.color}14`, color: `${tier.color}bb`, border: `1px solid ${tier.color}22` }}>
                T{tier.level}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black tabular-nums leading-none" style={{ color: tier.color }}>{xp.toLocaleString()}</span>
              <span className="text-[9px] text-white/30 font-medium">XP</span>
            </div>
          </div>
          {next ? (
            <div>
              <div className="h-1 rounded-full overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tier.color}, ${next.color})` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/25">→ <span style={{ color: next.color }}>{next.name}</span></span>
                <span className="text-[9px] font-semibold" style={{ color: tier.color }}>{xpToNext} XP</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" style={{ color: tier.color }} />
              <span className="text-[10px] font-bold" style={{ color: tier.color }}>Max tier reached</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="px-4 py-3 flex items-center gap-2 flex-wrap" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {STATS.map(({ action, label, color }) => (
          <div key={action} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5" style={{ background: `${color}0a`, border: `1px solid ${color}18` }}>
            <span style={{ color }} className="opacity-80">{ACTION_ICON[action]}</span>
            <span className="text-sm font-black tabular-nums leading-none" style={{ color }}>{countOf(action)}</span>
            <span className="text-[9px] text-white/30 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Tier ladder (collapsible) ── */}
      <button
        onClick={() => setShowLadder(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
        style={{ borderBottom: showLadder ? "1px solid rgba(255,255,255,0.05)" : "none" }}
      >
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-white/25">Tier Ladder</span>
        <svg
          className="w-3 h-3 transition-transform duration-200"
          style={{ color: "rgba(255,255,255,0.2)", transform: showLadder ? "rotate(180deg)" : "none" }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {showLadder && (
        <div className="px-4 pb-3 pt-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {XP_TIERS.map(t => {
              const reached = xp >= t.minXP;
              const isCurrent = t.level === tier.level;
              return (
                <div key={t.level} className="flex items-center gap-2 py-0.5">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-black shrink-0"
                    style={reached
                      ? { background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}30`, boxShadow: isCurrent ? `0 0 6px ${t.color}40` : "none" }
                      : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.06)" }
                    }
                  >
                    {t.level}
                  </div>
                  <span
                    className="text-[10px] font-semibold truncate flex-1"
                    style={{ color: isCurrent ? t.color : reached ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.15)" }}
                  >
                    {t.name}
                    {isCurrent && <span className="ml-1 text-[8px] opacity-60">◀</span>}
                  </span>
                  <span className="text-[8px] shrink-0 tabular-nums" style={{ color: reached ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)" }}>
                    {t.minXP >= 1000 ? `${(t.minXP / 1000).toFixed(t.minXP % 1000 === 0 ? 0 : 1)}k` : t.minXP}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent activity / empty ── */}
      {recent.length > 0 ? (
        <div className="px-4 py-3">
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-white/20 mb-2">Recent</p>
          <div className="space-y-1">
            {recent.map((ev, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47" }}>
                  {ACTION_ICON[ev.action] ?? <Zap className="w-2.5 h-2.5" />}
                </div>
                <span className="text-[10px] text-white/45 flex-1 truncate">
                  {XP_LABELS[ev.action as XPAction] ?? ev.action}
                  {ev.adventure_slug && ev.adventure_slug !== "" && (
                    <span className="text-white/20 ml-1">· {ev.adventure_slug.replace(/-/g, " ")}</span>
                  )}
                </span>
                <span className="text-[9px] font-bold shrink-0" style={{ color: "#ff7d47" }}>+{ev.xp}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-5 text-center">
          <Zap className="w-5 h-5 mx-auto mb-1.5 opacity-15 text-white" />
          <p className="text-white/25 text-xs">No XP yet — check in, review, or complete your ACE assessment.</p>
        </div>
      )}

    </div>
  );
}
