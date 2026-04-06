"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShieldCheck, ShieldAlert, ChevronDown, X } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

export type OperatorCardData = {
  id: string;
  company_name: string;
  website: string | null;
  email: string;
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

const VERIFIED_COLOR = "#22c55e"; // green-500
const UNVERIFIED_COLOR = "rgba(255,255,255,0.25)";

export default function OperatorsClient({ cards, allTypes, allStates }: Props) {
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [typeOpen, setTypeOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  const filtered = useMemo(() => {
    return cards.filter((op) => {
      // Verified filter
      if (filterVerified === "verified" && !op.verified) return false;
      if (filterVerified === "unverified" && op.verified) return false;

      // Adventure type filter
      if (filterType !== "all") {
        const hasType = op.adventureDetails.some((a) => a.type === filterType);
        if (!hasType) return false;
      }

      // State filter
      if (filterState !== "all") {
        const hasState = op.adventureDetails.some((a) =>
          a.state.toLowerCase().includes(filterState.toLowerCase())
        );
        if (!hasState) return false;
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
    <section className="px-5 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto">

        {/* ── Filter Bar ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-8">

          {/* Verified toggle */}
          <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["all", "verified", "unverified"] as const).map((v) => {
              const active = filterVerified === v;
              return (
                <button
                  key={v}
                  onClick={() => setFilterVerified(v)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-150"
                  style={{
                    background: active ? "rgba(255,255,255,0.07)" : "transparent",
                    color: active
                      ? v === "verified"
                        ? VERIFIED_COLOR
                        : v === "unverified"
                        ? UNVERIFIED_COLOR
                        : "rgba(255,255,255,0.75)"
                      : "rgba(255,255,255,0.3)",
                    borderRight: v !== "unverified" ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  {v === "verified" && (
                    <ShieldCheck className="w-3 h-3" style={{ color: active ? VERIFIED_COLOR : "rgba(255,255,255,0.2)" }} />
                  )}
                  {v === "unverified" && (
                    <ShieldAlert className="w-3 h-3" style={{ color: active ? UNVERIFIED_COLOR : "rgba(255,255,255,0.2)" }} />
                  )}
                  {v === "all" ? "All operators" : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Adventure type dropdown */}
          <div className="relative">
            <button
              onClick={() => { setTypeOpen((p) => !p); setStateOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: filterType !== "all" ? "rgba(255,81,0,0.08)" : "transparent",
                color: filterType !== "all" ? "#ff6b2b" : "rgba(255,255,255,0.4)",
              }}
            >
              {filterType === "all" ? "Adventure type" : filterType}
              <ChevronDown className="w-3 h-3" style={{ opacity: 0.5 }} />
            </button>
            {typeOpen && (
              <div
                className="absolute top-full left-0 mt-1 z-20 rounded-xl overflow-hidden py-1 min-w-[160px]"
                style={{ background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
              >
                <button
                  onClick={() => { setFilterType("all"); setTypeOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/[0.05]"
                  style={{ color: filterType === "all" ? "white" : "rgba(255,255,255,0.4)" }}
                >
                  All types
                </button>
                {allTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setFilterType(t); setTypeOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs transition-colors hover:bg-white/[0.05]"
                    style={{ color: filterType === t ? "#ff6b2b" : "rgba(255,255,255,0.55)" }}
                  >
                    <span style={{ opacity: 0.7 }}>{ADVENTURE_TYPE_ICONS[t]?.(10)}</span>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* State dropdown */}
          <div className="relative">
            <button
              onClick={() => { setStateOpen((p) => !p); setTypeOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: filterState !== "all" ? "rgba(255,81,0,0.08)" : "transparent",
                color: filterState !== "all" ? "#ff6b2b" : "rgba(255,255,255,0.4)",
              }}
            >
              {filterState === "all" ? "Location" : filterState}
              <ChevronDown className="w-3 h-3" style={{ opacity: 0.5 }} />
            </button>
            {stateOpen && (
              <div
                className="absolute top-full left-0 mt-1 z-20 rounded-xl overflow-hidden py-1 min-w-[180px] max-h-64 overflow-y-auto"
                style={{ background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
              >
                <button
                  onClick={() => { setFilterState("all"); setStateOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/[0.05]"
                  style={{ color: filterState === "all" ? "white" : "rgba(255,255,255,0.4)" }}
                >
                  All locations
                </button>
                {allStates.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilterState(s); setStateOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/[0.05]"
                    style={{ color: filterState === s ? "#ff6b2b" : "rgba(255,255,255,0.55)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs transition-colors"
              style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}

          {/* Result count */}
          <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            {filtered.length} {filtered.length === 1 ? "operator" : "operators"}
          </span>
        </div>

        {/* Close dropdowns on outside click */}
        {(typeOpen || stateOpen) && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => { setTypeOpen(false); setStateOpen(false); }}
          />
        )}

        {/* ── Grid ───────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-white/20 text-sm">No operators match these filters.</p>
            <button onClick={clearAll} className="mt-3 text-xs text-[#ff5100] underline underline-offset-2">Clear filters</button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{
              background: "var(--border-subtle)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "1.25rem",
              overflow: "hidden",
            }}
          >
            {filtered.map((op) => {
              const initial = op.company_name.charAt(0).toUpperCase();
              const isStatic = op.id.startsWith("static-");

              return (
                <div
                  key={op.id}
                  className="group flex flex-col gap-5 p-6 transition-colors duration-200 hover:bg-white/[0.025]"
                  style={{ background: "var(--bg-surface)" }}
                >
                  {/* Operator identity */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-black"
                        style={{ background: "rgba(255,81,0,0.09)", color: "#ff6b2b" }}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-white/90 font-semibold text-sm leading-tight truncate">{op.company_name}</h2>
                        {/* Verified / Unverified badge */}
                        {op.verified ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="w-3 h-3" style={{ color: VERIFIED_COLOR }} />
                            <span className="text-[10px] font-semibold" style={{ color: VERIFIED_COLOR }}>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mt-0.5">
                            <ShieldAlert className="w-3 h-3" style={{ color: "rgba(255,255,255,0.2)" }} />
                            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>Unverified</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {op.website && (
                      <a
                        href={op.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-1 -m-1 rounded-lg text-white/20 hover:text-[#ff5100] transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Adventures */}
                  {op.adventureDetails.length > 0 ? (
                    <div className="flex-1 flex flex-col gap-3">
                      <p className="text-white/20 text-[10px] uppercase tracking-[0.14em] font-semibold">
                        {op.adventureDetails.length} {op.adventureDetails.length === 1 ? "adventure" : "adventures"}
                      </p>
                      <div className="space-y-1.5">
                        {op.adventureDetails.slice(0, 5).map((adv) => (
                          <Link
                            key={adv.slug}
                            href={`/experiences/${adv.slug}`}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.05] group/row"
                            style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                          >
                            <div className="relative w-10 h-10 rounded-lg shrink-0 overflow-hidden">
                              <Image src={adv.heroImage} alt={adv.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/70 text-xs font-medium truncate group-hover/row:text-white transition-colors leading-snug">
                                {adv.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="flex items-center gap-1 text-[10px] text-white/30">
                                  {ADVENTURE_TYPE_ICONS[adv.type]?.(9)}
                                  {adv.type}
                                </span>
                                <span className="w-px h-2.5 bg-white/10" />
                                <span className="text-[10px] text-white/25">{adv.state}</span>
                                {op.prices[adv.slug] && (
                                  <>
                                    <span className="w-px h-2.5 bg-white/10" />
                                    <span className="text-[10px] font-semibold text-emerald-400">
                                      {op.prices[adv.slug]} onwards
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                        {op.adventureDetails.length > 5 && (
                          <p className="text-white/20 text-[10px] pt-1 pl-1">+{op.adventureDetails.length - 5} more</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/20 text-xs flex-1 italic">Listings under review.</p>
                  )}

                  {/* Email footer */}
                  {!isStatic && op.email && (
                    <p
                      className="text-white/18 text-[10px] pt-3 truncate"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
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
