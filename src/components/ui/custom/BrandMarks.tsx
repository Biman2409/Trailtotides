// The two product marks. Every place Compass.AI or the Matchmaker shows an icon uses these,
// so each feature always looks the same. They take the same props as a lucide icon
// (className, style, strokeWidth) and draw in currentColor.

import type { SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement> & { strokeWidth?: number };

/** Compass.AI: a compass needle with a spark, so it never reads as Explore's plain compass */
export function CompassAIMark({ strokeWidth = 2, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="11" cy="13" r="8.5" />
      {/* Needle: north solid, south hollow */}
      <path d="M14.4 9.6 12.3 14.3 7.6 16.4 9.7 11.7Z" fill="currentColor" stroke="none" />
      <path d="M14.4 9.6 12.3 14.3 7.6 16.4 9.7 11.7Z" />
      {/* The spark */}
      <path d="M19.5 1.8v3.6M17.7 3.6h3.6" />
    </svg>
  );
}

/** Adventure Matchmaker: a capability radar with a pulse at its centre */
export function MatchmakerMark({ strokeWidth = 2, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {/* Octagon frame, one point per ACE capability */}
      <path d="M12 2.5 18.7 5.3 21.5 12 18.7 18.7 12 21.5 5.3 18.7 2.5 12 5.3 5.3Z" opacity="0.45" />
      {/* Your shape inside it */}
      <path d="M12 6.5 16.6 8.2 17.2 12 15.3 15.3 12 16.6 8.6 15.4 7 12 8.4 8.4Z" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
