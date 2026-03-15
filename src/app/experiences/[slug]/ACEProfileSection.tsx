"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import ACERadar from "@/components/ui/custom/ACERadar";
import GradingPill from "@/components/ui/custom/GradingPill";
import { aceSummary, ACE_AXIS_COLORS, ACE_AXIS_LABELS } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";
import type { ACE, AceAxis } from "@/lib/ace";

interface Props {
  ace: ACE;
  adventureName: string;
  showAltitudeWarning: boolean;
  showIsolationWarning: boolean;
  showTechnicalWarning: boolean;
}


const DOMAINS = [
  { label: "Engine",   color: "#f97316", axes: ["stamina", "power"]    as AceAxis[] },
  { label: "Chassis",  color: "#22d3ee", axes: ["strength", "agility"] as AceAxis[] },
  { label: "Elements", color: "#a78bfa", axes: ["water", "altitude"]   as AceAxis[] },
  { label: "Mind",     color: "#10b981", axes: ["nerve", "focus"]      as AceAxis[] },
];

export default function ACEProfileSection({
  ace,
  adventureName,
  showAltitudeWarning,
  showIsolationWarning,
  showTechnicalWarning,
}: Props) {
  const [userAce, setUserAce] = useState<ACE | null>(null);
  const [userColor] = useState("#4ade80");

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
        <div className="flex flex-row items-stretch">

          {/* Radar */}
          <div className="flex flex-col items-center justify-center pt-6 px-5 pb-4 shrink-0">
            <ACERadar ace={ace} userAce={userAce ?? undefined} userColor={userColor} size={290} showLabels />
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

          {/* Domain capability strip — vertical, fills height */}
          {userAce ? (
            <div className="flex flex-col flex-1 border-l border-white/[0.06]">
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <p className="text-[9px] uppercase tracking-widest font-bold text-white/30">Your Capability vs Trek Requirement</p>
              </div>
              <div className="grid grid-cols-2 flex-1 divide-x divide-white/[0.05]">
                {DOMAINS.map(({ label: domainLabel, color: domainColor, axes }) => (
                  <div key={domainLabel} className="flex flex-col divide-y divide-white/[0.05]">
                    {/* Domain header */}
                    <div className="px-3 py-1.5" style={{ background: `${domainColor}10` }}>
                      <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: domainColor }}>{domainLabel}</span>
                    </div>
                    {/* Axes */}
                    {axes.map((axis) => {
                      const color = ACE_AXIS_COLORS[axis];
                      const axisLabel = ACE_AXIS_LABELS[axis];
                      const trekVal = ace[axis];
                      const userVal = (userAce as Record<string, number>)[axis] ?? 0;
                      const meets = userVal >= trekVal;
                      return (
                        <div key={axis} className="flex items-center justify-between px-3 py-2 flex-1">
                          <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color }}>{axisLabel}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black leading-none" style={{ color: userColor }}>{userVal}</span>
                            <span className="text-[8px] text-white/25">/ {trekVal}</span>
                            <div
                              className="text-[7px] font-bold px-1.5 py-px rounded-full whitespace-nowrap"
                              style={{
                                background: meets ? "#22c55e18" : "#ef444418",
                                color: meets ? "#22c55e" : "#ef4444",
                              }}
                            >
                              {meets ? "✓ Ready" : `+${(trekVal - userVal).toFixed(1)} needed`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
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

      {/* Safety alerts */}
      {(showAltitudeWarning || showIsolationWarning || showTechnicalWarning) && (
        <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-3">Know Before You Go</p>
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
