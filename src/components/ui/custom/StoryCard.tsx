"use client";

/**
 * StoryCard — card used on the homepage "From the Field" section.
 *
 * - Reads readTime from story.readTime (never hardcoded)
 * - Displays ALL tags that are not "Featured" / "TTT Original" as content pills
 * - Views are delegated entirely to StoryViewPill (no duplicate fetch here)
 * - Clicking the card increments views via the POST endpoint
 */

import Link from "next/link";
import Image from "next/image";
import { Clock, Crown, Mountain } from "lucide-react";
import { Story } from "@/lib/data";
import StoryViewPill from "./StoryViewPill";

const BADGE_TAGS = ["Featured", "TTT Original"];

export default function StoryCard({ story }: { story: Story }) {
  const isFeatured = story.tags.includes("Featured");
  const isTTTOriginal = story.tags.includes("TTT Original");
  // Every tag that's not a badge is shown as a content pill
  const contentTags = story.tags.filter((t) => !BADGE_TAGS.includes(t));

  const handleClick = () => {
    fetch("/api/stories/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: story.slug }),
    }).catch(() => {});
  };

  return (
    <Link
      href={`/stories/${story.slug}`}
      onClick={handleClick}
      className="group block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      style={{ height: "420px" }}
    >
      {/* Background image */}
      <Image
        src={story.heroImage}
        alt={story.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Top-left: badge icons (Featured, TTT Original) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isFeatured && (
            <div className="group/badge flex items-center gap-1.5 bg-black text-[#ff5722] rounded-full px-2 py-1 shadow-md overflow-hidden transition-all duration-300 w-7 hover:w-[100px]">
              <Crown className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity duration-200 delay-100">
                Featured
              </span>
            </div>
          )}
            {isTTTOriginal && (
              <div className="group/badge flex items-center gap-1.5 bg-[#ff5722] text-black rounded-full px-2 py-1 shadow-md overflow-hidden transition-all duration-300 w-7 hover:w-[120px]">
                <Mountain className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity duration-200 delay-100">
                  TTT Original
                </span>
              </div>
            )}
        </div>

      {/* Top-right: read time + live views */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
        <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full">
          <Clock className="w-3 h-3 flex-shrink-0" />
          {story.readTime}
        </span>
        {/* StoryViewPill handles all fetching — do NOT duplicate view logic here */}
        <StoryViewPill
          slug={story.slug}
          className="!bg-white/15 !border-white/20 !text-white font-semibold !text-[10px] !px-2.5 !py-1"
        />
      </div>

      {/* Bottom content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Content tags — ALL non-badge tags */}
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

        {/* Title */}
        <h3 className="text-white font-bold text-base leading-snug mb-1.5 group-hover:text-[#ff5722] transition-colors duration-200">
          {story.title}
        </h3>

        {/* Excerpt */}
        <p className="text-white/60 text-xs leading-relaxed line-clamp-2 mb-3">
          {story.excerpt}
        </p>

        {/* Author row */}
        <div className="border-t border-white/10 pt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ff5722] to-[#ff7043] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {story.author.charAt(0)}
            </div>
            <div>
              <p className="text-white text-[10px] font-semibold leading-tight">{story.author}</p>
              <p className="text-white/50 text-[9px]">{story.date}</p>
            </div>
          </div>
          <div className="text-[#ff5722] text-[10px] font-semibold group-hover:translate-x-1 transition-transform duration-200">
            Read →
          </div>
        </div>
      </div>
    </Link>
  );
}
