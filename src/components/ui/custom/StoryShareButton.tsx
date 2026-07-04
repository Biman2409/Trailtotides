"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Check, Link2 } from "lucide-react";

const FB_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const IG_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="url(#igGradient)">
    <defs>
      <linearGradient id="igGradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#fdf497"/>
        <stop offset="20%" stopColor="#fdf497"/>
        <stop offset="40%" stopColor="#fd5949"/>
        <stop offset="60%" stopColor="#d6249f"/>
        <stop offset="80%" stopColor="#285AEB"/>
        <stop offset="100%" stopColor="#285AEB"/>
      </linearGradient>
    </defs>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

export default function StoryShareButton({ title, slug }: { title: string; slug: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const url = typeof window !== "undefined" ? `${window.location.origin}/stories/${slug}` : "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer,width=600,height=400");
    setOpen(false);
  }

  function shareInstagram() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/70 hover:text-white text-xs px-3 py-1.5 rounded-full transition-all active:scale-90"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-400" />
        ) : (
          <Share2 className="w-3 h-3" />
        )}
        {copied ? "Copied!" : "Share"}
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1.5 min-w-[160px] rounded-xl overflow-hidden z-50"
          style={{
            background: "rgba(20,20,25,0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <button onClick={shareFacebook} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left">
            {FB_ICON}
            Facebook
          </button>
          <button onClick={shareInstagram} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left">
            {IG_ICON}
            Instagram
          </button>
          <button onClick={copyLink} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left">
            <Link2 className="w-3.5 h-3.5 text-white/50" />
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}