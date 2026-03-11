import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Mountain, Zap, ShieldAlert, Wrench } from "lucide-react";
import { adventures } from "@/lib/data";
import { getERT } from "@/lib/ert";
import ERTBadge from "@/components/ui/custom/ERTBadge";

export const metadata = {
  title: "TrailtoTides Grading System — Trail to Tides",
  description:
    "TrailtoTides grades every adventure on three independent dimensions — Exertion, Risk, and Technicality — so you know exactly what you're getting into.",
};

const EXERTION = [
  { level: 1, label: "Very Easy",  color: "#22c55e", desc: "Short hikes under 4 hours. Minimal elevation. Suitable for all fitness levels." },
  { level: 2, label: "Easy",       color: "#84cc16", desc: "Moderate trails with some elevation. Good for beginners with basic fitness." },
  { level: 3, label: "Moderate",   color: "#eab308", desc: "Multi-day treks with 5–6 hour days and meaningful elevation gain." },
  { level: 4, label: "Hard",       color: "#f97316", desc: "Long days, steep climbs, significant altitude. High fitness required." },
  { level: 5, label: "Extreme",    color: "#ef4444", desc: "Expedition-level effort. Elite fitness and serious prior experience essential." },
];

const RISK = [
  { level: 1, label: "Very Low",  color: "#22c55e", desc: "Well-marked trails. Immediate rescue possible. Fine for solo travel." },
  { level: 2, label: "Low",       color: "#84cc16", desc: "Popular routes with infrastructure. Rescue possible within hours." },
  { level: 3, label: "Moderate",  color: "#eab308", desc: "Remote trails. Limited support. Guide recommended." },
  { level: 4, label: "High",      color: "#f97316", desc: "Exposed or glaciated terrain. Unpredictable weather. Experienced team essential." },
  { level: 5, label: "Extreme",   color: "#ef4444", desc: "Extreme isolation. Rescue may take days or be impossible during storms." },
];

const TECHNICALITY = [
  { level: 1, label: "Walk-in",         color: "#22c55e", desc: "Standard walking trail. Trekking boots and poles sufficient." },
  { level: 2, label: "Uneven Terrain",  color: "#84cc16", desc: "Steep or uneven ground. Basic trekking skills and ankle support needed." },
  { level: 3, label: "Scrambling",      color: "#eab308", desc: "Hands used for balance over boulders or short climbs. No ropes needed." },
  { level: 4, label: "Ice / Snow",      color: "#f97316", desc: "Microspikes or crampons required. Basic snow-walking experience needed." },
  { level: 5, label: "Mountaineering",  color: "#ef4444", desc: "Ice axe, crampons, fixed ropes, glacier travel. Certified guide required." },
];

const TIERS = [
  { tier: "Beginner",     color: "#22c55e", range: "E1–2 · R1 · T1",    examples: ["Dayara Bugyal", "Ali Bedni Bugyal", "Valley of Flowers"] },
  { tier: "Intermediate", color: "#84cc16", range: "E2–3 · R2 · T1–2",  examples: ["Kedarkantha", "Har Ki Dun", "Sandakphu"] },
  { tier: "Advanced",     color: "#eab308", range: "E3–4 · R3 · T1–3",  examples: ["Rupin Pass", "Kashmir Great Lakes", "Goechala"] },
  { tier: "Expert",       color: "#f97316", range: "E4–5 · R4 · T3–4",  examples: ["Stok Kangri", "Pin Parvati Pass"] },
  { tier: "Extreme",      color: "#ef4444", range: "E5 · R5 · T5",      examples: ["Lobuche Peak", "Mera Peak"] },
];

// Real trek examples to show side by side
const EXAMPLE_SLUGS = ["kedarkantha-trek", "rupin-pass", "stok-kangri"];

function ScaleBars({ val, color }: { val: number; color: string }) {
  return (
    <div className="flex gap-1 mt-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className="h-1 flex-1 rounded-full transition-all"
          style={{ background: n <= val ? color : `${color}22` }}
        />
      ))}
    </div>
  );
}

function DimensionSection({
  letter, title, icon, color, items, sub,
}: {
  letter: string; title: string; icon: React.ReactNode;
  color: string; items: typeof EXERTION; sub: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-4" style={{ background: `${color}10` }}>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shrink-0"
          style={{ background: `${color}20`, color }}
        >
          {letter}
        </div>
        <div>
          <h3 className="font-black text-[#1a1f2e] text-lg tracking-tight">{title}</h3>
          <p className="text-[#4b6560] text-xs mt-0.5">{sub}</p>
        </div>
        <div className="ml-auto opacity-30">{icon}</div>
      </div>
      {/* Levels */}
      <div className="divide-y divide-black/[0.04] bg-white">
        {items.map((item) => (
          <div key={item.level} className="px-6 py-4 flex items-start gap-4">
            <div
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black mt-0.5"
              style={{ background: `${item.color}15`, color: item.color }}
            >
              {letter}{item.level}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-sm text-[#1a1f2e]">{item.label}</span>
                <div className="flex gap-0.5 shrink-0">
                  {[1,2,3,4,5].map((n) => (
                    <div key={n} className="w-3 h-1.5 rounded-full" style={{ background: n <= item.level ? item.color : `${item.color}20` }} />
                  ))}
                </div>
              </div>
              <p className="text-[#4b6560] text-xs leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DifficultyGuidePage() {
  const exampleAdventures = EXAMPLE_SLUGS
    .map((slug) => adventures.find((a) => a.slug === slug))
    .filter(Boolean) as typeof adventures;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="bg-[#0d1117] pt-32 pb-24 px-6 relative overflow-hidden">
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        <div className="max-w-5xl mx-auto relative">
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-5 uppercase">
            TrailtoTides<br />Grading System
          </h1>
          <p className="text-[#ff5100] text-sm font-semibold tracking-[0.15em] uppercase mb-6">
            Why one difficulty label is never enough
          </p>
          <p className="text-white/55 text-lg leading-relaxed max-w-2xl mb-4">
            "Moderate" on one website means something completely different on another. A short route at 5,000m in a storm is more dangerous than a long route at 2,000m in perfect weather. A physically demanding trek can require zero technical skill.
          </p>
          <p className="text-white/55 text-lg leading-relaxed max-w-2xl">
            Every TrailtoTides adventure is scored on three independent axes — <span className="text-white font-semibold">Exertion</span>, <span className="text-white font-semibold">Risk</span>, and <span className="text-white font-semibold">Technicality</span> — so you can filter and choose with precision.
          </p>

          {/* floating ERT preview */}
          <div className="mt-10 flex flex-wrap gap-6">
            {[
              { ert: { e: 1, r: 2, t: 1 }, label: "Dayara Bugyal" },
              { ert: { e: 4, r: 3, t: 2 }, label: "Rupin Pass" },
              { ert: { e: 5, r: 4, t: 4 }, label: "Stok Kangri" },
            ].map(({ ert, label }) => (
              <div key={label} className="flex items-center gap-3">
                <ERTBadge ert={ert} size="md" />
                <span className="text-white/40 text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IS ERT ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { letter: "E", title: "Exertion", color: "#f97316", icon: <Zap className="w-8 h-8" />, desc: "How hard your body has to work — calculated from distance, elevation gain, altitude, and number of days on trail." },
            { letter: "R", title: "Risk",     color: "#ef4444", icon: <ShieldAlert className="w-8 h-8" />, desc: "Environmental danger and rescue difficulty — isolation, weather volatility, exposed terrain, and rescue accessibility." },
            { letter: "T", title: "Technicality", color: "#8b5cf6", icon: <Wrench className="w-8 h-8" />, desc: "The skill and equipment required — not fitness. From simple walking to glacier travel requiring ice axe and crampons." },
          ].map(({ letter, title, color, icon, desc }) => (
            <div key={letter} className="rounded-2xl p-6 bg-white" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black"
                  style={{ background: `${color}12`, color }}
                >
                  {letter}
                </div>
                <div className="opacity-10" style={{ color }}>{icon}</div>
              </div>
              <h3 className="font-black text-[#1a1f2e] text-xl mb-2">{title}</h3>
              <p className="text-[#4b6560] text-sm leading-relaxed">{desc}</p>
              <div className="flex gap-1 mt-4">
                {[1,2,3,4,5].map((n) => (
                  <div key={n} className="h-1 flex-1 rounded-full" style={{ background: `${color}${Math.round(20 + n * 16).toString(16)}` }} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] font-medium" style={{ color }}>{letter}1</span>
                <span className="text-[9px] font-medium" style={{ color }}>{letter}5</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REAL TREK EXAMPLES ────────────────────────────── */}
      <section className="bg-[#0d1117] py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Live Examples</p>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Three very different treks</h2>
          <p className="text-white/40 text-sm mb-8">ERT makes clear what a single tier label cannot.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exampleAdventures.map((a) => {
              const ert = getERT(a);
              return (
                <Link key={a.slug} href={`/experiences/${a.slug}`}
                  className="rounded-2xl p-6 transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{a.state}</p>
                  <h3 className="text-white font-bold text-base mb-3">{a.name}</h3>
                  <ERTBadge ert={ert} size="md" />
                  <div className="mt-4 space-y-2">
                    {[
                      { key: "E", val: ert.e, color: "#f97316", label: "Exertion" },
                      { key: "R", val: ert.r, color: "#ef4444", label: "Risk" },
                      { key: "T", val: ert.t, color: "#8b5cf6", label: "Technicality" },
                    ].map(({ key, val, color, label }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-white/30">{label}</span>
                          <span className="text-[10px] font-bold" style={{ color }}>{key}{val}</span>
                        </div>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map((n) => (
                            <div key={n} className="h-1 flex-1 rounded-full"
                              style={{ background: n <= val ? color : `${color}20` }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {a.altitude && (
                    <p className="text-white/25 text-[10px] mt-4">Max altitude: {a.altitude}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SCALE TABLES ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">The Full Scale</p>
        <h2 className="text-3xl font-black text-[#1a1f2e] tracking-tight mb-10">What each level means</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DimensionSection
            letter="E" title="Exertion" color="#f97316"
            icon={<Zap className="w-6 h-6" />}
            sub="Physical effort required"
            items={EXERTION}
          />
          <DimensionSection
            letter="R" title="Risk" color="#ef4444"
            icon={<ShieldAlert className="w-6 h-6" />}
            sub="Environmental danger & rescue"
            items={RISK}
          />
          <DimensionSection
            letter="T" title="Technicality" color="#8b5cf6"
            icon={<Wrench className="w-6 h-6" />}
            sub="Skills & equipment required"
            items={TECHNICALITY}
          />
        </div>
      </section>

      {/* ── TIER MAPPING ──────────────────────────────────── */}
      <section className="bg-white py-16 px-6" style={{ borderTop: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Difficulty Tiers</p>
          <h2 className="text-3xl font-black text-[#1a1f2e] tracking-tight mb-3">How ERT maps to tiers</h2>
          <p className="text-[#4b6560] text-sm leading-relaxed max-w-2xl mb-10">
            ERT scores map to the five TrailtoTides difficulty tiers using the highest of the three values. One override rule applies: <strong>T5 automatically triggers Expert or Extreme</strong> regardless of E and R, because mountaineering terrain is categorically different from all others.
          </p>
          <div className="space-y-3">
            {TIERS.map(({ tier, color, range, examples }) => (
              <div key={tier} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl px-6 py-5"
                style={{ background: `${color}08`, border: `1px solid ${color}22` }}>
                <div className="shrink-0" style={{ minWidth: 120 }}>
                  <span className="font-black text-base" style={{ color }}>{tier}</span>
                </div>
                <div className="shrink-0">
                  <span className="font-mono text-xs px-3 py-1 rounded-lg font-bold"
                    style={{ background: `${color}12`, color }}>{range}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:ml-auto">
                  {examples.map((ex) => (
                    <span key={ex} className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: "rgba(0,0,0,0.05)", color: "#4b6560" }}>
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAFETY WARNINGS ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Automatic Alerts</p>
        <h2 className="text-3xl font-black text-[#1a1f2e] tracking-tight mb-3">Safety warning triggers</h2>
        <p className="text-[#4b6560] text-sm leading-relaxed max-w-2xl mb-8">
          Certain ERT values automatically surface warning banners on adventure pages — not to discourage, but to make sure you're prepared for what you'll face.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
              <span className="text-xs font-bold text-yellow-700">Altitude Sickness Risk</span>
            </div>
            <p className="text-xs text-yellow-700/70 leading-relaxed mb-3">Triggered when max altitude exceeds 4,200m.</p>
            <p className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: "rgba(234,179,8,0.12)", color: "#92400e" }}>Alt {">"} 4,200m</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-xs font-bold text-red-700">Remote Environment</span>
            </div>
            <p className="text-xs text-red-700/70 leading-relaxed mb-3">Triggered when Risk score reaches maximum.</p>
            <p className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: "rgba(239,68,68,0.08)", color: "#991b1b" }}>R = 5</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-violet-500 shrink-0" />
              <span className="text-xs font-bold text-violet-700">Mountaineering Route</span>
            </div>
            <p className="text-xs text-violet-700/70 leading-relaxed mb-3">Triggered when technical gear is required.</p>
            <p className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: "rgba(139,92,246,0.08)", color: "#5b21b6" }}>T = 5</p>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-[#0d1117] py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Ready to find your level?</h2>
            <p className="text-white/40 text-sm">Filter adventures by E, R, and T scores in the explore page.</p>
          </div>
          <Link
            href="/explore"
            className="shrink-0 inline-flex items-center gap-2 bg-[#ff5100] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-[#e04800] transition-colors"
          >
            Browse by ERT
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
