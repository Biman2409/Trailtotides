import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Flame, Zap, Dumbbell, Compass, Waves, Mountain, ScanEye, Ghost, Activity, Layers, Globe, Brain } from "@/lib/localIcons";
import { adventures } from "@/lib/data";
import ACERadar from "@/components/ui/custom/ACERadar";

export const metadata = {
  title: "ACE Rating System — Trail to Tides",
  description: "The Adventure Capability Engine rates every adventure on 8 biological axes — so you know exactly what your body needs.",
  openGraph: {
    title: "ACE Rating System — Trail to Tides",
    description: "8-axis biological difficulty rating for every adventure.",
    url: "https://trailtotides.com/ace",
    images: [{ url: "https://images.unsplash.com/photo-1526139334526-f591a54b477c?w=1200&q=90", width: 1200, height: 630, alt: "ACE Rating System" }],
  },
  alternates: { canonical: "https://trailtotides.com/ace" },
};

const AXES = [
  { key: "stamina",  icon: <Flame    className="w-3.5 h-3.5" />, color: "#f97316", label: "Stamina",  desc: "Not one hard moment — a week of them. Moving 8+ hours daily under load with no recovery day." },
  { key: "power",    icon: <Zap      className="w-3.5 h-3.5" />, color: "#eab308", label: "Power",    desc: "Maximum output for minutes, not hours. A steep crux, a rapid, a technical summit push. Pace won't save you." },
  { key: "strength", icon: <Dumbbell className="w-3.5 h-3.5" />, color: "#84cc16", label: "Strength", desc: "15kg pack, broken terrain, six hours. Legs, back, and joints — not a gym test, a distance test." },
  { key: "agility",  icon: <Compass  className="w-3.5 h-3.5" />, color: "#22d3ee", label: "Agility",  desc: "Scree, iced rock, narrow ridges. Precise movement on ground that shifts — where hesitation costs." },
  { key: "water",    icon: <Waves    className="w-3.5 h-3.5" />, color: "#3b82f6", label: "Water",    desc: "Comfort when the current has force. Rapids, open crossings, river fords. Zero means no water element." },
  { key: "altitude", icon: <Mountain className="w-3.5 h-3.5" />, color: "#a78bfa", label: "Altitude", desc: "Above 3,500m, fitness stops mattering as much as acclimatisation. Above 5,000m, it becomes medical." },
  { key: "focus",    icon: <ScanEye  className="w-3.5 h-3.5" />, color: "#f43f5e", label: "Focus",    desc: "Exposed drops, fixed ropes, vertical terrain. Your brain wants to freeze. Focus is choosing not to let it." },
  { key: "nerve",    icon: <Ghost    className="w-3.5 h-3.5" />, color: "#10b981", label: "Nerve",    desc: "No road, no signal, no rescue. How clearly do you think and act when the stakes are yours alone?" },
];

const DOMAINS = [
  { name: "Engine",   icon: <Activity className="w-3.5 h-3.5" />, color: "#f97316", axes: ["Stamina", "Power"],    desc: "How hard and how long your body can work" },
  { name: "Chassis",  icon: <Layers   className="w-3.5 h-3.5" />, color: "#22d3ee", axes: ["Strength", "Agility"], desc: "Structural capacity under load and on terrain" },
  { name: "Elements", icon: <Globe    className="w-3.5 h-3.5" />, color: "#a78bfa", axes: ["Water", "Altitude"],   desc: "Environmental demands beyond standard fitness" },
  { name: "Mind",     icon: <Brain    className="w-3.5 h-3.5" />, color: "#10b981", axes: ["Focus", "Nerve"],      desc: "Composure under exposure and in true isolation" },
];

const SCALE = [
  { level: 1, label: "Very Low",  sub: "Minimal demand",       color: "#22c55e" },
  { level: 2, label: "Low",       sub: "Light conditioning",   color: "#84cc16" },
  { level: 3, label: "Moderate",  sub: "Regular training",     color: "#eab308" },
  { level: 4, label: "High",      sub: "Strong preparation",   color: "#f97316" },
  { level: 5, label: "Extreme",   sub: "Elite level required", color: "#ef4444" },
];

const RANKS = [
  {
    label: "Pathfinder", color: "#22d3ee", stars: 1, range: "8–15", desc: "Day hikes, accessible multi-day routes, introductory terrain.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Navigator", color: "#4ade80", stars: 2, range: "16–23", desc: "Multi-day expeditions, moderate demands across all axes.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/></svg>,
  },
  {
    label: "Trailblazer", color: "#f59e0b", stars: 3, range: "24–31", desc: "Technical routes, high altitude, and serious multi-week trips.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    label: "Vanguard", color: "#f97316", stars: 4, range: "32–39", desc: "Expedition-level objectives, remote terrain, extreme conditions.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg>,
  },
  {
    label: "Apex", color: "#a78bfa", stars: 5, range: "40", desc: "Elite across every axis. No adventure is out of reach.",
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg>,
  },
];

const PROGRESSION_TREKS = [
  {
    slug: "goechala",
    label: "Starting Point",
    sublabel: "Moderate",
    diffColor: "#f59e0b",
    desc: "Stamina and altitude do the work. Terrain is forgiving.",
    ace: { stamina: 3, power: 2, strength: 2, agility: 2, water: 0, altitude: 3, focus: 2, nerve: 1 },
  },
  {
    slug: "rupin-pass",
    label: "Step Up",
    sublabel: "Hard",
    diffColor: "#f97316",
    desc: "Agility and focus spike. Loose snow, steep descents, real exposure.",
    ace: { stamina: 4, power: 3, strength: 3, agility: 4, water: 0, altitude: 4, focus: 3, nerve: 3 },
  },
  {
    slug: "pin-parvati-pass",
    label: "Full Commitment",
    sublabel: "Advanced",
    diffColor: "#ef4444",
    desc: "17,457ft. Glaciers, remote crossings, no rescue. The radar fills.",
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
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, #ff5100 0%, #a78bfa 60%, transparent 100%)" }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
            {/* Left: text */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded border" style={{ background: "rgba(255,81,0,0.06)", borderColor: "rgba(255,81,0,0.22)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
                <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">ACE FRAMEWORK · v2.0</span>
              </div>
              <h1 className="text-3xl lg:text-[2.6rem] font-black text-white tracking-tight leading-[1.06] mb-3">
                Adventure Capability Engine<sup className="text-[#ff5100] text-base font-black ml-0.5 align-super" style={{ fontSize: "0.45em" }}>™</sup>
              </h1>
              <p className="text-white/45 text-sm leading-relaxed mb-5 max-w-lg">
                Easy, Moderate, Hard tells you nothing. ACE™ is Trail to Tides' proprietary system that rates every adventure across <span className="text-white/75 font-semibold">8 physical and psychological axes</span>. Answer 8 questions once — every adventure is matched to your real capability.
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
            <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">The 8 Axes</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-white/20 text-[10px] font-mono">4 domains · 2 axes each</span>
          </div>
          <p className="text-white/30 text-xs mb-5 leading-relaxed max-w-2xl">Grouped into 4 domains — Engine, Chassis, Elements, Mind. An adventure can be physically light but psychologically brutal, or demand elite altitude tolerance with barely any strength required. Every axis is scored separately so nothing is hidden behind a single number.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DOMAINS.map(({ name, icon, color, axes, desc }) => {
              const domainAxes = AXES.filter(a => axes.includes(a.label));
              return (
                <div key={name} className="rounded-xl overflow-hidden border" style={{ borderColor: `${color}20`, background: `${color}05` }}>
                  {/* Domain header */}
                  <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: `1px solid ${color}15`, background: `${color}09` }}>
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ color }}>{icon}</div>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono" style={{ color }}>{name}</span>
                    <span className="text-white/20 text-[10px] ml-1">— {desc}</span>
                  </div>
                  {/* Axes */}
                  <div className="divide-y" style={{ borderColor: `${color}10` }}>
                    {domainAxes.map(({ key, icon: axIcon, color: axColor, label, desc: axDesc }) => (
                      <div key={key} className="flex items-start gap-3 px-4 py-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${axColor}15`, color: axColor }}>{axIcon}</div>
                        <div className="min-w-0">
                          <span className="text-white font-bold text-xs font-mono">{label}</span>
                          <p className="text-white/35 text-[10px] leading-relaxed mt-1">{axDesc}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Scale */}
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">The Scale</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-white/20 text-[10px] font-mono">1–5 per axis</span>
              </div>
              <p className="text-white/30 text-xs mb-4 leading-relaxed">Each axis scored independently, 1–5. A desert trek scores 0 on Water — that axis simply doesn't apply.</p>

              {/* Gradient bar */}
              <div className="flex rounded-lg overflow-hidden mb-3" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                {SCALE.map(({ level, color }) => (
                  <div key={level} className="flex-1 h-1.5" style={{ background: color }} />
                ))}
              </div>

              <div className="space-y-1.5">
                {SCALE.map(({ level, label, sub, color }) => (
                  <div key={level} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border" style={{ background: `${color}06`, borderColor: `${color}16` }}>
                    <span className="font-black text-sm w-5 text-center font-mono leading-none shrink-0" style={{ color, textShadow: level >= 4 ? `0 0 12px ${color}80` : "none" }}>{level}</span>
                    <div className="w-px h-4 shrink-0" style={{ background: `${color}25` }} />
                    <span className="text-white/80 text-xs font-bold">{label}</span>
                    <span className="text-white/25 text-[10px] ml-auto">{sub}</span>
                    {/* fill bar */}
                    <div className="w-10 h-1 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(level / 5) * 100}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ranks */}
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">Adventure Rank</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-white/20 text-[10px] font-mono">Σ axes = tier</span>
              </div>
              <p className="text-white/30 text-xs mb-4 leading-relaxed">Sum all 8 axes and you get your rank. Max is 40. Higher rank — harder terrain, more remote, more technical.</p>

              <div className="space-y-2">
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
                        <span className="font-black text-white text-sm leading-none">{label}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-[9px] leading-none" style={{ color: i < stars ? color : "rgba(255,255,255,0.08)" }}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-white/30 text-[10px] leading-snug">{desc}</p>
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
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
          <p className="text-white/30 text-xs mb-5 leading-relaxed max-w-xl">Both adventures and adventurers get a profile. The system compares them axis-by-axis — not with a blunt difficulty number — so every match is honest.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {[
              {
                step: "01",
                color: "#ff5100",
                title: "Adventures are rated",
                body: "Every adventure on Trail to Tides has an ACE profile — 8 axes scored honestly by our team based on actual route data, altitude profiles, and expedition reports. No vague 'Difficult' labels.",
              },
              {
                step: "02",
                color: "#f59e0b",
                title: "You take the assessment",
                body: "8 structured questions build your capability profile. Answers translate directly to axis scores using physical benchmarks — your real fitness, not how fit you think you are.",
              },
              {
                step: "03",
                color: "#4ade80",
                title: "Matches surfaced",
                body: "Adventures sort into Ready Now, Stretch, and Out of Range — axis by axis. You see exactly which axes you're short on and how to close the gap.",
              },
            ].map(({ step, color, title, body }) => (
              <div key={step} className="rounded-xl border p-4 flex flex-col gap-3 relative overflow-hidden"
                style={{ background: `${color}06`, borderColor: `${color}18` }}>
                <div className="absolute top-3 right-3 text-[36px] font-black leading-none tabular-nums select-none pointer-events-none font-mono"
                  style={{ color: `${color}09` }}>{step}</div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${color}15`, color }}>{step}</span>
                  <p className="text-white font-bold text-sm">{title}</p>
                </div>
                <p className="text-white/40 text-[11px] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IN PRACTICE ── */}
      <section className="py-8 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">In Practice</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-white/20 text-[10px] font-mono">Same type · different radar</span>
          </div>
          <p className="text-white/30 text-xs mb-5 leading-relaxed max-w-xl">Same category, wildly different bodies required. Watch the radar change shape — that's what a single difficulty label will never show you.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROGRESSION_TREKS.map((t, i) => {
              const adv = adventures.find(a => a.slug === t.slug);
              return (
                <div key={t.slug} className="rounded-2xl overflow-hidden border flex flex-col group" style={{ borderColor: `${t.diffColor}25`, background: "rgba(8,12,20,0.85)" }}>
                  {/* Image */}
                  {adv && (
                    <div className="relative h-36 overflow-hidden shrink-0">
                      <Image src={adv.heroImage} alt={adv.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 20%, rgba(8,12,20,0.98) 100%)` }} />
                      {/* Top accent line */}
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${t.diffColor}, transparent)` }} />
                      {/* Step badge */}
                      <div className="absolute top-3 left-3 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black font-mono shadow-lg" style={{ background: t.diffColor, color: "#000", boxShadow: `0 0 12px ${t.diffColor}60` }}>{i + 1}</div>
                      {/* Difficulty */}
                      <span className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold font-mono" style={{ background: `rgba(0,0,0,0.6)`, color: t.diffColor, border: `1px solid ${t.diffColor}50`, backdropFilter: "blur(8px)" }}>{t.sublabel}</span>
                      {/* Name over gradient */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono mb-0.5" style={{ color: t.diffColor }}>{t.label}</p>
                        <h3 className="text-white font-bold text-sm leading-tight">{adv.name}</h3>
                      </div>
                    </div>
                  )}

                  {/* Desc */}
                  <p className="text-white/30 text-[10px] leading-relaxed px-4 pt-3 pb-0">{t.desc}</p>

                  {/* Radar */}
                  <div className="flex justify-center px-4 pt-2 pb-1 flex-1 items-center">
                    <ACERadar ace={t.ace} size={190} showLabels />
                  </div>

                  {/* CTA */}
                  {adv && (
                    <div className="px-4 pb-4">
                      <Link href={`/experiences/${adv.slug}`} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[10px] font-bold transition-all hover:brightness-125 font-mono" style={{ background: `${t.diffColor}12`, color: t.diffColor, border: `1px solid ${t.diffColor}25` }}>
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
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
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
                <h2 className="text-white text-2xl lg:text-3xl font-black tracking-tight leading-tight mb-3">
                  Know your axes.<br />Pick the right adventure.
                </h2>
                <p className="text-white/35 text-sm leading-relaxed max-w-md">
                  8 questions. 2 minutes. Every axis scored — then matched against every adventure on the platform so you see exactly what you're ready for, and what to build toward.
                </p>

                {/* Mini stat chips */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { val: "8", lbl: "Axes assessed", color: "#f97316" },
                    { val: "2 min", lbl: "Assessment", color: "#22d3ee" },
                    { val: "Instant", lbl: "Results", color: "#4ade80" },
                  ].map(({ val, lbl, color }) => (
                    <div key={lbl} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: `${color}08`, borderColor: `${color}20` }}>
                      <span className="font-black text-xs font-mono" style={{ color }}>{val}</span>
                      <div className="w-px h-3" style={{ background: `${color}25` }} />
                      <span className="text-white/40 text-[10px] font-mono">{lbl}</span>
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
                  Take the Assessment
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
