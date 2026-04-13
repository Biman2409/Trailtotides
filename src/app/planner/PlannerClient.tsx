"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { adventures } from "@/lib/data";
import type { Adventure, Month } from "@/lib/data";
import {
  Search, X, Plus, CalendarDays, MapPin, Clock,
  Trash2, Printer, Mountain, CloudRain, ArrowRight,
  Sparkles, GripVertical, AlertTriangle, ChevronRight,
  Navigation, TrendingUp, Banknote, StickyNote, Check,
} from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

// ── Types ─────────────────────────────────────────────────────────────────────

type PlanEntry = {
  id: string;
  adventure: Adventure;
  startDate: string;
  endDate: string;
  notes: string;
};

type SidebarTab = "search" | "season";

// ── Months ────────────────────────────────────────────────────────────────────

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

// ── localStorage ──────────────────────────────────────────────────────────────

const LS_KEY = "ttt_trip_plan";
function lsLoad(): PlanEntry[] {
  try {
    const r = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    return r ? JSON.parse(r) : [];
  } catch { return []; }
}
function lsSave(e: PlanEntry[]) { try { localStorage.setItem(LS_KEY, JSON.stringify(e)); } catch {} }
function generateId() { return Math.random().toString(36).slice(2, 9); }

// ── Helpers ───────────────────────────────────────────────────────────────────

const DIFF_COLOR: Record<string, string> = {
  Easy: "#10b981", Moderate: "#f59e0b", Hard: "#f97316", Advanced: "#ef4444", Extreme: "#a855f7",
};

function daysBetween(a: string, b: string) {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1);
}

function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fmtDateFull(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function hasOverlap(entries: PlanEntry[], skipId?: string): boolean {
  const valid = entries.filter(e => e.id !== skipId && e.startDate && e.endDate);
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const a = valid[i], b = valid[j];
      if (a.startDate <= b.endDate && b.startDate <= a.endDate) return true;
    }
  }
  return false;
}

function entryHasConflict(entry: PlanEntry, entries: PlanEntry[]) {
  if (!entry.startDate || !entry.endDate) return false;
  return entries.some(e =>
    e.id !== entry.id && e.startDate && e.endDate &&
    entry.startDate <= e.endDate && e.startDate <= entry.endDate
  );
}

function minPrice(a: Adventure): string | null {
  if (!a.operators?.length) return null;
  const prices = a.operators.map(o => parseInt(o.priceFrom.replace(/[^0-9]/g, ""))).filter(Boolean);
  if (!prices.length) return null;
  const min = Math.min(...prices);
  return `₹${(min / 1000).toFixed(0)}k`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PlannerClient() {
  const [entries, setEntries]         = useState<PlanEntry[]>(() => lsLoad());
  const [search, setSearch]           = useState("");
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [sidebarTab, setSidebarTab]   = useState<SidebarTab>("search");
  const [seasonMonth, setSeasonMonth] = useState<Month>(CURRENT_MONTH);
  const [dragId, setDragId]           = useState<string | null>(null);
  const [dragOverId, setDragOverId]   = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // ── Filtered search results ───────────────────────────────────────────────
  const filtered = search.trim().length > 1
    ? adventures.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.state.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase()) ||
        a.region.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 16)
    : [];

  const inSeason = adventures.filter(a => a.bestMonths.includes(seasonMonth));
  const selectedMonthLabel = MONTHS.find(m => m.key === seasonMonth)!.label;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalDays   = entries.reduce((sum, e) => sum + (e.startDate && e.endDate ? daysBetween(e.startDate, e.endDate) : 1), 0);
  const statesCount = new Set(entries.map(e => e.adventure.state)).size;
  const hasConflicts = hasOverlap(entries);

  // ── Mutation helpers ──────────────────────────────────────────────────────
  function addAdventure(a: Adventure) {
    // Auto-chain: start the day after the last entry ends
    let startDate = new Date().toISOString().slice(0, 10);
    if (entries.length > 0) {
      const last = entries[entries.length - 1];
      if (last.endDate) startDate = addDays(last.endDate, 1);
    }
    // Default end date = start + adventure's own duration
    const durationMatch = a.durationDays.match(/(\d+)/);
    const durationN = durationMatch ? parseInt(durationMatch[1]) - 1 : 0;
    const endDate = addDays(startDate, durationN);

    const entry: PlanEntry = { id: generateId(), adventure: a, startDate, endDate, notes: "" };
    const next = [...entries, entry];
    setEntries(next); lsSave(next);
    setSearch("");
    setEditingId(entry.id);
    setSidebarTab("search");
  }

  function removeEntry(id: string) {
    const next = entries.filter(e => e.id !== id);
    setEntries(next); lsSave(next);
    if (editingId === id) setEditingId(null);
  }

  function updateEntry(id: string, patch: Partial<PlanEntry>) {
    const next = entries.map(e => e.id === id ? { ...e, ...patch } : e);
    setEntries(next); lsSave(next);
  }

  // ── Drag-to-reorder ────────────────────────────────────────────────────────
  const handleDragStart = useCallback((id: string) => setDragId(id), []);
  const handleDragOver  = useCallback((id: string) => setDragOverId(id), []);
  const handleDrop      = useCallback(() => {
    if (!dragId || !dragOverId || dragId === dragOverId) { setDragId(null); setDragOverId(null); return; }
    setEntries(prev => {
      const arr = [...prev];
      const from = arr.findIndex(e => e.id === dragId);
      const to   = arr.findIndex(e => e.id === dragOverId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      lsSave(arr);
      return arr;
    });
    setDragId(null); setDragOverId(null);
  }, [dragId, dragOverId]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-page)" }}>
      <Navbar />

      <div className="pt-16 lg:pt-20 flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 0px)" }}>

        {/* ════════════════════ SIDEBAR ════════════════════ */}
        <aside
          className="w-72 shrink-0 border-r flex flex-col"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            height: "calc(100vh - 5rem)",
            position: "sticky",
            top: "5rem",
          }}
        >
          {/* Tab bar */}
          <div className="flex border-b shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
            {(["search", "season"] as SidebarTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors"
                style={sidebarTab === tab
                  ? { color: "#ff5100", borderBottom: "2px solid #ff5100" }
                  : { color: "rgba(255,255,255,0.3)", borderBottom: "2px solid transparent" }
                }
              >
                {tab === "search"
                  ? <><Search className="w-3.5 h-3.5" />Add</>
                  : <><CalendarDays className="w-3.5 h-3.5" />Season</>}
              </button>
            ))}
          </div>

          {/* ── SEARCH TAB ─────────────────────────────────────── */}
          {sidebarTab === "search" && (
            <>
              <div className="p-3 border-b shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Name, region, type…"
                    className="w-full pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                    autoFocus
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <X className="w-3 h-3 text-white/30" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {search.trim().length < 2 ? (
                  <div className="p-4">
                    {entries.length === 0 ? (
                      <div className="text-center pt-3">
                        <Sparkles className="w-7 h-7 text-white/10 mx-auto mb-3" />
                        <p className="text-white/40 text-xs font-semibold mb-1">Start building your trip</p>
                        <p className="text-white/22 text-[10px] leading-relaxed mb-4">Search above or browse open seasons to find the right adventures.</p>
                        <button
                          onClick={() => setSidebarTab("season")}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold"
                          style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                        >
                          <CalendarDays className="w-3.5 h-3.5" /> Season Calendar
                        </button>
                      </div>
                    ) : (
                      <p className="text-white/22 text-[10px] text-center py-3">Type to search & add more adventures</p>
                    )}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-white/25 text-xs">No results for &quot;{search}&quot;</p>
                    <p className="text-white/15 text-[10px] mt-1">Try a region, state or type</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filtered.map(a => {
                      const already = entries.some(e => e.adventure.id === a.id);
                      const diffColor = DIFF_COLOR[a.difficulty] ?? "#ff5100";
                      return (
                        <button
                          key={a.id}
                          onClick={() => !already && addAdventure(a)}
                          disabled={already}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left mb-0.5 disabled:opacity-40 group hover:bg-white/[0.05]"
                        >
                          <div className="w-9 h-9 rounded-lg overflow-hidden relative shrink-0">
                            <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[11px] font-semibold leading-snug line-clamp-1">{a.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${diffColor}18`, color: diffColor }}>{a.difficulty}</span>
                              <span className="text-white/30 text-[9px]">{a.state}</span>
                            </div>
                          </div>
                          {already
                            ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            : <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(255,81,0,0.2)" }}>
                                <Plus className="w-3 h-3 text-[#ff7d47]" />
                              </div>
                          }
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── SEASON TAB ────────────────────────────────────── */}
          {sidebarTab === "season" && (
            <>
              <div className="p-3 border-b shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="grid grid-cols-6 gap-1">
                  {MONTHS.map(m => {
                    const count = adventures.filter(a => a.bestMonths.includes(m.key)).length;
                    const isActive = m.key === seasonMonth;
                    const isCurrent = m.key === CURRENT_MONTH;
                    return (
                      <button
                        key={m.key}
                        onClick={() => setSeasonMonth(m.key)}
                        className="relative flex flex-col items-center py-1.5 rounded-lg transition-all"
                        style={isActive
                          ? { background: "#ff5100", color: "white" }
                          : { background: "rgba(255,255,255,0.04)", color: isCurrent ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }
                        }
                      >
                        {isCurrent && !isActive && <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-emerald-400" />}
                        <span className="text-[10px] font-bold leading-none">{m.short}</span>
                        <span className="text-[8px] mt-0.5 opacity-50 leading-none">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-3 py-2 flex items-center justify-between border-b shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
                <p className="text-white text-xs font-semibold">{selectedMonthLabel}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#6ee7b7" }}>
                  {inSeason.length} in season
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {inSeason.length === 0 ? (
                  <div className="text-center py-8">
                    <CloudRain className="w-5 h-5 text-white/15 mx-auto mb-2" />
                    <p className="text-white/30 text-xs">No adventures in peak season this month.</p>
                  </div>
                ) : inSeason.map(a => {
                  const already = entries.some(e => e.adventure.id === a.id);
                  const diffColor = DIFF_COLOR[a.difficulty] ?? "#ff5100";
                  return (
                    <button
                      key={a.id}
                      onClick={() => !already && addAdventure(a)}
                      disabled={already}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left mb-0.5 disabled:opacity-40 group hover:bg-white/[0.05]"
                    >
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                        <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[11px] font-semibold line-clamp-1">{a.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${diffColor}18`, color: diffColor }}>{a.difficulty}</span>
                          <span className="text-white/30 text-[9px]">{a.state}</span>
                        </div>
                      </div>
                      {already
                        ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        : <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(255,81,0,0.2)" }}>
                            <Plus className="w-3 h-3 text-[#ff7d47]" />
                          </div>
                      }
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </aside>

        {/* ════════════════════ MAIN ════════════════════ */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* ── Top bar ──────────────────────────────────────── */}
          <div className="px-6 py-3.5 flex items-center justify-between border-b shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Trip Planner</h1>
              {entries.length > 0 && (
                <p className="text-white/35 text-[10px] mt-0.5">
                  {entries.length} stop{entries.length !== 1 ? "s" : ""} · {totalDays} day{totalDays !== 1 ? "s" : ""} · {statesCount} state{statesCount !== 1 ? "s" : ""}
                  {hasConflicts && <span className="ml-2 text-amber-400 font-semibold">· date conflicts detected</span>}
                </p>
              )}
            </div>
            {entries.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110"
                  style={{ background: "rgba(255,81,0,0.1)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                >
                  <Printer className="w-3.5 h-3.5" /> Export
                </button>
                <button
                  onClick={() => { setEntries([]); lsSave([]); setEditingId(null); }}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-all hover:text-red-400 hover:bg-red-500/10"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ── Empty state ──────────────────────────────────── */}
          {entries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(255,81,0,0.07)", border: "1px solid rgba(255,81,0,0.15)" }}>
                <Mountain className="w-7 h-7 text-[#ff5100]/40" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">Plan your next expedition</h2>
              <p className="text-white/30 text-sm max-w-xs leading-relaxed mb-7">
                Build a day-by-day itinerary. Add adventures, set dates, and get a complete trip overview.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSidebarTab("search")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
                  style={{ background: "#ff5100", color: "white" }}
                >
                  <Search className="w-4 h-4" /> Search Adventures
                </button>
                <button
                  onClick={() => setSidebarTab("season")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <CalendarDays className="w-4 h-4" /> Season Calendar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 min-h-0 overflow-hidden">

              {/* ── Timeline / Itinerary ────────────────────── */}
              <div className="flex-1 overflow-y-auto" ref={printRef}>
                {/* Stats strip */}
                <div className="flex items-center gap-0 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  {[
                    { icon: <Navigation className="w-3.5 h-3.5" />, val: `${entries.length} stops`,  color: "#ff5100" },
                    { icon: <Clock      className="w-3.5 h-3.5" />, val: `${totalDays} days`,        color: "#f59e0b" },
                    { icon: <MapPin     className="w-3.5 h-3.5" />, val: `${statesCount} states`,    color: "#38bdf8" },
                    { icon: <TrendingUp className="w-3.5 h-3.5" />, val: `${new Set(entries.map(e => e.adventure.region)).size} region${new Set(entries.map(e => e.adventure.region)).size !== 1 ? "s" : ""}`, color: "#a78bfa" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-5 py-2.5 flex-1 border-r last:border-r-0" style={{ borderColor: "var(--border-subtle)" }}>
                      <span style={{ color: s.color }}>{s.icon}</span>
                      <span className="text-white/60 text-xs font-semibold">{s.val}</span>
                    </div>
                  ))}
                </div>

                {/* Cards */}
                <div className="p-5 space-y-0">
                  {entries.map((entry, idx) => {
                    const a         = entry.adventure;
                    const isEditing = editingId === entry.id;
                    const isDragging = dragId === entry.id;
                    const isDragOver = dragOverId === entry.id;
                    const days      = entry.startDate && entry.endDate ? daysBetween(entry.startDate, entry.endDate) : null;
                    const diffColor = DIFF_COLOR[a.difficulty] ?? "#ff5100";
                    const hasNotes  = entry.notes.trim().length > 0;
                    const conflict  = entryHasConflict(entry, entries);
                    const price     = minPrice(a);
                    const isLast    = idx === entries.length - 1;

                    return (
                      <div key={entry.id} className="relative">
                        {/* Timeline connector */}
                        {!isLast && (
                          <div
                            className="absolute left-[34px] z-10 flex flex-col items-center"
                            style={{ top: "calc(100% - 8px)", height: "24px" }}
                          >
                            <div className="w-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                            <ChevronRight className="w-2.5 h-2.5 rotate-90 -mt-0.5" style={{ color: "rgba(255,255,255,0.15)" }} />
                          </div>
                        )}

                        <div
                          draggable
                          onDragStart={() => handleDragStart(entry.id)}
                          onDragOver={e => { e.preventDefault(); handleDragOver(entry.id); }}
                          onDrop={handleDrop}
                          onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                          className="rounded-2xl overflow-hidden transition-all duration-200 mb-6 cursor-pointer"
                          style={{
                            border: conflict
                              ? "1px solid rgba(245,158,11,0.4)"
                              : isEditing
                                ? "1px solid rgba(255,81,0,0.4)"
                                : isDragOver
                                  ? "1px solid rgba(255,81,0,0.25)"
                                  : "1px solid rgba(255,255,255,0.07)",
                            background: isDragging
                              ? "rgba(255,255,255,0.015)"
                              : isEditing
                                ? "rgba(255,81,0,0.03)"
                                : "rgba(255,255,255,0.02)",
                            opacity: isDragging ? 0.5 : 1,
                            transform: isDragOver && !isDragging ? "scale(1.005)" : "scale(1)",
                          }}
                          onClick={() => setEditingId(isEditing ? null : entry.id)}
                        >
                          {/* Hero image banner */}
                          <div className="relative h-28 overflow-hidden">
                            <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)" }} />

                            {/* Top row: step + drag handle */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                                  style={isEditing
                                    ? { background: "#ff5100", color: "white" }
                                    : { background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }
                                  }
                                >
                                  {idx + 1}
                                </div>
                                {conflict && (
                                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.25)", backdropFilter: "blur(8px)" }}>
                                    <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                                    <span className="text-amber-300 text-[9px] font-bold">Date conflict</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="cursor-grab active:cursor-grabbing p-1 rounded-lg"
                                  style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <GripVertical className="w-3 h-3 text-white/50" />
                                </div>
                                <Link
                                  href={`/experiences/${a.slug}`}
                                  onClick={e => e.stopPropagation()}
                                  className="px-2 py-1 rounded-lg text-[10px] font-semibold text-white/70 hover:text-white transition-colors"
                                  style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
                                >
                                  View
                                </Link>
                                <button
                                  onClick={e => { e.stopPropagation(); removeEntry(entry.id); }}
                                  className="p-1 rounded-lg transition-all text-white/50 hover:text-red-400"
                                  style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Bottom: title + badges */}
                            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                              <div className="flex items-end justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="text-white font-bold text-sm leading-snug line-clamp-1">{a.name}</h3>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${diffColor}30`, color: diffColor }}>{a.difficulty}</span>
                                    <span className="flex items-center gap-0.5 text-[9px] text-white/50">
                                      {ADVENTURE_TYPE_ICONS[a.type]?.(9)}
                                      {a.type}
                                    </span>
                                    <span className="flex items-center gap-0.5 text-[9px] text-white/50">
                                      <MapPin className="w-2 h-2" />{a.state}
                                    </span>
                                  </div>
                                </div>
                                {/* Chips */}
                                <div className="flex gap-1 shrink-0">
                                  {a.altitude && (
                                    <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.65)", backdropFilter: "blur(8px)" }}>
                                      <TrendingUp className="w-2 h-2" />{a.altitude}
                                    </span>
                                  )}
                                  {a.durationDays && (
                                    <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.65)", backdropFilter: "blur(8px)" }}>
                                      <Clock className="w-2 h-2" />{a.durationDays}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Date + notes row */}
                          <div className="px-4 py-3 flex items-center justify-between gap-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              {entry.startDate ? (
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays className="w-3 h-3 shrink-0" style={{ color: "rgba(255,81,0,0.6)" }} />
                                  <span className="text-[11px] font-semibold" style={{ color: "rgba(255,81,0,0.8)" }}>
                                    {fmtDate(entry.startDate)}
                                    {entry.endDate && entry.endDate !== entry.startDate && (
                                      <> <ArrowRight className="w-2.5 h-2.5 inline -mt-0.5" /> {fmtDate(entry.endDate)}</>
                                    )}
                                  </span>
                                  {days && <span className="text-white/25 text-[10px]">· {days}d</span>}
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingId(entry.id)}
                                  className="text-[10px] text-white/25 hover:text-white/50 transition-colors"
                                >
                                  + Set dates
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2.5">
                              {price && (
                                <span className="flex items-center gap-0.5 text-[10px] text-white/35">
                                  <Banknote className="w-3 h-3" />from {price}
                                </span>
                              )}
                              {hasNotes && <StickyNote className="w-3 h-3 text-white/25" />}
                              <button
                                onClick={() => setEditingId(isEditing ? null : entry.id)}
                                className="text-[10px] font-medium transition-colors px-2 py-1 rounded-lg"
                                style={isEditing
                                  ? { background: "rgba(255,81,0,0.12)", color: "#ff7d47" }
                                  : { color: "rgba(255,255,255,0.25)" }
                                }
                              >
                                {isEditing ? "Done" : "Edit"}
                              </button>
                            </div>
                          </div>

                          {/* Expanded editor */}
                          {isEditing && (
                            <div
                              className="px-4 pb-4 border-t"
                              style={{ borderColor: "rgba(255,81,0,0.1)" }}
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="grid grid-cols-2 gap-3 mt-3 mb-3">
                                <div>
                                  <label className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1.5 block">Start Date</label>
                                  <input
                                    type="date"
                                    value={entry.startDate}
                                    onChange={e => updateEntry(entry.id, { startDate: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
                                    style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1.5 block">End Date</label>
                                  <input
                                    type="date"
                                    value={entry.endDate}
                                    min={entry.startDate}
                                    onChange={e => updateEntry(entry.id, { endDate: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
                                    style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                                  />
                                </div>
                              </div>
                              {/* Quick date chain */}
                              {idx > 0 && entries[idx - 1].endDate && (
                                <button
                                  className="text-[10px] mb-3 flex items-center gap-1.5 transition-colors hover:text-[#ff7d47]"
                                  style={{ color: "rgba(255,81,0,0.5)" }}
                                  onClick={() => {
                                    const prevEnd = entries[idx - 1].endDate;
                                    const newStart = addDays(prevEnd, 1);
                                    const dMatch = a.durationDays.match(/(\d+)/);
                                    const dur = dMatch ? parseInt(dMatch[1]) - 1 : 0;
                                    updateEntry(entry.id, { startDate: newStart, endDate: addDays(newStart, dur) });
                                  }}
                                >
                                  <ArrowRight className="w-2.5 h-2.5" />
                                  Chain from previous ({fmtDateFull(addDays(entries[idx - 1].endDate, 1))})
                                </button>
                              )}
                              <div>
                                <label className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1.5 block">Notes</label>
                                <textarea
                                  value={entry.notes}
                                  onChange={e => updateEntry(entry.id, { notes: e.target.value })}
                                  placeholder="Operator contact, gear notes, travel logistics…"
                                  rows={2}
                                  className="w-full px-3 py-2 rounded-xl text-xs resize-none focus:outline-none"
                                  style={{ background: "rgba(255,255,255,0.04)", color: "white", border: "1px solid rgba(255,255,255,0.08)" }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add more */}
                  <button
                    onClick={() => setSidebarTab("search")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-medium transition-all hover:bg-white/[0.03]"
                    style={{ border: "1.5px dashed rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.2)" }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add another stop
                  </button>
                </div>
              </div>

              {/* ── Summary sidebar ─────────────────────────── */}
              <div
                className="w-52 shrink-0 border-l overflow-y-auto"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                {/* Summary stats */}
                <div className="p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/22 mb-3">Trip Summary</p>
                  <div className="space-y-2.5">
                    {[
                      { val: entries.length, label: "Adventures",  color: "#ff5100" },
                      { val: totalDays,      label: "Total Days",  color: "#f59e0b" },
                      { val: statesCount,    label: "States",      color: "#38bdf8" },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-white/35 text-[10px]">{s.label}</span>
                        <span className="text-sm font-black tabular-nums" style={{ color: s.color }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date range */}
                {(() => {
                  const dated = entries.filter(e => e.startDate);
                  if (!dated.length) return null;
                  const earliest = dated.map(e => e.startDate).sort()[0];
                  const latest = dated.map(e => e.endDate || e.startDate).sort().reverse()[0];
                  return (
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/22 mb-2">Date Range</p>
                      <p className="text-white/60 text-[10px] font-semibold">{fmtDateFull(earliest)}</p>
                      <div className="flex items-center gap-1 my-0.5">
                        <div className="w-px h-3 ml-1" style={{ background: "rgba(255,255,255,0.1)" }} />
                      </div>
                      <p className="text-white/60 text-[10px] font-semibold">{fmtDateFull(latest)}</p>
                    </div>
                  );
                })()}

                {/* Regions */}
                {(() => {
                  const regions = [...new Set(entries.map(e => e.adventure.region))];
                  return (
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/22 mb-2">Regions</p>
                      <div className="flex flex-wrap gap-1">
                        {regions.map(r => (
                          <span key={r} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>{r}</span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Difficulty mix */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/22 mb-2.5">Difficulty</p>
                  <div className="space-y-2">
                    {["Easy","Moderate","Hard","Advanced","Extreme"].map(d => {
                      const count = entries.filter(e => e.adventure.difficulty === d).length;
                      if (!count) return null;
                      const pct = Math.round((count / entries.length) * 100);
                      const color = DIFF_COLOR[d] ?? "#ff5100";
                      return (
                        <div key={d}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px]" style={{ color }}>{d}</span>
                            <span className="text-[9px] text-white/30">{count}</span>
                          </div>
                          <div className="h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Adventure types */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/22 mb-2.5">Types</p>
                  <div className="space-y-1.5">
                    {[...new Set(entries.map(e => e.adventure.type))].map(t => {
                      const count = entries.filter(e => e.adventure.type === t).length;
                      return (
                        <div key={t} className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] text-white/40">
                            {ADVENTURE_TYPE_ICONS[t]?.(9)} {t}
                          </span>
                          <span className="text-[9px] text-white/25">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Season fit */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/22 mb-2.5">Season Fit</p>
                  <div className="grid grid-cols-6 gap-1">
                    {MONTHS.map(m => {
                      const count = adventures.filter(a => a.bestMonths.includes(m.key)).length;
                      const intensity = Math.min(count / 30, 1);
                      const hasTrip = entries.some(e => {
                        const mIdx = MONTHS.findIndex(mo => mo.key === m.key);
                        return e.startDate && new Date(e.startDate + "T00:00:00").getMonth() === mIdx;
                      });
                      return (
                        <button
                          key={m.key}
                          onClick={() => { setSeasonMonth(m.key); setSidebarTab("season"); }}
                          title={`${m.label}: ${count} adventures`}
                          className="flex flex-col items-center gap-0.5"
                        >
                          <div
                            className="w-full rounded relative"
                            style={{
                              height: `${10 + intensity * 18}px`,
                              background: `rgba(255,81,0,${0.07 + intensity * 0.45})`,
                            }}
                          >
                            {hasTrip && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                          </div>
                          <span className="text-[7px] font-medium text-white/20">{m.short}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Export */}
                <div className="p-4">
                  <button
                    onClick={() => window.print()}
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                    style={{ background: "#ff5100", color: "white", boxShadow: "0 4px 14px rgba(255,81,0,0.2)" }}
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Itinerary
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        @media print {
          nav, aside, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          * { color: black !important; border-color: #ddd !important; background: white !important; }
          .rounded-2xl { border: 1px solid #ddd; margin-bottom: 12px; }
        }
      `}</style>
    </div>
  );
}
