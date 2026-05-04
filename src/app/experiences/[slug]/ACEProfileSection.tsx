"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Flame, Zap, Dumbbell, Compass, Waves, Mountain, Shield, Wind, ChevronUp, ChevronDown } from "lucide-react";
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
  nerve:    <Wind     className="w-3.5 h-3.5" />,
};

const TRAINING_TIPS: Record<string, string> = {
  stamina:  "Build aerobic base with 3–4 weekly runs or hikes. Progress to back-to-back long days.",
  power:    "Add interval training and steep hill repeats to develop explosive leg power.",
  strength: "Weighted step-ups, squats and loaded carries will develop the strength needed.",
  agility:  "Practice trail running on technical terrain; add balance and proprioception drills.",
  water:    "Swim 2–3 times a week. Progress from pool to open water, then moving water.",
  altitude: "Spend nights above 3,000m before attempting higher objectives. Acclimatise gradually.",
  focus:    "Exposure therapy on smaller heights — via ferrata and scrambling routes build tolerance.",
  nerve:    "Build comfort in remote settings — overnight solo trips and wilderness navigation without phone support.",
};

function DotScale({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            background: i < value ? color : "rgba(255,255,255,0.08)",
            boxShadow: i < value ? `0 0 5px ${color}80` : "none",
          }}
        />
      ))}
    </div>
  );
}

function AxisCard({ axis, trekVal, userVal }: { axis: AceAxis; trekVal: number; userVal: number | null }) {
  const color = ACE_AXIS_COLORS[axis];
  const icon = AXIS_ICONS[axis];
  const label = ACE_AXIS_LABELS[axis];
  const hasUser = userVal !== null;
  const meets = hasUser && userVal! >= trekVal;
  const gap = hasUser ? trekVal - userVal! : 0;
  const accentColor = !hasUser ? color : meets ? color : "#ef4444";

  return (
    <div
      className="rounded-xl px-3 py-2.5 flex items-center gap-3"
      style={{
        background: !hasUser
          ? "rgba(255,255,255,0.03)"
          : meets
          ? `${color}0a`
          : "rgba(239,68,68,0.07)",
        border: !hasUser
          ? "1px solid rgba(255,255,255,0.07)"
          : meets
          ? `1px solid ${color}25`
          : "1px solid rgba(239,68,68,0.2)",
      }}
    >
      {/* Icon */}
      <span style={{ color: accentColor }} className="shrink-0 opacity-90">{icon}</span>

      {/* Label */}
      <span className="text-[10px] font-bold uppercase tracking-wide w-16 shrink-0 truncate" style={{ color: accentColor }}>
        {label}
      </span>

      {/* Dot columns */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {/* Trek row */}
        <div className="flex items-center gap-1.5">
          <span className="text-[7px] uppercase tracking-wider text-white/20 font-semibold w-6 shrink-0">Req</span>
          <DotScale value={trekVal} color={color} />
        </div>
        {/* User row */}
        {hasUser && (
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] uppercase tracking-wider text-white/20 font-semibold w-6 shrink-0">You</span>
            <DotScale value={userVal!} color={meets ? color : "#ef4444"} />
          </div>
        )}
      </div>

      {/* Status badge */}
      {hasUser && (
        <span
          className="text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5"
          style={{ background: meets ? "#22c55e18" : "#ef444420", color: meets ? "#4ade80" : "#f87171" }}
        >
          {meets ? "✓" : `+${gap}`}
        </span>
      )}
    </div>
  );
}

export default function ACEProfileSection({
  ace,
  adventureName,
}: Props) {
  const [userAce, setUserAce] = useState<ACE | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (p) setUserAce(p.ace);
  }, []);

  const axes = Object.keys(ace) as AceAxis[];
  const gaps = userAce
    ? axes
        .map(ax => ({ ax, gap: ace[ax] - ((userAce as unknown as Record<string, number>)[ax] ?? 0) }))
        .filter(({ gap }) => gap > 0)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 3)
    : [];
  const readyCount = userAce
    ? axes.filter(ax => (userAce as unknown as Record<string, number>)[ax] >= ace[ax]).length
    : 0;
  const totalAxes = axes.length;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-0.5">ACE Profile</p>
          <h2 className="text-white font-semibold text-lg leading-snug tracking-tight">How does your body match up?</h2>
        </div>
        <GradingPill />
      </div>

      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden mb-3"
        style={{
          background: "linear-gradient(160deg, #0d1525 0%, #0a1018 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Radar + axes */}
        <div className="flex flex-row">

          {/* Radar panel */}
          <div
            className="flex flex-col items-center justify-center py-6 px-5 shrink-0 border-r"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {/* Score pill */}
            {userAce && (
              <div
                className="mb-5 px-4 py-2 rounded-2xl flex items-center gap-3"
                style={{
                  background: readyCount === totalAxes
                    ? "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))"
                    : "linear-gradient(135deg, rgba(255,81,0,0.12), rgba(255,81,0,0.06))",
                  border: readyCount === totalAxes
                    ? "1px solid rgba(34,197,94,0.25)"
                    : "1px solid rgba(255,81,0,0.22)",
                }}
              >
                <div className="text-center">
                  <p className="text-[22px] font-black leading-none" style={{ color: readyCount === totalAxes ? "#4ade80" : "#ff5100" }}>
                    {readyCount}/{totalAxes}
                  </p>
                  <p className="text-[8px] uppercase tracking-widest font-bold text-white/30 mt-0.5">axes ready</p>
                </div>
                <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)" }} />
                <p className="text-[10px] text-white/45 leading-snug max-w-[100px]">
                  {readyCount === totalAxes
                    ? "You meet all requirements"
                    : `${totalAxes - readyCount} axes need work`}
                </p>
              </div>
            )}

            <ACERadar ace={ace} userAce={userAce ?? undefined} userColor="#ffffff" size={200} showLabels />

            {/* Legend */}
            <div className="flex items-center gap-5 mt-5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-[2.5px] rounded-full bg-[#ff5100]" />
                <span className="text-[9px] text-white/35 uppercase tracking-widest font-semibold">Trek</span>
              </div>
              {userAce && (
                <div className="flex items-center gap-2">
                  <svg width="20" height="4" viewBox="0 0 20 4">
                    <line x1="0" y1="2" x2="20" y2="2" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeDasharray="4 3" />
                  </svg>
                  <span className="text-[9px] text-white/55 uppercase tracking-widest font-semibold">You</span>
                </div>
              )}
            </div>
          </div>

          {/* Axis grid */}
          {userAce ? (
            <div className="flex-1 min-w-0 p-4">
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/25 mb-3">
                Your Capability vs Trek Requirements
              </p>
              <div className="flex flex-col gap-1.5">
                {axes.map(axis => (
                  <AxisCard
                    key={axis}
                    axis={axis}
                    trekVal={ace[axis]}
                    userVal={(userAce as unknown as Record<string, number>)[axis] ?? 0}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center p-5">
              <div className="flex flex-col gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,81,0,0.12)", border: "1px solid rgba(255,81,0,0.25)" }}
                >
                  <Flame className="w-4 h-4 text-[#ff5100]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm mb-1">See how you measure up</p>
                  <p className="text-white/35 text-xs leading-relaxed">
                    Take the 2-min ACE assessment to overlay your profile and see exactly which axes you meet.
                  </p>
                </div>
                <Link
                  href="/matchmaker"
                  className="inline-flex items-center gap-2 w-fit text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:brightness-110 hover:-translate-y-0.5"
                  style={{ background: "#ff5100", boxShadow: "0 4px 14px rgba(255,81,0,0.3)" }}
                >
                  Take Assessment
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom summary + retake */}
        <div
          className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}
        >
          <p className="text-xs leading-relaxed text-white/30 flex-1 italic">
            {aceSummary(ace, adventureName)}
          </p>
          {userAce && (
            <Link
              href="/matchmaker?retake=1"
              className="inline-flex items-center gap-1.5 shrink-0 text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:brightness-110 whitespace-nowrap"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
            >
              <RotateCcw className="w-3 h-3" />
              Retake
            </Link>
          )}
        </div>
      </div>

      {/* Focus Areas — only when there are gaps */}
      {gaps.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden mb-3"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
            <div className="w-1 h-4 rounded-full bg-red-500" />
            <div>
              <p className="text-red-400 text-[10px] font-bold tracking-[0.22em] uppercase">Training Priority</p>
              <p className="text-white/40 text-[11px] mt-0.5">Top {gaps.length} axes to build before this trek</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {gaps.map(({ ax, gap }, idx) => {
              const color = ACE_AXIS_COLORS[ax];
              const icon = AXIS_ICONS[ax];
              const userVal = userAce ? (userAce as unknown as Record<string, number>)[ax] ?? 0 : 0;
              const trekVal = ace[ax];
              return (
                <div
                  key={ax}
                  className="flex items-start gap-3 rounded-xl p-3.5"
                  style={{ background: `${color}08`, border: `1px solid ${color}18` }}
                >
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white/40"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      {idx + 1}
                    </span>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: `${color}20`, color }}
                    >
                      {icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-white font-bold text-xs capitalize">{ACE_AXIS_LABELS[ax]}</span>
                      <span
                        className="text-[8px] px-1.5 py-px rounded-full font-bold inline-flex items-center gap-0.5"
                        style={{ background: `${color}20`, color }}
                      >
                        <ChevronUp className="w-2 h-2" />+{gap} needed
                      </span>
                      <span className="text-white/20 text-[9px] ml-auto font-mono">
                        Lv {userVal} → {trekVal}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(userVal / trekVal) * 100}%`,
                          background: `linear-gradient(to right, ${color}99, ${color})`,
                        }}
                      />
                    </div>
                    <p className="text-white/40 text-[11px] leading-snug">{TRAINING_TIPS[ax]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
