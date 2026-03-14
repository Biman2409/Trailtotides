"use client";

import { useState } from "react";
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
import { saveProfile } from "@/lib/matchmaker";

// ─── Question definitions (Q1–Q8 map to 8 bio axes) ──────────────────────────

const QUESTIONS = [
  {
    key: "Q1",
    axis: "Stamina",
    icon: <Flame className="w-4 h-4" />,
    question: "How long can you sustain continuous physical effort without stopping to rest?",
    hint: "Think of hiking, cycling, or any activity at a steady pace.",
    options: [
      { v: "A", l: "Under 30 minutes before needing a break" },
      { v: "B", l: "30–60 minutes at a comfortable pace" },
      { v: "C", l: "1–3 hours with occasional stops" },
      { v: "D", l: "3–6 hours on demanding terrain" },
      { v: "E", l: "6+ hours — all-day efforts are normal" },
    ],
  },
  {
    key: "Q2",
    axis: "Power",
    icon: <Zap className="w-4 h-4" />,
    question: "How well do you handle short, explosive bursts of intense effort?",
    hint: "Sprint up a steep section, scramble over a boulder, or fight a current for 30 seconds.",
    options: [
      { v: "A", l: "I struggle with any sudden burst of exertion" },
      { v: "B", l: "I can manage short bursts but tire quickly" },
      { v: "C", l: "Comfortable with moderate explosive effort" },
      { v: "D", l: "Strong bursts — train with sprints or weights" },
      { v: "E", l: "High power athlete — explosive effort is easy" },
    ],
  },
  {
    key: "Q3",
    axis: "Strength",
    icon: <Dumbbell className="w-4 h-4" />,
    question: "How do you handle carrying heavy loads or sustained full-body force?",
    hint: "Carrying a 10–15 kg pack for hours, or hauling yourself up a rock face.",
    options: [
      { v: "A", l: "I struggle with anything over 5 kg" },
      { v: "B", l: "Comfortable with 5–8 kg day packs" },
      { v: "C", l: "Can carry 8–12 kg on multi-day treks" },
      { v: "D", l: "Carry 12–15 kg comfortably for multiple days" },
      { v: "E", l: "Carry 15+ kg loads — regular strength training background" },
    ],
  },
  {
    key: "Q4",
    axis: "Agility",
    icon: <Compass className="w-4 h-4" />,
    question: "What's your comfort level moving through technically demanding terrain?",
    hint: "Loose scree, river crossings, narrow exposed ridges, boulders.",
    options: [
      { v: "A", l: "Flat or gentle walking trails only" },
      { v: "B", l: "Uneven trails — some rocks and roots are fine" },
      { v: "C", l: "Steep, rocky trails and basic river crossings" },
      { v: "D", l: "Scrambling, exposed ridges, technical terrain" },
      { v: "E", l: "Snow, ice, ropes — mountaineering-grade navigation" },
    ],
  },
  {
    key: "Q5",
    axis: "Water",
    icon: <Waves className="w-4 h-4" />,
    question: "How confident are you in water?",
    hint: "Swimming ability, comfort in currents, sea or river experience.",
    options: [
      { v: "A", l: "I cannot swim" },
      { v: "B", l: "Basic swimmer — calm pool or flat water only" },
      { v: "C", l: "Comfortable swimmer in open water" },
      { v: "D", l: "Strong swimmer — comfortable in moving water" },
      { v: "E", l: "Certified diver or rescue swimmer" },
    ],
  },
  {
    key: "Q6",
    axis: "Altitude",
    icon: <Mountain className="w-4 h-4" />,
    question: "What's the highest altitude you've slept overnight, and how did you respond?",
    hint: "Sleeping altitude matters more than passing through.",
    options: [
      { v: "A", l: "Below 1,500m — sea level to foothills" },
      { v: "B", l: "1,500–2,500m without symptoms" },
      { v: "C", l: "2,500–3,500m — some symptoms, managed" },
      { v: "D", l: "3,500–4,500m — high passes and base camps" },
      { v: "E", l: "Above 4,500m — expedition territory" },
    ],
  },
  {
    key: "Q7",
    axis: "Nerve",
    icon: <Shield className="w-4 h-4" />,
    question: "How do you handle high-exposure, fear-inducing situations?",
    hint: "Narrow ledges with drop-offs, entering underwater caves, white-water rapids.",
    options: [
      { v: "A", l: "Heights or exposure cause severe panic" },
      { v: "B", l: "Uncomfortable — can manage with effort" },
      { v: "C", l: "Some nerves but I push through" },
      { v: "D", l: "Calm and methodical under pressure" },
      { v: "E", l: "Exposure and danger are my element — calm always" },
    ],
  },
  {
    key: "Q8",
    axis: "Focus",
    icon: <Brain className="w-4 h-4" />,
    question: "Can you maintain sharp situational awareness over many hours?",
    hint: "Navigation in a whiteout, timing tidal crossings, managing a group's safety.",
    options: [
      { v: "A", l: "I lose focus quickly — fatigue or stress derails me" },
      { v: "B", l: "Manageable for a few hours with breaks" },
      { v: "C", l: "Sustained focus across a full day" },
      { v: "D", l: "Sharp all day even under physical strain" },
      { v: "E", l: "Multi-day, high-stakes focus is a strength" },
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

function IntroScreen({ onStart }: { onStart: () => void }) {
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

      <button
        onClick={onStart}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold text-sm text-white transition-all hover:brightness-110"
        style={{ background: "#ff5100" }}
      >
        Begin Assessment
        <ChevronRight className="w-4 h-4" />
      </button>
      <p className="text-white/20 text-xs text-center mt-3">8 questions · takes about 3 minutes</p>
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  const steps = [
    "Mapping your biological capability profile…",
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
      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Your Biological Profile</p>
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
              <p className="text-white/45 text-sm mt-2">Based on your 8-axis biological capability profile.</p>
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
                {a.requirements && <ACEBadge ace={a.requirements} size="sm" dark />}
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

export default function MatchmakerClient() {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const currentQ = QUESTIONS[stepIndex];
  const canAdvance = !!answers[currentQ.key];

  async function submitAssessment(finalAnswers: Answers) {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/matchmaker/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data);
      // Save ACE profile to localStorage so other pages can use it
      if (data.userAxes) {
        const avgScore = Object.values(data.userAxes as Record<string, number>).reduce((a: number, b: number) => a + b, 0) / 8;
        const label =
          avgScore >= 4.2 ? "Expedition Athlete" :
          avgScore >= 3.2 ? "High-Altitude Adventurer" :
          avgScore >= 2.2 ? "Mountain Adventurer" :
          avgScore >= 1.5 ? "Trail Trekker" :
          "Beginner Explorer";
        saveProfile({ ace: data.userAxes, label, summary: "" });
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
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
    setStarted(false);
    setStepIndex(0);
    setAnswers({});
    setResult(null);
    setApiError(null);
    setLoading(false);
  }

  if (!started) return <IntroScreen onStart={() => setStarted(true)} />;
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
            sub={o.s}
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
