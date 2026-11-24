"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import CompassSearch from "@/components/ui/custom/CompassSearch";

// The header's search: the same Compass.AI search as the home page's bar, in a window, since the
// header has no room for its results. Names match as you type; a described trip gets Compass.AI's
// picks right here, not in the chat.

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  // Esc closes the window (the box itself takes the first Esc to close its results)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[1003] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[1004] flex items-start justify-center pt-[10vh] sm:pt-[12vh] px-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search Trail to Tides with Compass.AI"
          className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <button onClick={onClose} aria-label="Close search" className="absolute right-3 top-3 z-10 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors sm:hidden" style={{ color: "var(--text-muted)" }}>
            <X className="w-4 h-4" />
          </button>
          <CompassSearch variant="overlay" autoFocus onNavigate={onClose}
            placeholders={["Search or ask Compass.AI…", "Kedarkantha, Spiti, Ladakh…", "A weekend trek near Delhi…", "Indiahikes, Bikat…"]} />
          <div className="px-4 py-2.5 text-[10.5px] hidden sm:flex gap-3" style={{ color: "var(--text-tertiary)", borderTop: "1px solid var(--border-subtle)" }}>
            <span>↑↓ Move</span><span>↵ Open or ask Compass.AI</span><span>Esc Close</span>
          </div>
        </div>
      </div>
    </>
  );
}
