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

export default function ExpeditionProfile() {
  const [xp, setXp] = useState<number>(0);
  const [events, setEvents] = useState<XPEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/xp")
      .then(r => r.json())
      .then(d => { setXp(d.xp ?? 0); setEvents(d.events ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tier = getTier(xp);
  const next = getNextTier(xp);
  const pct = getProgressPct(xp);
  const xpToNext = next ? next.minXP - xp : 0;

  // Recent activity (last 8 events)
  const recent = events.slice(0, 8);

  // Stats
  const countOf = (action: XPAction) => events.filter(e => e.action === action).length;

  if (loading) {
    return (
      <div className="rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", height: 200 }} />
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}>

      {/* ── Top bar: tier badge + XP total ── */}
      <div
        className="px-5 py-4 flex items-center justify-between gap-4"
        style={{ background: `linear-gradient(135deg, ${tier.color}12 0%, transparent 60%)`, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          {/* Tier icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black text-lg"
            style={{ background: `${tier.color}18`, border: `1.5px solid ${tier.color}40`, color: tier.color, boxShadow: `0 0 16px ${tier.color}30` }}
          >
            {tier.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-bold text-base leading-none" style={{ color: tier.color }}>{tier.name}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${tier.color}15`, color: `${tier.color}cc`, border: `1px solid ${tier.color}25` }}>
                Tier {tier.level}
              </span>
            </div>
            <p className="text-white/35 text-[11px] mt-0.5">{tier.description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black leading-none" style={{ color: tier.color }}>{xp.toLocaleString()}</p>
          <p className="text-white/30 text-[10px] mt-0.5 font-medium">XP earned</p>
        </div>
      </div>

      {/* ── Progress bar to next tier ── */}
      <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {next ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/30 font-medium">Progress to <span style={{ color: next.color }}>{next.name}</span></span>
              <span className="text-[10px] font-bold" style={{ color: tier.color }}>{xpToNext} XP to go</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tier.color}, ${next.color})` }}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: tier.color }} />
            <p className="text-[11px] font-bold" style={{ color: tier.color }}>Max tier reached — Immortal Explorer</p>
          </div>
        )}
      </div>

      {/* ── Tier ladder + stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>

        {/* Tier ladder */}
        <div className="px-5 py-4" style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-white/25 mb-3">All Tiers</p>
          <div className="space-y-1.5">
            {XP_TIERS.map(t => {
              const reached = xp >= t.minXP;
              const isCurrent = t.level === tier.level;
              return (
                <div key={t.level} className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0 transition-all"
                    style={reached
                      ? { background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}35`, boxShadow: isCurrent ? `0 0 8px ${t.color}40` : "none" }
                      : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.07)" }
                    }
                  >
                    {t.level}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <span
                      className="text-[11px] font-semibold truncate transition-colors"
                      style={{ color: isCurrent ? t.color : reached ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)" }}
                    >
                      {t.name}
                      {isCurrent && <span className="ml-1.5 text-[8px] font-bold opacity-70">← you</span>}
                    </span>
                    <span className="text-[9px] shrink-0" style={{ color: reached ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)" }}>
                      {t.minXP.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 py-4">
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-white/25 mb-3">Your Activity</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { action: "checkin",  label: "Check-ins",  color: "#fbbf24" },
              { action: "trip_log", label: "Trips done",  color: "#10b981" },
              { action: "review",   label: "Reviews",     color: "#f97316" },
              { action: "photo",    label: "Photos",      color: "#3b82f6" },
              { action: "wishlist", label: "Wishlisted",  color: "#f43f5e" },
              { action: "compare",  label: "Compared",    color: "#a78bfa" },
            ] as { action: XPAction; label: string; color: string }[]).map(({ action, label, color }) => (
              <div key={action} className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span style={{ color }}>{ACTION_ICON[action]}</span>
                  <span className="text-[9px] text-white/30 font-medium uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-xl font-black leading-none" style={{ color }}>{countOf(action)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent activity feed ── */}
      {recent.length > 0 && (
        <div className="px-5 py-4">
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-white/25 mb-3">Recent Activity</p>
          <div className="space-y-1.5">
            {recent.map((ev, i) => {
              const t = getTier(0); // just for structure
              void t;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47" }}>
                    {ACTION_ICON[ev.action] ?? <Zap className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-white/55 font-medium">{XP_LABELS[ev.action as XPAction] ?? ev.action}</span>
                    {ev.adventure_slug && ev.adventure_slug !== "" && (
                      <span className="text-[10px] text-white/25 ml-1.5 truncate">· {ev.adventure_slug.replace(/-/g, " ")}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold shrink-0" style={{ color: "#ff7d47" }}>+{ev.xp}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {events.length === 0 && (
        <div className="px-5 py-8 text-center">
          <Zap className="w-6 h-6 mx-auto mb-2 opacity-20 text-white" />
          <p className="text-white/30 text-sm">No XP yet.</p>
          <p className="text-white/20 text-xs mt-1">Check in, write a review, or complete your ACE assessment to start earning.</p>
        </div>
      )}

    </div>
  );
}
