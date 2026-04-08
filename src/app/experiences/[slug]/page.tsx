import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import OperatorButton from "./OperatorButton";
import OperatorCard, { type OperatorCardData } from "./OperatorCard";
import {
  Clock,
  TrendingUp,
  Sun,
  ShieldCheck,
  ChevronLeft,
  AlertTriangle,
  ArrowRight,
  Route,
  BadgeCheck,
  Flag,
  Navigation,
  Gauge,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { adventures } from "@/lib/data";
import Pill from "@/components/ui/custom/Pill";
import ACEProfileSection from "./ACEProfileSection";
import VerifyDropdown from "./VerifyDropdown";
import CompareCTA from "./CompareCTA";
import CompareAdventures from "@/components/ui/custom/CompareAdventures";
import SavedAdventuresSection from "@/components/ui/custom/SavedAdventuresSection";
import HeroActions from "./HeroActions";
import ReviewSection from "@/components/ui/custom/ReviewSection";
import { createClient } from "@/lib/supabase/server";
import { getACE, computeDifficulty } from "@/lib/ace";
import type { Adventure } from "@/lib/data";
import { getApprovedOperatorsForAdventure } from "@/app/auth/operator-actions";
import OperatorListingPanel from "./OperatorListingPanel";
import MobileBookBar from "./MobileBookBar";
import AccordionSection from "./AccordionSection";

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

function RelatedSection({ title, items, exploreHref }: { title: string; items: Adventure[]; exploreHref: string; pillMode?: "type" | "region" }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <h3 className="text-white text-xl font-semibold tracking-tight">{title}</h3>
        <Link href={exploreHref} className="hidden md:flex items-center gap-1.5 text-white/40 text-sm font-medium hover:text-[#ff5100] transition-colors group">
          Explore all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory no-scrollbar">
        {items.map((a) => {
          const diff = computeDifficulty(getACE(a));
          return (
            <Link key={a.id} href={`/experiences/${a.slug}`} className="group relative flex flex-col rounded-2xl overflow-hidden flex-none w-64 snap-start transition-all duration-300 hover:-translate-y-1" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
              <div className="relative h-40 overflow-hidden">
                <Image src={a.heroImage} alt={a.name} fill loading="lazy" className="object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectFit: "cover" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                  <Pill type="type" value={a.type} />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-1.5">
                <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-[#ff5100] transition-colors line-clamp-2">{a.name}</h3>
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>{diff}</span>
                  <span className="text-[10px] text-white/30">{a.state}</span>
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

  const relatedByState = adventures
    .filter((a) => a.id !== adventure.id && a.state === adventure.state)
    .slice(0, 8);
  const relatedByStateIds = new Set(relatedByState.map((a) => a.id));
  const relatedByType = adventures
    .filter((a) => a.id !== adventure.id && a.type === adventure.type && !relatedByStateIds.has(a.id))
    .slice(0, 8);
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
        ...(adventure.groupSize ? [{ "@type": "PropertyValue", name: "Group Size", value: adventure.groupSize }] : []),
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
      ...(allOperators.some((o) => o.rating) ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: (allOperators.reduce((sum, o) => sum + (o.rating ?? 0), 0) / allOperators.filter((o) => o.rating).length).toFixed(1),
          reviewCount: allOperators.filter((o) => o.rating).length,
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

      {/* ── STATS STRIP ───────────────────────────────────────── */}
      <section style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-stretch overflow-x-auto no-scrollbar divide-x" style={{ borderColor: "var(--border-subtle)" }}>
            {[
              { icon: <Clock className="w-4 h-4 text-[#ff5100]" />, label: "Duration", value: adventure.durationRange ?? adventure.durationDays },
              ...(adventure.distance ? [{ icon: <Route className="w-4 h-4 text-emerald-400" />, label: "Distance", value: adventure.distanceRange ?? adventure.distance }] : []),
              ...((adventure.altitude || adventure.depth) ? [{ icon: <TrendingUp className="w-4 h-4 text-sky-400" />, label: adventure.type === "Diving" ? "Max Depth" : "Max Altitude", value: adventure.depth ?? adventure.altitude }] : []),
              { icon: <Sun className="w-4 h-4 text-amber-400" />, label: "Best Season", value: adventure.bestSeason },
              ...((adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp ? [{ icon: <Flag className="w-4 h-4 text-violet-400" />, label: "Base Camp", value: adventure.baseCamp }] : []),
              ...(adventure.type === "Biking" && adventure.startingPoint ? [{ icon: <Navigation className="w-4 h-4 text-emerald-400" />, label: "Starting Point", value: adventure.startingPoint }] : []),
            ].map(({ icon, label, value }, i) => (
              <div key={i} className="flex items-center gap-3 px-4 lg:px-6 py-4 shrink-0">
                {icon}
                <div>
                  <div className="text-white/25 text-[9px] uppercase tracking-widest">{label}</div>
                  <div className="text-white font-medium text-sm whitespace-nowrap">{value}</div>
                </div>
              </div>
            ))}
            {/* Difficulty stat */}
            <div className="flex items-center gap-3 px-4 lg:px-6 py-4 shrink-0">
              <Gauge className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-white/25 text-[9px] uppercase tracking-widest">Difficulty</div>
                <div className="text-white font-medium text-sm whitespace-nowrap">{difficulty}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-14">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-0 lg:space-y-14">

            {/* The Adventure */}
            <AccordionSection label="The Adventure" title="About This Adventure" defaultOpen={true}>
              <div
                className="rounded-2xl p-5 lg:p-7"
                style={{
                  background: "linear-gradient(135deg, rgba(255,81,0,0.07) 0%, rgba(255,81,0,0.02) 100%)",
                  borderLeft: "3px solid rgba(255,81,0,0.5)",
                  borderTop: "1px solid rgba(255,81,0,0.08)",
                  borderRight: "1px solid rgba(255,81,0,0.05)",
                  borderBottom: "1px solid rgba(255,81,0,0.05)",
                }}
              >
                <p className="text-white/75 text-base md:text-lg leading-relaxed font-light">{adventure.description}</p>
              </div>
            </AccordionSection>

            {/* What Makes It Special */}
            <AccordionSection label="Highlights" title="What Makes It Special" defaultOpen={true}>
              <div
                className="rounded-2xl p-5 lg:p-7"
                style={{
                  background: "linear-gradient(135deg, rgba(255,81,0,0.07) 0%, rgba(255,81,0,0.02) 100%)",
                  borderLeft: "3px solid rgba(255,81,0,0.5)",
                  borderTop: "1px solid rgba(255,81,0,0.08)",
                  borderRight: "1px solid rgba(255,81,0,0.05)",
                  borderBottom: "1px solid rgba(255,81,0,0.05)",
                }}
              >
                <p className="text-white/75 text-base md:text-lg leading-relaxed">{adventure.whatMakesSpecial}</p>
              </div>
            </AccordionSection>

            {/* Is This For You? */}
            <AccordionSection label="Suitability" title="Is This For You?" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.03) 100%)",
                    border: "1px solid rgba(16,185,129,0.15)",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.18)" }}>
                      <Flag className="w-4 h-4 text-emerald-400" fill="currentColor" />
                    </div>
                    <h3 className="font-semibold text-emerald-400 text-sm tracking-wide">This is for you if…</h3>
                  </div>
                  <ul className="space-y-2">
                    {adventure.whoFor.split("·").map((item) => {
                      const t = item.trim();
                      if (!t) return null;
                      const label = t.charAt(0).toUpperCase() + t.slice(1);
                      return (
                        <li key={t} className="flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.10)" }}>
                          <span className="text-emerald-400 shrink-0 text-xs">✓</span>
                          <span className="text-white/70 text-sm leading-snug">{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(185,28,28,0.03) 100%)",
                    border: "1px solid rgba(239,68,68,0.15)",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
                      <Flag className="w-4 h-4 text-red-400" fill="currentColor" />
                    </div>
                    <h3 className="font-semibold text-red-400 text-sm tracking-wide">Skip this if…</h3>
                  </div>
                  <ul className="space-y-2">
                    {adventure.whoNot.split("·").map((item) => {
                      const t = item.trim();
                      if (!t) return null;
                      const label = t.charAt(0).toUpperCase() + t.slice(1);
                      return (
                        <li key={t} className="flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.10)" }}>
                          <span className="text-red-400 shrink-0 text-xs">✕</span>
                          <span className="text-white/70 text-sm leading-snug">{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </AccordionSection>

            {/* ACE Profile */}
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

            {/* Operators */}
            <AccordionSection label="Book This Adventure" title="" defaultOpen={true}>
              <div id="operators-section">
              {/* Verified */}
              {allOperators.some((op) => op.verified) && (
                <div
                  className="mb-8 rounded-2xl p-5"
                  style={{ border: "1px solid rgba(16,185,129,0.18)", background: "rgba(16,185,129,0.03)" }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <h3 className="text-emerald-400 text-sm font-bold tracking-wide">Verified Operators</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {allOperators.filter((op) => op.verified).map((op) => (
                      <OperatorCard key={op.name} op={op} verified />
                    ))}
                  </div>
                  <p className="mt-4 text-white/25 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    All verified operators hold valid permits, safety certifications and guide credentials.
                  </p>
                </div>
              )}

              {/* How we verify — collapsible */}
              <VerifyDropdown />

              {/* Unverified */}
              {allOperators.some((op) => !op.verified) && (
                <div
                  className="rounded-2xl p-5"
                  style={{ border: "1px solid rgba(245,158,11,0.16)", background: "rgba(245,158,11,0.03)" }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <h3 className="text-white/60 text-sm font-bold tracking-wide">Other Operators</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {allOperators.filter((op) => !op.verified).map((op) => (
                      <OperatorCard key={op.name} op={op} verified={false} />
                    ))}
                  </div>
                  <p className="mt-4 text-white/25 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Do your own research. Ask operators directly for permits and certifications.
                  </p>
                </div>
              )}
              </div>
            </AccordionSection>

            {/* Reviews */}
            <AccordionSection label="" title="" defaultOpen={true}>
              <ReviewSection slug={adventure.slug} currentUserId={currentUserId} adventureType={adventure.type} adventureName={adventure.name} />
            </AccordionSection>

            {/* Tags */}
            <section>
              <div className="flex flex-wrap gap-2">
                {adventure.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-white/30 text-xs px-3 py-1.5 rounded-full transition-colors hover:text-white/50"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">

            {/* At a Glance */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-5">
                At a Glance
              </p>
              <div className="space-y-3">
                {[
                  { label: "Type", value: adventure.type },
                  ...((adventure.type === "Trekking" || adventure.type === "Mountaineering") && adventure.baseCamp ? [{ label: "Base Camp", value: adventure.baseCamp }] : []),
                  ...(adventure.type === "Biking" && adventure.startingPoint ? [{ label: "Starting Point", value: adventure.startingPoint }] : []),
                  { label: "Duration", value: adventure.durationRange ?? adventure.durationDays },
                  ...((adventure.type === "Trekking" || adventure.type === "Biking")
                    ? [{ label: "Distance", value: adventure.distanceRange ?? adventure.distance ?? "Contact for route" }]
                    : adventure.distance ? [{ label: "Distance", value: adventure.distanceRange ?? adventure.distance }] : []),
                  { label: "Difficulty", value: difficulty },
                  { label: "Best Season", value: adventure.bestSeason },
                  ...(adventure.altitude ? [{ label: "Max Altitude", value: adventure.altitude }] : []),
                  ...(adventure.depth ? [{ label: "Max Depth", value: adventure.depth }] : []),
                  { label: "Group Size", value: adventure.groupSize },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4 pb-3 last:pb-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="text-white/30 text-xs shrink-0">{label}</span>
                    <span className="text-white/70 text-xs text-right leading-snug">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compare CTA */}
            <CompareCTA adventure={adventure} />

            {/* Operator Registration Panel */}
            <OperatorListingPanel adventureSlug={adventure.slug} adventureName={adventure.name} />

            {/* Explore links */}
            <Link
              href={`/explore?subRegion=${encodeURIComponent(adventure.state)}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white/50 hover:text-white text-sm font-medium transition-all duration-200 hover:bg-white/5"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              More in {adventure.state}
            </Link>
            <Link
              href={`/explore?type=${encodeURIComponent(adventure.type)}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white/50 hover:text-white text-sm font-medium transition-all duration-200 hover:bg-white/5"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              More in {adventure.type}
            </Link>
          </div>
        </div>
      </div>

      {/* ── YOU MIGHT ALSO LIKE ───────────────────────────────── */}
      {(relatedByState.length > 0 || relatedByType.length > 0) && (
        <section
          className="py-14 lg:py-20 px-5 lg:px-8"
          style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-2">Discover More</p>
              <h2 className="text-white text-2xl lg:text-3xl font-bold tracking-tight">You Might Also Like</h2>
              <div className="mt-3 w-10 h-0.5 bg-[#ff5100] rounded-full" />
            </div>
            <div className="space-y-12">
              <RelatedSection title={`More in ${adventure.state}`} items={relatedByState} exploreHref={`/explore?subRegion=${encodeURIComponent(adventure.state)}`} />
              <RelatedSection title={`More ${adventure.type}`} items={relatedByType} exploreHref={`/explore?type=${encodeURIComponent(adventure.type)}`} />
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
