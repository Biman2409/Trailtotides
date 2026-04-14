"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp, ChevronDown, CheckCircle2, Star, Camera, Heart, GitCompare } from "lucide-react";
import {
  getTier, getNextTier, getProgressPct, XP_TIERS,
  isOver9000, OVER_9000_COLOR,
  type XPAction,
} from "@/lib/xp";

interface XPEvent {
  action: string;
  adventure_slug: string;
  xp: number;
  created_at: string;
}

export default function ExpeditionProfile() {
  const [xp, setXp]         = useState<number>(0);
  const [events, setEvents]  = useState<XPEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLadder, setShowLadder] = useState(false);
  const [rank, setRank]      = useState<number | null>(null);
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

  const tier       = getTier(xp);
  const next       = getNextTier(xp);
  const pct        = getProgressPct(xp);
  const xpToNext   = next ? next.minXP - xp : 0;
  const over9k     = isOver9000(xp);
  const accentColor = over9k ? OVER_9000_COLOR : tier.color;
  const countOf    = (action: XPAction) => events.filter(e => e.action === action).length;

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

      {/* ── Progress bar ── */}
      <div className="relative px-5 pt-3 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {over9k ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" style={{ color: OVER_9000_COLOR }} />
                <span className="text-[9px] font-bold" style={{ color: OVER_9000_COLOR }}>Uncapped · +{(xp - 9000).toLocaleString()} beyond 9k</span>
              </div>
              <button onClick={() => setShowLadder(v => !v)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md transition-all hover:bg-white/[0.06]"
                style={{ color: showLadder ? OVER_9000_COLOR : "rgba(255,255,255,0.2)" }}>
                <span className="text-[8px] font-bold tracking-wide">all tiers</span>
                <ChevronDown className="w-2.5 h-2.5 transition-transform duration-200"
                  style={{ transform: showLadder ? "rotate(180deg)" : "none" }} />
              </button>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="absolute inset-y-0 left-0 w-full rounded-full"
                style={{ background: `linear-gradient(90deg, #f97316, ${OVER_9000_COLOR})`, boxShadow: `0 0 8px ${OVER_9000_COLOR}60` }} />
            </div>
          </div>
        ) : next ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold" style={{ color: `${tier.color}cc` }}>{tier.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] tabular-nums" style={{ color: "rgba(255,255,255,0.22)" }}>
                  {xpToNext.toLocaleString()} XP to{" "}
                  <span className="font-bold" style={{ color: `${next.color}cc` }}>{next.name}</span>
                </span>
                <button onClick={() => setShowLadder(v => !v)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md transition-all hover:bg-white/[0.06]"
                  style={{ color: showLadder ? accentColor : "rgba(255,255,255,0.2)" }}>
                  <span className="text-[8px] font-bold tracking-wide">all tiers</span>
                  <ChevronDown className="w-2.5 h-2.5 transition-transform duration-200"
                    style={{ transform: showLadder ? "rotate(180deg)" : "none" }} />
                </button>
              </div>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tier.color}, ${next.color})`, boxShadow: `0 0 8px ${tier.color}50` }} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[8px] tabular-nums" style={{ color: "rgba(255,255,255,0.18)" }}>{tier.minXP.toLocaleString()} XP</span>
              <span className="text-[8px] tabular-nums" style={{ color: "rgba(255,255,255,0.18)" }}>{next.minXP.toLocaleString()} XP</span>
            </div>
          </div>
        ) : null}

        {/* Tier ladder */}
        {showLadder && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Track: circles are 28px tall, container has no extra offset — spine at top:14px = circle center */}
            <div className="relative" style={{ paddingBottom: "4px" }}>
              {/* Background spine — at exact vertical center of 28px circles */}
              <div className="absolute left-0 right-0 h-px" style={{ top: "14px", background: "rgba(255,255,255,0.07)", zIndex: 0 }} />
              {/* Filled spine up to current tier */}
              {(() => {
                const idx = XP_TIERS.findIndex(t => t.level === tier.level);
                const pctFill = over9k ? 100 : (idx / (XP_TIERS.length - 1)) * 100;
                return (
                  <div className="absolute left-0 h-px" style={{
                    top: "14px",
                    width: `${pctFill}%`,
                    background: `linear-gradient(90deg, ${XP_TIERS[0].color}, ${tier.color})`,
                    zIndex: 0,
                    transition: "width 0.7s ease",
                  }} />
                );
              })()}
              {/* Nodes row — sits above spine via z-index */}
              <div className="relative flex items-start justify-between" style={{ zIndex: 1 }}>
                {XP_TIERS.map(t => {
                  const reached   = xp >= t.minXP;
                  const isCurrent = t.level === tier.level;
                  return (
                    <div key={t.level} className="flex flex-col items-center" style={{ gap: "6px" }}>
                      {/* Circle — solid bg so spine line can't bleed through */}
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 relative"
                        style={isCurrent
                          ? { background: t.color, color: "#000", boxShadow: `0 0 12px ${t.color}90, 0 0 0 3px ${t.color}30`, zIndex: 2 }
                          : reached
                            ? { background: "#0a0a0e", color: t.color, border: `1.5px solid ${t.color}`, boxShadow: `0 0 8px ${t.color}40`, zIndex: 2 }
                            : { background: "#0a0a0e", color: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.1)", zIndex: 2 }
                        }>
                        {t.level}
                      </div>
                      {/* Name label */}
                      <span className="text-[7px] font-semibold leading-none text-center" style={{
                        maxWidth: "36px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: isCurrent ? t.color : reached ? t.color : "rgba(255,255,255,0.18)",
                      }}>
                        {t.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats strip ── */}
      <div className="relative grid grid-cols-5 text-center">
        {[
          { value: countOf("trip_log"), label: "Done",     color: "#10b981", icon: CheckCircle2 },
          { value: countOf("review"),   label: "Reviews",  color: "#f97316", icon: Star         },
          { value: countOf("photo"),    label: "Photos",   color: "#3b82f6", icon: Camera       },
          { value: countOf("wishlist"), label: "Saved",    color: "#f43f5e", icon: Heart        },
          { value: countOf("compare"),  label: "Compared", color: "#a78bfa", icon: GitCompare   },
        ].map(({ value, label, color, icon: Icon }, i, arr) => {
          const active = value > 0;
          return (
            <div key={label} className="flex flex-col items-center justify-center py-3 gap-1.5"
              style={i < arr.length - 1 ? { borderRight: "1px solid rgba(255,255,255,0.05)" } : {}}>
              {/* Icon badge */}
              <div className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                style={{
                  background: active ? `${color}18` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? `${color}30` : "rgba(255,255,255,0.06)"}`,
                }}>
                <Icon className="w-3 h-3" style={{ color: active ? color : "rgba(255,255,255,0.15)" }} />
              </div>
              {/* Number */}
              <span className="text-[14px] font-black tabular-nums leading-none" style={{ color: active ? color : "rgba(255,255,255,0.1)" }}>{value}</span>
              {/* Label */}
              <span className="text-[7px] uppercase tracking-wide font-semibold" style={{ color: "rgba(255,255,255,0.2)" }}>{label}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
