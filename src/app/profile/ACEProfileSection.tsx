"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, ArrowRight, RotateCcw, Lock } from "lucide-react";
import { loadProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";

const RANKS = [
  {
    label: "Pathfinder",
    color: "#22d3ee",
    stars: 1,
    minScore: 8,
    maxScore: 15,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <circle cx="10" cy="4.5" r="1.5" fill="currentColor" />
        <path d="M10 7v4l-2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 11l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 17c1.5-1 3.5-1.5 5-1s3.5.5 5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
      </svg>
    ),
  },
  {
    label: "Trailblazer",
    color: "#4ade80",
    stars: 2,
    minScore: 16,
    maxScore: 23,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <path d="M5 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="10" r="1.5" fill="currentColor" />
        <circle cx="9" cy="6" r="1.5" fill="currentColor" />
        <circle cx="12" cy="13" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Navigator",
    color: "#f59e0b",
    stars: 3,
    minScore: 24,
    maxScore: 31,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        <path d="M10 5l2 4H8l2-4z" fill="currentColor" />
        <path d="M10 15l-2-4h4l-2 4z" fill="currentColor" fillOpacity="0.4" />
      </svg>
    ),
  },
  {
    label: "Expeditioner",
    color: "#f97316",
    stars: 4,
    minScore: 32,
    maxScore: 39,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <path d="M3 15l3.5-5 2.5 3 3-4.5L16 15H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor" />
        <path d="M7 15v-2a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Apex",
    color: "#a78bfa",
    stars: 5,
    minScore: 40,
    maxScore: 40,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <path d="M10 3l2 4 4.5.7-3.25 3.15.77 4.5L10 13.25l-4.02 2.1.77-4.5L3.5 7.7 8 7l2-4z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25" />
      </svg>
    ),
  },
];

function RankProgressionBar({ totalScore, currentLabel }: { totalScore: number; currentLabel: string }) {
  const currentRankIndex = RANKS.findIndex(r => r.label === currentLabel);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-white/30">Rank Progression</p>
        <p className="text-[10px] text-white/30 font-mono">{totalScore} / 40 pts</p>
      </div>

      {/* Track */}
      <div className="relative">
        {/* Base connector line */}
        <div className="absolute top-[18px] left-4 right-4 h-px bg-white/10" />

        {/* Filled connector up to current rank */}
        {currentRankIndex >= 0 && (
          <div
            className="absolute top-[18px] left-4 h-px transition-all duration-700"
            style={{
              width: currentRankIndex === RANKS.length - 1
                ? "calc(100% - 2rem)"
                : `calc(${(currentRankIndex / (RANKS.length - 1)) * 100}% - ${currentRankIndex === 0 ? "1rem" : "0px"})`,
              background: `linear-gradient(to right, ${RANKS[0].color}, ${RANKS[currentRankIndex].color})`,
            }}
          />
        )}

        {/* Rank nodes */}
        <div className="relative flex items-start justify-between">
          {RANKS.map((rank, i) => {
            const isUnlocked = i <= currentRankIndex;
            const isCurrent = i === currentRankIndex;

            return (
              <div key={rank.label} className="flex flex-col items-center gap-1.5" style={{ width: "20%" }}>
                {/* Node */}
                <div
                  className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                  style={
                    isCurrent
                      ? {
                          background: `${rank.color}25`,
                          border: `2px solid ${rank.color}`,
                          color: rank.color,
                          boxShadow: `0 0 12px ${rank.color}40`,
                        }
                      : isUnlocked
                      ? {
                          background: `${rank.color}18`,
                          border: `1.5px solid ${rank.color}60`,
                          color: rank.color,
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          border: "1.5px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.15)",
                        }
                  }
                >
                  {isUnlocked ? rank.icon : <Lock className="w-3 h-3" />}

                  {/* Current rank pulse ring */}
                  {isCurrent && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-20"
                      style={{ background: rank.color }}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <p
                    className="text-[9px] font-semibold leading-tight tracking-wide"
                    style={{ color: isCurrent ? rank.color : isUnlocked ? `${rank.color}99` : "rgba(255,255,255,0.2)" }}
                  >
                    {rank.label}
                  </p>
                  <div className="flex gap-px">
                    {Array.from({ length: rank.stars }).map((_, si) => (
                      <span
                        key={si}
                        className="text-[7px] leading-none"
                        style={{ color: isUnlocked ? rank.color : "rgba(255,255,255,0.12)" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score progress within current tier */}
      {currentRankIndex >= 0 && currentRankIndex < RANKS.length - 1 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] text-white/25 uppercase tracking-wider">
              Progress to {RANKS[currentRankIndex + 1].label}
            </p>
            <p className="text-[9px] text-white/25 font-mono">
              {totalScore} / {RANKS[currentRankIndex + 1].minScore}
            </p>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(
                  100,
                  ((totalScore - RANKS[currentRankIndex].minScore) /
                    (RANKS[currentRankIndex + 1].minScore - RANKS[currentRankIndex].minScore)) *
                    100
                )}%`,
                background: `linear-gradient(to right, ${RANKS[currentRankIndex].color}, ${RANKS[currentRankIndex + 1].color})`,
              }}
            />
          </div>
        </div>
      )}

      {currentRankIndex === RANKS.length - 1 && (
        <div className="mt-4 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full" style={{ background: `linear-gradient(to right, ${RANKS[0].color}, #a78bfa)` }} />
          <p className="text-[9px] uppercase tracking-widest font-bold text-[#a78bfa]">Max Rank</p>
        </div>
      )}
    </div>
  );
}

const TIER_INFO: Record<string, { color: string; stars: number; icon: React.ReactNode }> = {
  "Uncharted":    { color: "#6b7280", stars: 0, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M7.5 7.5a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg> },
  "Pathfinder":  { color: "#22d3ee", stars: 1, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="4.5" r="1.5" fill="currentColor"/><path d="M10 7v4l-2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 11l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 17c1.5-1 3.5-1.5 5-1s3.5.5 5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4"/></svg> },
  "Trailblazer": { color: "#4ade80", stars: 2, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M5 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="10" r="1.5" fill="currentColor"/><circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="12" cy="13" r="1.5" fill="currentColor"/></svg> },
  "Navigator":   { color: "#f59e0b", stars: 3, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/><path d="M10 5l2 4H8l2-4z" fill="currentColor"/><path d="M10 15l-2-4h4l-2 4z" fill="currentColor" fillOpacity="0.4"/></svg> },
  "Expeditioner":{ color: "#f97316", stars: 4, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M3 15l3.5-5 2.5 3 3-4.5L16 15H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor"/><path d="M7 15v-2a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  "Apex":        { color: "#a78bfa", stars: 5, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M10 3l2 4 4.5.7-3.25 3.15.77 4.5L10 13.25l-4.02 2.1.77-4.5L3.5 7.7 8 7l2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/></svg> },
};

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

        {/* Tier + info */}
        <div className="flex flex-col justify-center gap-4 min-w-0 flex-1">
          {/* Current rank badge */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl border"
            style={{ background: `${tier.color}0d`, borderColor: `${tier.color}28` }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${tier.color}20`, color: tier.color }}
            >
              {tier.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5 text-white/40">Your Rank</p>
              <p className="font-bold text-base leading-tight" style={{ color: tier.color }}>{stored.label}</p>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: tier.stars }).map((_, i) => (
                  <span key={i} className="text-sm" style={{ color: tier.color }}>★</span>
                ))}
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] text-white/25 uppercase tracking-wider">Score</p>
              <p className="text-xl font-bold tabular-nums" style={{ color: tier.color }}>{totalScore}</p>
              <p className="text-[9px] text-white/20">/ 40</p>
            </div>
          </div>

          {/* Rank progression bar */}
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
