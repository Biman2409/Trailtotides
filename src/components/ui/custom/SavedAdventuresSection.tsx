"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { useTripLog } from "@/contexts/TripLogContext";
import { adventures } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight, BadgeCheck, Trophy } from "lucide-react";
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

const PANEL_STYLE = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "1rem",
};

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

  if (loggedIn === null || loading || tripLoading) {
    return (
      <section className="py-10 px-5 lg:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0,1].map(i => (
            <div key={i} className="rounded-2xl p-4 animate-pulse" style={PANEL_STYLE}>
              <div className="h-2.5 w-20 rounded bg-white/10 mb-3" />
              <div className="flex gap-3 overflow-hidden">
                {[0,1].map(j => (
                  <div key={j} className="flex-none w-48 rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="aspect-[4/3] bg-white/5" />
                    <div className="p-2.5 space-y-1.5">
                      <div className="h-2.5 bg-white/5 rounded w-3/4" />
                      <div className="h-2 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const savedList = adventures.filter(a => saved.has(a.slug) && a.slug !== currentSlug);
  const doneList  = adventures.filter(a => log.some(e => e.slug === a.slug) && a.slug !== currentSlug);

  return (
    <section className="py-10 px-5 lg:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Wishlist panel ── */}
        <div className="p-4" style={PANEL_STYLE}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-rose-400/80">Wishlist</p>
              {loggedIn && savedList.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(244,63,94,0.15)", color: "#fb7185" }}>{savedList.length}</span>
              )}
            </div>
            {loggedIn && savedList.length > 0 && (
              <Link href="/explore" className="flex items-center gap-0.5 text-white/30 text-[10px] font-medium hover:text-rose-400 transition-colors">
                Explore <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* Content */}
          {!loggedIn ? (
            <div className="flex items-center gap-3 py-2">
              <p className="text-white/30 text-xs flex-1">Log in to save adventures to your wishlist.</p>
              <button onClick={() => router.push("/auth/login")} className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white" style={{ background: "#ff5100" }}>Log in</button>
            </div>
          ) : savedList.length === 0 ? (
            <p className="text-white/25 text-xs py-2">Hit the <Heart className="w-3 h-3 inline text-rose-400/60" /> on any adventure to add it here.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x no-scrollbar">
              {savedList.map((a) => <MiniCard key={a.slug} a={a} currentSlug={currentSlug} />)}
            </div>
          )}
        </div>

        {/* ── Been There panel ── */}
        <div className="p-4" style={PANEL_STYLE}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-amber-400" />
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-400/80">Been There</p>
              {loggedIn && doneList.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.15)", color: "#fcd34d" }}>{doneList.length}</span>
              )}
            </div>
            {loggedIn && doneList.length > 0 && (
              <Link href="/profile" className="flex items-center gap-0.5 text-white/30 text-[10px] font-medium hover:text-amber-400 transition-colors">
                View log <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* Content */}
          {!loggedIn ? (
            <div className="flex items-center gap-3 py-2">
              <p className="text-white/30 text-xs flex-1">Log in to track adventures you've completed.</p>
              <button onClick={() => router.push("/auth/login")} className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white" style={{ background: "#ff5100" }}>Log in</button>
            </div>
          ) : doneList.length === 0 ? (
            <p className="text-white/25 text-xs py-2">Mark adventures as completed to build your log here.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x no-scrollbar">
              {doneList.map((a) => <MiniCard key={a.slug} a={a} currentSlug={currentSlug} done />)}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

function MiniCard({ a, done = false }: { a: typeof adventures[number]; currentSlug: string; done?: boolean }) {
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
      className="group flex flex-col rounded-xl overflow-hidden flex-none w-48 snap-start transition-all duration-300 hover:-translate-y-1"
      style={{ background: "rgba(255,255,255,0.04)", border: done ? "1px solid rgba(251,191,36,0.15)" : "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/experiences/${a.slug}`} className="absolute inset-0 z-10" />
        <Image src={a.heroImage} alt={a.name} fill sizes="192px" quality={80} className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none" />

        {/* Badge */}
        <div className="absolute top-2 left-2 z-20">
          {done ? (
            <span className="text-[9px] font-bold px-2 h-4 rounded-full inline-flex items-center gap-1"
              style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a", boxShadow: "0 0 0 1px rgba(251,191,36,0.35)" }}>
              <Trophy className="w-2 h-2" />Done
            </span>
          ) : (
            <DifficultyMeter difficulty={difficulty} />
          )}
        </div>

        {!done && (
          <div className="absolute top-2 right-2 z-20">
            <SaveButton slug={a.slug} variant="card" />
          </div>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-20">
          <div className="flex items-center gap-1 mb-1">
            <Pill type="type" value={a.type} />
          </div>
          <h3 className="text-white font-bold text-xs leading-tight group-hover:text-[#ff5100] transition-colors line-clamp-2">{a.name}</h3>
        </div>
      </div>

      {/* Footer */}
      <div className="px-2.5 py-2 flex items-center justify-between gap-1.5">
        <span className="text-white/40 text-[9px] font-medium truncate">{a.durationDays}</span>
        {operatorCount > 0 && lowestPrice && (
          <span className="text-[#ff5100]/80 text-[9px] font-semibold whitespace-nowrap">₹{lowestPrice.toLocaleString("en-IN")}+</span>
        )}
      </div>
    </div>
  );
}
