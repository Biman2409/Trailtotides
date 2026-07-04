"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Crown, Mountain, Heart } from "lucide-react";
import { Story } from "@/lib/data";
import StoryViewPill from "./StoryViewPill";

const BADGE_TAGS = ["Featured", "TTT Original"];
const BASE_LIKES = 50;

export default function StoryCard({ story }: { story: Story }) {
  const isFeatured = story.tags.includes("Featured");
  const isTTTOriginal = story.tags.includes("TTT Original");
  const contentTags = story.pillTags ?? story.tags.filter((t) => !BADGE_TAGS.includes(t)).slice(0, 2);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(BASE_LIKES);

  useEffect(() => {
    const stored = localStorage.getItem(`story_liked_${story.slug}`);
    if (stored === "true") {
      setLiked(true);
      setLikeCount(BASE_LIKES + 1);
    }
  }, [story.slug]);

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikeCount(next ? BASE_LIKES + 1 : BASE_LIKES);
    localStorage.setItem(`story_liked_${story.slug}`, next ? "true" : "false");
  }

  const handleClick = () => {
    fetch("/api/stories/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: story.slug }),
    }).catch(() => {});
  };

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
        onClick={handleClick}
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

        {/* Top-left: read time + views */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
          <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {story.readTime}
          </span>
          <StoryViewPill
            slug={story.slug}
            className="!bg-white/15 !border-white/20 !text-white font-semibold !text-[10px] !px-2.5 !py-1"
          />
        </div>

        {/* Top-right: like button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1 bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full transition-all active:scale-90"
          >
            <Heart
              className="w-3 h-3 transition-colors"
              style={{
                color: liked ? "#ff4d6d" : "rgba(255,255,255,0.7)",
                fill: liked ? "#ff4d6d" : "transparent",
              }}
            />
            <span
              className="text-[10px] font-semibold tabular-nums"
              style={{ color: liked ? "#ff4d6d" : "rgba(255,255,255,0.7)" }}
            >
              {likeCount}
            </span>
          </button>
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

          <div className="border-t border-white/10 pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 relative">
                {story.authorAvatar
                  ? <Image src={story.authorAvatar} alt={story.author} fill sizes="24px" className="object-cover" />
                  : <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-[#ff5100] to-[#ff7d47]">{story.author.charAt(0)}</span>}
              </div>
              <div className="min-w-0">
                <p className="text-white text-[10px] font-semibold leading-tight truncate">{story.author}</p>
                <p className="text-white/50 text-[9px]">{story.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-[#ff5100] text-[10px] font-semibold group-hover:translate-x-1 transition-transform duration-200">
                Read →
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}