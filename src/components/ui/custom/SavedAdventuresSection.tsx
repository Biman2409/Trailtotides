"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { adventures } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pill from "./Pill";
import { getACE, computeDifficulty } from "@/lib/ace";

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
            return (
              <div
                key={a.slug}
                className="group relative flex flex-col rounded-2xl overflow-hidden flex-none w-64 snap-start transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Link href={`/experiences/${a.slug}`} className="absolute inset-0 z-10" />
                <div className="relative h-40 overflow-hidden">
                  <Image src={a.heroImage} alt={a.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-20">
                    <Pill type="type" value={a.type} />
                  </div>
                  <div
                    className="absolute bottom-2.5 right-2.5 z-20 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {difficulty}
                  </div>
                </div>
                <div className="p-3.5 flex-1">
                  <div className="mb-1.5">
                    <Pill type="subRegion" value={a.state} />
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-[#ff5100] transition-colors">{a.name}</h3>
                  <p className="text-white/35 text-[11px] mt-1 line-clamp-2 leading-relaxed">{a.tagline}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
