import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { type OperatorCardData } from "./OperatorCard";
import OperatorsSection from "./OperatorsSection";
import { QUOTE_REQUESTS } from "@/lib/features";
import { ChevronLeft, ArrowRight, Star } from "lucide-react";
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
import StatsStrip from "./StatsStrip";
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
import { destinationFor, lowestPrice, altitudeOf, inr } from "@/lib/destinations";
import { breadcrumbStructuredData } from "@/components/ui/custom/Breadcrumbs";
import TrainForThis from "./TrainForThis";
import { getSeasonUrgency } from "@/lib/seasonUrgency";
import { parsePrice } from "@/lib/price";
import { getNextDeparture } from "@/lib/nextDeparture";
import SectionNav from "./SectionNav";

// The page's body copy is small and calm, so its secondary and tertiary tones are
// raised (from 60% / 35% of the text colour) to keep it easy to read in both themes
const READABLE_TONES = {
  "--text-secondary": "color-mix(in srgb, var(--text-primary) 80%, transparent)",
  "--text-tertiary": "color-mix(in srgb, var(--text-primary) 58%, transparent)",
} as CSSProperties;

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
  // What people search for an adventure: how hard, how long, how high, when, how much
  const price = lowestPrice(adventure);
  // Height only matters up high (not for a river run at 380m)
  const altitude = parseInt(altitudeOf(adventure).replace(/,/g, ""), 10) >= 1000 ? altitudeOf(adventure) : "";
  // "Verified" only when we've actually verified one of the operators
  const anyVerified = adventure.operators.some((o) => o.verified);
  const description = [
    `${adventure.name}, ${adventure.state}: ${difficulty.toLowerCase()}, ${adventure.durationDays}`,
    altitude ? `, up to ${altitude}` : "",
    adventure.bestSeason ? `. Best ${adventure.bestSeason}` : "",
    price ? `. From ${inr(price)} with ${anyVerified ? "verified" : "local"} operators` : "",
    ". Compare and book, matched to your fitness.",
  ].join("");
  return {
    title: `${adventure.name}: Difficulty, Cost & Best Time`,
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
      description,
      url: `https://www.trailtotides.com/experiences/${slug}`,
      images: [{ url: adventure.heroImage, width: 1200, height: 630, alt: adventure.name }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${adventure.name} — Trail to Tides`,
      description,
      images: [adventure.heroImage],
    },
    alternates: { canonical: `https://www.trailtotides.com/experiences/${slug}` },
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


  const destination = destinationFor(adventure);
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
      content: <RelatedRow items={relatedByState} pillMode="type" exploreHref={destination ? `/destinations/${destination.slug}` : `/explore?subRegion=${encodeURIComponent(adventure.state)}`} exploreLabel={`All of ${destination?.name ?? adventure.state}`} />,
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

  // Structured data needs full URLs; some heroes live in /public
  const absoluteImage = adventure.heroImage.startsWith("/") ? `https://www.trailtotides.com${adventure.heroImage}` : adventure.heroImage;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: adventure.name,
      description: stripEmphasis(adventure.description ?? adventure.tagline ?? `${adventure.type} in ${adventure.state}.`),
      url: `https://www.trailtotides.com/experiences/${slug}`,
      image: absoluteImage,
      touristType: adventure.type,
      geo: {
        "@type": "GeoCoordinates",
        latitude: adventure.lat,
        longitude: adventure.lng,
      },
      address: {
        "@type": "PostalAddress",
        addressRegion: adventure.state,
        addressCountry: adventure.state === "Nepal" ? "NP" : "IN",
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
        url: "https://www.trailtotides.com",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: adventure.name,
      description: adventure.tagline ?? stripEmphasis(adventure.description),
      image: absoluteImage,
      url: `https://www.trailtotides.com/experiences/${slug}`,
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
          url: `https://www.trailtotides.com/experiences/${slug}`,
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
    breadcrumbStructuredData(destination
      ? [{ label: "Destinations", href: "/destinations" }, { label: destination.name, href: `/destinations/${destination.slug}` }, { label: adventure.name, href: `/experiences/${slug}` }]
      : [{ label: "Explore", href: "/explore" }, { label: adventure.name, href: `/experiences/${slug}` }]),
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
      <section className="relative h-[44vh] min-h-[320px] sm:h-[48vh] lg:h-[50vh] lg:min-h-[400px] max-h-[520px] flex items-end overflow-hidden">
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          priority
          className="object-cover"
          style={{ objectFit: "cover" }}
        />
        {/* A quiet fade at the bottom for the title; the photo stays untinted above it */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />

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
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 pb-6 md:pb-8 w-full">
          <div className="max-w-3xl">
            <p className="text-[12px] tracking-[0.12em] lowercase mb-2 text-white/80" style={{ fontVariant: "small-caps" }}>
              {adventure.type} · {adventure.state}
            </p>
            <h1 className="text-[32px] sm:text-[44px] lg:text-[52px] !font-normal tracking-[-0.025em] leading-[1.02] mb-2" style={{ color: "#f7f3ee" }}>
              {(() => {
                // The traveller rating sits as a superscript after the last word,
                // kept on the same line as it so it never wraps on its own
                const words = adventure.name.split(" ");
                const last = words.pop();
                return (
                  <>
                    {words.length > 0 && <>{words.join(" ")} </>}
                    <span className="whitespace-nowrap">
                      {last}
                      {travellerRating && (
                        <a
                          href="#community"
                          aria-label={`Rated ${travellerRating.avg.toFixed(1)} out of 5 from ${travellerRating.count} traveller review${travellerRating.count !== 1 ? "s" : ""}`}
                          title={`${travellerRating.count} traveller review${travellerRating.count !== 1 ? "s" : ""}`}
                          className="relative -top-[1.05em] ml-1.5 sm:ml-2.5 inline-flex items-center gap-1 align-baseline font-sans text-xs sm:text-sm md:text-base font-medium tracking-normal text-white/85 hover:text-white transition-colors"
                        >
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-[#ff8a4c] fill-[#ff8a4c]" />
                          {travellerRating.avg.toFixed(1)}
                        </a>
                      )}
                    </span>
                  </>
                );
              })()}
            </h1>
            <p className="text-white/85 text-[14px] md:text-[16px] leading-relaxed max-w-xl">
              {adventure.tagline}
            </p>
          </div>
        </div>

        {/* Top-right: Compare + Save with labels */}
        <HeroActions adventure={adventure} />
      </section>

      <SectionNav />

      {/* Everything below the hero sits on the same topographic texture as the home page */}
      <div className="topo">

        {/* ── STATS + WEATHER ZONE ──────────────────────────────── */}
        <FadeInSection as="div" className="pt-3" style={READABLE_TONES}>

          {/* Stats strip — trek facts only, plus live weather. Price lives in the
              booking card / mobile bar and the operator section; type is in the
              hero; operator ratings live in the operator section. */}
          <StatsStrip
            weather={{
              lat: adventure.lat,
              lng: adventure.lng,
              locationName: adventure.baseCamp ?? adventure.startingPoint ?? adventure.state,
              altitude: adventure.altitude,
              isBaseCamp: !!(adventure.baseCamp || adventure.startingPoint),
            }}
            stats={[
                { label: "Duration", value: adventure.durationRange ?? adventure.durationDays },
                ...(adventure.distance ? [{ label: "Distance", value: adventure.distanceRange ?? adventure.distance }] : []),
                ...((adventure.altitude || adventure.depth) ? [{ label: adventure.type === "Diving" ? "Max Depth" : "Max Altitude", value: adventure.depth ?? adventure.altitude }] : []),
                { label: "Best Season", value: adventure.bestSeason },
                ...((adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp ? [{ label: "Base Camp", value: adventure.baseCamp }] : []),
                ...(adventure.type === "Motorcycling" && adventure.startingPoint ? [{ label: "Starting Point", value: adventure.startingPoint }] : []),
                { label: "Difficulty", value: difficulty },
            ]}
          />

        </FadeInSection>

        {/* ── MAIN CONTENT ──────────────────────────────────────── */}
        <FadeInSection as="div" className="max-w-7xl mx-auto px-5 lg:px-8 pt-5 sm:pt-6 pb-10" style={READABLE_TONES}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* ── LEFT COLUMN — chapters on a trail line ── */}
            <div className="lg:col-span-2 relative pl-8 sm:pl-10">
              {/* The trail: one thin orange line running through every section's dot */}
              <span
                aria-hidden
                className="absolute left-[7px] sm:left-[11px] top-2 bottom-10 w-px"
                style={{ background: "linear-gradient(to bottom, #ff5100 0%, rgba(255,81,0,0.45) 60%, rgba(255,81,0,0) 100%)" }}
              />

              {/* Overview — one paragraph; what makes the adventure special is
                  highlighted in place rather than repeated in a section of its own */}
              <AccordionSection id="overview" label="the adventure" title="Overview" defaultOpen>
                <p className="text-[14px] leading-[1.6] max-w-[70ch]" style={{ color: "var(--text-secondary)" }}>
                  <Emphasis
                    text={adventure.description}
                    className="font-medium [color:var(--text-primary)] box-decoration-clone bg-[linear-gradient(transparent_64%,rgba(255,81,0,0.18)_64%)]"
                  />
                </p>
              </AccordionSection>

              {/* Safety & Prep — before suitability and booking, and open, so people
                  see the risks before choosing who to go with */}
              <AccordionSection id="safety" label="safety and prep" title="What to know before you go" defaultOpen>
                <div className="space-y-3">
                  <div className="max-w-[66ch]">
                    <p className="text-[14px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>{adventure.safetyNotes}</p>
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
                  both answering the same question from two angles */}
              <AccordionSection id="suitability" label="suitability" title="Is this for you?" defaultOpen headerExtra={<GradingPill />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {([
                    { heading: "for you if", items: adventure.whoFor, mark: "✓", markColor: "#3fa877" },
                    { heading: "skip it if", items: adventure.whoNot, mark: "✕", markColor: "#d4675a" },
                  ]).map(({ heading, items, mark, markColor }) => (
                    <div key={heading}>
                      <h3 className="text-[13px] tracking-[0.1em] !font-normal mb-2" style={{ color: "var(--text-tertiary)", fontVariant: "small-caps" }}>{heading}</h3>
                      <ul className="space-y-1">
                        {items.split("·").map((item) => {
                          const t = item.trim();
                          if (!t) return null;
                          return (
                            <li key={t} className="flex items-start gap-3">
                              <span className="shrink-0 text-[12px] leading-[1.75]" style={{ color: markColor }} aria-hidden>{mark}</span>
                              <span className="text-[14px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Too intense? A hint that opens the Easier tab of Similar Adventures */}
                {easierAlternatives.length > 0 && (
                  <a href="#easier" className="mt-3 inline-flex items-center gap-1.5 text-sm hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-tertiary)" }}>
                    Too much? See easier {adventure.type.toLowerCase()} nearby
                    <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                  </a>
                )}

                {/* Capability Profile — supporting detail below the quick-skim lists */}
                <div className="mt-5">
                  <h3 className="text-[13px] tracking-[0.1em] !font-normal mb-3" style={{ color: "var(--text-tertiary)", fontVariant: "small-caps" }}>how do you measure up</h3>
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
              <div className="pt-4"><RecalibrationNudge difficulty={difficulty} /></div>
              <div id="book-this-adventure" className="scroll-mt-32" />
              <AccordionSection label="book this adventure" title="Where to book" defaultOpen>
                <div id="operators-section" className="space-y-4">
                  <OperatorsSection operators={allOperators} slug={adventure.slug} />
                  <OperatorListingPanel adventureSlug={adventure.slug} adventureName={adventure.name} />
                </div>
              </AccordionSection>

              {/* Community */}
              <AccordionSection id="community" label="community" title="Traveller reviews" defaultOpen>
                <CommunityCards
                  slug={adventure.slug}
                  currentUserId={currentUserId}
                  reviews={<ReviewSection slug={adventure.slug} currentUserId={currentUserId} adventureType={adventure.type} adventureName={adventure.name} operators={allOperators} />}
                />
              </AccordionSection>

              {/* Tags */}
              <div className="pt-4 pb-1">
                <TagsList tags={adventure.tags} />
              </div>
            </div>

            {/* ── RIGHT SIDEBAR — desktop-only: booking and the nearby map ── */}
            <div className="hidden lg:block space-y-3 lg:sticky lg:top-28 lg:self-start">

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
          <div className="pt-0 pb-8 px-5 lg:px-8" style={READABLE_TONES}>
            <div className="max-w-7xl mx-auto">
              <SimilarTabs tabs={similarTabs} />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
