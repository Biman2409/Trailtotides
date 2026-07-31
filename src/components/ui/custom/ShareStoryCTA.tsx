import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

interface ShareStoryCTAProps {
  heading?: string;
  subtext: string[];
  size?: "sm" | "md";
}

/**
 * The "share your story" prompt shown at the bottom of both /stories and
 * /stories/[slug] — kept as one component so the two don't drift out of sync.
 */
export default function ShareStoryCTA({ heading = "Got a story to tell?", subtext, size = "md" }: ShareStoryCTAProps) {
  const isSm = size === "sm";

  return (
    <div
      className={`relative rounded-2xl overflow-hidden flex flex-col sm:flex-row items-center ${isSm ? "gap-3 sm:gap-4 px-4 py-3.5" : "gap-5 px-6 py-5"}`}
      style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.18)" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(255,81,0,0.08)_0%,_transparent_65%)] pointer-events-none" />

      <div
        className={`shrink-0 rounded-xl flex items-center justify-center relative ${isSm ? "w-8 h-8" : "w-10 h-10"}`}
        style={{ background: "rgba(255,81,0,0.15)", border: "1px solid rgba(255,81,0,0.25)" }}
      >
        <BookOpen className={isSm ? "w-3.5 h-3.5 text-[#ff5100]" : "w-4.5 h-4.5 text-[#ff5100]"} />
      </div>

      <div className="flex-1 min-w-0 relative text-center sm:text-left">
        <p className={`font-bold leading-snug ${isSm ? "text-xs whitespace-nowrap" : "text-sm"}`} style={{ color: "var(--text-primary)" }}>
          {heading}
        </p>
        {subtext.map((line, i) => (
          <p
            key={i}
            className={`mt-0.5 leading-relaxed ${isSm ? "text-[11px]" : "text-xs"} ${i === subtext.length - 1 && !isSm ? "font-bold" : ""}`}
            style={{ color: i === subtext.length - 1 && !isSm ? "var(--text-secondary)" : "var(--text-tertiary)" }}
          >
            {line}
          </p>
        ))}
      </div>

      <Link
        href="/stories/submit"
        className={`relative shrink-0 inline-flex items-center gap-1.5 text-white font-semibold rounded-lg transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 group whitespace-nowrap ${isSm ? "px-3.5 py-1.5 text-xs" : "px-4 py-2 text-xs"}`}
        style={{ background: "#ff5100", boxShadow: "0 4px 14px rgba(255,81,0,0.25)" }}
      >
        {isSm ? "Share your story" : "Share Your Story"}
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
