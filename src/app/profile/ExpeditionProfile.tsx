"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp, ChevronDown, Heart, Camera, GitCompare, Star, CheckCircle2 } from "lucide-react";
import {
  getTier, getNextTier, getProgressPct, XP_TIERS, XP_LABELS,
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

const ACTION_ICON: Record<string, React.ReactNode> = {
  ace_complete: <Star         className="w-3 h-3" />,
  review:       <Star         className="w-3 h-3" />,
  photo:        <Camera       className="w-3 h-3" />,
  wishlist:     <Heart        className="w-3 h-3" />,
  compare:      <GitCompare   className="w-3 h-3" />,
  trip_log:     <CheckCircle2 className="w-3 h-3" />,
};

export default function ExpeditionProfile() {
  const [xp, setXp]         = useState<number>(0);
  const [events, setEvents] = useState<XPEvent[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showLadder, setShowLadder]     = useState(false);
  const [rank, setRank]     = useState<number | null>(null);
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

  // Fetch rank only when Over 9000
  useEffect(() => {
    if (xp >= 9000) {
      fetch("/api/xp/rank")
        .then(r => r.json())
        .then(d => { setRank(d.rank); setRankTotal(d.total); })
        .catch(() => {});
    }
  }, [xp]);

  const tier     = getTier(xp);
  const next     = getNextTier(xp);
  const pct      = getProgressPct(xp);
  const xpToNext = next ? next.minXP - xp : 0;
  const over9k   = isOver9000(xp);
  const countOf  = (action: XPAction) => events.filter(e => e.action === action).length;

  // ── Expedition stats derived from completed adventures ──────────────────────
  const completedSlugs = [...new Set(events.filter(e => e.action === "trip_log").map(e => e.adventure_slug))];
  const completedAdvs  = completedSlugs.map(s => adventures.find(a => a.slug === s)).filter(Boolean) as typeof adventures;
  const adventureCount = completedSlugs.length;
  const typeCount      = new Set(completedAdvs.map(a => a.type)).size;
  const stateCount     = new Set(completedAdvs.flatMap(a => a.state.split(/\s*[/,]\s*/).map(s => s.trim()))).size;
  const daysInWild     = completedAdvs.reduce((sum, a) => {
    const n = parseInt(a.durationDays ?? "0", 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const EXPEDITION_STATS = [
    { value: adventureCount, label: "Adventures",       color: "#f97316" },
    { value: typeCount,      label: "Types",            color: "#22d3ee" },
    { value: stateCount,     label: "States",           color: "#a78bfa" },
    { value: daysInWild,     label: "Days in the Wild", color: "#10b981" },
  ];

  // Deduplicate: keep only the latest event per action+slug combo, then show 4 most recent
  const seen = new Set<string>();
  const recent = events.filter(ev => {
    const key = `${ev.action}::${ev.adventure_slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);

  // When Over 9000, accent everything with the gold colour
  const accentColor = over9k ? OVER_9000_COLOR : tier.color;

  if (loading) {
    return <div className="rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", height: 120 }} />;
  }

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ border: `1px solid ${accentColor}22`, background: "rgba(10,10,14,0.6)" }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 30% 0%, ${accentColor}0e 0%, transparent 65%)` }} />

      {/* ── Header ── */}
      <div className="relative px-5 pt-4 pb-3 flex items-start justify-between gap-4" style={{ borderBottom: `1px solid ${accentColor}14` }}>
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] font-bold mb-1" style={{ color: `${accentColor}70` }}>Expedition Tier</p>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
              style={{ background: `${accentColor}14`, border: `1.5px solid ${accentColor}40`, color: accentColor, boxShadow: `0 0 20px ${accentColor}28, inset 0 1px 0 ${accentColor}20` }}
            >
              {tier.level}
            </div>
            <div>
              {/* Tier name row */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-black text-xl leading-none tracking-tight" style={{ color: accentColor }}>
                  {tier.name}
                </h3>
                {/* Over 9000 Club badge */}
                {over9k && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide leading-none"
                    style={{ background: `${OVER_9000_COLOR}18`, color: OVER_9000_COLOR, border: `1px solid ${OVER_9000_COLOR}40`, boxShadow: `0 0 8px ${OVER_9000_COLOR}30` }}
                  >
                    <Zap className="w-2.5 h-2.5" />
                    It&apos;s Over 9000 Club
                  </span>
                )}
              </div>
              <p className="text-white/30 text-[10px] mt-0.5">{tier.description}</p>
            </div>
          </div>
        </div>

        {/* XP + rank */}
        <div className="text-right shrink-0 pt-0.5">
          <p className="text-2xl font-black tabular-nums leading-none" style={{ color: accentColor }}>{xp.toLocaleString()}</p>
          <p className="text-white/25 text-[9px] mt-0.5 font-medium tracking-wide">XP TOTAL</p>
          {over9k && rank !== null && (
            <p className="text-[10px] font-bold mt-1" style={{ color: OVER_9000_COLOR }}>
              #{rank} <span className="text-white/25 font-normal">of {rankTotal}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="relative px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {next ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/30">Progress to <span className="font-semibold" style={{ color: next.color }}>{next.name}</span></span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: accentColor }}>{xpToNext} XP to go</span>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tier.color}, ${next.color})`, boxShadow: `0 0 8px ${tier.color}60` }}
              />
            </div>
          </>
        ) : (
          /* Over 9000 — show XP beyond threshold */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: OVER_9000_COLOR }} />
              <span className="text-[10px] font-bold" style={{ color: OVER_9000_COLOR }}>XP is uncapped — keep climbing</span>
            </div>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: OVER_9000_COLOR }}>
              +{(xp - 9000).toLocaleString()} beyond 9k
            </span>
          </div>
        )}
      </div>

      {/* ── Stats strip ── */}
      {(() => {
        const STATS = [
          { value: countOf("trip_log"),     label: "Completed", color: "#10b981" },
          { value: countOf("review"),       label: "Reviews",   color: "#f97316" },
          { value: countOf("photo"),        label: "Photos",    color: "#3b82f6" },
          { value: countOf("wishlist") > 0 ? 1 : 0, label: "Saved",     color: "#f43f5e" },
          { value: countOf("compare") > 0 ? 1 : 0,  label: "Compared",  color: "#a78bfa" },
        ];
        return (
          <div className="relative grid grid-cols-5 divide-x" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.05)" }}>
            {STATS.map(({ value, label, color }) => (
              <div key={label} className="flex flex-col items-center justify-center py-3 px-1 gap-0.5">
                <span className="text-base font-black tabular-nums leading-none" style={{ color: value > 0 ? color : "rgba(255,255,255,0.12)" }}>
                  {value}
                </span>
                <span className="text-[7.5px] font-semibold text-center leading-tight uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Tier ladder (collapsible) ── */}
      <button
        onClick={() => setShowLadder(v => !v)}
        className="relative w-full flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.02] transition-colors"
        style={{ borderBottom: showLadder ? "1px solid rgba(255,255,255,0.05)" : "none" }}
      >
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/20">Tier Ladder</span>
        <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ color: "rgba(255,255,255,0.18)", transform: showLadder ? "rotate(180deg)" : "none" }} />
      </button>

      {showLadder && (
        <div className="relative px-4 pb-3 pt-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="relative">
            {/* Vertical spine — sits to the left of nodes, not through them */}
            <div className="absolute top-[22px] bottom-[22px] w-px" style={{ left: "14px", background: "rgba(255,255,255,0.07)" }} />

            <div className="space-y-0.5">
              {XP_TIERS.map(t => {
                const reached   = xp >= t.minXP;
                const isCurrent = t.level === tier.level;
                return (
                  <div key={t.level} className="relative flex items-center gap-3 px-1 py-1.5 rounded-lg transition-colors" style={isCurrent ? { background: `${t.color}0d` } : {}}>
                    {/* Node — z-10 sits above spine */}
                    <div
                      className="relative z-10 w-[26px] h-[26px] shrink-0 rounded-lg flex items-center justify-center text-[9px] font-black"
                      style={reached
                        ? { background: `${t.color}20`, color: t.color, border: `1.5px solid ${t.color}${isCurrent ? "70" : "45"}`, boxShadow: isCurrent ? `0 0 10px ${t.color}40` : `0 0 6px ${t.color}20` }
                        : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(255,255,255,0.07)" }
                      }
                    >{t.level}</div>

                    {/* Name */}
                    <span className="flex-1 text-[11px] font-semibold leading-none" style={{ color: isCurrent ? t.color : reached ? t.color + "99" : "rgba(255,255,255,0.14)" }}>
                      {t.name}
                    </span>

                    {/* Current pill */}
                    {isCurrent && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none" style={{ background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}30` }}>
                        YOU
                      </span>
                    )}

                    {/* XP threshold — full number */}
                    <span className="text-[9px] tabular-nums font-medium shrink-0" style={{ color: reached ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)" }}>
                      {t.minXP.toLocaleString()}
                    </span>
                  </div>
                );
              })}

              {/* Over 9000 Club row */}
              <div className="relative flex items-center gap-3 px-1 py-1.5 rounded-lg mt-1" style={over9k ? { background: `${OVER_9000_COLOR}0d` } : {}}>
                <div
                  className="relative z-10 w-[26px] h-[26px] shrink-0 rounded-lg flex items-center justify-center"
                  style={over9k
                    ? { background: `${OVER_9000_COLOR}20`, border: `1.5px solid ${OVER_9000_COLOR}60`, boxShadow: `0 0 10px ${OVER_9000_COLOR}35` }
                    : { background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.07)" }
                  }
                >
                  <Zap className="w-3 h-3" style={{ color: over9k ? OVER_9000_COLOR : "rgba(255,255,255,0.14)" }} />
                </div>
                <span className="flex-1 text-[11px] font-semibold leading-none" style={{ color: over9k ? OVER_9000_COLOR : "rgba(255,255,255,0.14)" }}>
                  It&apos;s Over 9000 Club
                </span>
                {over9k && rank !== null && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none" style={{ background: `${OVER_9000_COLOR}18`, color: OVER_9000_COLOR, border: `1px solid ${OVER_9000_COLOR}30` }}>
                    #{rank}
                  </span>
                )}
                <span className="text-[9px] tabular-nums font-medium shrink-0" style={{ color: over9k ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)" }}>9,000+</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent activity / empty ── */}
      {recent.length > 0 ? (
        <div className="relative px-5 py-3">
          <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/18 mb-2">Recent Activity</p>
          <div className="space-y-1.5">
            {recent.map((ev, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: `${accentColor}12`, color: accentColor }}>
                  {ACTION_ICON[ev.action] ?? <Zap className="w-3 h-3" />}
                </div>
                <span className="text-[10px] text-white/35 flex-1 truncate">
                  {XP_LABELS[ev.action as XPAction] ?? ev.action}
                  {ev.adventure_slug && <span className="text-white/18 ml-1">· {ev.adventure_slug.replace(/-/g, " ")}</span>}
                </span>
                <span className="text-[10px] font-bold shrink-0" style={{ color: accentColor }}>+{ev.xp}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative px-5 py-5 text-center">
          <Zap className="w-5 h-5 mx-auto mb-2 opacity-10 text-white" />
          <p className="text-white/20 text-[11px] leading-relaxed">No XP yet — complete adventures,<br />write reviews, or finish your ACE assessment.</p>
        </div>
      )}

    </div>
  );
}
