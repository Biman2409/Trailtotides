import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Map, ChevronRight, Star, BadgeCheck } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import HeroSlider from "@/components/ui/custom/HeroSlider";
import FindYourFormat from "@/components/ui/custom/FindYourFormat";
import CompareAdventures from "@/components/ui/custom/CompareAdventures";
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

        <div className="relative z-10 text-center px-5 max-w-5xl mx-auto mt-24 md:mt-32">

          {/* Headline */}
          <h1
            className="font-bold tracking-tight mb-5"
            style={{
              fontSize: "clamp(2.2rem, 7.5vw, 6rem)",
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
            className="text-white/82 text-base md:text-xl w-full mx-auto leading-relaxed mb-8"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.85)" }}
          >
            Discover and compare epic adventures across Indian Subcontinent — handpicked by explorers, run by verified operators, mapped with precision.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/explore"
              className="bg-[#ff5100] hover:bg-[#ff7d47] text-white font-semibold px-7 py-3.5 rounded-xl text-sm md:text-base flex items-center gap-2 group shadow-xl shadow-black/30 w-full sm:w-auto justify-center hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#ff5100]/40 transition-all duration-200"
            >
              Explore Adventures
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/map"
              className="bg-white/12 hover:bg-white/22 backdrop-blur-md text-white font-semibold px-7 py-3.5 rounded-xl text-sm md:text-base border border-white/25 hover:border-white/40 flex items-center gap-2 w-full sm:w-auto justify-center hover:-translate-y-0.5 transition-all duration-200"
            >
              <Map className="w-4 h-4" />
              Adventure Map
            </Link>
          </div>
        </div>


      </section>

        {/* ── STATS BAR ────────────────────────────────────── */}
        <StatsBar />

        {/* ── AI FINDER ────────────────────────────────────── */}
        <InlineChat />

          {/* ── FEATURED ADVENTURES + COMPARE (shared context) ── */}
        <section id="featured-adventures" className="py-16 lg:py-32 px-5 lg:px-8 bg-[#111820]">
            <div className="max-w-7xl mx-auto">
                    <div className="mb-10 lg:mb-14">
                      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-3 flex items-center gap-1.5 uppercase">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        EDITORS CHOICE
                      </p>
                    <div className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-white text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
                        Adventures of a Lifetime
                      </h2>
                      <div className="mt-4 lg:mt-5 w-14 h-0.5 bg-[#ff5100] rounded-full" />
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
        <section id="map-cta" className="relative py-16 lg:py-32 bg-[#1a2e20] px-5 lg:px-8 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1200&q=100"
              alt="India map texture"
              fill
              className="object-cover opacity-12 brightness-[1.05] contrast-[1.1] saturate-[1.1]"
              style={{ objectFit: "cover" }}
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
                        <p className="text-[#7ec88a] text-xs font-black tracking-[0.25em] mb-4 uppercase">
                          SIGNATURE FEATURE
                        </p>
            <h2 className="text-white text-3xl lg:text-6xl font-bold tracking-tight leading-tight mb-4 lg:mb-5">
                India's Adventures,
                <br />
                <span className="text-[#7ec88a]">Mapped</span>
              </h2>
                        <p className="text-white/72 text-base md:text-xl leading-relaxed mb-7 lg:mb-9 w-full">
                          Every trail, summit, coast, and canyon — pinned, filtered, and ready to explore on one interactive map.
                        </p>
                  <Link
                    href="/map"
                    className="inline-flex items-center gap-2.5 bg-white text-[#1a2e20] font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#f0f7f1] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 group transition-all duration-200 shadow-lg shadow-black/15"
                  >
                    <Map className="w-5 h-5" />
                    View Map
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
            </div>
          </div>
        </section>
  
        {/* ── ADVENTURE MATCHMAKER ─────────────────────────── */}
        <section className="py-16 lg:py-28 px-5 lg:px-8 bg-[#0f1420] border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left — copy */}
              <div>
                <p className="text-[#ff5100] text-xs font-black tracking-[0.25em] uppercase mb-4">Adventure Matchmaker</p>
                <h2 className="text-white text-3xl lg:text-5xl font-bold tracking-tight leading-tight mb-5">
                  Find adventures built<br />
                  <span className="text-[#ff5100]">for your body.</span>
                </h2>
                <p className="text-white/55 text-base lg:text-lg leading-relaxed mb-8">
                  Answer 5 quick questions about your fitness, altitude experience, and terrain comfort. We'll calculate your personal ERT profile and match you to adventures you can actually complete — safely.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {[
                    { label: "Cardio", sub: "Your endurance" },
                    { label: "Load", sub: "Pack experience" },
                    { label: "Altitude", sub: "Highest sleep" },
                    { label: "Terrain", sub: "Technical comfort" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}>{i + 1}</span>
                      <div>
                        <p className="text-white text-xs font-semibold leading-none">{item.label}</p>
                        <p className="text-white/35 text-[10px] mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/matchmaker"
                  className="inline-flex items-center gap-2.5 bg-[#ff5100] text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#e04800] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/20 group transition-all duration-200"
                >
                  Take Assessment
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Right — ERT preview cards */}
              <div className="space-y-3">
                {[
                  { name: "Dayara Bugyal", state: "Uttarakhand", e: 1, r: 1, t: 1, match: true, label: "Perfect match" },
                  { name: "Kedarkantha Trek", state: "Uttarakhand", e: 2, r: 2, t: 1, match: true, label: "Within range" },
                  { name: "Everest Base Camp", state: "Nepal", e: 4, r: 2, t: 1, match: false, label: "Needs training" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-5 py-4 rounded-2xl border transition-all"
                    style={{
                      background: item.match ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.06)",
                      borderColor: item.match ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)",
                    }}
                  >
                    <div>
                      <p className="text-white font-semibold text-sm">{item.name}</p>
                      <p className="text-white/35 text-[10px] mt-0.5">{item.state}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Mini ERT pips */}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span style={{ color: "#ff5100" }}>E{item.e}</span>
                        <span className="text-white/15">·</span>
                        <span style={{ color: "#f59e0b" }}>R{item.r}</span>
                        <span className="text-white/15">·</span>
                        <span style={{ color: "#a78bfa" }}>T{item.t}</span>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: item.match ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                          color: item.match ? "#34d399" : "#fbbf24",
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
                <p className="text-white/20 text-xs text-center pt-2">Results are based on your personal ERT comfort profile</p>
              </div>

            </div>
          </div>
        </section>

        {/* ── REGIONS ──────────────────────────────────────── */}
        <FindByRegion />
  
        {/* ── ADVENTURE TYPES ──────────────────────────────── */}
        <FindYourFormat />

          {/* ── COMPARE ADVENTURES ───────────────────────────── */}
          <CompareAdventures />

          {/* ── STORIES ──────────────────────────────────────── */}
        <section id="stories" className="py-16 lg:py-32 px-5 lg:px-8 bg-[#0e1420] border-t border-white/6">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10 lg:mb-12">
                <div>
                    <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-3">
                      FROM THE TRAILS
                    </p>
                          <h2 className="text-white text-3xl lg:text-5xl font-bold tracking-tight">
                              Voices from the Edge
                            </h2>
                <div className="mt-4 lg:mt-5 w-14 h-0.5 bg-[#ff5100] rounded-full" />
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
