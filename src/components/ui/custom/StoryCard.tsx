"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Crown, MapPin } from "lucide-react";
import StoryLikeButton from "./StoryLikeButton";
import StoryShareButton from "./StoryShareButton";
import { Story } from "@/lib/data";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import { BADGE_TAGS, storyImage } from "@/lib/storyView";

const serif = { fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600 } as const;
// The author tagline is set in the site script, like the logo tagline
const script = { fontFamily: "var(--font-script), cursive", fontWeight: 600 } as const;

export default function StoryCard({ story }: { story: Story }) {
  const isFeatured = story.tags.includes("Featured");
  const genre = (story.pillTags ?? story.tags.filter((t) => !BADGE_TAGS.includes(t)))[0];
  const img = storyImage(story.heroImage);

  // The whole card is one link (stretched over it), with like and share layered above it,
  // so the buttons are never nested inside the link
  return (
    <article
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 focus-within:ring-2 focus-within:ring-[#ff5100]/50"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      {/* Photo */}
      <div className="relative overflow-hidden shrink-0" style={{ aspectRatio: "4/3" }}>
        <Image
          src={img.src}
          unoptimized={img.unoptimized}
          alt=""
          fill
          quality={75}
          className="photo-grade object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/25" />

        <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5">
          {genre && (
            <span className="inline-flex items-center gap-1 pl-2 pr-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ background: "rgba(10,8,6,0.55)", border: "1px solid rgba(255,255,255,0.14)" }}>
              {ADVENTURE_TYPE_ICONS[genre]?.(11)}
              {genre}
            </span>
          )}
          {isFeatured && (
            <span className="inline-flex items-center gap-1 pl-1.5 pr-2.5 py-1 rounded-full backdrop-blur-md"
              style={{ background: "rgba(10,8,6,0.72)", border: "1px solid rgba(255,179,122,0.3)" }}>
              <Crown className="w-2.5 h-2.5" style={{ color: "#ffb37a" }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: "#ffd9b8" }}>Featured</span>
            </span>
          )}
        </div>

        <span
          aria-hidden
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#ff5100]"
          style={{ background: "rgba(10,8,6,0.55)", backdropFilter: "blur(6px)" }}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-white transition-transform duration-300 group-hover:rotate-45" />
        </span>
      </div>

      {/* Caption */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] mb-2 min-w-0" style={{ color: "var(--accent-ink)" }}>
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{story.region}</span>
          {story.adventureDate && <><span className="opacity-50 shrink-0">·</span><span className="shrink-0">{story.adventureDate}</span></>}
        </p>

        <h3 className="text-[19px] leading-snug mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-[#ff5100]" style={{ ...serif, color: "var(--text-primary)" }}>
          <Link href={`/stories/${story.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
            {story.title}
          </Link>
        </h3>

        <p className="text-[13.5px] leading-relaxed line-clamp-3 mb-4" style={{ color: "var(--text-secondary)" }}>
          {story.excerpt}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 relative" style={{ background: "var(--bg-surface-2)" }}>
              {story.authorAvatar
                ? <Image src={story.authorAvatar} alt="" fill sizes="28px" className="object-cover" />
                : <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white bg-[#ff5100]">{story.author.charAt(0)}</span>}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate leading-tight" style={{ color: "var(--text-primary)" }}>{story.author}</p>
              {story.authorRole && <p className="text-[14px] truncate leading-tight" style={{ ...script, color: "var(--text-tertiary)" }}>{story.authorRole}</p>}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-1.5 shrink-0">
            <StoryLikeButton slug={story.slug} baseLikes={story.baseLikes} pill muted />
            <StoryShareButton title={story.title} slug={story.slug} muted />
          </div>
        </div>
      </div>
    </article>
  );
}
