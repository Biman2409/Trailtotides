"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp, Camera, Heart, GitCompare, Star, CheckCircle2, ChevronDown } from "lucide-react";
import { getTier, getNextTier, getProgressPct, XP_TIERS, XP_LABELS, type XPAction } from "@/lib/xp";

interface XPEvent {
  action: string;
  adventure_slug: string;
  xp: number;
  created_at: string;
}

const ACTION_ICON: Record<string, React.ReactNode> = {
  ace_complete: <Star className="w-3 h-3" />,
  review:       <Star className="w-3 h-3" />,
  photo:        <Camera className="w-3 h-3" />,
  wishlist:     <Heart className="w-3 h-3" />,
  compare:      <GitCompare className="w-3 h-3" />,
  trip_log:     <CheckCircle2 className="w-3 h-3" />,
};

const STATS = [
  { action: "trip_log"     as XPAction, label: "Completed", color: "#10b981" },
  { action: "review"       as XPAction, label: "Reviews",   color: "#f97316" },
  { action: "photo"        as XPAction, label: "Photos",    color: "#3b82f6" },
  { action: "wishlist"     as XPAction, label: "Saved",     color: "#f43f5e" },
  { action: "compare"      as XPAction, label: "Compared",  color: "#a78bfa" },
  { action: "ace_complete" as XPAction, label: "ACE",       color: "#fbbf24" },
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

  const tier    = getTier(xp);
  const next    = getNextTier(xp);
  const pct     = getProgressPct(xp);
  const xpToNext = next ? next.minXP - xp : 0;
  const countOf  = (action: XPAction) => events.filter(e => e.action === action).length;
  const recent   = events.slice(0, 4);

  if (loading) {
    return <div className="rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", height: 80 }} />;
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.012)" }}>

      {/* ── Section label ── */}
      <div className="px-4 pt-3 pb-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/25">Expedition Profile</p>
      </div>

      {/* ── Tier row ── */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: `linear-gradient(135deg, ${tier.color}0e 0%, transparent 55%)`, borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-black text-sm"
          style={{ background: `${tier.color}16`, border: `1.5px solid ${tier.color}35`, color: tier.color, boxShadow: `0 0 12px ${tier.color}22` }}
        >
          {tier.level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold leading-none" style={{ color: tier.color }}>{tier.name}</span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${tier.color}12`, color: `${tier.color}99`, border: `1px solid ${tier.color}20` }}>T{tier.level}</span>
            </div>
            <span className="text-sm font-black tabular-nums" style={{ color: tier.color }}>{xp.toLocaleString()} <span className="text-[9px] font-medium text-white/25">XP</span></span>
          </div>
          {next ? (
            <>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tier.color}, ${next.color})` }} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-white/22">→ <span style={{ color: `${next.color}99` }}>{next.name}</span></span>
                <span className="text-[9px]" style={{ color: `${tier.color}80` }}>{xpToNext} to go</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-2.5 h-2.5" style={{ color: tier.color }} />
              <span className="text-[9px] font-semibold" style={{ color: tier.color }}>Max tier reached</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="px-4 py-2.5 flex items-center gap-3 flex-wrap" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {STATS.map(({ action, label, color }) => (
          <div key={action} className="flex items-center gap-1">
            <span className="text-xs font-black tabular-nums" style={{ color }}>{countOf(action)}</span>
            <span className="text-[9px] text-white/25">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Tier ladder (collapsible) ── */}
      <button
        onClick={() => setShowLadder(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/[0.015] transition-colors"
        style={{ borderBottom: showLadder ? "1px solid rgba(255,255,255,0.05)" : "none" }}
      >
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-white/20">Tier Ladder</span>
        <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ color: "rgba(255,255,255,0.18)", transform: showLadder ? "rotate(180deg)" : "none" }} />
      </button>

      {showLadder && (
        <div className="px-4 pb-3 pt-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {XP_TIERS.map(t => {
              const reached   = xp >= t.minXP;
              const isCurrent = t.level === tier.level;
              return (
                <div key={t.level} className="flex items-center gap-1.5 py-[3px]">
                  <div
                    className="w-3.5 h-3.5 rounded flex items-center justify-center text-[7px] font-black shrink-0"
                    style={reached
                      ? { background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}28`, boxShadow: isCurrent ? `0 0 5px ${t.color}35` : "none" }
                      : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.06)" }
                    }
                  >{t.level}</div>
                  <span className="text-[10px] font-medium truncate flex-1" style={{ color: isCurrent ? t.color : reached ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)" }}>
                    {t.name}{isCurrent && <span className="ml-1 opacity-50 text-[8px]">◀</span>}
                  </span>
                  <span className="text-[8px] tabular-nums shrink-0" style={{ color: "rgba(255,255,255,0.1)" }}>
                    {t.minXP >= 1000 ? `${(t.minXP / 1000).toFixed(t.minXP % 1000 === 0 ? 0 : 1)}k` : t.minXP}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent / empty ── */}
      {recent.length > 0 ? (
        <div className="px-4 py-2.5">
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-white/18 mb-1.5">Recent</p>
          <div className="space-y-1">
            {recent.map((ev, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: "#ff7d47" }} className="opacity-60">{ACTION_ICON[ev.action] ?? <Zap className="w-3 h-3" />}</span>
                <span className="text-[10px] text-white/35 flex-1 truncate">
                  {XP_LABELS[ev.action as XPAction] ?? ev.action}
                  {ev.adventure_slug && <span className="text-white/18 ml-1">· {ev.adventure_slug.replace(/-/g, " ")}</span>}
                </span>
                <span className="text-[9px] font-bold shrink-0" style={{ color: "#ff7d47" }}>+{ev.xp}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 text-center">
          <p className="text-white/20 text-[11px]">No XP yet — complete adventures, write reviews, or finish your ACE assessment.</p>
        </div>
      )}

    </div>
  );
}
