"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare, MAX } from "@/contexts/CompareContext";
import { adventures } from "@/lib/data";
import type { Adventure, Month } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Heart, BadgeCheck, LogIn, GitCompare, Search, X, Plus, ChevronRight, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Pill from "@/components/ui/custom/Pill";
import DifficultyMeter from "@/components/ui/custom/DifficultyMeter";
import SaveButton from "@/components/ui/custom/SaveButton";
import { getACE, computeDifficulty } from "@/lib/ace";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

const MONTHS: Month[] = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatSeasonShort(bestMonths: Month[]): string {
  if (!bestMonths?.length) return "";
  if (bestMonths.length === 1) return bestMonths[0];
  return `${bestMonths[0]}–${bestMonths[bestMonths.length - 1]}`;
}

// ── Mini card used inside compare slots ────────────────────────────────────
function CompareSlotFilled({ adventure, onRemove }: { adventure: Adventure; onRemove: () => void }) {
  return (
    <div className="relative rounded-xl overflow-hidden flex-1 min-w-0" style={{ border: "1px solid rgba(255,81,0,0.3)", background: "rgba(255,81,0,0.06)" }}>
      <div className="relative aspect-video w-full overflow-hidden">
        <Image src={adventure.heroImage} alt={adventure.name} fill quality={80} className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <X className="w-3 h-3 text-white/70" />
        </button>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-white text-xs font-semibold leading-tight line-clamp-1">{adventure.name}</p>
        <p className="text-white/40 text-[10px] mt-0.5">{adventure.durationDays}</p>
      </div>
    </div>
  );
}

function CompareSlotEmpty({ onSearch }: { onSearch: () => void }) {
  return (
    <button
      onClick={onSearch}
      className="flex-1 min-w-0 rounded-xl flex flex-col items-center justify-center gap-1.5 py-6 transition-all hover:border-white/20"
      style={{ border: "1px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
    >
      <Plus className="w-5 h-5 text-white/20" />
      <span className="text-white/30 text-[11px]">Add adventure</span>
    </button>
  );
}

// ── Search dropdown ─────────────────────────────────────────────────────────
function AdventureSearchDropdown({
  query,
  onSelect,
  excludeIds,
}: {
  query: string;
  onSelect: (a: Adventure) => void;
  excludeIds: Set<string>;
}) {
  const results = adventures
    .filter(a => !excludeIds.has(a.id) && a.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  if (!query || results.length === 0) return null;

  return (
    <div
      className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-50 shadow-2xl"
      style={{ background: "rgba(18,18,24,0.98)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {results.map(a => {
        const diff = computeDifficulty(getACE(a));
        return (
          <button
            key={a.id}
            onClick={() => onSelect(a)}
            className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/5 text-left"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
              <Image src={a.heroImage} alt={a.name} fill quality={60} className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold leading-tight truncate">{a.name}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{a.state} · {a.durationDays}</p>
            </div>
            <DifficultyMeter difficulty={diff} />
          </button>
        );
      })}
    </div>
  );
}

// ── Compare panel ───────────────────────────────────────────────────────────
function ComparePanel() {
  const { selected, remove, clear, add, isFull, isSelected } = useCompare();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const excludeIds = new Set(selected.map(a => a.id));
  const emptySlots = MAX - selected.length;

  function handleSelect(a: Adventure) {
    if (isFull) { toast.error("Remove an adventure first."); return; }
    add(a);
    setSearchQuery("");
    setSearchOpen(false);
    toast.success(`${a.name} added to compare`);
  }

  function handleCompare() {
    if (selected.length < 2) { toast.error("Select at least 2 adventures to compare."); return; }
    router.push("/explore#compare-section");
  }

  if (selected.length === 0) {
    // Collapsed placeholder
    return (
      <div
        className="rounded-2xl p-5 mb-10 flex items-center justify-between gap-4"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.15)" }}>
            <GitCompare className="w-4 h-4" style={{ color: "#ff5100" }} />
          </div>
          <div>
            <p className="text-white/70 text-sm font-semibold">Compare Adventures</p>
            <p className="text-white/30 text-xs mt-0.5">Select up to {MAX} adventures from your wishlist or search below</p>
          </div>
        </div>
        <div ref={searchRef} className="relative w-56 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search adventures…"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl text-white placeholder-white/25 outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
          {searchOpen && (
            <AdventureSearchDropdown query={searchQuery} onSelect={handleSelect} excludeIds={excludeIds} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 mb-10"
      style={{ background: "rgba(255,81,0,0.04)", border: "1px solid rgba(255,81,0,0.15)" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <GitCompare className="w-4 h-4" style={{ color: "#ff5100" }} />
          <span className="text-white/80 text-sm font-semibold">Compare</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>
            {selected.length}/{MAX}
          </span>
        </div>
        <button onClick={clear} className="flex items-center gap-1.5 text-white/30 text-xs hover:text-white/50 transition-colors">
          <Trash2 className="w-3 h-3" /> Clear all
        </button>
      </div>

      {/* Slots row */}
      <div className="flex gap-3 mb-4">
        {selected.map(a => (
          <CompareSlotFilled key={a.id} adventure={a} onRemove={() => { remove(a.id); toast("Removed from compare"); }} />
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <CompareSlotEmpty key={i} onSearch={() => setSearchOpen(true)} />
        ))}
      </div>

      {/* Search + CTA row */}
      <div className="flex items-center gap-3">
        <div ref={searchRef} className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder={isFull ? "Remove one to add another…" : "Search any adventure to add…"}
              disabled={isFull}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl text-white placeholder-white/25 outline-none transition-all disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
          {searchOpen && (
            <AdventureSearchDropdown query={searchQuery} onSelect={handleSelect} excludeIds={excludeIds} />
          )}
        </div>
        <button
          onClick={handleCompare}
          disabled={selected.length < 2}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 shrink-0"
          style={{ background: selected.length >= 2 ? "#ff5100" : "rgba(255,255,255,0.08)", boxShadow: selected.length >= 2 ? "0 4px 14px rgba(255,81,0,0.3)" : "none" }}
        >
          <GitCompare className="w-3.5 h-3.5" />
          Compare now
          {selected.length >= 2 && <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ── Wishlist card with compare toggle ───────────────────────────────────────
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
        boxShadow: inCompare ? "0 4px 20px rgba(255,81,0,0.15)" : "0 4px 20px rgba(0,0,0,0.2)",
        transition: "all 0.3s ease",
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
                <><span className="text-white/20 mx-1">·</span><span className="font-semibold" style={{ color: "rgba(255,81,0,0.85)" }}>₹{lowestPrice.toLocaleString("en-IN")} onwards</span></>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
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

  // ── Loading ────────────────────────────────────────────────────────────────
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
            <div className="h-20 rounded-2xl bg-white/3 animate-pulse mb-10" />
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

  // ── Not logged in ──────────────────────────────────────────────────────────
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

  // ── Logged in ──────────────────────────────────────────────────────────────
  const savedList = adventures.filter(a => saved.has(a.slug));

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-5 lg:px-8 py-16 lg:py-20" style={{ background: "var(--bg-base)" }}>
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

          {/* Compare panel — always visible */}
          <ComparePanel />

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

          {/* Wishlist cards grid */}
          {savedList.length > 0 && (
            <>
              <p className="text-white/30 text-[11px] font-medium tracking-widest uppercase mb-4">
                Your saved adventures — tap <GitCompare className="w-3 h-3 inline mb-0.5" /> to add to compare
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {savedList.map(a => <WishlistCard key={a.slug} a={a} />)}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
