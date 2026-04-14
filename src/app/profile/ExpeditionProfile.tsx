"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp, ChevronDown, Heart, Camera, GitCompare, Star, CheckCircle2 } from "lucide-react";
import {
  getTier, getNextTier, getProgressPct, XP_TIERS,
  isOver9000, OVER_9000_COLOR,
  type XPAction,
} from "@/lib/xp";
import { adventures } from "@/lib/data";

interface XPEvent {
  action: string;
  adventure_slug: string;
  xp: number;
  created_at: string;
}

const ACTION_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  trip_log:     { icon: <CheckCircle2 className="w-3 h-3" />, label: "Completed",   color: "#10b981" },
  wishlist:     { icon: <Heart        className="w-3 h-3" />, label: "Wishlisted",  color: "#f43f5e" },
  review:       { icon: <Star         className="w-3 h-3" />, label: "Reviewed",    color: "#f97316" },
  photo:        { icon: <Camera       className="w-3 h-3" />, label: "Photo",       color: "#3b82f6" },
  compare:      { icon: <GitCompare   className="w-3 h-3" />, label: "Compared",    color: "#a78bfa" },
  ace_complete: { icon: <Zap          className="w-3 h-3" />, label: "ACE done",    color: "#fbbf24" },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export default function ExpeditionProfile() {
  const [xp, setXp]       = useState<number>(0);
  const [events, setEvents] = useState<XPEvent[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showLadder, setShowLadder] = useState(false);
  const [rank, setRank]   = useState<number | null>(null);
  const [rankTotal, setRankTotal] = useState<number | null>(null);

  const fetchXP = () => {
    fetch("/api/xp")
      .then(r => r.json())
      .then(d => { setXp(d.xp ?? 0); setEvents(d.events ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchXP();
    window.addEventListener("xp:updated", fetchXP);
    return () => window.removeEventListener("xp:updated", fetchXP);
  }, []);

  useEffect(() => {
    if (xp >= 9000) {
      fetch("/api/xp/rank").then(r => r.json())
        .then(d => { setRank(d.rank); setRankTotal(d.total); }).catch(() => {});
    }
  }, [xp]);

  const tier      = getTier(xp);
  const next      = getNextTier(xp);
  const pct       = getProgressPct(xp);
  const xpToNext  = next ? next.minXP - xp : 0;
  const over9k    = isOver9000(xp);
  const accentColor = over9k ? OVER_9000_COLOR : tier.color;
  const countOf   = (action: XPAction) => events.filter(e => e.action === action).length;

  // Recent: dedupe by action+slug, newest first, top 5
  const seen = new Set<string>();
  const recent = events.filter(ev => {
    const key = `${ev.action}::${ev.adventure_slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);

  if (loading) {
    return <div className="rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", height: 140 }} />;
  }

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ border: `1px solid ${accentColor}20`, background: "rgba(10,10,14,0.7)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 20% 0%, ${accentColor}0a 0%, transparent 60%)` }} />

      {/* ── Header ── */}
      <div className="relative px-5 pt-4 pb-3 flex items-center justify-between gap-4" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl shrink-0"
            style={{ background: `${accentColor}12`, border: `1.5px solid ${accentColor}35`, color: accentColor, boxShadow: `0 0 18px ${accentColor}22` }}>
            {tier.level}
          </div>
          <div>
            <p className="text-[8.5px] uppercase tracking-[0.22em] font-bold mb-0.5" style={{ color: `${accentColor}60` }}>Expedition Tier</p>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg leading-none" style={{ color: accentColor }}>{tier.name}</h3>
              {over9k && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black leading-none"
                  style={{ background: `${OVER_9000_COLOR}18`, color: OVER_9000_COLOR, border: `1px solid ${OVER_9000_COLOR}35` }}>
                  <Zap className="w-2 h-2" /> 9000+
                </span>
              )}
            </div>
            <p className="text-white/25 text-[10px] mt-0.5">{tier.description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[22px] font-black tabular-nums leading-none" style={{ color: accentColor }}>{xp.toLocaleString()}</p>
          <p className="text-white/22 text-[8.5px] mt-0.5 font-semibold tracking-widest uppercase">XP</p>
          {over9k && rank !== null && (
            <p className="text-[9px] font-bold mt-0.5" style={{ color: OVER_9000_COLOR }}>#{rank} of {rankTotal}</p>
          )}
        </div>
      </div>

      {/* ── Progress bar + tier ladder ── */}
      <div className="relative px-5 pt-3" style={{ borderBottom: showLadder ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
        {next ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9.5px] text-white/28">
                Next: <span className="font-bold" style={{ color: next.color }}>{next.name}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9.5px] font-bold tabular-nums" style={{ color: `${accentColor}90` }}>{xpToNext.toLocaleString()} to go</span>
                <button onClick={() => setShowLadder(v => !v)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md transition-all hover:bg-white/[0.06]"
                  style={{ color: showLadder ? accentColor : "rgba(255,255,255,0.2)" }}>
                  <span className="text-[8px] font-bold tracking-wide">tiers</span>
                  <ChevronDown className="w-2.5 h-2.5 transition-transform duration-200"
                    style={{ transform: showLadder ? "rotate(180deg)" : "none" }} />
                </button>
              </div>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tier.color}, ${next.color})`, boxShadow: `0 0 6px ${tier.color}50` }} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" style={{ color: OVER_9000_COLOR }} />
              <span className="text-[9.5px] font-bold" style={{ color: OVER_9000_COLOR }}>Uncapped — keep climbing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] font-bold tabular-nums" style={{ color: OVER_9000_COLOR }}>+{(xp - 9000).toLocaleString()} beyond 9k</span>
              <button onClick={() => setShowLadder(v => !v)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md transition-all hover:bg-white/[0.06]"
                style={{ color: showLadder ? OVER_9000_COLOR : "rgba(255,255,255,0.2)" }}>
                <span className="text-[8px] font-bold tracking-wide">tiers</span>
                <ChevronDown className="w-2.5 h-2.5 transition-transform duration-200"
                  style={{ transform: showLadder ? "rotate(180deg)" : "none" }} />
              </button>
            </div>
          </div>
        )}

        {/* Tier ladder — expands below the bar */}
        {showLadder && (
          <div className="pb-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "12px" }}>
            {/* Horizontal milestone track */}
            <div className="relative flex items-center justify-between mb-4">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              {(() => {
                const idx = XP_TIERS.findIndex(t => t.level === tier.level);
                const pctFill = over9k ? 100 : (idx / (XP_TIERS.length - 1)) * 100;
                return (
                  <div className="absolute top-1/2 -translate-y-1/2 h-px left-0 transition-all duration-700"
                    style={{ width: `${pctFill}%`, background: `linear-gradient(90deg, ${XP_TIERS[0].color}, ${tier.color})` }} />
                );
              })()}
              {XP_TIERS.map(t => {
                const reached   = xp >= t.minXP;
                const isCurrent = t.level === tier.level;
                return (
                  <div key={t.level} className="relative z-10 flex flex-col items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black transition-all"
                      style={isCurrent
                        ? { background: t.color, color: "#000", boxShadow: `0 0 12px ${t.color}70, 0 0 0 3px ${t.color}25` }
                        : reached
                          ? { background: `${t.color}22`, color: t.color, border: `1.5px solid ${t.color}50` }
                          : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.08)" }
                      }>
                      {t.level}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Current + next */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${tier.color}18`, border: `1.5px solid ${tier.color}40` }}>
                  <span className="text-[10px] font-black" style={{ color: tier.color }}>{tier.level}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold leading-none" style={{ color: tier.color }}>{tier.name}</p>
                  <p className="text-[9px] text-white/28 mt-0.5 truncate">{tier.description}</p>
                </div>
              </div>
              {next && (
                <div className="shrink-0 text-right">
                  <p className="text-[8px] text-white/18 leading-none mb-0.5 uppercase tracking-wide">Next</p>
                  <p className="text-[11px] font-bold leading-none" style={{ color: next.color }}>{next.name}</p>
                  <p className="text-[8.5px] tabular-nums mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>{next.minXP.toLocaleString()} XP</p>
                </div>
              )}
              {over9k && (
                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8.5px] font-black"
                  style={{ background: `${OVER_9000_COLOR}15`, color: OVER_9000_COLOR, border: `1px solid ${OVER_9000_COLOR}30` }}>
                  <Zap className="w-2.5 h-2.5" /> It&apos;s Over 9000!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bottom border when ladder is closed */}
        {!showLadder && <div className="pb-3" />}
      </div>

      {/* ── Stats strip ── */}
      <div className="relative grid grid-cols-5 text-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { value: countOf("trip_log"), label: "Done",      color: "#10b981" },
          { value: countOf("review"),   label: "Reviews",   color: "#f97316" },
          { value: countOf("photo"),    label: "Photos",    color: "#3b82f6" },
          { value: countOf("wishlist"), label: "Saved",     color: "#f43f5e" },
          { value: countOf("compare"),  label: "Compared",  color: "#a78bfa" },
        ].map(({ value, label, color }, i, arr) => (
          <div key={label} className="flex flex-col items-center justify-center py-2.5 gap-0.5"
            style={i < arr.length - 1 ? { borderRight: "1px solid rgba(255,255,255,0.05)" } : {}}>
            <span className="text-[15px] font-black tabular-nums leading-none" style={{ color: value > 0 ? color : "rgba(255,255,255,0.1)" }}>{value}</span>
            <span className="text-[7px] uppercase tracking-wide font-semibold" style={{ color: "rgba(255,255,255,0.22)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div className="relative px-5 py-3">
        <p className="text-[8.5px] uppercase tracking-[0.2em] font-bold text-white/18 mb-3">Recent Activity</p>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center py-4 gap-2">
            <Zap className="w-5 h-5 opacity-10 text-white" />
            <p className="text-white/20 text-[10px] text-center leading-relaxed">
              No activity yet — complete adventures,<br />save to wishlist, or write a review.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {recent.map((ev, i) => {
              const meta   = ACTION_META[ev.action];
              const adv    = ev.adventure_slug ? adventures.find(a => a.slug === ev.adventure_slug) : null;
              const color  = meta?.color ?? accentColor;
              return (
                <div key={i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.03]">
                  {/* Icon badge */}
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: `${color}14`, color }}>
                    {meta?.icon ?? <Zap className="w-3 h-3" />}
                  </div>
                  {/* Label + adventure */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10.5px] font-semibold leading-none" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {adv ? adv.name : (meta?.label ?? ev.action)}
                    </p>
                    <p className="text-[9px] mt-0.5 leading-none" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {meta?.label ?? ev.action}
                      {ev.created_at && <span className="ml-1.5">{relativeTime(ev.created_at)}</span>}
                    </p>
                  </div>
                  {/* XP */}
                  <span className="text-[10px] font-black tabular-nums shrink-0" style={{ color }}>+{ev.xp}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
