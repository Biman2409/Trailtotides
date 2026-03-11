"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, MapPin, ArrowRight, RotateCcw } from "lucide-react";
import { adventures } from "@/lib/data";
import { getERT } from "@/lib/ert";
import {
  computeUserProfile,
  getMatchedAdventures,
  saveProfile,
  type MatchmakerAnswers,
} from "@/lib/matchmaker";
import ERTBadge from "@/components/ui/custom/ERTBadge";

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = ["cardio", "load", "altitude", "terrain", "bio"] as const;
type Step = typeof STEPS[number];

type Answers = Partial<MatchmakerAnswers>;

// ─── Option button ────────────────────────────────────────────────────────────

function OptionBtn({
  value, label, sub, selected, onClick,
}: { value: string; label: string; sub?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-2xl border transition-all duration-150"
      style={{
        background: selected ? "rgba(255,81,0,0.12)" : "rgba(255,255,255,0.04)",
        borderColor: selected ? "#ff5100" : "rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ borderColor: selected ? "#ff5100" : "rgba(255,255,255,0.2)", color: selected ? "#ff5100" : "rgba(255,255,255,0.4)", background: selected ? "rgba(255,81,0,0.15)" : "transparent" }}
        >
          {value}
        </span>
        <div>
          <p className="text-white font-medium text-sm">{label}</p>
          {sub && <p className="text-white/40 text-xs mt-0.5">{sub}</p>}
        </div>
      </div>
    </button>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{ background: i < step ? "#ff5100" : "rgba(255,255,255,0.1)" }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MatchmakerClient() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  const currentStep = STEPS[stepIndex];

  function set<K extends keyof Answers>(key: K, val: Answers[K]) {
    setAnswers(prev => ({ ...prev, [key]: val }));
  }

  function canAdvance(): boolean {
    if (currentStep === "cardio") return !!answers.cardio;
    if (currentStep === "load") return !!answers.load;
    if (currentStep === "altitude") return !!answers.altitude;
    if (currentStep === "terrain") return !!answers.terrain;
    if (currentStep === "bio") return !!(answers.age && answers.weight && answers.height);
    return false;
  }

  function advance() {
    if (!canAdvance()) return;
    if (stepIndex < STEPS.length - 1) { setStepIndex(i => i + 1); return; }
    // Final step — compute and save
    const full = answers as MatchmakerAnswers;
    const profile = computeUserProfile(full);
    saveProfile({ ert: profile.ert, label: profile.label, summary: profile.summary, answers: full });
    setDone(true);
  }

  if (done) return <ResultsScreen answers={answers as MatchmakerAnswers} />;

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Adventure Matchmaker</p>
        <h1 className="text-white text-3xl font-bold tracking-tight leading-snug">
          Meet your mountain.
        </h1>
        <p className="text-white/40 text-sm mt-2">5 quick questions. Brutally honest results.</p>
      </div>

      <ProgressBar step={stepIndex} total={STEPS.length} />

      {/* Step content */}
      <div className="space-y-3">
        {currentStep === "cardio" && (
          <>
            <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">The Engine — Cardio</p>
            <h2 className="text-white text-xl font-semibold mb-5">If you had to run 5 km today, how would it go?</h2>
            {[
              { v: "A", l: "Under 25 minutes, comfortably" },
              { v: "B", l: "25–32 minutes with some effort" },
              { v: "C", l: "32–40 minutes with walking breaks" },
              { v: "D", l: "Over 40 minutes, or unable to run" },
            ].map(o => (
              <OptionBtn key={o.v} value={o.v} label={o.l} selected={answers.cardio === o.v} onClick={() => set("cardio", o.v as "A")} />
            ))}
          </>
        )}

        {currentStep === "load" && (
          <>
            <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">The Load — Strength</p>
            <h2 className="text-white text-xl font-semibold mb-5">Have you hiked with a 10–12 kg backpack before?</h2>
            {[
              { v: "A", l: "Yes — on multi-day treks", s: "5+ days carrying full pack" },
              { v: "B", l: "Yes — on day hikes", s: "Short trips only" },
              { v: "C", l: "Only light daypacks", s: "Under 5 kg" },
              { v: "D", l: "Never carried a backpack", s: "I'm starting from scratch" },
            ].map(o => (
              <OptionBtn key={o.v} value={o.v} label={o.l} sub={o.s} selected={answers.load === o.v} onClick={() => set("load", o.v as "A")} />
            ))}
          </>
        )}

        {currentStep === "altitude" && (
          <>
            <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">The Altitude Resume</p>
            <h2 className="text-white text-xl font-semibold mb-5">What is the highest altitude where you have slept?</h2>
            {[
              { v: "A", l: "Below 2,000 m", s: "Sea level to foothills" },
              { v: "B", l: "2,000 – 3,500 m", s: "Lower Himalayan treks" },
              { v: "C", l: "3,500 – 4,500 m", s: "High passes and base camps" },
              { v: "D", l: "Above 4,500 m", s: "Expedition territory" },
            ].map(o => (
              <OptionBtn key={o.v} value={o.v} label={o.l} sub={o.s} selected={answers.altitude === o.v} onClick={() => set("altitude", o.v as "A")} />
            ))}
          </>
        )}

        {currentStep === "terrain" && (
          <>
            <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">The Terrain Comfort</p>
            <h2 className="text-white text-xl font-semibold mb-5">How comfortable are you with technical terrain?</h2>
            {[
              { v: "A", l: "Walking trails only", s: "Flat to moderate incline" },
              { v: "B", l: "Steep, uneven trails are fine", s: "Rocky paths and loose scree" },
              { v: "C", l: "Scrambling is comfortable", s: "Using hands for balance on exposed sections" },
              { v: "D", l: "Comfortable with snow and ice traction", s: "Microspikes or crampons" },
              { v: "E", l: "Full mountaineering gear", s: "Ice axe, ropes, crevasse terrain" },
            ].map(o => (
              <OptionBtn key={o.v} value={o.v} label={o.l} sub={o.s} selected={answers.terrain === o.v} onClick={() => set("terrain", o.v as "A")} />
            ))}
          </>
        )}

        {currentStep === "bio" && (
          <>
            <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">The Chassis Check</p>
            <h2 className="text-white text-xl font-semibold mb-5">A few quick numbers for joint load assessment.</h2>
            <div className="space-y-4">
              {[
                { key: "age" as const, label: "Age", placeholder: "e.g. 34", unit: "yrs" },
                { key: "weight" as const, label: "Weight", placeholder: "e.g. 72", unit: "kg" },
                { key: "height" as const, label: "Height", placeholder: "e.g. 175", unit: "cm" },
              ].map(f => (
                <div key={f.key} className="flex items-center gap-3 rounded-2xl border px-5 py-3" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <label className="text-white/40 text-xs uppercase tracking-widest w-16 shrink-0">{f.label}</label>
                  <input
                    type="number"
                    placeholder={f.placeholder}
                    value={answers[f.key] ?? ""}
                    onChange={e => set(f.key, e.target.value ? Number(e.target.value) : undefined as unknown as number)}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                  />
                  <span className="text-white/25 text-xs">{f.unit}</span>
                </div>
              ))}
              <div className="rounded-2xl border px-5 py-3" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
                <label className="text-white/40 text-xs uppercase tracking-widest block mb-1.5">Past Injuries <span className="normal-case text-white/20">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. knee surgery 2022, ankle sprain"
                  value={answers.injuries ?? ""}
                  onChange={e => set("injuries", e.target.value || undefined)}
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => setStepIndex(i => Math.max(0, i - 1))}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-sm"
          disabled={stepIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={advance}
          disabled={!canAdvance()}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all"
          style={{
            background: canAdvance() ? "#ff5100" : "rgba(255,255,255,0.08)",
            color: canAdvance() ? "white" : "rgba(255,255,255,0.2)",
          }}
        >
          {stepIndex === STEPS.length - 1 ? "Find my adventures" : "Continue"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({ answers }: { answers: MatchmakerAnswers }) {
  const profile = computeUserProfile(answers);
  const matches = getMatchedAdventures(profile.ert, adventures);
  const [overrideSlug, setOverrideSlug] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      {/* Profile card */}
      <div className="mb-12">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Your Adventure Profile</p>
        <h1 className="text-white text-4xl font-bold tracking-tight mb-2">{profile.label}</h1>

        <div className="mt-6 rounded-2xl p-6 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Your ERT Comfort Limit</p>
          <ERTBadge ert={profile.ert} size="md" dark />
          <p className="text-white/60 text-sm leading-relaxed mt-4">{profile.summary}</p>

          {profile.limitReasons.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {profile.limitReasons.map((r, i) => (
                <p key={i} className="text-white/35 text-xs flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 shrink-0">•</span>{r}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Matched adventures */}
      <div className="mb-12">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Adventures For You</p>
        <h2 className="text-white text-2xl font-bold mb-6">Within your comfort range</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {matches.length === 0 ? (
            <p className="text-white/40 text-sm col-span-2">No adventures matched — try exploring all adventures and filtering by ERT.</p>
          ) : matches.map(a => {
            const ert = getERT(a);
            return (
              <Link
                key={a.slug}
                href={`/experiences/${a.slug}`}
                className="group rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-xl duration-300"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
              >
                <div className="relative h-40 overflow-hidden">
                  <Image src={a.heroImage} alt={a.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-[#ff5100]" />
                      <span className="text-white/60 text-[10px]">{a.state}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm leading-tight">{a.name}</h3>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <ERTBadge ert={ert} size="sm" dark />
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-[#ff5100] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <Link
          href="/explore"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#ff5100] text-white font-semibold text-sm"
        >
          Explore all adventures
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          onClick={() => { if (typeof window !== "undefined") { localStorage.removeItem("ttt_matchmaker_profile"); window.location.reload(); } }}
          className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 text-white/50 text-sm hover:text-white/80 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retake
        </button>
      </div>
    </div>
  );
}
