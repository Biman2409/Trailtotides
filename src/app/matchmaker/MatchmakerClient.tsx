"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight, ChevronLeft, MapPin, ArrowRight, RotateCcw,
  Zap, Shield, Mountain, CheckCircle2, TrendingUp, Lock,
} from "lucide-react";
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

// Phase labels for progress display
const PHASE_LABELS: Record<Step, { phase: string; title: string }> = {
  cardio:   { phase: "Engine Check",         title: "Cardiovascular Fitness" },
  load:     { phase: "Engine Check",         title: "Strength & Load" },
  altitude: { phase: "Resilience Check",     title: "Altitude Experience" },
  terrain:  { phase: "Technical Experience", title: "Terrain Comfort" },
  bio:      { phase: "Technical Experience", title: "Physical Profile" },
};

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

// ─── Step progress tabs ───────────────────────────────────────────────────────

function StepProgress({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{
            background: i <= stepIndex ? "#ff5100" : "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Intro screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  const pillars = [
    {
      icon: <Zap className="w-5 h-5" />,
      name: "Engine",
      color: "#f59e0b",
      desc: "Your cardiovascular endurance and stamina. Can your heart and lungs sustain long days at altitude?",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      name: "Resilience",
      color: "#22d3ee",
      desc: "Your ability to handle fatigue, altitude, multi-day exertion, and remote environments.",
    },
    {
      icon: <Mountain className="w-5 h-5" />,
      name: "Technical",
      color: "#a78bfa",
      desc: "Your familiarity with trekking terrain, gear, exposed ridges, and mountain conditions.",
    },
  ];

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      {/* Header */}
      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Adventure Matchmaker</p>
      <h1 className="text-white text-4xl font-bold tracking-tight leading-tight mb-3">
        Adventures built, for your body
      </h1>
      <p className="text-white/50 text-base leading-relaxed mb-8">
        Not every trek is for everyone. Discover what your body is genuinely ready for — and what it takes to go further.
      </p>

      {/* ERT Pillars */}
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
      <p className="text-white/20 text-xs text-center mt-3">5 questions · takes about 2 minutes</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MatchmakerClient() {
  const [started, setStarted] = useState(false);
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
    const full = answers as MatchmakerAnswers;
    const profile = computeUserProfile(full);
    saveProfile({ ert: profile.ert, label: profile.label, summary: profile.summary, answers: full });
    setDone(true);
  }

  if (!started) return <IntroScreen onStart={() => setStarted(true)} />;
  if (done) return <ResultsScreen answers={answers as MatchmakerAnswers} />;

  const phase = PHASE_LABELS[currentStep];

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Adventure Matchmaker</p>
        <h1 className="text-white text-2xl font-bold tracking-tight">
          {phase.phase}
        </h1>
        <p className="text-white/35 text-sm mt-1">{phase.title}</p>
      </div>

      <StepProgress stepIndex={stepIndex} />

      {/* Step content */}
      <div className="space-y-3">
        {currentStep === "cardio" && (
          <>
            <h2 className="text-white text-xl font-semibold mb-5">
              If you had to run 5 km today, how would it go?
            </h2>
            {[
              { v: "A", l: "Under 25 minutes, comfortably", s: "Strong aerobic base" },
              { v: "B", l: "25–32 minutes with some effort", s: "Solid fitness, room to push" },
              { v: "C", l: "32–40 minutes with walking breaks", s: "Building base fitness" },
              { v: "D", l: "Over 40 minutes, or I wouldn't attempt it", s: "Just getting started" },
            ].map(o => (
              <OptionBtn key={o.v} value={o.v} label={o.l} sub={o.s} selected={answers.cardio === o.v} onClick={() => set("cardio", o.v as "A")} />
            ))}
          </>
        )}

        {currentStep === "load" && (
          <>
            <h2 className="text-white text-xl font-semibold mb-5">
              Have you hiked carrying a 10–12 kg backpack?
            </h2>
            {[
              { v: "A", l: "Yes — on multi-day treks", s: "5+ days carrying a full pack" },
              { v: "B", l: "Yes — on day hikes", s: "But not overnight" },
              { v: "C", l: "Only light day packs", s: "Under 5 kg" },
              { v: "D", l: "Never carried a backpack", s: "Starting from scratch" },
            ].map(o => (
              <OptionBtn key={o.v} value={o.v} label={o.l} sub={o.s} selected={answers.load === o.v} onClick={() => set("load", o.v as "A")} />
            ))}
          </>
        )}

        {currentStep === "altitude" && (
          <>
            <h2 className="text-white text-xl font-semibold mb-5">
              What&apos;s the highest altitude where you&apos;ve slept overnight?
            </h2>
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
            <h2 className="text-white text-xl font-semibold mb-5">
              What&apos;s the most technical terrain you&apos;re comfortable moving through?
            </h2>
            {[
              { v: "A", l: "Walking trails only", s: "Flat to moderate incline, clear paths" },
              { v: "B", l: "Steep, rocky, uneven trails", s: "Loose scree, river crossings" },
              { v: "C", l: "Scrambling on exposed sections", s: "Hands needed for balance" },
              { v: "D", l: "Snow and ice with microspikes or crampons", s: "Confident on frozen terrain" },
              { v: "E", l: "Full mountaineering — ropes and ice axe", s: "Glacier travel, crevasse terrain" },
            ].map(o => (
              <OptionBtn key={o.v} value={o.v} label={o.l} sub={o.s} selected={answers.terrain === o.v} onClick={() => set("terrain", o.v as "A")} />
            ))}
          </>
        )}

        {currentStep === "bio" && (
          <>
            <h2 className="text-white text-xl font-semibold mb-2">
              A few quick numbers.
            </h2>
            <p className="text-white/35 text-sm mb-5">Used to estimate joint load and exertion limits — nothing more.</p>
            <div className="space-y-4">
              {[
                { key: "age" as const,    label: "Age",    placeholder: "e.g. 34",  unit: "yrs" },
                { key: "weight" as const, label: "Weight", placeholder: "e.g. 72",  unit: "kg" },
                { key: "height" as const, label: "Height", placeholder: "e.g. 175", unit: "cm" },
              ].map(f => (
                <div
                  key={f.key}
                  className="flex items-center gap-3 rounded-2xl border px-5 py-3"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
                >
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
              <div
                className="rounded-2xl border px-5 py-3"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
              >
                <label className="text-white/40 text-xs uppercase tracking-widest block mb-1.5">
                  Past Injuries <span className="normal-case text-white/20">(optional)</span>
                </label>
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
          onClick={() => {
            if (stepIndex === 0) { setStarted(false); }
            else { setStepIndex(i => i - 1); }
          }}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-sm"
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
          {stepIndex === STEPS.length - 1 ? "See my results" : "Continue"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-white/15 text-xs mt-6">
        {stepIndex + 1} of {STEPS.length}
      </p>
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────────

const TIER_INFO: Record<string, { color: string; icon: string; desc: string }> = {
  "Beginner Explorer":      { color: "#22d3ee", icon: "◈", desc: "You're at the start of your mountain journey. Excellent trails await." },
  "Trail Trekker":          { color: "#4ade80", icon: "◈◈", desc: "You can handle multi-day treks on well-established routes." },
  "Mountain Adventurer":    { color: "#f59e0b", icon: "◈◈◈", desc: "You're ready for challenging high-altitude treks with real commitment." },
  "High-Altitude Trekker":  { color: "#f97316", icon: "◈◈◈◈", desc: "Remote, demanding expeditions are within your reach." },
  "Expedition Climber":     { color: "#a78bfa", icon: "◈◈◈◈◈", desc: "You're operating at the upper end. Technical peaks are viable." },
};

const IMPROVEMENT_TIPS: Record<string, string[]> = {
  "Beginner Explorer": [
    "Complete a 3-day trek to build overnight experience",
    "Train cardio with 3 runs per week for 8 weeks",
    "Sleep at 2,500 m+ to begin altitude exposure",
    "Carry a 6–8 kg daypack on weekend hikes",
  ],
  "Trail Trekker": [
    "Complete a 5+ day trek with a 10 kg pack",
    "Sleep above 3,500 m on your next trip",
    "Practice on rocky, uneven trails regularly",
    "Add interval training to your cardio routine",
  ],
  "Mountain Adventurer": [
    "Gain experience sleeping above 4,000 m",
    "Complete a trek with a high pass crossing",
    "Practice scrambling on exposed terrain",
    "Train loaded carries of 12+ kg",
  ],
  "High-Altitude Trekker": [
    "Take a basic mountaineering skills course",
    "Practice crampon use and ice axe techniques",
    "Build expedition experience with a guided 6,000 m peak",
    "Train for sustained 8-hour walking days",
  ],
  "Expedition Climber": [
    "Pursue technical climbing certifications",
    "Expand glacier travel and crevasse rescue skills",
    "Consider 7,000 m peak preparation",
    "Work with a high-altitude training coach",
  ],
};

function ResultsScreen({ answers }: { answers: MatchmakerAnswers }) {
  const profile = computeUserProfile(answers);
  const allMatches = getMatchedAdventures(profile.ert, adventures);
  const tier = TIER_INFO[profile.label] ?? TIER_INFO["Trail Trekker"];
  const tips = IMPROVEMENT_TIPS[profile.label] ?? IMPROVEMENT_TIPS["Trail Trekker"];

  // Bucket matched adventures: Ready Now (top 4), Stretch (1 level above), Future (2+ above)
  const readyNow = allMatches.slice(0, 4);

  // Stretch = adventures with total ERT 1 above user ceiling
  const stretchMatches = adventures
    .filter(a => {
      const ert = getERT(a);
      const userTotal = profile.ert.e + profile.ert.r + profile.ert.t;
      const advTotal = ert.e + ert.r + ert.t;
      return advTotal === userTotal + 1 || advTotal === userTotal + 2;
    })
    .sort((a, b) => {
      const ea = getERT(a), eb = getERT(b);
      return (ea.e + ea.r + ea.t) - (eb.e + eb.r + eb.t);
    })
    .slice(0, 2);

  // Future = further above
  const futureMatches = adventures
    .filter(a => {
      const ert = getERT(a);
      const userTotal = profile.ert.e + profile.ert.r + profile.ert.t;
      const advTotal = ert.e + ert.r + ert.t;
      return advTotal >= userTotal + 3;
    })
    .sort((a, b) => {
      const ea = getERT(a), eb = getERT(b);
      return (ea.e + ea.r + ea.t) - (eb.e + eb.r + eb.t);
    })
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-6 py-24">

      {/* Tier card */}
      <div className="mb-3">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Your Adventure Profile</p>
      </div>
      <div
        className="rounded-3xl p-7 mb-10 border relative overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.09)" }}
      >
        {/* Glow accent */}
        <div
          className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: tier.color }}
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Adventure Tier</p>
              <h1 className="text-white text-3xl font-bold tracking-tight">{profile.label}</h1>
              <p className="text-white/50 text-sm mt-1.5 leading-relaxed">{tier.desc}</p>
            </div>
            <span className="text-3xl shrink-0 mt-1" style={{ color: tier.color, letterSpacing: "-2px" }}>
              {tier.icon}
            </span>
          </div>

          {/* ERT breakdown */}
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">Your ERT Capability</p>
          <ERTBadge ert={profile.ert} size="md" dark />

          <p className="text-white/50 text-sm leading-relaxed mt-4">{profile.summary}</p>

          {profile.limitReasons.length > 0 && (
            <div className="mt-4 space-y-1.5 pt-4 border-t border-white/6">
              {profile.limitReasons.map((r, i) => (
                <p key={i} className="text-white/30 text-xs flex items-start gap-2">
                  <span className="text-amber-400/70 mt-0.5 shrink-0">•</span>{r}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Ready Now ── */}
      <AdventureCategory
        label="Ready Now"
        sublabel="Treks you can confidently attempt with your current capability"
        icon={<CheckCircle2 className="w-4 h-4" style={{ color: "#4ade80" }} />}
        adventures={readyNow}
        accentColor="#4ade80"
      />

      {/* ── Stretch Challenge ── */}
      {stretchMatches.length > 0 && (
        <AdventureCategory
          label="Stretch Challenge"
          sublabel="Slightly above your current range — achievable with focused preparation"
          icon={<TrendingUp className="w-4 h-4" style={{ color: "#f59e0b" }} />}
          adventures={stretchMatches}
          accentColor="#f59e0b"
          dimmed
        />
      )}

      {/* ── Future Expeditions ── */}
      {futureMatches.length > 0 && (
        <AdventureCategory
          label="Future Expeditions"
          sublabel="Long-term goals that require dedicated training and experience building"
          icon={<Lock className="w-4 h-4" style={{ color: "#a78bfa" }} />}
          adventures={futureMatches}
          accentColor="#a78bfa"
          dimmed
        />
      )}

      {/* ── Improvement Guidance ── */}
      <div
        className="rounded-2xl p-6 mb-10 border"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">To reach the next tier</p>
        <h3 className="text-white font-semibold text-base mb-4">How to unlock harder adventures</h3>
        <div className="space-y-2.5">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}
              >
                {i + 1}
              </span>
              <p className="text-white/55 text-sm leading-snug">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTAs ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <Link
          href="/explore"
          className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white transition-all hover:brightness-110"
          style={{ background: "#ff5100" }}
        >
          Explore similar treks
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/explore"
          className="flex items-center gap-2 px-5 py-3 rounded-full border text-white/60 text-sm font-medium hover:text-white transition-colors"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          Browse all adventures
        </Link>
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("ttt_matchmaker_profile");
              window.location.reload();
            }
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full text-white/30 text-sm hover:text-white/60 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retake assessment
        </button>
      </div>
    </div>
  );
}

// ─── Adventure category section ───────────────────────────────────────────────

import type { Adventure } from "@/lib/data";

function AdventureCategory({
  label, sublabel, icon, adventures: list, accentColor, dimmed = false,
}: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  adventures: Adventure[];
  accentColor: string;
  dimmed?: boolean;
}) {
  if (list.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="text-white font-bold text-lg">{label}</h2>
      </div>
      <p className="text-white/35 text-sm mb-5">{sublabel}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {list.map(a => {
          const ert = getERT(a);
          return (
            <Link
              key={a.slug}
              href={`/experiences/${a.slug}`}
              className="group rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-xl duration-300"
              style={{
                borderColor: dimmed ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                opacity: dimmed ? 0.8 : 1,
              }}
            >
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={a.heroImage}
                  alt={a.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: dimmed ? "saturate(0.7)" : undefined }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" style={{ color: accentColor }} />
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
  );
}
