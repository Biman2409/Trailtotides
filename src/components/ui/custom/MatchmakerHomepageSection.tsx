"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";
import { adventures } from "@/lib/data";
import { loadProfile, getMatchedAdventures, type StoredProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";

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


function MiniAdventureCard({ adventure }: { adventure: (typeof adventures)[number] }) {
  return (
    <Link
      href={`/experiences/${adventure.slug}`}
      className="group flex-shrink-0 w-44 rounded-xl overflow-hidden border border-white/8 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <div className="relative h-24 w-full">
        <Image
          src={adventure.heroImage ?? "/placeholder.jpg"}
          alt={adventure.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="p-2.5">
        <p className="text-white text-xs font-semibold leading-tight line-clamp-2 group-hover:text-[#ff5100] transition-colors">
          {adventure.name}
        </p>
        {adventure.type && (
          <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded-md bg-[#ff5100]/15 text-[#ff5100]/80 text-[9px] font-medium">{adventure.type}</span>
        )}
      </div>
    </Link>
  );
}

export default function MatchmakerHomepageSection() {
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setMounted(true);
  }, []);

  if (!mounted || !profile) return <DefaultCTA />;

  const matches = getMatchedAdventures(profile.ace, adventures).slice(0, 6);

  const totalScore  = Object.values(profile.ace).reduce((a: number, b) => a + (b as number), 0);
  const rankIndex   = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const currentRank = RANKS[rankIndex] ?? RANKS[1];
  const tier = currentRank;
  const nextRank    = RANKS[rankIndex + 1] ?? null;
  const progressPct = nextRank
    ? Math.min(100, Math.round(((totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100))
    : 100;

  return (
    <section className="py-16 lg:py-32 px-5 lg:px-8 t-bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-10">
          <p className="text-[#ff5100] text-xs font-black tracking-[0.25em] uppercase mb-4">Adventure Matchmaker</p>
          <h2 className="text-white text-3xl lg:text-5xl font-bold tracking-tight leading-tight mb-3">Your adventure profile</h2>
          <p className="text-white/55 text-sm">Based on your ACE assessment — here&apos;s what you&apos;re built for.</p>
        </div>

        {/* Tier badge + radar side by side */}
        <div className="flex flex-wrap items-stretch gap-6 mb-10">
          {/* Left: rank card */}
          <div
            className="flex flex-col flex-1 min-w-[260px] rounded-2xl p-5 gap-5"
            style={{ border: `1px solid ${tier.color}25`, background: `linear-gradient(135deg, ${tier.color}10 0%, ${tier.color}04 100%)` }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-white/30 mb-1">Adventure Rank</p>
                <p className="text-xl font-bold leading-none" style={{ color: tier.color }}>{profile.label}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${tier.color}18`, color: tier.color, boxShadow: `0 0 14px ${tier.color}30` }}>
                  {tier.icon}
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-[10px]" style={{ color: i < tier.stars ? tier.color : "rgba(255,255,255,0.1)" }}>★</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress scale */}
            {(() => {
              const totalRanks = RANKS.length; // 6
              // Overall fill fraction across the full scale (0→1)
              const fillPct = totalRanks > 1
                ? ((rankIndex + (nextRank ? progressPct / 100 : 1)) / (totalRanks - 1)) * 100
                : 100;

              return (
                <div className="space-y-3">
                  {/* Next rank callout */}
                  {nextRank ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">
                        Next: <span className="font-semibold" style={{ color: nextRank.color }}>{nextRank.label}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tabular-nums" style={{ color: tier.color }}>{progressPct}%</span>
                        <span className="text-[10px] text-white/30 tabular-nums">{nextRank.minScore - totalScore} pts to go</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">Maximum rank achieved</span>
                      <span className="text-xs font-bold text-[#a78bfa]">Apex ★</span>
                    </div>
                  )}

                  {/* Scale bar with rank ticks */}
                  <div className="relative">
                    {/* Track */}
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${fillPct}%`,
                          background: `linear-gradient(to right, ${RANKS[1].color}, ${tier.color})`,
                          boxShadow: `0 0 10px ${tier.color}60`,
                        }}
                      />
                    </div>

                    {/* Tick marks at each rank boundary */}
                    {RANKS.map((rank, i) => {
                      if (i === 0) return null; // no tick at start
                      const pct = (i / (totalRanks - 1)) * 100;
                      const isReached = i <= rankIndex;
                      return (
                        <div
                          key={rank.label}
                          className="absolute top-1/2 -translate-y-1/2 w-px h-3"
                          style={{
                            left: `${pct}%`,
                            background: isReached ? `${rank.color}80` : "rgba(255,255,255,0.12)",
                          }}
                        />
                      );
                    })}

                    {/* Thumb dot at current progress */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 transition-all duration-700"
                      style={{
                        left: `${fillPct}%`,
                        background: tier.color,
                        borderColor: "rgba(14,14,18,0.9)",
                        boxShadow: `0 0 8px ${tier.color}90`,
                      }}
                    />
                  </div>

                  {/* Rank labels row */}
                  <div className="relative flex justify-between mt-1">
                    {RANKS.map((rank, i) => {
                      const isUnlocked = i <= rankIndex;
                      const isCurrent = i === rankIndex;
                      return (
                        <div
                          key={rank.label}
                          className="flex flex-col items-center gap-0.5"
                          style={{ width: `${100 / totalRanks}%` }}
                        >
                          <span
                            className="text-[8px] font-semibold text-center leading-none"
                            style={{
                              color: isCurrent ? tier.color : isUnlocked ? `${rank.color}70` : "rgba(255,255,255,0.2)",
                            }}
                          >
                            {rank.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right: radar */}
          <div className="flex flex-col flex-1 min-w-[220px]">
            <div
              className="rounded-2xl overflow-hidden flex flex-col flex-1"
              style={{
                background: "radial-gradient(ellipse at center, rgba(255,81,0,0.07) 0%, rgba(255,255,255,0.02) 75%)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">ACE Profile</p>
              </div>
              <div className="flex flex-1 items-center justify-center p-2">
                <ACERadar ace={profile.ace} size={200} showLabels />
              </div>
            </div>
          </div>
        </div>

        {/* Matched adventures */}
        <p className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase mb-4">Adventures suited for you</p>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {matches.length > 0
            ? matches.map((adv) => <MiniAdventureCard key={adv.id} adventure={adv} />)
            : <p className="text-white/30 text-sm italic">No matching adventures found.</p>}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 mt-8">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-[#ff5100] hover:bg-[#e04800] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/25 group transition-all duration-200"
          >
            Explore matching adventures
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => { localStorage.removeItem("ttt_matchmaker_profile"); setProfile(null); }}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 font-medium px-4 py-3 rounded-xl text-sm border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retake assessment
          </button>
        </div>
      </div>
    </section>
  );
}

function DefaultCTA() {
  return (
    <section className="py-16 lg:py-32 px-5 lg:px-8 t-bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <p className="text-[#ff5100] text-xs font-black tracking-[0.25em] uppercase mb-4">Adventure Matchmaker</p>
          <h2 className="text-white text-3xl lg:text-6xl font-bold tracking-tight leading-tight mb-4 lg:mb-5">
            Adventures built,<br />
            <span className="text-[#ff5100]">for your body</span>
          </h2>
          <p className="text-white/72 text-base md:text-xl leading-relaxed mb-7 lg:mb-9">
            Answer 8 questions. Discover your{" "}
            <Link href="/ace" className="font-bold text-[#ff5100] underline decoration-[#ff5100]/30 underline-offset-2 hover:decoration-[#ff5100] transition-all">
              ACE
            </Link>{" "}
            profile and find the adventures you&apos;re truly ready for.
          </p>
          <Link
            href="/matchmaker"
            className="inline-flex items-center gap-2.5 bg-[#ff5100] text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#e04800] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/20 group transition-all duration-200"
          >
            Take Assessment
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
