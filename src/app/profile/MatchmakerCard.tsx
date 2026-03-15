"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProfile } from "@/lib/matchmaker";
import ACEBadge from "@/components/ui/custom/ACEBadge";
import ACERadar from "@/components/ui/custom/ACERadar";
import { ArrowRight, RotateCcw } from "lucide-react";

const TIER_INFO: Record<string, { color: string; stars: number; icon: React.ReactNode }> = {
  "Uncharted":    { color: "#6b7280", stars: 0, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M7.5 7.5a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg> },
  "Pathfinder":  { color: "#22d3ee", stars: 1, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="4.5" r="1.5" fill="currentColor"/><path d="M10 7v4l-2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 11l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  "Trailblazer": { color: "#4ade80", stars: 2, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M5 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="10" r="1.5" fill="currentColor"/><circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="12" cy="13" r="1.5" fill="currentColor"/></svg> },
  "Navigator":   { color: "#f59e0b", stars: 3, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/><path d="M10 5l2 4H8l2-4z" fill="currentColor"/><path d="M10 15l-2-4h4l-2 4z" fill="currentColor" fillOpacity="0.4"/></svg> },
  "Expeditioner":{ color: "#f97316", stars: 4, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M3 15l3.5-5 2.5 3 3-4.5L16 15H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor"/><path d="M7 15v-2a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  "Apex":        { color: "#a78bfa", stars: 5, icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M10 3l2 4 4.5.7-3.25 3.15.77 4.5L10 13.25l-4.02 2.1.77-4.5L3.5 7.7 8 7l2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/></svg> },
};

export default function MatchmakerCard({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [profile, setProfile] = useState<ReturnType<typeof loadProfile>>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const tier = profile ? (TIER_INFO[profile.label] ?? TIER_INFO["Pathfinder"]) : null;

  return (
    <div className="mt-8 rounded-2xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <p className="text-white font-semibold text-sm">Adventure Profile</p>
        {profile && (
          <button
            onClick={() => { localStorage.removeItem("ttt_matchmaker_profile"); setProfile(null); }}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Retake
          </button>
        )}
      </div>

      {profile && tier ? (
        <div className="px-6 py-5">
          {/* Tier */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tier.color}20`, color: tier.color }}>
              {tier.icon}
            </div>
            <div>
              <p className="text-white/30 text-[9px] uppercase tracking-widest">Adventure Tier</p>
              <p className="font-bold text-base leading-tight" style={{ color: tier.color }}>{profile.label}</p>
            </div>
          </div>

          {/* Radar */}
          <p className="text-white/25 text-[9px] uppercase tracking-widest mb-3">ACE Capability Profile</p>
          <ACERadar ace={profile.ace} size={160} showLabels />

          {/* Badge */}
          <div className="mt-3">
            <ACEBadge ace={profile.ace} size="sm" dark />
          </div>

          {profile.summary && (
            <p className="text-white/40 text-xs leading-relaxed mt-3">{profile.summary}</p>
          )}

          <Link
            href="/explore"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "#ff5100" }}
          >
            Explore your adventures
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-white/35 text-sm mb-1">No assessment taken yet</p>
          <p className="text-white/20 text-xs mb-4">
            {isLoggedIn
              ? "Take the assessment to build your ACE adventure profile."
              : "Log in and take the assessment to save your profile."}
          </p>
          <Link
            href="/matchmaker"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: "#ff5100" }}
          >
            Take Assessment
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
