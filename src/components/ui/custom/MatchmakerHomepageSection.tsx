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
      className="group flex-shrink-0 w-44 rounded-xl overflow-hidden border transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
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
        <p className="t-text text-xs font-semibold leading-tight line-clamp-2 group-hover:text-[#ff5100] transition-colors">
          {adventure.name}
        </p>
        <div className="flex flex-wrap items-center gap-1 mt-1.5">
          {adventure.type && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#ff5100]/15 text-[#ff5100]/80 text-[9px] font-medium">{adventure.type}</span>
          )}
          {adventure.state && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium" style={{ background: "var(--bg-page)", color: "var(--text-tertiary)" }}>
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
    <section className="relative py-8 lg:py-12 px-5 lg:px-8 border-t overflow-hidden bg-[#faf3e8] dark:bg-[#1a1410]"
      style={{
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=100"
          alt=""
          fill
          className="object-cover opacity-[0.05] dark:opacity-[0.08] brightness-[1.1] contrast-[1.05]"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf3e8]/98 via-[#faf3e8]/80 to-[#faf3e8]/40 dark:from-[#1a1410]/98 dark:via-[#1a1410]/80 dark:to-[#1a1410]/40" />
        <div
          className="absolute inset-0 opacity-[0.06] dark:hidden"
          style={{
            backgroundImage: "radial-gradient(circle, #ff5100 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0 opacity-10 hidden dark:block"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,81,0,0.55) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Warm accent glow */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none opacity-[0.06] blur-3xl" style={{ background: "#ff5100" }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-[0.04] blur-3xl" style={{ background: "#ff7d47" }} />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.25em] uppercase mb-1">Adventure Matchmaker</p>
            <h2 className="t-text text-xl font-bold tracking-tight">Your matched adventures</h2>
          </div>
        </div>

        {/* ── Two-column layout: left (tier + adventures) | right (radar) ── */}
        <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4">

          {/* Left column */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">

            {/* Tier card */}
            <div className="rounded-2xl overflow-hidden border relative"
              style={{ background: `linear-gradient(150deg, ${tier.color}10 0%, transparent 60%)`, borderColor: `${tier.color}20`, boxShadow: `0 0 40px ${tier.color}08` }}>
              <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: tier.color }} />
              <div className="relative px-4 pt-4 pb-4">
                {/* Identity */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${tier.color}15`, color: tier.color, boxShadow: `0 0 16px ${tier.color}30`, border: `1px solid ${tier.color}25` }}>
                    <div className="scale-125">{tier.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] uppercase tracking-[0.22em] font-semibold mb-0.5" style={{ color: "var(--text-tertiary)" }}>Capability Tier</p>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black tracking-tight leading-none" style={{ color: tier.color }}>{tier.label}</h2>
                      <div className="flex items-center gap-[2px]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="text-[10px] leading-none" style={{ color: i < tier.stars ? tier.color : "var(--text-muted)" }}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {nextRank && (
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black tabular-nums leading-none" style={{ color: tier.color }}>{progressPct}<span className="text-xs font-bold opacity-60">%</span></p>
                      <p className="text-[9px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>to <span className="font-bold" style={{ color: nextRank.color }}>{nextRank.label}</span></p>
                    </div>
                  )}
                </div>
                <div className="h-px mb-3" style={{ background: `${tier.color}10` }} />
                <RankBar totalScore={totalScore} trackH={6} showLabels showYouTag />
              </div>
            </div>

            {/* Adventures suited for you */}
            <div className="rounded-2xl border p-4" style={{ background: "var(--bg-page)", borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "var(--text-tertiary)" }}>Adventures suited for you</p>
                {matches.length > 0 && (
                  <Link href="/explore?ace=ready" className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#ff5100]/70 hover:text-[#ff5100] transition-colors">
                    See all <ChevronDown className="w-3 h-3 -rotate-90" />
                  </Link>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x no-scrollbar">
                {matches.length > 0
                  ? matches.map((adv) => <MiniAdventureCard key={adv.id} adventure={adv} />)
                  : <p className="text-sm italic" style={{ color: "var(--text-tertiary)" }}>No matching adventures found.</p>}
              </div>
            </div>

          </div>

          {/* Right column: Capability Profile Radar — hidden on mobile */}
          <div className="hidden lg:flex shrink-0 lg:self-stretch flex-col rounded-2xl overflow-hidden p-4"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", width: 270, position: "relative" }}>
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-5 h-5 pointer-events-none" style={{ borderTop: "1px solid rgba(255,81,0,0.4)", borderLeft: "1px solid rgba(255,81,0,0.4)" }} />
            <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none" style={{ borderTop: "1px solid rgba(255,81,0,0.4)", borderRight: "1px solid rgba(255,81,0,0.4)" }} />
            <div className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none" style={{ borderBottom: "1px solid rgba(255,81,0,0.4)", borderLeft: "1px solid rgba(255,81,0,0.4)" }} />
            <div className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none" style={{ borderBottom: "1px solid rgba(255,81,0,0.4)", borderRight: "1px solid rgba(255,81,0,0.4)" }} />
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--text-tertiary)" }}>Capability Profile</span>
            </div>
            {/* Radar */}
            <div className="flex-1 flex items-center justify-center">
              <div className="rounded-xl p-1.5" style={{ background: "radial-gradient(ellipse at center, rgba(255,81,0,0.07) 0%, transparent 70%)", border: "1px solid var(--border-subtle)" }}>
                <ACERadar ace={profile.ace} size={220} showLabels />
              </div>
            </div>
            {/* Animated axis ticker */}
            <AxisTicker />
            {/* Scan line */}
            <div className="absolute inset-x-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,81,0,0.45), transparent)", animation: `scanline ${SCAN_MS}ms linear infinite`, top: 0 }} />
            <style>{`@keyframes scanline { 0% { top:0%; opacity:0; } 8% { opacity:1; } 88% { opacity:1; } 100% { top:100%; opacity:0; } }`}</style>
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
            className="flex-1 inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm border transition-all"
            style={{ color: "var(--text-tertiary)", borderColor: "var(--border-default)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}>
            <BarChart2 className="w-3.5 h-3.5" />
            View detailed results
          </Link>
          <Link href="/ace"
            className="flex-1 inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm border transition-all"
            style={{ color: "var(--text-tertiary)", borderColor: "var(--border-default)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}>
            Learn more about ACE<sup>™</sup>
          </Link>
        </div>

        </div>
      </div>
    </section>
  );
}

const SAMPLE_ACE = { stamina: 4, power: 3, strength: 3, agility: 4, water: 2, altitude: 5, focus: 3, nerve: 4 };

const AXIS_TICKER = [
  { key: "Stamina",  color: "#f97316", desc: "Sustained output across any adventure", icon: <Flame    className="w-3 h-3" /> },
  { key: "Power",    color: "#eab308", desc: "Explosive output when it counts most",  icon: <Zap      className="w-3 h-3" /> },
  { key: "Strength", color: "#84cc16", desc: "Force for carries, climbs and paddles", icon: <Dumbbell className="w-3 h-3" /> },
  { key: "Agility",  color: "#22d3ee", desc: "Coordination and control in motion",    icon: <Compass  className="w-3 h-3" /> },
  { key: "Water",    color: "#3b82f6", desc: "Aquatic ease — pool, sea or river",     icon: <Waves    className="w-3 h-3" /> },
  { key: "Altitude", color: "#a78bfa", desc: "Coping with exposure at high altitude", icon: <Mountain className="w-3 h-3" /> },
  { key: "Focus",    color: "#f43f5e", desc: "Staying sharp when conditions get hard",icon: <Shield   className="w-3 h-3" /> },
  { key: "Nerve",    color: "#10b981", desc: "Calm and grit in high-stakes moments",  icon: <Wind     className="w-3 h-3" /> },
];

const SCAN_MS = 3200;

function AxisTicker() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const swapAt = SCAN_MS * 0.88;
    let swapTimer: ReturnType<typeof setTimeout>;
    let cycleTimer: ReturnType<typeof setInterval>;
    function scheduleCycle() {
      swapTimer = setTimeout(() => {
        setFade(false);
        setTimeout(() => { setIdx(i => (i + 1) % AXIS_TICKER.length); setFade(true); }, 220);
      }, swapAt);
    }
    scheduleCycle();
    cycleTimer = setInterval(scheduleCycle, SCAN_MS);
    return () => { clearTimeout(swapTimer); clearInterval(cycleTimer); };
  }, []);

  const current = AXIS_TICKER[idx];
  return (
    <div className="mt-2 rounded-lg px-2.5 py-2 w-full" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)" }}>
      <div style={{ opacity: fade ? 1 : 0, transition: "opacity 0.22s ease" }}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="shrink-0" style={{ color: current.color }}>{current.icon}</span>
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: current.color }}>{current.key}</span>
        </div>
        <p className="text-[9px] leading-none pl-[18px] truncate" style={{ color: "var(--text-tertiary)" }}>{current.desc}</p>
      </div>
    </div>
  );
}

function SampleRadarPanel() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden p-3 flex flex-col"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        width: 270,
        paddingLeft: 20,
        paddingRight: 20,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div className="absolute top-0 left-0 w-5 h-5 pointer-events-none" style={{ borderTop: "1px solid rgba(255,81,0,0.4)", borderLeft: "1px solid rgba(255,81,0,0.4)" }} />
      <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none" style={{ borderTop: "1px solid rgba(255,81,0,0.4)", borderRight: "1px solid rgba(255,81,0,0.4)" }} />
      <div className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none" style={{ borderBottom: "1px solid rgba(255,81,0,0.4)", borderLeft: "1px solid rgba(255,81,0,0.4)" }} />
      <div className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none" style={{ borderBottom: "1px solid rgba(255,81,0,0.4)", borderRight: "1px solid rgba(255,81,0,0.4)" }} />
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--text-tertiary)" }}>Sample Profile</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="rounded-xl p-1.5 flex items-center justify-center"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,81,0,0.07) 0%, transparent 70%)", border: "1px solid var(--border-subtle)" }}>
          <ACERadar ace={SAMPLE_ACE} size={230} showLabels />
        </div>
      </div>
      <AxisTicker />
      <div className="absolute inset-x-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,81,0,0.45), transparent)", animation: `scanline ${SCAN_MS}ms linear infinite`, top: 0 }} />
      <style>{`@keyframes scanline { 0% { top:0%; opacity:0; } 8% { opacity:1; } 88% { opacity:1; } 100% { top:100%; opacity:0; } }`}</style>
    </div>
  );
}

function DefaultCTA() {
  return (
    <section className="relative py-8 lg:py-12 px-5 lg:px-8 border-t overflow-hidden bg-[#faf3e8] dark:bg-[#1a1410]"
      style={{
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=100"
          alt=""
          fill
          className="object-cover opacity-[0.05] dark:opacity-[0.08] brightness-[1.1] contrast-[1.05]"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf3e8]/98 via-[#faf3e8]/80 to-[#faf3e8]/40 dark:from-[#1a1410]/98 dark:via-[#1a1410]/80 dark:to-[#1a1410]/40" />
        <div
          className="absolute inset-0 opacity-[0.06] dark:hidden"
          style={{
            backgroundImage: "radial-gradient(circle, #ff5100 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0 opacity-10 hidden dark:block"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,81,0,0.55) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Warm accent glow */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none opacity-[0.06] blur-3xl" style={{ background: "#ff5100" }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-[0.04] blur-3xl" style={{ background: "#ff7d47" }} />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 lg:gap-16 items-stretch">

          {/* Left: copy */}
          <div className="flex-1 min-w-0 flex flex-col relative">
            {/* Read pill */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wide uppercase backdrop-blur-md mb-4 self-start" style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)", color: "#f0ede8" }}>
              Read
              <ArrowRight className="w-3 h-3" />
            </span>
            <p className="text-[#ff5100] text-xs font-black tracking-[0.25em] uppercase mb-4">Adventure Matchmaker</p>
            <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight mb-3">
              Adventures built,<br />
              <span className="text-[#ff5100]">for your body</span>
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
              Answer 8 questions. We calibrate your capability level and match you to adventures you can actually handle.
            </p>
            <div className="flex flex-col gap-3 mt-auto">
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
                className="flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl text-base border transition-all duration-200"
              style={{ color: "var(--text-tertiary)", borderColor: "var(--border-default)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
              >
                Learn more about ACE<sup>™</sup>
              </Link>
            </div>
          </div>

          {/* Radar — hidden on mobile, shown sm+ */}
          <div className="hidden sm:flex shrink-0 w-[270px]">
            <SampleRadarPanel />
          </div>

        </div>
      </div>
    </section>
  );
}
