"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loadProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";

const TIER_INFO: Record<string, { color: string; stars: number; icon: React.ReactNode }> = {
  "Uncharted":    { color: "#6b7280", stars: 0, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2"/><path d="M7.5 7.5a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg> },
  "Pathfinder":  { color: "#22d3ee", stars: 1, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4"/><path d="M10 13.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7.5 9.5L10 7l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  "Trailblazer": { color: "#4ade80", stars: 2, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><path d="M10 2L16.5 5V10.5C16.5 14.2 13.5 17 10 18.2C6.5 17 3.5 14.2 3.5 10.5V5L10 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><circle cx="10" cy="7.5" r="1.2" fill="currentColor"/><circle cx="8" cy="11" r="1.2" fill="currentColor"/><circle cx="12" cy="14" r="1.2" fill="currentColor"/></svg> },
  "Navigator":   { color: "#f59e0b", stars: 3, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><path d="M10 1.5L17 5.5V13.5L10 18L3 13.5V5.5L10 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M10 5.5L12.5 10L10 14.5L7.5 10L10 5.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/><path d="M10 5.5L12.5 10L10 8.5L7.5 10L10 5.5Z" fill="currentColor"/></svg> },
  "Expeditioner":{ color: "#f97316", stars: 4, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><path d="M10 1.5L3 5V11C3 14.8 6 17.5 10 19C14 17.5 17 14.8 17 11V5L10 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M7.5 1.5L10 3.5L12.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" strokeOpacity="0.6"/><path d="M5.5 15L8 10.5L10 13L12 8.5L15 15H5.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25"/></svg> },
  "Apex":        { color: "#a78bfa", stars: 5, icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><polygon points="10,1.5 12.9,7.8 19.5,8.1 14.7,12.8 16.3,19.2 10,15.8 3.7,19.2 5.3,12.8 0.5,8.1 7.1,7.8" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="10,5.5 11.4,9.2 15.3,9.5 12.4,12 13.4,15.8 10,13.7 6.6,15.8 7.6,12 4.7,9.5 8.6,9.2" fill="currentColor" fillOpacity="0.7"/></svg> },
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

  const tier = TIER_INFO[stored.label] ?? TIER_INFO["Pathfinder"];

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
