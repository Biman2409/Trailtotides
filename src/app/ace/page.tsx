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
  { key: "stamina",  icon: <Flame    className="w-3.5 h-3.5" />, color: "#f97316", label: "Stamina",  desc: "Sustained output across multi-day effort." },
  { key: "power",    icon: <Zap      className="w-3.5 h-3.5" />, color: "#eab308", label: "Power",    desc: "Explosive bursts — ascents, rapids, scrambling." },
  { key: "strength", icon: <Dumbbell className="w-3.5 h-3.5" />, color: "#84cc16", label: "Strength", desc: "Load-bearing on heavy packs and technical terrain." },
  { key: "agility",  icon: <Compass  className="w-3.5 h-3.5" />, color: "#22d3ee", label: "Agility",  desc: "Balance and movement on rock, scree, snow." },
  { key: "water",    icon: <Waves    className="w-3.5 h-3.5" />, color: "#3b82f6", label: "Water",    desc: "Aquatic survival — rafting, diving, crossings." },
  { key: "altitude", icon: <Mountain className="w-3.5 h-3.5" />, color: "#a78bfa", label: "Altitude", desc: "Hypoxic tolerance for high-altitude objectives." },
  { key: "focus",    icon: <ScanEye  className="w-3.5 h-3.5" />, color: "#f43f5e", label: "Focus",    desc: "Exposure tolerance — cliffs, caves, dangerous terrain." },
  { key: "nerve",    icon: <Ghost    className="w-3.5 h-3.5" />, color: "#10b981", label: "Nerve",    desc: "Self-reliance far from help in remote terrain." },
];

const DOMAINS = [
  { name: "Engine",   icon: <Activity className="w-3.5 h-3.5" />, color: "#f97316", axes: ["Stamina", "Power"],    desc: "Sustained output + explosive effort" },
  { name: "Chassis",  icon: <Layers   className="w-3.5 h-3.5" />, color: "#22d3ee", axes: ["Strength", "Agility"], desc: "Load-bearing and terrain navigation" },
  { name: "Elements", icon: <Globe    className="w-3.5 h-3.5" />, color: "#a78bfa", axes: ["Water", "Altitude"],   desc: "Aquatic and high-altitude physiology" },
  { name: "Mind",     icon: <Brain    className="w-3.5 h-3.5" />, color: "#10b981", axes: ["Focus", "Nerve"],      desc: "Exposure and remote self-reliance" },
];

const SCALE = [
  { level: 1, label: "Very Low",  sub: "Minimal demand",       color: "#22c55e" },
  { level: 2, label: "Low",       sub: "Light conditioning",   color: "#84cc16" },
  { level: 3, label: "Moderate",  sub: "Regular training",     color: "#eab308" },
  { level: 4, label: "High",      sub: "Strong preparation",   color: "#f97316" },
  { level: 5, label: "Extreme",   sub: "Elite level required", color: "#ef4444" },
];

const RANKS = [
  { label: "Pathfinder",  color: "#22d3ee", stars: 1, range: "8–15",  desc: "Day hikes, beginner routes." },
  { label: "Navigator",   color: "#4ade80", stars: 2, range: "16–23", desc: "Multi-day, moderate demands." },
  { label: "Trailblazer", color: "#f59e0b", stars: 3, range: "24–31", desc: "Technical, high altitude." },
  { label: "Vanguard",    color: "#f97316", stars: 4, range: "32–39", desc: "Expedition-level objectives." },
  { label: "Apex",        color: "#a78bfa", stars: 5, range: "40",    desc: "Elite. Nothing unreachable." },
];

const PROGRESSION_TREKS = [
  {
    slug: "goechala",
    label: "Starting Point",
    sublabel: "Moderate",
    diffColor: "#f59e0b",
    desc: "Stamina and altitude lead. Terrain stays forgiving.",
    ace: { stamina: 3, power: 2, strength: 2, agility: 2, water: 0, altitude: 3, focus: 2, nerve: 1 },
  },
  {
    slug: "rupin-pass",
    label: "Step Up",
    sublabel: "Hard",
    diffColor: "#f97316",
    desc: "Agility and focus spike — loose snow, steep descents, real exposure.",
    ace: { stamina: 4, power: 3, strength: 3, agility: 4, water: 0, altitude: 4, focus: 3, nerve: 3 },
  },
  {
    slug: "pin-parvati-pass",
    label: "Full Commitment",
    sublabel: "Advanced",
    diffColor: "#ef4444",
    desc: "17,457ft, glaciers, remote crossings. Radar fills out completely.",
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
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
            <div className="flex-1 max-w-xl">
              {/* System badge */}
              <div className="inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded border" style={{ background: "rgba(255,81,0,0.06)", borderColor: "rgba(255,81,0,0.22)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
                <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">System · ACE v2.0</span>
              </div>

              <h1 className="text-3xl lg:text-[2.6rem] font-black text-white tracking-tight leading-[1.06] mb-3">
                Adventure Capability<br />
                <span className="text-[#ff5100]">Engine</span>
              </h1>
              <p className="text-white/45 text-sm leading-relaxed mb-5 max-w-md">
                Every adventure demands something specific. ACE quantifies that across <span className="text-white/75 font-semibold">8 biological axes</span>, rated 1–5, so your match is based on data — not optimism.
              </p>

              {/* Axis pills — compact inline */}
              <div className="flex flex-wrap gap-1.5">
                {AXES.map(({ label, color, icon }) => (
                  <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border font-mono" style={{ background: `${color}10`, borderColor: `${color}28`, color }}>
                    <span className="opacity-70">{icon}</span>{label}
                  </span>
                ))}
              </div>

              {/* Mini stat strip */}
              <div className="mt-5 flex items-center gap-5 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {[["8", "Axes"], ["5", "Levels"], ["40", "Max score"], ["5", "Ranks"]].map(([val, lbl]) => (
                  <div key={lbl} className="text-center">
                    <div className="text-white font-black text-base leading-none font-mono">{val}</div>
                    <div className="text-white/25 text-[9px] uppercase tracking-[0.15em] mt-0.5">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full blur-3xl opacity-12 scale-75" style={{ background: "conic-gradient(from 0deg, #f97316, #eab308, #84cc16, #22d3ee, #3b82f6, #a78bfa, #f43f5e, #10b981, #f97316)" }} />
              <ACERadar ace={{ stamina: 4, power: 3, strength: 4, agility: 3, water: 1, altitude: 5, focus: 4, nerve: 3 }} size={240} showLabels />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8 AXES ── */}
      <section className="py-8 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">8 Axes</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-white/20 text-[10px] font-mono">4 domains · 2 axes each</span>
          </div>

          <div className="space-y-3">
            {DOMAINS.map(({ name, icon, color, axes, desc }) => {
              const domainAxes = AXES.filter(a => axes.includes(a.label));
              return (
                <div key={name} className="rounded-xl overflow-hidden border" style={{ borderColor: `${color}18`, background: `${color}05` }}>
                  {/* Domain header */}
                  <div className="flex items-center gap-2 px-3.5 py-2" style={{ borderBottom: `1px solid ${color}14`, background: `${color}08` }}>
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ color }}>{icon}</div>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono" style={{ color }}>{name}</span>
                    <span className="text-white/20 text-[10px] ml-1 hidden sm:inline">— {desc}</span>
                  </div>
                  {/* Axes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x" style={{ "--tw-divide-opacity": 1, borderColor: `${color}12` } as React.CSSProperties}>
                    {domainAxes.map(({ key, icon: axIcon, color: axColor, label, desc: axDesc }) => (
                      <div key={key} className="flex items-center gap-3 px-3.5 py-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${axColor}15`, color: axColor }}>{axIcon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-white font-bold text-xs font-mono">{label}</span>
                          </div>
                          <p className="text-white/30 text-[10px] leading-snug mt-0.5">{axDesc}</p>
                        </div>
                        {/* Dot scale */}
                        <div className="flex gap-0.5 shrink-0">
                          {[1,2,3,4,5].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i <= 3 ? `${axColor}60` : "rgba(255,255,255,0.08)" }} />)}
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
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">Scale</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-white/20 text-[10px] font-mono">1–5 per axis</span>
              </div>

              {/* Single horizontal bar */}
              <div className="flex rounded-xl overflow-hidden border mb-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {SCALE.map(({ level, color }) => (
                  <div key={level} className="flex-1 h-2" style={{ background: color }} />
                ))}
              </div>

              <div className="space-y-1.5">
                {SCALE.map(({ level, label, sub, color }) => (
                  <div key={level} className="flex items-center gap-3 px-3 py-2 rounded-lg border" style={{ background: `${color}06`, borderColor: `${color}14` }}>
                    <span className="font-black text-sm w-5 text-center font-mono leading-none" style={{ color }}>{level}</span>
                    <div className="w-px h-4" style={{ background: `${color}25` }} />
                    <span className="text-white/70 text-xs font-semibold">{label}</span>
                    <span className="text-white/25 text-[10px] ml-auto">{sub}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/20 text-[10px] font-mono mt-2.5">Score 0 = axis not relevant for that adventure</p>
            </div>

            {/* Ranks */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">Ranks</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-white/20 text-[10px] font-mono">Σ axes = tier</span>
              </div>

              <div className="space-y-1.5">
                {RANKS.map(({ label, color, stars, range, desc }) => (
                  <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border" style={{ background: `${color}06`, borderColor: `${color}18` }}>
                    <div className="flex gap-0.5 shrink-0 w-12">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-[9px]" style={{ color: i < stars ? color : "rgba(255,255,255,0.07)" }}>★</span>
                      ))}
                    </div>
                    <span className="font-black text-white text-xs w-24 font-mono">{label}</span>
                    <span className="text-[10px] font-mono shrink-0" style={{ color }}>{range}</span>
                    <span className="text-white/25 text-[10px] ml-auto text-right leading-snug hidden sm:block">{desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/20 text-[10px] font-mono mt-2.5">8 axes × max 5 = 40 points total</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW MATCHING WORKS ── */}
      <section className="py-8 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">How It Works</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {[
              {
                step: "01",
                color: "#ff5100",
                title: "Adventures rated",
                body: "Every adventure gets an ACE profile — 8 axes scored by our team. No vague labels.",
              },
              {
                step: "02",
                color: "#f59e0b",
                title: "You assess",
                body: "8 structured questions map your real capability across all axes — not self-reported guesses.",
              },
              {
                step: "03",
                color: "#4ade80",
                title: "Matches surfaced",
                body: "Adventures sort into Ready Now, Stretch, and Out of Range — axis by axis.",
              },
            ].map(({ step, color, title, body }) => (
              <div key={step} className="rounded-xl border p-4 flex flex-col gap-3 relative overflow-hidden"
                style={{ background: `${color}06`, borderColor: `${color}18` }}>
                <div className="absolute top-3 right-3 text-[32px] font-black leading-none tabular-nums select-none pointer-events-none font-mono"
                  style={{ color: `${color}10` }}>{step}</div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${color}15`, color }}>{step}</span>
                  <p className="text-white font-bold text-sm">{title}</p>
                </div>
                <p className="text-white/35 text-[11px] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IN PRACTICE ── */}
      <section className="py-8 px-5 lg:px-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">In Practice</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-white/20 text-[10px] font-mono">Same type · different radar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PROGRESSION_TREKS.map((t, i) => {
              const adv = adventures.find(a => a.slug === t.slug);
              return (
                <div key={t.slug} className="rounded-xl overflow-hidden border flex flex-col" style={{ borderColor: `${t.diffColor}22`, background: "rgba(8,12,20,0.7)" }}>
                  {adv && (
                    <div className="relative h-24 overflow-hidden shrink-0">
                      <Image src={adv.heroImage} alt={adv.name} fill className="object-cover" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 10%, rgba(8,12,20,0.95) 100%)" }} />
                      <div className="absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center text-[9px] font-black font-mono" style={{ background: `${t.diffColor}cc`, color: "white" }}>{i + 1}</div>
                      <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono" style={{ background: `${t.diffColor}20`, color: t.diffColor, border: `1px solid ${t.diffColor}35`, backdropFilter: "blur(8px)" }}>{t.sublabel}</span>
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="text-white font-bold text-xs leading-tight">{adv.name}</h3>
                      </div>
                    </div>
                  )}

                  <div className="px-3 pt-2.5 pb-0 flex items-center justify-between">
                    <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono" style={{ color: t.diffColor }}>{t.label}</p>
                    <p className="text-white/30 text-[9px]">{t.desc}</p>
                  </div>

                  <div className="flex justify-center px-3 py-2 flex-1 items-center">
                    <ACERadar ace={t.ace} size={180} showLabels />
                  </div>

                  {adv && (
                    <div className="px-3 pb-3">
                      <Link href={`/experiences/${adv.slug}`} className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[10px] font-bold transition-all hover:brightness-110 font-mono" style={{ background: `${t.diffColor}10`, color: t.diffColor, border: `1px solid ${t.diffColor}20` }}>
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
      <section className="py-10 px-5 lg:px-8 relative overflow-hidden" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(255,81,0,0.08) 0%, transparent 60%)" }} />
        <div className="max-w-xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded border" style={{ background: "rgba(255,81,0,0.06)", borderColor: "rgba(255,81,0,0.22)" }}>
            <span className="text-[#ff5100] text-[9px] font-black tracking-[0.28em] uppercase font-mono">Your turn</span>
          </div>
          <h2 className="text-white text-2xl font-black tracking-tight leading-tight mb-2">Find your level.<br />Find your adventure.</h2>
          <p className="text-white/35 text-sm leading-relaxed mb-6 max-w-sm mx-auto">8 questions. 2 minutes. Your capability mapped across every axis.</p>
          <Link href="/matchmaker" className="inline-flex items-center gap-2 bg-[#ff5100] text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#e04800] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/30">
            Take the Assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
