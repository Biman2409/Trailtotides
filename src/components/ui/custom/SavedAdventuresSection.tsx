"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { useTripLog } from "@/contexts/TripLogContext";
import { adventures } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight, LogIn, BadgeCheck, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pill from "./Pill";
import DifficultyMeter from "./DifficultyMeter";
import SaveButton from "./SaveButton";
import { getACE, computeDifficulty } from "@/lib/ace";
import type { Month } from "@/lib/data";

const MONTHS: Month[] = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function formatSeasonShort(bestMonths: Month[]): string {
  if (!bestMonths?.length) return "";
  if (bestMonths.length === 1) return bestMonths[0];
  return `${bestMonths[0]}–${bestMonths[bestMonths.length - 1]}`;
}

export default function SavedAdventuresSection({ currentSlug }: { currentSlug: string }) {
  const { saved, loading } = useWishlist();
  const { log, loading: tripLoading } = useTripLog();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Show skeleton until auth + wishlist + triplog resolved
  if (loggedIn === null || loading || tripLoading) {
    return (
      <section
        className="py-12 lg:py-16 px-5 lg:px-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
            <div className="h-2.5 w-32 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3].map(i => (
              <div key={i} className="flex-none w-72 rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="aspect-[4/3] bg-white/5" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const savedList = adventures.filter(a => saved.has(a.slug) && a.slug !== currentSlug);
  const doneList  = adventures.filter(a => log.some(e => e.slug === a.slug) && a.slug !== currentSlug);

  /* ── Logged in, has saved and/or completed ── */
  return (
    <section className="py-12 lg:py-16 px-5 lg:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto">

        {/* Two-column header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">

          {/* ── Wishlist ── */}
          <div>
            <div className="flex items-end justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-rose-400/70">Wishlist</p>
                </div>
                <h2 className="text-white text-xl lg:text-2xl font-semibold tracking-tight">
                  {savedList.length > 0 ? `${savedList.length} saved` : "Nothing saved yet"}
                </h2>
              </div>
              {savedList.length > 0 && (
                <Link href="/explore" className="flex items-center gap-1 text-white/35 text-xs font-medium hover:text-[#ff5100] transition-colors group">
                  Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {!loggedIn ? (
              <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.12)" }}>
                <Heart className="w-5 h-5 text-rose-400/50 shrink-0" />
                <div className="flex-1">
                  <p className="text-white/50 text-sm font-medium mb-0.5">Log in to save adventures</p>
                  <p className="text-white/25 text-xs">Track everything you want to explore.</p>
                </div>
                <button onClick={() => router.push("/auth/login")} className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: "#ff5100" }}>
                  Log in
                </button>
              </div>
            ) : savedList.length === 0 ? (
              <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.12)" }}>
                <Heart className="w-5 h-5 text-rose-400/50 shrink-0" />
                <p className="text-white/30 text-sm">Hit the <Heart className="w-3 h-3 inline text-rose-400/60" /> on any adventure to add it here.</p>
              </div>
            ) : (
              <div className="flex gap-3.5 overflow-x-auto pb-3 -mx-1 px-1 snap-x no-scrollbar">
                {savedList.map((a) => <AdventureCard key={a.slug} a={a} currentSlug={currentSlug} />)}
              </div>
            )}
          </div>

          {/* ── Completed ── */}
          <div>
            <div className="flex items-end justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-400/70">Been There</p>
                </div>
                <h2 className="text-white text-xl lg:text-2xl font-semibold tracking-tight">
                  {doneList.length > 0 ? `${doneList.length} completed` : "Nothing logged yet"}
                </h2>
              </div>
              {doneList.length > 0 && (
                <Link href="/profile" className="flex items-center gap-1 text-white/35 text-xs font-medium hover:text-amber-400 transition-colors group">
                  View log <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {!loggedIn ? (
              <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
                <Trophy className="w-5 h-5 text-amber-400/50 shrink-0" />
                <div className="flex-1">
                  <p className="text-white/50 text-sm font-medium mb-0.5">Log in to track completed adventures</p>
                  <p className="text-white/25 text-xs">Build your adventure log over time.</p>
                </div>
                <button onClick={() => router.push("/auth/login")} className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: "#ff5100" }}>
                  Log in
                </button>
              </div>
            ) : doneList.length === 0 ? (
              <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
                <Trophy className="w-5 h-5 text-amber-400/50 shrink-0" />
                <p className="text-white/30 text-sm">Mark adventures as done to build your log here.</p>
              </div>
            ) : (
              <div className="flex gap-3.5 overflow-x-auto pb-3 -mx-1 px-1 snap-x no-scrollbar">
                {doneList.map((a) => <AdventureCard key={a.slug} a={a} currentSlug={currentSlug} done />)}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

function AdventureCard({ a, done = false }: { a: ReturnType<typeof adventures[0]["slice"]> extends never ? typeof adventures[number] : typeof adventures[number]; currentSlug: string; done?: boolean }) {
  const difficulty = computeDifficulty(getACE(a));
  const monthIndex = new Date().getMonth();
  const currentMonth = MONTHS[monthIndex];
  const nextMonth = MONTHS[(monthIndex + 1) % 12];
  const isSeasonActive = a.bestMonths?.includes(currentMonth);
  const isSeasonUpcoming = !isSeasonActive && a.bestMonths?.includes(nextMonth);
  const seasonLabel = formatSeasonShort(a.bestMonths ?? []);
  const operatorCount = a.operators?.length ?? 0;
  const verifiedCount = a.operators?.filter(o => o.verified).length ?? 0;
  const lowestPrice = a.operators?.reduce<number | null>((min, o) => {
    const p = parseInt(o.priceFrom.replace(/[^\d]/g, ""), 10);
    return isNaN(p) ? min : min === null ? p : Math.min(min, p);
  }, null) ?? null;
  const displayCount = verifiedCount > 0 ? verifiedCount : operatorCount;

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden flex-none w-64 snap-start transition-all duration-300 hover:-translate-y-1.5"
      style={{ background: "rgba(255,255,255,0.04)", border: done ? "1px solid rgba(251,191,36,0.15)" : "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/experiences/${a.slug}`} className="absolute inset-0 z-10" />
        <Image src={a.heroImage} alt={a.name} fill quality={90} className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 z-10 pointer-events-none" />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
          {done ? (
            <span className="text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1"
              style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a", boxShadow: "0 0 0 1px rgba(251,191,36,0.35)" }}>
              <Trophy className="w-2.5 h-2.5" />Done
            </span>
          ) : (
            <DifficultyMeter difficulty={difficulty} />
          )}
          {!done && isSeasonActive && (
            <span className="text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1"
              style={{ background: "rgba(16,185,129,0.25)", color: "#6ee7b7", boxShadow: "0 0 0 1px rgba(16,185,129,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />Season Active
            </span>
          )}
          {!done && !isSeasonActive && isSeasonUpcoming && (
            <span className="text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1"
              style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a", boxShadow: "0 0 0 1px rgba(251,191,36,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Upcoming
            </span>
          )}
          {!done && !isSeasonActive && !isSeasonUpcoming && seasonLabel && (
            <span className="text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center"
              style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)", boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}>{seasonLabel}</span>
          )}
        </div>

        {/* Top-right: save button (only on wishlist cards) */}
        {!done && (
          <div className="absolute top-3 right-3 z-20">
            <SaveButton slug={a.slug} variant="card" />
          </div>
        )}

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1.5 pointer-events-auto">
            <Pill type="type" value={a.type} />
            <Pill type="subRegion" value={a.state} />
          </div>
          <h3 className="text-white font-bold text-sm leading-tight tracking-tight group-hover:text-[#ff5100] transition-colors">{a.name}</h3>
        </div>
      </div>

      {/* Price strip */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <span className="text-white/50 text-[10px] font-medium leading-none">{a.durationDays}</span>
        {operatorCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] leading-none">
            <BadgeCheck className="w-3 h-3 text-emerald-400/80 shrink-0" />
            <span className="text-white/40">
              <span className="text-white/65 font-semibold">{displayCount}</span> operators
              {lowestPrice && <><span className="text-white/20 mx-1">·</span><span className="text-[#ff5100]/85 font-semibold">₹{lowestPrice.toLocaleString("en-IN")} onwards</span></>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
