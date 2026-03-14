import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Zap, Dumbbell, Compass, Waves, Mountain, Shield, Brain, Gauge } from "lucide-react";
import { adventures } from "@/lib/data";
import { getACE, ACE_AXIS_COLORS, ACE_DOMAINS } from "@/lib/ace";
import ACEBadge from "@/components/ui/custom/ACEBadge";
import ACERadar from "@/components/ui/custom/ACERadar";

export const metadata = {
  title: "ACE Rating System — Trail to Tides",
  description:
    "The Adventure Capability Engine rates every adventure on 8 biological axes — so you know exactly what your body needs to attempt it safely.",
  openGraph: {
    title: "ACE Rating System — Trail to Tides",
    description: "8-axis biological difficulty rating for every adventure. Know your adventure.",
    url: "https://trailtotides.com/ace",
    images: [{ url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90", width: 1200, height: 630, alt: "ACE Rating" }],
  },
  alternates: { canonical: "https://trailtotides.com/ace" },
};

const AXES = [
  { key: "stamina",  icon: <Flame    className="w-5 h-5" />, color: "#f97316", label: "Stamina",  desc: "Sustained physical effort and endurance — multi-day trekking, long motorcycle rides, consecutive days at altitude." },
  { key: "power",    icon: <Zap      className="w-5 h-5" />, color: "#eab308", label: "Power",    desc: "Short explosive bursts — steep ascents, paddling rapids, scrambling over boulders, fighting a current." },
  { key: "strength", icon: <Dumbbell className="w-5 h-5" />, color: "#84cc16", label: "Strength", desc: "Load-bearing capability and joint stress — carrying heavy packs for days or hauling up technical terrain." },
  { key: "agility",  icon: <Compass  className="w-5 h-5" />, color: "#22d3ee", label: "Agility",  desc: "Balance, coordination and terrain navigation — rock hopping, technical riding, snow and ice travel." },
  { key: "water",    icon: <Waves    className="w-5 h-5" />, color: "#3b82f6", label: "Water",    desc: "Swimming ability and aquatic survival — required for rafting, sea kayaking, scuba and river crossings." },
  { key: "altitude", icon: <Mountain className="w-5 h-5" />, color: "#a78bfa", label: "Altitude", desc: "Physiological tolerance to high elevation — the hypoxic stress of Himalayan trekking and 6,000m peaks." },
  { key: "nerve",    icon: <Shield   className="w-5 h-5" />, color: "#f43f5e", label: "Nerve",    desc: "Psychological exposure tolerance — comfort on cliff edges, in caves, on extreme terrain or dangerous rapids." },
  { key: "focus",    icon: <Brain    className="w-5 h-5" />, color: "#10b981", label: "Focus",    desc: "Sustained attention and hazard awareness — technical riding, route-finding, rope work, multi-day navigation." },
];

const SCALE = [
  { level: 0, label: "Not Relevant", sub: "Axis doesn't apply",   color: "rgba(255,255,255,0.2)" },
  { level: 1, label: "Very Low",     sub: "Minimal demand",        color: "#22c55e" },
  { level: 2, label: "Low",          sub: "Light conditioning",    color: "#84cc16" },
  { level: 3, label: "Moderate",     sub: "Regular training",      color: "#eab308" },
  { level: 4, label: "High",         sub: "Strong preparation",    color: "#f97316" },
  { level: 5, label: "Extreme",      sub: "Elite level required",  color: "#ef4444" },
];

const EXAMPLE_SLUGS = ["kedarkantha-trek", "rupin-pass", "stok-kangri"];

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  Engine:   <Gauge    className="w-5 h-5" />,
  Chassis:  <Dumbbell className="w-5 h-5" />,
  Elements: <Waves    className="w-5 h-5" />,
  Mind:     <Brain    className="w-5 h-5" />,
};

export default function ACEPage() {
  const exampleAdventures = EXAMPLE_SLUGS
    .map((slug) => adventures.find((a) => a.slug === slug))
    .filter(Boolean) as typeof adventures;

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #ff5100 0%, #a78bfa 50%, transparent 100%)" }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-16">

            {/* Left: copy */}
            <div className="flex-1 max-w-2xl">
              <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-7">
                Adventure Capability Engine
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
                The <span className="text-[#ff5100]">ACE</span> Rating System
              </h1>

              <p className="text-white/55 text-base leading-relaxed mb-5">
                ACE rates every adventure across <span className="text-white font-semibold">eight axes</span> — Stamina, Power, Strength, Agility, Water, Altitude, Nerve and Focus — so you show up prepared, not surprised.
              </p>
              <div className="flex flex-wrap gap-2 mb-10">
                {[
                  { abbr: "STA", key: "stamina",  color: "#f97316" },
                  { abbr: "PWR", key: "power",    color: "#eab308" },
                  { abbr: "STR", key: "strength", color: "#84cc16" },
                  { abbr: "AGI", key: "agility",  color: "#22d3ee" },
                  { abbr: "WAT", key: "water",    color: "#3b82f6" },
                  { abbr: "ALT", key: "altitude", color: "#a78bfa" },
                  { abbr: "NRV", key: "nerve",    color: "#f43f5e" },
                  { abbr: "FOC", key: "focus",    color: "#10b981" },
                ].map(({ abbr, color }) => (
                  <span
                    key={abbr}
                    className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest border"
                    style={{ background: `${color}12`, borderColor: `${color}30`, color }}
                  >
                    {abbr}
                  </span>
                ))}
              </div>

            </div>

            {/* Right: large radar */}
            <div className="relative shrink-0 mx-auto lg:mx-0">
              {/* Glow behind radar */}
              <div className="absolute inset-0 rounded-full blur-3xl opacity-20 scale-75"
                style={{ background: "conic-gradient(from 0deg, #f97316, #eab308, #84cc16, #22d3ee, #3b82f6, #a78bfa, #f43f5e, #10b981, #f97316)" }} />
              <ACERadar
                ace={{ stamina: 4, power: 3, strength: 4, agility: 3, water: 1, altitude: 5, nerve: 4, focus: 3 }}
                size={280}
                showLabels
              />
            </div>
          </div>
        </div>
      </section>


      {/* ── LIVE EXAMPLES ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-3">Live Examples</p>
              <h2 className="text-white text-4xl font-black tracking-tight">See it in action.</h2>
              <p className="text-white/35 text-base mt-2">Typical labels hide the detail. ACE exposes it.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exampleAdventures.map((a, idx) => {
              const ace = getACE(a);
              const topAxis = (Object.entries(ace) as [string, number][]).sort(([,a],[,b]) => b-a)[0];
              const topColor = topAxis ? ACE_AXIS_COLORS[topAxis[0] as keyof typeof ACE_AXIS_COLORS] : "#ff5100";
              return (
                <Link
                  key={a.slug}
                  href={`/experiences/${a.slug}`}
                  className="group relative rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ borderColor: `${topColor}25`, background: "#0f1420" }}
                >
                  {/* Hero image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image src={a.heroImage} alt={a.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,20,32,0.1) 0%, rgba(15,20,32,0.9) 100%)" }} />
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="text-white/45 text-[10px] uppercase tracking-widest mb-0.5">{a.state}</p>
                      <h3 className="text-white font-bold text-base leading-tight">{a.name}</h3>
                    </div>
                  </div>

                  {/* Radar + badge */}
                  <div className="px-5 pt-4 pb-5">
                    <div className="flex justify-center mb-4">
                      <ACERadar ace={ace} size={140} showLabels />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DOMAINS ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-3">Capability Domains</p>
            <h2 className="text-white text-4xl font-black tracking-tight">Four pillars of readiness.</h2>
            <p className="text-white/35 text-base mt-2 max-w-xl">The eight axes are grouped into four domains.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ACE_DOMAINS.map((d) => (
              <div
                key={d.name}
                className="relative rounded-3xl border overflow-hidden p-7"
                style={{ background: `${d.color}07`, borderColor: `${d.color}20` }}
              >
                {/* Corner glow */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
                  style={{ background: d.color }} />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: `${d.color}18`, color: d.color }}>
                      {DOMAIN_ICONS[d.name]}
                    </div>
                    <div>
                      <p className="text-white font-black text-xl leading-none">{d.name}</p>
                    </div>
                  </div>

                  <p className="text-white/45 text-sm leading-relaxed mb-6">{d.desc}</p>

                  <div className="flex gap-2">
                    {d.axes.map((ax) => {
                      const color = ACE_AXIS_COLORS[ax];
                      const axisData = AXES.find((a) => a.key === ax);
                      return (
                        <div
                          key={ax}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border"
                          style={{ background: `${color}12`, borderColor: `${color}25`, color }}
                        >
                          <span className="text-xs">{axisData?.icon}</span>
                          <span className="text-xs font-bold capitalize">{ax}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE EIGHT AXES ────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-3">The Eight Axes</p>
            <h2 className="text-white text-4xl font-black tracking-tight">What your body needs.</h2>
            <p className="text-white/35 text-base mt-2 max-w-xl">Each axis is scored independently from 0 to 5. An adventure can demand nothing of one axis while pushing another to the maximum.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AXES.map(({ key, icon, color, label, desc }) => (
              <div
                key={key}
                className="group relative rounded-2xl p-5 border overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: `${color}08`, borderColor: `${color}20` }}
              >
                {/* Glow top-right */}
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ background: color }} />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative"
                  style={{ background: `${color}18`, color }}
                >
                  {icon}
                </div>
                <p className="font-black text-white text-base mb-1.5 relative">{label}</p>
                <p className="text-white/40 text-xs leading-relaxed relative">{desc}</p>
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCALE ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-3">The Demand Scale</p>
            <h2 className="text-white text-4xl font-black tracking-tight">0 to 5. No ambiguity.</h2>
            <p className="text-white/35 text-base mt-2">Every axis uses the same six-point scale. Here's exactly what each level means in the real world.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCALE.map(({ level, label, sub, color }) => (
              <div
                key={level}
                className="relative rounded-2xl border overflow-hidden"
                style={{ background: `${color}08`, borderColor: `${color}18` }}
              >
                {/* Fill indicator */}
                <div className="absolute top-0 left-0 bottom-0 opacity-10"
                  style={{ width: level === 0 ? "0%" : `${(level / 5) * 100}%`, background: color }} />
                <div className="relative flex items-center gap-5 p-5">
                  {/* Number */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0"
                    style={{ background: `${color}18`, color, boxShadow: level >= 4 ? `0 0 20px ${color}40` : "none" }}
                  >
                    {level}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-base">{label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{sub}</p>
                    {/* Pip row */}
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4,5].map((n) => (
                        <div key={n} className="h-1 flex-1 rounded-full"
                          style={{ background: n <= level ? color : `${color}18` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO READ ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-3">How to read it</p>
              <h2 className="text-white text-4xl font-black tracking-tight mb-6">The same tier. A completely different adventure.</h2>
              <div className="space-y-5">
                {[
                  { label: "Axis 0", text: "Completely irrelevant to this adventure — a camel safari has Water: 0." },
                  { label: "Read together", text: "Two adventures can share a difficulty tier but have opposite profiles. ACE shows you exactly where the demands lie." },
                  { label: "Your profile", text: "Take the 8-axis assessment and get your personal ACE map. Then compare it directly against any adventure." },
                ].map(({ label, text }) => (
                  <div key={label} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff5100] mt-2 shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm mb-0.5">{label}</p>
                      <p className="text-white/45 text-sm leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Example comparison */}
            <div className="space-y-3">
              {exampleAdventures.slice(0, 2).map((a) => {
                const ace = getACE(a);
                return (
                  <div key={a.slug} className="rounded-2xl border p-5"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white/35 text-[10px] uppercase tracking-widest mb-0.5">{a.state}</p>
                        <p className="text-white font-bold text-sm">{a.name}</p>
                      </div>
                      <div className="shrink-0">
                        <ACERadar ace={ace} size={72} showLabels={false} />
                      </div>
                    </div>
                    <ACEBadge ace={ace} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,81,0,0.12) 0%, transparent 70%)" }} />

        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-5">Know your adventure</p>
          <h2 className="text-white text-5xl font-black tracking-tight leading-tight mb-5">
            Find exactly what<br />your body is built for.
          </h2>
          <p className="text-white/45 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Answer 8 questions. Discover your ACE profile and find the adventures you&apos;re truly ready for.
          </p>
          <div className="flex justify-center">
            <Link
              href="/matchmaker"
              className="inline-flex items-center gap-2 bg-[#ff5100] text-white px-9 py-4 rounded-full font-bold text-base hover:bg-[#e04800] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/30"
            >
              Take Assessment — 3 mins
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
