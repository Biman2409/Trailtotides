"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loadProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";

const TIER_INFO: Record<string, { color: string; stars: number; icon: React.ReactNode }> = {
  "Uncharted":    { color: "#22d3ee", stars: 1, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 3v2M10 15v2M3 10h2M15 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="10" r="2" fill="currentColor"/></svg> },
  "Trailblazer": { color: "#4ade80", stars: 2, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><path d="M5 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 15c1-2 2-3 3-5s1-4 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="10" r="1.5" fill="currentColor"/><circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="12" cy="13" r="1.5" fill="currentColor"/></svg> },
  "Navigator":   { color: "#f59e0b", stars: 3, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/><path d="M10 5l2 4H8l2-4z" fill="currentColor"/><path d="M10 15l-2-4h4l-2 4z" fill="currentColor" fillOpacity="0.4"/></svg> },
  "Expeditioner":{ color: "#f97316", stars: 4, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><path d="M3 15l3.5-5 2.5 3 3-4.5L16 15H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor"/><path d="M7 15v-2a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  "Apex":        { color: "#a78bfa", stars: 5, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><path d="M10 3l2 4 4.5.7-3.25 3.15.77 4.5L10 13.25l-4.02 2.1.77-4.5L3.5 7.7 8 7l2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/></svg> },
};

export default function AdventureProfileSidebar() {
  const [stored, setStored] = useState<ReturnType<typeof loadProfile>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setStored(loadProfile()); setMounted(true); }, []);
  if (!mounted) return null;

  if (!stored) {
    return (
      <div className="pt-4 border-t border-white/5">
        <p className="text-[10px] uppercase tracking-wider font-bold text-white/30 mb-3">ACE Profile</p>
        <p className="text-white/40 text-xs mb-3">No assessment taken yet.</p>
        <Link href="/matchmaker"
          className="inline-flex items-center gap-1.5 bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all group">
          Take Assessment <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    );
  }

  const tier = TIER_INFO[stored.label] ?? TIER_INFO["Uncharted"];

  return (
    <div className="pt-4 border-t border-white/5 space-y-3">
      <p className="text-[10px] uppercase tracking-wider font-bold text-white/30">ACE Profile</p>

      {/* Tier badge */}
      <div className="flex items-center gap-3 p-3 rounded-2xl border"
        style={{ background: `${tier.color}0d`, borderColor: `${tier.color}28` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${tier.color}20`, color: tier.color }}>
          {tier.icon}
        </div>
        <div>
          <p className="font-bold text-xs leading-tight" style={{ color: tier.color }}>{stored.label}</p>
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: tier.stars }).map((_, i) => (
              <span key={i} className="text-[10px]" style={{ color: tier.color }}>★</span>
            ))}
          </div>
        </div>
      </div>

      {/* Radar */}
      <div className="flex justify-center py-1">
        <ACERadar ace={stored.ace} size={160} showLabels />
      </div>

      <div className="flex gap-2">
        <Link href="/matchmaker"
          className="flex-1 text-center bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-3 py-2 rounded-xl text-xs transition-all">
          Find Adventures
        </Link>
        <Link href="/matchmaker"
          className="flex-1 text-center border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-medium px-3 py-2 rounded-xl text-xs transition-all">
          Retake
        </Link>
      </div>
    </div>
  );
}
