"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Share2, Check, Link2 } from "lucide-react";

const FB_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const IG_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const X_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

/** Share button for the ACE achievements panel — same options/popup as StoryShareButton,
 *  trigger styled to sit inline next to a section heading instead of floating over an image. */
export default function AchievementShareButton({ title = "My ACE™ Capability Profile" }: { title?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const url = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const popup = document.getElementById("achievement-share-popup");
        if (popup && !popup.contains(e.target as Node)) {
          setOpen(false);
        }
        if (!popup) setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPopupStyle({
        position: "fixed",
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(v => !v);
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer,width=600,height=400");
    setOpen(false);
  }

  function shareInstagram() {
    navigator.clipboard.writeText(url);
    setOpen(false);
  }

  function shareX() {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer,width=600,height=400");
    setOpen(false);
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`, "_blank", "noopener,noreferrer");
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
        ref={btnRef}
        onClick={toggleOpen}
        aria-label="Share achievements"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all active:scale-95"
        style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-default)" }}
        onMouseEnter={e => { e.currentTarget.style.color = "#ff5100"; e.currentTarget.style.borderColor = "rgba(255,81,0,0.35)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        {copied ? "Copied" : "Share"}
      </button>

      {open && mounted && createPortal(
        <div
          id="achievement-share-popup"
          style={{
            ...popupStyle,
            zIndex: 9999,
            background: "var(--bg-surface-2)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
          className="flex items-center gap-1 p-1.5 rounded-xl"
        >
          <button onClick={shareFacebook} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-[var(--bg-page)]" style={{ color: "var(--text-tertiary)" }} title="Facebook">
            {FB_ICON}
          </button>
          <button onClick={shareInstagram} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-[var(--bg-page)]" style={{ color: "var(--text-tertiary)" }} title="Instagram">
            {IG_ICON}
          </button>
          <button onClick={shareX} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-[var(--bg-page)]" style={{ color: "var(--text-tertiary)" }} title="X">
            {X_ICON}
          </button>
          <button onClick={shareWhatsApp} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-[var(--bg-page)]" style={{ color: "var(--text-tertiary)" }} title="WhatsApp">
            {WA_ICON}
          </button>
          <div className="w-px h-5 mx-0.5" style={{ background: "var(--border-subtle)" }} />
          <button onClick={copyLink} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-[var(--bg-page)]" style={{ color: "var(--text-tertiary)" }} title="Copy link">
            <Link2 className="w-3.5 h-3.5" />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
