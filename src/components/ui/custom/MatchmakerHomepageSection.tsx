"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Compass, Footprints, Mountain, CloudSnow, Flag, RotateCcw,
  Flame, Zap, Dumbbell, Waves,
} from "lucide-react";
import { adventures } from "@/lib/data";
import { getACE, ACE_AXIS_COLORS } from "@/lib/ace";
import { loadProfile, getMatchedAdventures, type StoredProfile } from "@/lib/matchmaker";

const TIER_INFO: Record<string, { color: string; icon: React.ReactNode; stars: number }> = {
  "Beginner Explorer":        { color: "#22d3ee", stars: 1, icon: <Compass    className="w-5 h-5" /> },
  "Trail Trekker":            { color: "#4ade80", stars: 2, icon: <Footprints className="w-5 h-5" /> },
  "Mountain Adventurer":      { color: "#f59e0b", stars: 3, icon: <Mountain   className="w-5 h-5" /> },
  "High-Altitude Adventurer": { color: "#f97316", stars: 4, icon: <CloudSnow  className="w-5 h-5" /> },
  "Expedition Athlete":       { color: "#a78bfa", stars: 5, icon: <Flag       className="w-5 h-5" /> },
};

const ACE_PILL_AXES = [
  { key: "stamina",  icon: <Flame  className="w-2.5 h-2.5" />, color: "#f97316" },
  { key: "altitude", icon: <Mountain className="w-2.5 h-2.5" />, color: "#a78bfa" },
  { key: "nerve",    icon: <Zap    className="w-2.5 h-2.5" />, color: "#f43f5e" },
];

function MiniAdventureCard({ adventure }: { adventure: (typeof adventures)[number] }) {
  const ace = getACE(adventure);
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
        {/* ACE highlights */}
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
          {ACE_PILL_AXES.filter(({ key }) => ace[key as keyof typeof ace] > 0).slice(0, 2).map(({ key, icon, color }) => (
            <span key={key} className="flex items-center gap-0.5" style={{ color }}>
              {icon}
              <span className="text-[8px] font-bold text-white/80">{ace[key as keyof typeof ace]}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-white text-xs font-semibold leading-tight line-clamp-2 group-hover:text-[#ff5100] transition-colors">
          {adventure.name}
        </p>
        {adventure.state && <p className="text-white/40 text-[10px] mt-1 truncate">{adventure.state}</p>}
      </div>
    </Link>
  );
}

function AcePill({ axis, value }: { axis: string; value: number }) {
  const color = ACE_AXIS_COLORS[axis as keyof typeof ACE_AXIS_COLORS] ?? "#ff5100";
  return (
    <div className="flex flex-col items-center gap-1 border rounded-xl px-3 py-2 min-w-[52px]"
      style={{ background: `${color}12`, borderColor: `${color}25` }}>
      <span className="text-white/40 text-[9px] font-bold tracking-widest uppercase">{axis.slice(0,3).toUpperCase()}</span>
      <span className="text-lg font-bold" style={{ color }}>{value}</span>
    </div>
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

  const tier = TIER_INFO[profile.label] ?? TIER_INFO["Trail Trekker"];
  const matches = getMatchedAdventures(profile.ace, adventures).slice(0, 3);

  // Show 4 most relevant non-zero axes
  const topAxes = (Object.entries(profile.ace) as [string, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([k]) => k);

  return (
    <section className="py-16 lg:py-32 px-5 lg:px-8 bg-[#0f1420] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-10">
          <p className="text-[#ff5100] text-xs font-black tracking-[0.25em] uppercase mb-4">Adventure Matchmaker</p>
          <h2 className="text-white text-3xl lg:text-5xl font-bold tracking-tight leading-tight mb-3">Your adventure profile</h2>
          <p className="text-white/55 text-sm">Based on your ACE assessment — here&apos;s what you&apos;re built for.</p>
        </div>

        {/* Tier badge + ACE axes */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-3 border"
            style={{ background: `${tier.color}12`, borderColor: `${tier.color}30`, boxShadow: `0 0 24px ${tier.color}18` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tier.color}22`, color: tier.color }}>
              {tier.icon}
            </div>
            <div>
              <p className="text-xs text-white/40 font-medium mb-0.5">Your tier</p>
              <p className="font-bold text-sm leading-tight" style={{ color: tier.color }}>{profile.label}</p>
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: tier.stars }).map((_, i) => (
                  <span key={i} className="text-xs" style={{ color: tier.color }}>★</span>
                ))}
              </div>
            </div>
          </div>

          {/* ACE axis pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {topAxes.map((axis) => (
              <AcePill key={axis} axis={axis} value={profile.ace[axis as keyof typeof profile.ace]} />
            ))}
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
    <section className="py-16 lg:py-32 px-5 lg:px-8 bg-[#0f1420] border-t border-white/5">
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
            profile and the adventures you&apos;re truly ready for.
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
