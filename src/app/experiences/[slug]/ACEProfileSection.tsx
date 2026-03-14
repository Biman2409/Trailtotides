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

export default function ACEProfileSection({
  ace,
  adventureName,
  showAltitudeWarning,
  showIsolationWarning,
  showTechnicalWarning,
}: Props) {
  const [userAce, setUserAce] = useState<ACE | null>(null);
  const [profileLabel, setProfileLabel] = useState<string | null>(null);

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
        <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase">
          ACE Profile
        </p>
        <GradingPill />
      </div>

      {/* Radar card — single radar, left/right layout */}
      <div
        className="rounded-2xl p-6 mb-3"
        style={{
          background: "linear-gradient(135deg, #0c1020 0%, #0f1520 100%)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* LEFT — single radar (adventure + optional user overlay) */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <ACERadar ace={ace} userAce={userAce ?? undefined} size={220} showLabels />
            {userAce && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full bg-[#ff5100]" />
                  <span className="text-[9px] text-white/30 uppercase tracking-wide">Required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="4" viewBox="0 0 14 4">
                    <line x1="0" y1="2" x2="14" y2="2" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="3 2" />
                  </svg>
                  <span className="text-[9px] text-white/30 uppercase tracking-wide">Your level</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — description or CTA */}
          <div className="flex-1 flex flex-col justify-center gap-4 min-w-0">
            {userAce ? (
              /* Has profile — show summary + retake link */
              <>
                {profileLabel && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--text-tertiary)" }}>Your ACE Profile</p>
                    <p className="text-white font-bold text-lg tracking-tight">{profileLabel}</p>
                  </div>
                )}
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
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
              /* No profile — description + take assessment CTA */
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

      {/* Safety warning banners */}
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
    </section>
  );
}
