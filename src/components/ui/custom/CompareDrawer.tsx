"use client";

import { X, GitCompareArrows } from "lucide-react";
import { useEffect } from "react";
import { useCompare, MAX } from "@/contexts/CompareContext";
import CompareContent from "./CompareContent";

export default function CompareDrawer() {
  const { selected, clear, drawerOpen, closeDrawer } = useCompare();

  // Lock body scroll while the drawer is open, and let Escape close it.
  useEffect(() => {
    if (!drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") closeDrawer(); }
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prevOverflow; document.removeEventListener("keydown", onKey); };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeDrawer}
      />

      {/* Panel */}
      <div
        className="relative h-full w-full sm:w-[560px] max-w-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 ease-out"
        style={{ background: "var(--bg-page)", borderLeft: "1px solid var(--border-subtle)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,81,0,0.12)", border: "1px solid rgba(255,81,0,0.25)" }}>
              <GitCompareArrows className="w-4 h-4 text-[#ff5100]" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Compare Adventures</p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{selected.length}/{MAX} selected</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {selected.length > 0 && (
              <button
                onClick={clear}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors hover:text-red-400"
                style={{ color: "var(--text-tertiary)" }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={closeDrawer}
              aria-label="Close compare panel"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{ color: "var(--text-tertiary)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <CompareContent />
        </div>
      </div>
    </div>
  );
}
