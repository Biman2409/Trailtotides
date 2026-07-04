"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { loadProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";
import RankBar from "@/components/ui/custom/RankBar";

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
    let cancelled = false;
    import("@/lib/matchmaker").then(({ loadProfileFromServer }) => {
      loadProfileFromServer().then((profile) => {
        if (!cancelled) { setStored(profile); setMounted(true); }
      });
    });
    return () => { cancelled = true; };
  }, []);

  if (!mounted) return null;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!stored) {
    const U = RANKS[0];
    return (
      <div
        className="rounded-2xl sm:rounded-3xl overflow-hidden border relative"
        style={{ background: `linear-gradient(150deg, ${U.color}14 0%, transparent 60%)`, borderColor: `${U.color}25` }}
      >
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: U.color }} />

        {/* Identity row */}
        <div className="relative flex items-center gap-3 px-4 sm:px-5 pt-4 pb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${U.color}18`, color: U.color, boxShadow: `0 0 18px ${U.color}30`, border: `1px solid ${U.color}25` }}
          >
            <div className="scale-[1.3]">{U.icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] uppercase tracking-[0.22em] font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>Capability Tier</p>
            <h1 className="text-[20px] font-black tracking-tight leading-none" style={{ color: U.color }}>Uncharted</h1>
          </div>
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <div className="flex items-center gap-[2px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[10px] leading-none" style={{ color: "var(--text-muted)" }}>★</span>
              ))}
            </div>
            <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>Rank 0 of 5</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 sm:mx-5 h-px" style={{ background: `${U.color}12` }} />

        {/* CTA */}
        <div className="px-4 sm:px-5 pt-3 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Your capability is unassessed</p>
            <p className="text-xs leading-relaxed max-w-sm" style={{ color: "var(--text-tertiary)" }}>Take the 8-question ACE<sup>™</sup> assessment to map your physical profile and unlock your adventure rank.</p>
          </div>
          <Link
            href="/matchmaker"
            className="shrink-0 inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{ background: "#ff5100" }}
          >
            Take Assessment
          </Link>
        </div>
      </div>
    );
  }

  // ── Ranked state ────────────────────────────────────────────────────────────
  const totalScore = Object.values(stored.ace).reduce((a, b) => a + b, 0);
  const currentRankIndex = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const currentRank = RANKS[currentRankIndex];
  const nextRank = RANKS[currentRankIndex + 1] ?? null;
  // progressPct = % through current rank's segment toward the next
  const progressPct = nextRank
    ? Math.min(100, Math.max(0, Math.round(((totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100)))
    : 100;
  const ptsNeeded = nextRank ? nextRank.minScore - totalScore : 0;
  // barPct = position along the full bar (0–100%). Each rank = 1/(N-1) of total width.
  const N = RANKS.length; // 6
  const segmentWidth = 100 / (N - 1); // 20% per rank
  const barPct = nextRank === null ? 100 : Math.min(100, currentRankIndex * segmentWidth + (progressPct / 100) * segmentWidth);

  return (
    <div
      className="rounded-2xl sm:rounded-3xl overflow-hidden border relative"
      style={{ background: `linear-gradient(150deg, ${currentRank.color}14 0%, transparent 60%)`, borderColor: `${currentRank.color}25` }}
    >
      <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: currentRank.color }} />

      {/* ── Main body: left = tier identity + rank progression | right = radar ── */}
      <div className="relative flex items-stretch gap-0">

        {/* Left column: identity + progression */}
        <div className="flex-1 min-w-0 flex flex-col px-4 sm:px-5 pt-4 pb-4 gap-3">

          {/* Identity row */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${currentRank.color}18`, color: currentRank.color, boxShadow: `0 0 18px ${currentRank.color}30`, border: `1px solid ${currentRank.color}25` }}
            >
              <div className="scale-[1.3]">{currentRank.icon}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] uppercase tracking-[0.22em] font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>Capability Tier</p>
              <h1 className="text-[20px] font-black tracking-tight leading-none" style={{ color: currentRank.color }}>{currentRank.label}</h1>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <div className="flex items-center gap-[2px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-[10px] leading-none" style={{ color: i < currentRank.stars ? currentRank.color : "var(--text-muted)" }}>★</span>
                ))}
              </div>
              <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>Rank {currentRank.stars} of 5</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: `${currentRank.color}15` }} />

          {/* Progress numbers */}
          {nextRank ? (
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-black tabular-nums tracking-tight leading-none" style={{ color: currentRank.color }}>{progressPct}<span className="text-sm font-bold ml-0.5" style={{ color: `${currentRank.color}60` }}>%</span></span>
                <span className="text-[11px] leading-none" style={{ color: "var(--text-tertiary)" }}>to <span className="font-semibold" style={{ color: nextRank.color }}>{nextRank.label}</span></span>
              </div>
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}><span className="font-bold" style={{ color: "var(--text-secondary)" }}>{ptsNeeded}</span> pts needed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#a78bfa" }} />
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#a78bfa]">Pinnacle rank</p>
            </div>
          )}

          {/* Progress bar */}
          <RankBar totalScore={totalScore} trackH={7} showLabels showYouTag={false} />

          {/* Retake button */}
          <Link
            href="/matchmaker?retake=1"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:brightness-110 w-fit"
            style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.18)", color: "#ff7d47" }}
          >
            <RotateCcw className="w-3 h-3" />
            Retake Assessment
          </Link>
        </div>

        {/* Right column: radar — desktop only */}
        <div
          className="hidden sm:flex shrink-0 flex-col gap-3 px-6 pt-6 pb-6 border-l"
          style={{ borderColor: `${currentRank.color}18`, background: "var(--bg-surface)" }}
        >
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: "var(--text-tertiary)" }}>Capability Breakdown</p>
          <ACERadar ace={stored.ace} size={240} showLabels />
        </div>
      </div>

      {/* ACE Radar — mobile: below everything */}
      <div className="sm:hidden px-5 pb-5 flex flex-col gap-2" style={{ borderTop: `1px solid ${currentRank.color}14` }}>
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold pt-4" style={{ color: "var(--text-tertiary)" }}>Capability Breakdown</p>
        <ACERadar ace={stored.ace} size={260} showLabels />
      </div>
    </div>
  );
}