"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { adventures } from "@/lib/data";
import { type StoredProfile } from "@/lib/matchmaker";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { getACE, computeMatchScore, type ACE } from "@/lib/ace";
import ACERadar from "@/components/ui/custom/ACERadar";
import RankBar from "@/components/ui/custom/RankBar";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import MatchmakerStory from "@/components/ui/custom/MatchmakerStory";
const RANKS = [
  {
    label: "Uncharted", color: "#6b7280", stars: 0, minScore: 0,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/><path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg>,
  },
  {
    label: "Pathfinder", color: "#22d3ee", stars: 1, minScore: 8,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Navigator", color: "#4ade80", stars: 2, minScore: 16,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/></svg>,
  },
  {
    label: "Trailblazer", color: "#f59e0b", stars: 3, minScore: 24,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Vanguard", color: "#f97316", stars: 4, minScore: 32,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg>,
  },
  {
    label: "Apex", color: "#a78bfa", stars: 5, minScore: 40,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg>,
  },
];

function timeAgo(iso?: string): string | null {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (Number.isNaN(days) || days < 0) return null;
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "a month ago" : `${months} months ago`;
}

/** Warm band that fades into the page at top and bottom — no textures or glows. */
function Band({ children }: { children: React.ReactNode }) {
  return (
    <section id="matchmaker" className="relative py-6 lg:py-10 px-5 lg:px-8 overflow-hidden bg-[#faf3e8] dark:bg-[#1a1410]">
      <SectionTexture kind="trail" color="#ff5100" at="78% 50%" opacity={0.22} />
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, var(--bg-page), transparent)" }} />
      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to top, var(--bg-page), transparent)" }} />
      <div className="max-w-7xl mx-auto relative z-10">{children}</div>
    </section>
  );
}

function Eyebrow({ className = "mb-2" }: { className?: string }) {
  return <p className={`text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase ${className}`}>Adventure Matchmaker</p>;
}

export default function MatchmakerHomepageSection() {
  const { profile, ace, stale, ready } = useFitnessProfile();
  if (!ready || !profile?.ace || !ace) return <DefaultCTA />;
  return <ProfileSummary profile={profile} ace={ace} stale={stale} />;
}

/* ── First-time visitors: what you get, how long it takes, one clear action ── */

// A moderately fit first-timer — lands adventures in all three buckets.
const SAMPLE_ACE = { stamina: 3, power: 2, strength: 2, agility: 3, water: 1, altitude: 2, focus: 3, nerve: 2 };

// A sample group on the trek the example profile is ready for: one friend fitter, one less so,
// so the preview shows the group being held to its least-ready member.
const FRIENDS: { name: string; shift: Partial<Record<keyof ACE, number>> }[] = [
  { name: "Aarav", shift: { stamina: 1, power: 1, strength: 1, altitude: 1, nerve: 1 } },
  { name: "Meera", shift: { stamina: -2, power: -1, strength: -1, altitude: -2, nerve: -1 } },
];
function sampleGroup(samples: ReturnType<typeof sampleResults>) {
  const pick = samples.find((s) => s.score >= 80) ?? samples[0];
  const trekAce = getACE(pick.a);
  const members = [{ name: "You", ace: SAMPLE_ACE as ACE }, ...FRIENDS.map((f) => ({
    name: f.name,
    ace: Object.fromEntries(Object.entries(SAMPLE_ACE).map(([k, v]) => [k, Math.max(0, Math.min(5, v + (f.shift[k as keyof ACE] ?? 0)))])) as unknown as ACE,
  }))];
  return { trek: { name: pick.a.name, ace: trekAce }, members: members.map((m) => ({ ...m, score: computeMatchScore(m.ace, trekAce) })) };
}

// One real trek per bucket for the sample profile, so the preview shows the full range:
// the best "ready", the best "stretch", and the clearest "not yet".
function sampleResults() {
  // Skip treks without real capability data — an empty shape can't show a comparison
  const pool = adventures.filter((a) => !/nepal|bhutan/i.test(a.state) && a.type === "Trekking"
    && Object.values(getACE(a)).reduce((s: number, v) => s + (v as number), 0) >= 10);
  const scored = pool.map((a) => ({ a, score: computeMatchScore(SAMPLE_ACE, getACE(a)) }));
  const inRange = (min: number, max: number) => scored.filter((s) => s.score >= min && s.score < max);
  const best = (list: typeof scored) => [...list].sort((x, y) => y.score - x.score)[0];
  const worst = (list: typeof scored) => [...list].sort((x, y) => x.score - y.score)[0];
  return [best(inRange(80, 101)), best(inRange(55, 80)), worst(inRange(0, 55))].filter(Boolean);
}

function DefaultCTA() {
  const samples = sampleResults();

  return (
    <Band>
      <div className="grid lg:grid-cols-[1fr_380px] gap-4 lg:gap-10 items-center">
        {/* Left: promise and action */}
        <div className="min-w-0">
          <Eyebrow />
          <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight mb-2">
            Adventures built for <span className="text-[#ff5100]">your body</span>
          </h2>
          {/* The full explanation lives on /ace — a quiet link at the end of the line */}
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Tell us about your fitness and experience. We&apos;ll rate every adventure for you, so you know what you&apos;re ready for before you book.{" "}
            <Link href="/ace" className="font-medium underline underline-offset-2 hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-tertiary)" }}>
              How it works
            </Link>
          </p>
        </div>

        {/* Right: what the result looks like, with the way in built into it */}
        <div className="min-w-0">
          <MatchmakerStory
            you={SAMPLE_ACE}
            samples={samples.map(({ a, score }) => ({ id: a.id, name: a.name, image: a.heroImage, ace: getACE(a), score }))}
            group={sampleGroup(samples)}
            cta={{ href: "/matchmaker", label: "Take assessment", note: "That's a sample. Yours takes 2 minutes." }}
          />
        </div>
      </div>
    </Band>
  );
}

/* ── Returning visitors: their profile at a glance (the adventure list lives in "Picked for you") ── */

function ProfileSummary({ profile, ace, stale }: { profile: StoredProfile; ace: ACE; stale: boolean }) {
  const totalScore = Object.values(profile.ace).reduce((a: number, b) => a + (b as number), 0);
  const rankIndex = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const tier = RANKS[rankIndex] ?? RANKS[1];
  const nextRank = RANKS[rankIndex + 1] ?? null;
  const progressPct = nextRank
    ? Math.min(100, Math.round(((totalScore - tier.minScore) / (nextRank.minScore - tier.minScore)) * 100))
    : 100;

  // Counts use the trip-adjusted profile, same as every match score on the site
  const scores = adventures.map((a) => computeMatchScore(ace, getACE(a)));
  const ready = scores.filter((s) => s >= 80).length;
  const stretch = scores.filter((s) => s >= 55 && s < 80).length;
  const updated = timeAgo(profile.updatedAt);

  return (
    <Band>
      <div className="grid lg:grid-cols-[1fr_340px] gap-5 lg:gap-10 items-center">
        <div className="min-w-0">
          <Eyebrow />
          <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight mb-3">
            Your fitness profile
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-xl" style={{ color: "var(--text-secondary)" }}>
            You&apos;re ready for <span className="font-semibold" style={{ color: "#10b981" }}>{ready} adventures</span>
            {stretch > 0 && <>, and <span className="font-semibold" style={{ color: "#f59e0b" }}>{stretch} more</span> are a stretch</>}.
            {updated && <span style={{ color: "var(--text-tertiary)" }}> Updated {updated}.</span>}
          </p>
          {stale && (
            <p className="text-sm mt-3 max-w-xl rounded-xl px-3.5 py-2.5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "var(--text-secondary)" }}>
              Fitness changes — a 2-minute refresh keeps these matches honest.{" "}
              <Link href="/matchmaker?retake=1" className="font-semibold text-[#f59e0b] hover:underline">Refresh now</Link>
            </p>
          )}

          {/* Rank */}
          <div className="rounded-2xl p-4 mt-6 max-w-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tier.color}18`, color: tier.color }}>
                <span className="scale-125">{tier.icon}</span>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: "var(--text-tertiary)" }}>Your rank</span>
                <span className="block text-lg font-bold tracking-tight" style={{ color: tier.color }}>{tier.label}</span>
              </span>
              {nextRank && (
                <span className="text-right shrink-0">
                  <span className="block text-lg font-bold tabular-nums" style={{ color: tier.color }}>{progressPct}%</span>
                  <span className="block text-[10px]" style={{ color: "var(--text-tertiary)" }}>to {nextRank.label}</span>
                </span>
              )}
            </div>
            <RankBar totalScore={totalScore} trackH={6} showLabels showYouTag />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-7">
            <Link
              href="/explore?ace=ready"
              className="group inline-flex items-center gap-2 bg-[#ff5100] text-white font-semibold px-6 py-3.5 rounded-xl text-[15px] hover:bg-[#ff6a24] hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: "0 6px 20px rgba(255,81,0,0.28)" }}
            >
              See all your matches
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/matchmaker?retake=1"
              className="inline-flex items-center gap-2 font-semibold px-5 py-3.5 rounded-xl text-sm transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{ color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake
            </Link>
            <Link href="/matchmaker" className="group inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[var(--text-primary)]" style={{ color: "var(--text-secondary)" }}>
              Detailed results
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl p-4 flex flex-col items-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 20px 50px rgba(var(--shadow-color), 0.18)" }}>
          <p className="self-start text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>Your capabilities</p>
          <ACERadar ace={profile.ace} size={260} showLabels />
        </div>
      </div>
    </Band>
  );
}
