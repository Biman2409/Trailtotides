"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronDown, X, ShieldCheck, ShieldAlert } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import FadeInSection from "@/components/ui/custom/FadeInSection";

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

type FilterOpt = "all" | "verified" | "unverified";

export default function OperatorsClient({ cards, allTypes, allStates }: Props) {
  const [filterVerified, setFilterVerified] = useState<FilterOpt>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [typeOpen, setTypeOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);

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

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">

          {/* Verified toggle */}
          <div
            className="flex items-center rounded-xl overflow-hidden shrink-0"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            {(["all", "verified", "unverified"] as FilterOpt[]).map((v, i, arr) => {
              const active = filterVerified === v;
              const textColor = active
                ? v === "verified" ? "#22c55e"
                  : v === "unverified" ? "var(--text-secondary)"
                  : "var(--text-primary)"
                : "var(--text-tertiary)";
              return (
                <button
                  key={v}
                  onClick={() => setFilterVerified(v)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-medium transition-all duration-150"
                  style={{
                    background: active ? "var(--bg-card)" : "transparent",
                    color: textColor,
                    borderRight: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
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
                border: "1px solid var(--border-subtle)",
                background: filterType !== "all" ? "rgba(255,81,0,0.1)" : "transparent",
                color: filterType !== "all" ? "#ff6b2b" : "var(--text-tertiary)",
              }}
            >
              {filterType === "all" ? "Type" : filterType}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {typeOpen && (
              <div
                className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-30 rounded-xl overflow-hidden py-1 min-w-[170px] max-h-56 overflow-y-auto"
                style={{
                  background: "var(--bg-surface)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                }}
              >
                <button
                  onClick={() => { setFilterType("all"); setTypeOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                  style={{ color: filterType === "all" ? "var(--text-primary)" : "var(--text-tertiary)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  All types
                </button>
                {allTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setFilterType(t); setTypeOpen(false); }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
                    style={{ color: filterType === t ? "#ff6b2b" : "var(--text-secondary)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
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
                border: "1px solid var(--border-subtle)",
                background: filterState !== "all" ? "rgba(255,81,0,0.1)" : "transparent",
                color: filterState !== "all" ? "#ff6b2b" : "var(--text-tertiary)",
              }}
            >
              {filterState === "all" ? "Location" : filterState}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {stateOpen && (
              <div
                className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-30 rounded-xl overflow-hidden py-1 min-w-[180px] max-h-56 overflow-y-auto"
                style={{
                  background: "var(--bg-surface)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                }}
              >
                <button
                  onClick={() => { setFilterState("all"); setStateOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                  style={{ color: filterState === "all" ? "var(--text-primary)" : "var(--text-tertiary)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  All locations
                </button>
                {allStates.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilterState(s); setStateOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                    style={{ color: filterState === s ? "#ff6b2b" : "var(--text-secondary)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
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
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs transition-colors"
              style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}

          {/* Count */}
          <span className="ml-auto text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
            {filtered.length} {filtered.length === 1 ? "operator" : "operators"}
          </span>
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 sm:py-32">
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No operators match these filters.</p>
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
              background: "var(--border-subtle)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {filtered.map((op, i) => {
              const initial = op.company_name.charAt(0).toUpperCase();
              const isStatic = op.id.startsWith("static-");

              return (
                <FadeInSection key={op.id} delay={i * 60}>
                <div
                  className="group flex flex-col gap-4 sm:gap-5 p-5 sm:p-6 transition-all duration-200"
                  style={{ background: "var(--bg-card)" }}
                >
                  {/* ── Header ── */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-sm font-black"
                        style={
                          op.logo_url
                            ? { background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }
                            : { background: "rgba(255,81,0,0.1)", color: "#ff6b2b" }
                        }
                      >
                        {op.logo_url ? (
                          <Image
                            src={op.logo_url}
                            alt={op.company_name}
                            fill
                            sizes="36px"
                            className="object-contain p-0.5"
                          />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-semibold text-sm leading-tight truncate" style={{ color: "var(--text-primary)" }}>
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
                              <ShieldAlert className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Unverified</span>
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
                        className="shrink-0 p-1.5 -m-1.5 rounded-lg transition-all"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#ff5100"; e.currentTarget.style.background = "var(--bg-card)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* ── Adventures ── */}
                  {op.adventureDetails.length > 0 ? (
                    <div className="flex-1 flex flex-col gap-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: "var(--text-muted)" }}>
                        {op.adventureDetails.length} {op.adventureDetails.length === 1 ? "adventure" : "adventures"}
                      </p>
                      <div className="space-y-1.5">
                        {op.adventureDetails.slice(0, 5).map((adv) => (
                          <Link
                            key={adv.slug}
                            href={`/experiences/${adv.slug}`}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 group/row"
                            style={{ border: "1px solid var(--border-subtle)" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card-hover)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <div className="relative w-10 h-10 rounded-lg shrink-0 overflow-hidden" style={{ boxShadow: "0 0 0 1px var(--border-subtle)" }}>
                              <Image
                                src={adv.heroImage}
                                alt={adv.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate transition-colors leading-snug" style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                                {adv.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                                <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                                  {ADVENTURE_TYPE_ICONS[adv.type]?.(9)}
                                  {adv.type}
                                </span>
                                <span className="w-px h-2.5" style={{ background: "var(--border-subtle)" }} />
                                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{adv.state}</span>
                                {op.prices[adv.slug] && (
                                  <>
                                    <span className="w-px h-2.5" style={{ background: "var(--border-subtle)" }} />
                                    <span className="text-[10px] font-semibold" style={{ color: "rgba(52,211,153,0.9)" }}>
                                      {op.prices[adv.slug]} onwards
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                        {op.adventureDetails.length > 5 && (
                          <p className="text-[10px] pt-0.5 pl-1" style={{ color: "var(--text-muted)" }}>
                            +{op.adventureDetails.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs flex-1 italic" style={{ color: "var(--text-muted)" }}>Listings under review.</p>
                  )}

                  {/* ── Footer ── */}
                  {!isStatic && op.email && (
                    <p
                      className="text-[10px] pt-3 truncate"
                      style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}
                    >
                      {op.email}
                    </p>
                  )}
                </div>
                </FadeInSection>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}