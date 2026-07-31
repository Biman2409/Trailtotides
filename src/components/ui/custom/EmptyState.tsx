import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  heading: string;
  subtext: string;
  actionLabel: string;
  onAction: () => void;
  /** lg = full section (Explore grid); sm = compact hint (floating over the map). */
  size?: "lg" | "sm";
  /** floating = blurred card meant to sit over other content (e.g. the map). */
  variant?: "plain" | "floating";
}

/**
 * "No results for the current filters" state — shared between Explore and
 * Map so the copy/behavior (icon, heading, clear-filters action) stays in
 * sync, while `size`/`variant` keep each context's intentional scale.
 */
export default function EmptyState({ icon, heading, subtext, actionLabel, onAction, size = "lg", variant = "plain" }: EmptyStateProps) {
  const isLg = size === "lg";

  const content = (
    <div className={isLg ? "text-center py-24" : "text-center px-6 py-8 rounded-2xl pointer-events-auto"}
      style={variant === "floating" ? {
        background: "rgba(4,7,14,0.88)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      } : undefined}
    >
      <div className={isLg ? "text-6xl mb-5" : "mb-3 flex justify-center"}>{icon}</div>
      <h3 className={isLg ? "text-white text-2xl font-bold mb-2 uppercase tracking-tight" : "text-white font-bold text-sm mb-1"}>
        {heading}
      </h3>
      <p className={isLg ? "text-white/40 mb-7 max-w-xs mx-auto leading-relaxed" : "text-white/30 text-xs mb-4"}>
        {subtext}
      </p>
      <button
        onClick={onAction}
        className={
          isLg
            ? "bg-[#ff5100] text-white px-7 py-3 rounded-xl text-sm font-semibold hover:bg-[#ff7d47] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 uppercase tracking-wider"
            : "px-4 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110"
        }
        style={!isLg ? { background: "#ff5100", color: "#fff", boxShadow: "0 4px 14px rgba(255,81,0,0.25)" } : undefined}
      >
        {actionLabel}
      </button>
    </div>
  );

  if (variant === "floating") {
    return (
      <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
        {content}
      </div>
    );
  }

  return content;
}
