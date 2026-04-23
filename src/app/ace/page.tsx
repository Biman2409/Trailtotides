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
  { key: "stamina",  icon: <Flame    className="w-4 h-4" />, color: "#f97316", label: "Stamina",  desc: "Days of sustained effort — trekking, motorcycling, altitude." },
  { key: "power",    icon: <Zap      className="w-4 h-4" />, color: "#eab308", label: "Power",    desc: "Explosive bursts — ascents, rapids, scrambling." },
  { key: "strength", icon: <Dumbbell className="w-4 h-4" />, color: "#84cc16", label: "Strength", desc: "Load-bearing across heavy packs and technical terrain." },
  { key: "agility",  icon: <Compass  className="w-4 h-4" />, color: "#22d3ee", label: "Agility",  desc: "Balance and navigation — rock, scree, snow, ice." },
  { key: "water",    icon: <Waves    className="w-4 h-4" />, color: "#3b82f6", label: "Water",    desc: "Aquatic survival — rafting, diving, river crossings." },
  { key: "altitude", icon: <Mountain className="w-4 h-4" />, color: "#a78bfa", label: "Altitude", desc: "Hypoxic tolerance for Himalayan and high-altitude objectives." },
  { key: "focus",    icon: <ScanEye  className="w-4 h-4" />, color: "#f43f5e", label: "Focus",    desc: "Exposure tolerance — cliffs, caves, dangerous terrain." },
  { key: "nerve",    icon: <Ghost    className="w-4 h-4" />, color: "#10b981", label: "Nerve",    desc: "Self-reliance far from help — remote, no rescue, no signal." },
];

const DOMAINS = [
  { name: "Engine",   icon: <Activity className="w-4 h-4" />, color: "#f97316", axes: ["Stamina", "Power"],    desc: "The physical fuel. Sustained output + explosive effort." },
  { name: "Chassis",  icon: <Layers   className="w-4 h-4" />, color: "#22d3ee", axes: ["Strength", "Agility"], desc: "How your body handles load and terrain." },
  { name: "Elements", icon: <Globe    className="w-4 h-4" />, color: "#a78bfa", axes: ["Water", "Altitude"],   desc: "Aquatic and high-altitude physiological demands." },
  { name: "Mind",     icon: <Brain    className="w-4 h-4" />, color: "#10b981", axes: ["Focus", "Nerve"],      desc: "Psychological readiness — exposure and remote self-reliance." },
];

const SCALE = [
  { level: 1, label: "Very Low",  sub: "Minimal demand",       color: "#22c55e" },
  { level: 2, label: "Low",       sub: "Light conditioning",   color: "#84cc16" },
  { level: 3, label: "Moderate",  sub: "Regular training",     color: "#eab308" },
  { level: 4, label: "High",      sub: "Strong preparation",   color: "#f97316" },
  { level: 5, label: "Extreme",   sub: "Elite level required", color: "#ef4444" },
];

const RANKS = [
  { label: "Pathfinder",  color: "#22d3ee", stars: 1, range: "8–15",  desc: "Day hikes, accessible multi-day routes, beginner water." },
  { label: "Navigator",   color: "#4ade80", stars: 2, range: "16–23", desc: "Multiple days in the field, moderate demands across axes." },
  { label: "Trailblazer", color: "#f59e0b", stars: 3, range: "24–31", desc: "Technical routes, high altitude, demanding expeditions." },
  { label: "Vanguard",    color: "#f97316", stars: 4, range: "32–39", desc: "Expedition-level objectives and extreme terrain." },
  { label: "Apex",        color: "#a78bfa", stars: 5, range: "40",    desc: "Elite across every axis. Nothing is out of reach." },
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
    <div className="min-h-screen">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, #ff5100 0%, #a78bfa 50%, transparent 100%)" }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-xl">
              <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-4">Adventure Capability Engine</p>
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Know what your body needs — before you go.
              </h1>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Every adventure demands something specific from your body. ACE breaks that into <span className="text-white font-semibold">8 axes</span> — rated 1 to 5 — so you can match yourself to adventures honestly, not optimistically.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {AXES.map(({ label, color }) => (
                  <span key={label} className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border" style={{ background: `${color}12`, borderColor: `${color}30`, color }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative shrink-0 mx-auto lg:mx-0">
              <div className="absolute inset-0 rounded-full blur-3xl opacity-15 scale-75" style={{ background: "conic-gradient(from 0deg, #f97316, #eab308, #84cc16, #22d3ee, #3b82f6, #a78bfa, #f43f5e, #10b981, #f97316)" }} />
              <ACERadar ace={{ stamina: 4, power: 3, strength: 4, agility: 3, water: 1, altitude: 5, focus: 4, nerve: 3 }} size={260} showLabels />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8 AXES grouped by domain ── */}
      <section className="py-16 px-6 t-bg-surface" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-1">8 Axes</p>
            <h2 className="text-white text-2xl font-black tracking-tight">What gets measured</h2>
          </div>

          <div className="space-y-6">
            {DOMAINS.map(({ name, icon, color, axes, desc }) => {
              const domainAxes = AXES.filter(a => axes.includes(a.label));
              return (
                <div key={name}>
                  {/* Domain label row */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${color}18`, color }}>{icon}</div>
                    <span className="text-xs font-black tracking-widest uppercase" style={{ color }}>{name}</span>
                    <span className="text-white/20 text-[11px]">—</span>
                    <span className="text-white/30 text-[11px]">{desc}</span>
                  </div>
                  {/* Axis cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {domainAxes.map(({ key, icon: axIcon, color: axColor, label, desc: axDesc }) => (
                      <div key={key} className="group relative rounded-xl p-4 border overflow-hidden transition-all duration-200 hover:-translate-y-0.5" style={{ background: `${axColor}08`, borderColor: `${axColor}20` }}>
                        <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl opacity-0 group-hover:opacity-25 transition-opacity" style={{ background: axColor }} />
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${axColor}18`, color: axColor }}>{axIcon}</div>
                          <div>
                            <p className="font-black text-white text-sm leading-none mb-1">{label}</p>
                            <p className="text-white/35 text-[11px] leading-snug">{axDesc}</p>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${axColor}, transparent)` }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SCALE ── */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-1">The Scale</p>
            <h2 className="text-white text-2xl font-black tracking-tight">1 to 5. No ambiguity.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {SCALE.map(({ level, label, sub, color }) => (
              <div key={level} className="relative rounded-xl border overflow-hidden" style={{ background: `${color}08`, borderColor: `${color}18` }}>
                <div className="absolute top-0 left-0 bottom-0 opacity-10" style={{ width: `${(level / 5) * 100}%`, background: color }} />
                <div className="relative flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl font-black shrink-0" style={{ background: `${color}18`, color, boxShadow: level >= 4 ? `0 0 16px ${color}40` : "none" }}>{level}</div>
                  <div>
                    <p className="text-white font-bold text-sm">{label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/25 text-xs mt-4">Score 0 means the axis is not relevant for that adventure.</p>
        </div>
      </section>

      {/* ── RANKS ── */}
      <section className="py-16 px-6 t-bg-surface" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-1">Adventure Rank</p>
            <h2 className="text-white text-2xl font-black tracking-tight">Your total score = your tier</h2>
            <p className="text-white/35 text-sm mt-1">8 axes × max 5 = <span className="text-white/55 font-semibold">40 pts</span>. Your score across all axes places you on the rank ladder.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {RANKS.map(({ label, color, stars, range, desc }) => (
              <div key={label} className="group relative rounded-xl p-4 border overflow-hidden transition-all duration-200 hover:-translate-y-0.5" style={{ background: `${color}08`, borderColor: `${color}22` }}>
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: color }} />
                <div className="relative">
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => <span key={i} className="text-[10px]" style={{ color: i < stars ? color : "rgba(255,255,255,0.08)" }}>★</span>)}
                  </div>
                  <p className="font-black text-white text-sm mb-0.5">{label}</p>
                  <p className="text-[9px] font-bold mb-2" style={{ color }}>{range} pts</p>
                  <p className="text-white/35 text-[10px] leading-snug">{desc}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW MATCHING WORKS ── */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-1">How It Works</p>
            <h2 className="text-white text-2xl font-black tracking-tight">Every adventure is rated. So are you.</h2>
            <p className="text-white/35 text-sm mt-1 max-w-xl">Each adventure on Trail to Tides has its own ACE profile — 8 axes scored by our team. Your profile is matched against every one of them.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                step: "01",
                color: "#ff5100",
                title: "Adventures are rated",
                body: "Every adventure gets an ACE profile — stamina, altitude, water, nerve, and more — scored honestly by axis, not by a vague difficulty label.",
              },
              {
                step: "02",
                color: "#f59e0b",
                title: "You take the assessment",
                body: "8 questions map your real capability across all 8 axes. No self-reported guesses — structured answers that translate directly to a profile.",
              },
              {
                step: "03",
                color: "#4ade80",
                title: "We surface your matches",
                body: "Adventures are sorted into Ready Now, Stretch, and Out of Range — based on where your axes meet each adventure's requirements.",
              },
            ].map(({ step, color, title, body }) => (
              <div key={step} className="rounded-2xl border p-5 flex flex-col gap-3 relative overflow-hidden"
                style={{ background: `${color}07`, borderColor: `${color}20` }}>
                <div className="absolute top-4 right-4 text-[40px] font-black leading-none tabular-nums select-none pointer-events-none"
                  style={{ color: `${color}10` }}>{step}</div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
                  style={{ background: `${color}18`, color, border: `1.5px solid ${color}28` }}>{step}</div>
                <div>
                  <p className="text-white font-bold text-sm mb-1">{title}</p>
                  <p className="text-white/40 text-[12px] leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE EXAMPLES ── */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-1">In Practice</p>
            <h2 className="text-white text-2xl font-black tracking-tight">Same type. Different body demands.</h2>
            <p className="text-white/35 text-sm mt-1 max-w-xl">Three treks. Same category. Watch the radar shape change — that's what a difficulty label can never show you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROGRESSION_TREKS.map((t, i) => {
              const adv = adventures.find(a => a.slug === t.slug);
              return (
                <div key={t.slug} className="relative rounded-2xl overflow-hidden border flex flex-col" style={{ borderColor: `${t.diffColor}25`, background: "rgba(10,12,18,0.7)" }}>
                  {adv && (
                    <div className="relative h-28 overflow-hidden shrink-0">
                      <Image src={adv.heroImage} alt={adv.name} fill className="object-cover" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, rgba(10,12,18,0.95) 100%)" }} />
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: `${t.diffColor}cc`, color: "white" }}>{i + 1}</div>
                      <span className="absolute top-2.5 right-2.5 text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${t.diffColor}25`, color: t.diffColor, border: `1px solid ${t.diffColor}40`, backdropFilter: "blur(8px)" }}>{t.sublabel}</span>
                      <div className="absolute bottom-2.5 left-3.5 right-3.5">
                        <h3 className="text-white font-bold text-sm leading-tight">{adv.name}</h3>
                      </div>
                    </div>
                  )}
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[10px] font-black tracking-wide uppercase" style={{ color: t.diffColor }}>{t.label}</p>
                  </div>
                  <div className="flex justify-center px-4 py-3 flex-1 items-center">
                    <ACERadar ace={t.ace} size={200} showLabels />
                  </div>
                  {adv && (
                    <div className="px-4 pb-4">
                      <Link href={`/experiences/${adv.slug}`} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110" style={{ background: `${t.diffColor}12`, color: t.diffColor, border: `1px solid ${t.diffColor}22` }}>
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
      <section className="py-20 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,81,0,0.1) 0%, transparent 70%)" }} />
        <div className="max-w-xl mx-auto text-center relative">
          <h2 className="text-white text-3xl font-black tracking-tight leading-tight mb-3">Find your level. Find your adventure.</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-8">8 questions. 2 minutes. Your capability mapped across every axis — adventures that fit, and ones to work toward.</p>
          <Link href="/matchmaker" className="inline-flex items-center gap-2 bg-[#ff5100] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#e04800] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/30">
            Take the Assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
