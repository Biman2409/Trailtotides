"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const BASE_LIKES = 50;

export default function StoryLikeButton({ slug }: { slug: string }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(BASE_LIKES);

  useEffect(() => {
    const stored = localStorage.getItem(`story_liked_${slug}`);
    if (stored === "true") {
      setLiked(true);
      setLikeCount(BASE_LIKES + 1);
    }
  }, [slug]);

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikeCount(next ? BASE_LIKES + 1 : BASE_LIKES);
    localStorage.setItem(`story_liked_${slug}`, next ? "true" : "false");
  }

  return (
    <button
      onClick={toggleLike}
      className="flex items-center gap-1 transition-all active:scale-90"
    >
      <Heart
        className="w-3 h-3 transition-colors"
        style={{
          color: liked ? "#ff4d6d" : "var(--text-tertiary)",
          fill: liked ? "#ff4d6d" : "transparent",
        }}
      />
      <span className="text-[10px] font-semibold tabular-nums" style={{ color: liked ? "#ff4d6d" : "var(--text-tertiary)" }}>
        {likeCount}
      </span>
    </button>
  );
}