import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Map, ChevronRight, Star, ChevronDown } from "lucide-react";

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

const featuredAdventures = adventures.filter((a) => a.featured).slice(0, 6);
const featuredStories = stories.slice(0, 3);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#111820]">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <HeroSlider />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
                <p className="text-white text-xs font-semibold tracking-[0.18em] uppercase">
                  India&apos;s First Adventure Discovery &amp; Aggregator Platform
                </p>
            </div>


          {/* Headline */}
          <h1
            className="font-bold tracking-tight mb-6"
            style={{
              fontSize: "clamp(2.8rem, 7.5vw, 6rem)",
              lineHeight: 1.08,
              color: "white",
              textShadow: "0 2px 24px rgba(0,0,0,0.65)",
            }}
          >
            <span style={{ display: "block" }}>
              From Mountain{" "}
              <em style={{ fontStyle: "italic", fontWeight: 700 }}>Trail</em>
            </span>
            <span
              style={{
                display: "block",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.28) 30%, rgba(255,255,255,0.28) 70%, transparent)",
                margin: "0.32em auto",
                maxWidth: "460px",
              }}
            />
            <span style={{ display: "block" }}>
              To Ocean{" "}
              <em style={{ fontStyle: "italic", fontWeight: 700 }}>Tides</em>
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="text-white/82 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.85)" }}
          >
            Discover and compare epic adventures across India — handpicked by explorers, run by verified operators, mapped with precision — for you.
          </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/explore"
                className="bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-8 py-4 rounded-xl text-base flex items-center gap-2 group shadow-xl shadow-black/30 min-w-[200px] justify-center hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#ff5100]/40 transition-all duration-200"
              >
                Explore Adventures
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

            <Link
              href="/map"
              className="bg-white/12 hover:bg-white/22 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-xl text-base border border-white/25 hover:border-white/40 flex items-center gap-2 min-w-[200px] justify-center hover:-translate-y-0.5 transition-all duration-200"
            >
              <Map className="w-4 h-4" />
              View the Map
            </Link>
          </div>

          <p className="mt-7 text-white/38 text-xs tracking-[0.15em] uppercase">
            Crafted by people who&apos;ve been out there
          </p>
        </div>

        {/* Scroll cue arrow */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
          <ChevronDown className="w-5 h-5 text-white/40" />
        </div>
      </section>

        {/* ── STATS BAR ────────────────────────────────────── */}
        <StatsBar />

        {/* ── AI FINDER ────────────────────────────────────── */}
        <InlineChat />

        {/* ── FEATURED ADVENTURES ─────────────────────────── */}
      <section id="featured-adventures" className="py-24 lg:py-32 px-6 lg:px-8 bg-[#111820]">
          <div className="max-w-7xl mx-auto">
              <div className="mb-14">
                <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-3">
                  OUR FAVOURITES
                </p>
                <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-white text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                    Adventures of a Lifetime
                  </h2>
                  <div className="mt-5 w-14 h-0.5 bg-[#ff5100] rounded-full" />
                </div>
                <span className="hidden sm:flex items-center gap-1.5 text-[#ff5100] text-sm font-semibold bg-[#ff5100]/8 border border-[#ff5100]/20 px-3 py-1.5 rounded-full mb-1">
                  {featuredAdventures.length} picks
                </span>
              </div>
            </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {featuredAdventures.map((adventure) => (
              <AdventureCard key={adventure.id} adventure={adventure} size="default" />
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              href="/explore"
              className="bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-9 py-4 rounded-xl text-base flex items-center gap-2 group shadow-lg shadow-[#ff5100]/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/30 transition-all duration-200"
            >
              View all adventures
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAP CTA ───────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 bg-[#1a2e20] px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1200&q=40"
            alt="India map texture"
            fill
            className="object-cover opacity-12"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a2e20]/98 via-[#1a2e20]/80 to-[#1a2e20]/40" />
          {/* Subtle dot grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

          <div className="max-w-7xl mx-auto relative z-10">
              <div className="max-w-2xl">
                <p className="text-[#7ec88a] text-xs font-semibold tracking-[0.22em] uppercase mb-4">
                  SIGNATURE FEATURE
                </p>
                <h2 className="text-white text-4xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
                  India&apos;s adventures,
                  <br />
                  <span className="text-[#7ec88a]">mapped.</span>
                </h2>
              <p className="text-white/72 text-lg md:text-xl leading-relaxed mb-9 max-w-lg">
                Every adventure across India — trekking, diving, cycling, skiing — on one
                interactive map. Filter by region, difficulty, or type.
              </p>
              <Link
                href="/map"
                className="inline-flex items-center gap-2.5 bg-white text-[#1a2e20] font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#f0f7f1] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 group transition-all duration-200 shadow-lg shadow-black/15"
              >
                <Map className="w-5 h-5" />
                Open the Map
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
  
        {/* ── REGIONS ──────────────────────────────────────── */}
        <FindByRegion />
  
        {/* ── ADVENTURE TYPES ──────────────────────────────── */}
        <FindYourFormat />

      {/* ── STORIES ──────────────────────────────────────── */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#0e1420] border-t border-white/6">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-3">
                  FROM THE FIELD
                </p>
                  <h2 className="text-white text-4xl lg:text-5xl font-bold tracking-tight">
                    Voices from the edge
                  </h2>
              <div className="mt-5 w-14 h-0.5 bg-[#ff5100] rounded-full" />
            </div>
            <Link
              href="/stories"
              className="hidden md:flex items-center gap-1.5 text-white/50 font-semibold hover:text-[#ff5100] transition-colors group text-sm"
            >
              All stories
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {featuredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

          <div className="mt-12 flex justify-center md:hidden">
            <Link
              href="/stories"
              className="flex items-center gap-1.5 text-[#ff5100] font-semibold text-sm"
            >
              All stories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ChatBubble />
    </div>
  );
}
