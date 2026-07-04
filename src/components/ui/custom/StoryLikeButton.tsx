"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const BASE_LIKES = 50;

export default function StoryLikeButton({ slug, className = "" }: { slug: string; className?: string }) {
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
    <div className={`flex flex-col items-center gap-0 ${className}`}>
      <button onClick={toggleLike} className="transition-all active:scale-90">
        <Heart
          className="w-4 h-4 transition-colors"
          style={{
            color: liked ? "#ff4d6d" : "rgba(255,255,255,0.7)",
            fill: liked ? "#ff4d6d" : "transparent",
          }}
        />
      </button>
      <span className="text-[9px] font-semibold tabular-nums -mt-0.5" style={{ color: liked ? "#ff4d6d" : "rgba(255,255,255,0.7)" }}>
        {likeCount}
      </span>
    </div>
  );
}