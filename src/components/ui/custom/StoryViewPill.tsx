"use client";

/**
 * StoryViewPill — single reusable component for showing live story views.
 *
 * Usage:
 *   - Listing pages / cards:  <StoryViewPill slug={story.slug} />
 *   - Story detail page:      <StoryViewPill slug={story.slug} incrementOnMount />
 *
 * The view count is stored in Supabase (story_views table, keyed by slug).
 * When adding a new story, INSERT a row: { slug: "your-slug", views: <seed> }
 */

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";

// Shared formatter — used here and exported for any place that needs the same style
export function formatViews(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return `${v}`;
}

interface Props {
  slug: string;
  /** If true, increments the count in Supabase on mount (use only on detail pages). */
  incrementOnMount?: boolean;
  className?: string;
}

export default function StoryViewPill({ slug, incrementOnMount = false, className = "" }: Props) {
  const [views, setViews] = useState<number | null>(null);
  const incremented = useRef(false);

  useEffect(() => {
    if (incrementOnMount && !incremented.current) {
      incremented.current = true;
      fetch("/api/stories/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((r) => r.json())
        .then((d) => { if (typeof d.views === "number") setViews(d.views); })
        .catch(() => {});
    } else {
      fetch(`/api/stories/views?slug=${encodeURIComponent(slug)}`)
        .then((r) => r.json())
        .then((d) => { if (typeof d.views === "number") setViews(d.views); })
        .catch(() => {});
    }
  }, [slug, incrementOnMount]);

  return (
    <span
      className={`flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/70 text-xs px-3 py-1.5 rounded-full ${className}`}
    >
      <Eye className="w-3 h-3 flex-shrink-0" />
      {views === null ? "—" : `${formatViews(views)} views`}
    </span>
  );
}
