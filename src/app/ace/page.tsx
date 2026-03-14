import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, Flame, Zap, Dumbbell, Compass, Waves, Mountain, Shield, Brain } from "lucide-react";
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
  { key: "stamina",  icon: <Flame    className="w-5 h-5" />, color: "#f97316", label: "Stamina",  desc: "Sustained physical effort and endurance. Drives multi-day trekking, long motorcycle rides and consecutive days at altitude." },
  { key: "power",    icon: <Zap      className="w-5 h-5" />, color: "#eab308", label: "Power",    desc: "Short explosive bursts — steep ascents, paddling rapids, scrambling over boulders or fighting a current." },
  { key: "strength", icon: <Dumbbell className="w-5 h-5" />, color: "#84cc16", label: "Strength", desc: "Load-bearing capability and joint stress — carrying a heavy pack for days or hauling yourself up technical terrain." },
  { key: "agility",  icon: <Compass  className="w-5 h-5" />, color: "#22d3ee", label: "Agility",  desc: "Balance, coordination and terrain navigation — rock hopping, technical motorcycle riding, snow travel." },
  { key: "water",    icon: <Waves    className="w-5 h-5" />, color: "#3b82f6", label: "Water",    desc: "Swimming ability and aquatic survival — required for rafting, sea kayaking, scuba and river crossings." },
  { key: "altitude", icon: <Mountain className="w-5 h-5" />, color: "#a78bfa", label: "Altitude", desc: "Physiological tolerance to high elevation — the hypoxic stress of Himalayan trekking and 6,000m peaks." },
  { key: "nerve",    icon: <Shield   className="w-5 h-5" />, color: "#f43f5e", label: "Nerve",    desc: "Psychological exposure tolerance — comfort on cliff edges, in caves, on extreme exposed terrain or dangerous rapids." },
  { key: "focus",    icon: <Brain    className="w-5 h-5" />, color: "#10b981", label: "Focus",    desc: "Sustained attention and hazard awareness — technical riding, route-finding, rope work, and multi-day navigation." },
];

const SCALE = [
  { level: 0, label: "Not Relevant", color: "rgba(255,255,255,0.15)" },
  { level: 1, label: "Very Low",     color: "#22c55e" },
  { level: 2, label: "Low",          color: "#84cc16" },
  { level: 3, label: "Moderate",     color: "#eab308" },
  { level: 4, label: "High",         color: "#f97316" },
  { level: 5, label: "Extreme",      color: "#ef4444" },
];

const EXAMPLE_SLUGS = ["kedarkantha-trek", "rupin-pass", "stok-kangri"];

export default function ACEPage() {
  const exampleAdventures = EXAMPLE_SLUGS
    .map((slug) => adventures.find((a) => a.slug === slug))
    .filter(Boolean) as typeof adventures;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="bg-[#0d1117] pt-32 pb-20 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="max-w-5xl mx-auto relative">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.25em] uppercase mb-5">
            Trail to Tides Grading System
          </p>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-4 uppercase">
            The ACE Rating
          </h1>
          <p className="text-white/30 text-sm font-semibold tracking-[0.2em] uppercase mb-6">
            Adventure Capability Engine · Know Your Adventure
          </p>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mb-4">
            Traditional difficulty labels — Easy, Hard, Expert — collapse everything into one number. One trail at 2,000m is &ldquo;Moderate.&rdquo; Another at 5,000m with glacier travel is also &ldquo;Moderate.&rdquo; They are not the same adventure.
          </p>
          <p className="text-white/40 text-base leading-relaxed max-w-2xl mb-12">
            ACE rates every adventure across <span className="text-white font-semibold">eight biological axes</span> — Stamina, Power, Strength, Agility, Water, Altitude, Nerve and Focus — so you know exactly what your body needs before you go.
          </p>

          {/* Four domains */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
            {ACE_DOMAINS.map((d) => (
              <div
                key={d.name}
                className="rounded-2xl p-5 border"
                style={{ background: `${d.color}08`, borderColor: `${d.color}20` }}
              >
                <p className="font-black text-base mb-1" style={{ color: d.color }}>{d.name}</p>
                <p className="text-white/30 text-[11px] leading-relaxed mb-3">{d.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {d.axes.map((ax) => (
                    <span key={ax} className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide"
                      style={{ background: `${ACE_AXIS_COLORS[ax]}18`, color: ACE_AXIS_COLORS[ax] }}>
                      {ax}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* How to read */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: "rgba(255,81,0,0.05)", borderColor: "rgba(255,81,0,0.2)" }}
          >
            <p className="text-[#ff5100] text-xs font-semibold tracking-widest uppercase mb-3">
              How to read an ACE profile
            </p>
            <p className="text-white/55 text-sm leading-relaxed mb-5">
              Each axis is scored <span className="text-white font-semibold">0 to 5</span>, independently.
              A 0 means that axis is completely irrelevant — a desert camel safari has Water: 0.
              Two adventures with the same difficulty tier can have completely different ACE profiles.
              You read all eight axes together.
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              {exampleAdventures.slice(0, 2).map((a) => {
                const ace = getACE(a);
                return (
                  <div key={a.slug} className="flex items-center gap-3">
                    <ACEBadge ace={ace} size="md" />
                    <span className="text-white/35 text-xs font-medium">{a.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE EXAMPLES ─────────────────────────────────── */}
      <section className="bg-[#0d1117] py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Live Examples</p>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Three very different adventures</h2>
          <p className="text-white/40 text-sm mb-8">ACE makes clear what a single tier label cannot.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exampleAdventures.map((a) => {
              const ace = getACE(a);
              return (
                <Link
                  key={a.slug}
                  href={`/experiences/${a.slug}`}
                  className="rounded-2xl p-6 transition-all hover:bg-white/[0.07]"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1">{a.state}</p>
                  <h3 className="text-white font-bold text-base mb-4">{a.name}</h3>
                  <ACERadar ace={ace} size={140} showLabels />
                  <div className="mt-4">
                    <ACEBadge ace={ace} size="sm" />
                  </div>
                  {a.altitude && (
                    <p className="text-white/20 text-[10px] mt-3">Max altitude: {a.altitude}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── THE EIGHT AXES ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">The Eight Axes</p>
        <h2 className="text-3xl font-black text-[#1a1f2e] tracking-tight mb-10">What each axis measures</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AXES.map(({ key, icon, color, label, desc }) => (
            <div
              key={key}
              className="flex items-start gap-4 rounded-2xl p-5 border"
              style={{ background: `${color}06`, borderColor: `${color}20` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18`, color }}
              >
                {icon}
              </div>
              <div>
                <p className="font-bold text-[#1a1f2e] text-sm mb-1">{label}</p>
                <p className="text-[#4b6560] text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCALE ─────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6" style={{ borderTop: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">The Scale</p>
          <h2 className="text-3xl font-black text-[#1a1f2e] tracking-tight mb-10">What each level means</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SCALE.map(({ level, label, color }) => (
              <div
                key={level}
                className="rounded-2xl p-5 flex flex-col items-center text-center border"
                style={{ background: `${color}10`, borderColor: `${color}30` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black mb-3"
                  style={{ background: `${color}20`, color }}
                >
                  {level}
                </div>
                <p className="font-bold text-[#1a1f2e] text-sm">{label}</p>
                <div className="flex gap-0.5 mt-2">
                  {[1,2,3,4,5].map((n) => (
                    <div key={n} className="w-2.5 h-1 rounded-full"
                      style={{ background: n <= level ? color : `${color}20` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOMAINS ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Capability Domains</p>
        <h2 className="text-3xl font-black text-[#1a1f2e] tracking-tight mb-4">Four pillars of adventure readiness</h2>
        <p className="text-[#4b6560] text-sm leading-relaxed max-w-2xl mb-10">
          The eight axes are grouped into four biological capability domains. Every adventure activates a unique combination of them.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACE_DOMAINS.map((d) => (
            <div
              key={d.name}
              className="rounded-2xl p-6 border"
              style={{ background: `${d.color}06`, borderColor: `${d.color}18` }}
            >
              <p className="font-black text-xl mb-1" style={{ color: d.color }}>{d.name}</p>
              <p className="text-[#4b6560] text-sm leading-relaxed mb-4">{d.desc}</p>
              <div className="flex gap-2">
                {d.axes.map((ax) => {
                  const axisData = AXES.find((a) => a.key === ax);
                  return (
                    <div
                      key={ax}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{ background: `${ACE_AXIS_COLORS[ax]}15`, color: ACE_AXIS_COLORS[ax] }}
                    >
                      <span className="text-xs">{axisData?.icon}</span>
                      <span className="text-xs font-semibold capitalize">{ax}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-[#0d1117] py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Find your adventure match</h2>
            <p className="text-white/40 text-sm max-w-md">
              Take the 8-axis assessment and let the ACE engine surface exactly which adventures your body is built for.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/matchmaker"
              className="inline-flex items-center gap-2 bg-[#ff5100] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-[#e04800] transition-colors"
            >
              Take Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-4 rounded-full font-semibold text-sm hover:border-white/40 transition-colors"
            >
              Browse Adventures
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
