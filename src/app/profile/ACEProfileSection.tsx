"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { loadProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";

const RANKS = [
  {
    label: "Uncharted", color: "#6b7280", stars: 0, minScore: 0,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/><path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg>,
  },
  {
    label: "Pathfinder", color: "#22d3ee", stars: 1, minScore: 8,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Navigator", color: "#4ade80", stars: 2, minScore: 16,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/></svg>,
  },
  {
    label: "Trailblazer", color: "#f59e0b", stars: 3, minScore: 24,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Vanguard", color: "#f97316", stars: 4, minScore: 32,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg>,
  },
  {
    label: "Apex", color: "#a78bfa", stars: 5, minScore: 40,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg>,
  },
];

export default function ACEProfileSection() {
  const [stored, setStored] = useState<ReturnType<typeof loadProfile>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then((profile) => {
        setStored(profile);
        setMounted(true);
      });
    });
  }, []);

  if (!mounted) return null;

  if (!stored) {
    const U = RANKS[0];
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(160deg, ${U.color}0e 0%, rgba(14,14,18,0) 60%)`, border: `1px solid ${U.color}22` }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${U.color}20`, color: U.color }}>
              <div className="scale-[1.4]">{U.icon}</div>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-white/30 mb-0.5">Adventure Tier</p>
              <p className="text-lg font-bold leading-none" style={{ color: U.color }}>Uncharted</p>
            </div>
          </div>
        </div>
        <div className="mx-5 h-px" style={{ background: `${U.color}18` }} />
        <div className="px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Your capability is unassessed</p>
            <p className="text-white/35 text-xs leading-relaxed max-w-sm">Take the 8-question ACE assessment to map your physical profile and unlock your adventure rank.</p>
          </div>
          <Link href="/matchmaker" className="shrink-0 inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:brightness-110 hover:-translate-y-0.5" style={{ background: "#ff5100" }}>
            Take Assessment
          </Link>
        </div>
      </div>
    );
  }

  const totalScore = Object.values(stored.ace).reduce((a, b) => a + b, 0);
  const currentRankIndex = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const currentRank = RANKS[currentRankIndex];
  const nextRank = RANKS[currentRankIndex + 1] ?? null;
  const progressPct = nextRank
    ? Math.min(100, Math.round(((totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100))
    : 100;
  const totalRanks = RANKS.length;
  const ptsNeeded = nextRank ? nextRank.minScore - totalScore : 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(160deg, ${currentRank.color}0e 0%, rgba(14,14,18,0) 60%)`, border: `1px solid ${currentRank.color}22` }}>

      {/* ── Two-column layout: radar left | rank right ── */}
      <div className="flex flex-col sm:flex-row">

        {/* Left: ACE Radar */}
        <div
          className="flex flex-col items-center gap-3 p-5 sm:p-6 shrink-0"
          style={{ borderRight: "1px solid rgba(255,255,255,0.05)", background: "radial-gradient(ellipse at center, rgba(255,81,0,0.05) 0%, transparent 70%)" }}
        >
          <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/30 self-start">Capability Breakdown</p>
          <ACERadar ace={stored.ace} size={200} showLabels />
        </div>

        {/* Right: tier header + progress */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Tier header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${currentRank.color}20`, color: currentRank.color, boxShadow: `0 0 20px ${currentRank.color}40` }}
              >
                <div className="scale-[1.3]">{currentRank.icon}</div>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-white/30 mb-0.5">Adventure Tier</p>
                <p className="text-lg font-bold leading-none" style={{ color: currentRank.color }}>{currentRank.label}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-sm" style={{ color: i < currentRank.stars ? currentRank.color : "rgba(255,255,255,0.08)" }}>★</span>
                ))}
              </div>
              <span className="text-[9px] font-semibold text-white/25">Rank {currentRank.stars} / 5</span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px" style={{ background: `${currentRank.color}18` }} />

          {/* Progress */}
          <div className="px-5 pt-4 pb-5 flex flex-col gap-3 flex-1 justify-center">
            {nextRank ? (
              <>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-4xl font-black tabular-nums tracking-tight leading-none" style={{ color: currentRank.color }}>
                      {progressPct}<span className="text-xl font-bold opacity-70">%</span>
                    </span>
                    <p className="text-[10px] text-white/35 mt-1">
                      to <span className="font-semibold" style={{ color: nextRank.color }}>{nextRank.label}</span>
                    </p>
                  </div>
                  <div className="text-right pb-0.5">
                    <p className="text-2xl font-bold tabular-nums text-white/80">{ptsNeeded}</p>
                    <p className="text-[10px] text-white/30">pts needed</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{
                        width: `${((currentRankIndex + progressPct / 100) / (totalRanks - 1)) * 100}%`,
                        background: `linear-gradient(to right, ${RANKS[1].color}cc, ${currentRank.color})`,
                        boxShadow: `0 0 12px ${currentRank.color}50`,
                      }}
                    />
                    {RANKS.slice(1, -1).map((rank, i) => (
                      <div key={rank.label} className="absolute inset-y-0 w-px" style={{ left: `${((i + 1) / (totalRanks - 1)) * 100}%`, background: "rgba(14,14,18,0.7)" }} />
                    ))}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-700"
                      style={{
                        left: `${((currentRankIndex + progressPct / 100) / (totalRanks - 1)) * 100}%`,
                        background: currentRank.color,
                        borderColor: "#0e0e12",
                        boxShadow: `0 0 10px ${currentRank.color}`,
                      }}
                    />
                  </div>
                  <div className="relative h-4 overflow-hidden">
                    {RANKS.map((rank, i) => {
                      const isCurrent = i === currentRankIndex;
                      const isUnlocked = i < currentRankIndex;
                      const pct = (i / (totalRanks - 1)) * 100;
                      return (
                        <span
                          key={rank.label}
                          className="absolute text-[7.5px] font-semibold leading-none whitespace-nowrap top-0"
                          style={{
                            left: `${pct}%`,
                            transform: i === 0 ? "none" : i === totalRanks - 1 ? "translateX(-100%)" : "translateX(-50%)",
                            color: isCurrent ? currentRank.color : isUnlocked ? `${rank.color}55` : "rgba(255,255,255,0.15)",
                          }}
                        >
                          {rank.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 py-2">
                <div className="w-full h-2.5 rounded-full" style={{ background: `linear-gradient(to right, ${RANKS[1].color}, #a78bfa)`, boxShadow: "0 0 14px #a78bfa50" }} />
                <p className="text-xs font-bold tracking-widest uppercase text-[#a78bfa]">Maximum Rank — Apex</p>
              </div>
            )}

            <Link
              href="/matchmaker"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:brightness-110 mt-1 w-fit"
              style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.18)", color: "#ff7d47" }}
            >
              <RotateCcw className="w-3 h-3" />
              Retake Assessment
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
