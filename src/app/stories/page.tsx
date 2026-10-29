import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Crown, MapPin, PenLine, ShieldCheck, Send, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/custom/Breadcrumbs";
import StoryLikeButton from "@/components/ui/custom/StoryLikeButton";
import StoryShareButton from "@/components/ui/custom/StoryShareButton";
import { getPublishedStories } from "@/lib/stories";
import { mapStory, storyImage } from "@/lib/storyView";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import StoriesBrowser from "./StoriesBrowser";
import SectionTexture from "@/components/ui/custom/SectionTexture";

const serif = { fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600 } as const;
const script = { fontFamily: "var(--font-script), cursive", fontWeight: 600 } as const;

export const metadata: Metadata = {
  title: "Field Stories",
  description:
    "First-hand accounts from real adventurers across India — high-altitude treks, ocean dives, desert rides, and everything in between.",
  openGraph: {
    title: "Field Stories — Trail to Tides",
    description: "First-hand accounts from real adventurers across India — high-altitude treks, ocean dives, desert rides, and everything in between.",
    url: "https://www.trailtotides.com/stories",
    images: [{ url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=90", width: 1200, height: 630, alt: "Field Stories — Trail to Tides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Stories — Trail to Tides",
    description: "First-hand accounts from real adventurers across India.",
    images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=90"],
  },
  alternates: { canonical: "https://www.trailtotides.com/stories" },
};

// How a story gets from a writer to the page, shown in the "Write for us" band
const STEPS = [
  { icon: PenLine, title: "Write it", text: "What happened, in your own words. No word limit, no polish needed." },
  { icon: ShieldCheck, title: "We read every one", text: "An editor checks it within a few days and may tidy spelling or length." },
  { icon: Send, title: "It goes live", text: "Published under your name, with your photo, for the next person to find." },
];

export default async function StoriesPage() {
  const stories = (await getPublishedStories()).map(mapStory);
  const featured = stories.find((s) => s.tags.includes("Featured")) ?? stories[0];
  const places = new Set(stories.map((s) => s.region.trim().toLowerCase())).size;

  return (
    <div className="min-h-screen t-bg-page topo">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 lg:pt-24 pb-10 sm:pb-14" style={{ background: "linear-gradient(180deg, rgba(255,81,0,0.07), transparent 85%)" }}>
        <SectionTexture kind="trail" color="#ff5100" at="85% 20%" opacity={0.08} />
        <Breadcrumbs items={[{ label: "Stories" }]} />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-4 sm:pt-8 grid lg:grid-cols-[1fr_auto] gap-8 lg:items-end">
          <div>
            <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-ink)" }}>Stories</p>
            <h1 className="text-[42px] sm:text-6xl lg:text-7xl t-text leading-[1.02]" style={{ ...serif, letterSpacing: "-0.025em" }}>
              Voices from the Edge
            </h1>
            <p className="text-[17px] sm:text-[19px] leading-[1.55] t-text-2 mt-4 max-w-2xl">
              Not travel bloggers. Not influencers. Real people who went, came back, and wrote down what it was actually like.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-7">
              <Link href="/stories/submit" className="group inline-flex items-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] text-white text-sm font-semibold pl-4 pr-3.5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5" style={{ boxShadow: "0 6px 18px rgba(255,81,0,0.28)" }}>
                <PenLine className="w-4 h-4" /> Share your story
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#write" className="text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors hover:text-[#ff5100]" style={{ color: "var(--text-secondary)" }}>
                How it works
              </a>
            </div>
          </div>

          {/* Counts only once there are enough to be worth showing off */}
          {stories.length >= 6 && (
            <dl className="flex gap-8 lg:gap-10 lg:pb-2">
              {[
                { n: stories.length, label: stories.length === 1 ? "story" : "stories" },
                { n: places, label: places === 1 ? "place" : "places" },
              ].map((x) => (
                <div key={x.label}>
                  <dt className="sr-only">{x.label}</dt>
                  <dd className="text-4xl lg:text-5xl t-text tabular-nums leading-none" style={serif}>{x.n}</dd>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] mt-2" style={{ color: "var(--text-tertiary)" }}>{x.label}</p>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {featured ? (
        <>
          {/* ── Featured story: photo and words side by side ── */}
          <section className="px-5 lg:px-8 pb-12 lg:pb-16">
            <div className="max-w-7xl mx-auto">
              <FeaturedStory story={featured} />
            </div>
          </section>

          {/* ── Every story ── */}
          <section className="px-5 lg:px-8 pb-16 lg:pb-24">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl lg:text-3xl t-text mb-5" style={serif}>All stories</h2>
              <StoriesBrowser stories={stories} featuredSlug={featured.slug} />
            </div>
          </section>
        </>
      ) : (
        <section className="px-5 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto rounded-2xl px-6 py-14 text-center" style={{ background: "var(--bg-card)", border: "1px dashed var(--border-default)" }}>
            <p className="text-xl t-text" style={serif}>No stories yet</p>
            <p className="text-sm mt-2" style={{ color: "var(--text-tertiary)" }}>Be the first to write one.</p>
          </div>
        </section>
      )}

      {/* ── Write for us ── */}
      <section id="write" className="px-5 lg:px-8 pb-16 lg:pb-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden topo" style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}>
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 p-6 sm:p-10 lg:p-14">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-ink)" }}>
                <Sparkles className="w-3.5 h-3.5" /> Write for Trail to Tides
              </p>
              <h2 className="text-3xl sm:text-4xl t-text leading-tight" style={serif}>Something happened out there. Tell us.</h2>
              <p className="text-[15px] leading-relaxed mt-4 max-w-md" style={{ color: "var(--text-secondary)" }}>
                The road that went wrong, the summit that nearly broke you, the stranger who helped. Honest beats polished, every time.
              </p>
              <Link href="/stories/submit" className="group inline-flex items-center gap-2 mt-7 bg-[#ff5100] hover:bg-[#ff7d47] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all hover:-translate-y-0.5">
                Start writing <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ol className="grid sm:grid-cols-3 gap-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,81,0,0.12)" }}>
                      <s.icon className="w-4 h-4" style={{ color: "var(--accent-ink)" }} />
                    </span>
                    <span className="text-3xl tabular-nums leading-none" style={{ ...serif, color: "var(--border-default)" }}>{i + 1}</span>
                  </div>
                  <p className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                  <p className="text-[13.5px] leading-relaxed mt-1.5" style={{ color: "var(--text-secondary)" }}>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeaturedStory({ story }: { story: ReturnType<typeof mapStory> }) {
  const img = storyImage(story.heroImage);
  const activity = story.pillTags?.[0];
  return (
    <article className="group relative grid lg:grid-cols-[1.35fr_1fr] rounded-3xl overflow-hidden transition-shadow hover:shadow-2xl hover:shadow-black/10 focus-within:ring-2 focus-within:ring-[#ff5100]/50"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[460px] overflow-hidden">
        <Image src={img.src} unoptimized={img.unoptimized} alt="" fill priority sizes="(max-width: 1024px) 100vw, 58vw"
          className="photo-grade object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/10" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full backdrop-blur-md"
          style={{ background: "rgba(10,8,6,0.72)", border: "1px solid rgba(255,179,122,0.3)" }}>
          <Crown className="w-3 h-3" style={{ color: "#ffb37a" }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "#ffd9b8" }}>Featured story</span>
        </span>
      </div>

      <div className="flex flex-col p-6 sm:p-8 lg:p-10">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: "var(--accent-ink)" }}>
          {activity && <span className="inline-flex items-center gap-1">{ADVENTURE_TYPE_ICONS[activity]?.(12)}{activity}</span>}
          {activity && <span className="opacity-50">·</span>}
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{story.region}</span>
          {story.adventureDate && <><span className="opacity-50">·</span><span>{story.adventureDate}</span></>}
        </p>
        <h2 className="text-[28px] sm:text-4xl leading-[1.12] t-text transition-colors group-hover:text-[#ff5100]" style={{ ...serif, letterSpacing: "-0.02em" }}>
          <Link href={`/stories/${story.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">{story.title}</Link>
        </h2>
        <p className="text-[15.5px] leading-relaxed mt-4 line-clamp-4" style={{ color: "var(--text-secondary)" }}>{story.excerpt}</p>

        <div className="mt-auto pt-7 flex items-center gap-3 flex-wrap">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ background: "var(--bg-surface-2)" }}>
            {story.authorAvatar && <Image src={story.authorAvatar} alt="" fill sizes="40px" className="object-cover" />}
          </div>
          <div className="min-w-0 mr-auto">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{story.author}</p>
            {story.authorRole && <p className="text-[16px] truncate leading-tight" style={{ ...script, color: "var(--text-tertiary)" }}>{story.authorRole}</p>}
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <StoryLikeButton slug={story.slug} baseLikes={story.baseLikes} pill muted />
            <StoryShareButton title={story.title} slug={story.slug} muted />
          </div>
        </div>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5" style={{ color: "var(--accent-ink)" }}>
          Read the story <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </article>
  );
}
