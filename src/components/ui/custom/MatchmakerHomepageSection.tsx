"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";
import { adventures } from "@/lib/data";
import { loadProfile, getMatchedAdventures, type StoredProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";

const RANKS = [
  { label: "Uncharted",   color: "#6b7280", stars: 0, minScore: 0  },
  { label: "Pathfinder",  color: "#22d3ee", stars: 1, minScore: 8  },
  { label: "Navigator",   color: "#4ade80", stars: 2, minScore: 16 },
  { label: "Trailblazer", color: "#f59e0b", stars: 3, minScore: 24 },
  { label: "Vanguard",    color: "#f97316", stars: 4, minScore: 32 },
  { label: "Apex",        color: "#a78bfa", stars: 5, minScore: 40 },
];

const TIER_INFO: Record<string, { color: string; stars: number; icon: React.ReactNode }> = {
  "Uncharted":   { color: "#6b7280", stars: 0, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/><path d="M7.5 7.5a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg> },
  "Pathfinder":  { color: "#22d3ee", stars: 1, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1"/><path d="M10 13.5V7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7.5 10L10 7.5L12.5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  "Navigator":   { color: "#4ade80", stars: 2, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1"/><circle cx="10" cy="10" r="1.8" fill="currentColor"/><path d="M10 4v2M10 14v2M4 10h2M14 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 4l1.8 5.5L10 9l-1.8.5L10 4z" fill="currentColor"/></svg> },
  "Trailblazer": { color: "#f59e0b", stars: 3, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M10 2.5L17 6V11c0 4-2.8 6.5-7 8C3.8 17.5 1 15 1 11V6l9-3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M6.5 13l1.5-2.5 1.5 2 1.5-3.5L12.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  "Vanguard":    { color: "#f97316", stars: 4, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M10 2L17 6V11.5C17 15.5 14 18.5 10 20C6 18.5 3 15.5 3 11.5V6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M10 2l1.5 4.5H17L12.5 9.5 14 14l-4-2.5L6 14l1.5-4.5L3 6.5H8.5L10 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg> },
  "Apex":        { color: "#a78bfa", stars: 5, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M10 3l2 4 4.5.7-3.25 3.15.77 4.5L10 13.25l-4.02 2.1.77-4.5L3.5 7.7 8 7l2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/></svg> },
};


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

  const tier = TIER_INFO[profile.label] ?? TIER_INFO["Pathfinder"];
  const matches = getMatchedAdventures(profile.ace, adventures).slice(0, 6);

  const totalScore  = Object.values(profile.ace).reduce((a: number, b) => a + (b as number), 0);
  const rankIndex   = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const currentRank = RANKS[rankIndex] ?? RANKS[1];
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
        <div className="flex flex-wrap items-start gap-6 mb-10">
          {/* Left: tier + progress */}
          <div className="flex flex-col gap-4 min-w-[220px]">
            <div
              className="flex items-center gap-3 rounded-2xl px-5 py-4 border"
              style={{ background: `${tier.color}12`, borderColor: `${tier.color}30`, boxShadow: `0 0 24px ${tier.color}18` }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${tier.color}22`, color: tier.color, boxShadow: `0 0 16px ${tier.color}35` }}>
                {tier.icon}
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Adventure Tier</p>
                <p className="font-bold text-base leading-tight" style={{ color: tier.color }}>{profile.label}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-xs" style={{ color: i < tier.stars ? tier.color : "rgba(255,255,255,0.1)" }}>★</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Next level progress */}
            {nextRank ? (
              <div className="rounded-2xl px-4 py-3 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/40">
                    Next: <span className="font-semibold" style={{ color: nextRank.color }}>{nextRank.label}</span>
                  </span>
                  <span className="text-[10px] font-bold font-mono" style={{ color: currentRank.color }}>{progressPct}% there</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      background: `linear-gradient(to right, ${currentRank.color}, ${nextRank.color})`,
                      boxShadow: `0 0 8px ${currentRank.color}60`,
                    }}
                  />
                </div>
                <p className="text-[9px] text-white/25 mt-1.5">{nextRank.minScore - totalScore} pts to {nextRank.label}</p>
              </div>
            ) : (
              <div className="rounded-2xl px-4 py-3 border flex items-center gap-3" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="h-1.5 flex-1 rounded-full" style={{ background: "linear-gradient(to right, #22d3ee, #a78bfa)", boxShadow: "0 0 8px #a78bfa40" }} />
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#a78bfa] shrink-0">Max Rank</span>
              </div>
            )}
          </div>

          {/* Right: radar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "radial-gradient(ellipse at center, rgba(255,81,0,0.07) 0%, rgba(255,255,255,0.02) 75%)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">ACE Profile</p>
              </div>
              <div className="p-2">
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
