"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, ArrowRight, RotateCcw, Lock } from "lucide-react";
import { loadProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";

const RANKS = [
  {
    label: "Pathfinder", color: "#22d3ee", stars: 1, minScore: 8,
    desc: "First steps into the wild",
    icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="4.5" r="1.5" fill="currentColor"/><path d="M10 7v4l-2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 11l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    label: "Trailblazer", color: "#4ade80", stars: 2, minScore: 16,
    desc: "Pushing into new terrain",
    icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M5 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="10" r="1.5" fill="currentColor"/><circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="12" cy="13" r="1.5" fill="currentColor"/></svg>,
  },
  {
    label: "Navigator", color: "#f59e0b", stars: 3, minScore: 24,
    desc: "Reading the land with confidence",
    icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/><path d="M10 5l2 4H8l2-4z" fill="currentColor"/><path d="M10 15l-2-4h4l-2 4z" fill="currentColor" fillOpacity="0.4"/></svg>,
  },
  {
    label: "Expeditioner", color: "#f97316", stars: 4, minScore: 32,
    desc: "Multi-day expeditions, any terrain",
    icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M3 15l3.5-5 2.5 3 3-4.5L16 15H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor"/></svg>,
  },
  {
    label: "Apex", color: "#a78bfa", stars: 5, minScore: 40,
    desc: "Elite capability across all axes",
    icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M10 3l2 4 4.5.7-3.25 3.15.77 4.5L10 13.25l-4.02 2.1.77-4.5L3.5 7.7 8 7l2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3"/></svg>,
  },
];

const TIER_INFO: Record<string, { color: string; stars: number; icon: React.ReactNode }> = {
  "Uncharted":    { color: "#6b7280", stars: 0, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M7.5 7.5a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg> },
  "Pathfinder":  { color: "#22d3ee", stars: 1, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="4.5" r="1.5" fill="currentColor"/><path d="M10 7v4l-2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 11l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  "Trailblazer": { color: "#4ade80", stars: 2, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M5 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="10" r="1.5" fill="currentColor"/><circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="12" cy="13" r="1.5" fill="currentColor"/></svg> },
  "Navigator":   { color: "#f59e0b", stars: 3, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/><path d="M10 5l2 4H8l2-4z" fill="currentColor"/><path d="M10 15l-2-4h4l-2 4z" fill="currentColor" fillOpacity="0.4"/></svg> },
  "Expeditioner":{ color: "#f97316", stars: 4, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M3 15l3.5-5 2.5 3 3-4.5L16 15H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor"/></svg> },
  "Apex":        { color: "#a78bfa", stars: 5, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M10 3l2 4 4.5.7-3.25 3.15.77 4.5L10 13.25l-4.02 2.1.77-4.5L3.5 7.7 8 7l2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/></svg> },
};

function RankProgressionBar({ totalScore, currentLabel }: { totalScore: number; currentLabel: string }) {
  const currentRankIndex = RANKS.findIndex(r => r.label === currentLabel);
  const currentRank = RANKS[currentRankIndex];
  const nextRank = RANKS[currentRankIndex + 1] ?? null;
  const progressPct = nextRank
    ? Math.min(100, Math.round(((totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100))
    : 100;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/25">Rank Progression</p>
        <span className="text-[10px] font-mono text-white/25 bg-white/5 px-2 py-0.5 rounded-full">{totalScore} pts</span>
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
            <span className="text-[9px] text-white/20 uppercase tracking-wider">Rank {currentRankIndex + 1}/5</span>
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
            <div className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(to right, ${RANKS[0].color}, #a78bfa)`, boxShadow: "0 0 10px #a78bfa35" }} />
            <span className="text-[9px] uppercase tracking-widest font-bold text-[#a78bfa]">Max Rank</span>
          </div>
        )}
      </div>

      {/* Rank ladder grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {RANKS.map((rank, i) => {
          const isUnlocked = i <= currentRankIndex;
          const isCurrent  = i === currentRankIndex;
          return (
            <div
              key={rank.label}
              className="relative flex flex-col items-center gap-1.5 rounded-xl py-3 px-1"
              style={
                isCurrent
                  ? { background: `${rank.color}18`, border: `1px solid ${rank.color}40`, boxShadow: `0 0 10px ${rank.color}20` }
                  : isUnlocked
                  ? { background: `${rank.color}0a`, border: `1px solid ${rank.color}1a` }
                  : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }
              }
            >
              {/* Rank number */}
              <span className="absolute top-1.5 right-1.5 text-[7px] font-bold"
                style={{ color: isUnlocked ? `${rank.color}70` : "rgba(255,255,255,0.1)" }}>
                {i + 1}
              </span>

              {/* Icon */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={
                  isCurrent
                    ? { background: `${rank.color}25`, color: rank.color }
                    : isUnlocked
                    ? { background: `${rank.color}15`, color: `${rank.color}99` }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.15)" }
                }
              >
                {isUnlocked
                  ? <div className="scale-[0.8]">{rank.icon}</div>
                  : <Lock className="w-2.5 h-2.5" />
                }
              </div>

              {/* Name */}
              <p className="text-[7.5px] font-semibold leading-tight text-center"
                style={{ color: isCurrent ? rank.color : isUnlocked ? `${rank.color}70` : "rgba(255,255,255,0.15)" }}>
                {rank.label}
              </p>

              {/* Stars */}
              <div className="flex gap-px">
                {Array.from({ length: rank.stars }).map((_, si) => (
                  <span key={si} className="text-[6px] leading-none"
                    style={{ color: isUnlocked ? rank.color : "rgba(255,255,255,0.1)" }}>★</span>
                ))}
              </div>

              {/* YOU tag */}
              {isCurrent && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 text-[6.5px] font-bold uppercase tracking-wider px-1.5 py-px rounded-b-md"
                  style={{ background: rank.color, color: "#000" }}>
                  You
                </span>
              )}
            </div>
          );
        })}
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
