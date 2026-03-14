"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight, ChevronLeft, MapPin, ArrowRight, RotateCcw,
  Zap, Shield, Mountain, CheckCircle2, TrendingUp, Lock,
  Compass, Dumbbell, Waves, Wind, Brain, Target, Flame,
  AlertTriangle, Loader2,
} from "lucide-react";
import ACEBadge from "@/components/ui/custom/ACEBadge";
import ACERadar from "@/components/ui/custom/ACERadar";
import { saveProfile, loadProfile, clearProfile, saveProfileToServer, loadProfileFromServer } from "@/lib/matchmaker";
import { adventures as ALL_ADVENTURES } from "@/lib/data";
import { getACE } from "@/lib/ace";

// ─── Question definitions (Q1–Q8 map to 8 bio axes) ──────────────────────────

const QUESTIONS = [
  {
    key: "Q1",
    axis: "Stamina",
    icon: <Flame className="w-4 h-4" />,
    question: "How long can you keep moving before you need to rest?",
    hint: "Think of a hike or any steady physical activity.",
    options: [
      { v: "A", l: "Less than 30 minutes" },
      { v: "B", l: "About an hour at a relaxed pace" },
      { v: "C", l: "A few hours with short breaks" },
      { v: "D", l: "Half a day on tough terrain" },
      { v: "E", l: "Full day, every day — that's normal for me" },
    ],
  },
  {
    key: "Q2",
    axis: "Power",
    icon: <Zap className="w-4 h-4" />,
    question: "How do you handle short, intense bursts of effort?",
    hint: "Like sprinting up a steep section or pushing through a strong current.",
    options: [
      { v: "A", l: "I gas out almost immediately" },
      { v: "B", l: "I can do it but recover slowly" },
      { v: "C", l: "Comfortable with short hard efforts" },
      { v: "D", l: "I train for this — sprints and power work" },
      { v: "E", l: "Explosive effort is a strength of mine" },
    ],
  },
  {
    key: "Q3",
    axis: "Strength",
    icon: <Dumbbell className="w-4 h-4" />,
    question: "How comfortable are you carrying a loaded pack for hours?",
    hint: "Think of a multi-day trek with a backpack.",
    options: [
      { v: "A", l: "Light day bag only — under 5 kg" },
      { v: "B", l: "Up to 8 kg for a day" },
      { v: "C", l: "10–12 kg across multiple days" },
      { v: "D", l: "12–15 kg is fine for me" },
      { v: "E", l: "15 kg+ — I train with heavy loads regularly" },
    ],
  },
  {
    key: "Q4",
    axis: "Agility",
    icon: <Compass className="w-4 h-4" />,
    question: "What terrain are you comfortable moving through?",
    hint: "Be honest — this affects your safety.",
    options: [
      { v: "A", l: "Flat paths and easy walking trails" },
      { v: "B", l: "Uneven paths with some rocks and roots" },
      { v: "C", l: "Steep rocky trails and basic river crossings" },
      { v: "D", l: "Scrambling, ridge walks, exposed terrain" },
      { v: "E", l: "Snow, ice, ropes — technical mountain terrain" },
    ],
  },
  {
    key: "Q5",
    axis: "Water",
    icon: <Waves className="w-4 h-4" />,
    question: "How confident are you in water?",
    hint: "Open water, rivers, sea — not just a pool.",
    options: [
      { v: "A", l: "I don't swim" },
      { v: "B", l: "I can swim in a calm pool" },
      { v: "C", l: "Comfortable in open water" },
      { v: "D", l: "Strong swimmer — rivers and sea are fine" },
      { v: "E", l: "Certified diver or lifeguard-level swimmer" },
    ],
  },
  {
    key: "Q6",
    axis: "Altitude",
    icon: <Mountain className="w-4 h-4" />,
    question: "What's the highest you've slept overnight?",
    hint: "Sleeping altitude is what counts — not just passing through.",
    options: [
      { v: "A", l: "Sea level — I've never been above 1,500m" },
      { v: "B", l: "Up to 2,500m with no issues" },
      { v: "C", l: "Around 3,000m — felt some effects" },
      { v: "D", l: "3,500–4,500m — high passes and base camps" },
      { v: "E", l: "Above 4,500m — expedition-level altitude" },
    ],
  },
  {
    key: "Q7",
    axis: "Nerve",
    icon: <Shield className="w-4 h-4" />,
    question: "How do you react to exposure and fear-inducing situations?",
    hint: "Think cliff edges, fast water, tight spaces, steep drop-offs.",
    options: [
      { v: "A", l: "Heights or exposure really unsettle me" },
      { v: "B", l: "I can manage but it takes real effort" },
      { v: "C", l: "I get nerves but push through fine" },
      { v: "D", l: "I stay calm and think clearly under pressure" },
      { v: "E", l: "Exposure doesn't affect me — I thrive in it" },
    ],
  },
  {
    key: "Q8",
    axis: "Focus",
    icon: <Brain className="w-4 h-4" />,
    question: "How well do you stay sharp over a long, demanding day?",
    hint: "Making good decisions when tired, navigating carefully, staying aware.",
    options: [
      { v: "A", l: "Fatigue or stress quickly affects my thinking" },
      { v: "B", l: "I can hold it together for a few hours" },
      { v: "C", l: "Sharp for a full day with effort" },
      { v: "D", l: "I stay focused even when physically exhausted" },
      { v: "E", l: "Multi-day high-stakes focus is where I'm best" },
    ],
  },
];

type Answers = Partial<Record<string, string>>;

// ─── Axis colour map ──────────────────────────────────────────────────────────

const AXIS_COLORS: Record<string, string> = {
  stamina: "#f97316",
  power:   "#eab308",
  strength:"#84cc16",
  agility: "#22d3ee",
  water:   "#3b82f6",
  altitude:"#a78bfa",
  nerve:   "#f43f5e",
  focus:   "#10b981",
};

const AXIS_ICONS: Record<string, React.ReactNode> = {
  stamina:  <Flame    className="w-3.5 h-3.5" />,
  power:    <Zap      className="w-3.5 h-3.5" />,
  strength: <Dumbbell className="w-3.5 h-3.5" />,
  agility:  <Compass  className="w-3.5 h-3.5" />,
  water:    <Waves    className="w-3.5 h-3.5" />,
  altitude: <Mountain className="w-3.5 h-3.5" />,
  nerve:    <Shield   className="w-3.5 h-3.5" />,
  focus:    <Brain    className="w-3.5 h-3.5" />,
};

// ─── Types from API ───────────────────────────────────────────────────────────

interface AnalysisResult {
  userAxes: Record<string, number>;
  adventures: EnrichedAdventure[];
  trainingPlan: TrainingItem[];
}

interface EnrichedAdventure {
  id: string;
  slug: string;
  name: string;
  heroImage: string;
  state: string;
  region: string;
  type: string;
  difficulty: string;
  altitude?: string;
  status: "IN_ZONE" | "STRETCH" | "RESTRICTED";
  weakAxes: string[];
  missingKeys: string[];
  analysis: string;
  requirements: Record<string, number> | null;
  riskLevel: number | null;
}

interface TrainingItem {
  axis: string;
  current_level: number;
  required_level: number;
  recommendation: string;
}

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
          style={{
            borderColor: selected ? "#ff5100" : "rgba(255,255,255,0.2)",
            color: selected ? "#ff5100" : "rgba(255,255,255,0.4)",
            background: selected ? "rgba(255,81,0,0.15)" : "transparent",
          }}
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

// ─── Axis bar ─────────────────────────────────────────────────────────────────

function AxisBar({ axis, value, max = 5 }: { axis: string; value: number; max?: number }) {
  const color = AXIS_COLORS[axis] ?? "#ff5100";
  const icon = AXIS_ICONS[axis];
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 flex items-center gap-1.5 shrink-0">
        <span style={{ color }} className="opacity-70">{icon}</span>
        <span className="text-white/50 text-[11px] uppercase tracking-wide capitalize">{axis}</span>
      </div>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <span className="text-white/60 text-xs w-4 text-right font-mono">{value}</span>
    </div>
  );
}

// ─── Intro screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart, onViewResults, hasProfile }: { onStart: () => void; onViewResults: () => void; hasProfile: boolean }) {
  const pillars = [
    { icon: <Flame className="w-5 h-5" />,    name: "Engine",   color: "#f97316", desc: "Stamina + Power — sustained output and explosive effort. The fuel that keeps you moving." },
    { icon: <Dumbbell className="w-5 h-5" />, name: "Chassis",  color: "#22d3ee", desc: "Strength + Agility — load-bearing capacity and terrain navigation. How your body handles the ground." },
    { icon: <Waves className="w-5 h-5" />,    name: "Elements", color: "#a78bfa", desc: "Water + Altitude — aquatic survival and high-altitude physiology. Environmental exposure demands." },
    { icon: <Brain className="w-5 h-5" />,    name: "Mind",     color: "#10b981", desc: "Nerve + Focus — psychological exposure tolerance and sustained situational awareness." },
  ];

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Adventure Matchmaker</p>
      <h1 className="text-white text-4xl font-bold tracking-tight leading-tight mb-3">
        Adventures built for your body
      </h1>
      <p className="text-white/50 text-base leading-relaxed mb-8">
        Every adventure makes specific demands on your body. ACE breaks those demands into eight axes — Stamina, Power, Strength, Agility, Water, Altitude, Nerve and Focus — so you know exactly what you&apos;re signing up for.
      </p>

      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-4">How we assess you</p>
      <div className="space-y-3 mb-10">
        {pillars.map(p => (
          <div
            key={p.name}
            className="flex items-start gap-4 rounded-2xl px-5 py-4 border"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${p.color}18`, color: p.color }}
            >
              {p.icon}
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-0.5">{p.name}</p>
              <p className="text-white/45 text-xs leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/ace"
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold text-sm text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all mb-3"
      >
        Learn more about ACE
      </Link>
      {hasProfile && (
        <button
          onClick={onViewResults}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold text-sm text-white transition-all hover:brightness-110 mb-3"
          style={{ background: "#ff5100" }}
        >
          View My Results
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={onStart}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold text-sm transition-all hover:brightness-110"
        style={hasProfile
          ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }
          : { background: "#ff5100", color: "#fff" }
        }
      >
        {hasProfile ? <><RotateCcw className="w-4 h-4" />Retake Assessment</> : <><ChevronRight className="w-4 h-4" />Begin Assessment</>}
      </button>
      <p className="text-white/20 text-xs text-center mt-3">8 questions · takes about 3 minutes</p>
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  const steps = [
    "Mapping your ACE profile…",
    "Analysing adventure requirements across 8 axes…",
    "Running matchmaker engine…",
    "Building your training plan…",
  ];
  const [step, setStep] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setStep(s => (s < steps.length - 1 ? s + 1 : s));
    }, 2200);
    return () => clearInterval(interval);
  });

  return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#ff5100]/15 flex items-center justify-center mx-auto mb-8">
        <Loader2 className="w-8 h-8 text-[#ff5100] animate-spin" />
      </div>
      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Analysing</p>
      <h2 className="text-white text-2xl font-bold mb-8">Running your assessment</h2>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all"
            style={{
              background: i <= step ? "rgba(255,81,0,0.08)" : "rgba(255,255,255,0.02)",
              borderColor: i <= step ? "rgba(255,81,0,0.25)" : "rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: i < step ? "#ff5100" : i === step ? "rgba(255,81,0,0.3)" : "rgba(255,255,255,0.06)" }}
            >
              {i < step ? (
                <CheckCircle2 className="w-3 h-3 text-white" />
              ) : i === step ? (
                <Loader2 className="w-2.5 h-2.5 text-[#ff5100] animate-spin" />
              ) : null}
            </div>
            <p className={`text-sm ${i <= step ? "text-white/80" : "text-white/25"}`}>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  result,
  onReset,
}: {
  result: AnalysisResult;
  onReset: () => void;
}) {
  const { userAxes, adventures: enriched, trainingPlan } = result;

  const inZone    = enriched.filter(a => a.status === "IN_ZONE");
  const stretch   = enriched.filter(a => a.status === "STRETCH");
  const restricted = enriched.filter(a => a.status === "RESTRICTED");

  // Overall score
  const axisValues = Object.values(userAxes).filter(v => v > 0);
  const avgScore = axisValues.length ? axisValues.reduce((a, b) => a + b, 0) / axisValues.length : 0;
  const tier =
    avgScore >= 4.5 ? { label: "Expedition Athlete",  color: "#a78bfa" } :
    avgScore >= 3.5 ? { label: "High-Altitude Adventurer", color: "#f97316" } :
    avgScore >= 2.5 ? { label: "Mountain Adventurer",  color: "#f59e0b" } :
    avgScore >= 1.5 ? { label: "Trail Trekker",        color: "#4ade80" } :
                      { label: "Beginner Explorer",    color: "#22d3ee" };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">

      {/* Capability profile card */}
      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Your ACE Profile</p>
      <div
        className="rounded-3xl p-7 mb-6 border relative overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)", borderLeftWidth: "4px", borderLeftColor: tier.color, borderColor: `${tier.color}35` }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: tier.color }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Adventure Tier</p>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: tier.color }}>{tier.label}</h1>
              <p className="text-white/45 text-sm mt-2">Based on your 8-axis ACE capability profile.</p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${tier.color}25`, color: tier.color, boxShadow: `0 0 20px ${tier.color}40` }}
            >
              <Target className="w-6 h-6" />
            </div>
          </div>

          {/* ACE Radar + Axis bars */}
          <div className="flex flex-wrap gap-6 items-start">
            <ACERadar ace={userAxes as { stamina: number; power: number; strength: number; agility: number; water: number; altitude: number; nerve: number; focus: number }} size={180} showLabels />
            <div className="flex-1 min-w-[160px]">
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">Capability Axes</p>
              <div className="space-y-2.5">
                {Object.entries(userAxes).map(([axis, val]) => (
                  <AxisBar key={axis} axis={axis} value={val} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adventures */}
      <AdventureSection label="Ready Now" sublabel="Adventures within your current capability" icon={<CheckCircle2 className="w-4 h-4" />} adventures={inZone} accentColor="#4ade80" defaultOpen />
      {stretch.length > 0 && <AdventureSection label="Stretch Challenge" sublabel="Slightly above your current range — achievable with focused training" icon={<TrendingUp className="w-4 h-4" />} adventures={stretch} accentColor="#f59e0b" />}
      {restricted.length > 0 && <AdventureSection label="Currently Out of Range" sublabel="Require capabilities significantly beyond your current profile" icon={<Lock className="w-4 h-4" />} adventures={restricted} accentColor="#f43f5e" />}

      {/* Training plan */}
      {trainingPlan.length > 0 && (
        <div
          className="rounded-2xl p-6 mb-8 border"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Your Training Plan</p>
          <h3 className="text-white font-semibold text-base mb-5">How to unlock harder adventures</h3>
          <div className="space-y-4">
            {trainingPlan.map((item, i) => {
              const color = AXIS_COLORS[item.axis] ?? "#ff5100";
              const icon = AXIS_ICONS[item.axis];
              return (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${color}18`, color }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold text-sm capitalize">{item.axis}</span>
                      <span className="text-white/30 text-xs">
                        Level {item.current_level} → {item.required_level}
                      </span>
                    </div>
                    <p className="text-white/55 text-sm leading-snug">{item.recommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap gap-3 items-center">
        <Link
          href="/explore"
          className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white transition-all hover:brightness-110"
          style={{ background: "#ff5100" }}
        >
          Browse all adventures
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-3 rounded-full border text-white/60 text-sm font-medium hover:text-white transition-colors"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retake assessment
        </button>
      </div>
    </div>
  );
}

// ─── Adventure section ────────────────────────────────────────────────────────

function AdventureSection({
  label, sublabel, icon, adventures: list, accentColor, defaultOpen = false,
}: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  adventures: EnrichedAdventure[];
  accentColor: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (list.length === 0) return null;

  return (
    <div
      className="mb-3 rounded-2xl border overflow-hidden"
      style={{ borderColor: `${accentColor}30`, borderLeftWidth: "3px", borderLeftColor: accentColor }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.03]"
        style={{ background: open ? `${accentColor}0a` : "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accentColor}20`, color: accentColor }}>
            {icon}
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-sm mb-0.5">{label}</p>
            <p className="text-white/35 text-xs">{sublabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: `${accentColor}18`, color: accentColor }}>
            {list.length} adventure{list.length !== 1 ? "s" : ""}
          </span>
          <ChevronRight className="w-4 h-4 transition-transform duration-200" style={{ color: accentColor, transform: open ? "rotate(90deg)" : "rotate(0deg)" }} />
        </div>
      </button>

      {open && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ borderTop: `1px solid ${accentColor}18` }}>
          {list.map(a => (
            <Link
              key={a.slug}
              href={`/experiences/${a.slug}`}
              className="group rounded-xl overflow-hidden border transition-all hover:-translate-y-0.5 hover:shadow-lg duration-200"
              style={{ borderColor: `${accentColor}25`, background: "rgba(255,255,255,0.03)" }}
            >
              <div className="relative h-36 overflow-hidden">
                <Image src={a.heroImage} alt={a.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                    <span className="text-white/55 text-[10px] truncate">{a.state}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-tight">{a.name}</h3>
                </div>
              </div>
              <div className="px-3 py-2.5">
                {a.requirements && <ACEBadge ace={a.requirements as unknown as Parameters<typeof ACEBadge>[0]["ace"]} size="sm" dark />}
                {a.weakAxes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {a.weakAxes.slice(0, 3).map(ax => (
                      <span key={ax} className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: `${AXIS_COLORS[ax] ?? "#fff"}18`, color: AXIS_COLORS[ax] ?? "#fff" }}>
                        {AXIS_ICONS[ax]}<span className="ml-0.5">{ax}</span>
                      </span>
                    ))}
                  </div>
                )}
                {a.analysis && (
                  <p className="text-white/35 text-[10px] leading-relaxed mt-1.5 line-clamp-2">{a.analysis}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const TRAINING_TIPS: Record<string, string> = {
  stamina:  "Build aerobic base with 3–4 weekly runs or hikes. Progress to back-to-back long days.",
  power:    "Add interval training and steep hill repeats to develop explosive leg power.",
  strength: "Weighted step-ups, squats and loaded carries will develop the strength needed.",
  agility:  "Practice trail running on technical terrain; add balance and proprioception drills.",
  water:    "Swim 2–3 times a week. Progress from pool to open water, then moving water.",
  altitude: "Spend nights above 3,000m before attempting higher objectives. Acclimatise gradually.",
  nerve:    "Exposure therapy on smaller heights — via ferrata and scrambling routes build tolerance.",
  focus:    "Long mountain days with navigation challenges develop the sustained focus required.",
};

function buildResult(userAxes: Record<string, number>): AnalysisResult {
  const enriched: EnrichedAdventure[] = ALL_ADVENTURES.map((adv) => {
    const req = getACE(adv);
    const axes = Object.keys(userAxes) as (keyof typeof userAxes)[];
    const weakAxes = axes.filter(ax => req[ax as keyof typeof req] > 0 && userAxes[ax] < req[ax as keyof typeof req]);
    const maxGap = weakAxes.reduce((max, ax) => Math.max(max, req[ax as keyof typeof req] - userAxes[ax]), 0);
    const status: "IN_ZONE" | "STRETCH" | "RESTRICTED" =
      maxGap === 0 ? "IN_ZONE" : maxGap <= 1 ? "STRETCH" : "RESTRICTED";
    return {
      id: adv.slug, slug: adv.slug, name: adv.name, heroImage: adv.heroImage,
      state: adv.state, region: (adv.region ?? "") as string,
      type: adv.type as string, difficulty: adv.difficulty as string,
      altitude: adv.altitude, status, weakAxes, missingKeys: weakAxes,
      analysis: "", requirements: req as unknown as Record<string, number>, riskLevel: maxGap,
    };
  });

  const axisGapMap: Record<string, number> = {};
  ALL_ADVENTURES.forEach(adv => {
    const req = getACE(adv);
    (Object.keys(userAxes) as string[]).forEach(ax => {
      if (req[ax as keyof typeof req] > userAxes[ax]) {
        axisGapMap[ax] = Math.max(axisGapMap[ax] ?? 0, req[ax as keyof typeof req] - userAxes[ax]);
      }
    });
  });

  const trainingPlan: TrainingItem[] = Object.entries(axisGapMap)
    .filter(([, gap]) => gap > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([ax, gap]) => ({
      axis: ax,
      current_level: userAxes[ax],
      required_level: userAxes[ax] + gap,
      recommendation: TRAINING_TIPS[ax] ?? "Train consistently to improve this capability.",
    }));

  return { userAxes, adventures: enriched, trainingPlan };
}

export default function MatchmakerClient() {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedResult, setSavedResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load previous result on mount; auto-show results if ?results=1 in URL
  const autoShown = useRef(false);
  useEffect(() => {
    const showResults = new URLSearchParams(window.location.search).get("results") === "1";
    loadProfileFromServer().then((saved) => {
      if (saved?.ace) {
        const r = buildResult(saved.ace as unknown as Record<string, number>);
        setSavedResult(r);
        if (showResults && !autoShown.current) {
          autoShown.current = true;
          setResult(r);
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }
    });
  }, []);

  const currentQ = QUESTIONS[stepIndex];
  const canAdvance = !!answers[currentQ.key];

  function submitAssessment(finalAnswers: Answers) {
    setLoading(true);
    setApiError(null);

    const score = (key: string) => ({ A:1, B:2, C:3, D:4, E:5 }[finalAnswers[key] ?? "A"] ?? 1);
    const userAxes = {
      stamina: score("Q1"), power: score("Q2"), strength: score("Q3"), agility: score("Q4"),
      water: score("Q5"), altitude: score("Q6"), nerve: score("Q7"), focus: score("Q8"),
    };

    const avgScore = Object.values(userAxes).reduce((a, b) => a + b, 0) / 8;
    const label =
      avgScore >= 4.2 ? "Expedition Athlete" :
      avgScore >= 3.2 ? "High-Altitude Adventurer" :
      avgScore >= 2.2 ? "Mountain Adventurer" :
      avgScore >= 1.5 ? "Trail Trekker" :
      "Beginner Explorer";
    const profile = { ace: userAxes, label, summary: "" };
    saveProfile(profile);
    saveProfileToServer(profile); // persist for logged-in users

    setResult(buildResult(userAxes));
    setLoading(false);
  }

  function advance() {
    if (!canAdvance) return;
    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex(i => i + 1);
    } else {
      submitAssessment(answers);
    }
  }

  function reset() {
    clearProfile();
    setStarted(false);
    setStepIndex(0);
    setAnswers({});
    setResult(null);
    setSavedResult(null);
    setApiError(null);
    setLoading(false);
  }

  if (!started && !result) return (
    <IntroScreen
      onStart={() => { setStarted(true); window.scrollTo({ top: 0, behavior: "instant" }); }}
      onViewResults={() => { setResult(savedResult); window.scrollTo({ top: 0, behavior: "instant" }); }}
      hasProfile={!!savedResult}
    />
  );
  if (loading && !result) return <LoadingScreen />;
  if (result) return <ResultsScreen result={result} onReset={reset} />;

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Adventure Matchmaker</p>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: AXIS_COLORS[currentQ.axis.toLowerCase()] ?? "#ff5100" }}>
            {AXIS_ICONS[currentQ.axis.toLowerCase()]}
          </span>
          <h1 className="text-white text-2xl font-bold tracking-tight">{currentQ.axis}</h1>
        </div>
        <p className="text-white/35 text-sm">Question {stepIndex + 1} of {QUESTIONS.length}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-10">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= stepIndex ? "#ff5100" : "rgba(255,255,255,0.1)" }}
          />
        ))}
      </div>

      {/* Question */}
      <div className="space-y-3">
        <h2 className="text-white text-xl font-semibold mb-1">{currentQ.question}</h2>
        {currentQ.hint && <p className="text-white/35 text-sm mb-5">{currentQ.hint}</p>}
        {currentQ.options.map(o => (
          <OptionBtn
            key={o.v}
            value={o.v}
            label={o.l}
            sub={undefined}
            selected={answers[currentQ.key] === o.v}
            onClick={() => setAnswers(prev => ({ ...prev, [currentQ.key]: o.v }))}
          />
        ))}
      </div>

      {/* Error */}
      {apiError && (
        <div className="mt-6 flex items-center gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => {
            if (stepIndex === 0) setStarted(false);
            else setStepIndex(i => i - 1);
          }}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={advance}
          disabled={!canAdvance}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all"
          style={{
            background: canAdvance ? "#ff5100" : "rgba(255,255,255,0.08)",
            color: canAdvance ? "white" : "rgba(255,255,255,0.2)",
          }}
        >
          {stepIndex === QUESTIONS.length - 1 ? "Analyse my profile" : "Continue"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-white/15 text-xs mt-6">
        {stepIndex + 1} of {QUESTIONS.length}
      </p>
    </div>
  );
}
