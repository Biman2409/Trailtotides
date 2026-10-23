import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { type OperatorCardData } from "./OperatorCard";
import OperatorsSection from "./OperatorsSection";
import { QUOTE_REQUESTS } from "@/lib/features";
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
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Ticket,
  IndianRupee,
  Star,
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
import { getACE, computeDifficulty } from "@/lib/ace";
import type { Adventure } from "@/lib/data";
import { getApprovedOperatorsForAdventure } from "@/app/auth/operator-actions";
import OperatorListingPanel from "./OperatorListingPanel";
import MobileBookBar from "./MobileBookBar";
import FadeInSection from "@/components/ui/custom/FadeInSection";
import AccordionSection from "./AccordionSection";
import WeatherWidget from "./WeatherWidget";
import CommunityCards from "./CommunityCards";
import PackingList from "./PackingList";
import HazardBadges from "./HazardBadges";
import TagsList from "@/components/ui/custom/TagsList";
import SimilarTabs from "./SimilarTabs";
import { Emphasis, stripEmphasis } from "@/lib/emphasis";
import RecalibrationNudge from "./RecalibrationNudge";
import MedicalCautionNote from "./MedicalCautionNote";
import { deriveMedicalCautions } from "@/lib/medicalCautions";
import type { MedicalFlags } from "@/lib/matchmakerQuestions";
import NearbyAdventuresMap from "./NearbyAdventuresMap";
import BookingSidebarCard from "./BookingSidebarCard";
import { haversineKm } from "@/lib/geo";
import TrainForThis from "./TrainForThis";
import { getSeasonUrgency } from "@/lib/seasonUrgency";
import { parsePrice } from "@/lib/price";
import { getNextDeparture } from "@/lib/nextDeparture";
import SectionNav from "./SectionNav";

const DIFFICULTY_LEVEL: Record<string, number> = { Easy: 1, Moderate: 2, Hard: 3, Advanced: 4, Extreme: 5 };
// Easier-alternative suggestions: furthest we'll look, and how many km of extra
// travel one additional difficulty tier dropped is "worth" when ranking.
const EASIER_MAX_KM = 1000;
const EASIER_TIER_KM = 400;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

// One tab's worth of cards in the Similar Adventures row
function RelatedRow({ items, exploreHref, exploreLabel, pillMode = "type", meta }: { items: Adventure[]; exploreHref?: string; exploreLabel?: string; pillMode?: "type" | "region"; meta?: (a: Adventure) => string }) {
  return (
    <div>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2 snap-x snap-mandatory no-scrollbar">
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
                  <span>{meta ? meta(a) : a.durationDays}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {exploreHref && (
        <Link href={exploreHref} className="inline-flex items-center gap-1.5 text-xs font-medium hover:text-[#ff5100] transition-colors group" style={{ color: "var(--text-tertiary)" }}>
          {exploreLabel ?? "Explore all"}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
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

  // The trek's own rating: traveller reviews, the same set the Reviews card
  // shows (real ones plus seed reviews, de-duped by id)
  const seedReviews = adventure.seedReviews ?? [];
  const { data: dbReviews } = await supabase.from("reviews").select("id, rating").eq("adventure_slug", slug);
  const dbReviewIds = new Set((dbReviews ?? []).map((r) => r.id));
  const reviewRatings = [
    ...(dbReviews ?? []).map((r) => r.rating as number),
    ...seedReviews.filter((r) => !dbReviewIds.has(r.id)).map((r) => r.rating),
  ];
  const travellerRating = reviewRatings.length > 0
    ? { avg: reviewRatings.reduce((a, b) => a + b, 0) / reviewRatings.length, count: reviewRatings.length }
    : null;


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
  const seasonUrgency = getSeasonUrgency(adventure.bestMonths);
  const nextDeparture = getNextDeparture(allOperators.flatMap((o) => o.departureDates ?? []));

  const currentDifficultyLevel = DIFFICULTY_LEVEL[difficulty] ?? 1;
  // "A bit easier" = the same activity, a lower difficulty tier, reachable from
  // roughly the same base. A different activity (trek → bike ride) isn't a real
  // alternative, so it's excluded. Ranking weighs each extra tier dropped like
  // ~400 km of extra travel, so a one-step-easier trek next door beats both a
  // much easier one and a one-step-easier one across the country.
  const easierAlternatives = currentDifficultyLevel >= 3
    ? adventures
        .filter((a) => a.id !== adventure.id && a.type === adventure.type)
        .map((a) => {
          const aDifficulty = computeDifficulty(getACE(a));
          return {
            adventure: a,
            difficulty: aDifficulty,
            level: DIFFICULTY_LEVEL[aDifficulty] ?? 1,
            km: haversineKm(adventure.lat, adventure.lng, a.lat, a.lng),
          };
        })
        .filter((c) => c.level < currentDifficultyLevel && c.km <= EASIER_MAX_KM)
        .sort((x, y) =>
          ((currentDifficultyLevel - x.level - 1) * EASIER_TIER_KM + x.km) -
          ((currentDifficultyLevel - y.level - 1) * EASIER_TIER_KM + y.km)
        )
        .slice(0, 6)
    : [];
  const easierKm = new Map(easierAlternatives.map((e) => [e.adventure.id, e.km]));

  // Easier goes last: it's often a single card, and the "see easier" hint in
  // Is This For You? opens it directly anyway
  const similarTabs = [
    ...(relatedByState.length > 0 ? [{
      key: "state", label: `In ${adventure.state}`,
      content: <RelatedRow items={relatedByState} pillMode="type" exploreHref={`/explore?subRegion=${encodeURIComponent(adventure.state)}`} exploreLabel={`All of ${adventure.state}`} />,
    }] : []),
    ...(relatedByType.length > 0 ? [{
      key: "type", label: `More ${adventure.type}`,
      content: <RelatedRow items={relatedByType} pillMode="region" exploreHref={`/explore?type=${encodeURIComponent(adventure.type)}`} exploreLabel={`All ${adventure.type}`} />,
    }] : []),
    ...(easierAlternatives.length > 0 ? [{
      key: "easier", label: "Easier",
      content: <RelatedRow items={easierAlternatives.map((e) => e.adventure)} pillMode="region" meta={(a) => `${Math.round(easierKm.get(a.id) ?? 0)} km away`} />,
    }] : []),
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: adventure.name,
      description: stripEmphasis(adventure.description ?? adventure.tagline ?? `${adventure.type} in ${adventure.state}.`),
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
      description: adventure.tagline ?? stripEmphasis(adventure.description),
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
      // No aggregateRating: the only ratings we have are operators' Google
      // ratings (not this trek's) and seed reviews (not real), and Google's
      // review-snippet rules allow neither. Add it back from real traveller
      // reviews once there are enough of them.
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
        operatorCount={allOperators.length}
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c0b] via-[#0e0c0b]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e0c0b]/55 to-transparent" />

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
            {travellerRating && (
              <a
                href="#community"
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white backdrop-blur-md transition-colors"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.14)" }}
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-semibold">{travellerRating.avg.toFixed(1)}</span>
                <span className="text-white/55">· {travellerRating.count} traveller review{travellerRating.count !== 1 ? "s" : ""}</span>
              </a>
            )}
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
            {/* Trek facts only. Price shows here on mobile alone (desktop has the
                booking card beside it); type is in the hero; operator ratings
                live in the operator section, not next to the trek's facts. */}
            {([
              ...(priceFrom ? [{ icon: <IndianRupee className="w-3.5 h-3.5 text-[#ff5100]" />, label: "From", value: priceFrom, mobileOnly: true }] : []),
              { icon: <Clock className="w-3.5 h-3.5 text-[#ff5100]" />, label: "Duration", value: adventure.durationRange ?? adventure.durationDays },
              ...(adventure.distance ? [{ icon: <Route className="w-3.5 h-3.5 text-emerald-400" />, label: "Distance", value: adventure.distanceRange ?? adventure.distance }] : []),
              ...((adventure.altitude || adventure.depth) ? [{ icon: <TrendingUp className="w-3.5 h-3.5 text-sky-400" />, label: adventure.type === "Diving" ? "Max Depth" : "Max Altitude", value: adventure.depth ?? adventure.altitude }] : []),
              { icon: <Sun className="w-3.5 h-3.5 text-amber-400" />, label: "Best Season", value: adventure.bestSeason },
              ...((adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp ? [{ icon: <Flag className="w-3.5 h-3.5 text-violet-400" />, label: "Base Camp", value: adventure.baseCamp }] : []),
              ...(adventure.type === "Motorcycling" && adventure.startingPoint ? [{ icon: <Navigation className="w-3.5 h-3.5 text-emerald-400" />, label: "Starting Point", value: adventure.startingPoint }] : []),
              { icon: <Gauge className="w-3.5 h-3.5 text-rose-400" />, label: "Difficulty", value: difficulty },
            ] as { icon: ReactNode; label: string; value: ReactNode; mobileOnly?: boolean }[]).map(({ icon, label, value, mobileOnly }, i, arr) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 px-4 lg:px-5 py-3 shrink-0 ${mobileOnly ? "lg:hidden" : ""}`}
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

            {/* Overview — one paragraph; what makes the adventure special is
                highlighted in place rather than repeated in a section of its own */}
            <div id="overview" className="pt-6 first:pt-0 scroll-mt-24">
              <AccordionSection
                label="The Adventure" title="Overview" defaultOpen
                icon={<BookOpen className="w-4 h-4" />} tintRgb="56,189,248" noDivider noTopPad
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  <Emphasis
                    text={adventure.description}
                    className="font-semibold [color:var(--text-primary)] box-decoration-clone bg-[linear-gradient(transparent_62%,rgba(255,81,0,0.2)_62%)]"
                  />
                </p>
              </AccordionSection>
            </div>
            <div className="h-px mt-6" style={{ background: "rgba(var(--fg-rgb),0.08)" }} />

            {/* Safety & Prep — before suitability and booking, and open, so people
                see the risks before choosing who to go with */}
            <AccordionSection
              id="safety"
              label="Safety &amp; Prep" title="What to Know Before You Go" defaultOpen
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

            {/* Is This For You? — fit/skip lists plus the Capability Profile radar,
                merged since they both answer the same underlying question from
                two different angles (quick-skim list vs. data-driven comparison) */}
            <AccordionSection
              id="suitability"
              label="Suitability" title="Is This For You?" defaultOpen
              icon={<ShieldCheck className="w-4 h-4" />} tintRgb="129,140,248"
              headerExtra={<GradingPill />}
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

              {/* Too intense? A hint that opens the Easier tab of Similar Adventures */}
              {easierAlternatives.length > 0 && (
                <a href="#easier" className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-tertiary)" }}>
                  Too much? See easier {adventure.type.toLowerCase()} nearby
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </a>
              )}

              {/* Capability Profile — supporting detail below the quick-skim lists above */}
              <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-tertiary)" }}>How Do You Measure Up?</p>
                <ACEProfileSection
                  bare
                  ace={ace}
                  slug={adventure.slug}
                  showAltitudeWarning={showAltitudeWarning}
                  showFatalFallWarning={showFatalFallWarning}
                  showExtremeIsolationWarning={showExtremeIsolationWarning}
                  showTechnicalWarning={showTechnicalWarning}
                  showPhysicalExhaustionWarning={showPhysicalExhaustionWarning}
                  showWaterWarning={showWaterWarning}
                />
                {/* Personal readiness + training gaps (only shows with a Matchmaker profile) */}
                <TrainForThis slug={adventure.slug} />
              </div>
            </AccordionSection>

            {/* Operators */}
            <RecalibrationNudge difficulty={difficulty} />
            <div id="book-this-adventure" />
            <AccordionSection
              label="Book This Adventure" title="Where to Book" defaultOpen mobileDefaultOpen={false}
              icon={<Ticket className="w-4 h-4" />} tintRgb="34,197,94"
            >
              <div id="operators-section" className="space-y-2.5">
                <OperatorsSection operators={allOperators} slug={adventure.slug} />
                {/* Stands in for the old generic FAQ: inclusions, cancellation and
                    booking were all "ask the operator" anyway */}
                {allOperators.length > 0 && (
                  <p className="px-1 text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                    Trail to Tides doesn&apos;t take payments. Inclusions, cancellation terms and payment are set by each operator, so confirm them before you book.
                  </p>
                )}
                <OperatorListingPanel adventureSlug={adventure.slug} adventureName={adventure.name} />
              </div>
            </AccordionSection>

            {/* Community */}
            <div id="community" className="pt-6 scroll-mt-24">
              <h2 className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-3">Community</h2>

              <CommunityCards
                slug={adventure.slug}
                currentUserId={currentUserId}
                reviews={<ReviewSection slug={adventure.slug} currentUserId={currentUserId} adventureType={adventure.type} adventureName={adventure.name} operators={allOperators} />}
              />
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
              operatorWebsite={featuredOp?.website}
              operatorName={featuredOp?.name}
              hasVerifiedOperator={!!featuredOp?.verified}
              seasonUrgency={seasonUrgency}
              nextDeparture={nextDeparture}
              quote={QUOTE_REQUESTS ? { slug: adventure.slug, name: adventure.name, operators: adventure.operators.filter((o) => o.verified).map((o) => o.name) } : undefined}
            />

            {/* Nearby adventures map */}
            {nearbyAdventures.length > 0 && (
              <NearbyAdventuresMap current={adventure} nearby={nearbyAdventures} />
            )}

          </div>
        </div>
      </FadeInSection>

      {/* ── SIMILAR ADVENTURES ────────────────────────────────── */}
      {similarTabs.length > 0 && (
        <div
          className="py-6 px-5 lg:px-8"
          style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="max-w-7xl mx-auto">
            <SimilarTabs tabs={similarTabs} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
