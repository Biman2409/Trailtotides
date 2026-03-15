"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loadProfile } from "@/lib/matchmaker";
import ACERadar from "@/components/ui/custom/ACERadar";

const TIER_INFO: Record<string, { color: string; stars: number; icon: React.ReactNode }> = {
  "Uncharted":    { color: "#6b7280", stars: 0, icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/><path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg> },
  "Pathfinder":  { color: "#22d3ee", stars: 1, icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  "Trailblazer": { color: "#4ade80", stars: 2, icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="9" r="1.6" fill="currentColor"/><circle cx="9.5" cy="13.5" r="1.6" fill="currentColor"/><circle cx="14.5" cy="17.5" r="1.6" fill="currentColor"/></svg> },
  "Navigator":   { color: "#f59e0b", stars: 3, icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 6.5L15.5 12L12 17.5L8.5 12L12 6.5Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M12 6.5L15.5 12L12 11L8.5 12L12 6.5Z" fill="currentColor"/></svg> },
  "Expeditioner":{ color: "#f97316", stars: 4, icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M12 2L4 6.5V13.5C4 18.5 7.5 22.2 12 23.5C16.5 22.2 20 18.5 20 13.5V6.5L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M9 2L12 4.5L15 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.65"/><path d="M6.5 19L9.5 13L12 16L14.5 10.5L18 19H6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.35"/></svg> },
  "Apex":        { color: "#a78bfa", stars: 5, icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg> },
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
