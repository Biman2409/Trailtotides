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
    <section>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase">ACE Profile</p>
        <GradingPill />
      </div>

      <div
        className="rounded-2xl mb-3 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1020 0%, #0f1520 100%)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* TOP — radar (left) + domain strip (right) */}
        <div className="flex flex-col md:flex-row items-stretch">

          {/* Radar */}
          <div className="flex flex-col items-center justify-center pt-6 px-5 pb-4 shrink-0">
            <ACERadar ace={ace} userAce={userAce ?? undefined} userColor={userColor} size={240} showLabels />
            <div className="flex items-center gap-5 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full bg-[#ff5100]" />
                <span className="text-[9px] text-white/30 uppercase tracking-wide">Trek Requirements</span>
              </div>
              {userAce && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="4" viewBox="0 0 14 4">
                    <line x1="0" y1="2" x2="14" y2="2" stroke={userColor} strokeWidth="1.5" strokeDasharray="4 2.5" />
                  </svg>
                  <span className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: userColor }}>
                    Your Capability
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Capability vs Requirement panel */}
          {userAce ? (
            <div className="flex flex-col flex-1 border-t md:border-t-0 md:border-l border-white/[0.06]">
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-white/[0.06]">
                <p className="text-[9px] uppercase tracking-widest font-bold text-white/30">Your Capability vs Trek Requirement</p>
              </div>

              {/* Axes grid */}
              <div className="grid grid-cols-2 gap-px bg-white/[0.04] flex-1">
                {(Object.keys(ace) as AceAxis[]).map((axis) => {
                  const color = ACE_AXIS_COLORS[axis];
                  const trekVal = ace[axis];
                  const userVal = (userAce as Record<string, number>)[axis] ?? 0;
                  const meets = userVal >= trekVal;
                  const pctUser = (userVal / 5) * 100;
                  const pctTrek = (trekVal / 5) * 100;

                  return (
                    <div
                      key={axis}
                      className="flex flex-col gap-2 p-3"
                      style={{ background: "#0d111e" }}
                    >
                      {/* Top row: icon + label + status badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span style={{ color }} className="opacity-80">{AXIS_ICONS[axis]}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{ACE_AXIS_LABELS[axis]}</span>
                        </div>
                        <span
                          className="text-[8px] font-bold px-1.5 py-px rounded-full whitespace-nowrap"
                          style={{
                            background: meets ? "#22c55e15" : "#ef444415",
                            color: meets ? "#22c55e" : "#ef4444",
                            border: `1px solid ${meets ? "#22c55e30" : "#ef444430"}`,
                          }}
                        >
                          {meets ? "✓" : `+${trekVal - userVal}`}
                        </span>
                      </div>

                      {/* Bar track */}
                      <div className="relative h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        {/* Trek requirement bar (background) */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ width: `${pctTrek}%`, background: `${color}25` }}
                        />
                        {/* User capability bar */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                          style={{
                            width: `${pctUser}%`,
                            background: meets ? color : "#ef4444",
                            boxShadow: meets ? `0 0 6px ${color}60` : "0 0 6px #ef444460",
                          }}
                        />
                      </div>

                      {/* Score row */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-white/30">
                          You <span className="font-bold" style={{ color: meets ? color : "#ef4444" }}>{userVal}</span>
                        </span>
                        <span className="text-[9px] text-white/25">
                          Need <span className="font-semibold text-white/40">{trekVal}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center p-6">
              <div
                className="rounded-xl px-4 py-4 flex flex-col gap-3 w-full"
                style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.15)" }}
              >
                <div>
                  <p className="text-white/80 font-semibold text-sm">See how you compare</p>
                  <p className="text-white/35 text-xs mt-1 leading-relaxed">
                    Take the ACE assessment to overlay your profile on this radar.
                  </p>
                </div>
                <Link
                  href="/matchmaker"
                  className="flex items-center gap-1.5 w-fit text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all hover:brightness-110 hover:-translate-y-0.5"
                  style={{ background: "#ff5100" }}
                >
                  Take Assessment
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM — description + retake */}
        <div className="px-6 py-4 border-t border-white/[0.06]">
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            {aceSummary(ace, adventureName)}
          </p>
          {userAce && (
            <Link
              href="/matchmaker"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:brightness-110"
              style={{ background: "rgba(255,81,0,0.1)", border: "1px solid rgba(255,81,0,0.2)", color: "#ff5100" }}
            >
              Retake Assessment
              <RotateCcw className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Focus Areas — only when user has gaps on this trek */}
      {userAce && (() => {
        const gaps = (Object.keys(ace) as AceAxis[])
          .map(ax => ({ ax, gap: ace[ax] - ((userAce as Record<string, number>)[ax] ?? 0) }))
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
                const userVal = (userAce as Record<string, number>)[ax] ?? 0;
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
