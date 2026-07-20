"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight, ChevronLeft, MapPin, ArrowRight, RotateCcw,
  Shield, CheckCircle2, AlertTriangle, Loader2, Wind, HeartPulse,
} from "lucide-react";
import { Flame, Zap, Dumbbell, Compass, Waves, Mountain, ScanEye, Ghost, TrendingUp, Lock } from "@/lib/localIcons";
import ACERadar from "@/components/ui/custom/ACERadar";
import Pill from "@/components/ui/custom/Pill";
import AchievementBadges from "@/components/ui/custom/AchievementBadges";
import AchievementShareButton from "@/components/ui/custom/AchievementShareButton";
import { saveProfile, loadProfile, clearProfile, saveProfileToServer, loadProfileFromServer } from "@/lib/matchmaker";
import { adventures as ALL_ADVENTURES } from "@/lib/data";
import { getACE, type ACE, type AceAxis } from "@/lib/ace";
import { getAchievements } from "@/lib/achievements";
import { awardXP } from "@/lib/awardXP";
import FadeInSection from "@/components/ui/custom/FadeInSection";

// ─── Sample radar animation ───────────────────────────────────────────────────

const SCAN_MS = 3200;

const AXIS_TICKER = [
  { key: "Stamina",  color: "#f97316", desc: "Sustained output across any adventure", icon: <Flame    className="w-3 h-3" /> },
  { key: "Power",    color: "#eab308", desc: "Explosive output when it counts most",  icon: <Zap      className="w-3 h-3" /> },
  { key: "Strength", color: "#84cc16", desc: "Force for carries, climbs and paddles", icon: <Dumbbell className="w-3 h-3" /> },
  { key: "Agility",  color: "#22d3ee", desc: "Coordination and control in motion",    icon: <Compass  className="w-3 h-3" /> },
  { key: "Water",    color: "#3b82f6", desc: "Aquatic ease — pool, sea or river",     icon: <Waves    className="w-3 h-3" /> },
  { key: "Altitude", color: "#a78bfa", desc: "Coping with exposure at high altitude", icon: <Mountain className="w-3 h-3" /> },
  { key: "Focus",    color: "#f43f5e", desc: "Staying sharp when conditions get hard",icon: <Shield   className="w-3 h-3" /> },
  { key: "Nerve",    color: "#10b981", desc: "Calm and grit in high-stakes moments",  icon: <Wind     className="w-3 h-3" /> },
];

function AxisTicker() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const swapAt = SCAN_MS * 0.88;
    let swapTimer: ReturnType<typeof setTimeout>;
    function scheduleCycle() {
      swapTimer = setTimeout(() => {
        setFade(false);
        setTimeout(() => { setIdx(i => (i + 1) % AXIS_TICKER.length); setFade(true); }, 220);
      }, swapAt);
    }
    scheduleCycle();
    const cycleTimer = setInterval(scheduleCycle, SCAN_MS);
    return () => { clearTimeout(swapTimer); clearInterval(cycleTimer); };
  }, []);

  const current = AXIS_TICKER[idx];
  return (
    <div className="mt-2 rounded-lg px-2.5 py-2 w-full" style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)" }}>
      <div style={{ opacity: fade ? 1 : 0, transition: "opacity 0.22s ease" }}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="shrink-0" style={{ color: current.color }}>{current.icon}</span>
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: current.color }}>{current.key}</span>
        </div>
        <p className="text-[9px] leading-none pl-[18px] truncate" style={{ color: "var(--text-tertiary)" }}>{current.desc}</p>
      </div>
    </div>
  );
}

// ─── Question definitions ──────────────────────────────────────────────────
// 2 questions per axis for finer calibration, except Water and Altitude
// (1 each — those are already well-pinned by a single concrete question).

const QUESTIONS = [
  {
    key: "stamina-1",
    axis: "Stamina",
    icon: <Flame className="w-4 h-4" />,
    question: "How long can you sustain moderate-to-vigorous effort before you need to stop?",
    hint: "Active exertion time, not time spent resting.",
    options: [
      { v: "A", l: "Under 1 hour", s: "Short bursts only" },
      { v: "B", l: "1–2 hours", s: "Light, relaxed pace" },
      { v: "C", l: "2–4 hours", s: "Steady, with breaks" },
      { v: "D", l: "4–6 hours", s: "Hard effort, most of a day" },
      { v: "E", l: "6+ hours", s: "Minimal fatigue, very long days" },
    ],
  },
  {
    key: "stamina-2",
    axis: "Stamina",
    icon: <Flame className="w-4 h-4" />,
    question: "The day after your hardest physical effort, how do you feel?",
    hint: "Genuine recovery, not mild tiredness.",
    options: [
      { v: "A", l: "Need 2+ days to recover", s: "Slow to bounce back" },
      { v: "B", l: "Sore and drained, want a rest day", s: "Depleted, but functional" },
      { v: "C", l: "Tired, but up for a lighter day", s: "Reduced, not full rest" },
      { v: "D", l: "Ready to repeat the effort", s: "Minimal carryover fatigue" },
      { v: "E", l: "Ready for an even harder day", s: "Rarely limited by recovery" },
    ],
  },
  {
    key: "power-1",
    axis: "Power",
    icon: <Zap className="w-4 h-4" />,
    question: "How much weight can you carry comfortably over a sustained period?",
    hint: "Load-bearing capacity, not a single short lift.",
    options: [
      { v: "A", l: "Under 5 kg", s: "Minimal load" },
      { v: "B", l: "5–8 kg", s: "Light load, short spells" },
      { v: "C", l: "8–12 kg", s: "Moderate load, longer spells" },
      { v: "D", l: "12–18 kg", s: "Heavy load, sustained" },
      { v: "E", l: "18 kg+", s: "Very heavy, no real limit" },
    ],
  },
  {
    key: "power-2",
    axis: "Power",
    icon: <Zap className="w-4 h-4" />,
    question: "How do you handle a short, maximal effort — a heavy lift, a sprint, a sudden hard push?",
    hint: "One hard push, not sustained effort.",
    options: [
      { v: "A", l: "Avoid it, ask for help", s: "Not my strength" },
      { v: "B", l: "Manage it slowly, real effort", s: "Costly, but doable" },
      { v: "C", l: "Handle it with some strain", s: "Solid effort" },
      { v: "D", l: "Handle it comfortably", s: "Rarely an issue" },
      { v: "E", l: "Explosive, no problem at all", s: "Genuinely strong" },
    ],
  },
  {
    key: "strength-1",
    axis: "Strength",
    icon: <Dumbbell className="w-4 h-4" />,
    question: "How does your body handle sustained strain under load over several hours?",
    hint: "Repeated demanding exertion, not one effort.",
    options: [
      { v: "A", l: "Tire quickly, avoid sustained strain", s: "Low tolerance for load" },
      { v: "B", l: "Manage short bursts, need recovery", s: "Works in short stretches" },
      { v: "C", l: "Steady output under moderate demand", s: "Holds up over a day" },
      { v: "D", l: "Sustain heavy strain, minimal fatigue", s: "Strong endurance" },
      { v: "E", l: "Power through extreme demand", s: "Rarely limited" },
    ],
  },
  {
    key: "strength-2",
    axis: "Strength",
    icon: <Dumbbell className="w-4 h-4" />,
    question: "How much can you lift or carry relative to your bodyweight, over a short distance?",
    hint: "Think gear, a fallen bike, a boat — not a gym max.",
    options: [
      { v: "A", l: "Struggle beyond light objects", s: "Limited lifting capacity" },
      { v: "B", l: "Roughly a quarter of my bodyweight", s: "Manageable with effort" },
      { v: "C", l: "A third to half my bodyweight", s: "Solid functional strength" },
      { v: "D", l: "Close to my full bodyweight", s: "Strong under load" },
      { v: "E", l: "More than my own bodyweight", s: "Exceptional raw strength" },
    ],
  },
  {
    key: "agility-1",
    axis: "Agility",
    icon: <Compass className="w-4 h-4" />,
    question: "How confidently can you move through unpredictable, physically demanding environments?",
    hint: "General coordination and control, not one setting.",
    options: [
      { v: "A", l: "Prefer flat, stable ground", s: "Uneven ground is hard" },
      { v: "B", l: "Manage minor obstacles carefully", s: "Slow, deliberate" },
      { v: "C", l: "Handle shifting conditions with care", s: "Steady, controlled" },
      { v: "D", l: "Move confidently, rarely slowed", s: "Rarely slowed down" },
      { v: "E", l: "Fully at ease in technical settings", s: "Exceptional control" },
    ],
  },
  {
    key: "agility-2",
    axis: "Agility",
    icon: <Compass className="w-4 h-4" />,
    question: "How comfortable are you balancing on unstable or moving surfaces?",
    hint: "Balance and coordination under shifting conditions.",
    options: [
      { v: "A", l: "Very uneasy, need support", s: "A weak point" },
      { v: "B", l: "Manage slowly and carefully", s: "Doable with focus" },
      { v: "C", l: "Comfortable at a measured pace", s: "Steady, controlled" },
      { v: "D", l: "Comfortable moving quickly", s: "Rarely a second thought" },
      { v: "E", l: "Fully at ease, barely notice it", s: "Natural balance" },
    ],
  },
  {
    key: "water-1",
    axis: "Water",
    icon: <Waves className="w-4 h-4" />,
    question: "What level of water conditions are you comfortable in?",
    hint: "Open water, not a controlled pool.",
    options: [
      { v: "A", l: "No open water — non-swimmer", s: "Needs support in water" },
      { v: "B", l: "Calm shallow water", s: "Comfortable wading" },
      { v: "C", l: "Open water swimming", s: "Calm lake or sea" },
      { v: "D", l: "Moving water, moderate currents", s: "Confident against resistance" },
      { v: "E", l: "Strong currents, rough conditions", s: "At ease in rough water" },
    ],
  },
  {
    key: "altitude-1",
    axis: "Altitude",
    icon: <Mountain className="w-4 h-4" />,
    question: "At what altitude have you stayed active for days without significant symptoms?",
    hint: "Time genuinely lived and moved at elevation, not just passed through.",
    options: [
      { v: "A", l: "Below 1,500m", s: "Sea level to low hills" },
      { v: "B", l: "1,500–2,500m", s: "Minor symptoms, adapted" },
      { v: "C", l: "2,500–3,500m", s: "Acclimatised well" },
      { v: "D", l: "3,500–4,500m", s: "Handled real altitude" },
      { v: "E", l: "Above 4,500m", s: "Thin air, no issue" },
    ],
  },
  {
    key: "focus-1",
    axis: "Focus",
    icon: <Shield className="w-4 h-4" />,
    question: "How comfortable are you with real physical exposure — heights, drops, a slim margin for error?",
    hint: "Real consequences, not just visual height.",
    options: [
      { v: "A", l: "Very uncomfortable, avoid exposure", s: "Causes real distress" },
      { v: "B", l: "Manageable with slow, careful movement", s: "Pushes through it" },
      { v: "C", l: "Comfortable with solid technique", s: "Focused, not anxious" },
      { v: "D", l: "Comfortable in high-exposure situations", s: "Unaffected by exposure" },
      { v: "E", l: "Fully at ease, regardless", s: "Thrives under exposure" },
    ],
  },
  {
    key: "nerve-1",
    axis: "Nerve",
    icon: <Ghost className="w-4 h-4" />,
    question: "If you were stuck somewhere remote — no signal, hours from help — how do you respond?",
    hint: "No phone, no guide. Real self-reliance.",
    options: [
      { v: "A", l: "Prefer to stay near help", s: "Needs support nearby" },
      { v: "B", l: "OK for short stretches, others nearby", s: "Brief stints manageable" },
      { v: "C", l: "Can manage basic needs, short delays", s: "1–2 days, prepared" },
      { v: "D", l: "Self-sufficient in remote conditions", s: "Calm, multi-day" },
      { v: "E", l: "Fully expedition-level self-reliant", s: "Weeks alone, no issue" },
    ],
  },
];

// ─── Calibration / decay questions ─────────────────────────────────────────
// Cross-cutting — not tied to a single axis. Each has 4 real severity tiers
// (A–D) plus a 5th "prefer not to say" option (E), which applies no
// adjustment (multiplier 1.0) — same as skipping, but always an explicit
// choice. Answering with a real tier discounts specific axes to correct for
// detraining or health factors that self-rated capability tends to miss.

const DECAY_QUESTIONS = [
  {
    key: "decay-recency",
    title: "Recent activity",
    question: "When did you last complete a demanding physical day outdoors?",
    hint: "Fitness fades over time, even if it doesn't feel that way.",
    affects: ["stamina", "power", "altitude"],
    options: [
      { v: "A", l: "This month", mult: 1.0 },
      { v: "B", l: "1–6 months ago", mult: 0.88 },
      { v: "C", l: "6–12 months ago", mult: 0.75 },
      { v: "D", l: "Over a year ago, or can't recall", mult: 0.6 },
      { v: "E", l: "Prefer not to say", mult: 1.0 },
    ],
  },
  {
    key: "decay-joint",
    title: "Joint history",
    question: "Any ongoing knee, ankle, hip, or back issues that flare up under load?",
    hint: "Adjusts load-bearing axes, not effort or willpower.",
    affects: ["strength", "power", "agility"],
    options: [
      { v: "A", l: "None", mult: 1.0 },
      { v: "B", l: "Mild, occasional", mult: 0.88 },
      { v: "C", l: "Managed — brace, physio, meds", mult: 0.75 },
      { v: "D", l: "Significant, limits me", mult: 0.6 },
      { v: "E", l: "Prefer not to say", mult: 1.0 },
    ],
  },
  {
    key: "decay-respiratory",
    title: "Respiratory, cardiac & smoking",
    question: "Any respiratory or cardiac conditions, or a smoking/vaping habit, that affects exertion?",
    hint: "Matters for sustained effort, altitude, and breath control in the water.",
    affects: ["stamina", "altitude", "water"],
    options: [
      { v: "A", l: "None — no conditions, don't smoke", mult: 1.0 },
      { v: "B", l: "Mild — occasional smoking/vaping, or a well-managed condition", mult: 0.85 },
      { v: "C", l: "Moderate — regular smoking, or a condition needing care", mult: 0.72 },
      { v: "D", l: "Significant — heavy smoking and/or a serious condition", mult: 0.55 },
      { v: "E", l: "Prefer not to say", mult: 1.0 },
    ],
  },
  {
    key: "decay-acute",
    title: "Current condition",
    question: "Are you currently recovering from any injury, illness, or surgery?",
    hint: "A temporary state — separate from any ongoing chronic condition.",
    affects: ["stamina", "power", "strength", "agility", "nerve"],
    options: [
      { v: "A", l: "Not at all", mult: 1.0 },
      { v: "B", l: "Minor, nearly recovered", mult: 0.9 },
      { v: "C", l: "Still recovering, limits me somewhat", mult: 0.75 },
      { v: "D", l: "Early recovery — recent surgery or major illness", mult: 0.58 },
      { v: "E", l: "Prefer not to say", mult: 1.0 },
    ],
  },
  {
    key: "decay-age",
    title: "Age bracket",
    question: "Which age range are you in?",
    hint: "Explosive power and muscle strength decline with age faster than endurance does — this fine-tunes, it doesn't judge.",
    affects: ["power", "strength"],
    options: [
      { v: "A", l: "Under 35", mult: 1.0 },
      { v: "B", l: "35–49", mult: 0.93 },
      { v: "C", l: "50–64", mult: 0.83 },
      { v: "D", l: "65+", mult: 0.72 },
      { v: "E", l: "Prefer not to say", mult: 1.0 },
    ],
  },
  {
    key: "decay-vestibular",
    title: "Balance & vestibular",
    question: "Do you experience vertigo, motion sickness, or a diagnosed balance disorder?",
    hint: "Inner-ear and balance — distinct from the joint issues covered earlier.",
    affects: ["agility", "focus", "water"],
    options: [
      { v: "A", l: "None", mult: 1.0 },
      { v: "B", l: "Mild motion sickness, rarely an issue", mult: 0.88 },
      { v: "C", l: "Occasional vertigo, or managed with medication", mult: 0.75 },
      { v: "D", l: "Significant, affects balance regularly", mult: 0.58 },
      { v: "E", l: "Prefer not to say", mult: 1.0 },
    ],
  },
  {
    key: "decay-medication",
    title: "Medication effects",
    question: "On any medication that affects your alertness, coordination, or reaction time?",
    hint: "Sedatives, beta-blockers, antihistamines and similar — relevant for focus-critical situations.",
    affects: ["focus", "nerve", "agility"],
    options: [
      { v: "A", l: "None", mult: 1.0 },
      { v: "B", l: "Mild, rarely noticeable", mult: 0.88 },
      { v: "C", l: "Noticeable effect on alertness or coordination", mult: 0.75 },
      { v: "D", l: "Significant effect, needs real caution", mult: 0.58 },
      { v: "E", l: "Prefer not to say", mult: 1.0 },
    ],
  },
];

type Answers = Partial<Record<string, string>>;
type Step = { type: "capability"; q: (typeof QUESTIONS)[number] } | { type: "decay"; q: (typeof DECAY_QUESTIONS)[number] };
const ALL_STEPS: Step[] = [
  ...QUESTIONS.map((q) => ({ type: "capability" as const, q })),
  ...DECAY_QUESTIONS.map((q) => ({ type: "decay" as const, q })),
];

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
  focus:    <ScanEye  className="w-3.5 h-3.5" />,
  nerve: <Ghost    className="w-3.5 h-3.5" />,
};

// ─── Types from API ───────────────────────────────────────────────────────────

interface AnalysisResult {
  userAxes: Record<string, number>;
  adventures: EnrichedAdventure[];
  trainingPlan: TrainingItem[];
  rawAxes?: Record<string, number>;
  decayNotes?: string[];
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
  tagline: string;
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

// ─── Option button ────────────────────────────────────────────────────────────

function OptionBtn({
  value, label, sub, selected, onClick,
}: { value: string; label: string; sub?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-2xl border transition-all duration-150 active:scale-[0.99]"
      style={{
        background: selected ? "rgba(255,81,0,0.12)" : "var(--bg-surface)",
        borderColor: selected ? "#ff5100" : "var(--border-subtle)",
        boxShadow: selected ? "0 0 0 1px rgba(255,81,0,0.3)" : "none",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 transition-all"
          style={{
            borderColor: selected ? "#ff5100" : "var(--border-subtle)",
            color: selected ? "#ff5100" : "var(--text-tertiary)",
            background: selected ? "rgba(255,81,0,0.2)" : "transparent",
          }}
        >
          {value}
        </span>
        <div className="min-w-0">
          <p className="t-text font-medium text-sm">{label}</p>
          {sub && <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--text-tertiary)" }}>{sub}</p>}
        </div>
      </div>
    </button>
  );
}

// ─── Intro screen ─────────────────────────────────────────────────────────────


const INTRO_AXES_DATA = [
  { label: "Stamina",  color: "#f97316", v: 4 },
  { label: "Power",    color: "#eab308", v: 3 },
  { label: "Strength", color: "#84cc16", v: 4 },
  { label: "Agility",  color: "#22d3ee", v: 3 },
  { label: "Water",    color: "#3b82f6", v: 1 },
  { label: "Altitude", color: "#a78bfa", v: 5 },
  { label: "Focus",    color: "#f43f5e", v: 4 },
  { label: "Nerve",    color: "#10b981", v: 3 },
];

function IntroScreen({ onStart, onViewResults, hasProfile }: { onStart: () => void; onViewResults: () => void; hasProfile: boolean }) {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden px-5 py-12 sm:py-0">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-8"
        style={{ background: "radial-gradient(ellipse, #ff5100 0%, #a78bfa 60%, transparent 100%)" }} />

      <div className="relative w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">

          {/* ── Left: copy + CTAs ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[#ff5100] text-[10px] font-black tracking-[0.25em] uppercase">Adventure Matchmaker</p>
            </div>

            <h1 className="t-text text-3xl sm:text-4xl font-black tracking-tight leading-[1.05] mb-3">
              Adventures built for<br /><span style={{ color: "#ff5100" }}>your body</span>
            </h1>

            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--text-tertiary)" }}>
              12 questions across stamina, strength, altitude, nerve and more, plus a few optional calibration questions. We map your capability and surface the adventures that actually fit.
            </p>

            <p className="text-[11px] tracking-wide mb-2 text-center" style={{ color: "var(--text-muted)" }}>Takes about 3 minutes</p>

            <div className="flex flex-col gap-2">
              {hasProfile && (
                <button onClick={onViewResults}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
                  style={{ background: "#ff5100", boxShadow: "0 4px 20px rgba(255,81,0,0.35)" }}>
                  View My Results <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button onClick={onStart}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all hover:brightness-110"
                style={hasProfile
                  ? { background: "var(--bg-surface-2)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }
                  : { background: "#ff5100", color: "#fff", boxShadow: "0 4px 20px rgba(255,81,0,0.35)" }
                }>
                {hasProfile
                  ? <><RotateCcw className="w-3.5 h-3.5" />Retake Assessment</>
                  : <>Begin Assessment <Zap className="w-4 h-4" /></>}
              </button>
              <Link href="/ace"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold transition-all"
                style={{ border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                Learn more about ACE<sup>™</sup> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ── Right: radar card ── */}
          {!hasProfile && (
            <div className="shrink-0 w-full sm:w-[270px]">
              <div className="relative rounded-2xl overflow-hidden flex flex-col p-4"
                style={{ background: "linear-gradient(160deg, var(--bg-surface-2) 0%, var(--bg-surface) 100%)", border: "1px solid var(--border-subtle)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-5 h-5 pointer-events-none" style={{ borderTop: "1px solid rgba(255,81,0,0.4)", borderLeft: "1px solid rgba(255,81,0,0.4)" }} />
                <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none" style={{ borderTop: "1px solid rgba(255,81,0,0.4)", borderRight: "1px solid rgba(255,81,0,0.4)" }} />
                <div className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none" style={{ borderBottom: "1px solid rgba(255,81,0,0.4)", borderLeft: "1px solid rgba(255,81,0,0.4)" }} />
                <div className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none" style={{ borderBottom: "1px solid rgba(255,81,0,0.4)", borderRight: "1px solid rgba(255,81,0,0.4)" }} />
                {/* Header */}
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--text-muted)" }}>Sample Capability Profile</span>
                </div>
                {/* Radar */}
                <div className="flex items-center justify-center">
                  <div className="rounded-xl p-1.5" style={{ background: "radial-gradient(ellipse at center, rgba(255,81,0,0.07) 0%, transparent 70%)", border: "1px solid var(--border-subtle)" }}>
                    <ACERadar ace={{ stamina: 4, power: 3, strength: 4, agility: 3, water: 1, altitude: 5, focus: 4, nerve: 3 }} size={220} showLabels />
                  </div>
                </div>
                {/* Axis ticker */}
                <AxisTicker />
                {/* Scan line */}
                <div className="absolute inset-x-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,81,0,0.45), transparent)", animation: `scanline ${SCAN_MS}ms linear infinite`, top: 0 }} />
                <style>{`@keyframes scanline { 0% { top:0%; opacity:0; } 8% { opacity:1; } 88% { opacity:1; } 100% { top:100%; opacity:0; } }`}</style>
              </div>
            </div>
          )}

        </div>
      </div>
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

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s < steps.length - 1 ? s + 1 : s));
    }, 2200);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#ff5100]/15 flex items-center justify-center mx-auto mb-8">
        <Loader2 className="w-8 h-8 text-[#ff5100] animate-spin" />
      </div>
      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Analysing</p>
      <h2 className="t-text text-2xl font-bold mb-8">Running your assessment</h2>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all"
            style={{
              background: i <= step ? "rgba(255,81,0,0.08)" : "var(--bg-surface)",
              borderColor: i <= step ? "rgba(255,81,0,0.25)" : "var(--border-subtle)",
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: i < step ? "#ff5100" : i === step ? "rgba(255,81,0,0.3)" : "var(--border-subtle)" }}
            >
              {i < step ? (
                <CheckCircle2 className="w-3 h-3 text-white" />
              ) : i === step ? (
                <Loader2 className="w-2.5 h-2.5 text-[#ff5100] animate-spin" />
              ) : null}
            </div>
            <p className="text-sm" style={{ color: i <= step ? "var(--text-primary)" : "var(--text-muted)" }}>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Capability readout ───────────────────────────────────────────────────────

const AXIS_ORDER = ["stamina", "power", "strength", "agility", "water", "altitude", "focus", "nerve"];

function CapabilityReadout({ axisLabels, axisDesc, axisColors, userAxes, rawAxes, decayNotes }: {
  axisLabels: Record<string, string>;
  axisDesc: Record<string, string>;
  axisColors: Record<string, string>;
  userAxes: { stamina: number; power: number; strength: number; agility: number; water: number; altitude: number; focus: number; nerve: number };
  rawAxes?: Record<string, number>;
  decayNotes?: string[];
}) {
  const [hoveredAxis, setHoveredAxis] = useState<AceAxis | null>(null);
  const hasCalibration = !!rawAxes && !!decayNotes?.length;

  return (
    <div className="px-5 sm:px-8 py-6 sm:py-7">
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-0">
        {/* Radar column */}
        <div className="shrink-0 flex flex-col items-center lg:items-start gap-3 mx-auto lg:mx-0 lg:pr-6">
          <p className="text-[10px] uppercase tracking-[0.28em] font-bold font-mono" style={{ color: "#ff5100" }}>
            Capability Radar
          </p>
          <ACERadar
            ace={userAxes}
            userAce={hasCalibration ? (rawAxes as typeof userAxes) : undefined}
            userColor="var(--accent-green)"
            size={230}
            showLabels
            highlightAxis={hoveredAxis}
          />
          {hasCalibration && (
            <div className="w-full max-w-[220px] rounded-lg px-3 py-2.5" style={{ background: "var(--accent-green-soft)", border: "1px solid var(--accent-green-border)" }}>
              <p className="text-[8px] font-mono font-bold uppercase tracking-wide mb-1" style={{ color: "var(--accent-green)" }}>Calibrated — see adjustments</p>
              <p className="text-[9px] leading-snug" style={{ color: "var(--text-tertiary)" }}>
                Solid = calibrated, dashed = raw self-report. Adjusted for: {decayNotes!.map(n => n.split(":")[0]).join(", ").toLowerCase()}.
              </p>
            </div>
          )}
        </div>

        {/* Section divider — same treatment as the Achievements Unlocked split */}
        <div className="border-t lg:border-t-0 lg:border-l" style={{ borderColor: "var(--border-subtle)" }} />

        {/* Breakdown column — heading sits on the same line as Capability Radar */}
        <div className="flex-1 min-w-0 pt-6 lg:pt-0 lg:pl-6">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-2.5" style={{ color: "#ff5100" }}>
            Capability Breakdown
          </p>

          <div className="flex flex-col">
            {AXIS_ORDER.map((axis) => {
              const color = axisColors[axis] ?? "#ff5100";
              const val = (userAxes as Record<string, number>)[axis] ?? 0;
              const isHovered = hoveredAxis === axis;
              return (
                <div
                  key={axis}
                  className="group relative flex items-center gap-2 py-1 px-1.5 -mx-1.5 rounded-lg transition-colors duration-150"
                  style={{ background: isHovered ? `${color}14` : "transparent" }}
                  onMouseEnter={() => setHoveredAxis(axis as AceAxis)}
                  onMouseLeave={() => setHoveredAxis(null)}
                >
                  <span className="text-[9px] font-black uppercase tracking-[0.08em] w-[46px] shrink-0" style={{ color }}>
                    {axisLabels[axis]}
                  </span>
                  <div className="flex-1 h-[3px] rounded-full" style={{ background: "var(--border-subtle)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(val / 5) * 100}%`, background: color }} />
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold tabular-nums w-5 text-right shrink-0 transition-transform duration-150"
                    style={{ color, transform: isHovered ? "scale(1.25)" : "scale(1)" }}
                  >
                    {val}
                  </span>

                  {/* Hover tooltip — per-axis comment, hidden until hovered */}
                  <div
                    className="pointer-events-none absolute left-0 right-0 bottom-full mb-2.5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-20"
                  >
                    <div className="rounded-lg px-2.5 py-2 shadow-xl" style={{ background: "var(--bg-surface-2)", border: `1px solid ${color}40` }}>
                      <p className="text-[9px] leading-snug" style={{ color: "var(--text-secondary)" }}>{axisDesc[axis]}</p>
                    </div>
                    {/* caret */}
                    <div
                      className="w-2 h-2 rotate-45 ml-4 -mt-1"
                      style={{ background: "var(--bg-surface-2)", borderRight: `1px solid ${color}40`, borderBottom: `1px solid ${color}40` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Training focus ───────────────────────────────────────────────────────────

interface TrainingItem { axis: string; current_level: number; required_level: number; recommendation: string; }

function TrainingSection({ trainingPlan, axisColors }: {
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
    <div className="px-5 sm:px-8 py-6 sm:py-7">
      <p className="text-[10px] uppercase tracking-[0.28em] font-bold font-mono mb-1" style={{ color: "#ff5100" }}>
        Training Focus
      </p>
      <p className="text-[13px] mb-5" style={{ color: "var(--text-secondary)" }}>Build these up to unlock more adventures.</p>

      <div>
        {visible.map((item, i) => {
          const color = axisColors[item.axis] ?? "#ff5100";
          const gap   = item.required_level - item.current_level;
          return (
            <div key={i} className="flex items-start gap-4 py-3.5" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)" }}>
              <span className="text-[11px] font-mono font-bold tabular-nums shrink-0 pt-0.5" style={{ color }}>
                {String(item.current_level).padStart(2, "0")}→{String(item.required_level).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="t-text font-bold text-sm uppercase tracking-wide" style={{ color }}>{item.axis}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ border: `1px solid ${color}40`, color }}>
                    +{gap} level{gap > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-[11px] leading-[1.55]" style={{ color: "var(--text-tertiary)" }}>{item.recommendation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand toggle */}
      {hasMore && (
        <button onClick={() => setShowAll(v => !v)}
          className="w-full mt-2 py-2.5 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}>
          {showAll ? "Show less" : `Show ${sorted.length - 3} more areas`}
        </button>
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
  const { userAxes, adventures: enriched, trainingPlan, rawAxes, decayNotes } = result;

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

  // Ruler position math — shared by the ruler and the status line below it
  const currentRankIndex = tierRank ? RANKS.indexOf(tierRank) : 0;
  const totalRanks = RANKS.length;
  const nextRank = RANKS[currentRankIndex + 1] ?? null;
  const rawPct = nextRank
    ? Math.min(100, Math.round(((totalScore - RANKS[currentRankIndex].minScore) / (nextRank.minScore - RANKS[currentRankIndex].minScore)) * 100))
    : 100;
  const progressPct = Math.max(0, rawPct);
  const ptsNeeded = nextRank ? nextRank.minScore - totalScore : 0;
  const rulerPct = nextRank
    ? ((currentRankIndex + progressPct / 100) / (totalRanks - 1)) * 100
    : 100;

  const AXIS_LABELS: Record<string, string> = {
    stamina: "Stamina", power: "Power", strength: "Strength",
    agility: "Agility", water: "Water", altitude: "Altitude",
    focus: "Focus", nerve: "Nerve",
  };
  const AXIS_DESC_BY_LEVEL: Record<string, string[]> = {
    //                  Lv1                                                                    Lv2                                                                Lv3                                                                    Lv4                                                        Lv5
    stamina:  ["Comfortable moving for under an hour before you need a real break.", "You hold a relaxed pace for 1–2 hours before tiring.", "You keep a steady pace for 2–4 hours with normal rest stops.", "You push through 4–6 hours of hard effort without burning out.", "You sustain 6+ hours of hard effort with barely any drop-off."],
    power:    ["You manage light loads — comfortably under 5kg — without strain.", "You carry a 5–8kg pack for short stretches without much trouble.", "You handle an 8–12kg load comfortably over longer stretches.", "You haul 12–18kg of gear all day and still perform.", "You move 18kg+ loads with no real ceiling in sight."],
    strength: ["You manage everyday lifting, but heavier loads wear you down fast.", "You can lift roughly a quarter of your bodyweight without much strain.", "You handle a third to half your bodyweight with solid control.", "You sustain loads close to your own bodyweight without losing form.", "You lift beyond your own bodyweight — genuinely elite raw strength."],
    agility:  ["Flat, predictable ground is where you move most confidently.", "You pick your way carefully over roots, gravel and minor obstacles.", "You cross loose rock, scree and uneven ground without much hesitation.", "You stay sure-footed scrambling over boulders and steep, broken terrain.", "You move with full control on exposed, technical ground — glaciers, via ferrata, sheer scrambles."],
    water:    ["You're comfortable wading in calm, shallow water.", "You swim confidently in a calm lake or sheltered sea.", "You hold your own swimming in open water and mild chop.", "You stay in control in moving water and moderate currents.", "You're at home in strong currents and rough, open-ocean conditions."],
    altitude: ["You've stayed active without issue up to about 1,500m.", "You acclimatise well between 1,500–2,500m, with only minor symptoms.", "You handle 2,500–3,500m for multiple days without it slowing you.", "You stay strong and sharp between 3,500–4,500m.", "You operate above 4,500m — thin air barely touches your performance."],
    focus:    ["Real exposure — heights, drops, narrow ledges — is genuinely uncomfortable for you.", "You push through exposed sections slowly and carefully.", "You stay composed on exposed terrain once you've got solid footing.", "You perform well even when the margin for error gets slim.", "Sheer drops and high exposure don't rattle your focus at all."],
    nerve:    ["You prefer staying close to help rather than going it alone.", "You're okay with short remote stretches as long as others are nearby.", "You can manage a day or two remote, self-sufficient with basic prep.", "You operate calmly solo for multiple days, far from any help.", "You're built for weeks alone in genuine wilderness, no support needed."],
  };
  const AXIS_DESC: Record<string, string> = Object.fromEntries(
    Object.entries(AXIS_DESC_BY_LEVEL).map(([axis, levels]) => {
      const lv = (userAxes as Record<string, number>)[axis] ?? 1;
      return [axis, levels[Math.min(Math.max(lv, 1), 5) - 1]];
    })
  );

  const sectionBorder = { borderTop: "1px solid var(--border-subtle)" };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

      {/* ── PAGE TITLE ────────────────────────────────────────────────────────── */}
      <FadeInSection>
      <div className="mb-5 sm:mb-6">
        <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.25em] uppercase mb-2">Adventure Matchmaker</p>
        <h2 className="t-text text-2xl sm:text-3xl font-black tracking-tight">Adventure Capability Engine Profile</h2>
      </div>
      </FadeInSection>

      {/* ── THE DOCUMENT ──────────────────────────────────────────────────────── */}
      <div className="rounded-[24px] sm:rounded-[28px] border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.25)" }}>

        {/* ── MASTHEAD: score + tier + ruler ── */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-7 sm:pb-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.28em]" style={{ color: "#ff5100" }}>Adventure Capability Engine</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-green)" }} />
              <p className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "var(--accent-green)" }}>Assessment Complete</p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-x-5 gap-y-2 mb-8">
            <div className="flex items-baseline">
              <span className="text-[56px] sm:text-[72px] font-mono font-bold leading-none tabular-nums" style={{ color: tier.color }}>{totalScore}</span>
              <span className="text-lg sm:text-xl font-mono font-bold" style={{ color: "var(--text-muted)" }}>/40</span>
            </div>
            <div className="pb-1 sm:pb-2">
              <p className="text-[9px] uppercase tracking-[0.22em] font-bold mb-0.5" style={{ color: "var(--text-tertiary)" }}>Capability Tier</p>
              <h1 className="text-3xl sm:text-[40px] font-black tracking-tight leading-none" style={{ color: tier.color }}>{tier.label}</h1>
            </div>
          </div>

          {/* Tier ruler — signature element */}
          <div className="relative">
            <div className="relative h-[2px] rounded-full" style={{ background: "var(--border-default)" }}>
              <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${rulerPct}%`, background: tier.color }} />
              {RANKS.map((rank, i) => (
                <div key={rank.label} className="absolute top-1/2" style={{ left: `${(i / (totalRanks - 1)) * 100}%`, transform: "translate(-50%, -50%)" }}>
                  <div className="w-px h-3" style={{ background: i <= currentRankIndex ? tier.color : "var(--border-default)" }} />
                </div>
              ))}
              <div className="absolute top-1/2 transition-all duration-700" style={{ left: `${rulerPct}%`, transform: "translate(-50%, -50%)" }}>
                <div className="w-3 h-3 rounded-full border-2" style={{ background: tier.color, borderColor: "var(--bg-surface)", boxShadow: `0 0 10px ${tier.color}` }} />
              </div>
            </div>

            <div className="relative mt-3 h-4">
              {RANKS.map((rank, i) => (
                <span
                  key={rank.label}
                  className="absolute text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wide whitespace-nowrap top-0"
                  style={{
                    left: `${(i / (totalRanks - 1)) * 100}%`,
                    transform: i === 0 ? "none" : i === totalRanks - 1 ? "translateX(-100%)" : "translateX(-50%)",
                    color: i === currentRankIndex ? tier.color : i < currentRankIndex ? "var(--text-tertiary)" : "var(--text-secondary)",
                  }}
                >
                  {rank.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-5 rounded-xl px-3.5 py-3" style={{ background: `${tier.color}0c`, border: `1px solid ${tier.color}25` }}>
            <div className="flex items-center gap-3 min-w-0">
              {tierRank && (
                <div className="shrink-0" style={{ color: tier.color }}>
                  {tierRank.icon}
                </div>
              )}
              <p className="text-[12px] leading-snug truncate" style={{ color: "var(--text-secondary)" }}>
                {nextRank
                  ? <><span className="font-mono font-bold" style={{ color: tier.color }}>{ptsNeeded}</span> points to <span className="font-bold" style={{ color: nextRank.color }}>{nextRank.label}</span></>
                  : <>Pinnacle rank — <span className="italic">maximum capability tier reached</span>.</>}
              </p>
            </div>
            {trainingPlan.length > 0 && (
              <a
                href="#training-focus"
                onClick={(e) => { e.preventDefault(); document.getElementById("training-focus")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className="shrink-0 inline-flex items-center gap-1.5 pl-3 pr-2.5 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all hover:brightness-110"
                style={{ background: tier.color, color: "#fff" }}
              >
                How to improve
                <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* ── CAPABILITY READOUT + ACHIEVEMENTS ── */}
        <div style={sectionBorder}>
          <CapabilityReadout
            axisLabels={AXIS_LABELS}
            axisDesc={AXIS_DESC}
            axisColors={AXIS_COLORS}
            userAxes={userAxes as { stamina: number; power: number; strength: number; agility: number; water: number; altitude: number; focus: number; nerve: number }}
            rawAxes={rawAxes}
            decayNotes={decayNotes}
          />
          {achievements.length > 0 && (
            <div
              className="px-5 sm:px-8 py-6 sm:py-7 border-t"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-center justify-between gap-2 mb-5">
                <p className="text-[10px] uppercase tracking-[0.28em] font-bold font-mono" style={{ color: "#ff5100" }}>
                  Achievements Unlocked
                </p>
                <AchievementShareButton title={`My ACE™ Capability Profile — ${tier.label}`} />
              </div>
              <AchievementBadges ace={resultAce} heading={false} variant="list" maxListHeight={52} />
            </div>
          )}
        </div>

        {/* ── MATCHED ADVENTURES — the point of the whole assessment ── */}
        <div className="px-5 sm:px-8 py-6 sm:py-7" style={sectionBorder}>
          <p className="text-[10px] uppercase tracking-[0.28em] font-bold font-mono mb-1" style={{ color: "#ff5100" }}>
            Matched Adventures
          </p>
          <p className="text-[11px] mb-4" style={{ color: "var(--text-secondary)" }}>
            Every adventure checked against your 8-axis ACE profile above.
          </p>
          <AdventureSection
            label="Ready Now"
            sublabel="Adventures within your current capability"
            icon={<CheckCircle2 className="w-4 h-4" />}
            adventures={[...inZone].sort((a, b) => (a.riskLevel ?? 0) - (b.riskLevel ?? 0)).slice(0, 6)}
            totalCount={inZone.length}
            exploreUrl="/explore?ace=ready"
            accentColor="#4ade80"
            defaultOpen
            isFirst
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

        {/* ── TRAINING FOCUS ── */}
        {trainingPlan.length > 0 && (
          <div id="training-focus" style={{ ...sectionBorder, scrollMarginTop: 88 }}>
            <TrainingSection
              trainingPlan={trainingPlan}
              axisColors={AXIS_COLORS}
              axisIcons={AXIS_ICONS}
            />
          </div>
        )}
      </div>

      {/* ── CTA BUTTONS ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">
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
          className="sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98]"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
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
  label, sublabel, icon, adventures: list, accentColor, defaultOpen = false, totalCount, exploreUrl, isFirst = false,
}: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  adventures: EnrichedAdventure[];
  accentColor: string;
  defaultOpen?: boolean;
  totalCount?: number;
  exploreUrl?: string;
  isFirst?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (list.length === 0) return null;
  const hiddenCount = totalCount ? totalCount - list.length : 0;

  return (
    <div style={{ borderTop: isFirst ? "none" : "1px solid var(--border-subtle)" }}>
      {/* ── Accordion header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 transition-opacity hover:opacity-70 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="shrink-0" style={{ color: accentColor }}>{icon}</span>
          <div>
            <p className="font-bold text-[13px] sm:text-sm leading-snug uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>{label}</p>
            <p className="text-[10px] sm:text-[11px] mt-0.5 leading-snug" style={{ color: "var(--text-tertiary)" }}>{sublabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 ml-3">
          <span className="text-[13px] font-mono font-bold tabular-nums" style={{ color: accentColor }}>
            {String(totalCount ?? list.length).padStart(2, "0")}
          </span>
          <ChevronRight
            className="w-[15px] h-[15px] transition-transform duration-200 shrink-0"
            style={{ color: "var(--text-tertiary)", transform: open ? "rotate(90deg)" : "none" }}
          />
        </div>
      </button>

      {/* ── Expanded content ── */}
      {open && (
        <div className="pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map(a => (
              <Link
                key={a.slug}
                href={`/experiences/${a.slug}`}
                className="group rounded-xl overflow-hidden border transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}
              >
                {/* Image */}
                <div className="relative h-[140px] sm:h-[150px] overflow-hidden">
                  <Image
                    src={a.heroImage}
                    alt={a.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                </div>
                {/* Content */}
                <div className="px-3.5 pt-3 pb-3">
                  <h3 className="font-bold text-[13px] sm:text-sm leading-snug mb-1 group-hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-primary)" }}>{a.name}</h3>
                  <p className="text-[10.5px] leading-snug line-clamp-2 mb-2.5" style={{ color: "var(--text-tertiary)" }}>{a.tagline}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Pill type="type" value={a.type} clickable={false} />
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-medium border" style={{ background: "var(--bg-card)", color: "var(--text-tertiary)", borderColor: "var(--border-subtle)" }}>
                      <MapPin className="w-2 h-2" />{a.state}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View all */}
          {hiddenCount > 0 && exploreUrl && (
            <Link
              href={exploreUrl}
              className="flex items-center justify-center gap-2 w-full py-3 mt-3 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
              style={{ color: accentColor, border: `1px solid ${accentColor}30` }}
            >
              View all {totalCount} adventures
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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

function buildResult(userAxes: Record<string, number>, extra?: { rawAxes?: Record<string, number>; decayNotes?: string[] }): AnalysisResult {
  const enriched: EnrichedAdventure[] = ALL_ADVENTURES.map((adv) => {
    const req = getACE(adv);
    const axes = Object.keys(userAxes) as (keyof typeof userAxes)[];
    const weakAxes = axes.filter(ax => req[ax as keyof typeof req] > 0 && userAxes[ax] < req[ax as keyof typeof req]);
    const maxGap = weakAxes.reduce((max, ax) => Math.max(max, req[ax as keyof typeof req] - userAxes[ax]), 0);
    const status: "IN_ZONE" | "STRETCH" | "RESTRICTED" = maxGap === 0 ? "IN_ZONE" : maxGap <= 1 ? "STRETCH" : "RESTRICTED";

    return {
      id: adv.slug, slug: adv.slug, name: adv.name, heroImage: adv.heroImage,
      state: adv.state, region: (adv.region ?? "") as string,
      type: adv.type as string, difficulty: adv.difficulty as string,
      tagline: adv.tagline,
      altitude: adv.altitude, status, weakAxes, missingKeys: weakAxes,
      analysis: "",
      requirements: req as unknown as Record<string, number>, riskLevel: maxGap,
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
    .map(([ax, gap]) => ({
      axis: ax,
      current_level: userAxes[ax],
      required_level: userAxes[ax] + gap,
      recommendation: TRAINING_TIPS[ax] ?? "Train consistently to improve this capability.",
    }));

  return { userAxes, adventures: enriched, trainingPlan, rawAxes: extra?.rawAxes, decayNotes: extra?.decayNotes };
}


export default function MatchmakerClient() {
  const searchParams = useSearchParams();
  const [started, setStarted] = useState(() => searchParams.get("retake") === "1");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedResult, setSavedResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Scroll to top when arriving via retake link
  useEffect(() => {
    if (searchParams.get("retake") === "1") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [searchParams]);

  // Load previous result on mount — always show results if profile exists
  const autoShown = useRef(false);
  const isRetake = searchParams.get("retake") === "1";
  useEffect(() => {
    loadProfileFromServer().then((saved) => {
      if (saved?.ace) {
        const r = buildResult(saved.ace as unknown as Record<string, number>);
        setSavedResult(r);
        if (!autoShown.current && !isRetake) {
          autoShown.current = true;
          setResult(r);
        }
      }
    });
  }, []);

  const currentStep = ALL_STEPS[stepIndex] ?? ALL_STEPS[0];
  const canAdvance = currentStep.type === "decay" || !!answers[currentStep.q.key];

  function submitAssessment(finalAnswers: Answers) {
    setLoading(true);
    setApiError(null);

    const score = (letter: string | undefined) => ({ A: 1, B: 2, C: 3, D: 4, E: 5 }[letter ?? "A"] ?? 1);

    // Average the (1 or 2) capability questions per axis into a raw score.
    const axisTotals: Record<string, { sum: number; count: number }> = {};
    QUESTIONS.forEach((q) => {
      const axis = q.axis.toLowerCase();
      const val = score(finalAnswers[q.key]);
      const bucket = (axisTotals[axis] ??= { sum: 0, count: 0 });
      bucket.sum += val;
      bucket.count += 1;
    });
    const rawAxes: Record<string, number> = {};
    Object.entries(axisTotals).forEach(([axis, { sum, count }]) => {
      rawAxes[axis] = Math.min(5, Math.max(1, Math.round(sum / count)));
    });

    // Calibration layer — recency/health flags discount specific axes.
    // Skipped questions apply no adjustment (multiplier 1.0).
    const multipliers: Record<string, number> = {};
    const decayNotes: string[] = [];
    DECAY_QUESTIONS.forEach((dq) => {
      const chosen = finalAnswers[dq.key];
      if (!chosen) return; // skipped — no adjustment
      const opt = dq.options.find((o) => o.v === chosen);
      if (!opt || opt.mult === 1.0) return;
      dq.affects.forEach((axis) => { multipliers[axis] = (multipliers[axis] ?? 1.0) * opt.mult; });
      decayNotes.push(`${dq.title}: "${opt.l}" adjusted ${dq.affects.join(", ")}`);
    });

    const userAxes: Record<string, number> = {};
    Object.entries(axisTotals).forEach(([axis, { sum, count }]) => {
      const raw = sum / count;
      const decayed = raw * (multipliers[axis] ?? 1.0);
      userAxes[axis] = Math.min(5, Math.max(1, Math.round(decayed)));
    });

    const profile = { ace: userAxes as unknown as ACE };
    saveProfile(profile);
    saveProfileToServer(profile);
    awardXP("ace_complete");

    const anyDecayApplied = Object.keys(multipliers).some((axis) => userAxes[axis] !== rawAxes[axis]);
    setResult(buildResult(userAxes, anyDecayApplied ? { rawAxes, decayNotes } : undefined));
    setLoading(false);
  }

  function advance() {
    if (!canAdvance) return;
    if (stepIndex < ALL_STEPS.length - 1) {
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

  const isDecay = currentStep.type === "decay";
  const decayColor = "var(--accent-green)";

  function goNext(updated: Answers) {
    setAnswers(updated);
    setTimeout(() => {
      if (stepIndex < ALL_STEPS.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        submitAssessment(updated);
      }
    }, 180);
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-6 py-20 sm:py-24">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: isDecay ? decayColor : "#ff5100" }}>
            {isDecay ? "Calibration" : "Adventure Matchmaker"}
          </p>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{stepIndex + 1} / {ALL_STEPS.length}</span>
        </div>
        <div className="flex items-center gap-2.5 mb-1.5">
          {isDecay ? (
            <>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--accent-green-soft)", color: decayColor }}>
                <HeartPulse className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{currentStep.q.title}</h1>
            </>
          ) : (
            <>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${AXIS_COLORS[currentStep.q.axis.toLowerCase()] ?? "#ff5100"}20`, color: AXIS_COLORS[currentStep.q.axis.toLowerCase()] ?? "#ff5100" }}
              >
                {AXIS_ICONS[currentStep.q.axis.toLowerCase()]}
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{currentStep.q.axis}</h1>
            </>
          )}
        </div>
        {isDecay && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>A few quick questions on recency and health — these fine-tune your profile, and every one is optional.</p>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-9">
        {ALL_STEPS.map((step, i) => {
          const color = step.type === "decay" ? "#4ade80" : "#ff5100";
          return (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i < stepIndex ? color : i === stepIndex ? `${color}cc` : "var(--border-subtle)" }}
            />
          );
        })}
      </div>

      {/* Question */}
      <div className="space-y-2.5">
        <h2 className="text-xl sm:text-2xl font-semibold leading-snug mb-1.5" style={{ color: "var(--text-primary)" }}>{currentStep.q.question}</h2>
        {currentStep.q.hint && <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{currentStep.q.hint}</p>}
        {currentStep.q.options.map(o => (
          <OptionBtn
            key={o.v}
            value={o.v}
            label={o.l}
            sub={"s" in o ? o.s : undefined}
            selected={answers[currentStep.q.key] === o.v}
            onClick={() => goNext({ ...answers, [currentStep.q.key]: o.v })}
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
          className="flex items-center gap-1.5 transition-colors text-sm" style={{ color: "var(--text-muted)" }} onMouseEnter={e => { e.currentTarget.style.color = "var(--text-secondary)" }} onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)", opacity: 0.5 }}>
        {stepIndex + 1} of {ALL_STEPS.length}
      </p>
    </div>
  );
}
