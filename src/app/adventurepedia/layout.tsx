import type { ReactNode } from "react";

// Every Adventurepedia page sits on the same terrain: the hero's contour map, warm and fairly
// clear behind the top of the page, then a faint wash of it down the rest, with the tide lines
// pooling low on the left. Line art tinted by a mask, so it suits both themes.

const CONTOURS = "url(/hero/trail-contours.png)";

function Layer({ color, opacity, mask, size, style }: { color: string; opacity: number; mask: string; size: string; style: React.CSSProperties }) {
  return (
    <div aria-hidden className="absolute pointer-events-none" style={{ opacity, WebkitMaskImage: mask, maskImage: mask, ...style }}>
      <div
        className="absolute inset-0"
        style={{ background: color, WebkitMaskImage: CONTOURS, maskImage: CONTOURS, WebkitMaskSize: size, maskSize: size, WebkitMaskRepeat: "repeat", maskRepeat: "repeat" }}
      />
    </div>
  );
}

export default function AdventurepediaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate">
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* The top of the page: the contours, warm, pooling to the upper right */}
        <Layer color="#ff5100" opacity={0.16} size="1400px auto"
          mask="radial-gradient(ellipse 75% 85% at 80% 0%, #000 0%, rgba(0,0,0,0.45) 50%, transparent 82%)"
          style={{ top: 0, left: 0, right: 0, height: 900 }} />
        {/* Down the page: the same terrain, faint, in the text colour */}
        <Layer color="var(--text-primary)" opacity={0.045} size="1600px auto"
          mask="linear-gradient(to bottom, transparent 0, #000 700px, #000 calc(100% - 500px), transparent 100%)"
          style={{ inset: 0 }} />
      </div>
      {children}
    </div>
  );
}
