"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronDown, X, ShieldCheck, ShieldAlert } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

export type OperatorCardData = {
  id: string;
  company_name: string;
  website: string | null;
  email: string;
  logo_url?: string | null;
  adventureSlugs: string[];
  prices: Record<string, string>;
  verified: boolean;
  adventureDetails: {
    slug: string;
    name: string;
    type: string;
    state: string;
    heroImage: string;
  }[];
};

type Props = {
  cards: OperatorCardData[];
  allTypes: string[];
  allStates: string[];
};

export default function OperatorsClient({ cards, allTypes, allStates }: Props) {
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [typeOpen, setTypeOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeOpen(false);
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) setStateOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = useMemo(() => {
    return cards.filter((op) => {
      if (filterVerified === "verified" && !op.verified) return false;
      if (filterVerified === "unverified" && op.verified) return false;
      if (filterType !== "all") {
        if (!op.adventureDetails.some((a) => a.type === filterType)) return false;
      }
      if (filterState !== "all") {
        if (!op.adventureDetails.some((a) => a.state.toLowerCase().includes(filterState.toLowerCase()))) return false;
      }
      return true;
    });
  }, [cards, filterVerified, filterType, filterState]);

  const activeFilterCount =
    (filterVerified !== "all" ? 1 : 0) +
    (filterType !== "all" ? 1 : 0) +
    (filterState !== "all" ? 1 : 0);

  function clearAll() {
    setFilterVerified("all");
    setFilterType("all");
    setFilterState("all");
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto">

        {/* ── Filter Bar ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">

          {/* Verified toggle */}
          <div
            className="flex items-center rounded-xl overflow-hidden shrink-0"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {(["all", "verified", "unverified"] as const).map((v, i, arr) => {
              const active = filterVerified === v;
              return (
                <button
                  key={v}
                  onClick={() => setFilterVerified(v)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-medium transition-all duration-150"
                  style={{
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    color: active
                      ? v === "verified" ? "#22c55e"
                        : v === "unverified" ? "rgba(255,255,255,0.55)"
                        : "rgba(255,255,255,0.75)"
                      : "rgba(255,255,255,0.25)",
                    borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  {v === "verified" && <ShieldCheck className="w-3 h-3" />}
                  {v === "unverified" && <ShieldAlert className="w-3 h-3" />}
                  {v === "all" ? "All" : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Adventure type dropdown */}
          <div className="relative" ref={typeRef}>
            <button
              onClick={() => { setTypeOpen((p) => !p); setStateOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: filterType !== "all" ? "rgba(255,81,0,0.1)" : "transparent",
                color: filterType !== "all" ? "#ff6b2b" : "rgba(255,255,255,0.35)",
              }}
            >
              {filterType === "all" ? "Type" : filterType}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {typeOpen && (
              <div
                className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-30 rounded-xl overflow-hidden py-1 min-w-[170px] max-h-56 overflow-y-auto"
                style={{
                  background: "rgba(6,9,18,0.97)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                }}
              >
                <button
                  onClick={() => { setFilterType("all"); setTypeOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/[0.05]"
                  style={{ color: filterType === "all" ? "white" : "rgba(255,255,255,0.35)" }}
                >
                  All types
                </button>
                {allTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setFilterType(t); setTypeOpen(false); }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors hover:bg-white/[0.05]"
                    style={{ color: filterType === t ? "#ff6b2b" : "rgba(255,255,255,0.5)" }}
                  >
                    <span className="opacity-60 shrink-0">{ADVENTURE_TYPE_ICONS[t]?.(10)}</span>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* State dropdown */}
          <div className="relative" ref={stateRef}>
            <button
              onClick={() => { setStateOpen((p) => !p); setTypeOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: filterState !== "all" ? "rgba(255,81,0,0.1)" : "transparent",
                color: filterState !== "all" ? "#ff6b2b" : "rgba(255,255,255,0.35)",
              }}
            >
              {filterState === "all" ? "Location" : filterState}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {stateOpen && (
              <div
                className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-30 rounded-xl overflow-hidden py-1 min-w-[180px] max-h-56 overflow-y-auto"
                style={{
                  background: "rgba(6,9,18,0.97)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                }}
              >
                <button
                  onClick={() => { setFilterState("all"); setStateOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/[0.05]"
                  style={{ color: filterState === "all" ? "white" : "rgba(255,255,255,0.35)" }}
                >
                  All locations
                </button>
                {allStates.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilterState(s); setStateOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/[0.05]"
                    style={{ color: filterState === s ? "#ff6b2b" : "rgba(255,255,255,0.5)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs transition-colors hover:bg-white/[0.05]"
              style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}

          {/* Count */}
          <span className="ml-auto text-xs text-white/20 whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? "operator" : "operators"}
          </span>
        </div>

        {/* ── Grid ───────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 sm:py-32">
            <p className="text-white/20 text-sm">No operators match these filters.</p>
            <button
              onClick={clearAll}
              className="mt-3 text-xs text-[#ff5100] underline underline-offset-4 hover:text-[#ff7d47] transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {filtered.map((op) => {
              const initial = op.company_name.charAt(0).toUpperCase();
              const isStatic = op.id.startsWith("static-");

              return (
                <div
                  key={op.id}
                  className="group flex flex-col gap-4 sm:gap-5 p-5 sm:p-6 transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  {/* ── Header ── */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-sm font-black"
                        style={
                          op.logo_url
                            ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }
                            : { background: "rgba(255,81,0,0.1)", color: "#ff6b2b" }
                        }
                      >
                        {op.logo_url ? (
                          <img
                            src={op.logo_url}
                            alt={op.company_name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-white/85 font-semibold text-sm leading-tight truncate">
                          {op.company_name}
                        </h2>
                        <div className="flex items-center gap-1 mt-0.5">
                          {op.verified ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span className="text-[10px] font-semibold text-emerald-400">Verified</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3 text-white/20" />
                              <span className="text-[10px] text-white/20">Unverified</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {op.website && (
                      <a
                        href={op.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-1.5 -m-1.5 rounded-lg text-white/15 hover:text-[#ff5100] hover:bg-white/[0.05] transition-all"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* ── Adventures ── */}
                  {op.adventureDetails.length > 0 ? (
                    <div className="flex-1 flex flex-col gap-3">
                      <p className="text-white/15 text-[10px] uppercase tracking-[0.16em] font-semibold">
                        {op.adventureDetails.length} {op.adventureDetails.length === 1 ? "adventure" : "adventures"}
                      </p>
                      <div className="space-y-1.5">
                        {op.adventureDetails.slice(0, 5).map((adv) => (
                          <Link
                            key={adv.slug}
                            href={`/experiences/${adv.slug}`}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-white/[0.04] group/row"
                            style={{ border: "1px solid rgba(255,255,255,0.04)" }}
                          >
                            <div className="relative w-10 h-10 rounded-lg shrink-0 overflow-hidden ring-1 ring-white/5">
                              <Image
                                src={adv.heroImage}
                                alt={adv.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/65 text-xs font-medium truncate group-hover/row:text-white/90 transition-colors leading-snug">
                                {adv.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                                <span className="inline-flex items-center gap-1 text-[10px] text-white/25">
                                  {ADVENTURE_TYPE_ICONS[adv.type]?.(9)}
                                  {adv.type}
                                </span>
                                <span className="w-px h-2.5 bg-white/8" />
                                <span className="text-[10px] text-white/20">{adv.state}</span>
                                {op.prices[adv.slug] && (
                                  <>
                                    <span className="w-px h-2.5 bg-white/8" />
                                    <span className="text-[10px] font-semibold text-emerald-400/90">
                                      {op.prices[adv.slug]} onwards
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                        {op.adventureDetails.length > 5 && (
                          <p className="text-white/15 text-[10px] pt-0.5 pl-1">
                            +{op.adventureDetails.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/15 text-xs flex-1 italic">Listings under review.</p>
                  )}

                  {/* ── Footer ── */}
                  {!isStatic && op.email && (
                    <p
                      className="text-white/12 text-[10px] pt-3 truncate"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {op.email}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}