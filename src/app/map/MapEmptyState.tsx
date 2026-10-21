"use client";

import { Undo2, MapPinned, LocateFixed, RotateCcw } from "lucide-react";
import type { Insets } from "./MapCanvas";

// Said on the map itself, where the eye is, with the one-tap fixes that actually help.

export default function MapEmptyState({
  kind, matches, insets, onUndo, onWiden, onClear, onShowAll,
}: {
  /** "none": nothing matches the filters · "elsewhere": matches exist, just not in view */
  kind: "none" | "elsewhere";
  matches: number;
  insets: Insets;
  onUndo?: () => void;
  /** Near me is what's emptying the map: drop the distance limit */
  onWiden?: () => void;
  onClear: () => void;
  onShowAll: () => void;
}) {
  return (
    <div className="absolute z-[900] inset-0 grid place-items-center pointer-events-none px-4"
      style={{ paddingLeft: insets.left + 16, paddingBottom: insets.bottom + 16, paddingTop: (insets.top ?? 0) + 16 }}>
      <div className="pointer-events-auto tm-empty w-full max-w-[320px] text-center" role="status">
        <EmptyArt kind={kind} />
        <p className="mt-3 text-[15px] font-bold text-white">
          {kind === "none" ? "No adventures match" : "Nothing in this part of the map"}
        </p>
        <p className="mt-1 text-[12px] leading-snug text-white/50">
          {kind === "none"
            ? onWiden ? "Nothing that fits is within your distance. Look further, or loosen a filter." : "That mix of filters leaves nothing. Step back one, or start over."
            : `${matches} adventure${matches === 1 ? "" : "s"} match — they're just off-screen.`}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {kind === "elsewhere" ? (
            <button type="button" onClick={onShowAll} className="tm-btn tm-btn-primary w-full"><MapPinned className="w-3.5 h-3.5" /> Show all {matches}</button>
          ) : (
            <>
              {onWiden && <button type="button" onClick={onWiden} className="tm-btn tm-btn-primary w-full"><LocateFixed className="w-3.5 h-3.5" /> Any distance</button>}
              {onUndo && <button type="button" onClick={onUndo} className={`tm-btn w-full ${onWiden ? "" : "tm-btn-primary"}`}><Undo2 className="w-3.5 h-3.5" /> Undo last filter</button>}
              <button type="button" onClick={onClear} className="tm-btn w-full"><RotateCcw className="w-3.5 h-3.5" /> Clear all filters</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// A small drawn scene: an empty contour hill with a lone, dashed trail (and a pin that's wandered off)
function EmptyArt({ kind }: { kind: "none" | "elsewhere" }) {
  return (
    <svg viewBox="0 0 120 64" className="w-28 h-auto mx-auto" aria-hidden>
      <defs>
        <linearGradient id="tm-empty-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ff9a66" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff9a66" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M4 58 L38 22 L54 36 L72 14 L116 58 Z" fill="url(#tm-empty-g)" />
      <path d="M4 58 L38 22 L54 36 L72 14 L116 58" fill="none" stroke="#ff9a66" strokeOpacity="0.8" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M22 50 L38 34 L50 44 L72 26 L96 50" fill="none" stroke="#ff9a66" strokeOpacity="0.35" strokeWidth="1" strokeLinejoin="round" />
      <path d="M14 60 C 34 52, 46 60, 62 54 S 92 50, 108 58" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="2 4" strokeLinecap="round" />
      {kind === "elsewhere" ? (
        <g transform="translate(104 10)">
          <circle r="7" fill="#38bdf8" fillOpacity="0.18" />
          <circle r="3.5" fill="#38bdf8" />
          <path d="M-14 6 L-6 2" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ) : (
        <g transform="translate(72 14)">
          <circle r="5" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="2 2" />
        </g>
      )}
    </svg>
  );
}
