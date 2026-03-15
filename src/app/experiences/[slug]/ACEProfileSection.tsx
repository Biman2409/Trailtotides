"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import ACERadar from "@/components/ui/custom/ACERadar";
import GradingPill from "@/components/ui/custom/GradingPill";
import { aceSummary } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";
import type { ACE } from "@/lib/ace";

interface Props {
  ace: ACE;
  adventureName: string;
  showAltitudeWarning: boolean;
  showIsolationWarning: boolean;
  showTechnicalWarning: boolean;
}


const DOMAINS = [
  { label: "Engine",   axes: ["stamina", "power"],    color: "#f97316", desc: "Stamina & Power" },
  { label: "Chassis",  axes: ["strength", "agility"], color: "#22d3ee", desc: "Strength & Agility" },
  { label: "Elements", axes: ["water", "altitude"],   color: "#a78bfa", desc: "Water & Altitude" },
  { label: "Mind",     axes: ["nerve", "focus"],      color: "#10b981", desc: "Nerve & Focus" },
];

function avg(ace: ACE, axes: string[]) {
  const vals = axes.map(a => (ace as Record<string, number>)[a] ?? 0);
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
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
  const [userColor] = useState("#4ade80");

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setUserAce(p.ace);
      setProfileLabel(p.label);
    }
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
        <div className="flex flex-col sm:flex-row">

          {/* LEFT — description / CTA */}
          <div className="flex-1 flex flex-col justify-center gap-4 p-6 sm:border-r border-white/[0.06]">
            {userAce ? (
              <>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  {aceSummary(ace, adventureName)}
                </p>
                <Link
                  href="/matchmaker"
                  className="flex items-center gap-1.5 w-fit text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:brightness-110"
                  style={{ background: "rgba(255,81,0,0.1)", border: "1px solid rgba(255,81,0,0.2)", color: "#ff5100" }}
                >
                  Retake Assessment
                  <RotateCcw className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <div
                className="rounded-xl px-4 py-4 flex flex-col gap-3"
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
            )}
          </div>

          {/* RIGHT — radar + domain strip */}
          <div className="shrink-0 flex flex-col items-center">
            {/* Radar */}
            <div className="flex flex-col items-center pt-6 px-6 pb-4">
              <ACERadar ace={ace} userAce={userAce ?? undefined} userColor={userColor} size={260} showLabels />
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full bg-[#ff5100]" />
                  <span className="text-[9px] text-white/30 uppercase tracking-wide">Trek required</span>
                </div>
                {userAce && (
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="4" viewBox="0 0 14 4">
                      <line x1="0" y1="2" x2="14" y2="2" stroke={userColor} strokeWidth="1.5" strokeDasharray="4 2.5" />
                    </svg>
                    <span className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: userColor }}>
                      {profileLabel ?? "Your level"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Domain capability strip */}
            {userAce && (
              <div className="grid grid-cols-4 w-full border-t border-white/[0.06]">
                {DOMAINS.map(({ label, axes, color, desc }) => {
                  const trekVal = avg(ace, axes);
                  const userVal = avg(userAce, axes);
                  const meets = userVal >= trekVal;
                  return (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1.5 py-4 px-2 border-r border-white/[0.05] last:border-r-0"
                      style={{ background: `${color}05` }}
                    >
                      <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color }}>{label}</span>
                      <span className="text-[9px] text-white/25 text-center leading-tight">{desc}</span>
                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-sm font-black leading-none" style={{ color: userColor }}>{userVal}</span>
                        <span className="text-[9px] text-white/25 mb-px">/ {trekVal}</span>
                      </div>
                      <div
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: meets ? "#22c55e18" : "#ef444418",
                          color: meets ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {meets ? "✓ Ready" : `+${(trekVal - userVal).toFixed(1)} needed`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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
