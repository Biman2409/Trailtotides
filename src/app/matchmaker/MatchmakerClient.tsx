"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, ChevronLeft, ArrowRight, RotateCcw,
  Shield, CheckCircle2, AlertTriangle, Loader2, Wind, HeartPulse,
  Stethoscope, Target, BookOpen,
} from "lucide-react";
import { Flame, Zap, Dumbbell, Compass, Waves, Mountain, ScanEye, Ghost, TrendingUp, Lock } from "@/lib/localIcons";
import { MatchmakerMark } from "@/components/ui/custom/BrandMarks";
import ACERadar from "@/components/ui/custom/ACERadar";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import { ADVENTURE_FACTS } from "@/lib/adventureFacts";
import {
  saveProfile, saveProfileToServer, loadProfileFromServer,
  saveMedicalFlagsToServer,
  saveConsent, saveConsentToServer, loadConsentFromServer, MATCHMAKER_CONSENT_VERSION,
  type StoredProfile,
} from "@/lib/matchmaker";
import { adventures as ALL_ADVENTURES } from "@/lib/data";
import { getACE, computeMatchScore, computeDifficulty, type ACE, type AceAxis } from "@/lib/ace";
import { awardXP } from "@/lib/awardXP";
import FadeInSection from "@/components/ui/custom/FadeInSection";
import {
  CAPABILITY_QUESTIONS, DECAY_QUESTIONS, MEDICAL_QUESTIONS, buildMedicalFlags,
  type CapabilityQuestion, type DecayQuestion, type MedicalQuestion,
} from "@/lib/matchmakerQuestions";
import { computeAceFromAnswers, estimateQuickAnswers, liveAxisScores, NOT_SURE, QUICK_KEYS } from "@/lib/matchmakerScoring";
import AceRadar, { AXIS_KEYS as ACE_AXIS_KEYS } from "@/app/ace/AceRadar";
import { ACE_THEME_CSS } from "@/app/ace/aceTheme";
import { profileAgeDays, bucketFor } from "@/lib/fitness";
import ResultsNextSteps, { GroupMatchPromo } from "./ResultsNextSteps";

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
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: current.color }}>{current.key}</span>
        </div>
        <p className="text-[9px] leading-none pl-[18px] truncate" style={{ color: "var(--text-tertiary)" }}>{current.desc}</p>
      </div>
    </div>
  );
}

// ─── Question definitions ──────────────────────────────────────────────────
// Question content lives in src/lib/matchmakerQuestions.ts (CAPABILITY_QUESTIONS,
// DECAY_QUESTIONS, MEDICAL_QUESTIONS, imported above); scoring math lives in
// src/lib/matchmakerScoring.ts.

type Answers = Partial<Record<string, string>>;
type Step =
  | { type: "capability"; q: CapabilityQuestion }
  | { type: "decay"; q: DecayQuestion }
  | { type: "medical"; q: MedicalQuestion };
const ALL_STEPS: Step[] = [
  ...CAPABILITY_QUESTIONS.map((q) => ({ type: "capability" as const, q })),
  ...DECAY_QUESTIONS.map((q) => ({ type: "decay" as const, q })),
  ...MEDICAL_QUESTIONS.map((q) => ({ type: "medical" as const, q })),
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
      className="w-full lg:h-full text-left px-5 py-4 lg:px-4 lg:py-3 rounded-2xl border transition-all duration-150 active:scale-[0.99]"
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

function IntroScreen({
  onStart, onQuickStart, onResume, resumeLabel, onViewResults, hasProfile, profileAgeDays: ageDays,
}: {
  onStart: () => void;
  onQuickStart: () => void;
  onResume?: () => void;
  resumeLabel?: string;
  onViewResults: () => void;
  hasProfile: boolean;
  profileAgeDays: number | null;
}) {
  const stale = ageDays !== null && ageDays >= 180;
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden px-5 pt-20 pb-12 sm:py-0">
      {/* Backdrop in the site's trail-to-tides theme: a warm glow behind the copy, a teal one
          opposite, and the hero's contour lines faintly over both */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(55% 60% at 12% 18%, rgba(255,81,0,0.16), transparent 70%), radial-gradient(50% 55% at 90% 72%, rgba(79,214,207,0.13), transparent 70%)" }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/hero/trail-contours.png)", backgroundSize: "900px auto", opacity: 0.11,
            WebkitMaskImage: "radial-gradient(75% 75% at 50% 45%, #000 30%, transparent 85%)",
            maskImage: "radial-gradient(75% 75% at 50% 45%, #000 30%, transparent 85%)",
          }}
        />
      </div>
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">

          {/* ── Left: copy + CTAs ── */}
          <div className="flex-1 min-w-0">
            <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-3 inline-flex items-center gap-1.5"><MatchmakerMark className="w-3.5 h-3.5" />Adventure Matchmaker</p>

            <h1 className="t-text text-3xl sm:text-4xl font-bold tracking-tight leading-[1.08] mb-3">
              Adventures built for <span style={{ color: "#ff5100" }}>your body</span>
            </h1>

            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
              Tell us about your fitness and experience, and we&apos;ll rate every adventure for you: ready, a stretch, or not yet.
            </p>

            {/* Reminder when a saved profile is getting old */}
            {hasProfile && stale && (
              <div className="rounded-xl px-4 py-3 mb-4 text-sm" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "var(--text-secondary)" }}>
                Your profile is {Math.floor((ageDays ?? 0) / 30)} months old. Fitness changes — a quick refresh keeps your matches honest.
              </div>
            )}

            <div className="flex flex-col gap-2">
              {/* Unfinished assessment comes first — it's the most likely thing they want */}
              {onResume && (
                <button onClick={onResume}
                  className="w-full flex items-center justify-between gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
                  style={{ background: "#ff5100", boxShadow: "0 4px 20px rgba(255,81,0,0.35)" }}>
                  <span>Pick up where you left off</span>
                  <span className="text-xs font-semibold opacity-80">{resumeLabel}</span>
                </button>
              )}
              {hasProfile && !onResume && (
                <button onClick={onViewResults}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
                  style={{ background: "#ff5100", boxShadow: "0 4px 20px rgba(255,81,0,0.35)" }}>
                  View my results <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Two ways in: a 2-minute estimate or the full assessment */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={onQuickStart}
                  className="flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl text-left transition-all hover:brightness-110"
                  style={!hasProfile && !onResume
                    ? { background: "#ff5100", color: "#fff", boxShadow: "0 4px 20px rgba(255,81,0,0.3)" }
                    : { background: "var(--bg-surface-2)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
                  <span className="text-sm font-bold">Quick match</span>
                  <span className="text-[11px] opacity-75">14 questions · 2 min</span>
                </button>
                <button onClick={onStart}
                  className="flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl text-left transition-all hover:brightness-110"
                  style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
                  <span className="text-sm font-bold">{hasProfile ? "Retake full" : "Full assessment"}</span>
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Most accurate · 3 min</span>
                </button>
              </div>

              {/* Secondary action — a real button, quieter than the two ways in above */}
              <Link
                href="/ace"
                className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:border-[rgba(255,81,0,0.45)]"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.12)", color: "#ff5100" }}>
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1 min-w-0 text-left">
                  <span className="block text-sm font-bold">How it works</span>
                  <span className="block text-[11px]" style={{ color: "var(--text-tertiary)" }}>How we score your readiness</span>
                </span>
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "#ff5100" }} />
              </Link>
            </div>
          </div>

          {/* ── Right: sample profile ── */}
          {!hasProfile && (
            <div className="shrink-0 w-full sm:w-[270px]">
              <div className="rounded-2xl flex flex-col p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>Sample profile</p>
                <div className="flex items-center justify-center">
                  <ACERadar ace={{ stamina: 4, power: 3, strength: 4, agility: 3, water: 1, altitude: 5, focus: 4, nerve: 3 }} size={220} showLabels />
                </div>
                <AxisTicker />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


// ─── Consent screen ───────────────────────────────────────────────────────────

function ConsentScreen({ onAccept, onBack }: { onAccept: () => void; onBack: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-6 py-20 sm:py-24">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] mb-3" style={{ color: "#ff5100" }}>Before you start</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>Three ground rules</h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          A few minutes of honest answers, and every adventure gets rated for your body.
        </p>
      </div>

      <ol className="space-y-5 mb-8">
        {[
          { icon: <Stethoscope className="w-4 h-4" />, title: "It's a guide, not a medical check", body: "Your score matches you to trips. It doesn't clear you to go — some still need a doctor's note." },
          { icon: <Target className="w-4 h-4" />, title: "Be honest", body: "Overrate yourself and you'll be matched to trips you're not ready for. You can retake it anytime." },
          { icon: <Lock className="w-4 h-4" />, title: "Health questions are optional and private", body: "If you answer them, they lower the scores they affect and flag risks on adventures. Never shown to others or sold, and you can delete them in settings." },
        ].map((item, i) => (
          <li key={item.title} className="flex gap-4">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)", color: "#ff5100" }}>{item.icon}</span>
            <div>
              <p className="text-[15px] font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                <span className="mr-1.5 tabular-nums" style={{ color: "var(--text-muted)" }}>0{i + 1}</span>{item.title}
              </p>
              <p className="text-sm leading-relaxed mt-0.5" style={{ color: "var(--text-secondary)" }}>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <label className="flex items-start gap-3 mb-3 px-4 py-3.5 rounded-xl cursor-pointer" style={{ background: "var(--bg-surface)", border: `1px solid ${checked ? "rgba(255,81,0,0.45)" : "var(--border-subtle)"}` }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded shrink-0"
          style={{ accentColor: "#ff5100" }}
        />
        <span className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          I understand this is guidance, not medical advice, and agree to my answers — including any health details — being used for my match, per the{" "}
          <Link href="/privacy" className="underline hover:text-[#ff5100] transition-colors">Privacy Policy</Link> and{" "}
          <Link href="/terms" className="underline hover:text-[#ff5100] transition-colors">Terms</Link>.
        </span>
      </label>
      <p className="text-xs mb-7" style={{ color: "var(--text-muted)" }}>
        Adventure sports carry real risk. A separate waiver applies when you book.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 transition-colors text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onAccept}
          disabled={!checked}
          className="ml-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
          style={{ background: "#ff5100", boxShadow: checked ? "0 4px 20px rgba(255,81,0,0.35)" : "none" }}
        >
          Agree and start <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  const steps = [
    "Reading your answers…",
    "Rating every adventure for you…",
    "Building your training tips…",
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
      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-4 inline-flex items-center gap-1.5"><MatchmakerMark className="w-3.5 h-3.5" />Adventure Matchmaker</p>
      <h2 className="t-text text-2xl font-bold mb-8">Building your fitness profile</h2>
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

// ─── Results: shared bits ─────────────────────────────────────────────────────

const AXIS_ORDER = ["stamina", "power", "strength", "agility", "water", "altitude", "focus", "nerve"];

const BUCKETS = {
  ready:   { key: "ready",   label: "Ready now", short: "Ready",   color: "#10b981", blurb: "Within your current capability", icon: <CheckCircle2 className="w-4 h-4" />, explore: "/explore?ace=ready" },
  stretch: { key: "stretch", label: "A stretch", short: "Stretch", color: "#f59e0b", blurb: "Just above your range — reachable with focused training", icon: <TrendingUp className="w-4 h-4" />, explore: "/explore?ace=stretch" },
  notyet:  { key: "notyet",  label: "Not yet",   short: "Not yet", color: "#f43f5e", blurb: "Needs capability well beyond your current profile", icon: <Lock className="w-4 h-4" />, explore: "/explore?ace=out-of-range" },
} as const;
type BucketKey = keyof typeof BUCKETS;

/** Counts up from 0 the first time it renders, so the score lands with a little weight */
function useCountUp(target: number, ms = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(target); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/** Circular gauge for the 0–40 score */
function ScoreGauge({ score, color }: { score: number; color: string }) {
  const shown = useCountUp(score);
  const R = 52, C = 2 * Math.PI * R;
  // A 270° arc, open at the bottom like a dial
  const arc = C * 0.75;
  const filled = arc * (shown / 40);
  return (
    <div className="relative w-[148px] h-[148px] sm:w-[168px] sm:h-[168px] shrink-0">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-[225deg]">
        <circle cx="64" cy="64" r={R} fill="none" stroke="var(--border-default)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${arc} ${C}`} />
        <circle cx="64" cy="64" r={R} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${filled} ${C}`}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[44px] sm:text-[52px] font-black tabular-nums leading-none" style={{ color }}>{shown}</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: "var(--text-tertiary)" }}>of 40</span>
      </div>
    </div>
  );
}

/** Five-segment level meter; `target` outlines the levels still to earn */
function LevelMeter({ value, target, color, size = "md" }: { value: number; target?: number; color: string; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className="flex gap-1" aria-label={`Level ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((l) => {
        const have = l <= value;
        const need = !have && target !== undefined && l <= target;
        return (
          <span
            key={l}
            className={`flex-1 ${h} rounded-full transition-colors duration-500`}
            style={{
              background: have ? color : "var(--border-subtle)",
              boxShadow: need ? `inset 0 0 0 1.5px ${color}` : have ? `0 0 8px ${color}55` : "none",
              opacity: need ? 0.9 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

function SectionHead({ eyebrow, title, sub, right }: { eyebrow: string; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5 sm:mb-6">
      <div className="min-w-0">
        <p className="text-[#ff5100] text-[11px] font-semibold tracking-[0.22em] uppercase mb-1.5">{eyebrow}</p>
        <h2 className="t-text text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
        {sub && <p className="text-[13px] mt-1 max-w-xl" style={{ color: "var(--text-secondary)" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

const panel = "relative overflow-hidden rounded-[24px] border";
const panelStyle: React.CSSProperties = {
  background: "linear-gradient(165deg, var(--bg-surface) 0%, var(--bg-card) 100%)",
  borderColor: "var(--border-subtle)",
  boxShadow: "0 24px 60px -24px rgba(var(--shadow-color), 0.35)",
};

// ─── Capabilities: radar + eight tiles ───────────────────────────────────────

function CapabilityPanel({ axisLabels, axisDesc, axisColors, axisIcons, userAxes, rawAxes, decayNotes }: {
  axisLabels: Record<string, string>;
  axisDesc: Record<string, string>;
  axisColors: Record<string, string>;
  axisIcons: Record<string, React.ReactNode>;
  userAxes: ACE;
  rawAxes?: Record<string, number>;
  decayNotes?: string[];
}) {
  const [hovered, setHovered] = useState<AceAxis | null>(null);
  const hasCalibration = !!rawAxes && !!decayNotes?.length;
  const sorted = [...AXIS_ORDER].sort((a, b) => userAxes[b as AceAxis] - userAxes[a as AceAxis]);
  const strongest = sorted.slice(0, 2);
  const weakest = sorted.slice(-2).reverse();

  return (
    <div className={`${panel} p-5 sm:p-7`} style={panelStyle}>
      <SectionTexture kind="tides" color="#3fc6bd" at="0% 100%" opacity={0.12} />
      <div className="relative">
        <SectionHead eyebrow="Capability radar" title="What your body is ready for" sub="Eight capabilities, each scored 1–5. Hover or tap a tile to see it on the radar." />
        <div className="grid lg:grid-cols-[minmax(0,320px)_1fr] gap-6 lg:gap-8 items-start">
          {/* Radar */}
          <div className="flex flex-col items-center">
            <div className="rounded-[20px] w-full flex justify-center py-3" style={{ background: "rgba(var(--fg-rgb, 255,255,255), 0.025)", border: "1px solid var(--border-subtle)" }}>
              <ACERadar
                ace={userAxes}
                userAce={hasCalibration ? (rawAxes as unknown as ACE) : undefined}
                userColor="var(--accent-green)"
                size={300}
                showLabels
                highlightAxis={hovered}
              />
            </div>
            <div className="w-full grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.22)" }}>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: "#10b981" }}>Strongest</p>
                <p className="text-[12px] font-semibold mt-0.5 truncate t-text">{strongest.map((a) => axisLabels[a]).join(" · ")}</p>
              </div>
              <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)" }}>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: "#f59e0b" }}>Room to grow</p>
                <p className="text-[12px] font-semibold mt-0.5 truncate t-text">{weakest.map((a) => axisLabels[a]).join(" · ")}</p>
              </div>
            </div>
            {hasCalibration && (
              <div className="w-full rounded-xl px-3 py-2.5 mt-2 space-y-1" style={{ background: "var(--accent-green-soft)", border: "1px solid var(--accent-green-border)" }}>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--accent-green)" }}>Adjusted</p>
                <p className="text-[11px] leading-snug" style={{ color: "var(--text-tertiary)" }}>Solid = after calibration and health answers, dashed = what you reported.</p>
                {decayNotes!.map((note, i) => <p key={i} className="text-[11px] leading-snug" style={{ color: "var(--text-tertiary)" }}>{note}</p>)}
              </div>
            )}
          </div>

          {/* Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AXIS_ORDER.map((axis, i) => {
              const color = axisColors[axis] ?? "#ff5100";
              const val = userAxes[axis as AceAxis] ?? 0;
              const on = hovered === axis;
              return (
                <button
                  key={axis}
                  type="button"
                  onMouseEnter={() => setHovered(axis as AceAxis)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(axis as AceAxis)}
                  onBlur={() => setHovered(null)}
                  onClick={() => setHovered((h) => (h === axis ? null : (axis as AceAxis)))}
                  className="mx-tile text-left rounded-2xl p-3.5 transition-all duration-200"
                  style={{
                    background: on ? `${color}12` : "var(--bg-card)",
                    border: `1px solid ${on ? `${color}66` : "var(--border-subtle)"}`,
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="w-7 h-7 rounded-lg grid place-items-center shrink-0" style={{ background: `${color}1c`, color }}>{axisIcons[axis]}</span>
                    <span className="flex-1 min-w-0 text-[13px] font-bold t-text">{axisLabels[axis]}</span>
                    {/* Adjusted by calibration or health: what you reported → what counts */}
                    {hasCalibration && rawAxes && rawAxes[axis] !== undefined && rawAxes[axis] !== val && (
                      <span className="text-[11px] font-semibold tabular-nums line-through" style={{ color: "var(--text-muted)" }} title="What you reported">{rawAxes[axis]}</span>
                    )}
                    <span className="text-[13px] font-black tabular-nums" style={{ color }}>{val}<span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>/5</span></span>
                  </div>
                  <LevelMeter value={val} color={color} size="sm" />
                  <p className="text-[11px] leading-snug mt-2.5 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>{axisDesc[axis]}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Matched adventures: tabs + the site's own cards ─────────────────────────

function MatchedAdventures({ groups, initial }: { groups: Record<BucketKey, EnrichedAdventure[]>; initial: BucketKey }) {
  const [tab, setTab] = useState<BucketKey>(initial);
  // Let the hero's count tiles open a tab
  useEffect(() => {
    const open = (e: Event) => setTab((e as CustomEvent<BucketKey>).detail);
    window.addEventListener("ttt:results-tab", open);
    return () => window.removeEventListener("ttt:results-tab", open);
  }, []);

  const b = BUCKETS[tab];
  const list = groups[tab];
  const full = list.map((e) => ALL_ADVENTURES.find((a) => a.slug === e.slug)).filter(Boolean) as typeof ALL_ADVENTURES;
  const shown = full.slice(0, 6);

  return (
    <div id="matched-adventures" className={`${panel} p-5 sm:p-7`} style={{ ...panelStyle, scrollMarginTop: 88 }}>
      <SectionTexture kind="trail" color="#ff5100" at="100% 0%" opacity={0.14} />
      <div className="relative">
        <SectionHead
          eyebrow="Matched adventures"
          title="Every adventure, rated for you"
          sub="The same Ready, Stretch and Not yet you'll see on adventure cards across the site."
        />

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-5" role="tablist" aria-label="Match groups">
          {(Object.keys(BUCKETS) as BucketKey[]).map((k) => {
            const g = BUCKETS[k];
            const on = tab === k;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(k)}
                className="rounded-2xl px-3 py-3 text-left transition-all duration-200"
                style={{
                  background: on ? `${g.color}14` : "var(--bg-card)",
                  border: `1px solid ${on ? `${g.color}70` : "var(--border-subtle)"}`,
                  boxShadow: on ? `0 0 0 3px ${g.color}14` : "none",
                }}
              >
                <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.06em] sm:tracking-[0.12em]" style={{ color: g.color }}><span className="hidden sm:inline-flex">{g.icon}</span><span className="truncate">{g.short}</span></span>
                <span className="block text-2xl sm:text-3xl font-black tabular-nums mt-1 t-text">{groups[k].length}</span>
              </button>
            );
          })}
        </div>

        <p className="text-[12px] mb-4" style={{ color: "var(--text-tertiary)" }}>
          <span className="font-semibold" style={{ color: b.color }}>{b.label}</span> — {b.blurb}.
        </p>

        {shown.length === 0 ? (
          <div className="rounded-2xl px-4 py-8 text-center text-[13px]" style={{ background: "var(--bg-card)", border: "1px dashed var(--border-default)", color: "var(--text-tertiary)" }}>
            Nothing here right now.
          </div>
        ) : (
          <div key={tab} className="mx-fade flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar -mx-5 px-5 scroll-px-5 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
            {shown.map((a) => (
              <div key={a.id} className="snap-start shrink-0 w-[78vw] sm:w-auto">
                <AdventureCard adventure={a} badge={false} />
              </div>
            ))}
          </div>
        )}

        {list.length > shown.length && (
          <Link
            href={b.explore}
            className="flex items-center justify-center gap-2 w-full py-3 mt-5 rounded-xl text-[13px] font-semibold transition-all hover:brightness-110"
            style={{ color: b.color, background: `${b.color}0f`, border: `1px solid ${b.color}35` }}
          >
            See all {list.length} {b.short.toLowerCase()} adventures
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Training: what to build, and what it unlocks ────────────────────────────


function TrainingPanel({ trainingPlan, axisColors, axisIcons, axisLabels, unlocks, neededBy }: {
  trainingPlan: TrainingItem[];
  axisColors: Record<string, string>;
  axisIcons: Record<string, React.ReactNode>;
  axisLabels: Record<string, string>;
  /** Adventures where this capability is the only thing holding you back */
  unlocks: Record<string, number>;
  /** Not-yet-ready adventures that need more of this capability */
  neededBy: Record<string, number>;
}) {
  const [showAll, setShowAll] = useState(false);
  // Biggest unlock first: that's the training that opens up the most adventures
  const sorted = [...trainingPlan].sort((a, b) =>
    (unlocks[b.axis] ?? 0) - (unlocks[a.axis] ?? 0) ||
    (neededBy[b.axis] ?? 0) - (neededBy[a.axis] ?? 0) ||
    (b.required_level - b.current_level) - (a.required_level - a.current_level));
  const visible = showAll ? sorted : sorted.slice(0, 4);

  return (
    <div id="training-focus" className={`${panel} p-5 sm:p-7`} style={{ ...panelStyle, scrollMarginTop: 88 }}>
      <SectionTexture kind="trail" color="#a78bfa" at="0% 100%" opacity={0.12} />
      <div className="relative">
        <SectionHead eyebrow="Training focus" title="Build these to unlock more" sub="Ordered by how many adventures each one opens up." />
        <div className="grid sm:grid-cols-2 gap-3">
          {visible.map((item, i) => {
            const color = axisColors[item.axis] ?? "#ff5100";
            const gap = item.required_level - item.current_level;
            const n = unlocks[item.axis] ?? 0;
            const needed = neededBy[item.axis] ?? 0;
            return (
              <div key={item.axis} className="mx-tile rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", animationDelay: `${i * 70}ms` }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-8 h-8 rounded-xl grid place-items-center shrink-0" style={{ background: `${color}1c`, color }}>{axisIcons[item.axis]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold t-text">{axisLabels[item.axis] ?? item.axis}</p>
                    <p className="text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>Level {item.current_level} → {item.required_level}</p>
                  </div>
                  {n > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                      Unlocks {n}
                    </span>
                  ) : needed > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: "var(--bg-card-hover)", color: "var(--text-secondary)" }}>
                      Needed for {needed}
                    </span>
                  ) : null}
                </div>
                <LevelMeter value={item.current_level} target={item.required_level} color={color} />
                <p className="text-[10px] font-semibold mt-1.5" style={{ color }}>+{gap} level{gap > 1 ? "s" : ""}</p>
                <p className="text-[12px] leading-relaxed mt-2" style={{ color: "var(--text-secondary)" }}>{item.recommendation}</p>
              </div>
            );
          })}
        </div>
        {sorted.length > 4 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="w-full mt-3 py-2.5 rounded-xl text-[12px] font-semibold transition-colors hover:text-[var(--text-primary)]"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}
          >
            {showAll ? "Show less" : `Show ${sorted.length - 4} more`}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  result,
  onReset,
  isQuick = false,
  onRefine,
  profileAgeDays: ageDays = null,
}: {
  result: AnalysisResult;
  onReset: () => void;
  isQuick?: boolean;
  onRefine?: () => void;
  profileAgeDays?: number | null;
}) {
  const { userAxes, adventures: enriched, trainingPlan, rawAxes, decayNotes } = result;

  // Reached from a trek page (?from=slug): offer the way back
  const searchParams = useSearchParams();
  const fromSlug = searchParams.get("from");
  const fromAdventure = fromSlug ? ALL_ADVENTURES.find((a) => a.slug === fromSlug) : null;

  const byFit = (a: EnrichedAdventure, b: EnrichedAdventure) => (a.riskLevel ?? 0) - (b.riskLevel ?? 0);
  const groups: Record<BucketKey, EnrichedAdventure[]> = {
    ready: enriched.filter((a) => a.status === "IN_ZONE").sort(byFit),
    stretch: enriched.filter((a) => a.status === "STRETCH").sort(byFit),
    notyet: enriched.filter((a) => a.status === "RESTRICTED").sort(byFit),
  };
  const initialTab: BucketKey = groups.ready.length ? "ready" : groups.stretch.length ? "stretch" : "notyet";

  // How many not-yet-ready adventures each capability is holding back
  // For each training item: re-score every not-yet-ready adventure as if that capability had
  // reached its target, and count how many would become Ready. That's what the training buys.
  const unlocks: Record<string, number> = {};
  const neededBy: Record<string, number> = {};
  const notReady = enriched.filter((a) => a.status !== "IN_ZONE");
  trainingPlan.forEach((item) => {
    const lifted = { ...userAxes, [item.axis]: item.required_level } as unknown as ACE;
    unlocks[item.axis] = notReady.filter((a) => computeMatchScore(lifted, a.requirements as unknown as ACE) >= 80).length;
    neededBy[item.axis] = notReady.filter((a) => a.weakAxes.includes(item.axis)).length;
  });

  const totalScore = Object.values(userAxes).reduce((a, b) => a + b, 0);
  const resultAce: ACE = { stamina: userAxes.stamina ?? 0, power: userAxes.power ?? 0, strength: userAxes.strength ?? 0, agility: userAxes.agility ?? 0, water: userAxes.water ?? 0, altitude: userAxes.altitude ?? 0, focus: userAxes.focus ?? 0, nerve: userAxes.nerve ?? 0 };

  const rankIndex = Math.max(0, RANKS.reduce((idx, r, i) => (totalScore >= r.minScore ? i : idx), 0));
  const tier = RANKS[rankIndex];
  const nextRank = RANKS[rankIndex + 1] ?? null;
  const progressPct = nextRank ? Math.min(100, Math.max(0, ((totalScore - tier.minScore) / (nextRank.minScore - tier.minScore)) * 100)) : 100;
  const ptsNeeded = nextRank ? nextRank.minScore - totalScore : 0;
  const ladderPct = ((rankIndex + progressPct / 100) / (RANKS.length - 1)) * 100;

  const AXIS_LABELS: Record<string, string> = {
    stamina: "Stamina", power: "Power", strength: "Strength",
    agility: "Agility", water: "Water", altitude: "Altitude",
    focus: "Focus", nerve: "Nerve",
  };
  const AXIS_DESC_BY_LEVEL: Record<string, string[]> = {
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

  const jumpTo = (k: BucketKey) => {
    window.dispatchEvent(new CustomEvent("ttt:results-tab", { detail: k }));
    document.getElementById("matched-adventures")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-12 sm:pt-12 sm:pb-16 space-y-5 sm:space-y-6">

      <ResultsNextSteps placement="top" isQuick={isQuick} onRefine={onRefine} onRetake={onReset} ageDays={ageDays} />

      {/* ── HERO: rank, score, ladder, counts ───────────────────────────────── */}
      <FadeInSection>
        <div className={`${panel} px-5 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-7`} style={{ ...panelStyle, borderColor: `${tier.color}40` }}>
          <SectionTexture kind="trail" color={tier.color} at="85% 15%" opacity={0.28} />
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full pointer-events-none blur-[90px]" style={{ background: tier.color, opacity: 0.16 }} />

          <div className="relative">
            <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
              <p className="text-[#ff5100] text-[11px] font-semibold tracking-[0.22em] uppercase"><span className="hidden sm:inline">Adventure Matchmaker · </span>Your profile</p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ background: "var(--accent-green-soft)", color: "var(--accent-green)", border: "1px solid var(--accent-green-border)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-green)" }} />
                {isQuick ? "Quick match" : <><span className="sm:hidden">Done</span><span className="hidden sm:inline">Assessment complete</span></>}
              </span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-5 sm:gap-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="mx-rank-icon w-14 h-14 sm:w-16 sm:h-16 rounded-2xl grid place-items-center shrink-0" style={{ background: `${tier.color}1a`, color: tier.color, boxShadow: `0 0 0 1px ${tier.color}40, 0 0 30px ${tier.color}30` }}>
                    <span className="scale-[1.6]">{tier.icon}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--text-tertiary)" }}>Your rank</p>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05]" style={{ color: tier.color }}>{tier.label}</h1>
                  </div>
                </div>
                <p className="text-[14px] mt-3" style={{ color: "var(--text-secondary)" }}>
                  {tier.desc}.{" "}
                  {nextRank
                    ? <><span className="font-bold tabular-nums" style={{ color: tier.color }}>{ptsNeeded} point{ptsNeeded === 1 ? "" : "s"}</span> to <span className="font-bold" style={{ color: nextRank.color }}>{nextRank.label}</span>.</>
                    : <>You&apos;ve reached the top rank.</>}
                </p>
                {trainingPlan.length > 0 && (
                  <a
                    href="#training-focus"
                    onClick={(e) => { e.preventDefault(); document.getElementById("training-focus")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:brightness-110 hover:-translate-y-0.5"
                    style={{ background: "#ff5100", boxShadow: "0 8px 24px rgba(255,81,0,0.3)" }}
                  >
                    How to level up <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="self-center sm:self-auto">
                <ScoreGauge score={totalScore} color={tier.color} />
              </div>
            </div>

            {/* Rank ladder */}
            <div className="mt-7 sm:mt-8">
              <div className="relative h-11 mx-3">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full" style={{ background: "var(--border-default)" }} />
                <div className="mx-ladder absolute left-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full" style={{ width: `${ladderPct}%`, background: `linear-gradient(90deg, ${RANKS[0].color}, ${tier.color})`, boxShadow: `0 0 10px ${tier.color}80` }} />
                {RANKS.map((r, i) => {
                  const reached = i <= rankIndex;
                  const current = i === rankIndex;
                  return (
                    <span
                      key={r.label}
                      className="absolute top-1/2 grid place-items-center rounded-full transition-all"
                      title={r.label}
                      style={{
                        left: `${(i / (RANKS.length - 1)) * 100}%`,
                        transform: "translate(-50%, -50%)",
                        width: current ? 40 : 26, height: current ? 40 : 26,
                        // Solid underneath, so the ladder line stops at each circle instead of showing through it
                        background: reached ? `linear-gradient(${r.color}22, ${r.color}22), var(--bg-page)` : "var(--bg-page)",
                        border: `1.5px solid ${reached ? r.color : "var(--border-default)"}`,
                        color: reached ? r.color : "var(--text-muted)",
                        boxShadow: current ? `0 0 0 4px ${r.color}20, 0 0 20px ${r.color}60` : "none",
                      }}
                    >
                      <span style={{ transform: current ? "scale(0.95)" : "scale(0.6)" }}>{r.icon}</span>
                    </span>
                  );
                })}
              </div>
              <div className="relative h-4 mt-1.5 mx-3 hidden sm:block">
                {RANKS.map((r, i) => (
                  <span
                    key={r.label}
                    className="absolute text-[9px] font-bold uppercase tracking-[0.12em] whitespace-nowrap"
                    style={{
                      // The end labels line up with the ends of the ladder instead of hanging past them
                      ...(i === 0 ? { left: 0 } : i === RANKS.length - 1 ? { right: 0 } : { left: `${(i / (RANKS.length - 1)) * 100}%`, transform: "translateX(-50%)" }),
                      color: i === rankIndex ? r.color : i < rankIndex ? "var(--text-tertiary)" : "var(--text-muted)",
                    }}
                  >
                    {r.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">
              {(Object.keys(BUCKETS) as BucketKey[]).map((k) => {
                const g = BUCKETS[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => jumpTo(k)}
                    className="group rounded-2xl px-3 sm:px-4 py-3 text-left transition-all hover:-translate-y-0.5"
                    style={{ background: `${g.color}0d`, border: `1px solid ${g.color}30` }}
                  >
                    <span className="block text-2xl sm:text-[32px] font-black tabular-nums leading-none" style={{ color: g.color }}>{groups[k].length}</span>
                    <span className="flex items-center justify-between gap-1 mt-1.5 text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                      <span className="truncate">{g.short}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: g.color }} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* ── GROUP MATCH: right after your own result, not at the bottom ───────── */}
      <FadeInSection>
        <GroupMatchPromo />
      </FadeInSection>

      {/* ── CAPABILITIES ────────────────────────────────────────────────────── */}
      <FadeInSection>
        <CapabilityPanel
          axisLabels={AXIS_LABELS}
          axisDesc={AXIS_DESC}
          axisColors={AXIS_COLORS}
          axisIcons={AXIS_ICONS}
          userAxes={resultAce}
          rawAxes={rawAxes}
          decayNotes={decayNotes}
        />
      </FadeInSection>

      {/* ── MATCHED ADVENTURES ─────────────────────────────────────────────── */}
      <FadeInSection>
        <MatchedAdventures groups={groups} initial={initialTab} />
      </FadeInSection>

      {/* ── TRAINING ────────────────────────────────────────────────────────── */}
      {trainingPlan.length > 0 && (
        <FadeInSection>
          <TrainingPanel trainingPlan={trainingPlan} axisColors={AXIS_COLORS} axisIcons={AXIS_ICONS} axisLabels={AXIS_LABELS} unlocks={unlocks} neededBy={neededBy} />
        </FadeInSection>
      )}

      {/* ── WHAT NEXT ───────────────────────────────────────────────────────── */}
      <ResultsNextSteps placement="bottom" isQuick={isQuick} onRefine={onRefine} onRetake={onReset} ageDays={ageDays} />

      <div className="flex flex-col sm:flex-row gap-3">
        {fromAdventure ? (
          <Link
            href={`/experiences/${fromAdventure.slug}`}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{ background: "#ff5100", boxShadow: "0 10px 30px rgba(255,81,0,0.28)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to {fromAdventure.name}
          </Link>
        ) : (
          <Link
            href="/explore?ace=ready"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{ background: "#ff5100", boxShadow: "0 10px 30px rgba(255,81,0,0.28)" }}
          >
            Explore your ready adventures
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        {fromAdventure && (
          <Link
            href="/explore?ace=ready"
            className="sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border text-sm font-medium transition-colors hover:text-[var(--text-primary)]"
            style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
          >
            All adventures
          </Link>
        )}
        <button
          onClick={onReset}
          className="sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border text-sm font-medium transition-colors hover:text-[var(--text-primary)]"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retake assessment
        </button>
      </div>

      <style>{`
        .mx-tile { animation: mxIn 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .mx-fade { animation: mxIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes mxIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .mx-ladder { animation: mxGrow 1.2s cubic-bezier(0.22,1,0.36,1) 0.2s both; transform-origin: left; }
        @keyframes mxGrow { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
        .mx-rank-icon { animation: mxPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes mxPop { from { transform: scale(0.6); opacity: 0; } to { transform: none; opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .mx-tile, .mx-fade, .mx-ladder, .mx-rank-icon { animation: none; } }
      `}</style>
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
    // Same score buckets as the match bar on cards, Explore filters and the home page counts,
    // so "Ready" means the same thing everywhere.
    const score = computeMatchScore(userAxes as unknown as ACE, req);
    const bucket = bucketFor(score).key;
    const status: "IN_ZONE" | "STRETCH" | "RESTRICTED" = bucket === "ready" ? "IN_ZONE" : bucket === "stretch" ? "STRETCH" : "RESTRICTED";
    const maxGap = 100 - score; // lower = better fit, used for sorting within each group

    return {
      id: adv.slug, slug: adv.slug, name: adv.name, heroImage: adv.heroImage,
      state: adv.state, region: (adv.region ?? "") as string,
      type: adv.type as string, difficulty: computeDifficulty(req), // the rating the site shows, not the raw field
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


// ─── Saved progress ───────────────────────────────────────────────────────────
// Answers are saved after every step so closing the tab (or losing signal) mid-quiz doesn't
// lose them. Cleared as soon as the assessment is submitted or reset.

type Mode = "full" | "quick" | "refine";
interface Progress {
  mode: Mode;
  stepIndex: number;
  answers: Answers;
  skipKeys: string[];
  jointNote: string;
  savedAt: string;
}
const PROGRESS_KEY = "ttt_matchmaker_progress";
function loadProgress(): Progress | null {
  try { const raw = localStorage.getItem(PROGRESS_KEY); return raw ? (JSON.parse(raw) as Progress) : null; } catch { return null; }
}
function saveProgress(p: Progress) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {} }
function clearProgress() { try { localStorage.removeItem(PROGRESS_KEY); } catch {} }

function stepsFor(mode: Mode, skipKeys: string[]): Step[] {
  // Quick: its 6 capability questions, then the 2 calibration and the health questions like the full one
  if (mode === "quick") return ALL_STEPS.filter((s) => s.type !== "capability" || QUICK_KEYS.includes(s.q.key));
  // Refine: only what the quick match didn't already ask
  if (mode === "refine") return ALL_STEPS.filter((s) => !((s.type === "capability" || s.type === "decay") && skipKeys.includes(s.q.key)));
  return ALL_STEPS;
}

export default function MatchmakerClient() {
  const searchParams = useSearchParams();
  const [started, setStarted] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [mode, setMode] = useState<Mode>("full");
  const [pendingMode, setPendingMode] = useState<Mode>("full");
  const [skipKeys, setSkipKeys] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [jointNote, setJointNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedResult, setSavedResult] = useState<AnalysisResult | null>(null);
  const [savedProfile, setSavedProfile] = useState<StoredProfile | null>(null);
  const [resumable, setResumable] = useState<Progress | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Scroll to top when arriving via retake link
  useEffect(() => {
    if (searchParams.get("retake") === "1") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [searchParams]);

  // Unfinished assessment from an earlier visit?
  useEffect(() => {
    const p = loadProgress();
    if (p && (p.stepIndex > 0 || Object.keys(p.answers).length > 0)) setResumable(p);
  }, []);

  // Load previous result + consent status on mount — always show results if profile exists
  const autoShown = useRef(false);
  const isRetake = searchParams.get("retake") === "1";
  // ?mode=quick deep-links straight into the quick match (Explore, group links)
  const wantsQuick = searchParams.get("mode") === "quick";
  useEffect(() => {
    let hasSaved = false;
    // Sequential: both loaders can fall back to *pushing* local data up to
    // a different user_metadata key when the server has none yet (e.g. a
    // guest who completed the assessment before logging in) — user_metadata
    // has no per-field atomicity, so two such pushes firing concurrently can
    // race and one silently clobbers the other's key.
    loadProfileFromServer()
      .then((saved) => {
        if (saved?.ace) {
          hasSaved = true;
          setSavedProfile(saved);
          const r = buildResult(saved.ace as unknown as Record<string, number>);
          setSavedResult(r);
          // An unfinished assessment takes priority — land on the intro so they can resume it
          const p = loadProgress();
          const hasProgress = !!p && (p.stepIndex > 0 || Object.keys(p.answers).length > 0);
          if (!autoShown.current && !isRetake && !hasProgress) {
            autoShown.current = true;
            setResult(r);
          }
        }
      })
      .then(() =>
        loadConsentFromServer().then((consent) => {
          const consented = consent?.consentVersion === MATCHMAKER_CONSENT_VERSION;
          if (consented) setConsentChecked(true);
          // Deep links start the quiz only now, once consent is known — so a retake link
          // on a new device still goes through the consent screen first.
          if (isRetake) begin("full", {}, [], consented);
          else if (wantsQuick && !hasSaved) begin("quick", {}, [], consented);
        })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = stepsFor(mode, skipKeys);
  const currentStep = steps[stepIndex] ?? steps[0];

  // Persist progress after every change while the quiz is open
  useEffect(() => {
    if (!started || result || loading) return;
    saveProgress({ mode, stepIndex, answers, skipKeys, jointNote, savedAt: new Date().toISOString() });
  }, [started, result, loading, mode, stepIndex, answers, skipKeys, jointNote]);

  function begin(nextMode: Mode, prefill: Answers = {}, skip: string[] = [], consented = consentChecked) {
    setMode(nextMode);
    setSkipKeys(skip);
    setAnswers(prefill);
    setStepIndex(0);
    setResult(null);
    setResumable(null);
    clearProgress();
    if (consented) setStarted(true);
    else { setPendingMode(nextMode); setShowConsent(true); }
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function resume(p: Progress) {
    setMode(p.mode);
    setSkipKeys(p.skipKeys ?? []);
    setAnswers(p.answers);
    setStepIndex(Math.min(p.stepIndex, stepsFor(p.mode, p.skipKeys ?? []).length - 1));
    setJointNote(p.jointNote ?? "");
    setResult(null);
    setResumable(null);
    setStarted(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  // Refine a quick result: keep the 5 real answers, ask everything else.
  function refine() {
    const real = (savedProfile?.answers ?? {}) as Answers;
    const answered = Object.keys(real).filter((k) => QUICK_KEYS.includes(k) || CAPABILITY_QUESTIONS.some((q) => q.key === k) || DECAY_QUESTIONS.some((q) => q.key === k));
    begin("refine", real, answered);
  }

  function submitAssessment(finalAnswers: Answers) {
    setLoading(true);
    setApiError(null);

    // Quick mode estimates the questions it skipped; full and refine use only real answers.
    const scoringAnswers = mode === "quick" ? estimateQuickAnswers(finalAnswers) : finalAnswers;

    // Health answers become flags first; the scoring reads the flags (never the raw answers)
    const medicalFlags = buildMedicalFlags(finalAnswers, jointNote);
    const { ace: userAxes, rawAxes, decayMultipliers, health } = computeAceFromAnswers(scoringAnswers, scoringAnswers, medicalFlags);

    // Say exactly what lowered which scores, so the result can be read
    const decayNotes: string[] = [];
    const axisName = (k: string) => k.charAt(0).toUpperCase() + k.slice(1);
    const decayed = Object.entries(decayMultipliers).filter(([, m]) => (m as number) < 1);
    if (decayed.length) {
      decayNotes.push(`Calibration (how recently and how often you're active — endurance fades fastest, balance slowest): ${decayed.map(([k, m]) => `${axisName(k)} ×${(m as number).toFixed(2)}`).join(", ")}.`);
    }
    health.forEach((h) => {
      decayNotes.push(`${h.label}: ${Object.entries(h.axes).map(([k, m]) => `${axisName(k)} ×${(m as number).toFixed(2)}`).join(", ")}.`);
    });
    if (decayed.length || health.length) {
      decayNotes.push("Adjustments multiply together, but no score drops by more than half.");
    }
    const unsure = CAPABILITY_QUESTIONS.filter((q) => finalAnswers[q.key] === NOT_SURE).map((q) => q.axis);
    if (unsure.length > 0) {
      decayNotes.push(`You weren't sure about ${[...new Set(unsure)].join(", ")}, so ${unsure.length === 1 ? "it was" : "those were"} scored cautiously from your other answers.`);
    }

    // Only real capability + calibration answers are kept (medical answers never go in the profile).
    const realAnswers = Object.fromEntries(
      Object.entries(finalAnswers).filter(([k]) => !k.startsWith("med-"))
    );

    const updatedAt = new Date().toISOString();
    const profile: StoredProfile = {
      ace: userAxes, rawAxes: rawAxes as Record<string, number>, updatedAt,
      answers: realAnswers, mode: mode === "quick" ? "quick" : "full",
    };
    saveProfile(profile);
    setSavedProfile(profile);
    clearProgress();
    const savedToServer = saveProfileToServer(profile);
    // After the save: badges are checked against the result stored on the account
    savedToServer.then(() => awardXP("ace_complete"));

    // Every mode asks the health questions now. The flags go to their own store (they also drive
    // the safety notes on adventure pages). Sequential, not concurrent: user_metadata is a single
    // JSON blob with no per-field atomicity, so overlapping POSTs could clobber each other.
    savedToServer.then(() => saveMedicalFlagsToServer(medicalFlags));

    setResult(buildResult(userAxes as unknown as Record<string, number>, decayNotes.length > 0 ? { rawAxes: rawAxes as Record<string, number>, decayNotes } : undefined));
    setLoading(false);
  }

  // Retake: start a fresh assessment but keep the current profile until the new one is
  // submitted — backing out of the quiz must not leave someone with no profile at all.
  function reset() {
    setJointNote("");
    setApiError(null);
    setLoading(false);
    begin("full");
  }

  if (showConsent && !started && !result) return (
    <ConsentScreen
      onAccept={() => {
        const consent = { consentedAt: new Date().toISOString(), consentVersion: MATCHMAKER_CONSENT_VERSION };
        saveConsent(consent);
        saveConsentToServer(consent); // fire-and-forget
        setConsentChecked(true);
        setShowConsent(false);
        setMode(pendingMode);
        setStarted(true);
        window.scrollTo({ top: 0, behavior: "instant" });
      }}
      onBack={() => setShowConsent(false)}
    />
  );

  if (!started && !result) return (
    <IntroScreen
      onStart={() => begin("full")}
      onQuickStart={() => begin("quick")}
      onResume={resumable ? () => resume(resumable) : undefined}
      resumeLabel={resumable ? `Question ${resumable.stepIndex + 1} of ${stepsFor(resumable.mode, resumable.skipKeys ?? []).length}` : undefined}
      onViewResults={() => { setResult(savedResult); window.scrollTo({ top: 0, behavior: "instant" }); }}
      hasProfile={!!savedResult}
      profileAgeDays={profileAgeDays(savedProfile?.updatedAt)}
    />
  );
  if (loading && !result) return <LoadingScreen />;
  if (result) return (
    <ResultsScreen
      result={result}
      onReset={reset}
      isQuick={savedProfile?.mode === "quick"}
      onRefine={refine}
      profileAgeDays={profileAgeDays(savedProfile?.updatedAt)}
    />
  );

  const capQ = currentStep.type === "capability" ? currentStep.q : null;
  const decayQ = currentStep.type === "decay" ? currentStep.q : null;
  const medQ = currentStep.type === "medical" ? currentStep.q : null;
  const isDecay = !!decayQ;
  const isMedical = !!medQ;
  const accentColor = isMedical ? "#38bdf8" : isDecay ? "var(--accent-green)" : "#ff5100";
  const headerTitle = capQ ? capQ.axis : decayQ ? decayQ.title : medQ!.title;
  const firstMedicalIndex = steps.findIndex((s) => s.type === "medical");

  function goNext(updated: Answers) {
    setAnswers(updated);
    setTimeout(() => {
      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        submitAssessment(updated);
      }
    }, 180);
  }

  function skipCurrentQuestion() {
    setTimeout(() => {
      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        submitAssessment(answers);
      }
    }, 100);
  }

  return (
    // Questions on the left; on wide screens the profile builds up beside them as you answer.
    // Desktop: the whole question, progress and fact fit one screen, so nothing needs scrolling.
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-20 sm:pt-24 lg:pt-[92px] pb-10 lg:pb-4 min-h-[100svh] lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14 lg:items-start">
    <div className="max-w-xl w-full mx-auto lg:mx-0 min-h-[calc(100svh-7rem)] lg:min-h-[calc(100svh-108px)] flex flex-col">
      {/* Header */}
      <div className="mb-7 lg:mb-4">
        <div className="flex items-center justify-between mb-5 lg:mb-3">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: accentColor }}>
            {isMedical ? "Health Background (Optional)" : isDecay ? "Calibration" : mode === "quick" ? "Quick match" : mode === "refine" ? "Refining your profile" : "Adventure Matchmaker"}
          </p>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{stepIndex + 1} / {steps.length}</span>
        </div>
        <div className="flex items-center gap-2.5 mb-1.5">
          {isDecay || isMedical ? (
            <>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accentColor}20`, color: accentColor }}>
                {isMedical ? <Stethoscope className="w-4 h-4" /> : <HeartPulse className="w-4 h-4" />}
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{headerTitle}</h1>
            </>
          ) : (
            <>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${AXIS_COLORS[capQ!.axis.toLowerCase()] ?? "#ff5100"}20`, color: AXIS_COLORS[capQ!.axis.toLowerCase()] ?? "#ff5100" }}
              >
                {AXIS_ICONS[capQ!.axis.toLowerCase()]}
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{headerTitle}</h1>
            </>
          )}
          {/* Phones: a small version of the profile so far, beside the title */}
          <div className="lg:hidden ml-auto">
            <LiveProfile answers={answers} highlight={capQ ? capQ.axis.toLowerCase() : null} compact />
          </div>
        </div>
        {isDecay && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Two quick questions on recency and current fitness — these fine-tune your profile.</p>
        )}
        {isMedical && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Every question here is optional. A &ldquo;yes&rdquo; lowers the scores it affects (never by more than half in total) and adds safety notes on the adventures where it matters. Skipping leaves your scores as they are.</p>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-9 lg:mb-5">
        {steps.map((step, i) => {
          const color = step.type === "medical" ? "#38bdf8" : step.type === "decay" ? "#4ade80" : "#ff5100";
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
        <h2 className="text-xl sm:text-2xl lg:text-xl font-semibold leading-snug mb-1.5" style={{ color: "var(--text-primary)" }}>{currentStep.q.question}</h2>
        {capQ?.hint && <p className="text-sm mb-5 lg:mb-3 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{capQ.hint}</p>}
        {/* Two columns on desktop, with "Not sure" as the last cell */}
        <div className="space-y-2.5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-2">
        {currentStep.q.options.map((o) => (
          <OptionBtn
            key={o.v}
            value={o.v}
            label={o.l}
            selected={answers[currentStep.q.key] === o.v}
            onClick={() => {
              const updated = { ...answers, [currentStep.q.key]: o.v };
              // The joint/injury question pauses on "yes" so the optional
              // free-text field below is actually reachable, instead of
              // being auto-advanced past within 180ms.
              if (medQ?.hasFreeText && o.v === "yes") setAnswers(updated);
              else goNext(updated);
            }}
          />
        ))}

        {/* Honest escape hatch for things someone has never tried — scored cautiously */}
        {capQ && (
          <button
            onClick={() => goNext({ ...answers, [capQ.key]: NOT_SURE })}
            className="w-full lg:h-full text-left px-4 py-3 rounded-xl lg:rounded-2xl text-sm transition-colors"
            style={{
              border: `1px dashed ${answers[capQ.key] === NOT_SURE ? "#ff5100" : "var(--border-default)"}`,
              color: answers[capQ.key] === NOT_SURE ? "#ff7d47" : "var(--text-tertiary)",
              background: answers[capQ.key] === NOT_SURE ? "rgba(255,81,0,0.06)" : "transparent",
            }}
          >
            Not sure / haven&apos;t tried this
          </button>
        )}
        </div>


        {/* Optional free text — joint/injury medical question, shown once answered "yes" */}
        {medQ?.hasFreeText && answers[medQ.key] === "yes" && (
          <div className="mt-3 space-y-2.5">
            <textarea
              value={jointNote}
              onChange={(e) => setJointNote(e.target.value)}
              placeholder={medQ.freeTextPrompt}
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
            />
            <button
              onClick={() => goNext(answers)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
              style={{ background: "#38bdf8" }}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Skip controls — medical questions only */}
        {isMedical && (
          <div className="flex items-center justify-between pt-1">
            <button onClick={skipCurrentQuestion} className="text-xs font-medium transition-colors" style={{ color: "var(--text-muted)" }}>
              Skip this question
            </button>
            {stepIndex >= firstMedicalIndex && (
              <button onClick={() => submitAssessment(answers)} className="text-xs font-medium transition-colors underline" style={{ color: "var(--text-muted)" }}>
                Skip remaining health questions
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {apiError && (
        <div className="mt-6 flex items-center gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between mt-8 lg:mt-4">
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
        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Progress saved automatically</span>
      </div>

      {/* A different adventure fact under every question, in the same hand-lettered script as the logo tagline */}
      <AdventureFact step={stepIndex} />
    </div>

      {/* Wide screens: the profile so far, sticky beside the questions */}
      <aside className="hidden lg:block sticky top-28">
        <LiveProfile answers={answers} highlight={capQ ? capQ.axis.toLowerCase() : null} />
      </aside>
    </div>
  );
}

/** The radar filling in as someone answers: the same chart as the ACE page, unanswered axes at 0 */
function LiveProfile({ answers, highlight, compact }: { answers: Answers; highlight: string | null; compact?: boolean }) {
  const scores = liveAxisScores(answers);
  const values = ACE_AXIS_KEYS.map((k) => scores[k] ?? 0);
  const done = values.filter((v) => v > 0).length;
  const hi = highlight ? ACE_AXIS_KEYS.indexOf(highlight as (typeof ACE_AXIS_KEYS)[number]) : -1;

  if (compact) {
    return (
      <div className="ace w-16 h-16 shrink-0" aria-label={`Your profile so far: ${done} of 8 scored`}>
        <style>{ACE_THEME_CSS}</style>
        <AceRadar values={values} color="#ff5100" labels={false} highlight={hi >= 0 ? hi : null} title="Your profile so far" className="w-full h-full" />
      </div>
    );
  }
  return (
    <div className="ace rounded-3xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <style>{ACE_THEME_CSS}</style>
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>Your profile so far</p>
        <p className="text-[12px] font-semibold tabular-nums" style={{ color: done === 8 ? "var(--ok)" : "var(--text-secondary)" }}>{done} / 8</p>
      </div>
      <AceRadar values={values} color="#ff5100" highlight={hi >= 0 ? hi : null} title="Your profile so far" className="w-full mt-1" />
      <p className="text-[12px] leading-snug mt-1" style={{ color: "var(--text-tertiary)" }}>
        {done === 0 ? "Each answer fills in part of your shape." : done < 8 ? "Fills in as you answer. Not sure counts as unscored." : "All eight scored. The last questions fine-tune it."}
      </p>
    </div>
  );
}

function AdventureFact({ step }: { step: number }) {
  const [index, setIndex] = useState<number | null>(null);
  // Picked on the client (random on the server would mismatch hydration); never repeats back to back
  useEffect(() => {
    setIndex((prev) => {
      let next = Math.floor(Math.random() * ADVENTURE_FACTS.length);
      if (next === prev) next = (next + 1) % ADVENTURE_FACTS.length;
      return next;
    });
  }, [step]);
  if (index === null) return null;
  return (
    <div key={index} className="mt-auto pt-12 lg:pt-5 text-center animate-in fade-in duration-500">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-1.5 lg:mb-1" style={{ color: "var(--text-muted)" }}>Did you know?</p>
      <p className="text-[19px] lg:text-[17px] leading-snug max-w-md mx-auto" style={{ fontFamily: "var(--font-script), cursive", fontWeight: 600, color: "var(--text-secondary)" }}>
        {ADVENTURE_FACTS[index]}
      </p>
    </div>
  );
}
