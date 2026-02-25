"use client";

import { useState, useEffect, useRef } from "react";
import { Eye } from "lucide-react";

interface Props {
  slug: string;
  initialViews?: number;
  /** If true, POST to increment on mount (use on the story detail page) */
  incrementOnMount?: boolean;
  className?: string;
}

export default function StoryViewPill({ slug, initialViews = 0, incrementOnMount = false, className = "" }: Props) {
  const [views, setViews] = useState(initialViews);
  const didIncrement = useRef(false);

  useEffect(() => {
    if (incrementOnMount && !didIncrement.current) {
      didIncrement.current = true;
      fetch("/api/stories/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((r) => r.json())
        .then((d) => { if (d.views) setViews(d.views); })
        .catch(() => {});
    } else {
      fetch(`/api/stories/views?slug=${slug}`)
        .then((r) => r.json())
        .then((d) => { if (d.views) setViews(d.views); })
        .catch(() => {});
    }
  }, [slug, incrementOnMount]);

  const fmt = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return `${v}`;
  };

  return (
    <span className={`flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/70 text-xs px-3 py-1.5 rounded-full ${className}`}>
      <Eye className="w-3 h-3" />
      {fmt(views)} views
    </span>
  );
}
