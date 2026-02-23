import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Map, ChevronRight } from "lucide-react";
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
        <section className="relative h-screen min-h-[700px] flex items-center justify-center" style={{overflow: "hidden"}}>
        <HeroSlider />

        {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            {/* eyebrow */}
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
                <p className="text-white text-xs font-semibold tracking-[0.18em] uppercase">
                  India's First Adventure Discovery &amp; Aggregator Platform
                </p>
              </div>

              {/* headline */}
              <h1
                className="font-bold tracking-tight mb-6"
                style={{
                  fontSize: "clamp(2.8rem, 7.5vw, 6rem)",
                  lineHeight: 1.12,
                  color: "white",
                  textShadow: "0 2px 20px rgba(0,0,0,0.7)",
                }}
              >
                  {/* Line 1 */}
                  <span style={{ display: "block" }}>
                    From Mountain{" "}
                    <em style={{ fontStyle: "italic", fontWeight: 700, color: "white" }}>
                      Trail
                    </em>
                  </span>

                  {/* Thin divider line between the two rows */}
                  <span
                    style={{
                      display: "block",
                      height: "2px",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.35) 70%, transparent)",
                      margin: "0.35em auto",
                      maxWidth: "520px",
                    }}
                  />

                  {/* Line 2 */}
                  <span style={{ display: "block" }}>
                    To Ocean{" "}
                    <em style={{ fontStyle: "italic", fontWeight: 700, color: "white" }}>
                      Tides
                    </em>
                  </span>
              </h1>

              {/* subheading — exactly 2 lines */}
              <p
                className="text-white text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10 font-medium"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,1)" }}
              >
                Discover treks, rides &amp; wild experiences across India —<br />
                curated, verified, and beautifully mapped.
              </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/explore"
                className="bg-[#c4622d] hover:bg-[#e07845] text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-black/30"
              >
                Explore Adventures
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/map"
                className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl text-base border border-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <Map className="w-4 h-4" />
                View the Map
              </Link>
            </div>
          </div>

      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section className="bg-[#1a1f2e] py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/10">
            {[
              { value: "287", label: "Adventures" },
              { value: "6", label: "Regions" },
              { value: "8", label: "Adventure Types" },
              { value: "48+", label: "Verified Operators" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center md:px-8">
                <div className="text-white text-3xl font-semibold tracking-tight">{value}</div>
                <div className="text-white/40 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ADVENTURES ─────────────────────────── */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
                  <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                    Our Favourites
                  </p>
                  <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                    Adventure of a Lifetime
                  </h2>
            </div>
            <Link
              href="/explore"
              className="hidden md:flex items-center gap-2 text-[#1e3d2f] font-medium hover:text-[#c4622d] transition-colors group"
            >
              View all
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAdventures.map((adventure, i) => (
                <AdventureCard
                  key={adventure.id}
                  adventure={adventure}
                  size="default"
                />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-[#1e3d2f] font-medium"
            >
              View all adventures <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── REGIONS ──────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#1a1f2e] px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Discover by Region
            </p>
            <h2 className="text-white text-4xl lg:text-5xl font-semibold tracking-tight">
              One map of Indian adventure
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {regions.map((region) => (
              <Link
                key={region.name}
                href={`/explore?region=${encodeURIComponent(region.name)}`}
                className="group relative overflow-hidden rounded-2xl h-[200px] lg:h-[260px]"
              >
                <Image
                  src={region.image}
                  alt={region.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-base leading-tight">
                    {region.name}
                  </h3>
                  <p className="text-white/50 text-xs mt-1">{region.adventureCount} adventures</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADVENTURE TYPES ──────────────────────────────── */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Find your format
            </p>
            <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-semibold tracking-tight">
              Every way to go
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {adventureTypes.map(({ type, icon, count }) => (
              <Link
                key={type}
                href={`/explore?type=${encodeURIComponent(type)}`}
                className="group bg-white border border-[#e0d8cc] hover:border-[#1e3d2f] rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <div className="text-[#1a1f2e] text-sm font-medium leading-tight">{type}</div>
                <div className="text-[#9a9590] text-xs mt-1">{count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP CTA ───────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#1e3d2f] px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=2000&q=60"
            alt="India map texture"
            fill
            className="object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              Signature Feature
            </p>
            <h2 className="text-white text-4xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6">
              India's adventures,
              <br />
              mapped.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
              Toggle adventure layers — treks, rides, water sports — across a live India map.
              Every pin opens a full experience card. Adventure density at a glance.
            </p>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-white text-[#1e3d2f] font-semibold px-8 py-4 rounded-xl text-base hover:bg-[#f5f0e8] transition-colors group"
            >
              <Map className="w-5 h-5" />
              Open the Map
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STORIES ──────────────────────────────────────── */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                From the Field
              </p>
              <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-semibold tracking-tight">
                Stories from people
                <br />
                who've been there
              </h2>
            </div>
            <Link
              href="/stories"
              className="hidden md:flex items-center gap-2 text-[#1e3d2f] font-medium hover:text-[#c4622d] transition-colors group"
            >
              All stories
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredStories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.slug}`}
                className="group block"
              >
                <div className="relative h-56 rounded-2xl overflow-hidden mb-4">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-[#c4622d] text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      {story.region}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[#1a1f2e] font-semibold text-xl leading-snug group-hover:text-[#c4622d] transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-[#6b6560] text-sm leading-relaxed line-clamp-2">
                    {story.excerpt}
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-7 h-7 rounded-full bg-[#e0d8cc] flex items-center justify-center text-xs font-semibold text-[#6b6560]">
                      {story.author[0]}
                    </div>
                    <div>
                      <p className="text-[#1a1f2e] text-xs font-medium">{story.author}</p>
                      <p className="text-[#9a9590] text-xs">{story.readTime} · {story.date}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#f5f0e8] px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[#1a1f2e] text-4xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6">
            Find your next edge.
          </h2>
          <p className="text-[#6b6560] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            287 adventures across India. Verified operators, real terrain data, and stories from people who've actually been there.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="bg-[#1e3d2f] hover:bg-[#2d5a42] text-white font-medium px-8 py-4 rounded-xl text-base transition-all duration-300 flex items-center gap-2 group"
            >
              Start Exploring
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/list"
              className="border border-[#1e3d2f]/30 hover:border-[#1e3d2f] text-[#1e3d2f] font-medium px-8 py-4 rounded-xl text-base transition-all duration-300"
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
