"use client";

import { useEffect, useRef, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import LegalText from "./LegalText";
import { LEGAL_UPDATED, PRIVACY_INTRO, PRIVACY_SECTIONS, TERMS_INTRO, TERMS_SECTIONS } from "@/lib/legal";

// The text itself lives in src/lib/legal.ts, shared with the /terms and /privacy pages

interface Props {
  onAccept: () => void;
  onClose: () => void;
}

export default function TermsModal({ onAccept, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (atBottom) setHasScrolledToBottom(true);
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl"
           style={{ maxHeight: "90vh", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Terms & Privacy Policy</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Please read carefully before agreeing</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-card)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.background = "transparent"; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-8"
        >
          {/* Terms of Use */}
          <div>
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Terms of Use</p>
            <p className="text-[11px] mb-4" style={{ color: "var(--text-tertiary)" }}>Last updated: {LEGAL_UPDATED}</p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>{TERMS_INTRO}</p>
            <LegalText sections={TERMS_SECTIONS} compact />
          </div>

          {/* Divider */}
          <div className="border-t" style={{ borderColor: "var(--border-subtle)" }} />

          {/* Privacy Policy */}
          <div>
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Privacy Policy</p>
            <p className="text-[11px] mb-4" style={{ color: "var(--text-tertiary)" }}>Last updated: {LEGAL_UPDATED}</p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>{PRIVACY_INTRO}</p>
            <LegalText sections={PRIVACY_SECTIONS} compact />
          </div>

          {/* Bottom padding so scroll indicator triggers cleanly */}
          <div className="h-4" />
        </div>

        {/* Scroll hint — fades out once at bottom */}
        {!hasScrolledToBottom && (
          <div className="absolute bottom-[72px] left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg-surface)] to-transparent pointer-events-none flex items-end justify-center pb-2">
            <p className="text-[10px] font-medium tracking-wide animate-pulse" style={{ color: "var(--text-tertiary)" }}>Scroll to the bottom to agree</p>
          </div>
        )}

        {/* Footer / Accept button */}
        <div className="px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
          <button
            onClick={() => { onAccept(); onClose(); }}
            disabled={!hasScrolledToBottom}
            className="w-full flex items-center justify-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-30 disabled:cursor-not-allowed text-[#1c1814] font-bold py-3 rounded-xl text-sm transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            I have read and agree to the Terms & Privacy Policy
          </button>
          {!hasScrolledToBottom && (
            <p className="text-center text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
              Read to the end to enable this button
            </p>
          )}
        </div>
      </div>
    </div>
  );
}