"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight, ChevronLeft, MapPin, ArrowRight, RotateCcw,
  Shield, CheckCircle2, AlertTriangle, Loader2, Wind,
} from "lucide-react";
import { Flame, Zap, Dumbbell, Compass, Waves, Mountain, ScanEye, Ghost, TrendingUp, Lock } from "@/lib/localIcons";
import ACERadar from "@/components/ui/custom/ACERadar";
import RankBar from "@/components/ui/custom/RankBar";
import Pill from "@/components/ui/custom/Pill";
import AchievementBadges from "@/components/ui/custom/AchievementBadges";
import { saveProfile, loadProfile, clearProfile, saveProfileToServer, loadProfileFromServer } from "@/lib/matchmaker";
import { adventures as ALL_ADVENTURES } from "@/lib/data";
import { getACE } from "@/lib/ace";
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
    let cycleTimer: ReturnType<typeof setInterval>;
    function scheduleCycle() {
      swapTimer = setTimeout(() => {
        setFade(false);
        setTimeout(() => { setIdx(i => (i + 1) % AXIS_TICKER.length); setFade(true); }, 220);
      }, swapAt);
    }
    scheduleCycle();
    cycleTimer = setInterval(scheduleCycle, SCAN_MS);
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

// ─── Question definitions (Q1–Q8 map to 8 bio axes) ──────────────────────────

const QUESTIONS = [
  {
    key: "Q1",
    axis: "Stamina",
    icon: <Flame className="w-4 h-4" />,
    question: "How long can you sustain continuous physical effort before needing to stop for the day?",
    hint: "Active moving time — short rest stops are fine, think full trekking days.",
    options: [
      { v: "A", l: "Under 1 hour", s: "Walks and easy half-days only" },
      { v: "B", l: "1–2 hours", s: "Light day hikes at a relaxed pace" },
      { v: "C", l: "2–4 hours", s: "Moderate day treks with breaks" },
      { v: "D", l: "4–6 hours", s: "Full trekking days without struggling" },
      { v: "E", l: "6+ hours", s: "Long mountain days with minimal fatigue" },
    ],
  },
  {
    key: "Q2",
    axis: "Power",
    icon: <Zap className="w-4 h-4" />,
    question: "What weight can you carry comfortably across a full day of trekking?",
    hint: "Include pack, water, and gear — not just for a short walk.",
    options: [
      { v: "A", l: "Under 5 kg", s: "Day bag only" },
      { v: "B", l: "5–8 kg", s: "Light overnight pack" },
      { v: "C", l: "8–12 kg", s: "Standard multi-day pack" },
      { v: "D", l: "12–18 kg", s: "Heavy expedition pack" },
      { v: "E", l: "18 kg+", s: "Full expedition load, sustained days" },
    ],
  },
  {
    key: "Q3",
    axis: "Strength",
    icon: <Dumbbell className="w-4 h-4" />,
    question: "How do you handle sustained uphill sections over several hours?",
    hint: "Not a single climb — repeated ascents throughout the day.",
    options: [
      { v: "A", l: "Avoid steep or prolonged climbs", s: "Flat terrain preferred" },
      { v: "B", l: "Need frequent breaks on climbs", s: "Short ascents manageable" },
      { v: "C", l: "Steady pace on moderate climbs", s: "500–800m elevation gain/day" },
      { v: "D", l: "Sustain hard climbs with heavy load", s: "1,000m+ gain without stopping" },
      { v: "E", l: "Power through steep prolonged ascents", s: "1,500m+ gain, heavy pack, no issue" },
    ],
  },
  {
    key: "Q4",
    axis: "Agility",
    icon: <Compass className="w-4 h-4" />,
    question: "What is the most technical terrain you can navigate safely and confidently?",
    hint: "Pick the hardest terrain you can move through without slowing the group.",
    options: [
      { v: "A", l: "Flat, paved, or well-maintained paths", s: "No off-trail movement" },
      { v: "B", l: "Dirt trails with minor obstacles", s: "Gravel, tree roots, mild slopes" },
      { v: "C", l: "Uneven terrain — loose rock, scree, sand", s: "Hands-free but careful footing" },
      { v: "D", l: "Rocky terrain requiring hands", s: "Scrambling, boulders, steep moraine" },
      { v: "E", l: "Highly technical terrain", s: "Glaciers, exposed rock, via ferrata" },
    ],
  },
  {
    key: "Q5",
    axis: "Water",
    icon: <Waves className="w-4 h-4" />,
    question: "What level of water conditions are you comfortable in?",
    hint: "Open water or rivers — not a controlled pool setting.",
    options: [
      { v: "A", l: "No open water — non-swimmer", s: "Water crossings only with support" },
      { v: "B", l: "Calm shallow water", s: "Knee-deep river crossings, no swimming" },
      { v: "C", l: "Open water swimming", s: "Lake or sea, calm conditions" },
      { v: "D", l: "Moving water or moderate sea currents", s: "River crossings, mild surf, snorkelling" },
      { v: "E", l: "Strong currents, rough conditions", s: "White water, open ocean, diving" },
    ],
  },
  {
    key: "Q6",
    axis: "Altitude",
    icon: <Mountain className="w-4 h-4" />,
    question: "At what altitude have you stayed active for multiple days without significant symptoms?",
    hint: "Where you have trekked or camped — not just driven or flown through.",
    options: [
      { v: "A", l: "Below 1,500m", s: "Sea level to low hills only" },
      { v: "B", l: "1,500–2,500m", s: "Minor headaches, adapted well" },
      { v: "C", l: "2,500–3,500m", s: "Acclimatised without major issues" },
      { v: "D", l: "3,500–4,500m", s: "Himalayan trekking altitude, handled well" },
      { v: "E", l: "Above 4,500m", s: "High camps, thin air, no significant AMS" },
    ],
  },
  {
    key: "Q7",
    axis: "Focus",
    icon: <Shield className="w-4 h-4" />,
    question: "How comfortable are you on narrow exposed paths with a significant drop on one or both sides?",
    hint: "Where a misstep has real consequences — not a momentary step.",
    options: [
      { v: "A", l: "Very uncomfortable, prefer wide paths", s: "Heights cause distress" },
      { v: "B", l: "Manageable with slow movement", s: "Discomfort, but I push through" },
      { v: "C", l: "Comfortable with solid footing", s: "Focused but not anxious" },
      { v: "D", l: "Comfortable on narrow or exposed ridges", s: "Heights don't affect performance" },
      { v: "E", l: "Fully at ease in high-exposure terrain", s: "Thrives on exposed ridges and walls" },
    ],
  },
  {
    key: "Q8",
    axis: "Nerve",
    icon: <Ghost className="w-4 h-4" />,
    question: "If you were stuck in a remote area — no signal, hours from help — how do you respond?",
    hint: "No phone, no guide, no guarantee of rescue. Real wilderness self-reliance.",
    options: [
      { v: "A", l: "Prefer to stay near help at all times", s: "Needs consistent access to support" },
      { v: "B", l: "OK on known routes with others nearby", s: "Short remote stretches manageable" },
      { v: "C", l: "Can manage basic needs and short delays", s: "1–2 days remote with preparation" },
      { v: "D", l: "Self-sufficient in remote terrain", s: "Multi-day remote, calm under pressure" },
      { v: "E", l: "Fully expedition-level self-reliant", s: "Weeks alone, deep wilderness, no issue" },
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
  focus:    <ScanEye  className="w-3.5 h-3.5" />,
  nerve: <Ghost    className="w-3.5 h-3.5" />,
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
      className="rounded-2xl overflow-hidden border relative"
      style={{ background: `linear-gradient(150deg, ${currentRank.color}14 0%, transparent 60%)`, borderColor: `${currentRank.color}25` }}
    >
      <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: currentRank.color }} />

      <div className="relative px-5 pt-5 pb-5 flex flex-col gap-5">

        {/* Identity row */}
        <div className="flex items-start gap-4">
          <div
            className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${currentRank.color}18`, color: currentRank.color, boxShadow: `0 0 32px ${currentRank.color}38`, border: `1px solid ${currentRank.color}28` }}
          >
            <div className="scale-[1.55]">{currentRank.icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-[0.22em] font-semibold mb-1" style={{ color: "var(--text-tertiary)" }}>Capability Tier</p>
            <h3 className="text-[26px] font-black tracking-tight leading-none" style={{ color: currentRank.color }}>{currentRank.label}</h3>
            <div className="flex items-center gap-[3px] mt-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[13px] leading-none" style={{ color: i < currentRank.stars ? currentRank.color : "var(--text-muted)" }}>★</span>
              ))}
              <span className="text-[10px] ml-2" style={{ color: "var(--text-muted)" }}>Rank {currentRank.stars} of 5</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: `${currentRank.color}18` }} />

        {/* Progress numbers */}
        {nextRank ? (
          <>
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-0.5 leading-none">
                  <span className="text-[38px] font-black tabular-nums tracking-tight" style={{ color: currentRank.color }}>{progressPct}</span>
                  <span className="text-lg font-bold ml-0.5" style={{ color: `${currentRank.color}70` }}>%</span>
                </div>
                <p className="text-[11px] mt-1 leading-none" style={{ color: "var(--text-tertiary)" }}>
                  to reach <span className="font-bold" style={{ color: nextRank.color }}>{nextRank.label}</span>
                </p>
              </div>
              <div className="text-right pb-1">
                <p className="text-[24px] font-black tabular-nums leading-none" style={{ color: "var(--text-secondary)" }}>{nextRank.minScore - totalScore}</p>
                <p className="text-[11px] mt-1 leading-none" style={{ color: "var(--text-tertiary)" }}>pts needed</p>
              </div>
            </div>
            <RankBar totalScore={totalScore} trackH={10} showLabels showYouTag={false} />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#a78bfa" }} />
              <p className="text-xs font-bold tracking-widest uppercase text-[#a78bfa]">The absolute pinnacle</p>
            </div>
            <RankBar totalScore={totalScore} trackH={10} showLabels showYouTag={false} />
          </>
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

// ─── Axis bar ─────────────────────────────────────────────────────────────────

function AxisBar({ axis, value, max = 5 }: { axis: string; value: number; max?: number }) {
  const color = AXIS_COLORS[axis] ?? "#ff5100";
  const icon = AXIS_ICONS[axis];
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 flex items-center gap-1.5 shrink-0">
        <span style={{ color }} className="opacity-70">{icon}</span>
        <span className="text-[11px] uppercase tracking-wide capitalize" style={{ color: "var(--text-tertiary)" }}>{axis}</span>
      </div>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border-subtle)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <span className="text-xs w-4 text-right font-mono" style={{ color: "var(--text-secondary)" }}>{value}</span>
    </div>
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
              8 questions across stamina, strength, altitude, nerve and more. We map your capability and surface the adventures that actually fit.
            </p>

            <p className="text-[11px] tracking-wide mb-2 text-center" style={{ color: "var(--text-muted)" }}>Takes about 2 minutes</p>

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
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* Radar */}
        <div className="shrink-0 flex flex-col items-center sm:items-start gap-2.5 p-4 sm:p-5 w-full sm:w-auto">
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold self-start" style={{ color: "var(--text-tertiary)" }}>Capability Breakdown</p>
          <div className="rounded-xl sm:rounded-2xl flex items-center justify-center p-3 sm:p-4 w-full sm:w-auto"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,81,0,0.06) 0%, transparent 70%)", border: "1px solid var(--border-subtle)" }}>
            <ACERadar ace={userAxes} size={190} showLabels />
          </div>
        </div>

        {/* Divider — horizontal on mobile, vertical on sm+ */}
        <div className="sm:hidden h-px mx-4" style={{ background: "var(--border-subtle)" }} />
        <div className="hidden sm:block w-px self-stretch" style={{ background: "var(--border-subtle)" }} />

        {/* Strengths */}
        <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: "var(--text-tertiary)" }}>{sectionLabel}</p>
            {hasMore && (
              <button onClick={() => setShowAll(v => !v)}
                className="text-[9px] font-semibold transition-colors"
                style={{ color: "var(--text-tertiary)" }}>
                {showAll ? "Show less" : `+${sorted.length - 4} more`}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {visible.map(([axis, val]) => {
              const color = axisColors[axis] ?? "#ff5100";
              const icon  = axisIcons[axis];
              return (
                <div key={axis} className="flex items-center py-1.5 rounded-md px-2 gap-2" style={{ background: `${color}0c`, border: `1px solid ${color}1c` }}>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 [&>svg]:w-3 [&>svg]:h-3"
                    style={{ background: `${color}14`, border: `1.5px solid ${color}28`, boxShadow: `0 0 6px ${color}20`, color }}>
                    {icon}
                  </div>
                  <span className="text-[11px] font-bold capitalize" style={{ color }}>{axisLabels[axis]}</span>
                  <span className="text-[9px] truncate flex-1" style={{ color: "var(--text-tertiary)" }}>{axisDesc[axis]}</span>
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
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>

      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 sm:pb-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold mb-1" style={{ color: "var(--text-tertiary)" }}>What to train next</p>
        <h3 className="t-text font-bold text-base leading-tight">Unlock harder adventures</h3>
        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>Build these up and more adventures open up for you.</p>
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
                  <span className="t-text font-bold text-sm capitalize">{item.axis}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${color}18`, color }}>
                    +{gap} level{gap > 1 ? "s" : ""} to go
                  </span>
                  <span className="text-[10px] ml-auto font-mono" style={{ color: "var(--text-muted)" }}>
                    {item.current_level} → {item.required_level}
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
        <div className="px-4 sm:px-6 pb-4 -mt-1">
          <button onClick={() => setShowAll(v => !v)}
            className="w-full py-2 rounded-xl text-[11px] font-semibold transition-all"
            style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}>
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
      <FadeInSection>
      <div className="mb-6 sm:mb-8">
        <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.25em] uppercase mb-2">Adventure Matchmaker</p>
        <h2 className="t-text text-2xl sm:text-3xl font-black tracking-tight">Adventure Capability Engine Profile</h2>
      </div>
      </FadeInSection>

      {/* ── 2. TIER HERO CARD ────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden border relative mb-5"
        style={{ background: `linear-gradient(150deg, ${tier.color}12 0%, transparent 60%)`, borderColor: `${tier.color}22` }}
      >
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-[0.06] blur-3xl pointer-events-none" style={{ background: tier.color }} />

        {/* Identity row */}
        <div className="relative flex items-center gap-3.5 px-4 sm:px-5 py-4">
          {/* Tier icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${tier.color}18`, color: tier.color, boxShadow: `0 0 20px ${tier.color}30`, border: `1px solid ${tier.color}25` }}
          >
            <div className="scale-[1.4]">{tierRank?.icon}</div>
          </div>

          {/* Tier label */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-[0.22em] font-semibold mb-0.5" style={{ color: "var(--text-tertiary)" }}>Capability Tier</p>
            <h1 className="text-[22px] font-black tracking-tight leading-none" style={{ color: tier.color }}>{tier.label}</h1>
          </div>

          {/* Stars — right */}
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <div className="flex items-center gap-[2px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[11px] leading-none" style={{ color: i < (tierRank?.stars ?? 0) ? tier.color : "var(--text-muted)" }}>★</span>
              ))}
            </div>
            <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>Rank {tierRank?.stars ?? 0} of 5</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 sm:mx-5 h-px" style={{ background: `${tier.color}12` }} />

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
            <div className="px-4 sm:px-5 pt-3 pb-4">
              {/* Status row */}
              <div className="flex items-center justify-between mb-2.5">
                {nextRank ? (
                  justUnlocked ? (
                    <span className="text-[11px] font-bold" style={{ color: tier.color }}>Rank just unlocked!</span>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[22px] font-black tabular-nums tracking-tight leading-none" style={{ color: tier.color }}>{progressPct}<span className="text-sm font-bold ml-0.5" style={{ color: `${tier.color}60` }}>%</span></span>
                      <span className="text-[11px] leading-none" style={{ color: "var(--text-tertiary)" }}>to <span className="font-semibold" style={{ color: nextRank.color }}>{nextRank.label}</span></span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#a78bfa" }} />
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#a78bfa]">Pinnacle rank</p>
                  </div>
                )}
                {nextRank && !justUnlocked && (
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}><span className="font-bold" style={{ color: "var(--text-secondary)" }}>{ptsNeeded}</span> pts needed</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="relative h-[7px] rounded-full mb-2" style={{ background: "var(--border-subtle)" }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${((currentRankIndex + progressPct / 100) / (totalRanks - 1)) * 100}%`,
                    background: `linear-gradient(to right, ${RANKS[1].color}99, ${tier.color})`,
                    boxShadow: `0 0 10px ${tier.color}44`,
                  }}
                />
                {RANKS.slice(1, -1).map((rank, i) => (
                  <div key={rank.label} className="absolute inset-y-0 w-px" style={{ left: `${((i + 1) / (totalRanks - 1)) * 100}%`, background: "var(--border-subtle)" }} />
                ))}
                <div
                  className="absolute w-[14px] h-[14px] rounded-full border-2 transition-all duration-700"
                  style={{
                    left: `${((currentRankIndex + progressPct / 100) / (totalRanks - 1)) * 100}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    background: tier.color,
                    borderColor: "var(--bg-page)",
                    boxShadow: `0 0 10px ${tier.color}`,
                  }}
                />
              </div>

              {/* Rank labels */}
              <div className="relative h-4">
                {RANKS.map((rank, i) => (
                  <span
                    key={rank.label}
                    className="absolute text-[7px] font-semibold leading-none whitespace-nowrap top-0"
                    style={{
                      left: `${(i / (totalRanks - 1)) * 100}%`,
                      transform: i === 0 ? "none" : i === totalRanks - 1 ? "translateX(-100%)" : "translateX(-50%)",
                      color: i === currentRankIndex ? tier.color : i < currentRankIndex ? `${rank.color}45` : "var(--text-muted)",
                    }}
                  >
                    {rank.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── 3. ACE RADAR + STRENGTHS ─────────────────────────────────────────── */}
      {(() => {
        const allEntries = Object.entries(userAxes).sort(([, a], [, b]) => b - a);
        const values = allEntries.map(([, v]) => v);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const allEqual = values.every(v => v === values[0]);
        const aboveAvg = allEntries.filter(([, v]) => v > mean);
        // Rules:
        // - All equal + avg >= 4 → show all 8 (4 visible + 4 in dropdown)
        // - All equal + avg < 4  → show only top 4, no dropdown
        // - Above avg > 4        → show top 4, rest in dropdown
        // - Above avg <= 4       → show only those, no dropdown
        const sorted = (allEqual && mean >= 4)
          ? allEntries
          : aboveAvg.length > 4
            ? aboveAvg
            : aboveAvg.length > 0
              ? aboveAvg
              : allEntries.slice(0, 4).filter(([, v]) => v > 0);
        const sectionLabel = "Standout Strengths";
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
      <FadeInSection delay={150}>
      <div className="space-y-2.5 mb-5 sm:mb-7">
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold px-0.5 mb-2.5" style={{ color: "var(--text-tertiary)" }}>Matched Adventures</p>
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
      </FadeInSection>

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
          className="sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98]"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
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
      style={{ borderColor: `${accentColor}22`, background: `linear-gradient(160deg, ${accentColor}06 0%, transparent 60%)` }}
    >
      {/* ── Accordion header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 transition-colors hover:bg-black/[0.02] text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${accentColor}18`, color: accentColor }}
          >
            {icon}
          </div>
          <div>
            <p className="font-bold text-[13px] sm:text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{label}</p>
            <p className="text-[10px] sm:text-[11px] mt-0.5 leading-snug" style={{ color: "var(--text-tertiary)" }}>{sublabel}</p>
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
                style={{ borderColor: `${accentColor}18`, background: "var(--bg-card)" }}
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
                    <Pill type="type" value={a.type} />
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
    saveProfileToServer(profile);
    awardXP("ace_complete");

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
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{stepIndex + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${AXIS_COLORS[currentQ.axis.toLowerCase()] ?? "#ff5100"}20`, color: AXIS_COLORS[currentQ.axis.toLowerCase()] ?? "#ff5100" }}
          >
            {AXIS_ICONS[currentQ.axis.toLowerCase()]}
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{currentQ.axis}</h1>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-9">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < stepIndex ? "#ff5100" : i === stepIndex ? "#ff5100cc" : "var(--border-subtle)" }}
          />
        ))}
      </div>

      {/* Question */}
      <div className="space-y-2.5">
        <h2 className="text-xl sm:text-2xl font-semibold leading-snug mb-1.5" style={{ color: "var(--text-primary)" }}>{currentQ.question}</h2>
        {currentQ.hint && <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{currentQ.hint}</p>}
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
          className="flex items-center gap-1.5 transition-colors text-sm" style={{ color: "var(--text-muted)" }} onMouseEnter={e => { e.currentTarget.style.color = "var(--text-secondary)" }} onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)", opacity: 0.5 }}>
        {stepIndex + 1} of {QUESTIONS.length}
      </p>
    </div>
  );
}
