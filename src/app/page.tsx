import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, ChevronRight, Crown, Map } from "lucide-react";
import HeroCTAs from "@/components/ui/custom/HeroCTAs";
import HeroPromise from "@/components/ui/custom/HeroPromise";
import MatchmakerHomepageSection from "@/components/ui/custom/MatchmakerHomepageSection";
import { FadeUp, HeroOrbs, HeroHeadline, HeroCTAWrapper } from "@/components/ui/custom/HomeAnimations";
import { Plus_Jakarta_Sans } from "next/font/google";

// Hero headline face — loaded here rather than in the root layout so other pages don't download it
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "800"],
});

export const metadata: Metadata = {
  title: "Trail to Tides — India's Adventure Discovery Platform",
  description:
    "Discover, compare, and book elite adventures — matched to your body, mapped with precision, guided by AI, and led by India's most trusted operators.",
  alternates: { canonical: "https://trailtotides.com" },
  openGraph: {
    title: "Trail to Tides — India's Adventure Discovery Platform",
    description:
      "Discover, compare, and book elite adventures — matched to your body, mapped with precision, guided by AI, and led by India's most trusted operators.",
    url: "https://trailtotides.com",
    type: "website",
  },
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import HeroSlider from "@/components/ui/custom/HeroSlider";
import FindYourFormat from "@/components/ui/custom/FindYourFormat";
import ChatBubble from "@/components/ChatBubble";
import StatsBar from "@/components/StatsBar";
import StoryCard from "@/components/ui/custom/StoryCard";
import FindByRegion from "@/components/ui/custom/FindByRegion";
import AdventureRail from "@/components/ui/custom/AdventureRail";
import PickedForYou from "@/components/ui/custom/PickedForYou";
import MapDemo, { type MapDemoPin } from "@/components/ui/custom/MapDemo";
import SectionTexture from "@/components/ui/custom/SectionTexture";
import { adventures, stories } from "@/lib/data";
import { pickEditorsMix, inSeasonNow, currentMonthIndexIST, MONTHS, MONTH_NAMES } from "@/lib/homeCuration";

// Re-render every 6 hours so "In season now" follows the calendar.
export const revalidate = 21600;

const featuredAdventures = pickEditorsMix(adventures, 6);
const featuredStories = stories.slice(0, 3);
// Only what the map preview draws, so the full adventure records stay off the client
const mapPins: MapDemoPin[] = adventures.map(({ slug, name, type, lat, lng, difficulty, durationDays, state, heroImage }) => ({ slug, name, type, lat, lng, difficulty, durationDays, state, image: heroImage }));

function SeasonNote({ monthsLeft, endsIn }: { monthsLeft: number; endsIn: string }) {
  const last = monthsLeft === 1;
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-[10px] font-semibold leading-none"
      style={{
        background: last ? "rgba(255,81,0,0.12)" : "var(--bg-card-hover)",
        border: `1px solid ${last ? "rgba(255,81,0,0.35)" : "var(--border-subtle)"}`,
        color: last ? "#ff7d47" : "var(--text-secondary)",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: last ? "#ff5100" : "#10b981" }} />
      {last ? "Last month of the season" : monthsLeft >= 12 ? "Good all year" : `In season till ${endsIn}`}
    </span>
  );
}

export default function HomePage() {
  const monthIdx = currentMonthIndexIST();
  const season = inSeasonNow(adventures, monthIdx);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section data-hide-compass className={`${jakarta.variable} hero-motion relative h-[100svh] [@media(max-height:560px)]:h-auto flex overflow-hidden`}>
        <HeroSlider />
        <HeroOrbs />
        {/* Scrim: darker on the left where the copy sits, and a deeper band along the bottom
            (pooled behind the promise copy) so the promise and search stay legible over bright photos */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(60% 45% at 18% 88%, rgba(5,8,12,0.55), transparent 70%), linear-gradient(90deg, rgba(5,8,12,0.62) 0%, rgba(5,8,12,0.28) 55%, rgba(5,8,12,0.08) 100%), linear-gradient(0deg, rgba(5,8,12,0.8) 0%, rgba(5,8,12,0.45) 24%, transparent 52%)" }}
        />

        {/* Headline centred, promise + search along the bottom. The hero fills the visible
            screen exactly (svh, so mobile toolbars don't hide its bottom); the headline scales
            down to make room on short screens. Below 560px tall (phones in landscape) nothing
            can fit, so the hero grows and scrolls instead. */}
        <div
          className="relative z-10 w-full max-w-6xl mx-auto px-5 lg:px-10 flex flex-col justify-between"
          style={{ paddingTop: "clamp(5.75rem, 12svh, 8.5rem)", paddingBottom: "clamp(3.5rem, 8svh, 4.5rem)", gap: "clamp(1.25rem, 4svh, 2.5rem)" }}
        >
          {/* Headline centred in the space above the bottom band */}
          {/* min-h-0 lets this slot shrink below the headline's size; HeroHeadline then scales itself to fit */}
          <div className="flex-1 min-h-0 flex items-center lg:items-end justify-center">
            <HeroHeadline />
          </div>

          {/* Bottom band: promise (5 parts) and search (7 parts) on one shared grid,
              bottom edges aligned, and the search spans to the right margin */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 lg:items-end">
            <div className="lg:col-span-4">
              <HeroPromise />
            </div>
            <div className="lg:col-span-8">
              <HeroCTAWrapper>
                <HeroCTAs />
              </HeroCTAWrapper>
            </div>
          </div>
        </div>

        {/* Scroll cue — tells first-time visitors there's more below the fold */}
        <a
          href="#after-hero"
          aria-label="Scroll to see more"
          className="hero-scroll absolute z-10 bottom-3 right-5 lg:right-10 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55 hover:text-white transition-colors"
        >
          <span className="hidden sm:inline">Scroll</span>
          <ChevronDown className="hero-scroll-icon w-4 h-4" strokeWidth={2.2} />
        </a>

        <style>{`
          .hero-scroll-icon { animation: heroScrollBob 1.8s ease-in-out infinite; }
          @keyframes heroScrollBob { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(4px); opacity: 1; } }
          /* Reduced motion: hero copy appears instantly, Ken Burns pan and floating orbs stop */
          @media (prefers-reduced-motion: reduce) {
            .hero-motion *:not(.hh-word):not(.hc-breathe) { animation-duration: 0.01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; }
          }
        `}</style>
      </section>

        {/* ── STATS BAR ────────────────────────────────────── */}
        <div id="after-hero" className="scroll-mt-16" />
        <StatsBar />

        {/* ── PICKED FOR YOU (returning visitors only) ─────── */}
        <PickedForYou />

        {/* ── IN SEASON NOW ────────────────────────────────── */}
        <AdventureRail
          id="in-season"
          className="t-bg-page"
          backdrop={<SectionTexture kind="tides" color="#3fc6bd" at="90% 15%" opacity={0.12} />}
          eyebrow={<><span className="relative flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" /><span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" /></span> In season now</>}
          title={`Best in ${MONTH_NAMES[monthIdx]}`}
          subtitle={`${season.total} adventures are in their prime window right now. Closing soonest first.`}
          action={{ href: `/explore?month=${MONTHS[monthIdx]}`, label: `See all ${season.total}` }}
          items={season.picks.slice(0, 8).map((p) => ({
            adventure: p.adventure,
            note: <SeasonNote monthsLeft={p.monthsLeft} endsIn={p.endsIn} />,
          }))}
        />

        {/* ── EDITOR'S CHOICE — one large feature, five around it ── */}
        <section id="featured-adventures" className="py-14 lg:py-20 px-5 lg:px-8 t-bg-surface2 topo">
          <div className="max-w-7xl mx-auto">
            <FadeUp>
              <div className="flex items-end justify-between gap-4 mb-8 lg:mb-10">
                <div>
                  <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-2 flex items-center gap-1.5 uppercase">
                    <Crown className="w-3.5 h-3.5 fill-[#ff5100]" />
                    Editor&apos;s Choice
                  </p>
                  <h2 className="t-text text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
                    Adventures of a Lifetime
                  </h2>
                </div>
                <Link
                  href="/explore"
                  className="group hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5100] hover:text-[#ff7d47] transition-colors mb-1"
                >
                  View all adventures
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </FadeUp>

            {/* Phones swipe through the picks sideways; wider screens get the feature grid */}
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar -mx-5 px-5 scroll-px-5 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
              {featuredAdventures.map((adventure, i) => (
                <div key={adventure.id} className={`snap-start shrink-0 w-[78vw] sm:w-auto ${i === 0 ? "sm:col-span-2 lg:row-span-2" : ""}`}>
                  {/* The section is already titled Editor's Choice — no per-card badge */}
                  <AdventureCard adventure={adventure} badge={false} fill={i === 0} size={i === 0 ? "large" : "default"} />
                </div>
              ))}
            </div>

            <div className="sm:hidden mt-6">
              <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5100]">
                View all adventures
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── ADVENTURE TYPES ──────────────────────────────── */}
        <FindYourFormat />

        {/* ── REGIONS ──────────────────────────────────────── */}
        <FindByRegion />

        {/* ── MAP CTA — warm surface, green only as the accent; edges fade into the page ── */}
        <section id="map-cta" className="relative py-14 lg:py-20 px-5 lg:px-8 overflow-hidden t-bg-surface">
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1200&q=80"
              alt=""
              fill
              className="object-cover opacity-[0.035] grayscale"
              style={{ objectFit: "cover" }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(126,200,138,0.5) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                opacity: 0.12,
                maskImage: "linear-gradient(90deg, transparent 0%, black 55%, black 100%)",
                WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 55%, black 100%)",
              }}
            />
            <div className="absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(to bottom, var(--bg-page), transparent)" }} />
            <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to top, var(--bg-page), transparent)" }} />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-center">
            <FadeUp>
              <div className="max-w-2xl">
                <p className="text-[#5fb873] text-xs font-semibold tracking-[0.22em] mb-2 uppercase">
                  Adventure Map
                </p>
                <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight mb-3">
                  India&apos;s Adventures, <span className="text-[#5fb873]">Mapped</span>
                </h2>
                <p className="text-sm sm:text-base leading-relaxed mb-7 w-full max-w-lg" style={{ color: "var(--text-secondary)" }}>
                  Every trail, summit and coast — one map. Filter by type, cluster by region, tap to explore.
                </p>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2.5 font-semibold px-7 py-3.5 rounded-xl text-base hover:-translate-y-0.5 group transition-all duration-200 shadow-lg shadow-black/15"
                  style={{ background: "var(--text-primary)", color: "var(--bg-page)" }}
                >
                  <Map className="w-5 h-5" />
                  View Map
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeUp>
            <MapDemo pins={mapPins} />
          </div>
        </section>

        {/* ── ADVENTURE MATCHMAKER ─────────────────────────── */}
        <MatchmakerHomepageSection />

        {/* ── STORIES ──────────────────────────────────────── */}
        <section id="stories" className="py-14 lg:py-20 px-5 lg:px-8 t-bg-page topo">
          <div className="max-w-7xl mx-auto">
            <FadeUp>
              <div className="flex items-end justify-between mb-8 lg:mb-10">
                <div>
                  <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-2 uppercase">
                    From the Trails
                  </p>
                  <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight">
                    Voices from the Edge
                  </h2>
                </div>
                <Link
                  href="/stories"
                  className="flex items-center gap-1.5 font-medium hover:text-[#ff5100] transition-colors group text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  All stories
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeUp>

            {/* Columns follow the number of stories, so two stories fill the row instead of leaving a hole */}
            <div className={`grid grid-cols-1 gap-5 lg:gap-7 ${featuredStories.length >= 3 ? "sm:grid-cols-2 md:grid-cols-3" : featuredStories.length === 2 ? "sm:grid-cols-2" : "max-w-2xl"}`}>
              {featuredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </section>

      <Footer />
      <ChatBubble />
    </div>
  );
}