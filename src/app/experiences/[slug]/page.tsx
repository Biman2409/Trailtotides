import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import OperatorButton from "./OperatorButton";
import {
  MapPin,
  Clock,
  TrendingUp,
  Calendar,
  Sun,
  ShieldCheck,
  ChevronLeft,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { adventures } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

const difficultyStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Beginner: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Intermediate: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Expert: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export async function generateStaticParams() {
  return adventures.map((a) => ({ slug: a.slug }));
}

export default async function ExperiencePage({ params }: Props) {
  const { slug } = await params;
  const adventure = adventures.find((a) => a.slug === slug);
  if (!adventure) notFound();

  const related = adventures
    .filter((a) => a.id !== adventure.id && (a.region === adventure.region || a.type === adventure.type))
    .slice(0, 3);

  const diff = difficultyStyle[adventure.difficulty];

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative h-[90vh] min-h-[600px] flex items-end overflow-hidden">
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          priority
          className="object-cover"
        />
        {/* Multi-layer gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/50 to-transparent" />

        {/* Back button */}
        <Link
          href="/explore"
          className="absolute top-24 left-6 lg:left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
        >
          <ChevronLeft className="w-4 h-4" />
          All Adventures
        </Link>

        {/* Hero text */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 w-full">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="bg-[#c4622d] text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">
                {adventure.type}
              </span>
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${diff.bg} ${diff.text}`}>
                <span className={`w-2 h-2 rounded-full ${diff.dot}`} />
                {adventure.difficulty}
              </span>
              <span className="flex items-center gap-1.5 text-white/60 text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#c4622d]" />
                {adventure.state}
              </span>
            </div>
            <h1 className="text-white text-5xl md:text-7xl font-semibold tracking-tight leading-[1.0] mb-4">
              {adventure.name}
            </h1>
            <p className="text-white/60 text-xl leading-relaxed max-w-xl">
              {adventure.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────── */}
      <section className="bg-[#1a1f2e] py-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x divide-white/10">
            <div className="flex items-center gap-3 md:px-6 first:pl-0">
              <Clock className="w-5 h-5 text-[#c4622d] shrink-0" />
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest">Duration</div>
                <div className="text-white font-semibold text-base">{adventure.durationDays}</div>
              </div>
            </div>
            {adventure.altitude && (
              <div className="flex items-center gap-3 md:px-6">
                <TrendingUp className="w-5 h-5 text-[#5ba3c9] shrink-0" />
                <div>
                  <div className="text-white/40 text-[10px] uppercase tracking-widest">Max Altitude</div>
                  <div className="text-white font-semibold text-base">{adventure.altitude}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 md:px-6">
              <Sun className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest">Best Season</div>
                <div className="text-white font-semibold text-base">{adventure.bestSeason}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 md:px-6">
              <MapPin className="w-5 h-5 text-[#c4622d] shrink-0" />
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest">Terrain</div>
                <div className="text-white font-semibold text-sm leading-snug">{adventure.terrain}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Left — main article content */}
          <div className="lg:col-span-2 space-y-16">

            {/* About */}
            <section>
              <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                The Adventure
              </p>
              <p className="text-[#1a1f2e] text-xl leading-relaxed font-light">
                {adventure.description}
              </p>
            </section>

            {/* What makes it special */}
            <section>
              <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                What Makes It Special
              </p>
              <div className="bg-[#f5f0e8] rounded-2xl p-8 border-l-4 border-[#c4622d]">
                <p className="text-[#1a1f2e] text-lg leading-relaxed">
                  {adventure.whatMakesSpecial}
                </p>
              </div>
            </section>

            {/* Who it's for / not for */}
            <section>
              <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
                Is This For You?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-[#1a1f2e] text-sm">This is for you if…</h3>
                  </div>
                  <p className="text-[#4b6560] text-sm leading-relaxed">{adventure.whoFor}</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-[#1a1f2e] text-sm">Not for you if…</h3>
                  </div>
                  <p className="text-[#6b4040] text-sm leading-relaxed">{adventure.whoNot}</p>
                </div>
              </div>
            </section>

            {/* Safety notes */}
            <section>
              <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                Safety & Prep
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[#6b5a20] text-sm leading-relaxed">{adventure.safetyNotes}</p>
              </div>
            </section>

            {/* Tags */}
            <section>
              <div className="flex flex-wrap gap-2">
                {adventure.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#1a1f2e]/8 text-[#1a1f2e]/60 text-xs px-3 py-1.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right — sidebar */}
          <div className="space-y-6">

            {/* Operators */}
            <div className="bg-white rounded-2xl border border-[#e0d8cc] overflow-hidden shadow-sm">
              <div className="bg-[#1a1f2e] px-6 py-4">
                <p className="text-[#c4622d] text-[10px] font-semibold tracking-[0.2em] uppercase mb-1">
                  Verified Operators
                </p>
                <p className="text-white/50 text-xs">Book with confidence</p>
              </div>
              <div className="divide-y divide-[#e0d8cc]">
                {adventure.operators.map((op) => (
                  <div key={op.name} className="px-6 py-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#1a1f2e] font-semibold text-sm">{op.name}</span>
                          {op.verified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-[#6b6560] text-xs">{op.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#9a9590] text-[10px] uppercase tracking-wide">From</div>
                        <div className="text-[#1a1f2e] font-semibold text-base">{op.priceFrom}</div>
                      </div>
                    </div>
                    {op.website ? (
                      <OperatorButton website={op.website} />
                    ) : (
                      <button className="w-full mt-3 bg-[#1e3d2f] hover:bg-[#2d5a42] text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                        Get Details
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats card */}
            <div className="bg-[#1a1f2e] rounded-2xl p-6 text-white">
              <p className="text-[#c4622d] text-[10px] font-semibold tracking-[0.2em] uppercase mb-4">
                At a Glance
              </p>
              <div className="space-y-4">
                {[
                  { label: "Region", value: adventure.region },
                  { label: "Duration", value: adventure.durationDays },
                  { label: "Difficulty", value: adventure.difficulty },
                  { label: "Best Season", value: adventure.bestSeason },
                  ...(adventure.altitude ? [{ label: "Max Altitude", value: adventure.altitude }] : []),
                  { label: "Terrain", value: adventure.terrain },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-white/40 text-xs shrink-0">{label}</span>
                    <span className="text-white/80 text-xs text-right leading-snug">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/plan"
              className="block bg-[#c4622d] hover:bg-[#e07845] text-white text-center font-semibold py-4 rounded-2xl transition-colors"
            >
              Add to Your Plan
            </Link>
          </div>
        </div>
      </div>

      {/* ── RELATED ADVENTURES ───────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-[#f5f0e8] py-16 lg:py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                  You Might Also Like
                </p>
                <h2 className="text-[#1a1f2e] text-3xl font-semibold tracking-tight">
                  More in {adventure.region}
                </h2>
              </div>
              <Link
                href="/explore"
                className="hidden md:flex items-center gap-1.5 text-[#1e3d2f] text-sm font-medium hover:text-[#c4622d] transition-colors group"
              >
                Explore all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((a) => {
                const d = difficultyStyle[a.difficulty];
                return (
                  <Link key={a.id} href={`/experiences/${a.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-[#e0d8cc] hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={a.heroImage} alt={a.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-[#1a1f2e]/80 text-white/80 text-[10px] font-medium px-2.5 py-1 rounded-full">{a.type}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3 h-3 text-[#c4622d]" />
                        <span className="text-[#9a9590] text-xs">{a.state}</span>
                      </div>
                      <h3 className="text-[#1a1f2e] font-semibold text-base leading-snug mb-1 group-hover:text-[#1e3d2f]">{a.name}</h3>
                      <p className="text-[#9a9590] text-xs line-clamp-2">{a.tagline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
