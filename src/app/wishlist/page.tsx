"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare, MAX } from "@/contexts/CompareContext";
import { adventures } from "@/lib/data";
import type { Adventure, Month } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, BadgeCheck, LogIn, GitCompare, Search, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Pill from "@/components/ui/custom/Pill";
import DifficultyMeter from "@/components/ui/custom/DifficultyMeter";
import SaveButton from "@/components/ui/custom/SaveButton";
import { getACE, computeDifficulty } from "@/lib/ace";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompareAdventures from "@/components/ui/custom/CompareAdventures";
import { toast } from "sonner";

const MONTHS: Month[] = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatSeasonShort(months: Month[]): string {
  if (!months?.length) return "";
  if (months.length === 1) return months[0];
  return `${months[0]}–${months[months.length - 1]}`;
}

// ─── Search dropdown ──────────────────────────────────────────────────────────
function AdventureSearch({
  excludeIds,
  onSelect,
  onClose,
}: {
  excludeIds: Set<string>;
  onSelect: (a: Adventure) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 60);
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  const results = adventures
    .filter(a => !excludeIds.has(a.id) && (!query || a.name.toLowerCase().includes(query.toLowerCase())))
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}>
      <div
        ref={panelRef}
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "rgba(11,13,20,0.99)", border: "1px solid rgba(255,255,255,0.09)" }}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: "#ff5100" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search any adventure to compare…"
            className="flex-1 bg-transparent text-white text-sm placeholder-white/20 outline-none"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/8 shrink-0"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: "360px" }}>
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Search className="w-6 h-6 text-white/10" />
              <p className="text-white/20 text-sm">No adventures found</p>
            </div>
          ) : results.map((a, idx) => (
            <button
              key={a.id}
              onClick={() => { onSelect(a); onClose(); }}
              className="w-full flex items-center gap-4 px-4 py-3 text-left transition-colors"
              style={{ borderBottom: idx < results.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,81,0,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
                <Image src={a.heroImage} alt={a.name} fill quality={70} className="object-cover" />
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold leading-snug truncate">{a.name}</p>
                <p className="text-white/35 text-xs mt-0.5 truncate">{a.type} · {a.state}</p>
              </div>
              {/* Difficulty */}
              <div className="shrink-0 opacity-70">
                <DifficultyMeter difficulty={computeDifficulty(getACE(a))} />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-white/15 text-[10px]">{results.length} result{results.length !== 1 ? "s" : ""}</p>
          <p className="text-white/15 text-[10px]">Esc to close</p>
        </div>
      </div>
    </div>
  );
}

// ─── Compare tray ─────────────────────────────────────────────────────────────
function CompareTray({ onCompareClick }: { onCompareClick: () => void }) {
  const { selected, remove, add, isFull } = useCompare();
  const [searchOpen, setSearchOpen] = useState(false);
  const excludeIds = new Set(selected.map(a => a.id));
  const slots = Array.from({ length: MAX }, (_, i) => selected[i] ?? null);

  function handleSelect(a: Adventure) {
    add(a);
    setSearchOpen(false);
    toast.success(`${a.name} added to compare`);
  }

  return (
    <>
      {searchOpen && (
        <AdventureSearch
          excludeIds={excludeIds}
          onSelect={handleSelect}
          onClose={() => setSearchOpen(false)}
        />
      )}

      <div
        className="rounded-2xl p-4 mb-10"
        style={{ background: "rgba(255,81,0,0.04)", border: "1px solid rgba(255,81,0,0.12)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-3.5 h-3.5" style={{ color: "#ff5100" }} />
            <span className="text-white/60 text-xs font-semibold tracking-wide">Compare Adventures</span>
            {selected.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>
                {selected.length}/{MAX}
              </span>
            )}
          </div>
          {selected.length >= 2 && (
            <button
              onClick={onCompareClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "#ff5100", boxShadow: "0 3px 10px rgba(255,81,0,0.35)" }}
            >
              <GitCompare className="w-3 h-3" />
              Compare now
            </button>
          )}
        </div>

        {/* Slots */}
        <div className="grid grid-cols-3 gap-3">
          {slots.map((adventure, i) =>
            adventure ? (
              /* Filled slot */
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.25)", minHeight: "52px" }}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 relative">
                  <Image src={adventure.heroImage} alt={adventure.name} fill quality={60} className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[11px] font-semibold leading-tight line-clamp-1">{adventure.name}</p>
                  <p className="text-white/35 text-[10px] mt-0.5 truncate">{adventure.type}</p>
                </div>
                <button
                  onClick={() => { remove(adventure.id); toast("Removed from compare"); }}
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all hover:bg-white/15"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <X className="w-2.5 h-2.5 text-white/50" />
                </button>
              </div>
            ) : (
              /* Empty slot */
              <button
                key={i}
                onClick={() => !isFull && setSearchOpen(true)}
                disabled={isFull}
                className="rounded-xl flex items-center justify-center gap-2 transition-all hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed group"
                style={{ border: "1px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", minHeight: "52px" }}
              >
                <Search className="w-3 h-3 text-white/20 group-hover:text-[#ff5100] transition-colors" />
                <span className="text-white/25 text-[11px] group-hover:text-white/50 transition-colors">Add adventure</span>
              </button>
            )
          )}
        </div>

        {selected.length === 0 && (
          <p className="text-white/20 text-[10px] mt-3 text-center">
            Select adventures from your wishlist below, or click a slot to search
          </p>
        )}
      </div>
    </>
  );
}

// ─── Wishlist card ─────────────────────────────────────────────────────────────
function WishlistCard({ a }: { a: Adventure }) {
  const { add, remove, isSelected, isFull } = useCompare();
  const inCompare = isSelected(a.id);
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

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (inCompare) { remove(a.id); toast("Removed from compare"); }
    else if (isFull) { toast.error("Remove an adventure to add another."); }
    else { add(a); toast.success(`${a.name} added to compare`); }
  }

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: inCompare ? "1px solid rgba(255,81,0,0.4)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: inCompare ? "0 4px 24px rgba(255,81,0,0.15)" : "0 4px 20px rgba(0,0,0,0.2)",
        transition: "border-color 0.25s, box-shadow 0.25s, transform 0.3s",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/experiences/${a.slug}`} className="absolute inset-0 z-10" />
        <Image src={a.heroImage} alt={a.name} fill quality={90} className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 z-10 pointer-events-none" />

        {/* Top-left: difficulty + season */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
          <DifficultyMeter difficulty={difficulty} />
          {isSeasonActive ? (
            <span className="pointer-events-none text-[10px] font-bold px-2.5 h-5 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(16,185,129,0.25)", color: "#6ee7b7", boxShadow: "0 0 0 1px rgba(16,185,129,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />Season Active
            </span>
          ) : isSeasonUpcoming ? (
            <span className="pointer-events-none text-[10px] font-bold px-2.5 h-5 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a", boxShadow: "0 0 0 1px rgba(251,191,36,0.35)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Upcoming
            </span>
          ) : seasonLabel ? (
            <span className="pointer-events-none text-[10px] font-bold px-2.5 h-5 rounded-full inline-flex items-center" style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)", boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}>{seasonLabel}</span>
          ) : null}
        </div>

        {/* Top-right: compare + save */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button
            onClick={handleCompare}
            disabled={!inCompare && isFull}
            aria-label={inCompare ? "Remove from compare" : "Add to compare"}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={inCompare
              ? { background: "rgba(255,81,0,0.9)", color: "#fff", boxShadow: "0 0 0 1px rgba(255,81,0,0.5), 0 0 10px rgba(255,81,0,0.35)" }
              : { background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.7)", boxShadow: "0 0 0 1px rgba(255,255,255,0.1)" }
            }
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>
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
                <><span className="text-white/20 mx-1">·</span>
                <span className="font-semibold" style={{ color: "rgba(255,81,0,0.85)" }}>₹{lowestPrice.toLocaleString("en-IN")} onwards</span></>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { saved, loading } = useWishlist();
  const { selected } = useCompare();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const compareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  function scrollToCompare() {
    compareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loggedIn === null || loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen px-5 lg:px-8 py-16 lg:py-20" style={{ background: "var(--bg-base)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
                <div className="h-2.5 w-28 rounded bg-white/10 animate-pulse" />
              </div>
              <div className="h-9 w-52 rounded-xl bg-white/6 animate-pulse mb-2" />
            </div>
            <div className="h-28 rounded-2xl bg-white/3 animate-pulse mb-10" />
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
        <Footer />
      </>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────────
  if (loggedIn === false) {
    return (
      <>
        <Navbar />
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
        <Footer />
      </>
    );
  }

  // ── Logged in ────────────────────────────────────────────────────────────────
  const savedList = adventures.filter(a => saved.has(a.slug));

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
        <div className="px-5 lg:px-8 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-2">
                <Heart className="w-4 h-4 fill-[#ff5100]" style={{ color: "#ff5100" }} />
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: "rgba(255,81,0,0.7)" }}>Saved Adventures</p>
              </div>
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <h1 className="text-white text-3xl lg:text-4xl font-bold tracking-tight">Your Wishlist</h1>
                {savedList.length > 0 && (
                  <p className="text-white/40 text-sm pb-1">{savedList.length} adventure{savedList.length !== 1 ? "s" : ""} saved</p>
                )}
              </div>
            </div>

            {/* Compare tray */}
            <CompareTray onCompareClick={scrollToCompare} />

            {/* Empty state */}
            {savedList.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {savedList.map(a => <WishlistCard key={a.slug} a={a} />)}
              </div>
            )}
          </div>
        </div>

        {/* ── Compare section — inline, below wishlist ── */}
        <div ref={compareRef}>
          <CompareAdventures />
        </div>
      </main>
      <Footer />
    </>
  );
}
