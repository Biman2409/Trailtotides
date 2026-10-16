"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, MotionConfig, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Route, ListChecks, Target } from "lucide-react";
import { Flame, Zap, Dumbbell, Compass, Waves, Mountain, ScanEye, Ghost, Activity, Layers, Globe, Brain } from "@/lib/localIcons";
import ACERadar from "@/components/ui/custom/ACERadar";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import type { ACE, AceAxis } from "@/lib/ace";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const VIEW = { once: true, margin: "-60px" } as const;

const AXES: { key: AceAxis; icon: React.ReactNode; color: string; label: string; desc: string }[] = [
  { key: "stamina",  icon: <Flame    className="w-3.5 h-3.5" />, color: "#f97316", label: "Stamina",  desc: "Keeping going day after day: 6–8 hours on your feet, often with no rest day." },
  { key: "power",    icon: <Zap      className="w-3.5 h-3.5" />, color: "#eab308", label: "Power",    desc: "Short, all-out efforts: a steep climb, a rapid, a summit push." },
  { key: "strength", icon: <Dumbbell className="w-3.5 h-3.5" />, color: "#84cc16", label: "Strength", desc: "Carrying a loaded pack over rough ground for hours. Legs, back and joints." },
  { key: "agility",  icon: <Compass  className="w-3.5 h-3.5" />, color: "#22d3ee", label: "Agility",  desc: "Moving surely on loose rock, ice and narrow ridges." },
  { key: "water",    icon: <Waves    className="w-3.5 h-3.5" />, color: "#3b82f6", label: "Water",    desc: "Being at ease in moving water: rapids, river crossings, open water." },
  { key: "altitude", icon: <Mountain className="w-3.5 h-3.5" />, color: "#a78bfa", label: "Altitude", desc: "Coping with thin air. Above 3,500m, acclimatising matters more than fitness." },
  { key: "focus",    icon: <ScanEye  className="w-3.5 h-3.5" />, color: "#f43f5e", label: "Focus",    desc: "Staying calm and careful near big drops, on fixed ropes or steep ground." },
  { key: "nerve",    icon: <Ghost    className="w-3.5 h-3.5" />, color: "#10b981", label: "Nerve",    desc: "Staying clear-headed far from help: no road, no signal, rescue hours away." },
];

const DOMAINS = [
  { name: "Engine",   icon: <Activity className="w-3.5 h-3.5" />, color: "#f97316", axes: ["Stamina", "Power"],    desc: "How hard and how long you can go" },
  { name: "Chassis",  icon: <Layers   className="w-3.5 h-3.5" />, color: "#22d3ee", axes: ["Strength", "Agility"], desc: "Carrying weight and moving over rough ground" },
  { name: "Elements", icon: <Globe    className="w-3.5 h-3.5" />, color: "#a78bfa", axes: ["Water", "Altitude"],   desc: "Water and thin air" },
  { name: "Mind",     icon: <Brain    className="w-3.5 h-3.5" />, color: "#10b981", axes: ["Focus", "Nerve"],      desc: "Staying calm when it counts" },
];

const SCALE = [
  { level: 1, label: "Very Low",  sub: "Anyone active",          color: "#22c55e" },
  { level: 2, label: "Low",       sub: "Some regular exercise",  color: "#84cc16" },
  { level: 3, label: "Moderate",  sub: "Regular training",       color: "#eab308" },
  { level: 4, label: "High",      sub: "Serious preparation",    color: "#f97316" },
  { level: 5, label: "Extreme",   sub: "Elite fitness",          color: "#ef4444" },
];

// `span` is how many points of the 8–40 total each rank covers, for the track
const RANKS = [
  {
    label: "Pathfinder", color: "#22d3ee", stars: 1, range: "8–15", span: 8, desc: "Day hikes and easy multi-day trails.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Navigator", color: "#4ade80", stars: 2, range: "16–23", span: 8, desc: "Multi-day treks with moderate demands.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/></svg>,
  },
  {
    label: "Trailblazer", color: "#f59e0b", stars: 3, range: "24–31", span: 8, desc: "Technical routes, high altitude and longer trips.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Vanguard", color: "#f97316", stars: 4, range: "32–39", span: 8, desc: "Expeditions in remote, extreme conditions.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg>,
  },
  {
    label: "Apex", color: "#a78bfa", stars: 5, range: "40", span: 1.6, desc: "Strong across the board. Nothing is out of reach.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg>,
  },
];

export type AceTrek = {
  slug: string;
  label: string;
  sublabel: string;
  diffColor: string;
  desc: string;
  ace: ACE;
  name?: string;
  heroImage?: string;
};

// A water-heavy example so the hero shows the shape swinging to the other side of the chart
const RAFTING_EXAMPLE = {
  name: "Grade IV rafting",
  tag: "Example",
  color: "#3b82f6",
  ace: { stamina: 2, power: 4, strength: 2, agility: 3, water: 5, altitude: 0, focus: 3, nerve: 3 } as ACE,
};

const CYCLE_MS = 3600;
const REDUCED_CYCLE_MS = 6000;

export default function AceContent({ treks }: { treks: AceTrek[] }) {
  return (
    <MotionConfig reducedMotion="user">
      <style>{`
        .ace-spin { animation: aceSpin 48s linear infinite; }
        .ace-spin-rev { animation: aceSpin 70s linear infinite reverse; }
        .ace-progress { animation: aceProgress ${CYCLE_MS}ms linear forwards; transform-origin: left; }
        .ace-flow { animation: aceFlow 1.2s linear infinite; }
        .ace-shimmer::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%);
          background-size: 250% 100%; animation: aceShimmer 3.4s ease-in-out infinite; pointer-events: none;
        }
        .ace-pulse { animation: acePulse 2.6s ease-out infinite; }
        .ace-in { animation: aceIn 0.65s cubic-bezier(0.22,1,0.36,1) backwards; }
        .ace-in-blur { animation-name: aceInBlur; }
        .ace-in-scale { animation-name: aceInScale; animation-duration: 0.9s; }
        @keyframes aceIn { from { opacity: 0; transform: translateY(10px); } }
        @keyframes aceInBlur { from { opacity: 0; transform: translateY(18px); filter: blur(6px); } }
        @keyframes aceInScale { from { opacity: 0; transform: scale(0.9); } }
        @keyframes aceSpin { to { transform: rotate(360deg); } }
        @keyframes aceProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes aceFlow { to { stroke-dashoffset: -12; } }
        @keyframes aceShimmer { 0% { background-position: 130% 0; } 60%, 100% { background-position: -30% 0; } }
        @keyframes acePulse { 0% { box-shadow: 0 0 0 0 rgba(255,81,0,0.45); } 70%, 100% { box-shadow: 0 0 0 14px rgba(255,81,0,0); } }
        @media (prefers-reduced-motion: reduce) {
          .ace-spin, .ace-spin-rev, .ace-flow, .ace-pulse, .ace-shimmer::after { animation: none; }
          /* entrances still fade, they just don't move */
          .ace-in, .ace-in-blur, .ace-in-scale { animation-name: aceFade; }
          @keyframes aceFade { from { opacity: 0; } }
          /* the progress bar is a timer, not decoration: it keeps running at the slower pace */
          .ace-progress { animation-duration: ${REDUCED_CYCLE_MS}ms; }
        }
      `}</style>
      <Hero treks={treks} />
      <AxesSection />
      <ScaleAndRanks />
      <HowItWorks />
      <InPractice treks={treks} />
      <Cta />
    </MotionConfig>
  );
}

/* ── Shared bits ─────────────────────────────────────────────── */

function SectionHead({ eyebrow, aside, children }: { eyebrow: string; aside?: string; children?: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-1.5">
        <motion.span
          className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono"
          initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW} transition={{ duration: 0.5, ease: EASE }}
        >{eyebrow}</motion.span>
        <motion.div
          className="flex-1 h-px origin-left" style={{ background: "linear-gradient(90deg, rgba(255,81,0,0.35), rgba(var(--fg-rgb),0.08) 40%)" }}
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEW} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        />
        {aside && (
          <motion.span
            className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={VIEW} transition={{ duration: 0.5, delay: 0.5 }}
          >{aside}</motion.span>
        )}
      </div>
      {children && (
        <motion.p
          className="text-xs mb-5 leading-relaxed max-w-2xl" style={{ color: "var(--text-tertiary)" }}
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW} transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
        >{children}</motion.p>
      )}
    </>
  );
}

/* ── Hero ─────────────────────────────────────────────────────── */

function Hero({ treks }: { treks: AceTrek[] }) {
  const profiles = [
    ...treks.map(t => ({ name: t.name ?? t.label, tag: t.sublabel, color: t.diffColor, ace: t.ace })),
    RAFTING_EXAMPLE,
  ];
  const [idx, setIdx] = useState(0);
  const [hoverAxis, setHoverAxis] = useState<AceAxis | null>(null);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  // Keeps cycling under reduced motion, just slower: the shape changes in place, it doesn't travel
  const auto = !paused && !hoverAxis;
  const cycleMs = reduce ? REDUCED_CYCLE_MS : CYCLE_MS;

  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setIdx(i => (i + 1) % profiles.length), cycleMs);
    return () => clearTimeout(t);
  }, [auto, idx, cycleMs, profiles.length]);

  const current = profiles[idx];
  const words = "Know what an adventure asks of you".split(" ");

  return (
    <section className="relative pt-24 pb-12 px-5 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(var(--fg-rgb),1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--fg-rgb),1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <SectionTexture kind="trail" color="#ff5100" at="85% 45%" opacity={0.09} />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-[0.08]"
        style={{ background: "radial-gradient(ellipse, #ff5100 0%, #a78bfa 60%, transparent 100%)" }}
      />

      {/* The hero's entrance is plain CSS (`ace-in`), so it plays from the server HTML
          without waiting for hydration and the headline is never stuck invisible */}
      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
          {/* Left: text */}
          <div className="flex-1 min-w-0">
            <div
              className="ace-in inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded border" style={{ background: "rgba(255,81,0,0.06)", borderColor: "rgba(255,81,0,0.22)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
              <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">ACE<sup>™</sup> · How we rate adventures</span>
            </div>
            <h1 className="text-3xl lg:text-[2.6rem] font-black tracking-tight leading-[1.06] mb-3" style={{ color: "var(--text-primary)" }}>
              {words.map((w, i) => (
                <span key={i} className="ace-in ace-in-blur inline-block mr-[0.25em]" style={{ animationDelay: `${100 + i * 60}ms` }}>
                  {w === "asks" ? <span className="text-[#ff5100]">{w}</span> : w}
                </span>
              ))}
            </h1>
            <p
              className="ace-in text-sm leading-relaxed mb-5 max-w-lg" style={{ color: "var(--text-tertiary)", animationDelay: "550ms" }}
            >
              &ldquo;Easy&rdquo; and &ldquo;Hard&rdquo; don&apos;t tell you much. ACE<sup>™</sup>, our Adventure Capability Engine, scores every adventure on <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>8 things it asks of your body and mind</span>, so you can see what fits you before you book. Answer a few questions once and every adventure is matched to you.
            </p>

            {/* Axis chips: hover one to light it up on the chart; each shows the current profile's score */}
            <div className="flex flex-wrap gap-1.5 max-w-md">
              {AXES.map(({ key, label, color, icon }, i) => {
                const score = current.ace[key];
                const active = hoverAxis === key;
                return (
                  <span key={key} className="ace-in inline-block" style={{ animationDelay: `${700 + i * 50}ms` }}>
                  <motion.button
                    type="button"
                    onMouseEnter={() => setHoverAxis(key)}
                    onMouseLeave={() => setHoverAxis(null)}
                    onFocus={() => setHoverAxis(key)}
                    onBlur={() => setHoverAxis(null)}
                    className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg text-[10px] font-bold border font-mono cursor-default outline-none"
                    style={{ color, transition: "background 200ms, border-color 200ms, box-shadow 200ms",
                      background: active ? `${color}24` : `${color}10`,
                      borderColor: active ? `${color}70` : `${color}28`,
                      boxShadow: active ? `0 0 18px ${color}40` : "none" }}
                    initial={false}
                    animate={{ opacity: hoverAxis && !active ? 0.45 : 1, scale: active ? 1.05 : 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    <span className="opacity-70">{icon}</span>{label}
                    <span className="relative ml-0.5 w-4 h-4 rounded flex items-center justify-center overflow-hidden tabular-nums" style={{ background: `${color}1c` }}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={score}
                          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: score ? 1 : 0.4 }} exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                        >{score}</motion.span>
                      </AnimatePresence>
                    </span>
                  </motion.button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: radar morphing between real adventures */}
          <div
            className="ace-in ace-in-scale shrink-0 flex flex-col items-center" style={{ animationDelay: "200ms" }}
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          >
            <div className="relative flex items-center justify-center" style={{ width: 290, height: 290 }}>
              <div className="absolute inset-0 rounded-full blur-3xl opacity-15 pointer-events-none ace-spin" style={{ background: "conic-gradient(from 0deg, #f97316, #eab308, #84cc16, #22d3ee, #3b82f6, #a78bfa, #f43f5e, #10b981, #f97316)" }} />
              <svg className="absolute inset-[-8px] pointer-events-none ace-spin-rev" viewBox="0 0 100 100" aria-hidden>
                <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(var(--fg-rgb),0.12)" strokeWidth="0.25" strokeDasharray="0.6 2.4" />
              </svg>
              <svg className="absolute inset-[14px] pointer-events-none ace-spin" viewBox="0 0 100 100" aria-hidden>
                <circle cx="50" cy="50" r="49" fill="none" stroke={current.color} strokeOpacity="0.35" strokeWidth="0.35" strokeDasharray="14 40" style={{ transition: "stroke 600ms" }} />
              </svg>
              <ACERadar ace={current.ace} size={280} showLabels animated highlightAxis={hoverAxis} />
            </div>

            {/* Which profile is showing; click to pick one */}
            <div className="mt-1 flex flex-col items-center gap-2">
              <div className="h-5 relative w-64 flex justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={current.name}
                    className="text-[11px] font-mono absolute whitespace-nowrap" style={{ color: "var(--text-tertiary)" }}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
                  >
                    <span className="font-bold" style={{ color: "var(--text-primary)" }}>{current.name}</span>
                    <span className="mx-1.5 opacity-40">·</span>
                    <span style={{ color: current.color }}>{current.tag}</span>
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="flex gap-1.5" role="tablist" aria-label="Example adventures">
                {profiles.map((p, i) => (
                  <button
                    key={p.name}
                    type="button"
                    role="tab"
                    aria-selected={i === idx}
                    aria-label={p.name}
                    onClick={() => setIdx(i)}
                    className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                    style={{ width: i === idx ? 36 : 14, background: "rgba(var(--fg-rgb),0.12)" }}
                  >
                    {i === idx && (
                      <span
                        key={`${idx}-${auto}`}
                        className={`absolute inset-0 rounded-full ${auto ? "ace-progress" : ""}`}
                        style={{ background: p.color }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── The 8 axes ───────────────────────────────────────────────── */

function AxesSection() {
  return (
    <section className="relative py-10 px-5 lg:px-8 overflow-hidden" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
      <SectionTexture kind="tides" color="#22d3ee" at="10% 90%" opacity={0.07} />
      <div className="max-w-6xl mx-auto relative">
        <SectionHead eyebrow="What we measure" aside="8 scores in 4 groups">
          Every adventure gets its own score for each of these. A trek can be easy on your legs but hard on your nerves, and a single difficulty label would hide that.
        </SectionHead>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DOMAINS.map(({ name, icon, color, axes, desc }, di) => {
            const domainAxes = AXES.filter(a => axes.includes(a.label));
            return (
              <motion.div
                key={name}
                className="rounded-xl overflow-hidden border relative"
                style={{ borderColor: `${color}20`, background: `${color}05` }}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW}
                transition={{ duration: 0.6, ease: EASE, delay: di * 0.08 }}
                whileHover={{ y: -2, borderColor: `${color}45` }}
              >
                <motion.div
                  className="absolute top-0 left-0 right-0 h-px origin-left"
                  style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                  initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEW}
                  transition={{ duration: 1, ease: EASE, delay: 0.25 + di * 0.08 }}
                />
                <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: `1px solid ${color}15`, background: `${color}09` }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ color }}>{icon}</div>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono" style={{ color }}>{name}</span>
                  <span className="text-[10px] ml-1 truncate" style={{ color: "var(--text-muted)" }}>— {desc}</span>
                </div>
                <div>
                  {domainAxes.map(({ key, icon: axIcon, color: axColor, label, desc: axDesc }, ai) => (
                    <motion.div
                      key={key}
                      className="group flex items-start gap-3 px-4 py-3 transition-colors"
                      style={{ borderTop: ai ? `1px solid ${color}10` : undefined }}
                      initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.3 + di * 0.08 + ai * 0.08 }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
                        style={{ background: `${axColor}15`, color: axColor }}
                      >{axIcon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs font-mono" style={{ color: "var(--text-primary)" }}>{label}</span>
                          {/* five pips that light up on hover, hinting at the 1–5 scale */}
                          <span className="flex gap-0.5 ml-auto">
                            {[1, 2, 3, 4, 5].map(p => (
                              <span
                                key={p}
                                className="w-3 h-1 rounded-full transition-all duration-300 opacity-30 group-hover:opacity-100"
                                style={{ background: axColor, transitionDelay: `${p * 40}ms` }}
                              />
                            ))}
                          </span>
                        </div>
                        <p className="text-[10px] leading-relaxed mt-1" style={{ color: "var(--text-tertiary)" }}>{axDesc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Scale + ranks ────────────────────────────────────────────── */

function ScaleAndRanks() {
  const [hoverLevel, setHoverLevel] = useState<number | null>(null);
  const [hoverRank, setHoverRank] = useState<number | null>(null);
  const totalSpan = RANKS.reduce((s, r) => s + r.span, 0);

  return (
    <section className="py-10 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-stretch">

          {/* Scale */}
          <div className="flex flex-col">
            <SectionHead eyebrow="How scores work" aside="1 to 5">
              Each one is scored from 1 (very light) to 5 (extreme). If a trip doesn&apos;t involve something, like water on a desert trek, it scores 0.
            </SectionHead>

            {/* Gradient bar with a marker that follows the hovered level */}
            <div className="relative mb-3 pt-2">
              <motion.div
                className="absolute top-0 w-0 h-0 -translate-x-1/2"
                style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid ${hoverLevel ? SCALE[hoverLevel - 1].color : "transparent"}` }}
                animate={{ left: `${((hoverLevel ?? 3) - 0.5) * 20}%`, opacity: hoverLevel ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              />
              <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
                {SCALE.map(({ level, color }, i) => (
                  <motion.div
                    key={level} className="flex-1 h-1.5 origin-left" style={{ background: color }}
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEW}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 + i * 0.12 }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between gap-1.5" onMouseLeave={() => setHoverLevel(null)}>
              {SCALE.map(({ level, label, sub, color }, i) => {
                const on = hoverLevel === level;
                return (
                  <motion.div
                    key={level}
                    onMouseEnter={() => setHoverLevel(level)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border"
                    style={{ transition: "background 200ms, border-color 200ms", background: on ? `${color}14` : `${color}06`, borderColor: on ? `${color}40` : `${color}16` }}
                    initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.07 }}
                  >
                    <span className="font-black text-sm w-5 text-center font-mono leading-none shrink-0" style={{ color, textShadow: level >= 4 || on ? `0 0 12px ${color}80` : "none" }}>{level}</span>
                    <div className="w-px h-4 shrink-0" style={{ background: `${color}25` }} />
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{label}</span>
                    <span className="text-[10px] ml-auto text-right" style={{ color: "var(--text-muted)" }}>{sub}</span>
                    <div className="w-10 h-1 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(var(--fg-rgb),0.08)" }}>
                      <motion.div
                        className="h-full rounded-full" style={{ background: color }}
                        initial={{ width: 0 }} whileInView={{ width: `${(level / 5) * 100}%` }} viewport={VIEW}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.4 + i * 0.08 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Ranks */}
          <div className="flex flex-col">
            <SectionHead eyebrow="Your rank" aside="Your 8 scores added up">
              Add up your 8 scores (40 at most) and you get your rank: a quick way to see the kind of adventures you&apos;re ready for.
            </SectionHead>

            {/* 8 → 40 track, one segment per rank */}
            <div className="mb-3">
              <div className="flex gap-0.5 h-1.5 pt-2 box-content">
                {RANKS.map(({ label, color, span }, i) => (
                  <motion.div
                    key={label}
                    className="h-1.5 rounded-full origin-left"
                    style={{ flex: span / totalSpan, background: color, transition: "opacity 200ms", opacity: hoverRank === null || hoverRank === i ? 1 : 0.2 }}
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEW}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.14 }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
                <span>8</span><span>40</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between gap-2" onMouseLeave={() => setHoverRank(null)}>
              {RANKS.map(({ label, color, stars, range, desc, icon }, i) => (
                <motion.div
                  key={label}
                  onMouseEnter={() => setHoverRank(i)}
                  className="group flex items-center gap-3.5 px-3.5 py-3 rounded-xl border relative overflow-hidden"
                  style={{ background: `${color}06`, borderColor: hoverRank === i ? `${color}50` : `${color}22`, transition: "border-color 200ms" }}
                  initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.08 }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(ellipse at 0% 50%, ${color}14, transparent 60%)` }} />
                  <motion.div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center relative transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
                    style={{ background: `${color}15`, border: `1px solid ${color}28`, color, boxShadow: `0 0 16px ${color}18` }}
                    initial={{ scale: 0.4, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={VIEW}
                    transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.3 + i * 0.08 }}
                  >
                    <div className="scale-[1.1]">{icon}</div>
                  </motion.div>
                  <div className="flex-1 min-w-0 relative">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-sm leading-none" style={{ color: "var(--text-primary)" }}>{label}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <motion.span
                            key={s} className="text-[9px] leading-none inline-block"
                            style={{ color: s < stars ? color : "rgba(var(--fg-rgb),0.15)" }}
                            initial={s < stars ? { scale: 0, rotate: -90 } : false}
                            whileInView={{ scale: 1, rotate: 0 }} viewport={VIEW}
                            transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.5 + i * 0.08 + s * 0.06 }}
                          >★</motion.span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] leading-snug" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
                  </div>
                  <span className="relative shrink-0 text-[10px] font-black font-mono px-2 py-0.5 rounded-lg" style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>{range}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────────── */

const STEPS = [
  { step: "01", color: "#ff5100", icon: Route,      title: "We rate every adventure",    body: "Our team scores each adventure on all 8, using real route data: altitude, terrain and trip reports." },
  { step: "02", color: "#f59e0b", icon: ListChecks, title: "You answer a few questions", body: "The quick match takes a minute, the full assessment about three. Your answers become your own 8 scores, based on what you can actually do." },
  { step: "03", color: "#4ade80", icon: Target,     title: "You see what fits",          body: "Every adventure is marked ready, a stretch, or not yet. Where you fall short, we show you which score to work on." },
];

function StepVisual({ i, color }: { i: number; color: string }) {
  if (i === 0) {
    // eight axis dots landing one by one
    return (
      <div className="flex gap-1">
        {AXES.map((a, k) => (
          <motion.span
            key={a.key} className="w-2 h-2 rounded-full" style={{ background: a.color }}
            initial={{ scale: 0, y: -6 }} whileInView={{ scale: 1, y: 0 }} viewport={VIEW}
            transition={{ type: "spring", stiffness: 420, damping: 14, delay: 0.5 + k * 0.06 }}
          />
        ))}
      </div>
    );
  }
  if (i === 1) {
    // a short quiz progress bar filling up
    return (
      <div className="flex gap-1 w-28">
        {[0, 1, 2, 3, 4].map(k => (
          <div key={k} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(var(--fg-rgb),0.1)" }}>
            <motion.div
              className="h-full origin-left" style={{ background: color }}
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEW}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.7 + k * 0.22 }}
            />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-1.5">
      {[["Ready", "#4ade80"], ["Stretch", "#f59e0b"], ["Not yet", "#ef4444"]].map(([t, c], k) => (
        <motion.span
          key={t} className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded"
          style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}
          initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW}
          transition={{ duration: 0.4, ease: EASE, delay: 0.9 + k * 0.15 }}
        >{t}</motion.span>
      ))}
    </div>
  );
}

function Connector({ delay }: { delay: number }) {
  return (
    <motion.div
      className="hidden md:flex items-center justify-center w-8"
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={VIEW} transition={{ delay }}
      aria-hidden
    >
      <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
        <line x1="0" y1="6" x2="26" y2="6" stroke="rgba(255,81,0,0.5)" strokeWidth="1.5" strokeDasharray="3 3" className="ace-flow" />
        <path d="M24 2l5 4-5 4" stroke="rgba(255,81,0,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

function HowItWorks() {
  return (
    <section className="relative py-10 px-5 lg:px-8 overflow-hidden" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
      <div className="max-w-6xl mx-auto relative">
        <SectionHead eyebrow="How it works">
          We score the adventure, we score you, then compare the two one score at a time.
        </SectionHead>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2.5 md:gap-0">
          {STEPS.map(({ step, color, icon: Icon, title, body }, i) => (
            <div key={step} className="contents">
              {i > 0 && <Connector delay={0.4 + i * 0.2} />}
              <motion.div
                className="group rounded-xl border p-4 flex flex-col gap-3 relative overflow-hidden"
                style={{ background: `${color}06`, borderColor: `${color}18` }}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.15 }}
                whileHover={{ y: -3, borderColor: `${color}45` }}
              >
                <div className="absolute top-2 right-3 text-[44px] font-black leading-none tabular-nums select-none pointer-events-none font-mono transition-transform duration-500 group-hover:-translate-y-1"
                  style={{ color: `${color}12` }}>{step}</div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ background: `${color}18`, color }}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{title}</p>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{body}</p>
                <div className="mt-auto pt-1"><StepVisual i={i} color={color} /></div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── In practice ──────────────────────────────────────────────── */

function InPractice({ treks }: { treks: AceTrek[] }) {
  return (
    <section className="py-10 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionHead eyebrow="See it in action" aside="3 treks, 3 shapes">
          All three are treks, but each asks something different of you. The shape of each chart shows how.
        </SectionHead>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {treks.map((t, i) => (
            <motion.div
              key={t.slug}
              className="rounded-2xl overflow-hidden border flex flex-col group"
              style={{ borderColor: `${t.diffColor}25`, background: "var(--bg-card)" }}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              whileHover={{ y: -4, boxShadow: `0 18px 40px -18px ${t.diffColor}55`, borderColor: `${t.diffColor}55` }}
            >
              {t.heroImage && t.name && (
                <div className="relative h-24 overflow-hidden shrink-0">
                  <Image src={t.heroImage} alt={t.name} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 10%, rgba(0,0,0,0.8) 100%)" }} />
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-0.5 origin-center"
                    style={{ background: `linear-gradient(90deg, transparent, ${t.diffColor}, transparent)` }}
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEW} transition={{ duration: 0.9, delay: 0.3 + i * 0.12 }}
                  />
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black font-mono shadow-lg" style={{ background: t.diffColor, color: "#000", boxShadow: `0 0 10px ${t.diffColor}60` }}>{i + 1}</div>
                  <span className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono" style={{ background: "rgba(0,0,0,0.6)", color: t.diffColor, border: `1px solid ${t.diffColor}50`, backdropFilter: "blur(8px)" }}>{t.sublabel}</span>
                  <div className="absolute bottom-1.5 left-3 right-3">
                    <p className="text-[8px] font-black tracking-[0.2em] uppercase font-mono mb-0.5" style={{ color: t.diffColor }}>{t.label}</p>
                    <h3 className="text-white font-bold text-xs leading-tight">{t.name}</h3>
                  </div>
                </div>
              )}

              <p className="text-[10px] leading-snug px-3 pt-2 pb-0 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>{t.desc}</p>

              <div className="flex justify-center px-3 py-1 flex-1 items-center">
                <ACERadar ace={t.ace} size={150} showLabels animated />
              </div>

              <div className="px-3 pb-3">
                <Link href={`/experiences/${t.slug}`} className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[10px] font-bold transition-all hover:brightness-125 font-mono group/cta" style={{ background: `${t.diffColor}12`, color: t.diffColor, border: `1px solid ${t.diffColor}25` }}>
                  View adventure <ArrowRight className="w-3 h-3 transition-transform group-hover/cta:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ──────────────────────────────────────────────────────── */

function Cta() {
  return (
    <section className="relative overflow-hidden py-14 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="absolute inset-0" style={{ background: "var(--bg-page)" }} />
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(var(--fg-rgb),1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--fg-rgb),1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,81,0,0.13) 0%, transparent 65%)" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,81,0,0.4), transparent)" }} />

      <motion.div
        className="max-w-6xl mx-auto relative"
        initial={{ opacity: 0, y: 30, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={VIEW}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="rounded-2xl overflow-hidden border relative" style={{ borderColor: "rgba(255,81,0,0.18)", background: "rgba(255,81,0,0.04)" }}>
          <motion.div
            className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #ff5100, transparent)" }}
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEW} transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
          />
          {/* faint radar outline drifting in the corner */}
          <svg className="absolute -right-16 -top-16 w-72 h-72 pointer-events-none ace-spin-rev opacity-[0.07]" viewBox="0 0 100 100" aria-hidden>
            {[48, 38, 28, 18].map(r => (
              <polygon key={r} fill="none" stroke="#ff5100" strokeWidth="0.5"
                points={Array.from({ length: 8 }, (_, k) => { const a = (k * 45 - 90) * Math.PI / 180; return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`; }).join(" ")} />
            ))}
          </svg>

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-8 px-6 sm:px-8 py-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded border" style={{ background: "rgba(255,81,0,0.08)", borderColor: "rgba(255,81,0,0.25)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
                <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">Your Turn</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight mb-3" style={{ color: "var(--text-primary)" }}>
                Find out what you&apos;re ready for.
              </h2>
              <p className="text-sm leading-relaxed max-w-md" style={{ color: "var(--text-tertiary)" }}>
                Answer a few questions and we&apos;ll rate every adventure for you: ready, a stretch, or not yet. You&apos;ll also see what to work on next.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { val: "8", lbl: "Scores", color: "#f97316" },
                  { val: "1–3 min", lbl: "To finish", color: "#22d3ee" },
                  { val: "Instant", lbl: "Results", color: "#4ade80" },
                ].map(({ val, lbl, color }, i) => (
                  <motion.div
                    key={lbl} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: `${color}08`, borderColor: `${color}20` }}
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.4 + i * 0.1 }}
                  >
                    <span className="font-black text-xs font-mono" style={{ color }}>{val}</span>
                    <div className="w-px h-3" style={{ background: `${color}25` }} />
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{lbl}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3">
              <Link
                href="/matchmaker"
                className="ace-shimmer ace-pulse relative overflow-hidden group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#ff5100]/30"
                style={{ background: "linear-gradient(135deg, #ff5100 0%, #ff7d47 100%)" }}
              >
                Find my matches
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
