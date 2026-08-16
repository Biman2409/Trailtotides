import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
  Camera,
  Compass,
  BookOpen,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Ticket,
  Target,
  IndianRupee,
  Star,
  HelpCircle,
} from "lucide-react";
import GradingPill from "@/components/ui/custom/GradingPill";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { adventures } from "@/lib/data";
import Pill from "@/components/ui/custom/Pill";
import ACEProfileSection from "./ACEProfileSection";
import HeroActions from "./HeroActions";
import ReviewSection from "@/components/ui/custom/ReviewSection";
import { createClient } from "@/lib/supabase/server";
import { loadTripLog } from "@/app/triplog/actions";
import { getACE, computeDifficulty } from "@/lib/ace";
import type { Adventure } from "@/lib/data";
import { getApprovedOperatorsForAdventure } from "@/app/auth/operator-actions";
import OperatorListingPanel from "./OperatorListingPanel";
import MobileBookBar from "./MobileBookBar";
import FadeInSection from "@/components/ui/custom/FadeInSection";
import AccordionSection from "./AccordionSection";
import WeatherWidget from "./WeatherWidget";
import PhotoGallery from "./PhotoGallery";
import PackingList from "./PackingList";
import HazardBadges from "./HazardBadges";
import TagsList from "@/components/ui/custom/TagsList";
import SidebarLink from "@/components/ui/custom/SidebarLink";
import RecalibrationNudge from "./RecalibrationNudge";
import MedicalCautionNote from "./MedicalCautionNote";
import { deriveMedicalCautions } from "@/lib/medicalCautions";
import type { MedicalFlags } from "@/lib/matchmakerQuestions";
import NearbyAdventuresMap from "./NearbyAdventuresMap";
import BookingSidebarCard from "./BookingSidebarCard";
import { haversineKm } from "@/lib/geo";
import { getSeasonUrgency } from "@/lib/seasonUrgency";
import { parsePrice } from "@/lib/price";
import { getNextDeparture } from "@/lib/nextDeparture";
import FAQSection from "./FAQSection";
import SectionNav from "./SectionNav";

const DIFFICULTY_LEVEL: Record<string, number> = { Easy: 1, Moderate: 2, Hard: 3, Advanced: 4, Extreme: 5 };

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

function RelatedSection({ title, items, exploreHref, pillMode = "type" }: { title: string; items: Adventure[]; exploreHref: string; pillMode?: "type" | "region" }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <h3 className="text-base font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>{title}</h3>
        <Link href={exploreHref} className="hidden md:flex items-center gap-1.5 text-xs font-medium hover:text-[#ff5100] transition-colors group" style={{ color: "var(--text-tertiary)" }}>
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
                    ? <Pill type="type" value={a.type} clickable={false} />
                    : <Pill type="subRegion" value={a.state} clickable={false} />
                  }
                </div>
              </div>
              <div className="p-2.5 h-14 flex flex-col justify-between">
                <h3 className="font-semibold text-xs leading-snug group-hover:text-[#ff5100] transition-colors line-clamp-2" style={{ color: "var(--text-primary)" }}>{a.name}</h3>
                <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{diff}</span>
                  <span style={{ color: "var(--text-muted)" }}>·</span>
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
    title: adventure.name,
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

  // Derived server-side so the user's raw medical flags never reach client
  // JS on a page anyone can view — only these already-computed advisory
  // strings get passed down.
  const medicalFlags = (user?.user_metadata?.ace_medical as MedicalFlags | undefined) ?? null;
  const medicalCautions = deriveMedicalCautions(medicalFlags, adventure);

  const tripLog = currentUserId ? await loadTripLog() : [];
  const isCompleted = tripLog.some(e => e.slug === adventure.slug);

  const relatedByState = adventures
    .filter((a) => a.id !== adventure.id && a.state === adventure.state)
    .slice(0, 6);
  const relatedByStateIds = new Set(relatedByState.map((a) => a.id));
  const relatedByType = adventures
    .filter((a) => a.id !== adventure.id && a.type === adventure.type && !relatedByStateIds.has(a.id))
    .slice(0, 6);

  const nearbyAdventures = adventures
    .filter((a) => a.id !== adventure.id)
    .map((a) => ({ adventure: a, km: haversineKm(adventure.lat, adventure.lng, a.lat, a.lng) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 6)
    .map(({ adventure: a }) => a);

  // Featured operator = cheapest overall, so the price shown up top always
  // matches the operator the primary CTA books with (previously this used
  // the first *verified* operator's price, which could be higher than the
  // true minimum shown further down in the operator comparison table).
  const featuredOp = allOperators.length > 0
    ? allOperators.reduce((best, o) => (parsePrice(o.priceFrom) < parsePrice(best.priceFrom) ? o : best))
    : undefined;
  const priceFrom = featuredOp?.priceFrom;
  const ratedOps = allOperators.filter((o) => o.googleRating);
  const avgRating = ratedOps.length > 0
    ? ratedOps.reduce((sum, o) => sum + (o.googleRating ?? 0), 0) / ratedOps.length
    : null;
  const seasonUrgency = getSeasonUrgency(adventure.bestMonths);
  const nextDeparture = getNextDeparture(allOperators.flatMap((o) => o.departureDates ?? []));

  const currentDifficultyLevel = DIFFICULTY_LEVEL[difficulty] ?? 1;
  const easierAlternatives = currentDifficultyLevel >= 4
    ? nearbyAdventures
        .filter((a) => (DIFFICULTY_LEVEL[computeDifficulty(getACE(a))] ?? 1) < currentDifficultyLevel)
        .slice(0, 2)
    : [];

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
        operatorWebsite={featuredOp?.website}
        operatorName={featuredOp?.name}
        seasonUrgency={seasonUrgency}
        nextDeparture={nextDeparture}
      />
      <ScrollToTop />
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative h-[62vh] min-h-[420px] sm:h-[75vh] sm:min-h-[520px] lg:h-[85vh] lg:min-h-[560px] max-h-[860px] flex items-end overflow-hidden">
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
          className="absolute top-20 left-5 lg:left-8 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-all text-sm font-medium backdrop-blur-md px-3 sm:px-4 py-2 rounded-full"
          style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">All Adventures</span>
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

      <SectionNav />

      {/* ── STATS + WEATHER ZONE ──────────────────────────────── */}
      <FadeInSection as="div" style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>

        {/* Stats strip */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">
          <div className="flex items-stretch overflow-x-auto no-scrollbar" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            {[
              ...(priceFrom ? [{ icon: <IndianRupee className="w-3.5 h-3.5 text-[#ff5100]" />, label: "From", value: priceFrom }] : []),
              ...(avgRating !== null ? [{ icon: <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />, label: "Rating", value: `${avgRating.toFixed(1)} / 5` }] : []),
              { icon: <Clock className="w-3.5 h-3.5 text-[#ff5100]" />, label: "Duration", value: adventure.durationRange ?? adventure.durationDays },
              { icon: <Compass className="w-3.5 h-3.5 text-fuchsia-400" />, label: "Type", value: adventure.type },
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
                  <div className="text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1" style={{ color: "var(--text-tertiary)" }}>{label}</div>
                  <div className="font-medium text-[13px] whitespace-nowrap leading-none" style={{ color: "var(--text-primary)" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Scroll hint — the strip overflows on mobile/tablet with no other affordance */}
          <div className="lg:hidden pointer-events-none absolute top-0 right-5 bottom-0 w-10" style={{ background: "linear-gradient(to right, transparent, var(--bg-surface))" }} />
        </div>

        {/* Weather strip — sits flush inside same surface */}
        <WeatherWidget
          lat={adventure.lat}
          lng={adventure.lng}
          locationName={adventure.baseCamp ?? adventure.startingPoint ?? adventure.state}
          altitude={adventure.altitude}
          isBaseCamp={!!(adventure.baseCamp || adventure.startingPoint)}
        />

      </FadeInSection>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <FadeInSection as="div" className="max-w-7xl mx-auto px-5 lg:px-8 pt-7 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2">

            {/* The Adventure + What Makes It Special — a matched pair, side by side on desktop */}
            <div id="overview" className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 pt-6 first:pt-0 scroll-mt-24">
              <AccordionSection
                label="The Adventure" title="About This Adventure" defaultOpen
                icon={<BookOpen className="w-4 h-4" />} tintRgb="148,163,184" noDivider noTopPad stretch
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{adventure.description}</p>
              </AccordionSection>

              <AccordionSection
                label="Highlights" title="What Makes It Special" defaultOpen
                icon={<Sparkles className="w-4 h-4" />} tintRgb="148,163,184" noDivider noTopPad stretch
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{adventure.whatMakesSpecial}</p>
              </AccordionSection>
            </div>
            <div className="h-px mt-6" style={{ background: "rgba(255,255,255,0.05)" }} />

            {/* Is This For You? */}
            <AccordionSection
              id="suitability"
              label="Suitability" title="Is This For You?" defaultOpen
              icon={<ShieldCheck className="w-4 h-4" />} tintRgb="148,163,184"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl p-3.5" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  <h3 className="text-emerald-400 text-[10px] font-bold tracking-[0.18em] uppercase mb-2.5">This is for you if…</h3>
                  <ul className="space-y-1.5">
                    {adventure.whoFor.split("·").map((item) => {
                      const t = item.trim();
                      if (!t) return null;
                      return (
                        <li key={t} className="flex items-start gap-2">
                          <span className="text-emerald-500 shrink-0 text-xs mt-0.5">✓</span>
                          <span className="text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
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
                          <span className="text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Too intense? Surface easier nearby alternatives instead of only at the very bottom of the page */}
              {easierAlternatives.length > 0 && (
                <div className="mt-3 rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-2.5" style={{ color: "var(--text-tertiary)" }}>Want something a bit easier?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {easierAlternatives.map((a) => {
                      const aDiff = computeDifficulty(getACE(a));
                      return (
                        <Link
                          key={a.id}
                          href={`/experiences/${a.slug}`}
                          className="flex items-center gap-2.5 p-2 rounded-lg transition-colors hover:bg-white/[0.04]"
                          style={{ border: "1px solid var(--border-subtle)" }}
                        >
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0">
                            <Image src={a.heroImage} alt={a.name} fill className="object-cover" style={{ objectFit: "cover" }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{a.name}</p>
                            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{aDiff} · {a.type}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </AccordionSection>

            {/* Capability Profile — below Suitability; its radar + domain matrix need full width to read well */}
            <AccordionSection
              label="Capability Profile" title="How Do You Measure Up?" defaultOpen={false}
              icon={<Target className="w-4 h-4" />} tintRgb="148,163,184"
              headerExtra={<GradingPill />}
            >
              <ACEProfileSection
                bare
                ace={ace}
                adventureName={adventure.name}
                showAltitudeWarning={showAltitudeWarning}
                showFatalFallWarning={showFatalFallWarning}
                showExtremeIsolationWarning={showExtremeIsolationWarning}
                showTechnicalWarning={showTechnicalWarning}
                showPhysicalExhaustionWarning={showPhysicalExhaustionWarning}
                showWaterWarning={showWaterWarning}
              />
            </AccordionSection>

            {/* Safety & Prep */}
            <AccordionSection
              id="safety"
              label="Safety &amp; Prep" title="What to Know Before You Go" defaultOpen={false}
              icon={<ShieldAlert className="w-4 h-4" />} tintRgb="245,158,11"
            >
              <div className="space-y-3">
                {/* Safety notes + hazard badges */}
                <div className="rounded-xl p-3.5" style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.1)" }}>
                  <div className="flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{adventure.safetyNotes}</p>
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
                  <MedicalCautionNote notes={medicalCautions} />
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

            {/* FAQ */}
            <AccordionSection
              label="FAQ" title="Common Questions" defaultOpen={false}
              icon={<HelpCircle className="w-4 h-4" />} tintRgb="148,163,184"
            >
              <FAQSection adventure={adventure} difficulty={difficulty} operatorCount={allOperators.length} />
            </AccordionSection>

            {/* Operators */}
            <RecalibrationNudge difficulty={difficulty} />
            <div id="book-this-adventure" />
            <AccordionSection
              label="Book This Adventure" title="Where to Book" defaultOpen
              icon={<Ticket className="w-4 h-4" />} tintRgb="255,81,0"
            >
              <div id="operators-section" className="space-y-2.5">
                <OperatorsSection operators={allOperators} slug={adventure.slug} />
                <OperatorListingPanel adventureSlug={adventure.slug} adventureName={adventure.name} />
              </div>
            </AccordionSection>

            {/* Community */}
            <div id="community" className="pt-6 scroll-mt-24">
              <h2 className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-3">Community</h2>

              {/* Single login CTA — only when logged out */}
              {!currentUserId && (
                <div
                  className="mb-4 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center gap-3"
                  style={{ background: "linear-gradient(135deg, rgba(255,81,0,0.07) 0%, rgba(255,81,0,0.03) 100%)", border: "1px solid rgba(255,81,0,0.18)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>Join the community</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>Log in to write reviews, share trail photos, and earn XP.</p>
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
              <TagsList tags={adventure.tags} />
            </div>
          </div>

          {/* ── RIGHT SIDEBAR — desktop-only; its contents duplicate the mobile stats strip and Discover More section ── */}
          <div className="hidden lg:block space-y-3 lg:sticky lg:top-24 lg:self-start">

            {/* Book Now */}
            <BookingSidebarCard
              priceFrom={priceFrom}
              operatorCount={allOperators.length}
              avgRating={avgRating}
              operatorWebsite={featuredOp?.website}
              operatorName={featuredOp?.name}
              hasVerifiedOperator={!!featuredOp?.verified}
              seasonUrgency={seasonUrgency}
              nextDeparture={nextDeparture}
            />


            {/* Nearby adventures map */}
            {nearbyAdventures.length > 0 && (
              <NearbyAdventuresMap current={adventure} nearby={nearbyAdventures} />
            )}

            {/* Explore links */}
            <div className="grid grid-cols-2 gap-2">
              <SidebarLink href={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}>
                More in {adventure.state}
              </SidebarLink>
              <SidebarLink href={`/explore?type=${encodeURIComponent(adventure.type)}`}>
                More in {adventure.type}
              </SidebarLink>
            </div>

          </div>
        </div>
      </FadeInSection>

      {/* ── YOU MIGHT ALSO LIKE ───────────────────────────────── */}
      {(relatedByState.length > 0 || relatedByType.length > 0) && (
        <section
          className="py-6 px-5 lg:px-8"
          style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}
        >
          <FadeInSection>
          <div className="max-w-7xl mx-auto">
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-4">Discover More</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedByState.length > 0 && (
                <div className="p-4 rounded-2xl" style={{ background: "rgba(148,163,184,0.025)", border: "1px solid rgba(148,163,184,0.18)" }}>
                  <RelatedSection title={`More in ${adventure.state}`} items={relatedByState} exploreHref={`/explore?subRegion=${encodeURIComponent(adventure.state)}`} pillMode="type" />
                </div>
              )}
              {relatedByType.length > 0 && (
                <div className="p-4 rounded-2xl" style={{ background: "rgba(148,163,184,0.025)", border: "1px solid rgba(148,163,184,0.18)" }}>
                  <RelatedSection title={`More in ${adventure.type}`} items={relatedByType} exploreHref={`/explore?type=${encodeURIComponent(adventure.type)}`} pillMode="region" />
                </div>
              )}
            </div>
          </div>
          </FadeInSection>
        </section>
      )}

      <Footer />
    </div>
  );
}
