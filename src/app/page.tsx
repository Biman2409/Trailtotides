import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Map, ChevronRight, Star } from "lucide-react";
import HeroCTAs from "@/components/ui/custom/HeroCTAs";
import MatchmakerHomepageSection from "@/components/ui/custom/MatchmakerHomepageSection";
import { FadeUp, HeroOrbs, ShimmerLine, HeroHeadline, HeroSubheading, HeroCTAWrapper } from "@/components/ui/custom/HomeAnimations";

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
import InlineChat from "@/components/InlineChat";
import StatsBar from "@/components/StatsBar";
import StoryCard from "@/components/ui/custom/StoryCard";
import FindByRegion from "@/components/ui/custom/FindByRegion";
import { adventures, stories } from "@/lib/data";

const featuredAdventures = adventures.filter((a) => a.editorChoice).slice(0, 6);
const featuredStories = stories.slice(0, 3);

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <HeroSlider />
        <HeroOrbs />

        <div className="relative z-10 text-center px-5 max-w-4xl mx-auto flex flex-col items-center" style={{ gap: "28px", marginTop: "-32px" }}>

          {/* Eyebrow pill */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md max-w-[calc(100vw-40px)]"
            style={{
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
              animation: "heroLineIn 0.7s cubic-bezier(0.22,1,0.36,1) 0s both",
            }}
          >
            {/* Live dot */}
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#ff5100" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#ff5100" }} />
            </span>
            <span
              className="text-[9px] sm:text-[10px] font-black uppercase truncate"
              style={{
                letterSpacing: "0.18em",
                background: "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              India&apos;s First Adventure Discovery Platform
            </span>
          </div>

          {/* Headline — tighter to pill */}
          <div style={{ marginTop: "-4px" }}>
            <HeroHeadline />
          </div>

          {/* Subheading + CTAs */}
          <div className="w-full flex flex-col items-center gap-4 max-w-xs sm:max-w-sm md:max-w-xl" style={{ marginTop: "4px" }}>
            <HeroSubheading />
            <HeroCTAWrapper>
              <HeroCTAs />
            </HeroCTAWrapper>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ animation: "heroLineIn 1s cubic-bezier(0.22,1,0.36,1) 1.2s both" }}
        >
          <span className="text-white/30 text-[10px] tracking-[0.25em] uppercase font-medium">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" style={{ animation: "scrollPulse 2s ease-in-out infinite" }} />
          <style>{`
            @keyframes heroLineIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
            @keyframes scrollPulse { 0%,100% { opacity:0.3; transform:scaleY(1); } 50% { opacity:0.8; transform:scaleY(1.15); } }
          `}</style>
        </div>
      </section>

        {/* ── STATS BAR ────────────────────────────────────── */}
        <StatsBar />

        {/* ── AI FINDER ────────────────────────────────────── */}
        <FadeUp>
          <InlineChat />
        </FadeUp>

        {/* ── ADVENTURE MATCHMAKER ─────────────────────────── */}
        <FadeUp>
          <MatchmakerHomepageSection />
        </FadeUp>

        {/* ── MAP CTA ───────────────────────────────────────── */}
        <section id="map-cta" className="relative py-10 lg:py-16 bg-[#eaf0e8] dark:bg-[#1a2e20] px-5 lg:px-8 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1200&q=100"
              alt="India map texture"
              fill
              className="object-cover opacity-[0.06] dark:opacity-12 brightness-[1.05] contrast-[1.1] saturate-[1.1]"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#eaf0e8]/98 via-[#eaf0e8]/80 to-[#eaf0e8]/40 dark:from-[#1a2e20]/98 dark:via-[#1a2e20]/80 dark:to-[#1a2e20]/40" />
            <div
              className="absolute inset-0 opacity-[0.06] dark:hidden"
              style={{
                backgroundImage: "radial-gradient(circle, #4a7a50 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div
              className="absolute inset-0 opacity-10 hidden dark:block"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <FadeUp>
              <div className="max-w-2xl">
                <p className="text-[#7ec88a] text-xs font-black tracking-[0.25em] mb-3 uppercase">
                  ADVENTURE MAP
                </p>
                <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight mb-3">
                  India&apos;s Adventures,
                  <br />
                  <span className="text-[#7ec88a]">Mapped</span>
                </h2>
                <p className="text-[#2d4a33] dark:text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed mb-6 w-full max-w-lg">
                  Every trail, summit and coast — one map. Filter by type, cluster by region, tap to explore.
                </p>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2.5 bg-[#1a2e20] text-white dark:bg-white dark:text-[#1a2e20] font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#2d4a33] dark:hover:bg-[#f0f7f1] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 group transition-all duration-200 shadow-lg shadow-black/15"
                >
                  <Map className="w-5 h-5" />
                  View Map
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── FEATURED ADVENTURES ── */}
        <section id="featured-adventures" className="py-10 lg:py-14 px-5 lg:px-8 t-bg-page">
          <div className="max-w-7xl mx-auto">
            <FadeUp>
              <div className="mb-7 lg:mb-9">
                <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-3 flex items-center gap-1.5 uppercase">
                  <Star className="w-3.5 h-3.5 fill-[#ff5100]" />
                  EDITOR&apos;S CHOICE
                </p>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="t-text text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
                      Adventures of a Lifetime
                    </h2>
                    <ShimmerLine className="mt-4 max-w-[48px]" />
                  </div>
                  <span className="hidden sm:flex items-center gap-1.5 text-[#ff5100] text-sm font-semibold bg-[#ff5100]/8 border border-[#ff5100]/20 px-3 py-1.5 rounded-full mb-1">
                    {featuredAdventures.length} picks
                  </span>
                </div>
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {featuredAdventures.map((adventure, i) => (
                <FadeUp key={adventure.id} delay={i * 70}>
                  <AdventureCard adventure={adventure} size="default" />
                </FadeUp>
              ))}
            </div>

            <FadeUp delay={200}>
              <div className="mt-7 lg:mt-9 flex justify-center">
                <Link
                  href="/explore"
                  className="bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-8 py-3.5 rounded-xl text-sm md:text-base flex items-center gap-2 group shadow-lg shadow-[#ff5100]/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/30 transition-all duration-200"
                >
                  View all adventures
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── ADVENTURE TYPES ──────────────────────────────── */}
        <FadeUp>
          <FindYourFormat />
        </FadeUp>

        {/* ── REGIONS ──────────────────────────────────────── */}
        <FadeUp>
          <FindByRegion />
        </FadeUp>

        {/* ── STORIES ──────────────────────────────────────── */}
        <section id="stories" className="py-10 lg:py-14 px-5 lg:px-8 t-bg-surface border-t border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto">
            <FadeUp>
              <div className="flex items-end justify-between mb-7 lg:mb-9">
                <div>
                  <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-2 uppercase">
                    From the Trails
                  </p>
                  <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight">
                    Voices from the Edge
                  </h2>
                  <ShimmerLine className="mt-4 max-w-[48px]" />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-7">
              {featuredStories.map((story, i) => (
                <FadeUp key={story.id} delay={i * 90}>
                  <StoryCard story={story} />
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

      <Footer />
      <ChatBubble />
    </div>
  );
}
