import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Crown, Mountain, PenLine } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import FadeInSection from "@/components/ui/custom/FadeInSection";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/custom/Breadcrumbs";

import { getPublishedStories } from "@/lib/stories";
import type { StoryDB } from "@/lib/stories";
import { AVATARS } from "@/lib/avatars";
import StoryViewPill from "@/components/ui/custom/StoryViewPill";
import StoryLikeButton from "@/components/ui/custom/StoryLikeButton";

function pickAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATARS[Math.abs(hash) % AVATARS.length].src;
}

function mapStory(s: StoryDB) {
  const tags = s.tags ?? [];
  const pillTags = tags.filter(t => t !== "Featured" && t !== "TTT Original").slice(0, 2);
  return {
    ...s,
    author: s.author_name,
    authorRole: s.author_role,
    authorBio: s.author_bio,
    authorAvatar: s.author_avatar || pickAvatar(s.author_name),
    heroImage: s.hero_image,
    readTime: s.read_time,
    slug: s.slug,
    tags,
    pillTags,
    date: s.date,
    submittedBy: s.submitted_by || undefined,
    baseLikes: s.baseLikes ?? 50,
  };
}

export const metadata: Metadata = {
  title: "Field Stories — Trail to Tides",
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

export default async function StoriesPage() {
  const dbStories = await getPublishedStories();
  const stories = dbStories.map(mapStory);
  const [featured, ...rest] = stories || [];

  if (!featured) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-16 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-none mb-4" style={{ color: "var(--text-primary)" }}>Voices from the Edge</h1>
            <p className="text-lg max-w-xl mt-4" style={{ color: "var(--text-tertiary)" }}>No stories found. Check back later.</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Breadcrumbs items={[
        { label: "Stories" },
      ]} />

      {/* Hero header */}
      <section className="pt-28 lg:pt-36 pb-10 lg:pb-14 px-6 lg:px-8 t-bg-surface2">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-bold tracking-[0.25em] uppercase mb-4">From the Trails</p>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.02] mb-5" style={{ color: "var(--text-primary)" }}>
            Voices from<br className="hidden lg:block" /> the Edge
          </h1>
          <p className="text-base md:text-lg max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
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
                    <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0" style={{ background: "#ff5100", boxShadow: "0 0 6px rgba(255,81,0,0.5)" }}>
                      <Crown className="w-3 h-3 text-black" />
                    </span>
                    <span className="text-[10px] font-bold leading-none tracking-wide" style={{ color: "#ff5100" }}>Featured</span>
                  </span>
                )}
                {featured.tags.includes("TTT Original") && (
                  <span className="flex items-center gap-1.5 rounded-full py-0 pl-0 pr-2.5"
                    style={{ background: "linear-gradient(135deg,rgba(255,81,0,0.95),rgba(220,50,0,0.9))", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 0 14px rgba(255,81,0,0.35)" }}>
                    <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0" style={{ background: "#000" }}>
                      <Mountain className="w-3 h-3" style={{ color: "#ff5100" }} />
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
                  <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden shadow-lg shadow-[#ff5100]/30" style={{ background: "rgba(255,81,0,0.2)" }}>
                    {featured.authorAvatar
                      ? <img src={featured.authorAvatar} alt={featured.author} className="w-full h-full object-cover" loading="eager" />
                      : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-[#ff5100]">{featured.author[0]}</span>}
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
      <FadeInSection as="section" className="py-14 lg:py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 lg:mb-10">
            <div className="flex items-center gap-3">
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>All Voices</h2>
              <span className="text-[#ff5100] text-xs font-semibold bg-[#ff5100]/8 border border-[#ff5100]/20 px-2.5 py-1 rounded-full">{rest.length}</span>
            </div>
            <p className="text-sm hidden sm:block" style={{ color: "var(--text-muted)" }}>{rest.length} {rest.length === 1 ? "story" : "stories"}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {rest.map((story) => (
              <div key={story.id} className="flex flex-col">
                {/* Badge slot above card */}
                <div className="h-7 flex items-center gap-1.5 mb-0.5">
                  {story.tags.includes("Featured") && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full relative overflow-hidden"
                      style={{ background: "linear-gradient(105deg, #1a0a00 0%, #2d1200 40%, #1a0a00 100%)", border: "1px solid rgba(255,81,0,0.35)", boxShadow: "0 0 10px rgba(255,81,0,0.18), inset 0 1px 0 rgba(255,140,80,0.12)" }}>
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,120,60,0.08) 50%, transparent 70%)" }} />
                      <Crown className="w-2.5 h-2.5 shrink-0" style={{ color: "#ff7d47", fill: "#ff7d47", filter: "drop-shadow(0 0 3px rgba(255,81,0,0.7))" }} />
                      <span className="text-[9px] font-bold tracking-[0.22em] uppercase leading-none" style={{ color: "#ffb38a" }}>Featured</span>
                    </div>
                  )}
                  {story.tags.includes("TTT Original") && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full relative overflow-hidden"
                      style={{ background: "linear-gradient(105deg, #1a0a00 0%, #2d1200 40%, #1a0a00 100%)", border: "1px solid rgba(255,81,0,0.35)", boxShadow: "0 0 10px rgba(255,81,0,0.18), inset 0 1px 0 rgba(255,140,80,0.12)" }}>
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,120,60,0.08) 50%, transparent 70%)" }} />
                      <Mountain className="w-2.5 h-2.5 shrink-0" style={{ color: "#ff7d47", filter: "drop-shadow(0 0 3px rgba(255,81,0,0.7))" }} />
                      <span className="text-[9px] font-bold tracking-[0.22em] uppercase leading-none" style={{ color: "#ffb38a" }}>TTT Original</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/stories/${story.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-black/[0.03] hover:border-[#ff5100]/40"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
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

                    {/* Top-left: read time + views */}
                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
                      <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/15 text-white/90 text-[10px] font-medium px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> {story.readTime}
                      </span>
                      <StoryViewPill slug={story.slug} className="!bg-black/50 !border-white/15 !text-white/90 !text-[10px] !px-2.5 !py-1 !font-medium" />
                    </div>

                    {/* Top-right: like button */}
                    <div className="absolute top-3 right-3 z-10">
                      <StoryLikeButton slug={story.slug} baseLikes={story.baseLikes} />
                    </div>

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
                    <h3 className="text-lg font-bold leading-snug mb-2.5 group-hover:text-[#ff5100] transition-colors duration-200" style={{ color: "var(--text-primary)" }}>
                      {story.title}
                    </h3>
                    <p className="text-sm leading-relaxed line-clamp-2 mb-4 flex-1" style={{ color: "var(--text-secondary)" }}>
                      {story.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#ff5100]/30">
                          {story.authorAvatar
                            ? <img src={story.authorAvatar} alt={story.author} className="w-full h-full object-cover" loading="eager" />
                            : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-[#ff5100] bg-[#ff5100]/20">{story.author[0]}</span>}
                        </div>
                        <div>
                          <p className="text-xs font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>{story.author}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{story.date}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* CTA */}
      <FadeInSection as="section" className="py-10 lg:py-14 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden flex flex-col sm:flex-row items-center gap-5 px-6 py-5" style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.18)" }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(255,81,0,0.08)_0%,_transparent_65%)] pointer-events-none" />
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ background: "rgba(255,81,0,0.15)", border: "1px solid rgba(255,81,0,0.25)" }}>
              <PenLine className="w-4.5 h-4.5 text-[#ff5100]" />
            </div>
            <div className="flex-1 min-w-0 relative text-center sm:text-left">
              <p className="font-bold text-sm leading-snug" style={{ color: "var(--text-primary)" }}>Got a story to tell?</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>We feature stories from verified adventurers. Something remarkable out there? We want to hear it.</p>
            </div>
            <Link
              href="/stories/submit"
              className="relative shrink-0 inline-flex items-center gap-1.5 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 group whitespace-nowrap"
              style={{ background: "#ff5100", boxShadow: "0 4px 14px rgba(255,81,0,0.25)" }}
            >
              Share Your Story
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </FadeInSection>

      <Footer />
    </div>
  );
}
