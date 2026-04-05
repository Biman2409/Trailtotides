"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { adventures } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Heart, BadgeCheck, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pill from "@/components/ui/custom/Pill";
import DifficultyMeter from "@/components/ui/custom/DifficultyMeter";
import SaveButton from "@/components/ui/custom/SaveButton";
import { getACE, computeDifficulty } from "@/lib/ace";
import type { Month } from "@/lib/data";

const MONTHS: Month[] = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatSeasonShort(bestMonths: Month[]): string {
  if (!bestMonths?.length) return "";
  if (bestMonths.length === 1) return bestMonths[0];
  return `${bestMonths[0]}–${bestMonths[bestMonths.length - 1]}`;
}

export default function WishlistPage() {
  const { saved, loading } = useWishlist();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Loading / hydrating ──────────────────────────────────────
  if (loggedIn === null || loading) {
    return (
      <main className="min-h-screen px-5 lg:px-8 py-16 lg:py-20" style={{ background: "var(--bg-base)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
              <div className="h-2.5 w-28 rounded bg-white/10 animate-pulse" />
            </div>
            <div className="h-9 w-52 rounded-xl bg-white/6 animate-pulse mb-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="aspect-[4/3] bg-white/5" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ── Not logged in ────────────────────────────────────────────
  if (loggedIn === false) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5" style={{ background: "var(--bg-base)" }}>
        <div
          className="max-w-md w-full rounded-3xl p-10 flex flex-col items-center text-center gap-6"
          style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.14)" }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,81,0,0.12)", border: "1px solid rgba(255,81,0,0.2)" }}>
            <Heart className="w-7 h-7" style={{ color: "#ff5100" }} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight mb-2">Your Wishlist</h1>
            <p className="text-white/40 text-sm leading-relaxed">
              Log in to save adventures and access your wishlist from anywhere.
            </p>
          </div>
          <button
            onClick={() => router.push("/auth/login")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: "#ff5100", boxShadow: "0 4px 14px rgba(255,81,0,0.35)" }}
          >
            <LogIn className="w-4 h-4" />
            Log in to view wishlist
          </button>
        </div>
      </main>
    );
  }

  // ── Logged in ────────────────────────────────────────────────
  const savedList = adventures.filter(a => saved.has(a.slug));

  return (
    <main className="min-h-screen px-5 lg:px-8 py-16 lg:py-20" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-2">
            <Heart className="w-4 h-4 fill-[#ff5100]" style={{ color: "#ff5100" }} />
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: "rgba(255,81,0,0.7)" }}>Saved Adventures</p>
          </div>
          <h1 className="text-white text-3xl lg:text-4xl font-bold tracking-tight">Your Wishlist</h1>
          {savedList.length > 0 && (
            <p className="text-white/40 text-sm mt-2">{savedList.length} adventure{savedList.length !== 1 ? "s" : ""} saved</p>
          )}
        </div>

        {/* Empty state */}
        {savedList.length === 0 && (
          <div
            className="rounded-3xl p-14 flex flex-col items-center text-center gap-5"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.15)" }}>
              <Heart className="w-7 h-7 text-white/20" />
            </div>
            <div>
              <p className="text-white/60 font-semibold text-base mb-1.5">Nothing saved yet</p>
              <p className="text-white/30 text-sm">
                Hit the <Heart className="w-3.5 h-3.5 inline" style={{ color: "#ff5100" }} /> on any adventure card to save it here.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 mt-1"
              style={{ background: "#ff5100", boxShadow: "0 4px 14px rgba(255,81,0,0.25)" }}
            >
              Explore adventures
            </Link>
          </div>
        )}

        {/* Cards grid */}
        {savedList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
                  className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Link href={`/experiences/${a.slug}`} className="absolute inset-0 z-10" />
                    <Image src={a.heroImage} alt={a.name} fill quality={90} className="object-cover transition-transform duration-700 group-hover:scale-105" />
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

                    {/* Bottom overlay */}
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
                            <><span className="text-white/20 mx-1">·</span><span className="font-semibold" style={{ color: "rgba(255,81,0,0.85)" }}>₹{lowestPrice.toLocaleString("en-IN")} onwards</span></>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
