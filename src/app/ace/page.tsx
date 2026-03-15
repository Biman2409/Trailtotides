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
    <div className="min-h-screen">
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
                Every adventure makes specific demands on your body. ACE breaks those demands into <span className="text-white font-semibold">eight axes</span> — Stamina, Power, Strength, Agility, Water, Altitude, Nerve and Focus — so you know exactly what you&apos;re signing up for.
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


      {/* ── THE EIGHT AXES ────────────────────────────────────────────── */}
      <section className="py-24 px-6 t-bg-surface" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-3">The Eight Axes</p>
            <h2 className="text-white text-4xl font-black tracking-tight">What your body needs</h2>
            <p className="text-white/35 text-base mt-2 max-w-xl">Each axis targets a specific physical or mental capability. An adventure can push one to the limit while demanding nothing from another — that distinction is everything when you&apos;re preparing.</p>
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
            <h2 className="text-white text-4xl font-black tracking-tight">1 to 5. No ambiguity</h2>
            <p className="text-white/35 text-base mt-2">Once you know which axes matter, you need to know how hard. Every axis uses the same 1–5 scale — consistent, comparable, and honest about what you&apos;ll actually face.</p>
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
                  style={{ width: `${(level / 5) * 100}%`, background: color }} />
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

      {/* ── RANK SYSTEM ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 t-bg-surface" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-3">Adventure Rank</p>
            <h2 className="text-white text-4xl font-black tracking-tight">Your overall capability tier</h2>
            <p className="text-white/35 text-base mt-2 max-w-xl">
              Your ACE assessment produces a total score across all eight axes. That score places you on the Adventure Rank ladder — from first steps through to elite capability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                label: "Uncharted",   color: "#6b7280", stars: 0, range: "—",
                desc: "No assessment taken. Your capability is unknown — take the assessment to find out where you stand.",
                icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.5" fill="currentColor" fillOpacity="0.06"/><path d="M9 9a3 3 0 016 0c0 2-2 2.5-3 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg>,
              },
              {
                label: "Pathfinder",  color: "#22d3ee", stars: 1, range: "8 – 15",
                desc: "You're fit, active and ready to explore. Day hikes, beginner water sports, and accessible multi-day routes are your playground.",
                icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><path d="M12 16.5V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M8.5 12L12 8.5L15.5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                label: "Navigator",   color: "#4ade80", stars: 2, range: "16 – 23",
                desc: "You can read terrain, handle multiple days in the field and manage moderate physical demands across several axes simultaneously.",
                icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 4l2.5 7.5L12 10l-2.5 1.5L12 4z" fill="currentColor"/></svg>,
              },
              {
                label: "Trailblazer", color: "#f59e0b", stars: 3, range: "24 – 31",
                desc: "Serious preparation, consistent training. You push into new territory — technical routes, high altitude objectives and demanding multi-day expeditions.",
                icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M12 2.5L20 6.5V13C20 17.8 16.5 21.3 12 22.8C7.5 21.3 4 17.8 4 13V6.5L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M8 15.5l2-3.5 2 2.5 2-4.5 2 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              },
              {
                label: "Vanguard",    color: "#f97316", stars: 4, range: "32 – 39",
                desc: "You lead from the front. The most demanding adventures on the platform are within reach — expedition-level objectives and extreme terrain.",
                icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><path d="M12 2L20 7V13.5C20 18.2 16.5 21.8 12 23.5C7.5 21.8 4 18.2 4 13.5V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/><path d="M12 2L14 7H20L15.5 10.5L17 16L12 12.5L7 16L8.5 10.5L4 7H10L12 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/></svg>,
              },
              {
                label: "Apex",        color: "#a78bfa", stars: 5, range: "40",
                desc: "Perfect score. Elite capability across every axis — stamina, strength, altitude, nerve. No adventure is out of reach.",
                icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><polygon points="12,1.5 15.5,9.5 24,10 17.8,16 19.8,24 12,19.8 4.2,24 6.2,16 0,10 8.5,9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12"/><polygon points="12,6.5 14,11.5 19.5,12 15.3,15.8 16.7,21 12,18.2 7.3,21 8.7,15.8 4.5,12 10,11.5" fill="currentColor" fillOpacity="0.85"/></svg>,
              },
            ].map((rank, i) => (
              <div
                key={rank.label}
                className="group relative rounded-2xl p-6 border overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: `${rank.color}08`, borderColor: `${rank.color}22` }}
              >
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ background: rank.color }} />
                <div className="relative">
                  {/* Badge + rank number */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${rank.color}18`, color: rank.color, boxShadow: `0 0 16px ${rank.color}25` }}>
                      {rank.icon}
                    </div>
                    <div className="text-right">
                      {rank.stars > 0 ? (
                        <div className="flex gap-0.5 justify-end mb-1">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <span key={si} className="text-xs" style={{ color: si < rank.stars ? rank.color : "rgba(255,255,255,0.08)" }}>★</span>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-1 h-[18px]" />
                      )}
                      <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${rank.color}18`, color: rank.color }}>
                        {rank.range === "—" ? "Unassessed" : `Score ${rank.range}`}
                      </span>
                    </div>
                  </div>
                  <p className="font-black text-white text-lg mb-2">{rank.label}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{rank.desc}</p>
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${rank.color}, transparent)` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Score formula note */}
          <div className="mt-8 rounded-2xl px-6 py-4 border flex items-start gap-4"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-semibold mb-1">How your score is calculated</p>
              <p className="text-white/35 text-xs leading-relaxed">
                Your total score is the sum of your ratings across all eight axes (max 5 per axis × 8 axes = <span className="text-white/60 font-semibold">40 points</span>). A score of 8 means you rated 1 on each axis — a solid baseline. Each point above that reflects real, specific capability growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE EXAMPLES ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-3">Live Examples</p>
              <h2 className="text-white text-4xl font-black tracking-tight">See it in action</h2>
              <p className="text-white/35 text-base mt-2">Here&apos;s what ACE looks like on real adventures. The radar shapes alone tell you more than any difficulty label ever could.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exampleAdventures.map((a) => {
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
                  <div className="relative h-48 overflow-hidden">
                    <Image src={a.heroImage} alt={a.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,20,32,0.1) 0%, rgba(15,20,32,0.9) 100%)" }} />
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="text-white/45 text-[10px] uppercase tracking-widest mb-0.5">{a.state}</p>
                      <h3 className="text-white font-bold text-base leading-tight">{a.name}</h3>
                    </div>
                  </div>
                  <div className="px-5 pt-4 pb-5">
                    <div className="flex justify-center mb-4">
                      <ACERadar ace={ace} size={260} showLabels />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,81,0,0.12) 0%, transparent 70%)" }} />

        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-[#ff5100] text-[11px] font-bold tracking-[0.25em] uppercase mb-5">Your turn</p>
          <h2 className="text-white text-5xl font-black tracking-tight leading-tight mb-5">
            Find exactly what<br />your body is built for.
          </h2>
          <p className="text-white/45 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Now the last piece — your own profile. Eight questions maps your capability across all eight axes. Then we show you which adventures fit, and exactly where you&apos;d need to grow for the ones that don&apos;t.
          </p>
          <div className="flex justify-center">
            <Link
              href="/matchmaker"
              className="inline-flex items-center gap-2 bg-[#ff5100] text-white px-9 py-4 rounded-full font-bold text-base hover:bg-[#e04800] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/30"
            >
              Take Assessment ~ 3 mins
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
