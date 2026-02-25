import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Map, ChevronRight, Star, ChevronDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import HeroSlider from "@/components/ui/custom/HeroSlider";
import ChatBubble from "@/components/ChatBubble";
import InlineChat from "@/components/InlineChat";
import StatsBar from "@/components/StatsBar";
import { adventures, stories, regions } from "@/lib/data";

const featuredAdventures = adventures.filter((a) => a.featured).slice(0, 6);
const featuredStories = stories.slice(0, 3);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <HeroSlider />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f07a42] mr-2.5 animate-pulse" />
            <p className="text-white text-xs font-semibold tracking-[0.18em] uppercase">
              India's First Adventure Discovery &amp; Aggregator Platform
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
            Discover Epic Adventures Across India —<br />
            Handpicked by Explorers, Precisely Mapped for You.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/explore"
              className="bg-[#c4622d] hover:bg-[#d97040] text-white font-semibold px-8 py-4 rounded-xl text-base flex items-center gap-2 group shadow-xl shadow-black/30 min-w-[200px] justify-center hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#c4622d]/40 transition-all duration-200"
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
            Crafted by people who've been out there
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
        <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#fafaf8] border-t border-[#f0ebe3]">
          <InlineChat />
        </section>

        {/* ── FEATURED ADVENTURES ─────────────────────────── */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
              Our Favourites
            </p>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  Adventures of a Lifetime
                </h2>
                <div className="mt-5 w-14 h-0.5 bg-[#c4622d] rounded-full" />
              </div>
              <span className="hidden sm:flex items-center gap-1.5 text-[#c4622d] text-sm font-semibold bg-[#c4622d]/8 border border-[#c4622d]/20 px-3 py-1.5 rounded-full mb-1">
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
              className="bg-[#c4622d] hover:bg-[#d97040] text-white font-semibold px-9 py-4 rounded-xl text-base flex items-center gap-2 group shadow-lg shadow-[#c4622d]/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#c4622d]/30 transition-all duration-200"
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
            src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=2000&q=80"
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
                Signature Feature
              </p>
              <h2 className="text-white text-4xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
                India's adventures,
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
      <section className="py-24 lg:py-32 bg-[#1a1f2e] px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
                Discover by Region
              </p>
              <h2 className="text-white text-4xl lg:text-5xl font-bold tracking-tight">
                One map of Indian adventure
              </h2>
              <div className="mt-5 w-14 h-0.5 bg-[#c4622d] rounded-full" />
            </div>
            <Link
              href="/explore"
              className="hidden md:flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors group"
            >
              All regions
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {regions.map((region) => (
              <Link
                key={region.name}
                href={`/explore?region=${encodeURIComponent(region.name)}`}
                className="group relative overflow-hidden rounded-2xl h-[190px] lg:h-[260px]"
              >
                <Image
                  src={region.image}
                  alt={region.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 brightness-105 saturate-115"
                />
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                {/* Hover tint */}
                <div className="absolute inset-0 bg-[#c4622d]/0 group-hover:bg-[#c4622d]/12 transition-colors duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {/* Adventure count pill */}
                  <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-white/50 bg-white/8 border border-white/10 px-2 py-0.5 rounded-full mb-1.5">
                    {region.adventureCount} adventures
                  </span>
                  <h3 className="text-white font-bold text-sm leading-tight group-hover:text-[#f09060] transition-colors duration-200">
                    {region.name}
                  </h3>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c4622d] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADVENTURE TYPES ──────────────────────────────── */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
              Find your format
            </p>
            <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-bold tracking-tight">
              Every way to go
            </h2>
            <div className="mt-5 w-14 h-0.5 bg-[#c4622d] rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {/* LAND */}
            <div className="rounded-2xl bg-[#fdf6ee] border border-[#e8ddd0] overflow-hidden">
              <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-[#e8ddd0]">
                <span className="text-2xl">🏔️</span>
                <div>
                  <h3 className="text-[#1a1f2e] font-bold text-base">Land</h3>
                  <p className="text-[#b0a898] text-xs">Mountains, trails &amp; terrain</p>
                </div>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {[
                  { type: "Trekking", icon: "🥾", count: 94 },
                  { type: "Biking", icon: "🏍️", count: 38 },
                  { type: "Cycling", icon: "🚴", count: 27 },
                  { type: "Mountaineering", icon: "🏔️", count: 15 },
                  { type: "Rock Climbing", icon: "🧗", count: 18 },
                  { type: "Jeep Safari", icon: "🚙", count: 22 },
                  { type: "Camel Safari", icon: "🐪", count: 9 },
                  { type: "Caving", icon: "🪨", count: 7 },
                  { type: "Sandboarding", icon: "🏄", count: 5 },
                  { type: "Urban Adventure", icon: "🏙️", count: 11 },
                ].map(({ type, icon, count }) => (
                  <Link
                    key={type}
                    href={`/explore?type=${encodeURIComponent(type)}`}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#c4622d]/10 active:bg-[#c4622d]/15 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{icon}</span>
                      <span className="text-[#1a1f2e] text-sm font-medium group-hover:text-[#c4622d] transition-colors">
                        {type}
                      </span>
                    </div>
                    <span className="text-[#c4622d] text-xs font-semibold bg-[#c4622d]/10 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* WATER */}
            <div className="rounded-2xl bg-[#eef5fd] border border-[#cde0f5] overflow-hidden">
              <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-[#cde0f5]">
                <span className="text-2xl">🌊</span>
                <div>
                  <h3 className="text-[#1a1f2e] font-bold text-base">Water</h3>
                  <p className="text-[#7a9ab8] text-xs">Rivers, reefs &amp; open sea</p>
                </div>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {[
                  { type: "Diving", icon: "🤿", count: 19 },
                  { type: "Kayaking", icon: "🛶", count: 24 },
                  { type: "Surfing", icon: "🏄", count: 12 },
                  { type: "River Rafting", icon: "🌊", count: 16 },
                  { type: "Snorkelling", icon: "🐠", count: 8 },
                ].map(({ type, icon, count }) => (
                  <Link
                    key={type}
                    href={`/explore?type=${encodeURIComponent(type)}`}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#2a7cc7]/10 active:bg-[#2a7cc7]/15 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{icon}</span>
                      <span className="text-[#1a1f2e] text-sm font-medium group-hover:text-[#2a7cc7] transition-colors">
                        {type}
                      </span>
                    </div>
                    <span className="text-[#2a7cc7] text-xs font-semibold bg-[#2a7cc7]/10 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* SNOW */}
            <div className="rounded-2xl bg-[#f4f8fb] border border-[#d5e5f0] overflow-hidden">
              <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-[#d5e5f0]">
                <span className="text-2xl">❄️</span>
                <div>
                  <h3 className="text-[#1a1f2e] font-bold text-base">Snow</h3>
                  <p className="text-[#7a9aaa] text-xs">Glaciers, slopes &amp; ice</p>
                </div>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {[
                  { type: "Skiing", icon: "⛷️", count: 8 },
                  { type: "Snowboarding", icon: "🏂", count: 5 },
                  { type: "Ice Climbing", icon: "🧊", count: 4 },
                  { type: "Snow Trekking", icon: "🥾", count: 22 },
                ].map(({ type, icon, count }) => (
                  <Link
                    key={type}
                    href={`/explore?type=${encodeURIComponent(type)}`}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#6aaabf]/10 active:bg-[#6aaabf]/15 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{icon}</span>
                      <span className="text-[#1a1f2e] text-sm font-medium group-hover:text-[#4a8a9f] transition-colors">
                        {type}
                      </span>
                    </div>
                    <span className="text-[#4a8a9f] text-xs font-semibold bg-[#4a8a9f]/10 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* AIR */}
            <div className="rounded-2xl bg-[#f5f0fd] border border-[#ddd0f5] overflow-hidden">
              <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-[#ddd0f5]">
                <span className="text-2xl">🪂</span>
                <div>
                  <h3 className="text-[#1a1f2e] font-bold text-base">Air</h3>
                  <p className="text-[#9a7ab8] text-xs">Sky, altitude &amp; free flight</p>
                </div>
              </div>
              <div className="p-3">
                {/* Coming soon items — greyed out preview */}
                <div className="flex flex-col gap-1 mb-4 opacity-40 pointer-events-none select-none">
                  {[
                    { type: "Paragliding", icon: "🪂" },
                    { type: "Skydiving", icon: "🤸" },
                    { type: "Hot Air Balloon", icon: "🎈" },
                    { type: "Hang Gliding", icon: "🌬️" },
                  ].map(({ type, icon }) => (
                    <div
                      key={type}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    >
                      <span className="text-lg">{icon}</span>
                      <span className="text-[#1a1f2e] text-sm font-medium">{type}</span>
                    </div>
                  ))}
                </div>
                <div className="mx-2 rounded-xl bg-[#9a7ab8]/10 border border-[#9a7ab8]/20 px-3 py-3 text-center">
                  <p className="text-[#7a5a98] text-xs font-semibold">Coming Soon</p>
                  <p className="text-[#b8a8cc] text-xs mt-0.5 leading-snug">
                    Air adventures launching soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STORIES ──────────────────────────────────────── */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-white border-t border-[#f0ebe3]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
                From the Field
              </p>
              <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-bold tracking-tight">
                Stories from people
                <br />
                who've been there
              </h2>
              <div className="mt-5 w-14 h-0.5 bg-[#c4622d] rounded-full" />
            </div>
            <Link
              href="/stories"
              className="hidden md:flex items-center gap-1.5 text-[#1e3d2f] font-semibold hover:text-[#c4622d] transition-colors group text-sm"
            >
              All stories
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {featuredStories.map((story) => (
              <Link key={story.id} href={`/stories/${story.slug}`} className="group block">
                <div
                  className="relative rounded-2xl overflow-hidden mb-5"
                  style={{ height: "240px" }}
                >
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-105 saturate-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-[#c4622d] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-[#c4622d]/30">
                      {story.region}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/50 backdrop-blur-sm text-white/80 text-xs px-2.5 py-1 rounded-full">
                      {story.readTime}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[#1a1f2e] font-semibold text-xl leading-snug group-hover:text-[#c4622d] transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-[#7a7268] text-sm leading-relaxed line-clamp-2">
                    {story.excerpt}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c4622d] to-[#e8924d] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {story.author[0]}
                    </div>
                    <div>
                      <p className="text-[#1a1f2e] text-xs font-semibold">{story.author}</p>
                      <p className="text-[#b0a898] text-xs">{story.date}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex justify-center md:hidden">
            <Link
              href="/stories"
              className="flex items-center gap-1.5 text-[#c4622d] font-semibold text-sm"
            >
              All stories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

          {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 bg-[#f5f0e8] px-6 lg:px-8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 50%, #c4622d22 0%, transparent 55%), radial-gradient(circle at 85% 50%, #1a2e2018 0%, transparent 55%)",
          }}
        />
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #c4622d 0, #c4622d 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
          <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#c4622d] text-[#c4622d]" />
            ))}
          </div>
          <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5">
            Find your next edge.
          </h2>
          <p className="text-[#7a7268] text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            287 adventures across India. Verified operators, real terrain data, and stories from
            people who've actually been there.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/explore"
              className="bg-[#1a2e20] hover:bg-[#243d29] text-white font-semibold px-9 py-4 rounded-xl text-base flex items-center gap-2 group shadow-lg shadow-black/15 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 transition-all duration-200"
            >
              Start Exploring
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/list"
              className="border border-[#1a2e20]/25 hover:border-[#1a2e20]/60 text-[#1a2e20] font-semibold px-9 py-4 rounded-xl text-base hover:bg-white/70 hover:-translate-y-0.5 transition-all duration-200"
            >
              List Your Adventure
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ChatBubble />
    </div>
  );
}
