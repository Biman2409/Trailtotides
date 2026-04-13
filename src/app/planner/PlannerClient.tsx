"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { adventures } from "@/lib/data";
import type { Adventure, Month } from "@/lib/data";
import {
  Search, X, Plus, CalendarDays, MapPin, Clock,
  Trash2, Printer, ChevronDown, Mountain, CloudRain,
  StickyNote, BarChart2, ArrowRight, Sparkles,
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

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = "ttt_trip_plan";
function lsLoad(): PlanEntry[] {
  try {
    const r = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    return r ? JSON.parse(r) : [];
  } catch { return []; }
}
function lsSave(e: PlanEntry[]) { try { localStorage.setItem(LS_KEY, JSON.stringify(e)); } catch {} }
function generateId() { return Math.random().toString(36).slice(2, 9); }

// ── Difficulty colours ────────────────────────────────────────────────────────

const DIFF_COLOR: Record<string, string> = {
  Easy: "#10b981", Moderate: "#f59e0b", Hard: "#f97316", Advanced: "#ef4444", Extreme: "#a855f7",
};

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PlannerClient() {
  const [entries, setEntries]       = useState<PlanEntry[]>(() => lsLoad());
  const [search, setSearch]         = useState("");
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("search");
  const [seasonMonth, setSeasonMonth] = useState<Month>(CURRENT_MONTH);
  const printRef = useRef<HTMLDivElement>(null);

  const filtered = search.trim().length > 1
    ? adventures.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.state.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 14)
    : [];

  const inSeason = adventures.filter(a => a.bestMonths.includes(seasonMonth));
  const selectedMonthLabel = MONTHS.find(m => m.key === seasonMonth)!.label;

  function addAdventure(a: Adventure) {
    const today = new Date().toISOString().slice(0, 10);
    const entry: PlanEntry = { id: generateId(), adventure: a, startDate: today, endDate: today, notes: "" };
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

  const totalDays = entries.reduce((sum, e) => {
    if (!e.startDate || !e.endDate) return sum;
    return sum + Math.max(1, Math.round((new Date(e.endDate).getTime() - new Date(e.startDate).getTime()) / 86400000) + 1);
  }, 0);

  const statesCount = new Set(entries.map(e => e.adventure.state)).size;
  const regions = [...new Set(entries.map(e => e.adventure.region))];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-page)" }}>
      <Navbar />

      <div className="pt-16 lg:pt-20 flex flex-1">

        {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
        <aside
          className="w-72 shrink-0 border-r flex flex-col"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)", height: "calc(100vh - 5rem)", position: "sticky", top: "5rem" }}
        >
          {/* Tab switcher */}
          <div className="flex border-b" style={{ borderColor: "var(--border-subtle)" }}>
            {(["search", "season"] as SidebarTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors"
                style={sidebarTab === tab
                  ? { color: "#ff5100", borderBottom: "2px solid #ff5100" }
                  : { color: "rgba(255,255,255,0.35)", borderBottom: "2px solid transparent" }
                }
              >
                {tab === "search"
                  ? <><Search className="w-3.5 h-3.5" />Add Adventures</>
                  : <><CalendarDays className="w-3.5 h-3.5" />Season Calendar</>}
              </button>
            ))}
          </div>

          {/* ── Search tab ─────────────────────────────────────────────────────── */}
          {sidebarTab === "search" && (
            <>
              <div className="p-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, region, type…"
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
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
                  <div className="p-5">
                    {entries.length === 0 ? (
                      <div className="text-center pt-4">
                        <Sparkles className="w-8 h-8 text-white/10 mx-auto mb-3" />
                        <p className="text-white/40 text-sm font-medium mb-1">Start building your trip</p>
                        <p className="text-white/25 text-xs leading-relaxed mb-5">Search above or browse the Season Calendar to find adventures that are open right now.</p>
                        <button
                          onClick={() => setSidebarTab("season")}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: "rgba(255,81,0,0.12)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                          Open Season Calendar
                        </button>
                      </div>
                    ) : (
                      <p className="text-white/25 text-xs text-center py-4">Type to add more adventures</p>
                    )}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-5 text-center">
                    <p className="text-white/25 text-sm">No results for &quot;{search}&quot;</p>
                    <p className="text-white/15 text-xs mt-1">Try a region or adventure type</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filtered.map(a => {
                      const already = entries.some(e => e.adventure.id === a.id);
                      return (
                        <button
                          key={a.id}
                          onClick={() => !already && addAdventure(a)}
                          disabled={already}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left mb-1 disabled:opacity-40 group hover:bg-white/[0.05]"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
                            <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold leading-snug line-clamp-1">{a.name}</p>
                            <p className="text-white/35 text-[10px] mt-0.5">{a.type} · {a.state}</p>
                          </div>
                          {already
                            ? <span className="text-emerald-400 text-[10px] font-semibold shrink-0">Added</span>
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

          {/* ── Season Calendar tab ────────────────────────────────────────────── */}
          {sidebarTab === "season" && (
            <>
              {/* Month grid */}
              <div className="p-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="grid grid-cols-6 gap-1">
                  {MONTHS.map(m => {
                    const count = adventures.filter(a => a.bestMonths.includes(m.key)).length;
                    const isActive = m.key === seasonMonth;
                    const isCurrent = m.key === CURRENT_MONTH;
                    return (
                      <button
                        key={m.key}
                        onClick={() => setSeasonMonth(m.key)}
                        className="relative flex flex-col items-center py-1.5 rounded-lg transition-all duration-150"
                        style={isActive
                          ? { background: "#ff5100", color: "white" }
                          : { background: "rgba(255,255,255,0.04)", color: isCurrent ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)" }
                        }
                      >
                        {isCurrent && !isActive && (
                          <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-emerald-400" />
                        )}
                        <span className="text-[10px] font-bold leading-none">{m.short}</span>
                        <span className="text-[8px] mt-0.5 opacity-50 leading-none">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Header */}
              <div className="px-4 py-2.5 flex items-center justify-between border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <p className="text-white text-xs font-semibold">{selectedMonthLabel}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(16,185,129,0.12)", color: "#6ee7b7" }}>
                  {inSeason.length} in season
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {inSeason.length === 0 ? (
                  <div className="text-center py-10">
                    <CloudRain className="w-5 h-5 text-white/15 mx-auto mb-2" />
                    <p className="text-white/35 text-xs">No adventures in peak season this month.</p>
                  </div>
                ) : (
                  inSeason.map(a => {
                    const already = entries.some(e => e.adventure.id === a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => !already && addAdventure(a)}
                        disabled={already}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left mb-1 disabled:opacity-40 group hover:bg-white/[0.05]"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                          <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold leading-snug line-clamp-1">{a.name}</p>
                          <p className="text-white/35 text-[10px] mt-0.5">{a.type} · {a.state}</p>
                        </div>
                        {already
                          ? <span className="text-emerald-400 text-[10px] font-semibold shrink-0">Added</span>
                          : <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(255,81,0,0.2)" }}>
                              <Plus className="w-3 h-3 text-[#ff7d47]" />
                            </div>
                        }
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </aside>

        {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-h-0">

          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight">Trip Planner</h1>
              {entries.length > 0 && (
                <p className="text-white/35 text-xs mt-0.5">
                  {entries.length} adventure{entries.length !== 1 ? "s" : ""} · {totalDays} day{totalDays !== 1 ? "s" : ""} · {statesCount} state{statesCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {entries.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                  style={{ background: "rgba(255,81,0,0.12)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Export
                </button>
                <button
                  onClick={() => { setEntries([]); lsSave([]); setEditingId(null); }}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-all hover:text-red-400 hover:bg-red-500/10"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ── Empty state ─────────────────────────────────────────────────────── */}
          {entries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.15)" }}>
                <Mountain className="w-7 h-7 text-[#ff5100]/40" />
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">Plan your next expedition</h2>
              <p className="text-white/35 text-sm max-w-sm leading-relaxed mb-8">
                Add adventures, set dates, and build a complete itinerary. Start by searching or picking a month from the Season Calendar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setSidebarTab("search"); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                  style={{ background: "#ff5100", color: "white" }}
                >
                  <Search className="w-4 h-4" />
                  Search Adventures
                </button>
                <button
                  onClick={() => setSidebarTab("season")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <CalendarDays className="w-4 h-4" />
                  Season Calendar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 min-h-0">

              {/* ── Itinerary list ─────────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3" ref={printRef}>
                {entries.map((entry, idx) => {
                  const a = entry.adventure;
                  const isEditing = editingId === entry.id;
                  const days = entry.startDate && entry.endDate
                    ? Math.max(1, Math.round((new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime()) / 86400000) + 1)
                    : null;
                  const diffColor = DIFF_COLOR[a.difficulty] ?? "#ff5100";
                  const hasNotes = entry.notes.trim().length > 0;

                  return (
                    <div
                      key={entry.id}
                      className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
                      style={{
                        border: isEditing ? "1px solid rgba(255,81,0,0.35)" : "1px solid rgba(255,255,255,0.07)",
                        background: isEditing ? "rgba(255,81,0,0.04)" : "rgba(255,255,255,0.025)",
                      }}
                      onClick={() => setEditingId(isEditing ? null : entry.id)}
                    >
                      {/* Card row */}
                      <div className="flex items-center gap-4 p-4">
                        {/* Step number */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                          style={isEditing
                            ? { background: "#ff5100", color: "white" }
                            : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }
                          }
                        >
                          {idx + 1}
                        </div>

                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0">
                          <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-white font-bold text-sm leading-snug truncate">{a.name}</h3>
                            <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${diffColor}18`, color: diffColor }}>
                              {a.difficulty}
                            </span>
                            {hasNotes && <StickyNote className="w-3 h-3 text-white/25 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1 text-[10px] text-white/35">
                              {ADVENTURE_TYPE_ICONS[a.type]?.(10)}
                              {a.type}
                            </span>
                            <span className="text-white/15">·</span>
                            <span className="flex items-center gap-1 text-[10px] text-white/35">
                              <MapPin className="w-2.5 h-2.5" />{a.state}
                            </span>
                            <span className="text-white/15">·</span>
                            <span className="flex items-center gap-1 text-[10px] text-white/35">
                              <Clock className="w-2.5 h-2.5" />{a.durationDays}
                            </span>
                          </div>
                          {entry.startDate && (
                            <p className="text-[10px] font-semibold mt-1" style={{ color: "rgba(255,81,0,0.65)" }}>
                              {new Date(entry.startDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              {entry.endDate && entry.endDate !== entry.startDate && (
                                <> <ArrowRight className="w-2.5 h-2.5 inline -mt-0.5" /> {new Date(entry.endDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
                              )}
                              {days && <span className="text-white/25 font-normal ml-1">· {days} day{days !== 1 ? "s" : ""}</span>}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            href={`/experiences/${a.slug}`}
                            onClick={e => e.stopPropagation()}
                            className="text-[10px] text-white/25 hover:text-[#ff5100] transition-colors px-2 py-1"
                          >
                            View
                          </Link>
                          <button
                            onClick={e => { e.stopPropagation(); removeEntry(entry.id); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-red-500/15 hover:text-red-400 text-white/20"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* ── Expanded editor ──────────────────────────────────────── */}
                      {isEditing && (
                        <div
                          className="px-5 pb-5 pt-1 border-t"
                          style={{ borderColor: "rgba(255,81,0,0.1)" }}
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="grid grid-cols-2 gap-3 mt-3 mb-3">
                            <div>
                              <label className="text-[10px] text-white/35 uppercase tracking-wider font-semibold mb-1.5 block">Start Date</label>
                              <input
                                type="date"
                                value={entry.startDate}
                                onChange={e => updateEntry(entry.id, { startDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                                style={{ background: "rgba(255,255,255,0.06)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-white/35 uppercase tracking-wider font-semibold mb-1.5 block">End Date</label>
                              <input
                                type="date"
                                value={entry.endDate}
                                min={entry.startDate}
                                onChange={e => updateEntry(entry.id, { endDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                                style={{ background: "rgba(255,255,255,0.06)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-white/35 uppercase tracking-wider font-semibold mb-1.5 block">Notes</label>
                            <textarea
                              value={entry.notes}
                              onChange={e => updateEntry(entry.id, { notes: e.target.value })}
                              placeholder="Operator contact, gear notes, travel logistics…"
                              rows={3}
                              className="w-full px-3 py-2.5 rounded-xl text-sm resize-none focus:outline-none"
                              style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add more prompt */}
                <button
                  onClick={() => setSidebarTab("search")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all hover:bg-white/[0.04]"
                  style={{ border: "1.5px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.2)" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add another adventure
                </button>
              </div>

              {/* ── Summary panel ──────────────────────────────────────────────── */}
              <div className="w-56 shrink-0 border-l overflow-y-auto" style={{ borderColor: "var(--border-subtle)" }}>

                {/* Stats */}
                <div className="p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/25 mb-3">Summary</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: entries.length, label: "Trips",  color: "#ff5100" },
                      { val: totalDays,      label: "Days",   color: "#f59e0b" },
                      { val: statesCount,    label: "States", color: "#38bdf8" },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: `${s.color}0c`, border: `1px solid ${s.color}18` }}>
                        <p className="text-xl font-black leading-none" style={{ color: s.color }}>{s.val}</p>
                        <p className="text-[9px] text-white/30 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regions */}
                {regions.length > 0 && (
                  <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/25 mb-2">Regions</p>
                    <div className="flex flex-wrap gap-1">
                      {regions.map(r => (
                        <span key={r} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>{r}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Difficulty mix */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/25 mb-2.5">Difficulty Mix</p>
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
                            <span className="text-[9px] text-white/35">{count}</span>
                          </div>
                          <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Season heatmap */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/25 mb-2.5 flex items-center gap-1.5">
                    <BarChart2 className="w-3 h-3" />
                    Season Heatmap
                  </p>
                  <div className="grid grid-cols-6 gap-1">
                    {MONTHS.map(m => {
                      const count = adventures.filter(a => a.bestMonths.includes(m.key)).length;
                      const intensity = Math.min(count / 30, 1);
                      const isSelected = m.key === seasonMonth;
                      const hasEntry = entries.some(e => {
                        const mIdx = MONTHS.findIndex(mo => mo.key === m.key);
                        return e.startDate && new Date(e.startDate).getMonth() === mIdx;
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
                              height: `${12 + intensity * 20}px`,
                              background: isSelected ? "#ff5100" : `rgba(255,81,0,${0.08 + intensity * 0.45})`,
                              boxShadow: isSelected ? "0 0 6px rgba(255,81,0,0.4)" : "none",
                            }}
                          >
                            {hasEntry && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                          </div>
                          <span className="text-[7px] font-medium" style={{ color: isSelected ? "#ff5100" : "rgba(255,255,255,0.25)" }}>{m.short}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Export */}
                <div className="p-4">
                  <button
                    onClick={() => window.print()}
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
                    style={{ background: "#ff5100", color: "white", boxShadow: "0 4px 14px rgba(255,81,0,0.25)" }}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Itinerary
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
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
