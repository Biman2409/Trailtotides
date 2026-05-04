"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart2, MapPin, ChevronDown, Flame, Zap, Dumbbell, Compass, Waves, Mountain, Shield, Wind } from "lucide-react";
import { adventures } from "@/lib/data";
import { loadProfile, getMatchedAdventures, type StoredProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";
import RankBar from "@/components/ui/custom/RankBar";

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
        <div className="flex flex-wrap items-center gap-1 mt-1.5">
          {adventure.type && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#ff5100]/15 text-[#ff5100]/80 text-[9px] font-medium">{adventure.type}</span>
          )}
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
    <section className="py-16 lg:py-24 px-5 lg:px-8 t-bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto">

        <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.25em] uppercase mb-5">Adventure Matchmaker</p>

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
                {/* Identity */}
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

                {/* Progress stats */}
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

                {/* Progress bar */}
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
                  ? matches.map((adv) => <MiniAdventureCard key={adv.id} adventure={adv} />)
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
    </section>
  );
}

const SAMPLE_ACE = { stamina: 4, power: 3, strength: 3, agility: 4, water: 2, altitude: 5, focus: 3, nerve: 4 };

const AXIS_TICKER = [
  { key: "Stamina",  color: "#f97316", desc: "How long you can keep going",   icon: <Flame    className="w-3 h-3" /> },
  { key: "Power",    color: "#eab308", desc: "Raw explosive output",           icon: <Zap      className="w-3 h-3" /> },
  { key: "Strength", color: "#84cc16", desc: "Load carrying capacity",         icon: <Dumbbell className="w-3 h-3" /> },
  { key: "Agility",  color: "#22d3ee", desc: "Balance on technical terrain",   icon: <Compass  className="w-3 h-3" /> },
  { key: "Water",    color: "#3b82f6", desc: "Comfort in water environments",  icon: <Waves    className="w-3 h-3" /> },
  { key: "Altitude", color: "#a78bfa", desc: "Tolerance to high elevation",    icon: <Mountain className="w-3 h-3" /> },
  { key: "Focus",    color: "#f43f5e", desc: "Mental grip under pressure",     icon: <Shield   className="w-3 h-3" /> },
  { key: "Nerve",    color: "#10b981", desc: "Grit in remote isolation",       icon: <Wind     className="w-3 h-3" /> },
];

const SCAN_MS = 3200;

function SampleRadarPanel() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Scan line hits ticker at ~88% of SCAN_MS
    const swapAt = SCAN_MS * 0.88;
    let swapTimer: ReturnType<typeof setTimeout>;
    let cycleTimer: ReturnType<typeof setInterval>;

    function scheduleCycle() {
      swapTimer = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          setIdx(i => (i + 1) % AXIS_TICKER.length);
          setFade(true);
        }, 220);
      }, swapAt);
    }

    scheduleCycle();
    cycleTimer = setInterval(scheduleCycle, SCAN_MS);
    return () => { clearTimeout(swapTimer); clearInterval(cycleTimer); };
  }, []);

  const current = AXIS_TICKER[idx];

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-3 flex flex-col"
      style={{
        background: "linear-gradient(160deg, #0d1525 0%, #0a0e18 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
        width: "fit-content",
        paddingLeft: 32,
        paddingRight: 32,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-5 h-5 pointer-events-none" style={{ borderTop: "1px solid rgba(255,81,0,0.4)", borderLeft: "1px solid rgba(255,81,0,0.4)" }} />
      <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none" style={{ borderTop: "1px solid rgba(255,81,0,0.4)", borderRight: "1px solid rgba(255,81,0,0.4)" }} />
      <div className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none" style={{ borderBottom: "1px solid rgba(255,81,0,0.4)", borderLeft: "1px solid rgba(255,81,0,0.4)" }} />
      <div className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none" style={{ borderBottom: "1px solid rgba(255,81,0,0.4)", borderRight: "1px solid rgba(255,81,0,0.4)" }} />

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/35">Sample Profile</span>
      </div>

      {/* Radar */}
      <div className="flex-1 flex items-center justify-center">
        <div className="rounded-xl p-1.5 flex items-center justify-center"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,81,0,0.07) 0%, transparent 70%)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <ACERadar ace={SAMPLE_ACE} size={160} showLabels />
        </div>
      </div>

      {/* Axis ticker */}
      <div className="mt-2 rounded-lg px-2.5 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", width: "max-content" }}>
        <div style={{ opacity: fade ? 1 : 0, transition: "opacity 0.22s ease" }}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="shrink-0" style={{ color: current.color }}>{current.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: current.color }}>{current.key}</span>
          </div>
          <p className="text-[9px] text-white/40 leading-none pl-[18px]" style={{ whiteSpace: "nowrap" }}>{current.desc}</p>
        </div>
      </div>

      {/* Scan line — duration matches SCAN_MS */}
      <div className="absolute inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,81,0,0.45), transparent)", animation: `scanline ${SCAN_MS}ms linear infinite`, top: 0 }} />
      <style>{`@keyframes scanline { 0% { top:0%; opacity:0; } 8% { opacity:1; } 88% { opacity:1; } 100% { top:100%; opacity:0; } }`}</style>
    </div>
  );
}

function DefaultCTA() {
  return (
    <section className="py-20 lg:py-28 px-5 lg:px-8 t-bg-surface border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "4rem", alignItems: "stretch" }}>

          {/* Left: copy */}
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
            <p className="text-[#ff5100] text-xs font-black tracking-[0.25em] uppercase mb-4">Adventure Matchmaker</p>
            <h2 className="text-white text-3xl lg:text-5xl font-bold tracking-tight leading-tight mb-4 lg:mb-5">
              Adventures built,<br />
              <span className="text-[#ff5100]">for your body</span>
            </h2>
            <p className="text-white/55 text-base md:text-lg leading-relaxed mb-8">
              Answer 8 questions. We calibrate your capability level and match you to adventures you can actually handle.
            </p>
            <div className="flex flex-col gap-3" style={{ marginTop: "auto" }}>
              <Link
                href="/matchmaker"
                className="flex items-center justify-center gap-2.5 bg-[#ff5100] text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#ff7d47] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/25 group transition-all duration-200"
                style={{ boxShadow: "0 4px 20px rgba(255,81,0,0.3)" }}
              >
                Take Assessment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/ace"
                className="flex items-center justify-center gap-2 text-white/45 hover:text-white/70 font-semibold px-8 py-4 rounded-xl text-base border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                Learn about ACE
              </Link>
            </div>
          </div>

          <SampleRadarPanel />

        </div>
      </div>
    </section>
  );
}
