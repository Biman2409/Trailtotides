"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { adventures } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight, LogIn, BadgeCheck } from "lucide-react";
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
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Don't render until auth + wishlist resolved
  if (loggedIn === null || loading) return null;

  /* ── Not logged in ── */
  if (!loggedIn) {
    return (
      <section
        className="py-12 lg:py-16 px-5 lg:px-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/30">Your Saved Adventures</p>
          </div>
          <div
            className="mt-5 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6"
            style={{ background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.14)" }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.2)" }}>
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-white font-semibold text-base mb-1">Save adventures to your wishlist</p>
              <p className="text-white/40 text-sm leading-relaxed">
                Log in to start saving adventures and track everything you want to explore.
              </p>
            </div>
            <button
              onClick={() => router.push("/auth/login")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 shrink-0"
              style={{ background: "#ff5100", boxShadow: "0 4px 14px rgba(255,81,0,0.35)" }}
            >
              <LogIn className="w-4 h-4" />
              Log in to save
            </button>
          </div>
        </div>
      </section>
    );
  }

  const savedList = adventures.filter(a => saved.has(a.slug) && a.slug !== currentSlug);

  /* ── Logged in, wishlist empty ── */
  if (savedList.length === 0) {
    return (
      <section
        className="py-12 lg:py-16 px-5 lg:px-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Heart className="w-4 h-4 text-rose-400" />
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/30">Your Saved Adventures</p>
          </div>
          <p className="text-white/30 text-sm">
            No saved adventures yet. Hit the{" "}
            <Heart className="w-3.5 h-3.5 inline text-rose-400" /> on any adventure to save it here.
          </p>
        </div>
      </section>
    );
  }

  /* ── Logged in, has saved adventures ── */
  return (
    <section
      className="py-12 lg:py-16 px-5 lg:px-8"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-rose-400/70">Your Saved Adventures</p>
            </div>
            <h2 className="text-white text-2xl lg:text-3xl font-semibold tracking-tight">Your Wishlist</h2>
          </div>
          <Link
            href="/wishlist"
            className="hidden sm:flex items-center gap-1.5 text-white/40 text-sm font-medium hover:text-[#ff5100] transition-colors group"
          >
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2 snap-x snap-mandatory no-scrollbar">
          {savedList.map((a) => {
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
                key={a.slug}
                className="group relative flex flex-col rounded-2xl overflow-hidden flex-none w-72 snap-start transition-all duration-300 hover:-translate-y-1.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
              >
                {/* Image area */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Link href={`/experiences/${a.slug}`} className="absolute inset-0 z-10" />
                  <Image src={a.heroImage} alt={a.name} fill quality={90} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(160deg,rgba(30,60,110,0.10) 0%,rgba(10,30,60,0.06) 50%,rgba(80,30,10,0.08) 100%)", mixBlendMode: "multiply" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 z-10 pointer-events-none" />

                  {/* Top-left: difficulty + season */}
                  <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
                    <DifficultyMeter difficulty={difficulty} />
                    {isSeasonActive ? (
                      <span className="pointer-events-none text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1" style={{ background: "rgba(16,185,129,0.25)", color: "#6ee7b7", boxShadow: "0 0 0 1px rgba(16,185,129,0.35)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />Season Active
                      </span>
                    ) : isSeasonUpcoming ? (
                      <span className="pointer-events-none text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center gap-1" style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a", boxShadow: "0 0 0 1px rgba(251,191,36,0.35)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Upcoming
                      </span>
                    ) : seasonLabel ? (
                      <span className="pointer-events-none text-[10px] font-bold px-2.5 h-5 rounded-full tracking-tight inline-flex items-center" style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)", boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}>{seasonLabel}</span>
                    ) : null}
                  </div>

                  {/* Top-right: save button */}
                  <div className="absolute top-3 right-3 z-20">
                    <SaveButton slug={a.slug} variant="card" />
                  </div>

                  {/* Bottom: type + location + name */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
                    <div className="flex items-center gap-2 mb-1.5 pointer-events-auto">
                      <Pill type="type" value={a.type} />
                      <Pill type="subRegion" value={a.state} />
                    </div>
                    <h3 className="text-white font-bold text-base leading-tight tracking-tight group-hover:text-[#ff5100] transition-colors">{a.name}</h3>
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
                        {lowestPrice && (
                          <><span className="text-white/20 mx-1">·</span><span className="text-[#ff5100]/85 font-semibold">₹{lowestPrice.toLocaleString("en-IN")} onwards</span></>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
