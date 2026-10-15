import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Flame, Zap, Dumbbell, Compass, Waves, Mountain, ScanEye, Ghost, Activity, Layers, Globe, Brain } from "@/lib/localIcons";
import { adventures } from "@/lib/data";
import ACERadar from "@/components/ui/custom/ACERadar";

export const metadata = {
  title: "How ACE rates adventures",
  description: "ACE scores every adventure on 8 things it asks of you, from stamina to nerve, so you can see what you're ready for before you book.",
  openGraph: {
    title: "How ACE rates adventures — Trail to Tides",
    description: "Every adventure scored on 8 things it asks of you, so you can see what fits.",
    url: "https://trailtotides.com/ace",
    images: [{ url: "https://images.unsplash.com/photo-1526139334526-f591a54b477c?w=1200&q=90", width: 1200, height: 630, alt: "How ACE rates adventures" }],
  },
  alternates: { canonical: "https://trailtotides.com/ace" },
};

const AXES = [
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
  { level: 3, label: "Moderate",  sub: "Regular training",     color: "#eab308" },
  { level: 4, label: "High",      sub: "Serious preparation",    color: "#f97316" },
  { level: 5, label: "Extreme",   sub: "Elite fitness",          color: "#ef4444" },
];

const RANKS = [
  {
    label: "Pathfinder", color: "#22d3ee", stars: 1, range: "8–15", desc: "Day hikes and easy multi-day trails.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Navigator", color: "#4ade80", stars: 2, range: "16–23", desc: "Multi-day treks with moderate demands.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/></svg>,
  },
  {
    label: "Trailblazer", color: "#f59e0b", stars: 3, range: "24–31", desc: "Technical routes, high altitude and longer trips.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Vanguard", color: "#f97316", stars: 4, range: "32–39", desc: "Expeditions in remote, extreme conditions.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg>,
  },
  {
    label: "Apex", color: "#a78bfa", stars: 5, range: "40", desc: "Strong across the board. Nothing is out of reach.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg>,
  },
];

const PROGRESSION_TREKS = [
  {
    slug: "goechala",
    label: "Starting point",
    sublabel: "Moderate",
    diffColor: "#f59e0b",
    desc: "Mostly stamina and altitude. Kind underfoot.",
    ace: { stamina: 3, power: 2, strength: 2, agility: 2, water: 0, altitude: 3, focus: 2, nerve: 1 },
  },
  {
    slug: "rupin-pass",
    label: "Step up",
    sublabel: "Hard",
    diffColor: "#f97316",
    desc: "Harder footing and more exposure: loose snow, steep descents.",
    ace: { stamina: 4, power: 3, strength: 3, agility: 4, water: 0, altitude: 4, focus: 3, nerve: 3 },
  },
  {
    slug: "pin-parvati-pass",
    label: "The big one",
    sublabel: "Advanced",
    diffColor: "#ef4444",
    desc: "17,457ft, glaciers and remote crossings. Demanding on almost everything.",
    ace: { stamina: 5, power: 4, strength: 4, agility: 4, water: 2, altitude: 5, focus: 4, nerve: 5 },
  },
];

export default function ACEPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-10 px-5 lg:px-8 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(var(--fg-rgb),1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--fg-rgb),1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, #ff5100 0%, #a78bfa 60%, transparent 100%)" }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
            {/* Left: text */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded border" style={{ background: "rgba(255,81,0,0.06)", borderColor: "rgba(255,81,0,0.22)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
                <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">ACE<sup>™</sup> · How we rate adventures</span>
              </div>
              <h1 className="text-3xl lg:text-[2.6rem] font-black tracking-tight leading-[1.06] mb-3" style={{ color: "var(--text-primary)" }}>
                Know what an adventure asks of you
              </h1>
              <p className="text-sm leading-relaxed mb-5 max-w-lg" style={{ color: "var(--text-tertiary)" }}>
                &ldquo;Easy&rdquo; and &ldquo;Hard&rdquo; don&apos;t tell you much. ACE<sup>™</sup>, our Adventure Capability Engine, scores every adventure on <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>8 things it asks of your body and mind</span>, so you can see what fits you before you book. Answer a few questions once and every adventure is matched to you.
              </p>
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {AXES.slice(0, 4).map(({ label, color, icon }) => (
                    <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border font-mono" style={{ background: `${color}10`, borderColor: `${color}28`, color }}>
                      <span className="opacity-70">{icon}</span>{label}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AXES.slice(4).map(({ label, color, icon }) => (
                    <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border font-mono" style={{ background: `${color}10`, borderColor: `${color}28`, color }}>
                      <span className="opacity-70">{icon}</span>{label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: radar — always visible, always right */}
            <div className="shrink-0 relative flex items-center justify-center" style={{ width: 290, height: 290 }}>
              <div className="absolute inset-0 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: "conic-gradient(from 0deg, #f97316, #eab308, #84cc16, #22d3ee, #3b82f6, #a78bfa, #f43f5e, #10b981, #f97316)" }} />
              <ACERadar ace={{ stamina: 4, power: 3, strength: 4, agility: 3, water: 1, altitude: 5, focus: 4, nerve: 3 }} size={280} showLabels />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8 AXES ── */}
      <section className="py-8 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">What we measure</span>
            <div className="flex-1 h-px" style={{ background: "rgba(var(--fg-rgb),0.08)" }} />
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>8 scores in 4 groups</span>
          </div>
          <p className="text-xs mb-5 leading-relaxed max-w-2xl" style={{ color: "var(--text-tertiary)" }}>Every adventure gets its own score for each of these. A trek can be easy on your legs but hard on your nerves, and a single difficulty label would hide that.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DOMAINS.map(({ name, icon, color, axes, desc }) => {
              const domainAxes = AXES.filter(a => axes.includes(a.label));
              return (
                <div key={name} className="rounded-xl overflow-hidden border" style={{ borderColor: `${color}20`, background: `${color}05` }}>
                  {/* Domain header */}
                  <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: `1px solid ${color}15`, background: `${color}09` }}>
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ color }}>{icon}</div>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono" style={{ color }}>{name}</span>
                    <span className="text-[10px] ml-1" style={{ color: "var(--text-muted)" }}>— {desc}</span>
                  </div>
                  {/* Axes */}
                  <div className="divide-y" style={{ borderColor: `${color}10` }}>
                    {domainAxes.map(({ key, icon: axIcon, color: axColor, label, desc: axDesc }) => (
                      <div key={key} className="flex items-start gap-3 px-4 py-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${axColor}15`, color: axColor }}>{axIcon}</div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs font-mono" style={{ color: "var(--text-primary)" }}>{label}</span>
                          <p className="text-[10px] leading-relaxed mt-1" style={{ color: "var(--text-tertiary)" }}>{axDesc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SCALE + RANKS (side by side on desktop) ── */}
      <section className="py-8 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            {/* Scale */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">How scores work</span>
                <div className="flex-1 h-px" style={{ background: "rgba(var(--fg-rgb),0.08)" }} />
                <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>1 to 5</span>
              </div>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>Each one is scored from 1 (very light) to 5 (extreme). If a trip doesn&apos;t involve something, like water on a desert trek, it scores 0.</p>

              {/* Gradient bar */}
              <div className="flex rounded-lg overflow-hidden mb-3" style={{ border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
                {SCALE.map(({ level, color }) => (
                  <div key={level} className="flex-1 h-1.5" style={{ background: color }} />
                ))}
              </div>

              <div className="flex-1 flex flex-col justify-between gap-1.5">
                {SCALE.map(({ level, label, sub, color }) => (
                  <div key={level} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border" style={{ background: `${color}06`, borderColor: `${color}16` }}>
                    <span className="font-black text-sm w-5 text-center font-mono leading-none shrink-0" style={{ color, textShadow: level >= 4 ? `0 0 12px ${color}80` : "none" }}>{level}</span>
                    <div className="w-px h-4 shrink-0" style={{ background: `${color}25` }} />
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{label}</span>
                    <span className="text-[10px] ml-auto" style={{ color: "var(--text-muted)" }}>{sub}</span>
                    {/* fill bar */}
                    <div className="w-10 h-1 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(var(--fg-rgb),0.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(level / 5) * 100}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ranks */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">Your rank</span>
                <div className="flex-1 h-px" style={{ background: "rgba(var(--fg-rgb),0.08)" }} />
                <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>Your 8 scores added up</span>
              </div>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>Add up your 8 scores (40 at most) and you get your rank: a quick way to see the kind of adventures you&apos;re ready for.</p>

              <div className="flex-1 flex flex-col justify-between gap-2">
                {RANKS.map(({ label, color, stars, range, desc, icon }) => (
                  <div key={label} className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl border relative overflow-hidden" style={{ background: `${color}06`, borderColor: `${color}22` }}>
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(ellipse at 0% 50%, ${color}08, transparent 60%)` }} />
                    {/* Icon badge */}
                    <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center relative"
                      style={{ background: `${color}15`, border: `1px solid ${color}28`, color, boxShadow: `0 0 16px ${color}18` }}>
                      <div className="scale-[1.1]">{icon}</div>
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-black text-sm leading-none" style={{ color: "var(--text-primary)" }}>{label}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-[9px] leading-none" style={{ color: i < stars ? color : "rgba(var(--fg-rgb),0.15)" }}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] leading-snug" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
                    </div>
                    {/* Score */}
                    <span className="shrink-0 text-[10px] font-black font-mono px-2 py-0.5 rounded-lg" style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>{range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW MATCHING WORKS ── */}
      <section className="py-8 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">How It Works</span>
            <div className="flex-1 h-px" style={{ background: "rgba(var(--fg-rgb),0.08)" }} />
          </div>
          <p className="text-xs mb-5 leading-relaxed max-w-xl" style={{ color: "var(--text-tertiary)" }}>We score the adventure, we score you, then compare the two one score at a time.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {[
              {
                step: "01",
                color: "#ff5100",
                title: "We rate every adventure",
                body: "Our team scores each adventure on all 8, using real route data: altitude, terrain and trip reports.",
              },
              {
                step: "02",
                color: "#f59e0b",
                title: "You answer a few questions",
                body: "The quick match takes a minute, the full assessment about three. Your answers become your own 8 scores, based on what you can actually do.",
              },
              {
                step: "03",
                color: "#4ade80",
                title: "You see what fits",
                body: "Every adventure is marked ready, a stretch, or not yet. Where you fall short, we show you which score to work on.",
              },
            ].map(({ step, color, title, body }) => (
              <div key={step} className="rounded-xl border p-4 flex flex-col gap-3 relative overflow-hidden"
                style={{ background: `${color}06`, borderColor: `${color}18` }}>
                <div className="absolute top-3 right-3 text-[36px] font-black leading-none tabular-nums select-none pointer-events-none font-mono"
                  style={{ color: `${color}09` }}>{step}</div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${color}15`, color }}>{step}</span>
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{title}</p>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IN PRACTICE ── */}
      <section className="py-8 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">See it in action</span>
            <div className="flex-1 h-px" style={{ background: "rgba(var(--fg-rgb),0.08)" }} />
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>3 treks, 3 shapes</span>
          </div>
          <p className="text-xs mb-5 leading-relaxed max-w-xl" style={{ color: "var(--text-tertiary)" }}>All three are treks, but each asks something different of you. The shape of each chart shows how.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PROGRESSION_TREKS.map((t, i) => {
              const adv = adventures.find(a => a.slug === t.slug);
              return (
                <div key={t.slug} className="rounded-2xl overflow-hidden border flex flex-col group" style={{ borderColor: `${t.diffColor}25`, background: "rgba(14,12,11,0.85)" }}>
                  {/* Image */}
                  {adv && (
                    <div className="relative h-20 overflow-hidden shrink-0">
                      <Image src={adv.heroImage} alt={adv.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 20%, rgba(14,12,11,0.98) 100%)` }} />
                      {/* Top accent line */}
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${t.diffColor}, transparent)` }} />
                      {/* Step badge */}
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black font-mono shadow-lg" style={{ background: t.diffColor, color: "#000", boxShadow: `0 0 10px ${t.diffColor}60` }}>{i + 1}</div>
                      {/* Difficulty */}
                      <span className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono" style={{ background: `rgba(0,0,0,0.6)`, color: t.diffColor, border: `1px solid ${t.diffColor}50`, backdropFilter: "blur(8px)" }}>{t.sublabel}</span>
                      {/* Name over gradient */}
                      <div className="absolute bottom-1.5 left-3 right-3">
                        <p className="text-[8px] font-black tracking-[0.2em] uppercase font-mono mb-0.5" style={{ color: t.diffColor }}>{t.label}</p>
                        <h3 className="text-white font-bold text-xs leading-tight">{adv.name}</h3>
                      </div>
                    </div>
                  )}

                  {/* Desc */}
                  <p className="text-white/30 text-[10px] leading-snug px-3 pt-2 pb-0 line-clamp-2">{t.desc}</p>

                  {/* Radar */}
                  <div className="flex justify-center px-3 py-1 flex-1 items-center">
                    <ACERadar ace={t.ace} size={150} showLabels />
                  </div>

                  {/* CTA */}
                  {adv && (
                    <div className="px-3 pb-3">
                      <Link href={`/experiences/${adv.slug}`} className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[10px] font-bold transition-all hover:brightness-125 font-mono" style={{ background: `${t.diffColor}12`, color: t.diffColor, border: `1px solid ${t.diffColor}25` }}>
                        View adventure <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-14 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        {/* bg layers */}
        <div className="absolute inset-0" style={{ background: "var(--bg-page)" }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(var(--fg-rgb),1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--fg-rgb),1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,81,0,0.13) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,81,0,0.4), transparent)" }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(255,81,0,0.18)", background: "rgba(255,81,0,0.04)" }}>
            {/* top accent */}
            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #ff5100, transparent)" }} />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-8 px-8 py-10">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded border" style={{ background: "rgba(255,81,0,0.08)", borderColor: "rgba(255,81,0,0.25)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5100]" />
                  <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">Your Turn</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight mb-3" style={{ color: "var(--text-primary)" }}>
                  Find out what you&apos;re ready for.
                </h2>
                <p className="text-sm leading-relaxed max-w-md" style={{ color: "var(--text-tertiary)" }}>
                  Answer a few questions and we&apos;ll rate every adventure for you: ready, a stretch, or not yet. You&apos;ll also see what to work on next.
                </p>

                {/* Mini stat chips */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { val: "8", lbl: "Scores", color: "#f97316" },
                    { val: "1–3 min", lbl: "To finish", color: "#22d3ee" },
                    { val: "Instant", lbl: "Results", color: "#4ade80" },
                  ].map(({ val, lbl, color }) => (
                    <div key={lbl} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: `${color}08`, borderColor: `${color}20` }}>
                      <span className="font-black text-xs font-mono" style={{ color }}>{val}</span>
                      <div className="w-px h-3" style={{ background: `${color}25` }} />
                      <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: CTA */}
              <div className="flex flex-col items-start lg:items-end gap-3">
                <Link
                  href="/matchmaker"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#ff5100]/30"
                  style={{ background: "linear-gradient(135deg, #ff5100 0%, #ff7d47 100%)" }}
                >
                  Find my matches
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
