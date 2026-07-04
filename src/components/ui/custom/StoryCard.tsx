"use client";

import Link from "next/link";
import Image from "next/image";
import { Crown, Mountain, MapPin, ArrowRight } from "lucide-react";
import StoryLikeButton from "./StoryLikeButton";
import StoryShareButton from "./StoryShareButton";
import { Story } from "@/lib/data";

const BADGE_TAGS = ["Featured", "TTT Original"];

export default function StoryCard({ story }: { story: Story }) {
  const isFeatured = story.tags.includes("Featured");
  const isTTTOriginal = story.tags.includes("TTT Original");
  const contentTags = story.pillTags ?? story.tags.filter((t) => !BADGE_TAGS.includes(t)).slice(0, 2);

  return (
    <div className="flex flex-col">
      {/* Badge slot above card — keeps grid rows aligned */}
      <div className="h-7 flex items-center gap-1.5 mb-0.5">
        {isFeatured && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full relative overflow-hidden"
            style={{
              background: "linear-gradient(105deg, #1a0a00 0%, #2d1200 40%, #1a0a00 100%)",
              border: "1px solid rgba(255,81,0,0.35)",
              boxShadow: "0 0 10px rgba(255,81,0,0.18), inset 0 1px 0 rgba(255,140,80,0.12)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,120,60,0.08) 50%, transparent 70%)" }} />
            <Crown className="w-2.5 h-2.5 shrink-0" style={{ color: "#ff7d47", fill: "#ff7d47", filter: "drop-shadow(0 0 3px rgba(255,81,0,0.7))" }} />
            <span className="text-[9px] font-bold tracking-[0.22em] uppercase leading-none" style={{ color: "#ffb38a" }}>Featured</span>
          </div>
        )}
        {isTTTOriginal && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full relative overflow-hidden"
            style={{
              background: "linear-gradient(105deg, #1a0a00 0%, #2d1200 40%, #1a0a00 100%)",
              border: "1px solid rgba(255,81,0,0.35)",
              boxShadow: "0 0 10px rgba(255,81,0,0.18), inset 0 1px 0 rgba(255,140,80,0.12)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,120,60,0.08) 50%, transparent 70%)" }} />
            <Mountain className="w-2.5 h-2.5 shrink-0" style={{ color: "#ff7d47", filter: "drop-shadow(0 0 3px rgba(255,81,0,0.7))" }} />
            <span className="text-[9px] font-bold tracking-[0.22em] uppercase leading-none" style={{ color: "#ffb38a" }}>TTT Original</span>
          </div>
        )}
      </div>

      <Link
        href={`/stories/${story.slug}`}
        className="group block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[#ff5100]/10"
        style={{ aspectRatio: "3/4" }}
      >
        <Image
          src={story.heroImage}
          alt={story.title}
          fill
          quality={100}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{
            objectFit: "cover",
            filter: "brightness(1.1) contrast(1.15) saturate(1.15)"
          }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Top-left: Read button */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 bg-black/30 backdrop-blur-sm border border-[#ff5100]/40 shadow-sm shadow-[#ff5100]/20">
            <span className="text-[11px] font-bold tracking-wide text-[#ff5100]">Read</span>
            <ArrowRight className="w-3 h-3 text-[#ff5100]/70" />
          </span>
        </div>

        {/* Top-right: like + share side by side */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <StoryLikeButton slug={story.slug} baseLikes={story.baseLikes} pill />
          <StoryShareButton title={story.title} slug={story.slug} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          {contentTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {contentTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-white font-bold text-base leading-snug mb-1.5 group-hover:text-[#ff5100] transition-colors duration-200">
            {story.title}
          </h3>

          <p className="text-white/60 text-xs leading-relaxed line-clamp-2 mb-3">
            {story.excerpt}
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 relative">
                {story.authorAvatar
                  ? <Image src={story.authorAvatar} alt={story.author} fill sizes="24px" className="object-cover" />
                  : <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-[#ff5100] to-[#ff7d47]">{story.author.charAt(0)}</span>}
              </div>
              <div className="min-w-0">
                <p className="text-white text-[10px] font-semibold leading-tight truncate">{story.author}</p>
                <p className="text-white/50 text-[9px] truncate">{story.authorRole}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:gap-1.5 gap-0.5 shrink-0">
              <span className="flex items-center gap-1 text-[9px] text-white/40 font-medium">
                <MapPin className="w-2.5 h-2.5" />
                {story.region}
              </span>
              <span className="text-[8px] text-white/30 hidden md:inline">·</span>
              <span className="text-[8px] text-white/30">{story.adventureDate}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}