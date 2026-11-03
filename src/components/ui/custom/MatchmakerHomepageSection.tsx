"use client";

import Link from "next/link";
import { ArrowRight, Mountain, RefreshCw, RotateCcw, TrendingUp, Users } from "lucide-react";
import { adventures } from "@/lib/data";
import { type StoredProfile } from "@/lib/matchmaker";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { AXES, AXIS_LABEL, TRAINING_TIPS, bestNextStep, nextSteps, type TripCredit } from "@/lib/fitness";
import { getACE, computeMatchScore, type ACE } from "@/lib/ace";
import { SAMPLE_ACE } from "@/lib/homeCuration";
import ACERadar from "@/components/ui/custom/ACERadar";
import RankBar from "@/components/ui/custom/RankBar";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import MatchmakerStory, { type StoryQuestion, type StoryTrain } from "@/components/ui/custom/MatchmakerStory";
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
    <section id="matchmaker" className="relative py-5 lg:py-7 px-5 lg:px-8 overflow-hidden bg-[#faf3e8] dark:bg-[#1a1410]">
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
  const { profile, ace, credits, stale, ready } = useFitnessProfile();
  if (!ready || !profile?.ace || !ace) return <DefaultCTA />;
  return <ProfileSummary profile={profile} ace={ace} credits={credits} stale={stale} />;
}

/* ── First-time visitors: what you get, how long it takes, one clear action ── */


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

// Three of the Matchmaker's own questions, answered as the example profile would (it is 3 on
// stamina and agility, 2 on altitude). They go round the radar clockwise, each filling in the
// capabilities beside it, so the shape grows in one sweep.
const SAMPLE_QUESTIONS: StoryQuestion[] = [
  { text: "How long can you keep moving before you need a proper rest?", options: ["1–3 hours", "3–5 hours", "5–8 hours"], pick: 1, axes: ["stamina", "power", "strength"] },
  { text: "On uneven ground, how confident is your footing?", options: ["Very slow", "Cautious, steady", "Confident"], pick: 1, axes: ["agility", "water"] },
  { text: "The highest you've slept without getting properly sick?", options: ["Under 2,500m", "2,500–3,500m", "3,500–4,500m"], pick: 1, axes: ["altitude", "focus", "nerve"] },
];

// The training step for the example profile: the level up that opens the most, and the trek
// from the sample pool it turns from a stretch into ready
function sampleTrain(): StoryTrain | null {
  const pool = adventures.filter((a) => a.type === "Trekking" && !/nepal|bhutan/i.test(a.state));
  // The level up that opens the most and has a trek to show it on
  for (const step of nextSteps(SAMPLE_ACE, adventures)) {
    const lifted = { ...SAMPLE_ACE, [step.axis]: step.to } as ACE;
    const f = pool
      .map((a) => {
        const req = getACE(a);
        // What's still short after the level up, so the demo can show the gap closing cleanly
        const left = AXES.reduce((s, k) => s + Math.max(0, req[k] - lifted[k]), 0);
        return { a, req, left, before: computeMatchScore(SAMPLE_ACE, req), after: computeMatchScore(lifted, req) };
      })
      // A stretch that turns ready and was short on this capability; best if the new level is
      // exactly what it needs, then the fewest gaps left
      .filter((x) => x.before >= 55 && x.before < 80 && x.after >= 80 && x.req[step.axis] >= step.to)
      .sort((x, y) => Number(x.req[step.axis] !== step.to) - Number(y.req[step.axis] !== step.to) || x.left - y.left || y.after - x.after)[0];
    if (f) return { ...step, trek: { name: f.a.name, ace: f.req, before: f.before, after: f.after } };
  }
  return null;
}

function DefaultCTA() {
  const samples = sampleResults();

  return (
    <Band>
      {/* Text and sample sit together as a centred pair, lined up with the map section below */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_400px] lg:justify-center gap-4 lg:gap-16 items-center">
        {/* Left: promise and action */}
        <div className="min-w-0">
          <Eyebrow />
          <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight mb-2">
            Adventures built for <span className="text-[#ff5100]">your body</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Answer a few quick questions, about 2 minutes, and every adventure gets rated for you: ready, a stretch, or not yet. Then see what to train to unlock more, and match a whole group.
          </p>
          {/* Desktop only: below lg the sample sits right under it with its own "Start" */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/matchmaker"
              className="group hidden lg:inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[14px] font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors"
              style={{ boxShadow: "0 6px 20px rgba(255,81,0,0.25)" }}
            >
              Take the assessment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            {/* The full explanation lives on /ace */}
            <Link href="/ace" className="py-3 -my-3 text-[13px] font-medium underline underline-offset-2 hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-tertiary)" }}>
              How it works
            </Link>
          </div>
        </div>

        {/* Right: what the result looks like; the demo keeps its own button too */}
        <div className="min-w-0">
          <MatchmakerStory
            you={SAMPLE_ACE}
            questions={SAMPLE_QUESTIONS}
            train={sampleTrain()}
            samples={samples.map(({ a, score }) => ({ id: a.id, name: a.name, image: a.heroImage, ace: getACE(a), score }))}
            group={sampleGroup(samples)}
            cta={{ href: "/matchmaker", label: "Start", note: "Sample. Yours takes 2 min." }}
          />
        </div>
      </div>
    </Band>
  );
}

/* ── Returning visitors: where they stand, what to do next (the adventure list lives in "Picked for you") ── */

const BUCKETS = [
  { key: "ready", label: "Ready", color: "#10b981", href: "/explore?ace=ready" },
  { key: "stretch", label: "A stretch", color: "#f59e0b", href: "/explore?ace=stretch" },
  { key: "notyet", label: "Not yet", color: "#f43f5e", href: "/explore?ace=out-of-range" },
] as const;

function ProfileSummary({ profile, ace, credits, stale }: { profile: StoredProfile; ace: ACE; credits: TripCredit[]; stale: boolean }) {
  // Rank, counts, radar and the training step all use the trip-adjusted profile, so logging a
  // trip moves them together
  const totalScore = AXES.reduce((s, k) => s + ace[k], 0);
  const rankIndex = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const tier = RANKS[rankIndex] ?? RANKS[1];
  const nextRank = RANKS[rankIndex + 1] ?? null;
  const progressPct = nextRank
    ? Math.min(100, Math.round(((totalScore - tier.minScore) / (nextRank.minScore - tier.minScore)) * 100))
    : 100;

  const scores = adventures.map((a) => computeMatchScore(ace, getACE(a)));
  const counts = {
    ready: scores.filter((s) => s >= 80).length,
    stretch: scores.filter((s) => s >= 55 && s < 80).length,
    notyet: scores.filter((s) => s < 55).length,
  };
  const step = bestNextStep(ace, adventures);
  const strengths = [...AXES].sort((a, b) => ace[b] - ace[a]).slice(0, 3);
  const updated = timeAgo(profile.updatedAt);
  // The latest lift from a logged trip, per capability
  const lifts = [...new Map(credits.map((c) => [c.axis, c])).values()];

  return (
    <Band>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_400px] lg:justify-center gap-6 lg:gap-16 items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            <Eyebrow className="" />
            {stale ? (
              <Link href="/matchmaker?retake=1" className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#d97706" }}>
                <RefreshCw className="w-3 h-3" />Due a refresh{updated ? ` · ${updated}` : ""}
              </Link>
            ) : updated && (
              <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>Updated {updated}</span>
            )}
          </div>
          <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight mb-2">
            You&apos;re ready for <span style={{ color: "#10b981" }}>{counts.ready} adventures</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Every adventure on the site is rated for your body{credits.length > 0 ? ", and for the trips you've logged" : ""}. Tap a group to see it.
          </p>

          {/* Where you stand: each count opens those adventures */}
          <div className="grid grid-cols-3 gap-2 mt-4 max-w-xl">
            {BUCKETS.map((b) => {
              const n = counts[b.key];
              return (
                <Link key={b.key} href={b.href} className="group rounded-xl px-3 py-2.5 transition-all hover:-translate-y-0.5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                  <span className="block text-2xl font-bold tabular-nums leading-none" style={{ color: b.color }}>{n}</span>
                  <span className="flex items-center justify-between mt-1.5 text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                    {b.label}
                    <ArrowRight className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </span>
                  <span className="block mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
                    <span className="block h-full rounded-full" style={{ width: `${Math.round((n / Math.max(1, scores.length)) * 100)}%`, background: b.color }} />
                  </span>
                </Link>
              );
            })}
          </div>

          {/* What to do next: the level up that opens the most, as the results page's training focus ranks it */}
          {step && (
            <Link href="/matchmaker#training-focus" className="group flex items-start gap-3 rounded-xl p-3.5 mt-2.5 max-w-xl transition-colors" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <span className="w-9 h-9 rounded-xl grid place-items-center shrink-0" style={{ background: "rgba(16,185,129,0.14)", color: "#10b981" }}>
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
                  Train next: {AXIS_LABEL[step.axis]} <span className="tabular-nums" style={{ color: "#10b981" }}>{step.from} → {step.to}</span>
                </span>
                <span className="block text-[12.5px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Unlocks <b style={{ color: "#10b981" }}>{step.unlocked} more</b> {step.unlocked === 1 ? "adventure" : "adventures"}. {TRAINING_TIPS[step.axis]}
                </span>
              </span>
              <ArrowRight className="w-4 h-4 mt-1 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" style={{ color: "var(--text-secondary)" }} />
            </Link>
          )}

          {/* What logged trips have lifted */}
          {lifts.length > 0 && (
            <p className="flex items-start gap-2 mt-2.5 max-w-xl text-[12.5px]" style={{ color: "var(--text-secondary)" }}>
              <Mountain className="w-4 h-4 mt-0.5 shrink-0 text-[#ff5100]" />
              <span>
                Your trips lifted{" "}
                {lifts.slice(0, 2).map((c, i) => (
                  <span key={c.axis}>{i > 0 && " and "}<b style={{ color: "var(--text-primary)" }}>{AXIS_LABEL[c.axis]} to {c.to}</b> ({c.adventure})</span>
                ))}
                {lifts.length > 2 && ` and ${lifts.length - 2} more`}.
              </span>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-3 mt-5">
            <Link
              href="/explore?ace=ready"
              className="group inline-flex items-center gap-2 bg-[#ff5100] text-white font-semibold px-5 h-11 rounded-xl text-[14px] hover:bg-[#ff6a24] transition-colors"
              style={{ boxShadow: "0 6px 20px rgba(255,81,0,0.25)" }}
            >
              See your matches
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/matchmaker/group"
              className="inline-flex items-center gap-2 font-semibold px-4 h-11 rounded-xl text-[14px] transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{ color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
            >
              <Users className="w-4 h-4" />
              Match a group
            </Link>
            <Link href="/matchmaker" className="py-3 -my-3 px-1 text-[13px] font-medium underline underline-offset-2 hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-tertiary)" }}>
              Full results
            </Link>
            <Link href="/matchmaker?retake=1" className="py-3 -my-3 px-1 inline-flex items-center gap-1 text-[13px] font-medium underline underline-offset-2 hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-tertiary)" }}>
              <RotateCcw className="w-3 h-3" />Retake
            </Link>
          </div>
        </div>

        {/* Your profile: rank, the radar (the capability to train lit up), strengths */}
        <div className="mm-card rounded-[22px] p-4 sm:p-5 min-w-0 w-full max-w-[420px] mx-auto">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tier.color}18`, color: tier.color }}>
              <span className="scale-125">{tier.icon}</span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: "var(--text-tertiary)" }}>Your rank</span>
              <span className="block text-lg font-bold tracking-tight" style={{ color: tier.color }}>{tier.label}</span>
            </span>
            <span className="text-right shrink-0 text-[11px] leading-snug" style={{ color: "var(--text-tertiary)" }}>
              <span className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{totalScore}</span>/40
              {nextRank && <><br />{progressPct}% to {nextRank.label}</>}
            </span>
          </div>
          <div className="mt-3">
            <RankBar totalScore={totalScore} trackH={5} />
          </div>
          <div className="flex justify-center mt-2">
            <ACERadar ace={ace} size={250} showLabels labelSize={11} highlightAxis={step?.axis ?? null} />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {strengths.map((k) => (
              <span key={k} className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(95,224,212,0.1)", color: "var(--accent-teal, #0e9f94)" }}>Strong in {AXIS_LABEL[k]}</span>
            ))}
            {step && (
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>Next: {AXIS_LABEL[step.axis]}</span>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .mm-card { background: linear-gradient(160deg, var(--bg-surface) 0%, var(--bg-card) 100%);
                   border: 1px solid var(--border-subtle);
                   box-shadow: 0 24px 60px rgba(var(--shadow-color), 0.22), inset 0 1px 0 rgba(255,255,255,0.04); }
      `}</style>
    </Band>
  );
}
