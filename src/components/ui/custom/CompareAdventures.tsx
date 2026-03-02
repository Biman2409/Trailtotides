"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronDown, ArrowRight, GitCompareArrows } from "lucide-react";
import { adventures, Adventure } from "@/lib/data";
import { difficultyStyle } from "@/lib/styles";

const FIELDS: { label: string; key: keyof Adventure | "price" | "rating" }[] = [
  { label: "Region", key: "region" },
  { label: "State", key: "state" },
  { label: "Type", key: "type" },
  { label: "Difficulty", key: "difficulty" },
  { label: "Duration", key: "duration" },
  { label: "Days", key: "durationDays" },
  { label: "Altitude", key: "altitude" },
  { label: "Best Season", key: "bestSeason" },
  { label: "Group Size", key: "groupSize" },
  { label: "Starting From", key: "price" },
  { label: "Top Operator Rating", key: "rating" },
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
  return ratings.length ? Math.max(...ratings).toFixed(1) : "–";
}

function getValue(a: Adventure, key: keyof Adventure | "price" | "rating"): string {
  if (key === "price") return getPrice(a);
  if (key === "rating") return getRating(a) + " / 5";
  const val = a[key as keyof Adventure];
  return val === undefined || val === null ? "–" : String(val);
}

const MAX = 3;

export default function CompareAdventures() {
  const [selected, setSelected] = useState<Adventure[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return adventures.filter(
      (a) =>
        !selected.find((s) => s.id === a.id) &&
        (a.name.toLowerCase().includes(q) ||
          a.region.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.state.toLowerCase().includes(q))
    );
  }, [search, selected]);

  function pick(a: Adventure, slot: number) {
    const next = [...selected];
    next[slot] = a;
    setSelected(next);
    setOpenDropdown(null);
    setSearch("");
  }

  function remove(idx: number) {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  }

  // Determine which slots to show (always show up to MAX, with at least one "add" slot if < MAX)
  const slots = Array.from({ length: Math.min(selected.length + 1, MAX) });

  return (
    <section className="py-16 lg:py-20 px-6 lg:px-8 bg-[#0d1520] border-t border-white/6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
          <div className="mb-10">
            <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-3 flex items-center gap-1.5 uppercase">
              <GitCompareArrows className="w-3.5 h-3.5" />
              Side by Side
            </p>
            <h2 className="text-white text-3xl lg:text-4xl font-bold tracking-tight leading-tight uppercase">
              Compare Adventures
            </h2>
            <div className="mt-3 w-14 h-0.5 bg-[#ff5100] rounded-full" />
            <p className="mt-3 text-white/35 text-sm leading-relaxed">
              Select up to {MAX} adventures to compare them side by side
            </p>
          </div>

        {/* Selector row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {slots.map((_, slotIdx) => {
            const adventure = selected[slotIdx];
            const isOpen = openDropdown === slotIdx;

            return (
              <div key={slotIdx} className="relative">
                {adventure ? (
                  /* Filled slot */
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 group">
                    <div className="relative h-28">
                      <Image
                        src={adventure.heroImage}
                        alt={adventure.name}
                        fill
                        className="object-cover opacity-70 group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                    <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{adventure.name}</p>
                        <p className="text-white/45 text-[11px] truncate">{adventure.state}</p>
                      </div>
                      <button
                        onClick={() => remove(slotIdx)}
                        className="shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                        aria-label="Remove"
                      >
                        <X className="w-3 h-3 text-white/70" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty slot — dropdown trigger */
                  <button
                    onClick={() => {
                      setOpenDropdown(isOpen ? null : slotIdx);
                      setSearch("");
                    }}
                    className="w-full h-full min-h-[96px] rounded-xl border border-dashed border-white/20 hover:border-[#ff5100]/60 bg-white/3 hover:bg-[#ff5100]/5 flex items-center justify-center gap-2 text-white/40 hover:text-[#ff5100] text-sm font-medium transition-all duration-200"
                  >
                    <span className="text-lg leading-none">+</span>
                    Add Adventure
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                )}

                {/* Dropdown */}
                {isOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#111d2b] border border-white/12 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
                    <div className="p-2 border-b border-white/8">
                      <input
                        autoFocus
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search adventures…"
                        className="w-full bg-white/6 text-white text-sm placeholder-white/30 px-3 py-2 rounded-lg outline-none border border-transparent focus:border-[#ff5100]/40"
                      />
                    </div>
                    <ul className="max-h-56 overflow-y-auto divide-y divide-white/5">
                      {filtered.length === 0 ? (
                        <li className="px-4 py-3 text-white/35 text-sm">No adventures found</li>
                      ) : (
                        filtered.map((a) => (
                          <li key={a.id}>
                            <button
                              onClick={() => pick(a, slotIdx)}
                              className="w-full text-left px-4 py-3 hover:bg-white/6 transition-colors group/item flex items-center gap-3"
                            >
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate group-hover/item:text-[#ff5100] transition-colors">
                                  {a.name}
                                </p>
                                <p className="text-white/40 text-[11px] truncate">{a.state} · {a.type}</p>
                              </div>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison table — only show when ≥2 selected */}
        {selected.length >= 2 && (
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-white/35 text-[11px] font-semibold tracking-widest uppercase px-4 py-3 w-36">
                    Attribute
                  </th>
                  {selected.map((a) => (
                    <th key={a.id} className="text-left px-4 py-3">
                      <Link
                        href={`/explore/${a.slug}`}
                        className="text-white font-semibold hover:text-[#ff5100] transition-colors text-sm leading-tight line-clamp-2"
                      >
                        {a.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIELDS.map((field, fi) => (
                  <tr
                    key={field.key}
                    className={fi % 2 === 0 ? "bg-white/2" : "bg-transparent"}
                  >
                    <td className="px-4 py-3 text-white/40 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">
                      {field.label}
                    </td>
                    {selected.map((a) => {
                      const val = getValue(a, field.key);
                      const isDifficulty = field.key === "difficulty";
                      return (
                        <td key={a.id} className="px-4 py-3">
                          {isDifficulty ? (
                            <span
                              className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full tracking-tight text-white ${difficultyStyle[a.difficulty]}`}
                            >
                              {val}
                            </span>
                          ) : (
                            <span className="text-white/80 text-sm">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* View detail links row */}
                <tr className="border-t border-white/8">
                  <td className="px-4 py-4" />
                  {selected.map((a) => (
                    <td key={a.id} className="px-4 py-4">
                      <Link
                        href={`/explore/${a.slug}`}
                        className="inline-flex items-center gap-1.5 text-[#ff5100] text-sm font-semibold hover:gap-2.5 transition-all group/link"
                      >
                        View details
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selected.length < 2 && (
          <p className="text-center text-white/20 text-sm py-6">
            Select at least 2 adventures to see the comparison
          </p>
        )}
      </div>

      {/* Close dropdown on outside click */}
      {openDropdown !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </section>
  );
}
