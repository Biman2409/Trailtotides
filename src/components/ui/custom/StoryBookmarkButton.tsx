"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark } from "lucide-react";

interface Props {
  slug: string;
  title: string;
}

export default function StoryBookmarkButton({ slug, title }: Props) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ttt-bookmarks");
    if (saved) {
      const bookmarks = JSON.parse(saved);
      setBookmarked(!!bookmarks[slug]);
    }
  }, [slug]);

  const toggle = useCallback(() => {
    const saved = localStorage.getItem("ttt-bookmarks");
    const bookmarks = saved ? JSON.parse(saved) : {};

    if (bookmarks[slug]) {
      delete bookmarks[slug];
      setBookmarked(false);
    } else {
      bookmarks[slug] = { title, savedAt: new Date().toISOString() };
      setBookmarked(true);
    }

    localStorage.setItem("ttt-bookmarks", JSON.stringify(bookmarks));
  }, [slug, title]);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 border"
      style={{
        background: bookmarked ? "rgba(255,81,0,0.12)" : "var(--bg-card)",
        borderColor: bookmarked ? "rgba(255,81,0,0.35)" : "var(--border-default)",
        color: bookmarked ? "#ff5100" : "var(--text-secondary)",
      }}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this story"}
    >
      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-[#ff5100]" : ""}`} />
      {bookmarked ? "Saved" : "Save"}
    </button>
  );
}