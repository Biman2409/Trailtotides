"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import ACERadar from "@/components/ui/custom/ACERadar";
import GradingPill from "@/components/ui/custom/GradingPill";
import { aceSummary, ACE_DOMAINS } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";
import type { ACE } from "@/lib/ace";

interface Props {
  ace: ACE;
  adventureName: string;
  showAltitudeWarning: boolean;
  showIsolationWarning: boolean;
  showTechnicalWarning: boolean;
}

const RANKS = [
  { label: "Uncharted",   color: "#6b7280", stars: 0, minScore: 0  },
  { label: "Pathfinder",  color: "#22d3ee", stars: 1, minScore: 8  },
  { label: "Navigator",   color: "#4ade80", stars: 2, minScore: 16 },
  { label: "Trailblazer", color: "#f59e0b", stars: 3, minScore: 24 },
  { label: "Vanguard",    color: "#f97316", stars: 4, minScore: 32 },
  { label: "Apex",        color: "#a78bfa", stars: 5, minScore: 40 },
];

// Body = Engine + Chassis axes; Trek = Elements + Mind axes
const BODY_AXES = ["stamina", "power", "strength", "agility"] as const;
const TREK_AXES = ["water", "altitude", "nerve", "focus"] as const;

function domainAvg(ace: ACE, axes: readonly string[]) {
  const vals = axes.map(a => (ace as Record<string, number>)[a] ?? 0);
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
}

function LevelBar({ label, trekVal, userVal, color, userColor }: {
  label: string; trekVal: number; userVal: number | null; color: string; userColor: string;
}) {
  const max = 5;
  const trekPct = (trekVal / max) * 100;
  const userPct = userVal !== null ? (userVal / max) * 100 : null;
  const gap = userVal !== null ? trekVal - userVal : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">{label}</span>
        <div className="flex items-center gap-2">
          {userVal !== null && (
            <span className="text-[10px] font-mono font-bold" style={{ color: userColor }}>
              You {userVal.toFixed(1)}
            </span>
          )}
          <span className="text-[10px] font-mono text-white/30">Trek {trekVal.toFixed(1)}</span>
          {gap !== null && gap > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#ef444420", color: "#ef4444" }}>
              −{gap.toFixed(1)}
            </span>
          )}
          {gap !== null && gap <= 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#22c55e20", color: "#22c55e" }}>
              ✓
            </span>
          )}
        </div>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden bg-white/[0.06]">
        {/* Trek requirement bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-30"
          style={{ width: `${trekPct}%`, background: color }}
        />
        {/* User level bar */}
        {userPct !== null && (
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{
              width: `${userPct}%`,
              background: `linear-gradient(to right, ${userColor}cc, ${userColor})`,
              boxShadow: `0 0 6px ${userColor}80`,
            }}
          />
        )}
        {/* Trek marker line */}
        <div
          className="absolute inset-y-0 w-px"
          style={{ left: `${trekPct}%`, background: `${color}90` }}
        />
      </div>
    </div>
  );
}

export default function ACEProfileSection({
  ace,
  adventureName,
  showAltitudeWarning,
  showIsolationWarning,
  showTechnicalWarning,
}: Props) {
  const [userAce, setUserAce] = useState<ACE | null>(null);
  const [profileLabel, setProfileLabel] = useState<string | null>(null);
  const [userColor, setUserColor] = useState("#38bdf8");

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setUserAce(p.ace);
      setProfileLabel(p.label);
      const totalScore = Object.values(p.ace).reduce((a, b) => a + b, 0);
      const rankIndex = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
      setUserColor(RANKS[rankIndex].color);
    }
  }, []);

  const trekBodyAvg = domainAvg(ace, BODY_AXES);
  const trekTrekAvg = domainAvg(ace, TREK_AXES);
  const userBodyAvg = userAce ? domainAvg(userAce, BODY_AXES) : null;
  const userTrekAvg = userAce ? domainAvg(userAce, TREK_AXES) : null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase">
          ACE Profile
        </p>
        <GradingPill />
      </div>

      {/* Radar card */}
      <div
        className="rounded-2xl p-6 mb-3"
        style={{
          background: "linear-gradient(135deg, #0c1020 0%, #0f1520 100%)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* LEFT — radar */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <ACERadar ace={ace} userAce={userAce ?? undefined} userColor={userColor} size={220} showLabels />
            {userAce && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full bg-[#ff5100]" />
                  <span className="text-[9px] text-white/30 uppercase tracking-wide">Trek</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="4" viewBox="0 0 14 4">
                    <line x1="0" y1="2" x2="14" y2="2" stroke={userColor} strokeWidth="1.5" strokeDasharray="4 2.5" />
                  </svg>
                  <span className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: userColor }}>
                    {profileLabel ?? "You"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex flex-col justify-center gap-4 min-w-0">
            {userAce ? (
              <>
                {/* Body & Trek level bars */}
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/25 mb-1">Capability vs Requirement</p>
                  <LevelBar
                    label="Body Level"
                    trekVal={trekBodyAvg}
                    userVal={userBodyAvg}
                    color="#f97316"
                    userColor={userColor}
                  />
                  <LevelBar
                    label="Trek Level"
                    trekVal={trekTrekAvg}
                    userVal={userTrekAvg}
                    color="#a78bfa"
                    userColor={userColor}
                  />
                </div>

                <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  {aceSummary(ace, adventureName)}
                </p>

                <Link
                  href="/matchmaker"
                  className="flex items-center gap-1.5 w-fit text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:brightness-110"
                  style={{
                    background: "rgba(255,81,0,0.1)",
                    border: "1px solid rgba(255,81,0,0.2)",
                    color: "#ff5100",
                  }}
                >
                  Retake Assessment
                  <RotateCcw className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  {aceSummary(ace, adventureName)}
                </p>
                <div
                  className="rounded-xl px-4 py-4 flex flex-col gap-3"
                  style={{
                    background: "rgba(255,81,0,0.06)",
                    border: "1px solid rgba(255,81,0,0.15)",
                  }}
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Safety alerts */}
      {(showAltitudeWarning || showIsolationWarning || showTechnicalWarning) && (
        <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-3">
            Know Before You Go
          </p>
          <div className="space-y-2.5">
            {showAltitudeWarning && (
              <div className="flex gap-3 rounded-xl px-4 py-3.5" style={{ background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.22)" }}>
                <span className="text-yellow-400 shrink-0 mt-0.5 text-base">⚠</span>
                <div>
                  <p className="text-xs font-bold text-yellow-400 mb-0.5">High Risk of Altitude Sickness</p>
                  <p className="text-xs text-yellow-400/55 leading-relaxed">Proper acclimatization is required. Do not exceed 300–500m of altitude gain per day above 3,000m.</p>
                </div>
              </div>
            )}
            {showIsolationWarning && (
              <div className="flex gap-3 rounded-xl px-4 py-3.5" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span className="text-red-400 shrink-0 mt-0.5 text-base">⚠</span>
                <div>
                  <p className="text-xs font-bold text-red-400 mb-0.5">Extreme Exposure Environment</p>
                  <p className="text-xs text-red-400/55 leading-relaxed">Rescue may be delayed. Carry a satellite communicator and travel with a registered guide.</p>
                </div>
              </div>
            )}
            {showTechnicalWarning && (
              <div className="flex gap-3 rounded-xl px-4 py-3.5" style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <span className="text-violet-400 shrink-0 mt-0.5 text-base">⚠</span>
                <div>
                  <p className="text-xs font-bold text-violet-400 mb-0.5">Mountaineering Route</p>
                  <p className="text-xs text-violet-400/55 leading-relaxed">Ice axe, crampons, and glacier travel experience are essential. Do not attempt without proper training.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
