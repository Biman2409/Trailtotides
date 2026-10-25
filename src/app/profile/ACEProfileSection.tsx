"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { loadProfile, loadProfileFromServer } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";
import RankBar from "@/components/ui/custom/RankBar";
import { TIER_LIST } from "@/lib/tiers";
import { RANK_ICONS } from "@/lib/rankIcons";

const ORANGE = "#ff5100";

const RANKS = TIER_LIST.map((t) => ({
  ...t,
  icon: <span className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full">{RANK_ICONS[t.label]}</span>,
}));

export default function ACEProfileSection() {
  const [stored, setStored] = useState<ReturnType<typeof loadProfile>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadProfileFromServer().then((profile) => {
      if (!cancelled) { setStored(profile); setMounted(true); }
    });
    return () => { cancelled = true; };
  }, []);

  if (!mounted) return null;

  const card = "rounded-2xl";
  const cardStyle = { background: "var(--bg-card)", border: "1px solid var(--border-subtle)" };
  const small = { fontVariant: "small-caps" as const };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!stored) {
    const U = RANKS[0];
    return (
      <div className={`${card} p-4 sm:p-5`} style={cardStyle}>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center" style={{ border: "1px dashed var(--border-default)", color: "var(--text-muted)" }}>{U.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-tertiary)", ...small }}>capability rank</p>
            <p className="text-[18px] leading-tight font-semibold" style={{ color: "var(--text-primary)" }}>Uncharted</p>
          </div>
          <span className="text-[12px] shrink-0" style={{ color: "var(--text-tertiary)" }}>Rank 0 of 5</span>
        </div>
        <div className="mt-4 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="text-[14px] leading-relaxed max-w-sm" style={{ color: "var(--text-secondary)" }}>
            Take the 8-question ACE<sup>™</sup> assessment to map your physical profile and unlock your adventure rank.
          </p>
          <Link href="/matchmaker" className="shrink-0 inline-flex items-center h-10 px-5 rounded-full text-[14px] font-semibold text-white transition-[filter] hover:brightness-110" style={{ background: ORANGE }}>
            Take the assessment
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

  const breakdown = (size: number) => (
    <>
      <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", ...small }}>breakdown</p>
      <ACERadar ace={stored.ace} size={size} showLabels />
    </>
  );

  return (
    <div className={`${card} overflow-hidden`} style={cardStyle}>
      {/* ── Main body: left = rank + progression | right = radar ── */}
      <div className="flex items-stretch">
        <div className="flex-1 min-w-0 flex flex-col p-4 sm:p-5 gap-4">

          {/* Rank */}
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center" style={{ border: `1.5px solid ${ORANGE}`, color: ORANGE }}>{currentRank.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-tertiary)", ...small }}>capability rank</p>
              <p className="text-[18px] leading-tight font-semibold" style={{ color: "var(--text-primary)" }}>{currentRank.label}</p>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="flex gap-[2px] text-[12px] leading-none" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < currentRank.stars ? ORANGE : "var(--border-default)" }}>★</span>
                ))}
              </span>
              <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Rank {currentRank.stars} of 5</span>
            </div>
          </div>

          {/* Progress to the next rank */}
          {nextRank ? (
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                <span className="text-[22px] leading-none font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{progressPct}%</span>
                {" "}to <span style={{ color: "var(--text-primary)" }}>{nextRank.label}</span>
              </span>
              <span className="text-[13px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>{ptsNeeded} pts needed</span>
            </div>
          ) : (
            <p className="text-[13px]" style={{ color: ORANGE }}>Top rank reached</p>
          )}

          <RankBar totalScore={totalScore} trackH={7} showLabels showYouTag={false} />

          <Link
            href="/matchmaker?retake=1"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold w-fit transition-colors hover:bg-[#ff5100]/[0.06]"
            style={{ color: ORANGE, border: `1px solid ${ORANGE}` }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retake the assessment
          </Link>
        </div>

        {/* Radar — beside on desktop */}
        <div className="hidden sm:flex shrink-0 flex-col gap-3 p-6 border-l" style={{ borderColor: "var(--border-subtle)" }}>
          {breakdown(240)}
        </div>
      </div>

      {/* Radar — below on mobile */}
      <div className="sm:hidden px-5 pb-5 pt-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        {breakdown(260)}
      </div>
    </div>
  );
}
