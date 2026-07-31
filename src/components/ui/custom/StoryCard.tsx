"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Crown, MapPin } from "lucide-react";
import StoryLikeButton from "./StoryLikeButton";
import StoryShareButton from "./StoryShareButton";
import { Story } from "@/lib/data";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

const BADGE_TAGS = ["Featured", "TTT Original"];

export default function StoryCard({ story }: { story: Story }) {
  const isFeatured = story.tags.includes("Featured");
  const genre = (story.pillTags ?? story.tags.filter((t) => !BADGE_TAGS.includes(t)))[0];

  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      {/* Photo */}
      <div className="relative overflow-hidden shrink-0" style={{ aspectRatio: "4/3" }}>
        <Image
          src={story.heroImage}
          alt={story.title}
          fill
          quality={100}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          style={{ filter: "brightness(1.03) contrast(1.08) saturate(1.08)" }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

        {isFeatured && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1 pl-1.5 pr-2.5 py-1 rounded-full backdrop-blur-md"
            style={{ background: "rgba(10,8,6,0.72)", border: "1px solid rgba(255,179,122,0.3)" }}
          >
            <Crown className="w-2.5 h-2.5" style={{ color: "#ffb37a" }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: "#ffd9b8" }}>Featured</span>
          </div>
        )}

        {/* Read affordance — quiet, brightens on hover */}
        <div
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ background: "rgba(10,8,6,0.55)", backdropFilter: "blur(6px)" }}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-white transition-transform duration-300 group-hover:rotate-45" />
        </div>
      </div>

      {/* Caption */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--text-tertiary)" }}>
          {genre && (
            <span className="inline-flex items-center gap-1 shrink-0" style={{ color: "#ff5100" }}>
              {ADVENTURE_TYPE_ICONS[genre]?.(10)}
              {genre}
            </span>
          )}
          {genre && <span className="opacity-50">·</span>}
          <span className="inline-flex items-center gap-1 min-w-0 truncate" style={{ color: "#ff5100" }}>
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{story.region}</span>
          </span>
          <span className="opacity-50 shrink-0">·</span>
          <span className="shrink-0" style={{ color: "#ff5100" }}>{story.adventureDate}</span>
        </div>

        <h3
          className="font-bold text-[17px] leading-snug mb-1.5 line-clamp-2 transition-colors duration-200 group-hover:text-[#ff5100]"
          style={{ color: "var(--text-primary)" }}
        >
          {story.title}
        </h3>

        <p className="text-[13px] leading-relaxed line-clamp-2 mb-4" style={{ color: "var(--text-tertiary)" }}>
          {story.excerpt}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 relative">
              {story.authorAvatar
                ? <Image src={story.authorAvatar} alt={story.author} fill sizes="24px" className="object-cover" />
                : <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-[#ff5100] to-[#ff7d47]">{story.author.charAt(0)}</span>}
            </div>
            <p className="text-[13px] font-semibold truncate min-w-0" style={{ color: "var(--text-secondary)" }}>
              {story.author}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <StoryLikeButton slug={story.slug} baseLikes={story.baseLikes} pill muted />
            <StoryShareButton title={story.title} slug={story.slug} muted />
          </div>
        </div>
      </div>
    </Link>
  );
}
