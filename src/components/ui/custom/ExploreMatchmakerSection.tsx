"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart2, MapPin, ChevronDown } from "lucide-react";
import { adventures } from "@/lib/data";
import { loadProfile, getMatchedAdventures, type StoredProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";
import RankBar from "@/components/ui/custom/RankBar";


const RANKS = [
  { label: "Uncharted",   color: "#6b7280", stars: 0, minScore: 0,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/><path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg> },
  { label: "Pathfinder",  color: "#22d3ee", stars: 1, minScore: 8,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: "Navigator",   color: "#4ade80", stars: 2, minScore: 16,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/></svg> },
  { label: "Trailblazer", color: "#f59e0b", stars: 3, minScore: 24,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: "Vanguard",    color: "#f97316", stars: 4, minScore: 32,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg> },
  { label: "Apex",        color: "#a78bfa", stars: 5, minScore: 40,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg> },
];

function MatchCard({ adventure }: { adventure: (typeof adventures)[number] }) {
  return (
    <Link
      href={`/experiences/${adventure.slug}`}
      className="group flex-shrink-0 w-40 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)" }}
    >
      <div className="relative h-24 w-full overflow-hidden">
        <Image src={adventure.heroImage ?? "/placeholder.jpg"} alt={adventure.name} fill
          className="object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="p-2.5">
        <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2 group-hover:text-[#ff5100] transition-colors">
          {adventure.name}
        </p>
        <div className="flex flex-wrap items-center gap-1 mt-1.5">
          <span className="px-1.5 py-0.5 rounded-md bg-[#ff5100]/15 text-[#ff5100]/80 text-[9px] font-medium">
            {adventure.type}
          </span>
          {adventure.state && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/8 text-white/45 text-[9px] font-medium">
              <MapPin className="w-2 h-2" />{adventure.state}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ExploreMatchmakerSection() {
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  /* ── No profile — CTA ── */
  if (!profile) {
    return (
      <div className="mt-12 lg:mt-16 border-t border-white/5" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
          <div className="relative rounded-2xl overflow-hidden px-8 py-10 flex flex-col md:flex-row md:items-center gap-8"
            style={{ background: "linear-gradient(135deg, rgba(255,81,0,0.08) 0%, rgba(255,255,255,0.02) 60%)", border: "1px solid rgba(255,81,0,0.15)" }}>
            {/* Decorative bg text */}
            <span className="pointer-events-none select-none absolute right-6 top-4 text-[80px] font-black text-white/[0.025] leading-none hidden lg:block">ACE</span>
            <div className="flex-1">
              <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Adventure Matchmaker</p>
              <h2 className="text-white text-2xl lg:text-3xl font-bold tracking-tight mb-3">
                Adventures built<br />for your body
              </h2>
              <p className="text-white/45 text-sm lg:text-base leading-relaxed max-w-md">
                Answer 8 questions. Discover your{" "}
                <Link href="/ace" className="text-[#ff5100] font-semibold hover:underline">ACE</Link>{" "}
                profile and find the adventures you're truly ready for.
              </p>
            </div>
            <Link
              href="/matchmaker"
              className="inline-flex items-center justify-center gap-2.5 bg-[#ff5100] hover:bg-[#ff7d47] text-white px-7 py-4 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ff5100]/25 whitespace-nowrap min-w-[220px]"
            >
              <BarChart2 className="w-4 h-4" />
              Take the Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Has profile — personalized ── */
  const matches = getMatchedAdventures(profile.ace, adventures).slice(0, 6);
  const totalScore = Object.values(profile.ace).reduce((a: number, b) => a + (b as number), 0);
  const rankIndex  = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const tier       = RANKS[rankIndex];
  const nextRank   = RANKS[rankIndex + 1] ?? null;
  const progressPct = nextRank
    ? Math.min(100, Math.round(((totalScore - tier.minScore) / (nextRank.minScore - tier.minScore)) * 100))
    : 100;

  return (
    <div className="mt-12 lg:mt-16 border-t border-white/5" style={{ background: "var(--bg-surface)" }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 lg:py-16">

        <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.25em] uppercase mb-6">Adventure Matchmaker</p>

        {/* ── Two-column layout: left (tier + adventures) | right (radar) ── */}
        <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4">

          {/* Left column */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">

            {/* Tier card */}
            <div className="rounded-2xl overflow-hidden border relative"
              style={{ background: `linear-gradient(150deg, ${tier.color}12 0%, rgba(14,14,18,0) 55%)`, borderColor: `${tier.color}22` }}>
              <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-[0.06] blur-3xl pointer-events-none" style={{ background: tier.color }} />
              <div className="relative px-5 pt-5 pb-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${tier.color}18`, color: tier.color, boxShadow: `0 0 20px ${tier.color}35`, border: `1px solid ${tier.color}28` }}>
                    <div className="scale-[1.35]">{tier.icon}</div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.22em] font-semibold text-white/28 mb-0.5">Capability Tier</p>
                    <h2 className="text-2xl font-black tracking-tight leading-none" style={{ color: tier.color }}>{tier.label}</h2>
                    <div className="flex items-center gap-[3px] mt-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-[11px] leading-none" style={{ color: i < tier.stars ? tier.color : "rgba(255,255,255,0.09)" }}>★</span>
                      ))}
                      <span className="text-white/22 text-[9px] ml-1.5">Rank {tier.stars} of 5</span>
                    </div>
                  </div>
                </div>

                <div className="h-px mb-4" style={{ background: `${tier.color}12` }} />

                {nextRank ? (
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="flex items-baseline gap-0.5 leading-none">
                        <span className="text-3xl font-black tabular-nums tracking-tight" style={{ color: tier.color }}>{progressPct}</span>
                        <span className="text-sm font-bold ml-0.5" style={{ color: `${tier.color}70` }}>%</span>
                      </div>
                      <p className="text-[10px] text-white/30 mt-1 leading-none">to reach <span className="font-bold" style={{ color: nextRank.color }}>{nextRank.label}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black tabular-nums leading-none text-white/60">{nextRank.minScore - totalScore}</p>
                      <p className="text-[10px] text-white/28 mt-1 leading-none">pts needed</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#a78bfa" }} />
                    <p className="text-xs font-bold tracking-widest uppercase text-[#a78bfa]">The absolute pinnacle</p>
                  </div>
                )}

                <RankBar totalScore={totalScore} trackH={8} showLabels showYouTag />
              </div>
            </div>

            {/* Adventures suited for you */}
            <div className="rounded-2xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/35 text-[10px] font-bold tracking-[0.2em] uppercase">Adventures suited for you</p>
                {matches.length > 0 && (
                  <Link href="/explore?ace=ready" className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#ff5100]/70 hover:text-[#ff5100] transition-colors">
                    See all <ChevronDown className="w-3 h-3 -rotate-90" />
                  </Link>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x no-scrollbar">
                {matches.length > 0
                  ? matches.map((adv) => <MatchCard key={adv.id} adventure={adv} />)
                  : <p className="text-white/30 text-sm italic">No matching adventures found.</p>}
              </div>
            </div>

          </div>

          {/* Right column: ACE Radar */}
          <div className="shrink-0 lg:self-stretch flex flex-col items-center rounded-2xl border p-5"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/25 self-start mb-3">ACE Profile</p>
            <div className="flex-1 flex items-center justify-center rounded-xl p-4 w-full"
              style={{ background: "radial-gradient(ellipse at center, rgba(255,81,0,0.07) 0%, rgba(255,255,255,0.01) 70%)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <ACERadar ace={profile.ace} size={240} showLabels />
            </div>
          </div>

        </div>

        {/* CTAs — full width below both columns */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/explore?ace=ready"
            className="flex-1 inline-flex items-center justify-center gap-2 font-bold text-sm text-white transition-all hover:brightness-110 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#ff5100]/20 px-6 py-3 rounded-xl"
            style={{ background: "linear-gradient(135deg, #ff5100, #ff7340)" }}>
            All matching adventures
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/matchmaker"
            className="flex-1 inline-flex items-center justify-center gap-2 text-white/45 hover:text-white/75 font-semibold px-6 py-3 rounded-xl text-sm border border-white/10 hover:border-white/20 transition-all">
            <BarChart2 className="w-3.5 h-3.5" />
            View detailed results
          </Link>
          <Link href="/ace"
            className="flex-1 inline-flex items-center justify-center gap-2 text-white/45 hover:text-white/75 font-semibold px-6 py-3 rounded-xl text-sm border border-white/10 hover:border-white/20 transition-all">
            Learn more
          </Link>
        </div>

        </div>
      </div>
    </div>
  );
}
