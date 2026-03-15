"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProfile } from "@/lib/matchmaker";
import ACEBadge from "@/components/ui/custom/ACEBadge";
import ACERadar from "@/components/ui/custom/ACERadar";
import { ArrowRight, RotateCcw } from "lucide-react";

const TIER_INFO: Record<string, { color: string; stars: number; icon: React.ReactNode }> = {
  "Uncharted":   { color: "#6b7280", stars: 0, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/><path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg> },
  "Pathfinder":  { color: "#22d3ee", stars: 1, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  "Navigator":   { color: "#4ade80", stars: 2, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/></svg> },
  "Trailblazer": { color: "#f59e0b", stars: 3, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  "Vanguard":    { color: "#f97316", stars: 4, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg> },
  "Apex":        { color: "#a78bfa", stars: 5, icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg> },
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
