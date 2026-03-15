"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, ArrowRight, RotateCcw, Lock } from "lucide-react";
import { loadProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";

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
    label: "Trailblazer", color: "#4ade80", stars: 2, minScore: 16,
    desc: "Pushing into new terrain",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="9" r="1.6" fill="currentColor"/><circle cx="9.5" cy="13.5" r="1.6" fill="currentColor"/><circle cx="14.5" cy="17.5" r="1.6" fill="currentColor"/></svg>,
  },
  {
    label: "Navigator", color: "#f59e0b", stars: 3, minScore: 24,
    desc: "Reading the land with confidence",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 6.5L15.5 12L12 17.5L8.5 12L12 6.5Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M12 6.5L15.5 12L12 11L8.5 12L12 6.5Z" fill="currentColor"/></svg>,
  },
  {
    label: "Expeditioner", color: "#f97316", stars: 4, minScore: 32,
    desc: "Multi-day expeditions, any terrain",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L4 6.5V13.5C4 18.5 7.5 22.2 12 23.5C16.5 22.2 20 18.5 20 13.5V6.5L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M9 2L12 4.5L15 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.65"/><path d="M6.5 19L9.5 13L12 16L14.5 10.5L18 19H6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.35"/></svg>,
  },
  {
    label: "Apex", color: "#a78bfa", stars: 5, minScore: 40,
    desc: "Elite capability across all axes",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg>,
  },
];

const TIER_INFO: Record<string, { color: string; stars: number; icon: React.ReactNode }> = {
  "Uncharted":    { color: "#6b7280", stars: 0, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/><path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg> },
  "Pathfinder":  { color: "#22d3ee", stars: 1, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  "Trailblazer": { color: "#4ade80", stars: 2, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="9" r="1.6" fill="currentColor"/><circle cx="9.5" cy="13.5" r="1.6" fill="currentColor"/><circle cx="14.5" cy="17.5" r="1.6" fill="currentColor"/></svg> },
  "Navigator":   { color: "#f59e0b", stars: 3, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 6.5L15.5 12L12 17.5L8.5 12L12 6.5Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M12 6.5L15.5 12L12 11L8.5 12L12 6.5Z" fill="currentColor"/></svg> },
  "Expeditioner":{ color: "#f97316", stars: 4, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L4 6.5V13.5C4 18.5 7.5 22.2 12 23.5C16.5 22.2 20 18.5 20 13.5V6.5L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M9 2L12 4.5L15 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.65"/><path d="M6.5 19L9.5 13L12 16L14.5 10.5L18 19H6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.35"/></svg> },
  "Apex":        { color: "#a78bfa", stars: 5, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg> },
};

function RankProgressionBar({ totalScore, currentLabel }: { totalScore: number; currentLabel: string }) {
  const currentRankIndex = RANKS.findIndex(r => r.label === currentLabel);
  const currentRank = RANKS[currentRankIndex];
  const nextRank = RANKS[currentRankIndex + 1] ?? null;
  const progressPct = nextRank
    ? Math.min(100, Math.round(((totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100))
    : 100;

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
              <span className="text-[9px] text-white/30">
                <span className="font-semibold" style={{ color: `${nextRank.color}bb` }}>{nextRank.label}</span>
                <span className="text-white/20"> · {nextRank.minScore - totalScore} pts away</span>
              </span>
              <span className="text-[9px] font-mono text-white/25">{progressPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPct}%`,
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
      <div className="relative pt-1 pb-2">
        {/* Track background */}
        <div className="absolute h-px bg-white/10"
          style={{ top: "22px", left: `calc(100% / ${totalRanks * 2})`, right: `calc(100% / ${totalRanks * 2})` }} />

        {/* Track filled portion */}
        <div className="absolute h-px transition-all duration-700"
          style={{
            top: "22px",
            left: `calc(100% / ${totalRanks * 2})`,
            width: `calc((100% - 100% / ${totalRanks}) * ${filledFraction})`,
            background: `linear-gradient(to right, ${RANKS[0].color}80, ${currentRank.color})`,
          }} />

        {/* Rank nodes */}
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${totalRanks}, 1fr)` }}>
          {RANKS.map((rank, i) => {
            const isUnlocked = i <= currentRankIndex;
            const isCurrent  = i === currentRankIndex;
            return (
              <div key={rank.label} className="flex flex-col items-center gap-2">
                {/* Marker node */}
                <div className="relative flex items-center justify-center w-11 h-11">
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 animate-pulse"
                      style={{ borderColor: `${rank.color}60`, scale: "1.15" }} />
                  )}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center z-10 relative"
                    style={
                      isCurrent
                        ? { background: `${rank.color}25`, border: `2px solid ${rank.color}`, color: rank.color, boxShadow: `0 0 14px ${rank.color}55` }
                        : isUnlocked
                        ? { background: `${rank.color}18`, border: `1.5px solid ${rank.color}55`, color: rank.color }
                        : { background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.18)" }
                    }
                  >
                    <div style={{ transform: "scale(0.75)" }}>
                      {isUnlocked ? rank.icon : <Lock className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Score pip on track */}
                  {i > 0 && (
                    <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: isUnlocked ? rank.color : "rgba(255,255,255,0.15)" }} />
                  )}
                </div>

                {/* Label */}
                <p className="text-[7.5px] font-semibold text-center leading-tight tracking-wide"
                  style={{ color: isCurrent ? rank.color : isUnlocked ? `${rank.color}80` : "rgba(255,255,255,0.2)" }}>
                  {rank.label}
                </p>

                {/* Stars */}
                {rank.stars > 0 && (
                  <div className="flex gap-px -mt-1">
                    {Array.from({ length: rank.stars }).map((_, si) => (
                      <span key={si} className="text-[6px] leading-none"
                        style={{ color: isUnlocked ? rank.color : "rgba(255,255,255,0.1)" }}>★</span>
                    ))}
                  </div>
                )}

                {/* You chip */}
                {isCurrent && (
                  <span className="text-[6.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full -mt-1"
                    style={{ background: `${rank.color}25`, color: rank.color, border: `1px solid ${rank.color}40` }}>
                    You
                  </span>
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
    setStored(loadProfile());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!stored) {
    return (
      <div className="rounded-3xl p-6 md:p-8 border border-white/10 bg-white/5">
        <h2 className="text-lg font-bold text-white mb-1">ACE Profile</h2>
        <p className="text-white/40 text-sm mb-6">Take the assessment to map your physical capability profile across 8 axes.</p>
        <div className="flex flex-col items-center py-6 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center">
            <Compass className="w-7 h-7 text-[#ff5100]/50" />
          </div>
          <p className="text-white/30 text-sm">No assessment taken yet</p>
          <Link
            href="/matchmaker"
            className="inline-flex items-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all group"
          >
            Take Assessment
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  const tier = TIER_INFO[stored.label] ?? TIER_INFO["Pathfinder"];
  const totalScore = Object.values(stored.ace).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-3xl p-6 md:p-8 border border-white/10 bg-white/5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">ACE Profile</h2>
        <Link
          href="/matchmaker"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
          style={{ background: "rgba(255,81,0,0.1)", border: "1px solid rgba(255,81,0,0.2)", color: "#ff5100" }}
        >
          <RotateCcw className="w-3 h-3" />
          Retake
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Radar */}
        <div className="shrink-0 flex justify-center">
          <ACERadar ace={stored.ace} size={220} showLabels />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 min-w-0 flex-1">
          {/* Rank progression */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <RankProgressionBar totalScore={totalScore} currentLabel={stored.label} />
          </div>

          {stored.summary && (
            <p className="text-white/40 text-xs leading-relaxed border-l-2 border-white/10 pl-3">
              {stored.summary}
            </p>
          )}

          <Link
            href="/matchmaker"
            className="inline-flex items-center gap-1.5 bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all group w-fit"
          >
            Find matching adventures
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
