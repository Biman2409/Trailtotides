"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Footprints, Mountain, CloudSnow, Flag, ArrowRight } from "lucide-react";
import { loadProfile } from "@/lib/matchmaker";

const TIER_INFO: Record<string, { color: string; icon: React.ReactNode; stars: number }> = {
  "Beginner Explorer":     { color: "#22d3ee", stars: 1, icon: <Compass    className="w-4 h-4" /> },
  "Trail Trekker":         { color: "#4ade80", stars: 2, icon: <Footprints className="w-4 h-4" /> },
  "Mountain Adventurer":   { color: "#f59e0b", stars: 3, icon: <Mountain   className="w-4 h-4" /> },
  "High-Altitude Trekker": { color: "#f97316", stars: 4, icon: <CloudSnow  className="w-4 h-4" /> },
  "Expedition Climber":    { color: "#a78bfa", stars: 5, icon: <Flag       className="w-4 h-4" /> },
};

export default function AdventureProfileSidebar() {
  const [stored, setStored] = useState<ReturnType<typeof loadProfile>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setStored(loadProfile()); setMounted(true); }, []);
  if (!mounted) return null;

  if (!stored) {
    return (
      <div className="pt-4 border-t border-white/5">
        <p className="text-[10px] uppercase tracking-wider font-bold text-white/30 mb-3">Adventure Profile</p>
        <p className="text-white/40 text-xs mb-3">No assessment taken yet.</p>
        <Link href="/matchmaker"
          className="inline-flex items-center gap-1.5 bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all group">
          Take Assessment <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    );
  }

  const tier = TIER_INFO[stored.label] ?? TIER_INFO["Trail Trekker"];

  return (
    <div className="pt-4 border-t border-white/5 space-y-3">
      <p className="text-[10px] uppercase tracking-wider font-bold text-white/30">Adventure Profile</p>

      <div className="flex items-center gap-3 p-3 rounded-2xl border"
        style={{ background: `${tier.color}0d`, borderColor: `${tier.color}28` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${tier.color}20`, color: tier.color }}>
          {tier.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs leading-tight" style={{ color: tier.color }}>{stored.label}</p>
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: tier.stars }).map((_, i) => (
              <span key={i} className="text-[10px]" style={{ color: tier.color }}>★</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {([["E", stored.ert.e, "#f97316"], ["R", stored.ert.r, "#ef4444"], ["T", stored.ert.t, "#8b5cf6"]] as const).map(([label, value, color]) => (
            <div key={label} className="flex flex-col items-center bg-white/5 border border-white/10 rounded-lg px-2 py-1">
              <span className="text-[8px] font-bold text-white/40 uppercase">{label}</span>
              <span className="text-sm font-bold leading-tight" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/explore?maxE=${stored.ert.e}&maxR=${stored.ert.r}&maxT=${stored.ert.t}`}
          className="flex-1 text-center bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-3 py-2 rounded-xl text-xs transition-all">
          Explore Treks
        </Link>
        <Link href="/matchmaker"
          className="flex-1 text-center border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-medium px-3 py-2 rounded-xl text-xs transition-all">
          Retake
        </Link>
      </div>
    </div>
  );
}
