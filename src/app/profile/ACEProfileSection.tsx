"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Lock } from "lucide-react";
import { loadProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";
import AchievementBadges from "@/components/ui/custom/AchievementBadges";

const RANKS = [
  {
    label: "Uncharted", color: "#6b7280", stars: 0, minScore: 0,
    desc: "Journey not yet begun",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/><path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg>,
  },
  {
    label: "Pathfinder", color: "#22d3ee", stars: 1, minScore: 8,
    desc: "First steps into the wild",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Navigator", color: "#4ade80", stars: 2, minScore: 16,
    desc: "Finding the way through new terrain",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/></svg>,
  },
  {
    label: "Trailblazer", color: "#f59e0b", stars: 3, minScore: 24,
    desc: "Blazing paths where none exist",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Vanguard", color: "#f97316", stars: 4, minScore: 32,
    desc: "Leading the charge on any frontier",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg>,
  },
  {
    label: "Apex", color: "#a78bfa", stars: 5, minScore: 40,
    desc: "Elite capability across all axes",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg>,
  },
];

const TIER_INFO: Record<string, { color: string; stars: number; icon: React.ReactNode }> = {
  "Uncharted":   { color: "#6b7280", stars: 0, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/><path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg> },
  "Pathfinder":  { color: "#22d3ee", stars: 1, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  "Navigator":   { color: "#4ade80", stars: 2, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/></svg> },
  "Trailblazer": { color: "#f59e0b", stars: 3, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  "Vanguard":    { color: "#f97316", stars: 4, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg> },
  "Apex":        { color: "#a78bfa", stars: 5, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg> },
};

function RankProgressionBar({ totalScore }: { totalScore: number }) {
  const currentRankIndex = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const currentRank = RANKS[currentRankIndex];
  const nextRank = RANKS[currentRankIndex + 1] ?? null;
  const rawPct = nextRank
    ? Math.min(100, Math.round(((totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100))
    : 100;
  const progressPct = Math.max(0, rawPct);
  const justUnlocked = nextRank !== null && totalScore === currentRank.minScore && currentRankIndex > 0;
  const ptsNeeded = nextRank ? nextRank.minScore - totalScore : 0;

  const totalRanks = RANKS.length;
  const filledFraction = totalRanks > 1
    ? (currentRankIndex + (nextRank ? progressPct / 100 : 1)) / (totalRanks - 1)
    : 1;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/25">Rank Progression</p>
        <span className="text-[10px] font-mono text-white/25 bg-white/5 px-2 py-0.5 rounded-full">{totalScore} / 40 pts</span>
      </div>

      {/* Current rank hero card */}
      <div
        className="relative rounded-2xl p-4 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentRank.color}18 0%, ${currentRank.color}08 100%)`,
          border: `1px solid ${currentRank.color}30`,
        }}
      >
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ background: currentRank.color }} />
        <div className="relative flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${currentRank.color}22`, color: currentRank.color, boxShadow: `0 0 18px ${currentRank.color}30` }}
          >
            {currentRank.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/30 mb-0.5">Current Rank</p>
            <p className="font-bold text-base leading-tight" style={{ color: currentRank.color }}>{currentRank.label}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{currentRank.desc}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, si) => (
                <span key={si} className="text-sm" style={{ color: si < currentRank.stars ? currentRank.color : "rgba(255,255,255,0.08)" }}>★</span>
              ))}
            </div>
            <span className="text-[9px] text-white/20 uppercase tracking-wider">Rank {currentRankIndex} / 5</span>
          </div>
        </div>

        {/* Progress to next */}
        {nextRank ? (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              {justUnlocked ? (
                <span className="text-[9px] font-semibold" style={{ color: currentRank.color }}>
                  Rank just unlocked! — score {ptsNeeded} more pts to reach <span style={{ color: nextRank.color }}>{nextRank.label}</span>
                </span>
              ) : (
                <>
                  <span className="text-[9px] text-white/30">
                    <span className="text-white/40">Next: </span>
                    <span className="font-semibold" style={{ color: nextRank.color }}>{nextRank.label}</span>
                    <span className="text-white/25"> — {ptsNeeded} pts needed</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold" style={{ color: currentRank.color }}>{progressPct}% there</span>
                </>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: justUnlocked ? "3%" : `${progressPct}%`,
                  background: `linear-gradient(to right, ${currentRank.color}, ${nextRank.color})`,
                  boxShadow: `0 0 8px ${currentRank.color}50`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(to right, ${RANKS[1].color}, #a78bfa)`, boxShadow: "0 0 10px #a78bfa35" }} />
            <span className="text-[9px] uppercase tracking-widest font-bold text-[#a78bfa]">Max Rank</span>
          </div>
        )}
      </div>

      {/* Rank track timeline */}
      <div className="w-full">
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${totalRanks}, 1fr)` }}>

          {/* Track bg — inside grid so z-index is in same stacking context as nodes */}
          <div
            className="absolute h-px pointer-events-none"
            style={{
              top: "16px",
              left: `calc(100% / ${totalRanks * 2})`,
              right: `calc(100% / ${totalRanks * 2})`,
              background: "rgba(255,255,255,0.08)",
              zIndex: 0,
            }}
          />
          {/* Track fill */}
          <div
            className="absolute h-px pointer-events-none transition-all duration-700"
            style={{
              top: "16px",
              left: `calc(100% / ${totalRanks * 2})`,
              width: `calc((100% - 100% / ${totalRanks}) * ${filledFraction})`,
              background: `linear-gradient(to right, ${RANKS[1].color}90, ${currentRank.color})`,
              boxShadow: `0 0 6px ${currentRank.color}80`,
              zIndex: 0,
            }}
          />

          {RANKS.map((rank, i) => {
            const isUnlocked = i <= currentRankIndex;
            const isCurrent  = i === currentRankIndex;
            return (
              <div
                key={rank.label}
                className="flex flex-col items-center gap-1.5"
                style={{ position: "relative", zIndex: 1 }}
              >
                {/* Badge circle — solid bg so track never bleeds through */}
                <div className="relative flex items-center justify-center">
                  {isCurrent && (
                    <div
                      className="absolute rounded-full animate-pulse pointer-events-none"
                      style={{ inset: "-5px", border: `1.5px solid ${rank.color}50` }}
                    />
                  )}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={
                      isCurrent
                        ? {
                            background: `color-mix(in srgb, ${rank.color} 22%, #0e0e12)`,
                            border: `2px solid ${rank.color}`,
                            color: rank.color,
                            boxShadow: `0 0 14px ${rank.color}60`,
                          }
                        : isUnlocked
                        ? {
                            background: `color-mix(in srgb, ${rank.color} 14%, #0e0e12)`,
                            border: `1.5px solid ${rank.color}50`,
                            color: rank.color,
                          }
                        : {
                            background: "#13131a",
                            border: "1.5px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.2)",
                          }
                    }
                  >
                    <div style={{ transform: "scale(0.72)" }}>
                      {isUnlocked ? rank.icon : <Lock className="w-3 h-3" />}
                    </div>
                  </div>
                </div>

                {/* Label */}
                <p
                  className="text-[7px] font-semibold text-center leading-tight tracking-wide w-full"
                  style={{ color: isCurrent ? rank.color : isUnlocked ? `${rank.color}70` : "rgba(255,255,255,0.2)" }}
                >
                  {rank.label}
                </p>

                {/* Stars */}
                {rank.stars > 0 ? (
                  <div className="flex gap-px -mt-1">
                    {Array.from({ length: rank.stars }).map((_, si) => (
                      <span key={si} className="text-[5px] leading-none"
                        style={{ color: isUnlocked ? rank.color : "rgba(255,255,255,0.12)" }}>★</span>
                    ))}
                  </div>
                ) : (
                  <div className="h-[6px] -mt-1" />
                )}

                {/* You chip */}
                {isCurrent ? (
                  <span
                    className="text-[6px] font-bold uppercase tracking-wider px-1.5 py-px rounded-full"
                    style={{ background: `${rank.color}20`, color: rank.color, border: `1px solid ${rank.color}40` }}
                  >
                    You
                  </span>
                ) : (
                  <div className="h-[14px]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ACEProfileSection() {
  const [stored, setStored] = useState<ReturnType<typeof loadProfile>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Try server first (logged-in users), fall back to localStorage
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then((profile) => {
        setStored(profile);
        setMounted(true);
      });
    });
  }, []);

  if (!mounted) return null;

  const UNCHARTED = RANKS[0];

  if (!stored) {
    return (
      <div
        className="rounded-3xl border overflow-hidden"
        style={{ background: `linear-gradient(145deg, ${UNCHARTED.color}10 0%, rgba(14,14,18,0) 60%)`, borderColor: `${UNCHARTED.color}25` }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-[#ff5100]" />
            <h2 className="text-sm font-bold tracking-wide text-white uppercase" style={{ letterSpacing: "0.12em" }}>Capability Profile</h2>
          </div>
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: `${UNCHARTED.color}18`, color: UNCHARTED.color, border: `1px solid ${UNCHARTED.color}30` }}
          >
            Unassessed
          </span>
        </div>

        <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Rank badge */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: `${UNCHARTED.color}18`, color: UNCHARTED.color, border: `1px solid ${UNCHARTED.color}30`, boxShadow: `0 0 28px ${UNCHARTED.color}20` }}
            >
              <div className="scale-[2]">{UNCHARTED.icon}</div>
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/25 mb-0.5">Current Rank</p>
              <p className="font-bold text-base" style={{ color: UNCHARTED.color }}>{UNCHARTED.label}</p>
              <div className="flex gap-0.5 justify-center mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-xs" style={{ color: "rgba(255,255,255,0.08)" }}>★</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: info + CTA */}
          <div className="flex-1 flex flex-col gap-3">
            <div>
              <p className="text-white font-semibold text-base mb-1">Your capability is unknown</p>
              <p className="text-white/40 text-sm leading-relaxed">
                Take the 8-question ACE assessment to map your physical profile across Stamina, Strength, Altitude, and more — then see exactly which adventures you&apos;re built for.
              </p>
            </div>

            {/* Rank preview pills */}
            <div className="flex flex-wrap gap-1.5">
              {RANKS.slice(1).map((r) => (
                <span
                  key={r.label}
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                  style={{ background: `${r.color}12`, color: `${r.color}80`, border: `1px solid ${r.color}20` }}
                >
                  {r.label}
                </span>
              ))}
            </div>

            <Link
              href="/matchmaker"
              className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:brightness-110 hover:-translate-y-0.5 w-fit"
              style={{ background: "#ff5100" }}
            >
              Take Assessment — 3 mins
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalScore = Object.values(stored.ace).reduce((a, b) => a + b, 0);
  const derivedLabel =
    totalScore >= 40 ? "Apex" :
    totalScore >= 32 ? "Vanguard" :
    totalScore >= 24 ? "Trailblazer" :
    totalScore >= 16 ? "Navigator" :
    totalScore >= 8  ? "Pathfinder" : "Uncharted";
  const tier = TIER_INFO[derivedLabel] ?? TIER_INFO["Pathfinder"];

  return (
    <div className="rounded-3xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)" }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full bg-[#ff5100]" />
          <h2 className="text-sm font-bold tracking-wide text-white uppercase" style={{ letterSpacing: "0.12em" }}>Capability Profile</h2>
        </div>
        <Link
          href="/matchmaker"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
          style={{ background: "rgba(255,81,0,0.1)", border: "1px solid rgba(255,81,0,0.2)", color: "#ff5100" }}
        >
          <RotateCcw className="w-3 h-3" />
          Retake
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-0">
        {/* Radar panel */}
        <div
          className="shrink-0 flex items-center justify-center p-6 sm:p-8"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,81,0,0.06) 0%, transparent 70%)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <ACERadar ace={stored.ace} size={240} showLabels />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 min-w-0 flex-1 p-6">
          {/* Rank progression */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <RankProgressionBar totalScore={totalScore} />
          </div>

          {/* Achievements */}
          <AchievementBadges ace={stored.ace} />

          <Link
            href="/matchmaker"
            className="inline-flex items-center gap-1.5 bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all group w-fit mt-auto"
          >
            Find matching adventures
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
