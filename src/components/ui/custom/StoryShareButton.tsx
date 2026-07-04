"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function StoryShareButton({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/stories/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/70 hover:text-white text-xs px-3 py-1.5 rounded-full transition-all active:scale-90"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-400" />
      ) : (
        <Share2 className="w-3 h-3" />
      )}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}