import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import OperatorButton from "./OperatorButton";
import { type OperatorCardData } from "./OperatorCard";
import OperatorsSection from "./OperatorsSection";
import {
  Clock,
  TrendingUp,
  Sun,
  AlertTriangle,
  ChevronLeft,
  ArrowRight,
  Route,
  Flag,
  Navigation,
  Gauge,
  Star,
  Camera,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { adventures } from "@/lib/data";
import Pill from "@/components/ui/custom/Pill";
import ACEProfileSection from "./ACEProfileSection";
import CompareCTA from "./CompareCTA";
import CompareAdventures from "@/components/ui/custom/CompareAdventures";
import SavedAdventuresSection from "@/components/ui/custom/SavedAdventuresSection";
import HeroActions from "./HeroActions";
import ReviewSection from "@/components/ui/custom/ReviewSection";
import { createClient } from "@/lib/supabase/server";
import { loadTripLog } from "@/app/triplog/actions";
import { getACE, computeDifficulty } from "@/lib/ace";
import type { Adventure } from "@/lib/data";
import { getApprovedOperatorsForAdventure } from "@/app/auth/operator-actions";
import OperatorListingPanel from "./OperatorListingPanel";
import MobileBookBar from "./MobileBookBar";
import AccordionSection from "./AccordionSection";
import WeatherWidget from "./WeatherWidget";
import PhotoGallery from "./PhotoGallery";
import PackingList from "./PackingList";
import HazardBadges from "./HazardBadges";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-4">
      {children}
    </p>
  );
}

function RelatedSection({ title, items, exploreHref, pillMode = "type" }: { title: string; items: Adventure[]; exploreHref: string; pillMode?: "type" | "region" }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <h3 className="text-white text-base font-semibold tracking-tight">{title}</h3>
        <Link href={exploreHref} className="hidden md:flex items-center gap-1.5 text-white/40 text-xs font-medium hover:text-[#ff5100] transition-colors group">
          Explore all
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory no-scrollbar">
        {items.map((a) => {
          const diff = computeDifficulty(getACE(a));
          return (
            <Link key={a.id} href={`/experiences/${a.slug}`} className="group relative flex flex-col rounded-2xl overflow-hidden flex-none w-56 snap-start transition-all duration-300 hover:-translate-y-1" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
              <div className="relative h-28 shrink-0 overflow-hidden">
                <Image src={a.heroImage} alt={a.name} fill loading="lazy" className="object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectFit: "cover" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                  {pillMode === "type"
                    ? <Pill type="type" value={a.type} />
                    : <Pill type="subRegion" value={a.state} />
                  }
                </div>
              </div>
              <div className="p-2.5 h-14 flex flex-col justify-between">
                <h3 className="text-white font-semibold text-xs leading-snug group-hover:text-[#ff5100] transition-colors line-clamp-2">{a.name}</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-white/35">
                  <span className="font-semibold text-white/50">{diff}</span>
                  <span className="text-white/20">·</span>
                  <span>{a.durationDays}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return adventures.map((a) => ({ slug: a.slug }));
}

// Always re-render to pick up newly approved operator submissions
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const adventure = adventures.find((a) => a.slug === slug);
  if (!adventure) return {};
  const difficulty = computeDifficulty(getACE(adventure));
  const description = `${adventure.type} in ${adventure.state} · ${difficulty} · ${adventure.duration} days. ${adventure.tagline ?? "Discover this handpicked adventure on Trail to Tides."}`;
  return {
    title: `${adventure.name} — Trail to Tides`,
    description,
    keywords: [
      adventure.name,
      adventure.type,
      adventure.state,
      "adventure India",
      "trekking India",
      difficulty,
      ...(adventure.tags ?? []),
    ],
    openGraph: {
      title: `${adventure.name} — Trail to Tides`,
      description: `${adventure.type} in ${adventure.state} · ${difficulty} · ${adventure.duration} days.`,
      url: `https://trailtotides.com/experiences/${slug}`,
      images: [{ url: adventure.heroImage, width: 1200, height: 630, alt: adventure.name }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${adventure.name} — Trail to Tides`,
      description: `${adventure.type} in ${adventure.state} · ${difficulty} · ${adventure.duration} days.`,
      images: [adventure.heroImage],
    },
    alternates: { canonical: `https://trailtotides.com/experiences/${slug}` },
  };
}

export default async function ExperiencePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  const adventure = adventures.find((a) => a.slug === slug);
  if (!adventure) notFound();

  // Merge approved operator submissions (de-dupe by name)
  const approvedOps = await getApprovedOperatorsForAdventure(slug);
  const existingNames = new Set(adventure.operators.map((o) => o.name.toLowerCase()));
  const newOps = approvedOps.filter((o) => !existingNames.has(o.name.toLowerCase()));
  const allOperators: OperatorCardData[] = [...adventure.operators, ...newOps];

  const PAGE_SIZE = 12;
  const adventureIndex = adventures.findIndex((a) => a.slug === slug);
  const fallbackPage = adventureIndex >= 0 ? Math.ceil((adventureIndex + 1) / PAGE_SIZE) : 1;
  const fromPage = from ? parseInt(from, 10) : null;
  const explorePage = fromPage && fromPage > 0 ? fromPage : fallbackPage;

  const ace = getACE(adventure);
  const difficulty = computeDifficulty(ace);
  const altM = adventure.altitude ? parseFloat(adventure.altitude.replace(/[^0-9.]/g, "")) : 0;
  const showAltitudeWarning = ace.altitude >= 4;
  const showFatalFallWarning = ace.focus >= 5;
  const showExtremeIsolationWarning = ace.nerve >= 5;
  const showTechnicalWarning = ace.strength >= 5 || ace.agility >= 5;
  const showPhysicalExhaustionWarning = ace.stamina >= 5 || ace.power >= 5;
  const showWaterWarning = ace.water >= 4;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  const tripLog = currentUserId ? await loadTripLog() : [];
  const isCompleted = tripLog.some(e => e.slug === adventure.slug);

  const relatedByState = adventures
    .filter((a) => a.id !== adventure.id && a.state === adventure.state)
    .slice(0, 6);
  const relatedByStateIds = new Set(relatedByState.map((a) => a.id));
  const relatedByType = adventures
    .filter((a) => a.id !== adventure.id && a.type === adventure.type && !relatedByStateIds.has(a.id))
    .slice(0, 6);
  const relatedByTypeIds = new Set(relatedByType.map((a) => a.id));

  const firstVerifiedOp = allOperators.find((o) => o.verified);
  const priceFrom = firstVerifiedOp?.priceFrom;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: adventure.name,
      description: adventure.description ?? adventure.tagline ?? `${adventure.type} in ${adventure.state}.`,
      url: `https://trailtotides.com/experiences/${slug}`,
      image: adventure.heroImage,
      touristType: adventure.type,
      geo: {
        "@type": "GeoCoordinates",
        addressCountry: "IN",
        addressRegion: adventure.state,
      },
      additionalProperty: [
        { "@type": "PropertyValue", name: "Duration", value: adventure.durationDays },
        { "@type": "PropertyValue", name: "Difficulty", value: difficulty },
        { "@type": "PropertyValue", name: "Type", value: adventure.type },
        ...(adventure.altitude ? [{ "@type": "PropertyValue", name: "Max Altitude", value: adventure.altitude }] : []),
        ...(adventure.bestSeason ? [{ "@type": "PropertyValue", name: "Best Season", value: adventure.bestSeason }] : []),
      ],
      isAccessibleForFree: false,
      provider: {
        "@type": "Organization",
        name: "Trail to Tides",
        url: "https://trailtotides.com",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: adventure.name,
      description: adventure.tagline ?? adventure.description,
      image: adventure.heroImage,
      url: `https://trailtotides.com/experiences/${slug}`,
      brand: {
        "@type": "Brand",
        name: "Trail to Tides",
      },
      category: adventure.type,
      ...(priceFrom ? {
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: priceFrom.replace(/[^0-9]/g, ""),
          availability: "https://schema.org/InStock",
          url: `https://trailtotides.com/experiences/${slug}`,
          seller: {
            "@type": "Organization",
            name: "Trail to Tides",
          },
        },
      } : {}),
      ...(allOperators.some((o) => o.googleRating) ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: (allOperators.reduce((sum, o) => sum + (o.googleRating ?? 0), 0) / allOperators.filter((o) => o.googleRating).length).toFixed(1),
          reviewCount: allOperators.filter((o) => o.googleRating).length,
          bestRating: 5,
          worstRating: 1,
        },
      } : {}),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MobileBookBar
        adventureName={adventure.name}
        priceFrom={priceFrom}
        difficulty={difficulty}
        duration={adventure.durationDays ?? adventure.duration}
        operatorWebsite={firstVerifiedOp?.website}
        operatorName={firstVerifiedOp?.name}
      />
      <ScrollToTop />
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[560px] max-h-[860px] flex items-end overflow-hidden">
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          priority
          className="object-cover"
          style={{ objectFit: "cover" }}
        />
        {/* Color grade overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff5100]/8 via-transparent to-sky-900/12 mix-blend-multiply pointer-events-none" />
        {/* Gradient fade to page bg */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080c14]/55 to-transparent" />

        {/* Back button */}
        <Link
          href={`/explore?page=${explorePage}&scroll=${slug}`}
          className="absolute top-20 left-5 lg:left-8 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-all text-sm font-medium backdrop-blur-md px-4 py-2 rounded-full"
          style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          All Adventures
        </Link>

        {/* Hero text */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 pb-10 md:pb-16 w-full">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Pill type="type" value={adventure.type} />
              <Pill type="subRegion" value={adventure.state} />
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] mb-4" style={{ color: "#f0ede8" }}>
              {adventure.name}
            </h1>
            <p className="text-white/55 text-sm md:text-lg leading-relaxed max-w-xl font-light">
              {adventure.tagline}
            </p>
          </div>
        </div>

        {/* Top-right: Compare + Save with labels */}
        <HeroActions adventure={adventure} />
      </section>

      {/* ── STATS + WEATHER ZONE ──────────────────────────────── */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>

        {/* Stats strip */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-stretch overflow-x-auto no-scrollbar" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            {[
              { icon: <Clock className="w-3.5 h-3.5 text-[#ff5100]" />, label: "Duration", value: adventure.durationRange ?? adventure.durationDays },
              ...(adventure.distance ? [{ icon: <Route className="w-3.5 h-3.5 text-emerald-400" />, label: "Distance", value: adventure.distanceRange ?? adventure.distance }] : []),
              ...((adventure.altitude || adventure.depth) ? [{ icon: <TrendingUp className="w-3.5 h-3.5 text-sky-400" />, label: adventure.type === "Diving" ? "Max Depth" : "Max Altitude", value: adventure.depth ?? adventure.altitude }] : []),
              { icon: <Sun className="w-3.5 h-3.5 text-amber-400" />, label: "Best Season", value: adventure.bestSeason },
              ...((adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp ? [{ icon: <Flag className="w-3.5 h-3.5 text-violet-400" />, label: "Base Camp", value: adventure.baseCamp }] : []),
              ...(adventure.type === "Motorcycling" && adventure.startingPoint ? [{ icon: <Navigation className="w-3.5 h-3.5 text-emerald-400" />, label: "Starting Point", value: adventure.startingPoint }] : []),
              { icon: <Gauge className="w-3.5 h-3.5 text-rose-400" />, label: "Difficulty", value: difficulty },
            ].map(({ icon, label, value }, i, arr) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-4 lg:px-5 py-3 shrink-0"
                style={i < arr.length - 1 ? { borderRight: "1px solid var(--border-subtle)" } : {}}
              >
                <div className="shrink-0 opacity-80">{icon}</div>
                <div>
                  <div className="text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">{label}</div>
                  <div className="text-white/85 font-medium text-[13px] whitespace-nowrap leading-none">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather strip — sits flush inside same surface */}
        <WeatherWidget
          lat={adventure.lat}
          lng={adventure.lng}
          locationName={adventure.baseCamp ?? adventure.state}
          altitude={adventure.altitude}
        />

      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-7 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2">

            {/* The Adventure */}
            <AccordionSection label="The Adventure" title="About This Adventure" defaultOpen={true}>
              <div className="rounded-xl px-4 py-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-white/65 text-sm leading-relaxed">{adventure.description}</p>
              </div>
            </AccordionSection>

            {/* What Makes It Special */}
            <AccordionSection label="Highlights" title="What Makes It Special" defaultOpen={true}>
              <div className="rounded-xl px-4 py-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-white/65 text-sm leading-relaxed">{adventure.whatMakesSpecial}</p>
              </div>
            </AccordionSection>

            {/* Is This For You? */}
            <AccordionSection label="Suitability" title="Is This For You?" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl p-3.5" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  <h3 className="text-emerald-400 text-[10px] font-bold tracking-[0.18em] uppercase mb-2.5">This is for you if…</h3>
                  <ul className="space-y-1.5">
                    {adventure.whoFor.split("·").map((item) => {
                      const t = item.trim();
                      if (!t) return null;
                      return (
                        <li key={t} className="flex items-start gap-2">
                          <span className="text-emerald-500 shrink-0 text-xs mt-0.5">✓</span>
                          <span className="text-white/55 text-xs leading-snug">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="rounded-xl p-3.5" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
                  <h3 className="text-red-400 text-[10px] font-bold tracking-[0.18em] uppercase mb-2.5">Skip this if…</h3>
                  <ul className="space-y-1.5">
                    {adventure.whoNot.split("·").map((item) => {
                      const t = item.trim();
                      if (!t) return null;
                      return (
                        <li key={t} className="flex items-start gap-2">
                          <span className="text-red-500 shrink-0 text-xs mt-0.5">✕</span>
                          <span className="text-white/55 text-xs leading-snug">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </AccordionSection>

            {/* Safety & Prep */}
            <AccordionSection label="Safety &amp; Prep" title="" defaultOpen={true}>
              <div className="space-y-3">
                {/* Safety notes + hazard badges */}
                <div className="rounded-xl p-3.5" style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.1)" }}>
                  <div className="flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-white/55 text-xs leading-relaxed">{adventure.safetyNotes}</p>
                  </div>
                  {(showAltitudeWarning || showFatalFallWarning || showExtremeIsolationWarning || showTechnicalWarning || showPhysicalExhaustionWarning || showWaterWarning) && (
                    <HazardBadges
                      showAltitude={showAltitudeWarning}
                      showExhaustion={showPhysicalExhaustionWarning}
                      showFatalFall={showFatalFallWarning}
                      showIsolation={showExtremeIsolationWarning}
                      showTechnical={showTechnicalWarning}
                      showWater={showWaterWarning}
                    />
                  )}
                </div>

                {/* Packing list — nested within Safety & Prep */}
                <PackingList
                  adventureType={adventure.type}
                  difficulty={difficulty}
                  altitudeM={altM}
                  bestSeason={adventure.bestSeason}
                  adventureAce={ace}
                  slug={adventure.slug}
                  loggedIn={!!currentUserId}
                />
              </div>
            </AccordionSection>

            {/* ACE Profile */}
            <div className="pt-6">
            <ACEProfileSection
              ace={ace}
              adventureName={adventure.name}
              showAltitudeWarning={showAltitudeWarning}
              showFatalFallWarning={showFatalFallWarning}
              showExtremeIsolationWarning={showExtremeIsolationWarning}
              showTechnicalWarning={showTechnicalWarning}
              showPhysicalExhaustionWarning={showPhysicalExhaustionWarning}
              showWaterWarning={showWaterWarning}
            />
            </div>

            {/* Operators */}
            <div id="book-this-adventure" />
            <AccordionSection label="Book This Adventure" title="" defaultOpen={true}>
              <div id="operators-section" className="space-y-2.5">
                <OperatorsSection operators={allOperators} slug={adventure.slug} />
                <OperatorListingPanel adventureSlug={adventure.slug} adventureName={adventure.name} />
              </div>
            </AccordionSection>

            {/* Community */}
            <div className="pt-6">
              <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-3">Community</p>

              {/* Single login CTA — only when logged out */}
              {!currentUserId && (
                <div
                  className="mb-4 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center gap-3"
                  style={{ background: "linear-gradient(135deg, rgba(255,81,0,0.07) 0%, rgba(255,81,0,0.03) 100%)", border: "1px solid rgba(255,81,0,0.18)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-semibold leading-snug">Join the community</p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">Log in to write reviews, share trail photos, and earn XP.</p>
                  </div>
                  <Link
                    href="/auth/login"
                    className="shrink-0 flex items-center gap-2 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ff5100]/25"
                    style={{ background: "linear-gradient(135deg, #ff5100 0%, #ff7d47 100%)" }}
                  >
                    Log in
                  </Link>
                </div>
              )}

              {/* Two sub-sections side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                {/* Reviews card */}
                <div className="rounded-xl overflow-hidden" style={{ background: "rgba(251,191,36,0.03)", border: "1px solid rgba(251,191,36,0.12)" }}>
                  <ReviewSection slug={adventure.slug} currentUserId={currentUserId} adventureType={adventure.type} adventureName={adventure.name} isCompleted={isCompleted} operators={allOperators} />
                </div>

                {/* Photos card */}
                <div className="rounded-xl overflow-hidden" style={{ background: "rgba(56,189,248,0.03)", border: "1px solid rgba(56,189,248,0.12)" }}>
                  <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(56,189,248,0.08)", background: "rgba(56,189,248,0.04)" }}>
                    <Camera className="w-3.5 h-3.5 text-sky-400" />
                    <h3 className="text-sky-400 text-[10px] font-bold tracking-[0.18em] uppercase">Photos</h3>
                  </div>
                  <div className="p-3">
                    <PhotoGallery slug={adventure.slug} currentUserId={currentUserId} isCompleted={isCompleted} />
                  </div>
                </div>
              </div>
            </div>



            {/* Tags */}
            <div className="pt-4 pb-1">
              <div className="flex flex-wrap gap-2">
                {adventure.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-white/25 text-xs px-3 py-1.5 rounded-full transition-colors hover:text-white/50"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">

            {/* At a Glance */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
                <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase">At a Glance</p>
              </div>
              <div style={{ background: "var(--bg-surface)" }}>
                {[
                  { label: "Type", value: adventure.type },
                  ...((adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp ? [{ label: "Base Camp", value: adventure.baseCamp }] : []),
                  ...(adventure.type === "Motorcycling" && adventure.startingPoint ? [{ label: "Starting Point", value: adventure.startingPoint }] : []),
                  { label: "Duration", value: adventure.durationRange ?? adventure.durationDays },
                  ...((adventure.type === "Trekking" || adventure.type === "Motorcycling")
                    ? [{ label: "Distance", value: adventure.distanceRange ?? adventure.distance ?? "Contact for route" }]
                    : adventure.distance ? [{ label: "Distance", value: adventure.distanceRange ?? adventure.distance }] : []),
                  { label: "Difficulty", value: difficulty },
                  { label: "Best Season", value: adventure.bestSeason },
                  ...(adventure.altitude ? [{ label: "Max Altitude", value: adventure.altitude }] : []),
                  ...(adventure.depth ? [{ label: "Max Depth", value: adventure.depth }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="text-white/30 text-[11px] shrink-0">{label}</span>
                    <span className="text-white/70 text-[11px] text-right leading-snug font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explore links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}
                className="flex items-center justify-center py-2.5 rounded-xl text-white/40 hover:text-white/70 text-[11px] font-medium transition-all hover:bg-white/5"
                style={{ border: "1px solid var(--border-subtle)" }}
              >
                More in {adventure.state}
              </Link>
              <Link
                href={`/explore?type=${encodeURIComponent(adventure.type)}`}
                className="flex items-center justify-center py-2.5 rounded-xl text-white/40 hover:text-white/70 text-[11px] font-medium transition-all hover:bg-white/5"
                style={{ border: "1px solid var(--border-subtle)" }}
              >
                More {adventure.type}
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── YOU MIGHT ALSO LIKE ───────────────────────────────── */}
      {(relatedByState.length > 0 || relatedByType.length > 0) && (
        <section
          className="py-6 px-5 lg:px-8"
          style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="max-w-7xl mx-auto">
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-4">Discover More</p>
            <div className="grid grid-cols-2 gap-4">
              {relatedByState.length > 0 && (
                <div className="p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1rem" }}>
                  <RelatedSection title={`More in ${adventure.state}`} items={relatedByState} exploreHref={`/explore?subRegion=${encodeURIComponent(adventure.state)}`} pillMode="type" />
                </div>
              )}
              {relatedByType.length > 0 && (
                <div className="p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1rem" }}>
                  <RelatedSection title={`More in ${adventure.type}`} items={relatedByType} exploreHref={`/explore?type=${encodeURIComponent(adventure.type)}`} pillMode="region" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <CompareAdventures />
      <SavedAdventuresSection currentSlug={adventure.slug} />
      <Footer />
    </div>
  );
}
