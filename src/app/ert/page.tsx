import Link from "next/link";
import { ArrowLeft, Zap, Shield, Mountain } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const pillars = [
  {
    letter: "E",
    name: "Exertion",
    icon: Zap,
    color: "#ff5100",
    bg: "rgba(255,81,0,0.08)",
    border: "rgba(255,81,0,0.2)",
    tagline: "Can your body sustain it?",
    desc: "Exertion measures the raw physical demand of an adventure — combining altitude, duration, daily elevation gain, and overall cardiovascular load.",
    levels: [
      { value: 1, label: "Very Easy", desc: "Short walks under 4 hours, minimal elevation. No prior fitness needed." },
      { value: 2, label: "Easy", desc: "Day hikes or beginner multi-day treks. Basic fitness sufficient." },
      { value: 3, label: "Moderate", desc: "Typical multi-day trek: 5–6 hour days, meaningful altitude gain." },
      { value: 4, label: "Hard", desc: "Long days, steep climbs, significant altitude. High fitness required." },
      { value: 5, label: "Extreme", desc: "Expedition-level effort. High altitude, multi-week duration, peak loads." },
    ],
  },
  {
    letter: "R",
    name: "Risk",
    icon: Shield,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    tagline: "How far from help are you?",
    desc: "Risk captures the environmental danger — remoteness, weather unpredictability, rescue accessibility, and exposure to objective hazards like rockfall or avalanche.",
    levels: [
      { value: 1, label: "Very Low", desc: "Popular, well-marked routes. Immediate rescue possible." },
      { value: 2, label: "Low", desc: "Established trekking path with regular traffic and basic infrastructure." },
      { value: 3, label: "Moderate", desc: "Remote trail with limited support. Weather can be unpredictable." },
      { value: 4, label: "High", desc: "Exposed terrain, sparse rescue, unpredictable alpine weather." },
      { value: 5, label: "Extreme", desc: "Deep isolation. Rescue may take days or be impossible in storms." },
    ],
  },
  {
    letter: "T",
    name: "Technicality",
    icon: Mountain,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.2)",
    tagline: "Do you have the skills?",
    desc: "Technicality rates the technical skill and specialised gear required — from simple walking trails to glacier travel, ice axes, and rope work.",
    levels: [
      { value: 1, label: "Walk-in", desc: "Standard trekking boots and poles. No technical skill needed." },
      { value: 2, label: "Uneven Terrain", desc: "Steep or rocky trail. Basic trekking fitness and footwork." },
      { value: 3, label: "Scrambling", desc: "Hands used for balance. No ropes, but confidence on exposure needed." },
      { value: 4, label: "Crampons / Ice", desc: "Microspikes or crampons required. Ice sections encountered." },
      { value: 5, label: "Mountaineering", desc: "Full alpine kit: ice axe, ropes, crampons, glacier travel experience." },
    ],
  },
];

const levelColors = ["#22d399", "#86efac", "#fbbf24", "#f97316", "#ef4444"];

export default function ERTPage() {
  return (
    <div className="min-h-screen bg-[#0e1420]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-5 lg:px-8 pt-28 pb-24">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs mb-10 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        {/* Header */}
        <div className="mb-14">
          <p className="text-[#ff5100] text-xs font-black tracking-[0.25em] uppercase mb-4">How we grade adventures</p>
          <h1 className="text-white text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5">
            The <span className="text-[#ff5100]">ERT</span> Grading System
          </h1>
          <p className="text-white/50 text-base lg:text-lg leading-relaxed max-w-2xl">
            Most adventure grading systems use a single difficulty number. ERT breaks that down into three independent axes —
            so you understand exactly what kind of challenge you&apos;re taking on before you commit.
          </p>
        </div>

        {/* Three pillars */}
        <div className="space-y-10">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.letter}
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: pillar.border, background: pillar.bg }}
              >
                {/* Pillar header */}
                <div className="px-6 py-6 border-b" style={{ borderColor: pillar.border }}>
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${pillar.color}18`, color: pillar.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-2xl font-black"
                          style={{ color: pillar.color }}
                        >
                          {pillar.letter}
                        </span>
                        <span className="text-white text-xl font-bold">{pillar.name}</span>
                      </div>
                      <p className="text-white/40 text-xs mt-0.5">{pillar.tagline}</p>
                    </div>
                  </div>
                  <p className="text-white/55 text-sm leading-relaxed">{pillar.desc}</p>
                </div>

                {/* Level grid */}
                <div className="divide-y" style={{ borderColor: pillar.border }}>
                  {pillar.levels.map((level, i) => (
                    <div
                      key={level.value}
                      className="flex items-start gap-4 px-6 py-4"
                    >
                      <div className="flex items-center gap-2 shrink-0 w-20">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                          style={{ background: `${levelColors[i]}20`, color: levelColors[i] }}
                        >
                          {pillar.letter}{level.value}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold mb-0.5">{level.label}</p>
                        <p className="text-white/40 text-xs leading-relaxed">{level.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* How ERT is used */}
        <div
          className="mt-12 rounded-2xl px-6 py-6 border"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-white font-semibold text-base mb-2">How ERT is assigned</p>
          <p className="text-white/45 text-sm leading-relaxed">
            Each adventure on Wild Ascent is rated by our editorial team using route data, operator input, and firsthand
            field reports. Exertion is computed from altitude and duration, Risk from terrain remoteness and rescue
            accessibility, and Technicality from gear and skill requirements. Scores are reviewed seasonally and updated
            when conditions change.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/35 text-sm mb-4">Know your ERT profile? Find adventures built for your level.</p>
          <Link
            href="/matchmaker"
            className="inline-flex items-center gap-2 bg-[#ff5100] text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-[#e04800] transition-colors"
          >
            Take the Assessment
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
