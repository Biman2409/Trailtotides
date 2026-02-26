"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { adventures, regions } from "@/lib/data";
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Users,
  TrendingUp,
  MapPin,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { AdventureType, Region, Difficulty, Month } from "@/lib/data";

const MONTHS: Month[] = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DIFFICULTIES: Difficulty[] = ["Beginner","Intermediate","Advanced","Expert","Extreme"];
const GROUP_SIZES = ["Solo","Pair","Small group (3–6)","Large group (7+)"];
const BUDGETS = ["Under ₹10,000","₹10,000 – ₹25,000","₹25,000 – ₹50,000","₹50,000 – ₹1,00,000","Above ₹1,00,000"];
const TYPES: AdventureType[] = ["Trekking","Biking","Cycling","Mountaineering","Rock Climbing","Diving","Kayaking","Skiing","Jeep Safari","Camel Safari","Caving","Sandboarding","Urban Adventure"];

type Step = "preferences" | "results";

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

export default function PlanPage() {
  const [step, setStep] = useState<Step>("preferences");
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<AdventureType[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<Month[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<string>("");

  const matched = adventures.filter((a) => {
    if (selectedRegions.length && !selectedRegions.includes(a.region)) return false;
    if (selectedTypes.length && !selectedTypes.includes(a.type)) return false;
    if (selectedMonths.length && !selectedMonths.some((m) => a.bestMonths.includes(m))) return false;
    if (selectedDifficulties.length && !selectedDifficulties.includes(a.difficulty)) return false;
    return true;
  });

  function handlePlan() {
    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeCount =
    selectedRegions.length +
    selectedTypes.length +
    selectedMonths.length +
    selectedDifficulties.length +
    (selectedGroup ? 1 : 0) +
    (selectedBudget ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#1a1f2e] pt-28 pb-14 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#f4845f] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Adventure Planner
          </p>
          <h1 className="text-white text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Plan Your Adventure
          </h1>
          <p className="text-white/45 text-lg max-w-xl">
            Tell us when you want to go, what you like, and how hard you want it — we&apos;ll match you with the right adventures.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        {step === "preferences" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Filters */}
            <div className="lg:col-span-2 space-y-10">

              {/* When */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Calendar className="w-5 h-5 text-[#f4845f]" />
                  <h2 className="text-[#1a1f2e] text-xl font-bold">When are you going?</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MONTHS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMonths(toggle(selectedMonths, m))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedMonths.includes(m)
                          ? "bg-[#1e3d2f] text-white border-[#1e3d2f]"
                          : "bg-white border-[#e0d8cc] text-[#1a1f2e] hover:border-[#1e3d2f]/40"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </section>

              {/* Where */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="w-5 h-5 text-[#f4845f]" />
                  <h2 className="text-[#1a1f2e] text-xl font-bold">Where in India?</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {regions.map((r) => (
                    <button
                      key={r.name}
                      onClick={() => setSelectedRegions(toggle(selectedRegions, r.name as Region))}
                      className={`relative overflow-hidden rounded-xl h-20 border-2 transition-all ${
                        selectedRegions.includes(r.name as Region)
                          ? "border-[#f4845f] shadow-lg shadow-[#f4845f]/20"
                          : "border-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.image} alt={r.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/55" />
                      {selectedRegions.includes(r.name as Region) && (
                        <div className="absolute inset-0 bg-[#f4845f]/30" />
                      )}
                      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-0.5">
                        <span className="text-white font-semibold text-xs leading-tight text-center px-1">{r.name}</span>
                        {selectedRegions.includes(r.name as Region) && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#f69d7c]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* What kind */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-5 h-5 text-[#f4845f]" />
                  <h2 className="text-[#1a1f2e] text-xl font-bold">What kind of adventure?</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTypes(toggle(selectedTypes, t))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedTypes.includes(t)
                          ? "bg-[#f4845f] text-white border-[#f4845f]"
                          : "bg-white border-[#e0d8cc] text-[#1a1f2e] hover:border-[#f4845f]/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </section>

              {/* How hard */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-5 h-5 text-[#f4845f]" />
                  <h2 className="text-[#1a1f2e] text-xl font-bold">How hard?</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {([
                      { val: "Beginner" as Difficulty,     color: "bg-emerald-500 text-white border-emerald-500",   idle: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                      { val: "Intermediate" as Difficulty, color: "bg-teal-500 text-white border-teal-500",          idle: "bg-teal-50 text-teal-800 border-teal-200" },
                      { val: "Advanced" as Difficulty,     color: "bg-[#f69d7c] text-white border-[#f69d7c]",        idle: "bg-[#f69d7c]/5 text-[#9c4a2f] border-[#f69d7c]/20" },
                      { val: "Expert" as Difficulty,       color: "bg-[#f4845f] text-white border-[#f4845f]",      idle: "bg-[#f4845f]/5 text-[#9c4a2f] border-[#f4845f]/20" },
                      { val: "Extreme" as Difficulty,      color: "bg-red-500 text-white border-red-500",            idle: "bg-red-50 text-red-800 border-red-200" },
                    ]).map(({ val, color, idle }) => (

                    <button
                      key={val}
                      onClick={() => setSelectedDifficulties(toggle(selectedDifficulties, val))}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedDifficulties.includes(val) ? color : idle}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </section>

              {/* Group size */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Users className="w-5 h-5 text-[#f4845f]" />
                  <h2 className="text-[#1a1f2e] text-xl font-bold">Group size</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GROUP_SIZES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGroup(selectedGroup === g ? "" : g)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedGroup === g
                          ? "bg-[#1a1f2e] text-white border-[#1a1f2e]"
                          : "bg-white border-[#e0d8cc] text-[#1a1f2e] hover:border-[#1a1f2e]/40"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </section>

              {/* Budget */}
              <section>
                <h2 className="text-[#1a1f2e] text-xl font-bold mb-5">Budget per person</h2>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBudget(selectedBudget === b ? "" : b)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedBudget === b
                          ? "bg-[#1e3d2f] text-white border-[#1e3d2f]"
                          : "bg-white border-[#e0d8cc] text-[#1a1f2e] hover:border-[#1e3d2f]/40"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </section>

              <button
                onClick={handlePlan}
                className="w-full bg-[#f4845f] hover:bg-[#f69d7c] text-white font-semibold py-4 rounded-xl text-base flex items-center justify-center gap-2 group transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#f4845f]/25"
              >
                {activeCount > 0 ? `Find Matching Adventures` : "Show All Adventures"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Sidebar tip */}
            <div className="hidden lg:block">
              <div className="sticky top-28 space-y-5">
                <div className="bg-[#1a1f2e] rounded-2xl p-6">
                  <p className="text-[#f4845f] text-xs font-semibold tracking-widest uppercase mb-4">Tips</p>
                  <ul className="space-y-4">
                    {[
                      "Select only what matters most — fewer filters often yield better results.",
                      "March–June and Sep–Nov are the best all-round adventure windows in India.",
                      "Himalayan passes are typically closed Nov–May. Check before planning.",
                      "If you're a first-timer, pick Beginner or Intermediate difficulty.",
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <ChevronRight className="w-4 h-4 text-[#f4845f] shrink-0 mt-0.5" />
                        <span className="text-white/55 text-sm leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#f4845f]/10 border border-[#f4845f]/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#f4845f]" />
                    <span className="text-[#f4845f] text-xs font-semibold uppercase tracking-wider">AI Finder</span>
                  </div>
                  <p className="text-white/55 text-sm leading-relaxed mb-3">
                    Prefer to just describe what you want? Use Compass AI on the home page.
                  </p>
                  <Link href="/#ai-finder" className="text-[#f4845f] text-xs font-semibold hover:text-[#f69d7c] transition-colors flex items-center gap-1">
                    Try Compass AI <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "results" && (
          <div>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-[#1a1f2e] text-3xl font-bold">
                  {matched.length === 0 ? "No exact matches" : `${matched.length} adventure${matched.length !== 1 ? "s" : ""} found`}
                </h2>
                <p className="text-[#9a9590] mt-1 text-sm">
                  {activeCount > 0 ? "Based on your preferences" : "All adventures"}
                </p>
              </div>
              <button
                onClick={() => setStep("preferences")}
                className="flex items-center gap-2 bg-[#f5f0e8] hover:bg-[#e8dfc8] text-[#1a1f2e] font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Adjust Filters
              </button>
            </div>

            {matched.length === 0 ? (
              <div className="text-center py-28">
                <div className="text-6xl mb-5">🗺️</div>
                <h3 className="text-[#1a1f2e] text-2xl font-bold mb-2">No exact matches</h3>
                <p className="text-[#9a9590] mb-7 max-w-xs mx-auto leading-relaxed">
                  Try fewer filters or explore all adventures below.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setStep("preferences")}
                    className="bg-[#1e3d2f] text-white px-7 py-3 rounded-xl text-sm font-semibold hover:bg-[#2d5a42] transition-colors"
                  >
                    Adjust Filters
                  </button>
                  <Link
                    href="/explore"
                    className="bg-[#f5f0e8] text-[#1a1f2e] px-7 py-3 rounded-xl text-sm font-semibold hover:bg-[#e8dfc8] transition-colors"
                  >
                    Explore All
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matched.map((a) => (
                  <Link key={a.id} href={`/experiences/${a.slug}`} className="group block">
                    <div className="relative h-[300px] overflow-hidden rounded-2xl bg-[#1a1f2e] shadow-md hover:shadow-xl hover:shadow-black/20 transition-shadow duration-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.heroImage}
                        alt={a.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-transparent" />
                      <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                        <span className="bg-[#f4845f] text-white text-xs font-semibold px-3 py-1.5 rounded-full">{a.type}</span>
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                          a.difficulty === "Beginner" ? "bg-emerald-500 text-white" :
                          a.difficulty === "Intermediate" ? "bg-teal-500 text-white" :
                          a.difficulty === "Advanced" ? "bg-amber-500 text-white" :
                          a.difficulty === "Expert" ? "bg-[#f4845f] text-white" :
                          "bg-red-500 text-white"
                        }`}>{a.difficulty}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#f4845f]" />
                          <span className="text-white/55 text-xs">{a.state}</span>
                        </div>
                        <h3 className="text-white font-semibold text-lg leading-snug mb-1">{a.name}</h3>
                        <p className="text-white/65 text-sm line-clamp-2 mb-3">{a.tagline}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/45 text-xs">{a.durationDays} · {a.bestSeason}</span>
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#f4845f] transition-colors">
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {matched.length > 0 && (
              <div className="mt-12 text-center">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 text-[#f4845f] font-semibold text-sm hover:text-[#f69d7c] transition-colors group"
                >
                  Browse all {adventures.length} adventures
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
