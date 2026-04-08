"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { adventures } from "@/lib/data";
import { loadProfile, getMatchedAdventures, type StoredProfile } from "@/lib/matchmaker";
import AdventureCard from "@/components/ui/custom/AdventureCard";

export default function SuitedAdventures() {
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setMounted(true);
  }, []);

  if (!mounted || !profile) return null;

  const matches = getMatchedAdventures(profile.ace, adventures).slice(0, 4);
  if (matches.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 px-5 lg:px-8 t-bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <div>
            <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Matched for You
            </p>
            <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight">
              Adventures Suited for You
            </h2>
            <div className="mt-3 w-10 h-0.5 bg-[#ff5100] rounded-full" />
          </div>
          <Link
            href="/explore?ace=ready"
            className="hidden sm:flex items-center gap-1.5 text-[#ff5100] text-sm font-semibold hover:text-[#ff7d47] transition-colors group"
          >
            See all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {matches.map((adventure) => (
            <AdventureCard key={adventure.id} adventure={adventure} size="default" />
          ))}
        </div>

        <div className="mt-7 flex justify-center sm:hidden">
          <Link
            href="/explore?ace=ready"
            className="flex items-center gap-1.5 text-[#ff5100] font-semibold text-sm"
          >
            See all matching adventures <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
