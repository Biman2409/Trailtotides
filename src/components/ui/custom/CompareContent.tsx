"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, GitCompare, Heart, Plus, ChevronDown, Search, LogIn } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Adventure, adventures, getLowestPrice } from "@/lib/data";
import { useCompare, MAX } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";
import ACERadar from "@/components/ui/custom/ACERadar";
import { getACE } from "@/lib/ace";
import type { ACE } from "@/lib/ace";
import { loadProfile } from "@/lib/matchmaker";

const FIELDS: { label: string; key: keyof Adventure | "price" | "rating" | "operators" }[] = [
  { label: "Region",      key: "region" },
  { label: "State",       key: "state" },
  { label: "Type",        key: "type" },
  { label: "Difficulty",  key: "difficulty" },
  { label: "Duration",    key: "duration" },
  { label: "Days",        key: "durationDays" },
  { label: "Distance",    key: "distance" },
  { label: "Max Alt",     key: "altitude" },
  { label: "Best Season", key: "bestSeason" },
  { label: "Operators",   key: "operators" },
  { label: "From",        key: "price" },
  { label: "Rating",      key: "rating" },
];

function getPrice(a: Adventure) {
  const min = getLowestPrice(a);
  return min === null ? "–" : `₹${min.toLocaleString("en-IN")}`;
}

function getRating(a: Adventure) {
  const ratings = a.operators.map((op) => op.googleRating);
  return ratings.length ? Math.max(...ratings).toFixed(1) + " / 5" : "–";
}

function getValue(a: Adventure, key: keyof Adventure | "price" | "rating" | "operators"): string {
  if (key === "price")     return getPrice(a);
  if (key === "rating")    return getRating(a);
  if (key === "operators") return `${a.operators.length} op${a.operators.length !== 1 ? "s" : ""}`;
  const val = a[key as keyof Adventure];
  return val === undefined || val === null ? "–" : String(val);
}

function SlotPlaceholder({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="w-full h-full flex items-center gap-2 px-3 rounded-lg border border-dashed opacity-50"
      style={{ borderColor: "var(--border-subtle)" }}>
      {icon}
      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{label}</span>
    </div>
  );
}

function WishlistPicker({ onSelect }: { onSelect: (a: Adventure) => void }) {
  const { saved, loading } = useWishlist();
  const { selected } = useCompare();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const wishlistAdventures = adventures.filter(a => saved.has(a.slug) && !selected.find(s => s.id === a.id));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) return <SlotPlaceholder icon={<Heart className="w-3 h-3 text-rose-400/50" />} label="Loading…" />;

  if (wishlistAdventures.length === 0) {
    return <SlotPlaceholder icon={<Plus className="w-3 h-3" style={{ color: "var(--text-muted)" }} />} label="Add adventure" />;
  }

  return (
    <div ref={ref} className="relative h-full">
      <button onClick={() => setOpen(o => !o)} className="w-full h-full flex items-center gap-2 px-3 rounded-lg border border-dashed transition-all group"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,81,0,0.4)"; e.currentTarget.style.background = "rgba(255,81,0,0.05)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.background = "transparent"; }}>
        <Heart className="w-3 h-3 text-rose-400/60 shrink-0" />
        <span className="text-[11px] truncate transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-tertiary)"}
          style={{ color: "var(--text-tertiary)" }}>From wishlist</span>
        <ChevronDown className={`w-3 h-3 ml-auto transition-transform shrink-0 ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 rounded-xl overflow-hidden shadow-2xl min-w-[220px]"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", maxHeight: 240, overflowY: "auto" }}>
          {wishlistAdventures.map(a => (
            <button key={a.slug} onClick={() => { onSelect(a); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0">
                <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{a.name}</p>
                <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>{a.type}{a.state ? ` · ${a.state}` : ""}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchPicker({ onSelect }: { onSelect: (a: Adventure) => void }) {
  const { selected } = useCompare();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = adventures
    .filter(a => !selected.find(s => s.id === a.id))
    .filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || (a.state ?? "").toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery(""); }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative h-full">
      {!open ? (
        <button onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="w-full h-full flex items-center gap-2 px-3 rounded-lg border border-dashed transition-all group"
          style={{ borderColor: "var(--border-subtle)" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,81,0,0.4)"; e.currentTarget.style.background = "rgba(255,81,0,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.background = "transparent"; }}>
          <Plus className="w-3 h-3 text-[#ff5100]/50 shrink-0" />
          <span className="text-[11px] transition-colors" style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-tertiary)"}>Add adventure</span>
        </button>
      ) : (
        <div className="h-full flex items-center gap-2 px-3 rounded-lg border" style={{ background: "var(--bg-card)", borderColor: "rgba(255,81,0,0.3)" }}>
          <Search className="w-3 h-3 shrink-0" style={{ color: "var(--text-tertiary)" }} />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search…" className="flex-1 bg-transparent text-xs outline-none min-w-0"
            style={{ color: "var(--text-primary)" }} />
          <button onClick={() => { setOpen(false); setQuery(""); }}><X className="w-3 h-3 transition-colors" style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"} /></button>
        </div>
      )}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 z-50 rounded-xl overflow-hidden shadow-2xl min-w-[220px]"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", maxHeight: 240, overflowY: "auto" }}>
          {results.map(a => (
            <button key={a.slug} onClick={() => { onSelect(a); setOpen(false); setQuery(""); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0">
                <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{a.name}</p>
                <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>{a.type}{a.state ? ` · ${a.state}` : ""}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// The guts of the comparison UI — slot picker row + side-by-side table.
// Shared between the in-page CompareAdventures section and the global CompareDrawer.
export default function CompareContent() {
  const { selected, remove, add } = useCompare();
  const [userAce, setUserAce] = useState<ACE | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const p = loadProfile();
    if (p) setUserAce(p.ace);
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div>
      {!selected.length && loggedIn === false && (
        <button
          onClick={() => router.push("/auth/login")}
          className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-80"
          style={{ background: "#ff5100" }}
        >
          <LogIn className="w-3 h-3" />
          Log in to compare from your wishlist
        </button>
      )}

      {/* Slot row */}
      <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `repeat(${MAX}, 1fr)` }}>
        {selected.map((adventure) => (
          <div key={adventure.id} className="relative rounded-lg overflow-hidden h-14 border" style={{ borderColor: "rgba(255,81,0,0.25)", background: "rgba(255,81,0,0.04)" }}>
            <Image src={adventure.heroImage} alt={adventure.name} fill className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="relative h-full flex items-center gap-2 px-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-white text-[11px] font-semibold truncate leading-tight">{adventure.name}</p>
                <p className="text-white/40 text-[9px] truncate">{adventure.type}{adventure.state ? ` · ${adventure.state}` : ""}</p>
              </div>
              <button onClick={() => remove(adventure.id)}
                className="shrink-0 w-5 h-5 rounded-full bg-black/40 hover:bg-red-500/40 flex items-center justify-center transition-colors">
                <X className="w-2.5 h-2.5 text-white/60" />
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: MAX - selected.length }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14">
            {loggedIn === true
              ? <WishlistPicker onSelect={(a) => add(a)} />
              : <SearchPicker onSelect={(a) => add(a)} />
            }
          </div>
        ))}
      </div>

      {/* Hint when nothing selected */}
      {selected.length === 0 && (
        <p className="text-[11px] text-center py-2" style={{ color: "var(--text-muted)" }}>
          Tap <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <GitCompare className="w-2.5 h-2.5" />Compare
          </span> on any card to start.
        </p>
      )}

      {/* Comparison table */}
      {selected.length >= 2 && (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-subtle)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}>
                <th className="text-left text-[9px] font-bold tracking-widest uppercase px-3 py-2 w-24" style={{ color: "var(--text-tertiary)" }}>Attribute</th>
                {selected.map((a) => (
                  <th key={a.id} className="text-left px-3 py-2">
                    <Link href={`/experiences/${a.slug}`}
                      className="text-xs font-semibold hover:text-[#ff5100] transition-colors line-clamp-1 leading-snug"
                      style={{ color: "var(--text-primary)" }}>
                      {a.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((field, fi) => (
                <tr key={field.key}
                  style={fi % 2 === 0 ? { background: "var(--bg-surface-2)" } : undefined}>
                  <td className="px-3 py-1.5 text-[9px] font-semibold tracking-wide uppercase whitespace-nowrap" style={{ color: "var(--text-tertiary)" }}>{field.label}</td>
                  {selected.map((a) => (
                    <td key={a.id} className="px-3 py-1.5">
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{getValue(a, field.key)}</span>
                    </td>
                  ))}
                </tr>
              ))}

              {/* ACE row */}
              <tr className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <td colSpan={selected.length + 1} className="px-3 pt-4 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-3.5 rounded-full" style={{ background: "#ff5100" }} />
                    <p className="text-[9px] uppercase tracking-widest font-black" style={{ color: "var(--text-tertiary)" }}>ACE<sup>™</sup> Profile</p>
                  </div>
                </td>
              </tr>
              <tr style={{ background: "var(--bg-surface-2)" }}>
                <td className="px-3 pb-4 align-top pt-2">
                  {userAce ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                        <div className="p-2"><ACERadar ace={userAce} size={140} showLabels /></div>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>You</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl py-6 px-3 text-center"
                      style={{ border: "1px dashed var(--border-subtle)" }}>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>No ACE<sup>™</sup> profile</p>
                      <a href="/ace" className="text-[#ff5100]/60 text-[10px] hover:text-[#ff5100] transition-colors underline underline-offset-2">Take it →</a>
                    </div>
                  )}
                </td>
                {selected.map((a) => (
                  <td key={a.id} className="px-3 pb-4 align-top pt-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                        <div className="p-2"><ACERadar ace={getACE(a)} size={140} showLabels /></div>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[130px]" style={{ color: "var(--text-tertiary)" }}>{a.name}</p>
                    </div>
                  </td>
                ))}
              </tr>

              {/* View links */}
              <tr className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <td className="px-3 py-2" />
                {selected.map((a) => (
                  <td key={a.id} className="px-3 py-2">
                    <Link href={`/experiences/${a.slug}`}
                      className="inline-flex items-center gap-1 text-[#ff5100] text-[11px] font-semibold hover:gap-1.5 transition-all group/l">
                      View <ArrowRight className="w-3 h-3 group-hover/l:translate-x-0.5 transition-transform" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
