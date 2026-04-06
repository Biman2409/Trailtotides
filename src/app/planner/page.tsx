"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { adventures } from "@/lib/data";
import type { Adventure } from "@/lib/data";
import { Search, X, Plus, CalendarDays, MapPin, Clock, Trash2, GripVertical, Printer, ArrowLeft } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

type PlanEntry = {
  id: string;
  adventure: Adventure;
  startDate: string;
  endDate: string;
  notes: string;
};

function generateId() { return Math.random().toString(36).slice(2, 9); }

const LS_KEY = "ttt_trip_plan";
function lsLoad(): PlanEntry[] {
  try { const r = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null; return r ? JSON.parse(r) : []; } catch { return []; }
}
function lsSave(e: PlanEntry[]) { try { localStorage.setItem(LS_KEY, JSON.stringify(e)); } catch {} }

export default function PlannerPage() {
  const [entries, setEntries] = useState<PlanEntry[]>(() => lsLoad());
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const filtered = search.trim().length > 1
    ? adventures.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.state.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 12)
    : [];

  function addAdventure(a: Adventure) {
    const today = new Date().toISOString().slice(0, 10);
    const entry: PlanEntry = { id: generateId(), adventure: a, startDate: today, endDate: today, notes: "" };
    const next = [...entries, entry];
    setEntries(next); lsSave(next);
    setSearch("");
    setEditingId(entry.id);
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
    const diff = Math.max(0, (new Date(e.endDate).getTime() - new Date(e.startDate).getTime()) / 86400000) + 1;
    return sum + diff;
  }, 0);

  const editing = entries.find(e => e.id === editingId);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-page)" }}>
      <Navbar />

      <div className="pt-16 lg:pt-20 flex flex-1">
        {/* Sidebar — adventure search */}
        <aside
          className="w-80 shrink-0 border-r flex flex-col"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)", height: "calc(100vh - 5rem)", position: "sticky", top: "5rem" }}
        >
          <div className="p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-[#ff5100]" />
              <h2 className="text-white font-semibold text-sm">Add Adventures</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search adventures to add..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-[#ff5100]/50 transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-white/30" /></button>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {search.trim().length < 2 ? (
              <div className="p-4 text-center">
                <p className="text-white/25 text-xs">Type to search adventures</p>
                {entries.length === 0 && (
                  <div className="mt-6 text-center">
                    <div className="text-3xl mb-2">🗓️</div>
                    <p className="text-white/30 text-xs leading-relaxed">Search for adventures<br />and build your itinerary</p>
                  </div>
                )}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-white/25 text-xs text-center py-6">No results found</p>
            ) : (
              filtered.map(a => {
                const already = entries.some(e => e.adventure.id === a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => !already && addAdventure(a)}
                    disabled={already}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left mb-1 disabled:opacity-40"
                    style={{ background: "transparent" }}
                    onMouseEnter={e => { if (!already) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
                      <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium leading-snug line-clamp-1">{a.name}</p>
                      <p className="text-white/35 text-[10px] mt-0.5">{a.type} · {a.state}</p>
                    </div>
                    {already ? (
                      <span className="text-emerald-400 text-[10px] font-medium shrink-0">Added</span>
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Main planner area */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <div>
              <h1 className="text-white font-bold text-xl">Trip Planner</h1>
              {entries.length > 0 && (
                <p className="text-white/35 text-xs mt-0.5">{entries.length} adventure{entries.length !== 1 ? "s" : ""} · ~{totalDays} day{totalDays !== 1 ? "s" : ""} total</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {entries.length > 0 && (
                <>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <Printer className="w-4 h-4" />
                    Print / Export
                  </button>
                  <button
                    onClick={() => { setEntries([]); lsSave([]); setEditingId(null); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:text-red-400"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Empty state */}
          {entries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="text-6xl mb-5">🏔️</div>
              <h2 className="text-white text-2xl font-bold mb-2">Your itinerary is empty</h2>
              <p className="text-white/35 text-sm max-w-xs leading-relaxed">Search for adventures in the sidebar to start building your trip.</p>
            </div>
          ) : (
            <div className="flex flex-1 min-h-0">
              {/* Timeline */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3" ref={printRef}>
                {entries.map((entry, idx) => {
                  const a = entry.adventure;
                  const isEditing = editingId === entry.id;
                  const days = entry.startDate && entry.endDate
                    ? Math.max(1, Math.round((new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime()) / 86400000) + 1)
                    : null;
                  return (
                    <div
                      key={entry.id}
                      className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
                      style={{
                        border: isEditing ? "1px solid rgba(255,81,0,0.4)" : "1px solid rgba(255,255,255,0.08)",
                        background: isEditing ? "rgba(255,81,0,0.05)" : "rgba(255,255,255,0.03)",
                        boxShadow: isEditing ? "0 0 0 1px rgba(255,81,0,0.15)" : "none",
                      }}
                      onClick={() => setEditingId(isEditing ? null : entry.id)}
                    >
                      <div className="flex items-center gap-3 p-4">
                        <span className="text-white/20 text-xs font-mono w-5 text-center shrink-0">{idx + 1}</span>
                        <GripVertical className="w-3.5 h-3.5 text-white/15 shrink-0" />
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0">
                          <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1">{a.name}</h3>
                            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,81,0,0.12)", color: "#ff7d47" }}>
                              {a.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-[10px] text-white/35">
                              {ADVENTURE_TYPE_ICONS[a.type]?.(10)}
                              {a.type}
                            </span>
                            <span className="text-white/15 text-[10px]">·</span>
                            <span className="flex items-center gap-1 text-[10px] text-white/35">
                              <MapPin className="w-2.5 h-2.5" />{a.state}
                            </span>
                            {days && (
                              <>
                                <span className="text-white/15 text-[10px]">·</span>
                                <span className="flex items-center gap-1 text-[10px] text-white/35">
                                  <Clock className="w-2.5 h-2.5" />{days}d
                                </span>
                              </>
                            )}
                          </div>
                          {entry.startDate && (
                            <p className="text-[10px] text-[#ff5100]/60 mt-0.5 font-medium">
                              {new Date(entry.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              {entry.endDate && entry.endDate !== entry.startDate && ` → ${new Date(entry.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            href={`/experiences/${a.slug}`}
                            onClick={e => e.stopPropagation()}
                            className="text-[10px] text-white/25 hover:text-[#ff5100] transition-colors px-2"
                          >
                            View
                          </Link>
                          <button
                            onClick={e => { e.stopPropagation(); removeEntry(entry.id); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-500/15 hover:text-red-400 text-white/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded editor */}
                      {isEditing && (
                        <div className="px-4 pb-4 pt-0 border-t border-white/8" onClick={e => e.stopPropagation()}>
                          <div className="grid grid-cols-2 gap-3 mt-3 mb-3">
                            <div>
                              <label className="text-[10px] text-white/35 uppercase tracking-wider font-medium mb-1 block">Start Date</label>
                              <input
                                type="date"
                                value={entry.startDate}
                                onChange={e => updateEntry(entry.id, { startDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                                style={{ background: "rgba(255,255,255,0.06)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-white/35 uppercase tracking-wider font-medium mb-1 block">End Date</label>
                              <input
                                type="date"
                                value={entry.endDate}
                                min={entry.startDate}
                                onChange={e => updateEntry(entry.id, { endDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                                style={{ background: "rgba(255,255,255,0.06)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-white/35 uppercase tracking-wider font-medium mb-1 block">Notes</label>
                            <textarea
                              value={entry.notes}
                              onChange={e => updateEntry(entry.id, { notes: e.target.value })}
                              placeholder="Packing list, operator contact, travel notes..."
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none"
                              style={{ background: "rgba(255,255,255,0.06)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary panel */}
              <div className="w-64 shrink-0 border-l overflow-y-auto p-5" style={{ borderColor: "var(--border-subtle)" }}>
                <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.15)" }}>
                    <p className="text-[#ff5100] text-2xl font-bold">{entries.length}</p>
                    <p className="text-white/40 text-[11px] mt-0.5">Adventures</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-white text-2xl font-bold">~{totalDays}</p>
                    <p className="text-white/40 text-[11px] mt-0.5">Total Days</p>
                  </div>
                  {/* Unique states */}
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-white text-2xl font-bold">{new Set(entries.map(e => e.adventure.state)).size}</p>
                    <p className="text-white/40 text-[11px] mt-0.5">States / UTs</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider font-medium mb-2">Regions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set(entries.map(e => e.adventure.region))].map(r => (
                      <span key={r} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>{r}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider font-medium mb-2">Difficulty Mix</p>
                  <div className="space-y-1.5">
                    {["Easy","Moderate","Hard","Advanced","Extreme"].map(d => {
                      const count = entries.filter(e => e.adventure.difficulty === d).length;
                      if (count === 0) return null;
                      return (
                        <div key={d} className="flex items-center justify-between">
                          <span className="text-[10px] text-white/40">{d}</span>
                          <span className="text-[10px] text-white/60 font-semibold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => window.print()}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ background: "#ff5100", color: "white", boxShadow: "0 4px 14px rgba(255,81,0,0.3)" }}
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

      {/* Print styles */}
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
