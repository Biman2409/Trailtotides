"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Flame, Zap, Dumbbell, Compass, Waves, Mountain, Shield, Wind } from "lucide-react";
import ACERadar from "@/components/ui/custom/ACERadar";
import GradingPill from "@/components/ui/custom/GradingPill";
import { aceSummary, ACE_AXIS_COLORS, ACE_AXIS_LABELS } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";
import type { ACE, AceAxis } from "@/lib/ace";

interface Props {
  ace: ACE;
  adventureName: string;
  showAltitudeWarning: boolean;
  showFatalFallWarning: boolean;
  showExtremeIsolationWarning: boolean;
  showTechnicalWarning: boolean;
  showPhysicalExhaustionWarning: boolean;
  showWaterWarning: boolean;
}


const AXIS_ICONS: Record<string, React.ReactNode> = {
  stamina:  <Flame    className="w-3.5 h-3.5" />,
  power:    <Zap      className="w-3.5 h-3.5" />,
  strength: <Dumbbell className="w-3.5 h-3.5" />,
  agility:  <Compass  className="w-3.5 h-3.5" />,
  water:    <Waves    className="w-3.5 h-3.5" />,
  altitude: <Mountain className="w-3.5 h-3.5" />,
  focus:    <Shield   className="w-3.5 h-3.5" />,
  nerve: <Wind     className="w-3.5 h-3.5" />,
};

const TRAINING_TIPS: Record<string, string> = {
  stamina:  "Build aerobic base with 3–4 weekly runs or hikes. Progress to back-to-back long days.",
  power:    "Add interval training and steep hill repeats to develop explosive leg power.",
  strength: "Weighted step-ups, squats and loaded carries will develop the strength needed.",
  agility:  "Practice trail running on technical terrain; add balance and proprioception drills.",
  water:    "Swim 2–3 times a week. Progress from pool to open water, then moving water.",
  altitude: "Spend nights above 3,000m before attempting higher objectives. Acclimatise gradually.",
  focus:    "Exposure therapy on smaller heights — via ferrata and scrambling routes build tolerance.",
  nerve: "Build comfort in remote settings — overnight solo trips and wilderness navigation without phone support.",
};


export default function ACEProfileSection({
  ace,
  adventureName,
  showAltitudeWarning,
  showFatalFallWarning,
  showExtremeIsolationWarning,
  showTechnicalWarning,
  showPhysicalExhaustionWarning,
  showWaterWarning,
}: Props) {
  const [userAce, setUserAce] = useState<ACE | null>(null);
  const [userColor] = useState("#ffffff");

  useEffect(() => {
    const p = loadProfile();
    if (p) setUserAce(p.ace);
  }, []);

  return (
    <section className="lg:pt-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase">ace profile</p>
        <GradingPill />
      </div>

      <div
        className="rounded-2xl mb-3 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1020 0%, #0f1520 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* ── RADAR ROW ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-stretch">

          {/* Radar panel */}
          <div className="flex flex-col items-center justify-center py-6 px-6 shrink-0 md:border-r border-b md:border-b-0 border-white/[0.06]">
            <ACERadar ace={ace} userAce={userAce ?? undefined} userColor={userColor} size={220} showLabels />
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-[2px] rounded-full bg-[#ff5100]" />
                <span className="text-[9px] text-white/35 uppercase tracking-widest">Required</span>
              </div>
              {userAce && (
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="4" viewBox="0 0 16 4">
                    <line x1="0" y1="2" x2="16" y2="2" stroke={userColor} strokeWidth="1.8" strokeDasharray="4 3" />
                  </svg>
                  <span className="text-[9px] text-white/55 uppercase tracking-widest font-semibold">You</span>
                </div>
              )}
            </div>
          </div>

          {/* ── CAPABILITY PANEL ────────────────────────────────────────── */}
          {userAce ? (
            <div className="flex flex-col flex-1 min-w-0">
              {/* Section label */}
              <div className="px-4 pt-4 pb-3">
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/25">Your Capability vs Requirement</p>
              </div>

              {/* 2-col axis grid */}
              <div className="grid grid-cols-2 gap-2 px-3 pb-4">
                {(Object.keys(ace) as AceAxis[]).map((axis) => {
                  const color = ACE_AXIS_COLORS[axis];
                  const trekVal = ace[axis];
                  const userVal = (userAce as unknown as Record<string, number>)[axis] ?? 0;
                  const meets = userVal >= trekVal;
                  const pctUser = (userVal / 5) * 100;
                  const pctTrek = (trekVal / 5) * 100;

                  return (
                    <div
                      key={axis}
                      className="rounded-xl p-3 flex flex-col gap-2"
                      style={{
                        background: meets ? `${color}08` : "rgba(239,68,68,0.05)",
                        border: `1px solid ${meets ? `${color}20` : "rgba(239,68,68,0.18)"}`,
                      }}
                    >
                      {/* Label row */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span style={{ color: meets ? color : "#ef4444" }} className="shrink-0 opacity-90">
                            {AXIS_ICONS[axis]}
                          </span>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wide truncate"
                            style={{ color: meets ? color : "#ef4444" }}
                          >
                            {ACE_AXIS_LABELS[axis]}
                          </span>
                        </div>
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{
                            background: meets ? "#22c55e18" : "#ef444418",
                            color: meets ? "#4ade80" : "#f87171",
                          }}
                        >
                          {meets ? "✓ Ready" : `You: ${userVal}`}
                        </span>
                      </div>

                      {/* Dual bar */}
                      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        {/* Requirement ghost */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ width: `${pctTrek}%`, background: `${color}22` }}
                        />
                        {/* User fill */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                          style={{
                            width: `${pctUser}%`,
                            background: meets
                              ? `linear-gradient(to right, ${color}cc, ${color})`
                              : "linear-gradient(to right, #ef4444cc, #ef4444)",
                            boxShadow: meets ? `0 0 8px ${color}50` : "0 0 8px #ef444450",
                          }}
                        />
                      </div>

                      {/* Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-semibold" style={{ color: meets ? color : "#f87171" }}>
                          {userVal} / 5
                        </span>
                        <span className="text-[9px] text-white/25">
                          need <span className="text-white/40 font-medium">{trekVal}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div
                className="rounded-2xl px-5 py-5 flex flex-col gap-4 w-full max-w-sm"
                style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.15)" }}
              >
                <div>
                  <p className="text-white font-semibold text-sm mb-1">See how you compare</p>
                  <p className="text-white/35 text-xs leading-relaxed">
                    Take the 3-min ACE assessment to overlay your profile onto this radar and see where you stand.
                  </p>
                </div>
                <Link
                  href="/matchmaker"
                  className="inline-flex items-center gap-2 w-fit text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all hover:brightness-110 hover:-translate-y-0.5"
                  style={{ background: "#ff5100" }}
                >
                  Take Assessment
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM — summary + retake ──────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-xs leading-relaxed text-white/35 flex-1">
            {aceSummary(ace, adventureName)}
          </p>
          {userAce && (
            <Link
              href="/matchmaker"
              className="inline-flex items-center gap-1.5 shrink-0 text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:brightness-110 whitespace-nowrap"
              style={{ background: "rgba(255,81,0,0.1)", border: "1px solid rgba(255,81,0,0.2)", color: "#ff5100" }}
            >
              <RotateCcw className="w-3 h-3" />
              Retake Assessment
            </Link>
          )}
        </div>
      </div>

      {/* Focus Areas — only when user has gaps on this trek */}
      {userAce && (() => {
        const gaps = (Object.keys(ace) as AceAxis[])
          .map(ax => ({ ax, gap: ace[ax] - ((userAce as unknown as Record<string, number>)[ax] ?? 0) }))
          .filter(({ gap }) => gap > 0)
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 3);
        if (!gaps.length) return null;
        return (
          <div
            className="rounded-2xl p-5 mb-3 border"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-1">Focus Areas</p>
            <p className="text-white font-semibold text-sm mb-1">What to train for this trek</p>
            <p className="text-white/35 text-xs mb-4">These axes are holding you back the most. Improve these first.</p>
            <div className="space-y-3">
              {gaps.map(({ ax, gap }) => {
                const color = ACE_AXIS_COLORS[ax];
                const icon = AXIS_ICONS[ax];
                const userVal = (userAce as unknown as Record<string, number>)[ax] ?? 0;
                const trekVal = ace[ax];
                return (
                  <div key={ax} className="flex items-start gap-3 rounded-xl p-3.5" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}20`, color }}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-xs capitalize">{ACE_AXIS_LABELS[ax]}</span>
                        <span className="text-[9px] px-1.5 py-px rounded-full font-bold" style={{ background: `${color}20`, color }}>+{gap} needed</span>
                        <span className="text-white/25 text-[9px] ml-auto">Lv {userVal} → {trekVal}</span>
                      </div>
                      <p className="text-white/45 text-xs leading-snug">{TRAINING_TIPS[ax]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

    </section>
  );
}
