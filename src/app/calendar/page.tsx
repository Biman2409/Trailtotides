"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { adventures } from "@/lib/data";
import type { Month } from "@/lib/data";
import { ArrowRight, Calendar } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

const MONTHS: { key: Month; label: string; short: string }[] = [
  { key: "Jan", label: "January",   short: "Jan" },
  { key: "Feb", label: "February",  short: "Feb" },
  { key: "Mar", label: "March",     short: "Mar" },
  { key: "Apr", label: "April",     short: "Apr" },
  { key: "May", label: "May",       short: "May" },
  { key: "Jun", label: "June",      short: "Jun" },
  { key: "Jul", label: "July",      short: "Jul" },
  { key: "Aug", label: "August",    short: "Aug" },
  { key: "Sep", label: "September", short: "Sep" },
  { key: "Oct", label: "October",   short: "Oct" },
  { key: "Nov", label: "November",  short: "Nov" },
  { key: "Dec", label: "December",  short: "Dec" },
];

const CURRENT_MONTH = MONTHS[new Date().getMonth()].key;

export default function CalendarPage() {
  const [selected, setSelected] = useState<Month>(CURRENT_MONTH);

  const inSeason = adventures.filter((a) => a.bestMonths.includes(selected));
  const selectedMonth = MONTHS.find((m) => m.key === selected)!;

  // Group by type for the summary bar
  const typeCounts = inSeason.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-24 lg:pt-28 pb-10 px-5 lg:px-8 t-bg-surface border-b border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-[#ff5100]" />
            <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase">Season Calendar</p>
          </div>
          <h1 className="text-white text-3xl lg:text-5xl font-bold tracking-tight mb-3">
            Best Time to Adventure
          </h1>
          <p className="text-white/40 text-base max-w-xl leading-relaxed">
            Pick a month to see which adventures are in peak season. Plan smarter — go when the window is open.
          </p>
        </div>
      </section>

      {/* Month selector */}
      <div className="sticky top-16 lg:top-20 z-30 backdrop-blur-md border-b border-white/8 shadow-sm" style={{ background: "var(--bg-page)" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar py-3 gap-1.5">
            {MONTHS.map((m) => {
              const count = adventures.filter((a) => a.bestMonths.includes(m.key)).length;
              const isActive = m.key === selected;
              const isCurrent = m.key === CURRENT_MONTH;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelected(m.key)}
                  className="flex-none flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-200 relative"
                  style={isActive
                    ? { background: "#ff5100", color: "white" }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)" }
                  }
                >
                  {isCurrent && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                  <span className="text-sm font-semibold leading-none">{m.short}</span>
                  <span className="text-[10px] mt-1 opacity-70 leading-none">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        {/* Summary row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-white text-2xl font-bold">
              {selectedMonth.label}
              <span className="text-white/30 font-normal text-lg ml-3">{inSeason.length} adventures in season</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([type, count]) => (
                <span
                  key={type}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "rgba(255,81,0,0.12)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                >
                  {ADVENTURE_TYPE_ICONS[type]?.(11)}
                  {type} <span className="opacity-60">({count})</span>
                </span>
              ))}
          </div>
        </div>

        {inSeason.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🌧️</div>
            <p className="text-white/40 text-lg">No adventures in peak season this month.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inSeason.map((a) => (
              <Link
                key={a.id}
                href={`/experiences/${a.slug}`}
                className="group rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={a.heroImage}
                    alt={a.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  {/* Season strip */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.25)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.4)" }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                      In Season
                    </span>
                  </div>
                  {/* Type icon bottom */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)" }}>
                      {ADVENTURE_TYPE_ICONS[a.type]?.(10)}
                      {a.type}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm leading-snug mb-1 group-hover:text-[#ff5100] transition-colors line-clamp-2">{a.name}</h3>
                  <p className="text-white/35 text-[11px] leading-relaxed line-clamp-2">{a.tagline}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-white/25 text-[10px]">{a.state}</span>
                    <span className="text-white/25 text-[10px]">{a.durationDays}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Full year heatmap strip */}
        <div className="mt-16 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-white font-semibold mb-5">Year-Round Overview</h3>
          <div className="grid grid-cols-12 gap-1.5">
            {MONTHS.map((m) => {
              const count = adventures.filter((a) => a.bestMonths.includes(m.key)).length;
              const max = 30;
              const intensity = Math.min(count / max, 1);
              const isActive = m.key === selected;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelected(m.key)}
                  className="flex flex-col items-center gap-1.5 transition-all"
                >
                  <div
                    className="w-full rounded-lg transition-all duration-200"
                    style={{
                      height: `${24 + intensity * 40}px`,
                      background: isActive ? "#ff5100" : `rgba(255,81,0,${0.12 + intensity * 0.55})`,
                      boxShadow: isActive ? "0 0 12px rgba(255,81,0,0.4)" : "none",
                    }}
                  />
                  <span className="text-[10px] font-medium" style={{ color: isActive ? "#ff5100" : "rgba(255,255,255,0.35)" }}>{m.short}</span>
                  <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href={`/explore?month=${selected}`}
            className="inline-flex items-center gap-2 bg-[#ff5100] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#ff7d47] transition-all hover:-translate-y-0.5"
          >
            Explore all {selectedMonth.label} adventures
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
