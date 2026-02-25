import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Map, ChevronRight, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import HeroSlider from "@/components/ui/custom/HeroSlider";
import { adventures, stories, regions, adventureTypes } from "@/lib/data";

const featuredAdventures = adventures.filter((a) => a.featured).slice(0, 6);
const featuredStories = stories.slice(0, 3);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center" style={{ overflow: "hidden" }}>
        <HeroSlider />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* eyebrow */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f07a42] mr-2.5 animate-pulse" />
            <p className="text-white text-xs font-semibold tracking-[0.18em] uppercase">
              India's First Adventure Discovery &amp; Aggregator Platform
            </p>
          </div>

          {/* headline */}
          <h1
            className="font-bold tracking-tight mb-6"
            style={{
              fontSize: "clamp(2.8rem, 7.5vw, 6rem)",
              lineHeight: 1.1,
              color: "white",
              textShadow: "0 2px 20px rgba(0,0,0,0.7)",
            }}
          >
            <span style={{ display: "block" }}>
              From Mountain{" "}
              <em style={{ fontStyle: "italic", fontWeight: 700, color: "white" }}>Trail</em>
            </span>
            <span
              style={{
                display: "block",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.3) 70%, transparent)",
                margin: "0.3em auto",
                maxWidth: "460px",
              }}
            />
            <span style={{ display: "block" }}>
              To Ocean{" "}
              <em style={{ fontStyle: "italic", fontWeight: 700, color: "white" }}>Tides</em>
            </span>
          </h1>

          {/* subheading */}
          <p
            className="text-white/85 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}
          >
            Discover epic adventures across India — from frozen Himalayan rivers to coral reefs in the Andamans — handpicked, trusted and perfectly mapped.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/explore"
              className="bg-[#c4622d] hover:bg-[#d97040] text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-300 flex items-center gap-2 group shadow-xl shadow-black/30"
            >
              Explore Adventures
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/map"
              className="bg-white/12 hover:bg-white/22 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-xl text-base border border-white/25 transition-all duration-300 flex items-center gap-2"
            >
              <Map className="w-4 h-4" />
              View the Map
            </Link>
          </div>

          <p className="mt-7 text-white/40 text-xs tracking-[0.15em] uppercase">
            Crafted by people who've been out there
          </p>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section className="bg-[#141920] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
            {[
              { value: "287", label: "Adventures" },
              { value: "6", label: "Regions" },
              { value: "8", label: "Adventure Types" },
              { value: "48+", label: "Verified Operators" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center py-7 px-6">
                <div className="text-white text-3xl font-bold tracking-tight">{value}</div>
                <div className="text-white/35 text-xs mt-1.5 tracking-wide uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ADVENTURES ─────────────────────────── */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-14">
            <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
              Our Favourites
            </p>
            <div className="flex items-end justify-between">
              <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Adventures of a Lifetime
              </h2>
            </div>
            {/* thin accent line */}
            <div className="mt-5 w-14 h-0.5 bg-[#c4622d] rounded-full" />
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {featuredAdventures.map((adventure) => (
              <AdventureCard key={adventure.id} adventure={adventure} size="default" />
            ))}
          </div>

          {/* View all — centered */}
          <div className="mt-14 flex justify-center">
            <Link
              href="/explore"
              className="bg-[#c4622d] hover:bg-[#d97040] text-white font-semibold px-9 py-4 rounded-xl text-base transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-[#c4622d]/25"
            >
              View all adventures
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAP CTA ───────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 bg-[#1a2e20] px-6 lg:px-8 overflow-hidden">
        {/* background texture */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=2000&q=60"
            alt="India map texture"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a2e20]/95 via-[#1a2e20]/80 to-transparent" />
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
              <p className="text-white/75 text-lg md:text-xl leading-relaxed mb-9 max-w-lg" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
                Every adventure across India — trekking, diving, cycling, skiing — on one interactive map. Filter by region, difficulty, or type.
              </p>
            <Link
              href="/map"
              className="inline-flex items-center gap-2.5 bg-white text-[#1a2e20] font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#f0f7f1] transition-colors group shadow-xl shadow-black/20"
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
          <div className="mb-12">
            <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
              Discover by Region
            </p>
            <h2 className="text-white text-4xl lg:text-5xl font-bold tracking-tight">
              One map of Indian adventure
            </h2>
            <div className="mt-5 w-14 h-0.5 bg-[#c4622d] rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {regions.map((region) => (
              <Link
                key={region.name}
                href={`/explore?region=${encodeURIComponent(region.name)}`}
                className="group relative overflow-hidden rounded-2xl h-[190px] lg:h-[250px]"
              >
                <Image
                  src={region.image}
                  alt={region.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 brightness-105 saturate-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-sm leading-tight">{region.name}</h3>
                  <p className="text-white/45 text-xs mt-1">{region.adventureCount} adventures</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADVENTURE TYPES ──────────────────────────────── */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
              Find your format
            </p>
            <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-bold tracking-tight">
              Every way to go
            </h2>
            <div className="mt-5 w-14 h-0.5 bg-[#c4622d] rounded-full" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4">
            {adventureTypes.map(({ type, icon, count }) => (
              <Link
                key={type}
                href={`/explore?type=${encodeURIComponent(type)}`}
                className="group bg-white border border-[#e8e2d9] hover:border-[#c4622d] rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <div className="text-[#1a1f2e] text-sm font-medium leading-tight group-hover:text-[#c4622d] transition-colors">{type}</div>
                <div className="text-[#b0a898] text-xs mt-1">{count}</div>
              </Link>
            ))}
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
              className="hidden md:flex items-center gap-2 text-[#1e3d2f] font-medium hover:text-[#c4622d] transition-colors group text-sm"
            >
              All stories
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {featuredStories.map((story) => (
              <Link key={story.id} href={`/stories/${story.slug}`} className="group block">
                <div className="relative h-58 rounded-2xl overflow-hidden mb-5" style={{ height: "230px" }}>
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-105 saturate-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-[#c4622d] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      {story.region}
                    </span>
                  </div>
                  {/* read time chip */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/40 backdrop-blur-sm text-white/80 text-xs px-2.5 py-1 rounded-full">
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
                    <div className="w-8 h-8 rounded-full bg-[#e8e2d9] flex items-center justify-center text-xs font-bold text-[#6b6560]">
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
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-[#f5f0e8] px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* stars */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#c4622d] text-[#c4622d]" />
            ))}
          </div>
          <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5">
            Find your next edge.
          </h2>
          <p className="text-[#7a7268] text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            287 adventures across India. Verified operators, real terrain data, and stories from people who've actually been there.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/explore"
              className="bg-[#1a2e20] hover:bg-[#243d29] text-white font-semibold px-9 py-4 rounded-xl text-base transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-black/15"
            >
              Start Exploring
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/list"
              className="border border-[#1a2e20]/25 hover:border-[#1a2e20]/60 text-[#1a2e20] font-semibold px-9 py-4 rounded-xl text-base transition-all duration-300 hover:bg-white/60"
            >
              List Your Adventure
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
