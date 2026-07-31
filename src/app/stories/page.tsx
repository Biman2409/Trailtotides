import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Crown, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import FadeInSection from "@/components/ui/custom/FadeInSection";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/custom/Breadcrumbs";
import ShareStoryCTA from "@/components/ui/custom/ShareStoryCTA";

import { getPublishedStories } from "@/lib/stories";
import type { StoryDB } from "@/lib/stories";
import { AVATARS } from "@/lib/avatars";
import StoryCard from "@/components/ui/custom/StoryCard";
import StoryLikeButton from "@/components/ui/custom/StoryLikeButton";
import StoryShareButton from "@/components/ui/custom/StoryShareButton";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

function pickAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATARS[Math.abs(hash) % AVATARS.length].src;
}

function mapStory(s: StoryDB) {
  const tags = s.tags ?? [];
  // Exclude the region — it's already shown via the location pin next to the pills.
  const pillTags = tags
    .filter(t => t !== "Featured" && t !== "TTT Original" && t.toLowerCase() !== s.region.toLowerCase())
    .slice(0, 1);
  return {
    ...s,
    author: s.author_name,
    authorRole: s.author_role,
    authorBio: s.author_bio,
    authorAvatar: s.author_avatar || pickAvatar(s.author_name),
    heroImage: s.hero_image,
    slug: s.slug,
    tags,
    pillTags,
    date: s.date,
    adventureDate: s.date,
    submittedBy: s.submitted_by || undefined,
    baseLikes: s.baseLikes ?? 50,
  };
}

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

              {/* Top-left: Featured ribbon */}
              {featured.tags.includes("Featured") && (
                <div
                  className="absolute top-5 left-5 flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full backdrop-blur-md"
                  style={{ background: "rgba(10,8,6,0.72)", border: "1px solid rgba(255,179,122,0.3)" }}
                >
                  <Crown className="w-3 h-3" style={{ color: "#ffb37a" }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "#ffd9b8" }}>Featured</span>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
                {/* Quiet meta line */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] mb-4 text-white/70">
                  {(featured.pillTags ?? featured.tags.filter((t) => !BADGE_TAGS.includes(t)).slice(0, 1)).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 shrink-0" style={{ color: "#ff5100" }}>
                      {ADVENTURE_TYPE_ICONS[tag]?.(12)}
                      {tag}
                    </span>
                  ))}
                  <span className="opacity-50">·</span>
                  <span className="inline-flex items-center gap-1 shrink-0" style={{ color: "#ff5100" }}>
                    <MapPin className="w-3 h-3" />
                    {featured.region}
                  </span>
                </div>

                <h2 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-3 max-w-2xl group-hover:text-[#ff5100] transition-colors duration-300">
                  {featured.title}
                </h2>
                <p className="text-white/60 text-base max-w-2xl leading-relaxed mb-6 hidden md:block">
                  {featured.excerpt}
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative w-9 h-9 rounded-full flex-shrink-0 overflow-hidden shadow-lg shadow-[#ff5100]/30" style={{ background: "rgba(255,81,0,0.2)" }}>
                    {featured.authorAvatar
                      ? <Image src={featured.authorAvatar} alt={featured.author} fill sizes="36px" className="object-cover" />
                      : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-[#ff5100]">{featured.author[0]}</span>}
                  </div>
                  <div className="mr-1">
                    <p className="text-white text-sm font-semibold">{featured.author}</p>
                    <p className="text-white/50 text-base" style={{ fontFamily: "var(--font-script)", fontWeight: 600 }}>{featured.authorRole}</p>
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#ff5100" }}>
                    {featured.adventureDate}
                  </span>
                  <div className="flex items-center gap-3 ml-auto">
                    <StoryLikeButton slug={featured.slug} baseLikes={featured.baseLikes} pill />
                    <StoryShareButton title={featured.title} slug={featured.slug} />
                    <span className="text-[#ff5100] text-sm font-semibold flex items-center gap-1.5 group-hover:gap-3 transition-all duration-200">
                      Read story <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
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
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* CTA */}
      <FadeInSection as="section" className="py-10 lg:py-14 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ShareStoryCTA
            subtext={["We feature stories from verified adventurers.", "Something remarkable out there? We want to hear it."]}
          />
        </div>
      </FadeInSection>

      <Footer />
    </div>
  );
}
