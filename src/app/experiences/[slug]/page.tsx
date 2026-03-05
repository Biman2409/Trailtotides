import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import OperatorButton from "./OperatorButton";
import {
  MapPin,
  Clock,
  TrendingUp,
  Sun,
  ShieldCheck,
  ChevronLeft,
  Star,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ArrowRight,
    Route,
    BadgeCheck,
    ExternalLink,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { adventures } from "@/lib/data";
import Pill from "@/components/ui/custom/Pill";
import CompareCTA from "./CompareCTA";
import CompareAdventures from "@/components/ui/custom/CompareAdventures";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return adventures.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const adventure = adventures.find((a) => a.slug === slug);
  if (!adventure) return {};
  return {
    title: `${adventure.name} — Trail to Tides`,
    description: `${adventure.type} in ${adventure.state} · ${adventure.difficulty} · ${adventure.duration} days. ${adventure.tagline ?? "Discover this handpicked adventure on Trail to Tides."}`,
    openGraph: {
      title: `${adventure.name} — Trail to Tides`,
      description: `${adventure.type} in ${adventure.state} · ${adventure.difficulty} · ${adventure.duration} days.`,
      url: `https://trailtotides.com/experiences/${slug}`,
      images: [{ url: adventure.heroImage, width: 1200, height: 630, alt: adventure.name }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${adventure.name} — Trail to Tides`,
      images: [adventure.heroImage],
    },
    alternates: { canonical: `https://trailtotides.com/experiences/${slug}` },
  };
}

export default async function ExperiencePage({ params }: Props) {
  const { slug } = await params;
  const adventure = adventures.find((a) => a.slug === slug);
  if (!adventure) notFound();

    const related = adventures
      .filter((a) => a.id !== adventure.id && (a.region === adventure.region || a.type === adventure.type))
      .slice(0, 3);

        const statCount = [
          true, // Duration
          !!adventure.distance,
          !!(adventure.altitude || adventure.depth),
          true, // Best Season
          true  // Terrain
        ].filter(Boolean).length;

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
            style={{ objectFit: "cover" }}
          />
          {/* Vibrancy filter */}
          <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-br from-orange-900/30 via-transparent to-sky-900/20 pointer-events-none" />
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
                <Pill type="type" value={adventure.type} />
                <Pill type="difficulty" value={adventure.difficulty} />
                <Link 
                  href={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}
                  className="flex items-center gap-1.5 text-white/60 text-xs tracking-tight font-bold hover:text-[#ff5100] transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#ff5100]" />
                  {adventure.state}
                </Link>
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
          <div className="flex flex-wrap md:flex-nowrap items-center divide-y md:divide-y-0 md:divide-x divide-white/10 gap-y-4">
            <div className="flex items-center gap-3 md:px-6 first:pl-0">
              <Clock className="w-5 h-5 text-[#ff5100] shrink-0" />
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest">Duration</div>
                <div className="text-white font-semibold text-base">{adventure.durationDays}</div>
              </div>
            </div>
            {adventure.distance && (
              <div className="flex items-center gap-3 md:px-6">
                <Route className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-white/40 text-[10px] uppercase tracking-widest">Distance</div>
                  <div className="text-white font-semibold text-base">{adventure.distance}</div>
                </div>
              </div>
            )}
              {(adventure.altitude || adventure.depth) && (
                <div className="flex items-center gap-3 md:px-6">
                  <TrendingUp className="w-5 h-5 text-[#5ba3c9] shrink-0" />
                  <div>
                    <div className="text-white/40 text-[10px] uppercase tracking-widest">
                      {adventure.type === "Diving" ? "Max Depth" : "Max Altitude"}
                    </div>
                    <div className="text-white font-semibold text-base">
                      {adventure.depth ?? adventure.altitude}
                    </div>
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
              <MapPin className="w-5 h-5 text-[#ff5100] shrink-0" />
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
              <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                The Adventure
              </p>
              <p className="text-[#1a1f2e] text-xl leading-relaxed font-light">
                {adventure.description}
              </p>
            </section>

            {/* What makes it special */}
            <section>
              <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                What Makes It Special
              </p>
              <div className="bg-[#f5f0e8] rounded-2xl p-8 border-l-4 border-[#ff5100]">
                <p className="text-[#1a1f2e] text-lg leading-relaxed">
                  {adventure.whatMakesSpecial}
                </p>
              </div>
            </section>

            {/* Who it's for / not for */}
            <section>
              <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
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
              <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                Safety & Prep
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[#6b5a20] text-sm leading-relaxed">{adventure.safetyNotes}</p>
              </div>
            </section>

              {/* Operators Section */}
              <section>
                {/* Verified Operators */}
                {adventure.operators.some((op) => op.verified) && (
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                      <BadgeCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase">
                          Verified Operators
                        </p>
                          <p className="text-[#9a9590] text-sm mt-0.5">
                            ALTOA/PADI/IMF registered or established operators with a verifiable track record
                          </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {adventure.operators.filter((op) => op.verified).map((op) => (
                        <div
                          key={op.name}
                          className="bg-white border border-emerald-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[#1a1f2e] font-semibold text-sm leading-snug">{op.name}</span>
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3" />
                                  Verified
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`w-3 h-3 ${s <= Math.round(op.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                                ))}
                                <span className="text-[#9a9590] text-xs ml-1">{op.rating}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[#9a9590] text-[10px] uppercase tracking-wide">From</div>
                              <div className="text-[#1a1f2e] font-bold text-base">{op.priceFrom}</div>
                            </div>
                          </div>
                          <OperatorButton website={op.website ?? ""} />
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[#9a9590] text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      All verified operators hold valid permits, safety certifications and guide credentials.
                    </p>
                  </div>
                )}

                  {/* Verification Criteria Box */}
                  <div className="mb-10 bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-emerald-800 text-xs font-bold tracking-[0.15em] uppercase">How We Verify Operators</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { icon: CheckCircle2, text: "Valid government permits & licenses" },
                        { icon: CheckCircle2, text: "ATOAI / IMF / PADI certification confirmed" },
                        { icon: CheckCircle2, text: "Certified & trained local guides on staff" },
                        { icon: CheckCircle2, text: "Safety gear & evacuation protocols in place" },
                        { icon: CheckCircle2, text: "Independently reviewed by our team on-ground" },
                        { icon: CheckCircle2, text: "Consistent track record over 2+ seasons" },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-emerald-900 text-xs">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Other Operators */}
                  {adventure.operators.some((op) => !op.verified) && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="text-[#1a1f2e] text-xs font-semibold tracking-[0.2em] uppercase">
                            Other Operators
                          </p>
                            <p className="text-[#9a9590] text-sm mt-0.5">
                              Listed by the community — not verified by us
                            </p>

                        </div>
                      </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {adventure.operators.filter((op) => !op.verified).map((op) => (
                        <div
                          key={op.name}
                          className="bg-[#fafaf8] border border-[#e0d8cc] rounded-2xl p-5 flex flex-col gap-4 opacity-90 hover:opacity-100 transition-opacity"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[#1a1f2e] font-semibold text-sm leading-snug">{op.name}</span>
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  Unverified
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`w-3 h-3 ${s <= Math.round(op.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                                ))}
                                <span className="text-[#9a9590] text-xs ml-1">{op.rating}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[#9a9590] text-[10px] uppercase tracking-wide">From</div>
                              <div className="text-[#1a1f2e] font-bold text-base">{op.priceFrom}</div>
                            </div>
                          </div>
                          <OperatorButton website={op.website ?? ""} label="Visit Website" variant="secondary" />
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[#9a9590] text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Do your own research before booking with unverified operators. We recommend asking for permits and certifications directly.
                    </p>
                  </div>
                )}
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
            <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">

                  <div className="bg-[#1a1f2e] rounded-2xl p-6 text-white">
                    <p className="text-[#ff5100] text-[10px] font-semibold tracking-[0.2em] uppercase mb-4">
                      At a Glance
                    </p>
                      <div className="space-y-3.5">
                        {[
                          { label: "Type", value: adventure.type },
                          ...(adventure.baseCamp ? [{ label: "Base Camp", value: adventure.baseCamp }] : []),
                          { label: "Duration", value: adventure.durationDays },
                        ...((adventure.type === "Trekking" || adventure.type === "Biking") 
                          ? [{ label: "Distance", value: adventure.distance || "Contact for route" }] 
                          : (adventure.distance ? [{ label: "Distance", value: adventure.distance }] : [])),
                          { label: "Difficulty", value: adventure.difficulty },
                        { label: "Best Season", value: adventure.bestSeason },
                        ...(adventure.altitude ? [{ label: "Max Altitude", value: adventure.altitude }] : []),
          ...(adventure.depth ? [{ label: "Max Depth", value: adventure.depth }] : []),
                        { label: "Terrain", value: adventure.terrain },
                        { label: "Group Size", value: adventure.groupSize },
                      ].map(({ label, value }) => (
                          <div key={label} className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                            <span className="text-white/38 text-xs shrink-0">{label}</span>
                            <span className="text-white/80 text-xs text-right leading-snug">{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>


                {/* CTA */}
                <CompareCTA adventure={adventure} />

                {/* Back to explore */}
              <Link
                href={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}
                className="flex items-center justify-center gap-2 w-full bg-transparent border border-[#1a1f2e]/20 hover:border-[#1a1f2e]/40 text-[#1a1f2e] font-medium py-3 rounded-2xl text-sm transition-all duration-200 hover:bg-[#1a1f2e]/5"
              >
                More in {adventure.state}
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
                <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                  You Might Also Like
                </p>
                <h2 className="text-[#1a1f2e] text-3xl font-semibold tracking-tight">
                  More in {adventure.state}
                </h2>
              </div>
              <Link
                href="/explore"
                className="hidden md:flex items-center gap-1.5 text-[#1e3d2f] text-sm font-medium hover:text-[#ff5100] transition-colors group"
              >
                Explore all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {related.map((a) => {
                    return (
                        <div key={a.id} className="group relative block bg-white rounded-2xl overflow-hidden border border-[#e0d8cc] hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                          <Link href={`/experiences/${a.slug}`} className="absolute inset-0 z-10" />
                          <div className="relative h-48 overflow-hidden">
                              <Image src={a.heroImage} alt={a.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectFit: "cover" }} />
                              <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-br from-orange-900/30 via-transparent to-sky-900/20 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-20">
                              <Pill type="type" value={a.type} />
                              <Pill type="difficulty" value={a.difficulty} />
                            </div>
  
                        </div>
                      <div className="p-5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3 h-3 text-[#ff5100]" />
                          <span className="text-[#9a9590] text-xs">{a.state}</span>
                        </div>
                        <h3 className="text-[#1a1f2e] font-semibold text-base leading-snug mb-1 group-hover:text-[#1e3d2f]">{a.name}</h3>
                        <p className="text-[#9a9590] text-xs line-clamp-2">{a.tagline}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        </section>
        )}

        <CompareAdventures />
        <Footer />
      </div>
    );
  }

