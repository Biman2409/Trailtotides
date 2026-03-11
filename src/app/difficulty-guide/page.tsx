import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "How Trail Difficulty Works — Trail to Tides",
  description:
    "TrailtoTides uses the ERT system — Exertion, Risk, Technicality — to grade every adventure on three independent dimensions so you know exactly what you're getting into.",
};

const EXERTION = [
  { level: 1, label: "Very Easy", color: "#22c55e", desc: "Very easy walking. Short hikes under 4 hours with minimal elevation gain. Suitable for all ages and fitness levels." },
  { level: 2, label: "Easy", color: "#84cc16", desc: "Easy trekking on moderate trails with some elevation. Good for beginners with basic fitness and comfortable footwear." },
  { level: 3, label: "Moderate", color: "#eab308", desc: "Typical multi-day trek with 5–6 hour walking days and meaningful elevation gain. Regular trekking fitness required." },
  { level: 4, label: "Hard", color: "#f97316", desc: "Long days, steep climbs, and significant altitude exposure. High fitness, prior trekking experience, and preparation required." },
  { level: 5, label: "Extreme", color: "#ef4444", desc: "High altitude, extended duration, or physically exhausting expedition-style effort. Elite fitness and serious prior experience essential." },
];

const RISK = [
  { level: 1, label: "Very Low", color: "#22c55e", desc: "Very accessible routes with well-marked trails. Immediate rescue possible. Suitable for solo travel." },
  { level: 2, label: "Low", color: "#84cc16", desc: "Popular trekking routes with teahouse infrastructure and frequent other trekkers. Rescue possible within hours." },
  { level: 3, label: "Moderate", color: "#eab308", desc: "Remote trails with limited support. Weather can be unpredictable. Guide recommended. Rescue within a day." },
  { level: 4, label: "High", color: "#f97316", desc: "High environmental risk. Unpredictable weather, exposed or glaciated terrain, sparse rescue infrastructure. Experienced team essential." },
  { level: 5, label: "Extreme", color: "#ef4444", desc: "Extreme isolation or dangerous terrain. Rescue may take multiple days or be impossible during storms. Satellite communicator required." },
];

const TECHNICALITY = [
  { level: 1, label: "Walk-in", color: "#22c55e", desc: "Standard walking on a defined trail. Trekking boots and poles are sufficient. No special skills needed." },
  { level: 2, label: "Uneven Terrain", color: "#84cc16", desc: "Uneven or steep slopes requiring basic trekking skills, good ankle support, and awareness of footing." },
  { level: 3, label: "Scrambling", color: "#eab308", desc: "Sections where hands are used for balance or short climbs over boulders. No ropes needed but careful footwork required." },
  { level: 4, label: "Crampons / Ice", color: "#f97316", desc: "Ice or snow traction required. Microspikes or crampons are needed at certain points. Basic ice-walking experience recommended." },
  { level: 5, label: "Mountaineering", color: "#ef4444", desc: "Mountaineering terrain. Ice axe, crampons, fixed ropes, and glacier travel experience are essential. Certified guide required." },
];

function ScaleTable({
  title, letter, items, bgFrom, bgTo,
}: {
  title: string; letter: string;
  items: { level: number; label: string; color: string; desc: string }[];
  bgFrom: string; bgTo: string;
}) {
  return (
    <section className="mb-16">
      <div className="flex items-baseline gap-3 mb-6">
        <span
          className="text-4xl font-black tracking-tight"
          style={{ color: bgFrom }}
        >
          {letter}
        </span>
        <h2 className="text-2xl font-bold text-[#1a1f2e] tracking-tight">{title}</h2>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.level}
            className="flex gap-4 items-start rounded-2xl p-5"
            style={{ background: `${item.color}0d`, border: `1px solid ${item.color}30` }}
          >
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: `${item.color}20`, color: item.color }}
            >
              {letter}{item.level}
            </div>
            <div>
              <p className="font-bold text-[#1a1f2e] text-sm mb-1">{item.label}</p>
              <p className="text-[#4b6560] text-sm leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DifficultyGuidePage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0d1117] pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            TrailtoTides Grading System
          </p>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            How Trail Difficulty Works
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
            Most trekking websites show a single word — "Easy", "Moderate", "Difficult" — and leave you guessing. We believe that&apos;s not good enough. A short but isolated route in bad weather can be more dangerous than a long well-supported trek. A physically demanding route can be completely non-technical. A gentle hike can sit at high enough altitude to cause serious problems.
          </p>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mt-4">
            That&apos;s why every adventure on TrailtoTides is graded on three independent dimensions using the <strong className="text-white">ERT system</strong>.
          </p>
        </div>
      </section>

      {/* ERT intro card */}
      <section className="max-w-3xl mx-auto px-6 -mt-8 mb-16">
        <div className="rounded-2xl p-8 shadow-xl" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-5">The ERT Framework</p>
          <div className="grid grid-cols-3 gap-6 mb-6">
            {[
              { letter: "E", name: "Exertion", color: "#f97316", sub: "Physical effort" },
              { letter: "R", name: "Risk", color: "#ef4444", sub: "Environmental danger" },
              { letter: "T", name: "Technicality", color: "#8b5cf6", sub: "Skills & gear required" },
            ].map(({ letter, name, color, sub }) => (
              <div key={letter} className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-3"
                  style={{ background: `${color}15`, color }}
                >
                  {letter}
                </div>
                <p className="font-bold text-[#1a1f2e] text-sm">{name}</p>
                <p className="text-[#4b6560] text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
          <div
            className="rounded-xl px-6 py-4 flex items-center justify-between"
            style={{ background: "rgba(15,20,30,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#1a1f2e]/40 mb-1">Display format on every adventure</p>
              <div className="flex items-center gap-1">
                {[
                  { label: "E4", color: "#f97316" },
                  { label: "R3", color: "#ef4444" },
                  { label: "T2", color: "#8b5cf6" },
                ].map(({ label, color }, i) => (
                  <span
                    key={label}
                    className={`text-xs font-bold px-3 py-1.5 ${i === 0 ? "rounded-l-full" : i === 2 ? "rounded-r-full" : ""}`}
                    style={{ background: `${color}20`, border: `1px solid ${color}50`, color }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[#4b6560] text-xs max-w-[200px] text-right leading-snug">
              Each value is independent. A route can be E4 but T1 — exhausting, but technically straightforward.
            </p>
          </div>
        </div>
      </section>

      {/* Scale tables */}
      <div className="max-w-3xl mx-auto px-6">
        <ScaleTable title="Exertion" letter="E" items={EXERTION} bgFrom="#f97316" bgTo="#ea580c" />
        <ScaleTable title="Risk" letter="R" items={RISK} bgFrom="#ef4444" bgTo="#dc2626" />
        <ScaleTable title="Technicality" letter="T" items={TECHNICALITY} bgFrom="#8b5cf6" bgTo="#7c3aed" />

        {/* Tier mapping */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#1a1f2e] tracking-tight mb-2">How ERT Maps to Difficulty Tiers</h2>
          <p className="text-[#4b6560] text-sm leading-relaxed mb-6">
            TrailtoTides keeps the standard difficulty tier names you already know. ERT scores are mapped to these tiers using the highest of the three values as the governing score — with one override rule: any route with <strong>T5</strong> automatically receives the highest tier, regardless of Exertion or Risk, because mountaineering terrain is categorically different.
          </p>
          <div className="space-y-3">
            {[
              { tier: "Beginner", ert: "E1–2 · R1 · T1", color: "#22c55e", ex: "Short day hikes, accessible waterfalls" },
              { tier: "Intermediate", ert: "E2–3 · R1–2 · T1–2", color: "#84cc16", ex: "Multi-day treks, moderate passes" },
              { tier: "Advanced", ert: "E3–4 · R2–3 · T2–3", color: "#eab308", ex: "High passes, remote valleys, EBC" },
              { tier: "Expert", ert: "E4–5 · R4 · T4", color: "#f97316", ex: "Glacier crossings, technical high passes" },
              { tier: "Extreme", ert: "E5 · R5 · T5", color: "#ef4444", ex: "Mountaineering peaks, 6,000m+ objectives" },
            ].map(({ tier, ert, color, ex }) => (
              <div key={tier} className="flex items-center gap-4 rounded-xl px-5 py-4" style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
                <span className="font-bold text-sm shrink-0" style={{ color, minWidth: 90 }}>{tier}</span>
                <span className="text-[11px] font-mono text-[#1a1f2e]/50 shrink-0">{ert}</span>
                <span className="text-xs text-[#4b6560] ml-auto text-right">{ex}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Safety warnings explainer */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[#1a1f2e] tracking-tight mb-2">Automatic Safety Warnings</h2>
          <p className="text-[#4b6560] text-sm leading-relaxed mb-6">
            Certain combinations of ERT values trigger automatic warning banners on adventure pages — not to discourage, but to ensure you go in prepared.
          </p>
          <div className="space-y-3">
            <div className="flex gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)" }}>
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-yellow-700">High Risk of Altitude Sickness</p>
                <p className="text-xs text-yellow-700/70 mt-0.5">Triggered when max altitude exceeds 4,200m. Acclimatization protocols apply.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700">Remote Environment</p>
                <p className="text-xs text-red-700/70 mt-0.5">Triggered when Risk = R5. Rescue may be significantly delayed.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}>
              <AlertTriangle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-violet-700">Mountaineering Route</p>
                <p className="text-xs text-violet-700/70 mt-0.5">Triggered when Technicality = T5. Specialized equipment and training required.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-24 text-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-[#ff5100] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-[#e04800] transition-colors"
          >
            Browse Adventures by ERT
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
}
