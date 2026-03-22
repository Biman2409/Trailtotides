"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight, ChevronLeft, MapPin, ArrowRight, RotateCcw,
  Zap, Shield, Mountain, CheckCircle2, TrendingUp, Lock,
  Compass, Dumbbell, Waves, Wind, Flame,
  AlertTriangle, Loader2,
} from "lucide-react";
import ACERadar from "@/components/ui/custom/ACERadar";
import AchievementBadges from "@/components/ui/custom/AchievementBadges";
import { saveProfile, loadProfile, clearProfile, saveProfileToServer, loadProfileFromServer } from "@/lib/matchmaker";
import { adventures as ALL_ADVENTURES } from "@/lib/data";
import { getACE } from "@/lib/ace";
import { getAchievements } from "@/lib/achievements";

// ─── Question definitions (Q1–Q8 map to 8 bio axes) ──────────────────────────

const QUESTIONS = [
  {
    key: "Q1",
    axis: "Stamina",
    icon: <Flame className="w-4 h-4" />,
    question: "How many hours can you continuously move before needing to stop for the day?",
    hint: "Count active moving time — short rest stops are fine.",
    options: [
      { v: "A", l: "Under 2 hours" },
      { v: "B", l: "2–4 hours" },
      { v: "C", l: "4–6 hours" },
      { v: "D", l: "6–8 hours" },
      { v: "E", l: "More than 8 hours" },
    ],
  },
  {
    key: "Q2",
    axis: "Power",
    icon: <Zap className="w-4 h-4" />,
    question: "What weight can you comfortably carry over extended periods without significant fatigue or pain?",
    hint: "Across a full trekking day, not just a short walk.",
    options: [
      { v: "A", l: "Under 5 kg" },
      { v: "B", l: "5–8 kg" },
      { v: "C", l: "8–12 kg" },
      { v: "D", l: "12–15 kg" },
      { v: "E", l: "More than 15 kg" },
    ],
  },
  {
    key: "Q3",
    axis: "Strength",
    icon: <Dumbbell className="w-4 h-4" />,
    question: "How do you typically handle long, continuous uphill sections?",
    hint: "Not a single climb — think repeated ascents over hours.",
    options: [
      { v: "A", l: "Avoid steep or prolonged climbs" },
      { v: "B", l: "Need frequent short breaks" },
      { v: "C", l: "Maintain a steady pace on moderate climbs" },
      { v: "D", l: "Sustain long climbs with significant elevation gain" },
      { v: "E", l: "Comfortable with steep, prolonged ascents" },
    ],
  },
  {
    key: "Q4",
    axis: "Agility",
    icon: <Compass className="w-4 h-4" />,
    question: "What type of terrain are you confident moving through?",
    hint: "Pick the hardest terrain you can move through safely and steadily.",
    options: [
      { v: "A", l: "Flat, paved, or well-maintained paths" },
      { v: "B", l: "Dirt trails with minor obstacles" },
      { v: "C", l: "Uneven terrain (loose rocks, scree, sand)" },
      { v: "D", l: "Rocky terrain requiring use of hands" },
      { v: "E", l: "Highly technical terrain (glaciers, exposed rock)" },
    ],
  },
  {
    key: "Q5",
    axis: "Water",
    icon: <Waves className="w-4 h-4" />,
    question: "What level of water conditions are you comfortable handling?",
    hint: "Think rivers, sea, or open water — not a controlled pool setting.",
    options: [
      { v: "A", l: "No water exposure" },
      { v: "B", l: "Shallow, calm water" },
      { v: "C", l: "Deeper water or basic swimming" },
      { v: "D", l: "Moving water or moderate currents" },
      { v: "E", l: "Strong currents or advanced conditions" },
    ],
  },
  {
    key: "Q6",
    axis: "Altitude",
    icon: <Mountain className="w-4 h-4" />,
    question: "At what altitude have you remained physically active without significant discomfort?",
    hint: "Where you've trekked or camped — not just driven or flown through.",
    options: [
      { v: "A", l: "Below 1,500 m" },
      { v: "B", l: "1,500–2,500 m" },
      { v: "C", l: "2,500–3,200 m" },
      { v: "D", l: "3,200–4,200 m" },
      { v: "E", l: "Above 4,200 m" },
    ],
  },
  {
    key: "Q7",
    axis: "Focus",
    icon: <Shield className="w-4 h-4" />,
    question: "How comfortable are you on narrow paths with steep drop-offs?",
    hint: "Paths where a misstep matters — not a momentary ledge crossing.",
    options: [
      { v: "A", l: "Not comfortable; prefer wide paths" },
      { v: "B", l: "Slight discomfort but manageable" },
      { v: "C", l: "Comfortable with solid footing" },
      { v: "D", l: "Comfortable on narrow or exposed sections" },
      { v: "E", l: "Fully comfortable in highly exposed terrain" },
    ],
  },
  {
    key: "Q8",
    axis: "Nerve",
    icon: <Wind className="w-4 h-4" />,
    question: "If you're stuck in a remote area without signal or immediate help, how do you respond?",
    hint: "No phone signal, hours from the nearest town, no guarantee of rescue.",
    options: [
      { v: "A", l: "Prefer to stay within quick reach of help" },
      { v: "B", l: "Comfortable on known routes with people nearby" },
      { v: "C", l: "Can manage basic needs and delays" },
      { v: "D", l: "Can stay self-sufficient in remote areas" },
      { v: "E", l: "Fully comfortable operating independently" },
    ],
  },
];

type Answers = Partial<Record<string, string>>;

// ─── Axis colour map ──────────────────────────────────────────────────────────

const AXIS_COLORS: Record<string, string> = {
  stamina:  "#f97316",
  power:    "#eab308",
  strength: "#84cc16",
  agility:  "#22d3ee",
  water:    "#3b82f6",
  altitude: "#a78bfa",
  focus:    "#f43f5e",
  nerve: "#10b981",
};

const AXIS_ICONS: Record<string, React.ReactNode> = {
  stamina:  <Flame    className="w-3.5 h-3.5" />,
  power:    <Zap      className="w-3.5 h-3.5" />,
  strength: <Dumbbell className="w-3.5 h-3.5" />,
  agility:  <Compass  className="w-3.5 h-3.5" />,
  water:    <Waves    className="w-3.5 h-3.5" />,
  altitude: <Mountain className="w-3.5 h-3.5" />,
  focus:    <Shield   className="w-3.5 h-3.5" />,
  nerve: <Wind     className="w-3.5 h-3.5" />,
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

// ─── Rank data ────────────────────────────────────────────────────────────────

const RANKS = [
  {
    label: "Uncharted", color: "#6b7280", stars: 0, minScore: 0,
    desc: "Journey not yet begun",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/>
        <path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="16.5" r="1.2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Pathfinder", color: "#22d3ee", stars: 1, minScore: 8,
    desc: "First steps into the wild",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/>
        <path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Navigator", color: "#4ade80", stars: 2, minScore: 16,
    desc: "Finding the way through new terrain",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Trailblazer", color: "#f59e0b", stars: 3, minScore: 24,
    desc: "Blazing paths where none exist",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
        <path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Vanguard", color: "#f97316", stars: 4, minScore: 32,
    desc: "Leading the charge on any frontier",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
        <path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
      </svg>
    ),
  },
  {
    label: "Apex", color: "#a78bfa", stars: 5, minScore: 40,
    desc: "Elite physical capability across all axes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/>
        <polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/>
      </svg>
    ),
  },
];

function RankProgressionBar({ totalScore }: { totalScore: number }) {
  const currentRankIndex = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const currentRank = RANKS[currentRankIndex];
  const nextRank = RANKS[currentRankIndex + 1] ?? null;
  const progressPct = nextRank
    ? Math.min(100, Math.round(((totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100))
    : 100;
  const totalRanks = RANKS.length;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${currentRank.color}22`, background: `linear-gradient(160deg, ${currentRank.color}0e 0%, rgba(14,14,18,0) 60%)` }}
    >
      {/* Top: current tier identity */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${currentRank.color}20`, color: currentRank.color, boxShadow: `0 0 22px ${currentRank.color}45` }}>
            <div className="scale-[1.4]">{currentRank.icon}</div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-white/30 mb-0.5">Adventure Tier</p>
            <p className="text-lg font-bold leading-none" style={{ color: currentRank.color }}>{currentRank.label}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-sm" style={{ color: i < currentRank.stars ? currentRank.color : "rgba(255,255,255,0.08)" }}>★</span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px" style={{ background: `${currentRank.color}18` }} />

      {/* Progress section */}
      <div className="px-5 pt-4 pb-5 flex flex-col gap-4">
        {nextRank ? (
          <>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-black tabular-nums tracking-tight leading-none" style={{ color: currentRank.color }}>{progressPct}<span className="text-xl font-bold opacity-70">%</span></span>
                <p className="text-[10px] text-white/35 mt-1">to <span className="font-semibold" style={{ color: nextRank.color }}>{nextRank.label}</span></p>
              </div>
              <div className="text-right pb-0.5">
                <p className="text-2xl font-bold tabular-nums text-white/80">{nextRank.minScore - totalScore}</p>
                <p className="text-[10px] text-white/30">pts needed</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${((currentRankIndex + progressPct / 100) / (totalRanks - 1)) * 100}%`,
                    background: `linear-gradient(to right, ${RANKS[1].color}cc, ${currentRank.color})`,
                    boxShadow: `0 0 12px ${currentRank.color}50`,
                  }}
                />
                {RANKS.slice(1, -1).map((rank, i) => (
                  <div
                    key={rank.label}
                    className="absolute inset-y-0 w-px"
                    style={{ left: `${((i + 1) / (totalRanks - 1)) * 100}%`, background: "rgba(14,14,18,0.7)" }}
                  />
                ))}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-700"
                  style={{
                    left: `${((currentRankIndex + progressPct / 100) / (totalRanks - 1)) * 100}%`,
                    background: currentRank.color,
                    borderColor: "#0e0e12",
                    boxShadow: `0 0 10px ${currentRank.color}`,
                  }}
                />
              </div>
              <div className="relative h-4 mt-1">
                {RANKS.map((rank, i) => {
                  const isCurrent = i === currentRankIndex;
                  const isUnlocked = i < currentRankIndex;
                  return (
                    <span
                      key={rank.label}
                      className="absolute text-[7.5px] font-semibold leading-none whitespace-nowrap"
                      style={{
                        left: `${(i / (totalRanks - 1)) * 100}%`,
                        transform: `translateX(-${(i / (totalRanks - 1)) * 100}%)`,
                        color: isCurrent ? currentRank.color : isUnlocked ? `${rank.color}55` : "rgba(255,255,255,0.15)",
                      }}
                    >
                      {rank.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-full h-2.5 rounded-full" style={{ background: `linear-gradient(to right, ${RANKS[1].color}, #a78bfa)`, boxShadow: "0 0 14px #a78bfa50" }} />
            <p className="text-xs font-bold tracking-widest uppercase text-[#a78bfa]">Maximum Rank — Apex</p>
          </div>
        )}
      </div>
    </div>
  );
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
    { icon: <Wind className="w-5 h-5" />,      name: "Mind",     color: "#10b981", desc: "Focus + Nerve — psychological exposure tolerance and the grit to operate far from help." },
  ];

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-6 py-20 sm:py-28">
      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-5">Adventure Matchmaker</p>
      <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
        Adventures built for your body
      </h1>
      <p className="text-white/50 text-base leading-relaxed mb-9">
        Every adventure makes specific demands on your body. ACE breaks those demands into eight axes — Stamina, Power, Strength, Agility, Water, Altitude, Focus and Nerve — so you know exactly what you&apos;re signing up for.
      </p>

      {!hasProfile && (
        <>
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
        </>
      )}

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

// ─── Strengths section (collapsible) ─────────────────────────────────────────

function StrengthsSection({ sorted, sectionLabel, axisLabels, axisDesc, axisColors, axisIcons, userAxes }: {
  sorted: [string, number][];
  sectionLabel: string;
  axisLabels: Record<string, string>;
  axisDesc: Record<string, string>;
  axisColors: Record<string, string>;
  axisIcons: Record<string, React.ReactNode>;
  userAxes: { stamina: number; power: number; strength: number; agility: number; water: number; altitude: number; focus: number; nerve: number };
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? sorted : sorted.slice(0, 4);
  const hasMore = sorted.length > 4;

  return (
    <div className="rounded-2xl sm:rounded-3xl border overflow-hidden mb-5 sm:mb-7"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* Radar */}
        <div className="shrink-0 flex flex-col items-center sm:items-start gap-2.5 p-4 sm:p-5 w-full sm:w-auto">
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/25 self-start">Capability Breakdown</p>
          <div className="rounded-xl sm:rounded-2xl flex items-center justify-center p-3 sm:p-4 w-full sm:w-auto"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,81,0,0.06) 0%, rgba(255,255,255,0.015) 70%)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <ACERadar ace={userAxes} size={190} showLabels />
          </div>
        </div>

        {/* Divider — horizontal on mobile, vertical on sm+ */}
        <div className="sm:hidden h-px mx-4" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="hidden sm:block w-px self-stretch" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* Strengths */}
        <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/22">{sectionLabel}</p>
            {hasMore && (
              <button onClick={() => setShowAll(v => !v)}
                className="text-[9px] font-semibold transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                {showAll ? "Show less" : `+${sorted.length - 4} more`}
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1">
            {visible.map(([axis, val]) => {
              const color = axisColors[axis] ?? "#ff5100";
              const icon  = axisIcons[axis];
              return (
                <div key={axis} className="flex-1 flex items-center rounded-md px-2 gap-2" style={{ background: `${color}0c`, border: `1px solid ${color}1c` }}>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 [&>svg]:w-3 [&>svg]:h-3"
                    style={{ background: `${color}14`, border: `1.5px solid ${color}28`, boxShadow: `0 0 6px ${color}20`, color }}>
                    {icon}
                  </div>
                  <span className="text-[11px] font-bold capitalize" style={{ color }}>{axisLabels[axis]}</span>
                  <span className="text-[9px] text-white/28 truncate flex-1">{axisDesc[axis]}</span>
                  <span className="text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: `${color}20`, color }}>Lv {val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Training section (collapsible) ──────────────────────────────────────────

interface TrainingItem { axis: string; current_level: number; required_level: number; recommendation: string; }

function TrainingSection({ trainingPlan, axisColors, axisIcons }: {
  trainingPlan: TrainingItem[];
  axisColors: Record<string, string>;
  axisIcons: Record<string, React.ReactNode>;
}) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...trainingPlan].sort((a, b) =>
    (b.required_level - b.current_level) - (a.required_level - a.current_level));
  const visible  = showAll ? sorted : sorted.slice(0, 3);
  const hasMore  = sorted.length > 3;

  return (
    <div className="rounded-2xl sm:rounded-3xl border overflow-hidden mb-5 sm:mb-7"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>

      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 sm:pb-4 border-b border-white/[0.05]">
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/25 mb-1">What to train next</p>
        <h3 className="text-white font-bold text-base leading-tight">Unlock harder adventures</h3>
        <p className="text-white/35 text-[11px] mt-1">Build these up and more adventures open up for you.</p>
      </div>

      {/* Items */}
      <div className="px-4 sm:px-6 py-4 space-y-2.5">
        {visible.map((item, i) => {
          const color = axisColors[item.axis] ?? "#ff5100";
          const icon  = axisIcons[item.axis];
          const gap   = item.required_level - item.current_level;
          return (
            <div key={i} className="flex items-start gap-3 rounded-xl p-3.5"
              style={{ background: `${color}08`, border: `1px solid ${color}16` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}14`, border: `1.5px solid ${color}28`, boxShadow: `0 0 8px ${color}20`, color }}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-white font-bold text-sm capitalize">{item.axis}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${color}18`, color }}>
                    +{gap} level{gap > 1 ? "s" : ""} to go
                  </span>
                  <span className="text-white/22 text-[10px] ml-auto font-mono">
                    {item.current_level} → {item.required_level}
                  </span>
                </div>
                <p className="text-white/40 text-[11px] leading-[1.55]">{item.recommendation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand toggle */}
      {hasMore && (
        <div className="px-4 sm:px-6 pb-4 -mt-1">
          <button onClick={() => setShowAll(v => !v)}
            className="w-full py-2 rounded-xl text-[11px] font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
            {showAll ? "Show less" : `Show ${sorted.length - 3} more areas`}
          </button>
        </div>
      )}
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

  // Overall score — sum all axes without filtering so 0s count correctly
  const totalScore = Object.values(userAxes).reduce((a, b) => a + b, 0);
  const resultAce = { stamina: userAxes.stamina ?? 0, power: userAxes.power ?? 0, strength: userAxes.strength ?? 0, agility: userAxes.agility ?? 0, water: userAxes.water ?? 0, altitude: userAxes.altitude ?? 0, focus: userAxes.focus ?? 0, nerve: userAxes.nerve ?? 0 };
  const achievements = getAchievements(resultAce);
  const tier =
    totalScore >= 40 ? { label: "Apex",        color: "#a78bfa" } :
    totalScore >= 32 ? { label: "Vanguard",    color: "#f97316" } :
    totalScore >= 24 ? { label: "Trailblazer", color: "#f59e0b" } :
    totalScore >= 16 ? { label: "Navigator",   color: "#4ade80" } :
    totalScore >= 8  ? { label: "Pathfinder",  color: "#22d3ee" } :
                       { label: "Uncharted",   color: "#6b7280" };
  const tierRank = RANKS.find(r => r.label === tier.label);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

      {/* ── 1. PAGE HEADER ───────────────────────────────────────────────────── */}
      <div className="mb-6 sm:mb-8">
        <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.25em] uppercase mb-2">Adventure Matchmaker</p>
        <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight">Your ACE Profile</h2>
      </div>

      {/* ── 2. TIER HERO CARD ────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl sm:rounded-3xl overflow-hidden border relative mb-5 sm:mb-7"
        style={{ background: `linear-gradient(150deg, ${tier.color}14 0%, rgba(14,14,18,0.0) 60%)`, borderColor: `${tier.color}25` }}
      >
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: tier.color }} />

        {/* Identity + Achievements row */}
        <div className="relative flex items-start gap-4 sm:gap-5 px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5">
          {/* Tier icon */}
          <div
            className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${tier.color}18`, color: tier.color, boxShadow: `0 0 32px ${tier.color}38`, border: `1px solid ${tier.color}28` }}
          >
            <div className="scale-[1.55] sm:scale-[1.75]">{tierRank?.icon}</div>
          </div>

          {/* Tier label */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-[0.22em] font-semibold text-white/28 mb-1">Adventure Tier</p>
            <h1 className="text-[26px] sm:text-[32px] font-black tracking-tight leading-none" style={{ color: tier.color }}>{tier.label}</h1>
            <div className="flex items-center gap-[3px] mt-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[13px] leading-none" style={{ color: i < (tierRank?.stars ?? 0) ? tier.color : "rgba(255,255,255,0.09)" }}>★</span>
              ))}
              <span className="text-white/22 text-[10px] ml-2">Rank {tierRank?.stars ?? 0} of 5</span>
            </div>
          </div>

          {/* Achievements — right side, only when earned */}
          {achievements.length > 0 && (
            <div
              className="hidden sm:flex shrink-0 pl-4 border-l self-stretch items-start"
              style={{ borderColor: `${tier.color}18`, minWidth: 0 }}
            >
              <AchievementBadges ace={resultAce} heading="Achievements" />
            </div>
          )}
        </div>

        {/* Achievements — mobile: below identity, above divider */}
        {achievements.length > 0 && (
          <div className="sm:hidden px-5 pb-4">
            <AchievementBadges ace={resultAce} heading="Achievements" />
          </div>
        )}

        {/* Divider */}
        <div className="mx-5 sm:mx-7 h-px" style={{ background: `${tier.color}14` }} />

        {/* Rank progression */}
        {(() => {
          const currentRankIndex = tierRank ? RANKS.indexOf(tierRank) : 0;
          const totalRanks = RANKS.length;
          const nextRank = RANKS[currentRankIndex + 1] ?? null;
          const rawPct = nextRank
            ? Math.min(100, Math.round(((totalScore - RANKS[currentRankIndex].minScore) / (nextRank.minScore - RANKS[currentRankIndex].minScore)) * 100))
            : 100;
          const progressPct = Math.max(0, rawPct);
          const justUnlocked = nextRank !== null && totalScore === RANKS[currentRankIndex].minScore && currentRankIndex > 0;
          const ptsNeeded = nextRank ? nextRank.minScore - totalScore : 0;
          return (
            <div className="pt-4 sm:pt-5 pb-5 sm:pb-6">
              {/* % + pts row — padded */}
              <div className="px-5 sm:px-7">
                {nextRank ? (
                  justUnlocked ? (
                    <div className="flex items-center gap-3 mb-4 py-1">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold tracking-wide" style={{ color: tier.color }}>Rank just unlocked!</span>
                        <p className="text-[11px] text-white/35 mt-0.5">
                          Score <span className="font-semibold text-white/55">{ptsNeeded} more pts</span> to reach <span className="font-semibold" style={{ color: nextRank.color }}>{nextRank.label}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <div className="flex items-baseline gap-0.5 leading-none">
                        <span className="text-[38px] sm:text-[48px] font-black tabular-nums tracking-tight" style={{ color: tier.color }}>{progressPct}</span>
                        <span className="text-lg sm:text-xl font-bold ml-0.5" style={{ color: `${tier.color}70` }}>%</span>
                      </div>
                      <p className="text-[11px] text-white/30 mt-1 leading-none">
                        to reach <span className="font-bold" style={{ color: nextRank.color }}>{nextRank.label}</span>
                      </p>
                    </div>
                    <div className="text-right pb-1">
                      <p className="text-[24px] sm:text-[30px] font-black tabular-nums leading-none text-white/70">{ptsNeeded}</p>
                      <p className="text-[11px] text-white/28 mt-1 leading-none">pts needed</p>
                    </div>
                  </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#a78bfa" }} />
                    <p className="text-xs font-bold tracking-widest uppercase text-[#a78bfa]">Maximum Rank Reached — Apex</p>
                  </div>
                )}
              </div>
              {/* Bar + labels — full width with px padding applied via mx */}
              <div className="px-5 sm:px-7">
                <div className="relative h-[10px] rounded-full mb-3" style={{ background: "rgba(255,255,255,0.055)" }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{
                      width: `${((currentRankIndex + progressPct / 100) / (totalRanks - 1)) * 100}%`,
                      background: `linear-gradient(to right, ${RANKS[1].color}bb, ${tier.color})`,
                      boxShadow: `0 0 16px ${tier.color}55`,
                    }}
                  />
                  {RANKS.slice(1, -1).map((rank, i) => (
                    <div key={rank.label} className="absolute inset-y-0 w-px bg-[rgba(14,14,18,0.65)]" style={{ left: `${((i + 1) / (totalRanks - 1)) * 100}%` }} />
                  ))}
                  <div
                    className="absolute w-[18px] h-[18px] rounded-full border-2 transition-all duration-700"
                    style={{
                      left: `${((currentRankIndex + progressPct / 100) / (totalRanks - 1)) * 100}%`,
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      background: tier.color,
                      borderColor: "#0e0e12",
                      boxShadow: `0 0 14px ${tier.color}`,
                    }}
                  />
                </div>
                <div className="relative h-[18px]">
                  {RANKS.map((rank, i) => (
                    <span
                      key={rank.label}
                      className="absolute text-[7px] sm:text-[7.5px] font-semibold leading-none whitespace-nowrap top-0"
                      style={{
                        left: `${(i / (totalRanks - 1)) * 100}%`,
                        transform: `translateX(-${(i / (totalRanks - 1)) * 100}%)`,
                        color: i === currentRankIndex ? tier.color : i < currentRankIndex ? `${rank.color}50` : "rgba(255,255,255,0.13)",
                      }}
                    >
                      {rank.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── 3. ACE RADAR + STRENGTHS ─────────────────────────────────────────── */}
      {(() => {
        const allEntries = Object.entries(userAxes).sort(([, a], [, b]) => b - a);
        // Tiered standout: 4-5 = strong, 3 = decent (if no 4+), else show top 2 best axes
        const hasStandout = allEntries.some(([, v]) => v >= 4);
        const hasDecent   = allEntries.some(([, v]) => v >= 3);
        const sorted = (() => {
          if (hasStandout) return allEntries.filter(([, v]) => v >= 4);
          if (hasDecent)   return allEntries.filter(([, v]) => v >= 3);
          return allEntries.slice(0, 2).filter(([, v]) => v > 0);
        })();
        const sectionLabel = hasStandout ? "Standout Strengths" : hasDecent ? "Top Strengths" : "Best Axes";
        const AXIS_LABELS: Record<string, string> = {
          stamina: "Stamina", power: "Power", strength: "Strength",
          agility: "Agility", water: "Water", altitude: "Altitude",
          focus: "Focus", nerve: "Nerve",
        };
        const AXIS_DESC_BY_LEVEL: Record<string, string[]> = {
          //                  Lv1                                          Lv2                                         Lv3                                           Lv4                                              Lv5
          stamina:  ["A solid start — you're out there moving.",  "You hold your own on moderate days.",      "You keep a strong pace when others fade.",    "You keep moving for hours without burning out.", "Rare endurance — you outlast almost everyone."],
          power:    ["You carry your kit without a fuss.",        "You handle a loaded pack on the go.",      "You manage real weight across tough terrain.", "You haul heavy loads all day and still deliver.", "Exceptional — no load slows you down."],
          strength: ["You take on gentle climbs with ease.",      "You tackle steady ascents without drama.",  "You push through hard climbs and come out strong.", "You power up steep terrain without losing a beat.", "Elite climbing engine — relentless and unstoppable."],
          agility:  ["You move confidently on solid ground.",     "You handle mild loose terrain well.",       "You navigate rocky and uneven ground with ease.", "You're sure-footed on scree, rock and technical trail.", "Exceptional — no terrain rattles you."],
          water:    ["You're comfortable in calm open water.",    "You handle gentle currents with ease.",     "You're solid in open water and mild conditions.", "You thrive in currents and challenging aquatic terrain.", "Rare water ability — you're at home in any conditions."],
          altitude: ["You're adapting well to elevation.",        "You acclimatise better than most.",         "You handle altitude without it holding you back.", "You stay strong and sharp above 4,000m.",        "Exceptional — thin air doesn't touch you."],
          focus:    ["You stay composed on exposed sections.",    "You hold steady where it gets serious.",    "You're calm and precise on technical ground.",   "You stay sharp on exposed ridges where it counts.", "Ice-cool — nothing rattles you on the edge."],
          nerve:    ["You're building confidence in the wild.",   "You hold it together when plans change.",   "You're comfortable operating with uncertainty.",  "You thrive alone, far from help, without flinching.", "Rare self-reliance — built for the deep wilderness."],
        };
        const AXIS_DESC: Record<string, string> = Object.fromEntries(
          Object.entries(AXIS_DESC_BY_LEVEL).map(([axis, levels]) => {
            const lv = (userAxes as Record<string, number>)[axis] ?? 1;
            return [axis, levels[Math.min(Math.max(lv, 1), 5) - 1]];
          })
        );
        return (
          <StrengthsSection
            sorted={sorted}
            sectionLabel={sectionLabel}
            axisLabels={AXIS_LABELS}
            axisDesc={AXIS_DESC}
            axisColors={AXIS_COLORS}
            axisIcons={AXIS_ICONS}
            userAxes={userAxes as { stamina: number; power: number; strength: number; agility: number; water: number; altitude: number; focus: number; nerve: number }}
          />
        );
      })()}

      {/* ── 4. ADVENTURE SECTIONS ────────────────────────────────────────────── */}
      <div className="space-y-2.5 mb-5 sm:mb-7">
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/25 px-0.5 mb-2.5">Matched Adventures</p>
        <AdventureSection
          label="Ready Now"
          sublabel="Adventures within your current capability"
          icon={<CheckCircle2 className="w-4 h-4" />}
          adventures={[...inZone].sort((a, b) => (a.riskLevel ?? 0) - (b.riskLevel ?? 0)).slice(0, 6)}
          totalCount={inZone.length}
          exploreUrl="/explore?ace=ready"
          accentColor="#4ade80"
          defaultOpen
        />
        {stretch.length > 0 && (
          <AdventureSection
            label="Stretch Challenge"
            sublabel="Slightly above your current range — achievable with focused training"
            icon={<TrendingUp className="w-4 h-4" />}
            adventures={[...stretch].sort((a, b) => (a.riskLevel ?? 0) - (b.riskLevel ?? 0)).slice(0, 6)}
            totalCount={stretch.length}
            exploreUrl="/explore?ace=stretch"
            accentColor="#f59e0b"
          />
        )}
        {restricted.length > 0 && (
          <AdventureSection
            label="Currently Out of Range"
            sublabel="Require capabilities significantly beyond your current profile"
            icon={<Lock className="w-4 h-4" />}
            adventures={[...restricted].sort((a, b) => (a.riskLevel ?? 0) - (b.riskLevel ?? 0)).slice(0, 6)}
            totalCount={restricted.length}
            exploreUrl="/explore?ace=out-of-range"
            accentColor="#f43f5e"
          />
        )}
      </div>

      {/* ── 5. TRAINING FOCUS AREAS ──────────────────────────────────────────── */}
      {trainingPlan.length > 0 && (
        <TrainingSection
          trainingPlan={trainingPlan}
          axisColors={AXIS_COLORS}
          axisIcons={AXIS_ICONS}
        />
      )}

      {/* ── 6. CTA BUTTONS ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <Link
          href="/explore?ace=ready"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#ff5100]/20 active:translate-y-0"
          style={{ background: "linear-gradient(135deg, #ff5100, #ff7340)" }}
        >
          All adventures
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          onClick={onReset}
          className="sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border text-white/40 text-sm font-medium hover:text-white/70 hover:border-white/20 transition-all active:scale-[0.98]"
          style={{ borderColor: "rgba(255,255,255,0.10)" }}
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
  label, sublabel, icon, adventures: list, accentColor, defaultOpen = false, totalCount, exploreUrl,
}: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  adventures: EnrichedAdventure[];
  accentColor: string;
  defaultOpen?: boolean;
  totalCount?: number;
  exploreUrl?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (list.length === 0) return null;
  const hiddenCount = totalCount ? totalCount - list.length : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: `${accentColor}22`, background: `linear-gradient(160deg, ${accentColor}06 0%, rgba(14,14,18,0) 60%)` }}
    >
      {/* ── Accordion header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 transition-colors hover:bg-white/[0.02] text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${accentColor}18`, color: accentColor }}
          >
            {icon}
          </div>
          <div>
            <p className="text-white font-bold text-[13px] sm:text-sm leading-snug">{label}</p>
            <p className="text-white/30 text-[10px] sm:text-[11px] mt-0.5 leading-snug">{sublabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span
            className="text-[10px] font-bold px-2.5 py-[5px] rounded-full tabular-nums"
            style={{ background: `${accentColor}16`, color: accentColor }}
          >
            {totalCount ?? list.length}
          </span>
          <ChevronRight
            className="w-[15px] h-[15px] transition-transform duration-200 shrink-0"
            style={{ color: `${accentColor}70`, transform: open ? "rotate(90deg)" : "none" }}
          />
        </div>
      </button>

      {/* ── Expanded content ── */}
      {open && (
        <div style={{ borderTop: `1px solid ${accentColor}14` }}>
          <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {list.map(a => (
              <Link
                key={a.slug}
                href={`/experiences/${a.slug}`}
                className="group rounded-xl overflow-hidden border transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg"
                style={{ borderColor: `${accentColor}18`, background: "rgba(255,255,255,0.025)" }}
              >
                {/* Image */}
                <div className="relative h-[150px] sm:h-[160px] overflow-hidden">
                  <Image
                    src={a.heroImage}
                    alt={a.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-3.5 pt-6">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-2.5 h-2.5 shrink-0" style={{ color: `${accentColor}cc` }} />
                      <span className="text-white/45 text-[9.5px] truncate">{a.state}</span>
                    </div>
                    <h3 className="text-white font-bold text-[13px] sm:text-sm leading-snug">{a.name}</h3>
                  </div>
                </div>
                {/* Meta */}
                <div className="px-3.5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md"
                      style={{ background: "rgba(255,81,0,0.12)", color: "#ff7340" }}>
                      {a.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md"
                      style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      {a.state}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View all */}
          {hiddenCount > 0 && exploreUrl && (
            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
              <Link
                href={exploreUrl}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-semibold transition-all hover:brightness-110"
                style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}22` }}
              >
                View all {totalCount} adventures
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
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
  focus:    "Exposure therapy on smaller heights — via ferrata and scrambling routes build tolerance.",
  nerve: "Build comfort in remote settings — overnight solo trips and wilderness navigation without phone support.",
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

  // Load previous result on mount — always show results if profile exists
  const autoShown = useRef(false);
  useEffect(() => {
    loadProfileFromServer().then((saved) => {
      if (saved?.ace) {
        const r = buildResult(saved.ace as unknown as Record<string, number>);
        setSavedResult(r);
        if (!autoShown.current) {
          autoShown.current = true;
          setResult(r);
        }
      }
    });
  }, []);

  const currentQ = QUESTIONS[stepIndex] ?? QUESTIONS[0];
  const canAdvance = !!answers[currentQ.key];

  function submitAssessment(finalAnswers: Answers) {
    setLoading(true);
    setApiError(null);

    const score = (key: string) => ({ A:1, B:2, C:3, D:4, E:5 }[finalAnswers[key] ?? "A"] ?? 1);
    const userAxes = {
      stamina: score("Q1"), power: score("Q2"), strength: score("Q3"), agility: score("Q4"),
      water: score("Q5"), altitude: score("Q6"), focus: score("Q7"), nerve: score("Q8"),
    };

    const profile = { ace: userAxes };
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
    <div className="max-w-xl mx-auto px-5 sm:px-6 py-20 sm:py-24">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase">Adventure Matchmaker</p>
          <span className="text-white/25 text-xs font-medium">{stepIndex + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${AXIS_COLORS[currentQ.axis.toLowerCase()] ?? "#ff5100"}20`, color: AXIS_COLORS[currentQ.axis.toLowerCase()] ?? "#ff5100" }}
          >
            {AXIS_ICONS[currentQ.axis.toLowerCase()]}
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">{currentQ.axis}</h1>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-9">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < stepIndex ? "#ff5100" : i === stepIndex ? "#ff5100cc" : "rgba(255,255,255,0.1)" }}
          />
        ))}
      </div>

      {/* Question */}
      <div className="space-y-2.5">
        <h2 className="text-white text-xl sm:text-2xl font-semibold leading-snug mb-1.5">{currentQ.question}</h2>
        {currentQ.hint && <p className="text-white/35 text-sm mb-5 leading-relaxed">{currentQ.hint}</p>}
        {currentQ.options.map(o => (
          <OptionBtn
            key={o.v}
            value={o.v}
            label={o.l}
            sub={undefined}
            selected={answers[currentQ.key] === o.v}
            onClick={() => {
              const updated = { ...answers, [currentQ.key]: o.v };
              setAnswers(updated);
              // Auto-advance after brief delay so selection is visible
              setTimeout(() => {
                if (stepIndex < QUESTIONS.length - 1) {
                  setStepIndex(stepIndex + 1);
                } else {
                  submitAssessment(updated);
                }
              }, 180);
            }}
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
      <div className="flex items-center mt-8">
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
      </div>

      <p className="text-center text-white/15 text-xs mt-6">
        {stepIndex + 1} of {QUESTIONS.length}
      </p>
    </div>
  );
}
