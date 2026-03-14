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
    Flag,
    Navigation,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { adventures } from "@/lib/data";
import Pill from "@/components/ui/custom/Pill";
import ACEBadge from "@/components/ui/custom/ACEBadge";
import ACERadar from "@/components/ui/custom/ACERadar";
import GradingPill from "@/components/ui/custom/GradingPill";
import CompareCTA from "./CompareCTA";
import CompareAdventures from "@/components/ui/custom/CompareAdventures";
import ReviewSection from "@/components/ui/custom/ReviewSection";
import { createClient } from "@/lib/supabase/server";
import { getACE, aceSummary, ACE_AXES, ACE_AXIS_LABELS, ACE_AXIS_COLORS } from "@/lib/ace";
import type { Adventure } from "@/lib/data";
import RealityCheck from "@/components/ui/custom/RealityCheck";

interface Props {
  params: Promise<{ slug: string }>;
}

type Operator = NonNullable<Adventure["operators"]>[number];

function OperatorCard({ op, verified }: { op: Operator; verified: boolean }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-4 ${
      verified
        ? "bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"
        : "bg-[#fafaf8] border border-[#e0d8cc] opacity-90 hover:opacity-100 transition-opacity"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#1a1f2e] font-semibold text-sm leading-snug">{op.name}</span>
            {verified ? (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                <AlertTriangle className="w-3 h-3" />Unverified
              </span>
            )}
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
      <OperatorButton
        website={op.website ?? ""}
        label={verified ? "Get Details" : "Visit Website"}
        variant={verified ? "primary" : "secondary"}
      />
    </div>
  );
}

function RelatedSection({ title, items, exploreHref }: { title: string; items: Adventure[]; exploreHref: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">You Might Also Like</p>
          <h2 className="text-[#1a1f2e] text-3xl font-semibold tracking-tight">{title}</h2>
        </div>
        <Link href={exploreHref} className="hidden md:flex items-center gap-1.5 text-[#1e3d2f] text-sm font-medium hover:text-[#ff5100] transition-colors group">
          Explore all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory no-scrollbar">
        {items.map((a) => (
          <div key={a.id} className="group relative block bg-white rounded-2xl overflow-hidden border border-[#e0d8cc] hover:shadow-lg transition-all hover:-translate-y-1 duration-300 flex-none w-72 snap-start">
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
        ))}
      </div>
    </div>
  );
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

  const PAGE_SIZE = 12;
  const adventureIndex = adventures.findIndex((a) => a.slug === slug);
  const explorePage = adventureIndex >= 0 ? Math.ceil((adventureIndex + 1) / PAGE_SIZE) : 1;

  const ace = getACE(adventure);
  const altM = adventure.altitude ? parseFloat(adventure.altitude.replace(/[^0-9.]/g, "")) : 0;
  const showAltitudeWarning = altM >= 4200 || ace.altitude >= 4;
  const showIsolationWarning = ace.nerve >= 5;
  const showTechnicalWarning = (ace.strength >= 5 || ace.agility >= 5);


    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    const relatedByState = adventures
      .filter((a) => a.id !== adventure.id && a.state === adventure.state)
      .slice(0, 6);

    const relatedByStateIds = new Set(relatedByState.map((a) => a.id));
    const relatedByType = adventures
      .filter((a) => a.id !== adventure.id && a.type === adventure.type && !relatedByStateIds.has(a.id))
      .slice(0, 6);

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
          href={`/explore?page=${explorePage}`}
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
      <section className="bg-[#1a1f2e] py-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto no-scrollbar divide-x divide-white/10 min-w-0">
            <div className="flex items-center gap-2 px-5 first:pl-0 shrink-0">
              <Clock className="w-4 h-4 text-[#ff5100] shrink-0" />
              <div className="min-w-0">
                <div className="text-white/40 text-[9px] uppercase tracking-widest">Duration</div>
                <div className="text-white font-semibold text-sm whitespace-nowrap">{adventure.durationRange ?? adventure.durationDays}</div>
              </div>
            </div>
            {adventure.distance && (
              <div className="flex items-center gap-2 px-5 shrink-0">
                <Route className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-white/40 text-[9px] uppercase tracking-widest">Distance</div>
                  <div className="text-white font-semibold text-sm whitespace-nowrap">{adventure.distanceRange ?? adventure.distance}</div>
                </div>
              </div>
            )}
            {(adventure.altitude || adventure.depth) && (
              <div className="flex items-center gap-2 px-5 shrink-0">
                <TrendingUp className="w-4 h-4 text-[#5ba3c9] shrink-0" />
                <div className="min-w-0">
                  <div className="text-white/40 text-[9px] uppercase tracking-widest">
                    {adventure.type === "Diving" ? "Max Depth" : "Max Altitude"}
                  </div>
                  <div className="text-white font-semibold text-sm whitespace-nowrap">
                    {adventure.depth ?? adventure.altitude}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 px-5 shrink-0">
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-white/40 text-[9px] uppercase tracking-widest">Best Season</div>
                <div className="text-white font-semibold text-sm whitespace-nowrap">{adventure.bestSeason}</div>
              </div>
            </div>
            {(adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp && (
              <div className="flex items-center gap-2 px-5 shrink-0">
                <Flag className="w-4 h-4 text-violet-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-white/40 text-[9px] uppercase tracking-widest">Base Camp</div>
                  <div className="text-white font-semibold text-sm whitespace-nowrap">{adventure.baseCamp}</div>
                </div>
              </div>
            )}
            {adventure.type === "Biking" && adventure.startingPoint && (
              <div className="flex items-center gap-2 px-5 shrink-0">
                <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-white/40 text-[9px] uppercase tracking-widest">Starting Point</div>
                  <div className="text-white font-semibold text-sm whitespace-nowrap">{adventure.startingPoint}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── ACE CAPABILITY PROFILE STRIP ─────────────────── */}
      <section className="bg-[#0d1117] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">

            {/* Left: radar + label */}
            <div className="flex items-center gap-5 shrink-0">
              <ACERadar ace={ace} size={120} showLabels={false} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#ff5100] font-bold">ACE Rating</span>
                  <a
                    href="/ace"
                    title="What is the ACE Rating?"
                    className="flex items-center justify-center w-4 h-4 rounded-full border border-[#ff5100] text-[9px] font-bold text-[#ff5100] hover:bg-[#ff5100] hover:text-white transition-colors"
                  >?</a>
                </div>
                <p className="text-white font-bold text-lg leading-tight">{adventure.name}</p>
                <p className="text-white/35 text-xs mt-0.5">Capability Profile</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px self-stretch bg-white/8" />

            {/* Right: axis tiles */}
            <div className="flex flex-wrap gap-2 flex-1">
              {ACE_AXES.filter(k => ace[k] > 0).map((k) => {
                const val = ace[k];
                const color = ACE_AXIS_COLORS[k];
                const pct = (val / 5) * 100;
                return (
                  <div
                    key={k}
                    className="relative flex flex-col justify-between rounded-xl px-3 py-2.5 overflow-hidden"
                    style={{
                      minWidth: 72,
                      background: `${color}0d`,
                      border: `1px solid ${color}25`,
                    }}
                  >
                    {/* fill bar behind content */}
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-b-xl transition-all"
                      style={{ height: `${pct}%`, background: `${color}12` }}
                    />
                    <div className="relative">
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: `${color}` }}>
                        {ACE_AXIS_LABELS[k]}
                      </p>
                      <div className="flex items-end gap-0.5">
                        <span className="text-2xl font-black leading-none text-white">{val}</span>
                        <span className="text-white/25 text-xs mb-0.5">/5</span>
                      </div>
                      {/* dot row */}
                      <div className="flex gap-0.5 mt-1.5">
                        {[1,2,3,4,5].map(n => (
                          <div
                            key={n}
                            className="h-0.5 flex-1 rounded-full"
                            style={{ background: n <= val ? color : `${color}25` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    <h3 className="font-semibold text-[#1a1f2e] text-sm">Go if you have</h3>
                  </div>
                  <ul className="space-y-2">
                    {adventure.whoFor.split("·").map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                        <span className="text-[#4b6560] text-sm leading-snug">{item.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-[#1a1f2e] text-sm">Skip if you have</h3>
                  </div>
                  <ul className="space-y-2">
                    {adventure.whoNot.split("·").map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                        <span className="text-[#6b4040] text-sm leading-snug">{item.trim()}</span>
                      </li>
                    ))}
                  </ul>
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

            {/* ── ACE Adventure Profile ────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase">
                  ACE Adventure Profile
                </p>
                <GradingPill />
              </div>

              {/* Radar + axes card */}
              <div className="rounded-2xl p-6 mb-4" style={{ background: "#f8f6f2", border: "1px solid rgba(26,31,46,0.08)" }}>
                <div className="flex flex-wrap items-start gap-8 mb-5">
                  {/* Radar */}
                  <div className="flex-shrink-0">
                    <p className="text-[10px] uppercase tracking-widest text-[#1a1f2e]/40 mb-3">Capability Radar</p>
                    <div style={{ filter: "invert(1) hue-rotate(180deg) brightness(0.9)" }}>
                      <ACERadar ace={ace} size={160} showLabels />
                    </div>
                  </div>
                  {/* Difficulty tier + badge */}
                  <div className="flex-1 min-w-[160px]">
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-widest text-[#1a1f2e]/40 mb-1.5">Difficulty Tier</p>
                      <Pill type="difficulty" value={adventure.difficulty} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#1a1f2e]/40 mb-2">ACE Rating</p>
                      <ACEBadge ace={ace} size="md" />
                    </div>
                  </div>
                </div>

                {/* Axis breakdown bars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {ACE_AXES.filter(k => ace[k] > 0).map((k) => {
                    const val = ace[k];
                    const color = ACE_AXIS_COLORS[k];
                    return (
                      <div key={k}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-semibold text-[#1a1f2e]/50 uppercase tracking-wide">{ACE_AXIS_LABELS[k]}</span>
                          <span className="text-[10px] font-bold" style={{ color }}>{val}/5</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div
                              key={n}
                              className="h-1.5 flex-1 rounded-full"
                              style={{ background: n <= val ? color : "rgba(26,31,46,0.1)" }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary text */}
                <p className="text-[#1a1f2e]/60 text-sm leading-relaxed">
                  {aceSummary(ace, adventure.name)}
                </p>
              </div>

              {/* Automatic safety warning banners */}
              <div className="space-y-3">
                {showAltitudeWarning && (
                  <div className="flex gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)" }}>
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-yellow-700">High Risk of Altitude Sickness</p>
                      <p className="text-xs text-yellow-700/70 mt-0.5">Proper acclimatization is required. Ascend gradually — do not exceed 300–500m of altitude gain per day above 3,000m.</p>
                    </div>
                  </div>
                )}
                {showIsolationWarning && (
                  <div className="flex gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-700">Extreme Exposure Environment</p>
                      <p className="text-xs text-red-700/70 mt-0.5">Rescue may be delayed depending on weather and terrain. Carry a satellite communicator and travel with a registered guide.</p>
                    </div>
                  </div>
                )}
                {showTechnicalWarning && (
                  <div className="flex gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <AlertTriangle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-violet-700">Mountaineering Route</p>
                      <p className="text-xs text-violet-700/70 mt-0.5">Specialized equipment and training required — ice axe, crampons, and glacier travel experience are essential.</p>
                    </div>
                  </div>
                )}
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
                        <OperatorCard key={op.name} op={op} verified />
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
                        <OperatorCard key={op.name} op={op} verified={false} />
                      ))}
                    </div>
                    <p className="mt-4 text-[#9a9590] text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Do your own research before booking with unverified operators. We recommend asking for permits and certifications directly.
                    </p>
                  </div>
                )}
              </section>

              {/* Reviews */}
              <ReviewSection slug={adventure.slug} currentUserId={currentUserId} adventureType={adventure.type} adventureName={adventure.name} />

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
            ...((adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp ? [{ label: "Base Camp", value: adventure.baseCamp }] : []),
            ...(adventure.type === "Biking" && adventure.startingPoint ? [{ label: "Starting Point", value: adventure.startingPoint }] : []),
                          { label: "Duration", value: adventure.durationRange ?? adventure.durationDays },
                        ...((adventure.type === "Trekking" || adventure.type === "Biking")
                          ? [{ label: "Distance", value: adventure.distanceRange ?? adventure.distance ?? "Contact for route" }]
                          : (adventure.distance ? [{ label: "Distance", value: adventure.distanceRange ?? adventure.distance }] : [])),
                          { label: "Difficulty", value: adventure.difficulty },
                        { label: "Best Season", value: adventure.bestSeason },
                        ...(adventure.altitude ? [{ label: "Max Altitude", value: adventure.altitude }] : []),
          ...(adventure.depth ? [{ label: "Max Depth", value: adventure.depth }] : []),

                        { label: "Group Size", value: adventure.groupSize },
                      ].map(({ label, value }) => (
                          <div key={label} className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                            <span className="text-white/38 text-xs shrink-0">{label}</span>
                            <span className="text-white/80 text-xs text-right leading-snug">{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>


                {/* Reality Check */}
                <RealityCheck adventure={adventure} />

                {/* CTA */}
                <CompareCTA adventure={adventure} />

                {/* Back to explore */}
              <Link
                href={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}
                className="flex items-center justify-center gap-2 w-full bg-transparent border border-[#1a1f2e]/20 hover:border-[#1a1f2e]/40 text-[#1a1f2e] font-medium py-3 rounded-2xl text-sm transition-all duration-200 hover:bg-[#1a1f2e]/5"
              >
                More in {adventure.state}
              </Link>
              <Link
                href={`/explore?type=${encodeURIComponent(adventure.type)}`}
                className="flex items-center justify-center gap-2 w-full bg-transparent border border-[#1a1f2e]/20 hover:border-[#1a1f2e]/40 text-[#1a1f2e] font-medium py-3 rounded-2xl text-sm transition-all duration-200 hover:bg-[#1a1f2e]/5"
              >
                More in {adventure.type}
              </Link>
            </div>
          </div>
        </div>

        {/* ── YOU MIGHT ALSO LIKE ───────────────────────────── */}
        {(relatedByState.length > 0 || relatedByType.length > 0) && (
          <section className="bg-[#f5f0e8] py-16 lg:py-24 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-14">

              {/* More in [State] */}
              <RelatedSection
                title={`More in ${adventure.state}`}
                items={relatedByState}
                exploreHref={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}
              />

              {/* More in [Type] */}
              <RelatedSection
                title={`More in ${adventure.type}`}
                items={relatedByType}
                exploreHref={`/explore?type=${encodeURIComponent(adventure.type)}`}
              />

            </div>
          </section>
        )}

        <CompareAdventures />
        <Footer />
      </div>
    );
  }

