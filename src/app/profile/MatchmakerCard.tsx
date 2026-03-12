"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProfile } from "@/lib/matchmaker";
import ERTBadge from "@/components/ui/custom/ERTBadge";
import { Compass, Footprints, Mountain, CloudSnow, Flag, ArrowRight, RotateCcw } from "lucide-react";

const TIER_INFO: Record<string, { color: string; icon: React.ReactNode }> = {
  "Beginner Explorer":     { color: "#22d3ee", icon: <Compass    className="w-5 h-5" /> },
  "Trail Trekker":         { color: "#4ade80", icon: <Footprints className="w-5 h-5" /> },
  "Mountain Adventurer":   { color: "#f59e0b", icon: <Mountain   className="w-5 h-5" /> },
  "High-Altitude Trekker": { color: "#f97316", icon: <CloudSnow  className="w-5 h-5" /> },
  "Expedition Climber":    { color: "#a78bfa", icon: <Flag       className="w-5 h-5" /> },
};

export default function MatchmakerCard({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [profile, setProfile] = useState<ReturnType<typeof loadProfile>>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const tier = profile ? (TIER_INFO[profile.label] ?? TIER_INFO["Trail Trekker"]) : null;

  return (
    <div className="mt-8 rounded-2xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">Adventure Profile</p>
          <p className="text-white/35 text-xs mt-0.5">Your matchmaker assessment result</p>
        </div>
        {profile && (
          <button
            onClick={() => {
              localStorage.removeItem("ttt_matchmaker_profile");
              setProfile(null);
            }}
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
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${tier.color}20`, color: tier.color }}
            >
              {tier.icon}
            </div>
            <div>
              <p className="text-white/30 text-[9px] uppercase tracking-widest">Adventure Tier</p>
              <p className="text-white font-bold text-base leading-tight" style={{ color: tier.color }}>{profile.label}</p>
            </div>
          </div>

          {/* ERT */}
          <p className="text-white/25 text-[9px] uppercase tracking-widest mb-2">ERT Capability</p>
          <ERTBadge ert={profile.ert} size="sm" dark />

          <p className="text-white/40 text-xs leading-relaxed mt-3">{profile.summary}</p>

          <Link
            href={`/explore?maxE=${profile.ert.e}&maxR=${profile.ert.r}&maxT=${profile.ert.t}`}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "#ff5100" }}
          >
            Explore your treks
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-white/35 text-sm mb-1">No assessment taken yet</p>
          <p className="text-white/20 text-xs mb-4">
            {isLoggedIn
              ? "Take the assessment to build your adventure profile."
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
