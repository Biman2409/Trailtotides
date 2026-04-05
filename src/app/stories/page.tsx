import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Crown, Mountain, PenLine } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { stories } from "@/lib/data";
import StoryViewPill from "@/components/ui/custom/StoryViewPill";

export const metadata: Metadata = {
  title: "Field Stories",
  description:
    "First-hand accounts from real adventurers across India — high-altitude treks, ocean dives, desert rides, and everything in between.",
  openGraph: {
    title: "Field Stories — Trail to Tides",
    description: "First-hand accounts from real adventurers across India — high-altitude treks, ocean dives, desert rides, and everything in between.",
    url: "https://trailtotides.com/stories",
    images: [{ url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=90", width: 1200, height: 630, alt: "Field Stories — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Stories — Trail to Tides",
    description: "First-hand accounts from real adventurers across India.",
    images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=90"],
  },
  alternates: { canonical: "https://trailtotides.com/stories" },
};

const BADGE_TAGS = ["Featured", "TTT Original"];

export default function StoriesPage() {
  const [featured, ...rest] = stories || [];

  if (!featured) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-16 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-white text-5xl lg:text-7xl font-bold tracking-tight leading-none mb-4">Voices from the Edge</h1>
            <p className="text-white/50 text-lg max-w-xl mt-4">No stories found. Check back later.</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero header */}
      <section className="pt-28 lg:pt-36 pb-10 lg:pb-14 px-6 lg:px-8 t-bg-surface2">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-bold tracking-[0.25em] uppercase mb-4">From the Trails</p>
          <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.02] mb-5">
            Voices from<br className="hidden lg:block" /> the Edge
          </h1>
          <p className="text-white/45 text-base md:text-lg max-w-2xl leading-relaxed">
            Not travel bloggers. Not influencers. Real people who pushed past the edge — and had the guts to write it down.
          </p>
        </div>
      </section>

      {/* Featured story */}
      <section className="px-6 lg:px-8 t-bg-surface2 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto">
          <Link href={`/stories/${featured.slug}`} className="group block">
            <div className="relative h-[380px] md:h-[480px] lg:h-[580px] rounded-2xl lg:rounded-3xl overflow-hidden ring-1 ring-white/10 group-hover:ring-[#ff5100]/40 transition-all duration-500 shadow-2xl">
              <Image
                src={featured.heroImage}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ objectFit: "cover" }}
                priority
              />
              {/* Multi-layer gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

              {/* Top-left badge */}
              <div className="absolute top-5 left-5 flex items-center gap-2">
                {featured.tags.includes("Featured") && (
                  <span className="flex items-center gap-1.5 rounded-full py-0 pl-0 pr-2.5"
                    style={{ background: "rgba(10,10,10,0.75)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,81,0,0.35)", boxShadow: "0 0 12px rgba(255,81,0,0.15)" }}>
                    <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#ff5100,#ff7d47)", boxShadow: "0 0 6px rgba(255,81,0,0.5)" }}>
                      <Crown className="w-3 h-3 text-white" />
                    </span>
                    <span className="text-[10px] font-bold leading-none tracking-wide" style={{ color: "#ff5100" }}>Featured</span>
                  </span>
                )}
                {featured.tags.includes("TTT Original") && (
                  <span className="flex items-center gap-1.5 rounded-full py-0 pl-0 pr-2.5"
                    style={{ background: "linear-gradient(135deg,rgba(255,81,0,0.95),rgba(220,50,0,0.9))", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 0 14px rgba(255,81,0,0.35)" }}>
                    <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.22)" }}>
                      <Mountain className="w-3 h-3 text-white" />
                    </span>
                    <span className="text-[10px] font-bold leading-none tracking-wide text-white">TTT Original</span>
                  </span>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
                {/* Content pills */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {(featured.pillTags ?? featured.tags.filter((t) => !BADGE_TAGS.includes(t)).slice(0, 2)).map((tag) => (
                    <span key={tag} className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-3 max-w-2xl group-hover:text-[#ff5100] transition-colors duration-300">
                  {featured.title}
                </h2>
                <p className="text-white/60 text-base max-w-2xl leading-relaxed mb-6 hidden md:block">
                  {featured.excerpt}
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-9 h-9 rounded-full bg-[#ff5100] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg shadow-[#ff5100]/30">
                    {featured.author[0]}
                  </div>
                  <div className="mr-1">
                    <p className="text-white text-sm font-semibold">{featured.author}</p>
                    <p className="text-white/40 text-xs">{featured.authorRole}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-1">
                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/70 text-xs px-3 py-1.5 rounded-full">
                      <Clock className="w-3 h-3" /> {featured.readTime}
                    </span>
                    <StoryViewPill slug={featured.slug} />
                  </div>
                  <span className="ml-auto text-[#ff5100] text-sm font-semibold flex items-center gap-1.5 group-hover:gap-3 transition-all duration-200">
                    Read story <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* All stories grid */}
      <section className="py-14 lg:py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 lg:mb-10">
            <div className="flex items-center gap-3">
              <h2 className="text-white text-xl lg:text-2xl font-bold tracking-tight">All Voices</h2>
              <span className="text-[#ff5100] text-xs font-semibold bg-[#ff5100]/8 border border-[#ff5100]/20 px-2.5 py-1 rounded-full">{rest.length}</span>
            </div>
            <p className="text-white/25 text-sm hidden sm:block">{rest.length} {rest.length === 1 ? "story" : "stories"}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {rest.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.slug}`}
                className="group flex flex-col bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden hover:border-[#ff5100]/40 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
              >
                {/* Image */}
                <div className="relative h-52 md:h-56 overflow-hidden flex-shrink-0">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
                    {(story.pillTags ?? story.tags.filter((t) => !BADGE_TAGS.includes(t)).slice(0, 2)).map((tag) => (
                      <span key={tag} className="bg-black/50 backdrop-blur-sm border border-white/15 text-white/90 text-[10px] font-medium px-2.5 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 lg:p-6">
                  <h3 className="text-white text-lg font-bold leading-snug mb-2.5 group-hover:text-[#ff5100] transition-colors duration-200">
                    {story.title}
                  </h3>
                  <p className="text-white/45 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                    {story.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/8">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#ff5100]/20 border border-[#ff5100]/30 flex items-center justify-center text-xs font-bold text-[#ff5100]">
                        {story.author[0]}
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold leading-tight">{story.author}</p>
                        <p className="text-white/35 text-[10px]">{story.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 bg-white/6 border border-white/8 text-white/40 text-[10px] px-2.5 py-1 rounded-full">
                        <Clock className="w-2.5 h-2.5" /> {story.readTime}
                      </span>
                      <StoryViewPill slug={story.slug} className="!text-[10px] !px-2.5 !py-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#ff5100]/10 via-white/[0.02] to-transparent p-8 md:p-10 lg:p-14 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#ff5100/8_0%,_transparent_70%)]" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ff5100]/15 border border-[#ff5100]/25 mb-6">
                <PenLine className="w-6 h-6 text-[#ff5100]" />
              </div>
              <h2 className="text-white text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Got a story to tell?
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8 max-w-lg mx-auto">
                We feature stories from verified adventurers. If you&apos;ve done something remarkable out there, we want to hear it.
              </p>
              <Link
                href="/stories/submit"
                className="inline-flex items-center gap-2 bg-[#ff5100] hover:bg-[#e04800] text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200 group shadow-lg shadow-[#ff5100]/20"
              >
                Share Your Story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
