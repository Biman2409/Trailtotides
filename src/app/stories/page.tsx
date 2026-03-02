import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Crown, Mountain } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Field Stories — Trail to Tides",
  description:
    "First-hand accounts from adventurers across India — high-altitude treks, ocean dives, desert rides, and everything in between.",
  openGraph: {
    title: "Field Stories — Trail to Tides",
    description: "First-hand accounts from adventurers across India — high-altitude treks, ocean dives, desert rides, and everything in between.",
    url: "https://trailtotides.com/stories",
    images: [{ url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trailtotides.com/stories" },
};
import { stories } from "@/lib/data";
import StoryViewPill from "@/components/ui/custom/StoryViewPill";

// Tags that are rendered as orange badge pills (not content pills)
const BADGE_TAGS = ["Featured", "TTT Original"];

export default function StoriesPage() {
  const [featured, ...rest] = stories || [];

  if (!featured) {
    return (
      <div className="min-h-screen bg-[#111820]">
        <Navbar />
        <section className="pt-32 pb-16 px-6 lg:px-8 bg-[#1a1f2e]">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-white text-5xl lg:text-7xl font-semibold tracking-tight leading-none mb-4">
              Voices from the Edge
            </h1>
            <p className="text-white/50 text-lg max-w-xl mt-4">
              No stories found. Check back later.
            </p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111820]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 lg:px-8 bg-[#1a1f2e]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            From the Field
          </p>
          <h1 className="text-white text-5xl lg:text-7xl font-semibold tracking-tight leading-none mb-4">
            Voices from the Edge
          </h1>
          <p className="text-white/50 text-lg max-w-xl mt-4">
            Not travel bloggers. Not influencers. Real people who pushed past the edge and had the guts to write it down.
          </p>
        </div>
      </section>

      {/* Featured story */}
      <section className="px-6 lg:px-8 -mt-1 bg-[#1a1f2e] pb-16">
        <div className="max-w-7xl mx-auto">
          <Link href={`/stories/${featured.slug}`} className="group block">
            <div className="relative h-[420px] lg:h-[540px] rounded-3xl overflow-hidden">
              <Image
                src={featured.heroImage}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ objectFit: "cover" }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                {/* Badge pills (Featured, TTT Original) */}
                <div className="flex items-center gap-2 mb-2">
                  {featured.tags.includes("Featured") && (
                    <span className="flex items-center gap-1.5 bg-black text-[#ff5100] text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-[#ff5100]/20">
                      <Crown className="w-3 h-3" /> Featured
                    </span>
                  )}
                  {featured.tags.includes("TTT Original") && (
                    <span className="flex items-center gap-1.5 bg-[#ff5100] text-black text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-[#ff5100]/20">
                      <Mountain className="w-3 h-3" /> TTT Original
                    </span>
                  )}
                </div>
                {/* Content tags — all non-badge tags */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {featured.tags.filter((t) => !BADGE_TAGS.includes(t)).map((tag) => (
                    <span key={tag} className="bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs px-3 py-1.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-white text-3xl lg:text-5xl font-semibold tracking-tight leading-tight mb-3 max-w-2xl group-hover:text-white/90 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-white/60 text-base max-w-2xl leading-relaxed mb-5 hidden lg:block">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-8 h-8 rounded-full bg-[#ff5100]/40 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md shadow-[#ff5100]/20">
                    {featured.author[0]}
                  </div>
                  <div className="mr-2">
                    <p className="text-white text-sm font-medium">{featured.author}</p>
                    <p className="text-white/40 text-xs">{featured.authorRole}</p>
                  </div>
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/70 text-xs px-3 py-1.5 rounded-full">
                    <Clock className="w-3 h-3" /> {featured.readTime}
                  </span>
                  <StoryViewPill slug={featured.slug} />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* All stories grid */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[#1a1f2e] text-2xl font-semibold mb-10">All Voices from the Edge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((story) => (
              <Link key={story.id} href={`/stories/${story.slug}`} className="group block">
                <div className="relative h-52 rounded-2xl overflow-hidden mb-5 shadow-md group-hover:shadow-xl group-hover:shadow-black/15 transition-shadow duration-300">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {/* Content tags on image — all non-badge tags */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 flex-wrap">
                    {story.tags.filter((t) => !BADGE_TAGS.includes(t)).map((tag) => (
                      <span key={tag} className="bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs px-3 py-1.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[#1a1f2e] text-xl font-semibold leading-snug mb-2 group-hover:text-[#ff5100] transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-[#6b6560] text-sm leading-relaxed line-clamp-2 mb-4">
                    {story.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#e0d8cc] flex items-center justify-center text-xs font-bold text-[#6b6560]">
                        {story.author[0]}
                      </div>
                      <div>
                        <p className="text-[#1a1f2e] text-xs font-semibold">{story.author}</p>
                        <p className="text-[#9a9590] text-xs">{story.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 bg-black/5 border border-black/10 text-[#6b6560] text-xs px-3 py-1.5 rounded-full">
                        <Clock className="w-3 h-3" /> {story.readTime}
                      </span>
                      <StoryViewPill slug={story.slug} className="!bg-black/5 !border-black/10 !text-[#6b6560]" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-8 bg-[#f5f0e8]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[#1a1f2e] text-3xl lg:text-5xl font-semibold tracking-tight mb-4">
            Got a story to tell?
          </h2>
          <p className="text-[#6b6560] text-base leading-relaxed mb-8 max-w-lg mx-auto">
            We feature stories from verified adventurers. If you&apos;ve done something remarkable out there, we want to hear it.
          </p>
          <Link
            href="/list"
            className="inline-flex items-center gap-2 bg-[#1e3d2f] hover:bg-[#2d5a42] text-white font-medium px-8 py-4 rounded-xl text-base transition-colors group"
          >
            Share Your Story
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
