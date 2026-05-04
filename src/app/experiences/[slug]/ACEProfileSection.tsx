"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Flame, Zap, Dumbbell, Compass, Waves, Mountain, Shield, Wind, ChevronUp, Layers } from "lucide-react";
import ACERadar from "@/components/ui/custom/ACERadar";
import GradingPill from "@/components/ui/custom/GradingPill";
import { aceSummary, ACE_AXIS_COLORS, ACE_AXIS_LABELS, ACE_DOMAINS } from "@/lib/ace";
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
  stamina:  <Flame    className="w-3 h-3" />,
  power:    <Zap      className="w-3 h-3" />,
  strength: <Dumbbell className="w-3 h-3" />,
  agility:  <Compass  className="w-3 h-3" />,
  water:    <Waves    className="w-3 h-3" />,
  altitude: <Mountain className="w-3 h-3" />,
  focus:    <Shield   className="w-3 h-3" />,
  nerve:    <Wind     className="w-3 h-3" />,
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

function DotScale({ filled, color, dim }: { filled: number; color: string; dim?: boolean }) {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: i < filled
              ? dim ? `${color}70` : color
              : "rgba(255,255,255,0.06)",
            boxShadow: i < filled && !dim ? `0 0 4px ${color}60` : "none",
          }}
        />
      ))}
    </div>
  );
}

function AxisCell({ axis, trekVal, userVal }: { axis: AceAxis; trekVal: number; userVal: number }) {
  const color = ACE_AXIS_COLORS[axis];
  const icon = AXIS_ICONS[axis];
  const label = ACE_AXIS_LABELS[axis];
  const meets = userVal >= trekVal;
  const gap = trekVal - userVal;

  return (
    <div
      className="flex flex-col gap-2 rounded-xl p-2.5"
      style={{
        background: meets ? `${color}08` : "rgba(239,68,68,0.05)",
        border: meets ? `1px solid ${color}22` : "1px solid rgba(239,68,68,0.15)",
      }}
    >
      {/* Axis name + badge */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span style={{ color: meets ? color : "#f87171" }} className="shrink-0 opacity-80">{icon}</span>
          <span className="text-[9px] font-bold truncate" style={{ color: meets ? "rgba(255,255,255,0.7)" : "#f87171" }}>{label}</span>
        </div>
        <span
          className="shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none"
          style={{ background: meets ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.15)", color: meets ? "#4ade80" : "#f87171" }}
        >
          {meets ? "✓" : `+${gap}`}
        </span>
      </div>
      {/* Trek row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[7px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>Trek</span>
        </div>
        <DotScale filled={trekVal} color={color} dim />
      </div>
      {/* You row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[7px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>You</span>
        </div>
        <DotScale filled={userVal} color={meets ? color : "#f87171"} />
      </div>
    </div>
  );
}

export default function ACEProfileSection({ ace, adventureName }: Props) {
  const [userAce, setUserAce] = useState<ACE | null>(null);
  const [overlapped, setOverlapped] = useState(false);

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
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-0.5">Capability Profile</p>
          <h2 className="text-white font-semibold text-base leading-snug tracking-tight">How do you measure up?</h2>
        </div>
        <GradingPill />
      </div>

      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden mb-3"
        style={{
          background: "linear-gradient(160deg, #0c1220 0%, #080e18 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Score pill — only when user has profile */}
        {userAce && (
          <div
            className="mx-4 mt-4 px-3 py-2 rounded-xl flex items-center gap-2.5"
            style={{
              background: readyCount === totalAxes
                ? "rgba(34,197,94,0.07)"
                : "rgba(255,81,0,0.07)",
              border: readyCount === totalAxes ? "1px solid rgba(34,197,94,0.18)" : "1px solid rgba(255,81,0,0.15)",
            }}
          >
            <p className="text-xl font-black leading-none tabular-nums" style={{ color: readyCount === totalAxes ? "#4ade80" : "#ff5100" }}>
              {readyCount}/{totalAxes}
            </p>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.07)" }} />
            <p className="text-[11px] text-white/35 leading-snug flex-1">
              {readyCount === totalAxes ? "You meet all requirements" : `${totalAxes - readyCount} axes need work`}
            </p>
            <button
              onClick={() => setOverlapped(o => !o)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0"
              style={{
                background: overlapped ? "rgba(255,81,0,0.15)" : "rgba(255,255,255,0.05)",
                border: overlapped ? "1px solid rgba(255,81,0,0.3)" : "1px solid rgba(255,255,255,0.09)",
                color: overlapped ? "#ff7d47" : "rgba(255,255,255,0.4)",
              }}
            >
              <Layers className="w-3 h-3" />
              {overlapped ? "Split view" : "Overlap view"}
            </button>
          </div>
        )}

        {/* Radar views */}
        <div className="p-4">
          {overlapped && userAce ? (
            /* ── Overlap view ── */
            <div className="flex gap-3 items-start">

              {/* Radar — in a box */}
              <div
                className="flex flex-col items-center gap-2.5 shrink-0 rounded-2xl p-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <ACERadar ace={ace} userAce={userAce} userColor="#ffffff" size={180} showLabels />
                {/* Legend */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-[2px] rounded-full bg-[#ff5100]" />
                    <span className="text-[8px] text-white/35 font-semibold uppercase tracking-widest">Trek</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="2" viewBox="0 0 16 2">
                      <line x1="0" y1="1" x2="16" y2="1" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeDasharray="3 2" />
                    </svg>
                    <span className="text-[8px] text-white/35 font-semibold uppercase tracking-widest">You</span>
                  </div>
                </div>
              </div>

              {/* 4-domain × 2-axis matrix — self-stretch to match radar height */}
              <div className="flex-1 min-w-0 flex flex-col gap-2 self-stretch">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25">Capability vs Requirement</p>
                <div className="grid grid-cols-4 gap-1.5 flex-1">
                  {ACE_DOMAINS.map(domain => (
                    <div key={domain.name} className="flex flex-col gap-1.5 h-full">
                      {/* Domain header */}
                      <div
                        className="flex items-center justify-center py-1 rounded-lg shrink-0"
                        style={{ background: `${domain.color}10`, border: `1px solid ${domain.color}20` }}
                      >
                        <span className="text-[8px] font-black uppercase tracking-[0.1em]" style={{ color: domain.color }}>
                          {domain.name}
                        </span>
                      </div>
                      {/* 2 axis cells — grow to fill */}
                      {domain.axes.map(axis => (
                        <AxisCell
                          key={axis}
                          axis={axis}
                          trekVal={ace[axis]}
                          userVal={(userAce as unknown as Record<string, number>)[axis] ?? 0}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : userAce ? (
            /* ── Split two radars ── */
            <div className="grid grid-cols-2 gap-3">
              <div
                className="flex flex-col items-center gap-2 rounded-xl py-3.5 px-2"
                style={{ background: "rgba(255,81,0,0.04)", border: "1px solid rgba(255,81,0,0.1)" }}
              >
                <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[#ff5100]/60">Trek Requirements</span>
                <ACERadar ace={ace} size={148} showLabels />
              </div>
              <div
                className="flex flex-col items-center gap-2 rounded-xl py-3.5 px-2"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white/35">Your Capability</span>
                <ACERadar ace={userAce} size={148} showLabels />
              </div>
            </div>
          ) : (
            /* ── No profile ── */
            <div className="flex gap-0 items-stretch">
              {/* Trek radar — larger, dominant */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 pr-4">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#ff5100]/60">Trek Requirements</span>
                <ACERadar ace={ace} size={196} showLabels />
              </div>

              {/* Divider */}
              <div className="w-px self-stretch" style={{ background: "rgba(255,255,255,0.05)" }} />

              {/* CTA sub-section */}
              <div className="flex flex-col justify-center pl-4 flex-1 min-w-0">
                <div
                  className="rounded-xl p-3 flex flex-col gap-3"
                  style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.12)" }}
                >
                  <div>
                    <p className="text-white/90 font-bold text-[13px] leading-snug mb-1">See how you measure up</p>
                    <p className="text-white/35 text-[11px] leading-relaxed">
                      Take the 2-min assessment and compare your capability against this trek.
                    </p>
                  </div>
                  <Link
                    href="/matchmaker"
                    className="inline-flex items-center justify-center gap-1.5 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all hover:brightness-110 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #ff5100, #ff7d47)", boxShadow: "0 4px 14px rgba(255,81,0,0.3)" }}
                  >
                    Take Assessment
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          className="px-4 py-2.5 flex items-center gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.12)" }}
        >
          <p className="text-[11px] leading-relaxed text-white/20 flex-1 italic">
            {aceSummary(ace, adventureName)}
          </p>
          {userAce && (
            <Link
              href="/matchmaker?retake=1"
              className="inline-flex items-center gap-1.5 shrink-0 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:brightness-110 whitespace-nowrap"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Retake Assessment
            </Link>
          )}
        </div>
      </div>

      {/* Training priorities */}
      {gaps.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden mb-3"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
            <div className="w-1 h-3.5 rounded-full bg-red-500" />
            <div>
              <p className="text-red-400 text-[10px] font-bold tracking-[0.22em] uppercase">Training Priority</p>
              <p className="text-white/35 text-[10px] mt-0.5">Top {gaps.length} axes to build before this trek</p>
            </div>
          </div>
          <div className="p-3.5 space-y-2">
            {gaps.map(({ ax, gap }, idx) => {
              const color = ACE_AXIS_COLORS[ax];
              const icon = AXIS_ICONS[ax];
              const userVal = userAce ? (userAce as unknown as Record<string, number>)[ax] ?? 0 : 0;
              const trekVal = ace[ax];
              return (
                <div
                  key={ax}
                  className="flex items-start gap-2.5 rounded-xl p-3"
                  style={{ background: `${color}08`, border: `1px solid ${color}18` }}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white/35"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      {idx + 1}
                    </span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20`, color }}>
                      {icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-white font-bold text-xs capitalize">{ACE_AXIS_LABELS[ax]}</span>
                      <span
                        className="text-[8px] px-1.5 py-px rounded-full font-bold inline-flex items-center gap-0.5"
                        style={{ background: `${color}20`, color }}
                      >
                        <ChevronUp className="w-2 h-2" />+{gap}
                      </span>
                      <span className="text-white/20 text-[9px] ml-auto font-mono">Lv {userVal} → {trekVal}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(userVal / trekVal) * 100}%`, background: `linear-gradient(to right, ${color}99, ${color})` }}
                      />
                    </div>
                    <p className="text-white/35 text-[10px] leading-snug">{TRAINING_TIPS[ax]}</p>
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
