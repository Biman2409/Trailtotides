"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, GitCompareArrows, LogIn, GitCompare, Heart, Plus, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Adventure, adventures } from "@/lib/data";
import { useCompare, MAX } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";
import ACERadar from "@/components/ui/custom/ACERadar";
import { getACE } from "@/lib/ace";
import type { ACE } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";

const FIELDS: { label: string; key: keyof Adventure | "price" | "rating" | "operators" }[] = [
  { label: "Region",          key: "region" },
  { label: "Base Camp",       key: "baseCamp" },
  { label: "State",           key: "state" },
  { label: "Type",            key: "type" },
  { label: "Difficulty",      key: "difficulty" },
    { label: "Duration",        key: "duration" },
    { label: "Days",            key: "durationDays" },
    { label: "Distance",        key: "distance" },
    { label: "Max Alt",         key: "altitude" },
    { label: "Best Season",     key: "bestSeason" },

  { label: "Group Size",      key: "groupSize" },
  { label: "Operators",       key: "operators" },
  { label: "Starting From",   key: "price" },
  { label: "Top Rating",      key: "rating" },
];

function getPrice(a: Adventure) {
  const prices = a.operators.map((op) => {
    const match = op.priceFrom.replace(/[₹,]/g, "").match(/\d+/);
    return match ? parseInt(match[0]) : Infinity;
  });
  const min = Math.min(...prices);
  return min === Infinity ? "–" : `₹${min.toLocaleString("en-IN")}`;
}

function getRating(a: Adventure) {
  const ratings = a.operators.map((op) => op.rating);
  return ratings.length ? Math.max(...ratings).toFixed(1) + " / 5" : "–";
}

function getValue(a: Adventure, key: keyof Adventure | "price" | "rating" | "operators"): string {
  if (key === "price")     return getPrice(a);
  if (key === "rating")    return getRating(a);
  if (key === "operators") return `${a.operators.length} operator${a.operators.length !== 1 ? "s" : ""}`;
  const val = a[key as keyof Adventure];
  return val === undefined || val === null ? "–" : String(val);
}

function WishlistPicker({ onSelect }: { onSelect: (a: Adventure) => void }) {
  const { saved, loading } = useWishlist();
  const { selected, isFull } = useCompare();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const wishlistAdventures = adventures.filter(
    a => saved.has(a.slug) && !selected.find(s => s.id === a.id)
  );

  // Don't render until wishlist is loaded
  if (loading) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/2 flex items-center justify-center min-h-[112px] animate-pulse">
        <span className="text-white/15 text-xs">Loading wishlist…</span>
      </div>
    );
  }

  if (isFull) return null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (wishlistAdventures.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/2 flex flex-col items-center justify-center min-h-[112px] gap-2 text-white/25 text-xs px-3 text-center">
        <Plus className="w-4 h-4 opacity-40" />
        <span>Add from cards above</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full rounded-xl border border-dashed border-white/20 bg-white/2 hover:border-[#ff5100]/40 hover:bg-[#ff5100]/5 flex flex-col items-center justify-center min-h-[88px] gap-1.5 transition-all group"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}>
          <Heart className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <span className="text-white/40 text-xs font-medium group-hover:text-white/60 transition-colors">
          Add from Wishlist
        </span>
        <ChevronDown className={`w-3 h-3 text-white/25 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 left-0 right-0 z-50 rounded-xl overflow-hidden shadow-2xl"
          style={{ background: "#0d1520", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "240px", overflowY: "auto" }}
        >
          {wishlistAdventures.map(a => (
            <button
              key={a.slug}
              onClick={() => { onSelect(a); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{a.name}</p>
                <p className="text-white/35 text-[10px] truncate">{a.state}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompareAdventures() {
  const { selected, remove, add } = useCompare();
  const [userAce, setUserAce] = useState<ACE | null>(null);
  const [userLabel, setUserLabel] = useState<string>("Your Body");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setUserAce(p.ace);
      const total = Object.values(p.ace).reduce((a, b) => a + b, 0);
      const rank = total >= 40 ? "Apex" : total >= 32 ? "Vanguard" : total >= 24 ? "Trailblazer" : total >= 16 ? "Navigator" : total >= 8 ? "Pathfinder" : "Uncharted";
      setUserLabel(rank);
    }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <section id="compare-section" className="py-10 px-5 lg:px-8 bg-[#0d1520] border-t border-white/6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-1.5">Side by Side</p>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-white text-xl font-semibold tracking-tight">Compare Adventures</h2>
            <p className="text-white/30 text-xs hidden sm:block">Select up to {MAX} adventures</p>
          </div>
        </div>

        {/* Not logged in, nothing selected — CTA */}
        {loggedIn === false && selected.length === 0 && (
          <div
            className="rounded-xl p-4 flex items-center gap-4 mb-5"
            style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.12)" }}
          >
            <div className="flex-1">
              <p className="text-white/60 text-xs leading-relaxed">Log in to compare adventures side by side — stats, pricing, ACE profiles and more.</p>
            </div>
            <button
              onClick={() => router.push("/auth/login")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white shrink-0 transition-all hover:-translate-y-0.5"
              style={{ background: "#ff5100" }}
            >
              <LogIn className="w-3.5 h-3.5" />
              Log in
            </button>
          </div>
        )}

        {/* Selected slots grid */}
        {(selected.length > 0 || loggedIn === true) && (
          selected.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 mb-5">
              {selected.map((adventure) => (
                <div
                  key={adventure.id}
                  className="relative rounded-xl overflow-hidden border border-[#ff5100]/30 bg-[#ff5100]/5"
                >
                  <div className="relative h-20">
                    <Image src={adventure.heroImage} alt={adventure.name} fill className="object-cover opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                  <div className="px-2.5 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{adventure.name}</p>
                      <p className="text-white/40 text-[10px] truncate">{adventure.state}</p>
                    </div>
                    <button onClick={() => remove(adventure.id)} className="shrink-0 w-5 h-5 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors" aria-label="Remove">
                      <X className="w-2.5 h-2.5 text-white/70" />
                    </button>
                  </div>
                </div>
              ))}
              {Array.from({ length: MAX - selected.length }).map((_, i) => (
                <div key={`empty-${i}`}>
                  {loggedIn === true ? (
                    <WishlistPicker onSelect={(a) => add(a)} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center min-h-[88px] gap-1.5 text-white/20 text-xs">
                      <Plus className="w-3.5 h-3.5 opacity-40" />
                      <span>Add from cards above</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 flex items-center justify-center gap-2 h-16 mb-5 px-4">
              <span className="text-white/25 text-xs">Tap</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold" style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <GitCompare className="w-2.5 h-2.5" />Compare
              </span>
              <span className="text-white/25 text-xs">on any card to start</span>
            </div>
          )
        )}

        {/* Comparison table */}
        {selected.length >= 2 && (
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-white/30 text-[10px] font-bold tracking-widest uppercase px-3 py-2.5 w-32">Attribute</th>
                  {selected.map((a) => (
                    <th key={a.id} className="text-left px-3 py-2.5">
                      <Link href={`/experiences/${a.slug}`} className="text-white text-xs font-semibold hover:text-[#ff5100] transition-colors line-clamp-2 leading-snug">
                        {a.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIELDS.map((field, fi) => (
                  <tr key={field.key} className={fi % 2 === 0 ? "bg-white/[0.02]" : ""}>
                    <td className="px-3 py-2 text-white/35 text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap">{field.label}</td>
                    {selected.map((a) => (
                      <td key={a.id} className="px-3 py-2">
                        <span className="text-white/70 text-xs">{getValue(a, field.key)}</span>
                      </td>
                    ))}
                  </tr>
                ))}

                {/* ACE label row */}
                <tr className="border-t border-white/8">
                  <td colSpan={selected.length + 1} className="px-3 pt-3 pb-1">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/25">ACE Profile</p>
                  </td>
                </tr>

                {/* ACE Radar row */}
                <tr className="bg-white/[0.01]">
                  <td className="px-3 pb-3 align-top">
                    {userAce ? (
                      <div className="inline-flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 75%)" }}>
                        <div className="p-1.5"><ACERadar ace={userAce} size={130} showLabels /></div>
                      </div>
                    ) : (
                      <p className="text-white/20 text-xs">No profile yet</p>
                    )}
                  </td>
                  {selected.map((a) => (
                    <td key={a.id} className="px-3 pb-3 align-top">
                      <div className="rounded-xl p-1.5 inline-block" style={{ background: "radial-gradient(ellipse at center, rgba(255,81,0,0.06) 0%, transparent 75%)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <ACERadar ace={getACE(a)} size={130} showLabels />
                      </div>
                    </td>
                  ))}
                </tr>

                {/* View links row */}
                <tr className="border-t border-white/8">
                  <td className="px-3 py-3" />
                  {selected.map((a) => (
                    <td key={a.id} className="px-3 py-3">
                      <Link href={`/experiences/${a.slug}`} className="inline-flex items-center gap-1 text-[#ff5100] text-xs font-semibold hover:gap-2 transition-all group/link">
                        View details <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </section>
  );
}
