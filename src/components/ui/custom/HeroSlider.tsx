"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

type Slide = {
  src: string;
  alt: string;
  filter?: string;
};

const slides: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1280&q=40",
    alt: "Trekker on a high-altitude Himalayan ridge",
  },
  {
    src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1280&q=40",
    alt: "Kayaker paddling through vivid turquoise coastal waters",
  },
  {
    src: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1280&q=40",
    alt: "Mountaineer silhouetted against a vast snowy summit",
  },
  {
    src: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1280&q=40",
    alt: "Surfer carving a wave at golden hour",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=40",
    alt: "Motorbike rider on a sweeping Himalayan mountain road",
  },
  {
    src: "https://images.unsplash.com/photo-1669255664788-61c668bd6fe8?w=1280&q=40",
    alt: "Man on a motorcycle riding through mountain terrain",
  },
  {
    src: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1280&q=40",
    alt: "Skier carving down a steep snowy mountain slope",
    filter: "brightness(1.12) contrast(1.08) saturate(1.2) hue-rotate(-10deg)",
  },
  {
    src: "https://images.unsplash.com/photo-1592208128295-5aaa34f1d72b?w=1280&q=40",
    alt: "Scuba diver exploring vibrant coral reefs in the Andamans",
    filter: "brightness(1.08) contrast(1.1) saturate(1.35) hue-rotate(5deg)",
  },
  {
    src: "https://images.unsplash.com/photo-1668936132313-2c3105eef631?w=1280&q=40",
    alt: "Mountain biker descending a rugged trail through dense forest",
    filter: "brightness(1.05) contrast(1.12) saturate(1.25) sepia(0.08)",
  },
  {
    src: "https://images.unsplash.com/photo-1590898428406-7b9f44b33c22?w=1280&q=40",
    alt: "Rock climber scaling a dramatic cliff face",
    filter: "brightness(1.06) contrast(1.14) saturate(1.2) sepia(0.06) hue-rotate(5deg)",
  },
];

// Ken Burns variants — distinct pan+zoom combos so each slide moves differently
const panVariants = [
  { from: "scale(1.08) translateY(4%)",      to: "scale(1.18) translateY(-4%)" },
  { from: "scale(1.06) translateX(-4%)",     to: "scale(1.16) translateX(4%)" },
  { from: "scale(1.08) translateY(-4%)",     to: "scale(1.18) translateY(4%)" },
  { from: "scale(1.07) translateX(4%)",      to: "scale(1.17) translateX(-4%)" },
  { from: "scale(1.08) translate(-3%,-3%)",  to: "scale(1.18) translate(3%,3%)" },
];

const SLIDE_DURATION = 6000;
const TRANSITION_MS  = 1200;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HeroSlider() {
  const [shuffled, setShuffled] = useState<Slide[]>(slides);
  const [current,     setCurrent]     = useState(0);
  const [prev,        setPrev]        = useState<number | null>(null);
  const [animating,   setAnimating]   = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [loaded,      setLoaded]      = useState<Record<number, boolean>>({ 0: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setShuffled(shuffle(slides));
  }, []);

  const goTo = useCallback((index: number, byUser = false) => {
    if (index === current) return;
    if (animating && !byUser) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPrev(current);
    setCurrent(index);
    setAnimating(true);
    setProgressKey((k) => k + 1);
    setTimeout(() => { setPrev(null); setAnimating(false); }, TRANSITION_MS);
  }, [current, animating]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => goTo((current + 1) % shuffled.length),
      SLIDE_DURATION
    );
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, goTo, shuffled.length]);

  const kenBurnsCSS = panVariants.map((p, i) => `
    @keyframes kb${i} {
      from { transform: ${p.from}; }
      to   { transform: ${p.to};   }
    }
  `).join("");

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0d1117]">

      <style>{`
        ${kenBurnsCSS}
        @keyframes progressFill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes scrollCue {
          0%   { transform: translateY(-130%); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: translateY(310%);  opacity: 0; }
        }
      `}</style>

      {shuffled.map((slide, i) => {
        const isActive     = i === current;
        const isPrev       = i === prev;
        const next         = (current + 1) % shuffled.length;
        const shouldRender = isActive || isPrev || i === next;
        const panIdx       = i % panVariants.length;

        return (
          <div
            key={slide.src}
            className="absolute inset-0"
            style={{
              zIndex:        isActive ? 2 : isPrev ? 1 : 0,
              opacity:       isActive ? 1 : isPrev ? 1 : 0,
              transition:    `opacity ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`,
              visibility:    shouldRender ? "visible" : "hidden",
              pointerEvents: "none",
            }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              onLoad={() => setLoaded(p => ({ ...p, [i]: true }))}
              style={{
                filter:     slide.filter,
                willChange: "transform",
                animation:  isActive
                  ? `kb${panIdx} ${SLIDE_DURATION + TRANSITION_MS}ms cubic-bezier(0.22,0.61,0.36,1) forwards`
                  : "none",
              }}
            />
          </div>
        );
      })}

      {/* Overlay stack */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/48 to-black/15" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/45 to-transparent" />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 35%, rgba(0,0,0,0.38) 100%)",
          }}
        />
      </div>

      {/* Progress dots */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5"
        style={{ zIndex: 5 }}
      >
        {shuffled.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, true)}
            aria-label={`Go to slide ${i + 1}`}
            className="relative overflow-hidden rounded-full cursor-pointer"
            style={{
              width:      i === current ? 36 : 6,
              height:     4,
              background: "rgba(255,255,255,0.18)",
              transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {i === current && (
              <span
                key={progressKey}
                className="absolute inset-y-0 left-0 w-full rounded-full bg-[#ff5100]"
                style={{
                  transform:       "scaleX(0)",
                  transformOrigin: "left",
                  animation:       `progressFill ${SLIDE_DURATION}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide counter */}
      <div
        className="absolute bottom-8 left-8 text-white/30 text-[10px] tracking-[0.25em] font-medium tabular-nums select-none"
        style={{ zIndex: 5 }}
      >
        {String(current + 1).padStart(2, "0")} / {String(shuffled.length).padStart(2, "0")}
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-8 right-10 flex flex-col items-center gap-2"
        style={{ zIndex: 5 }}
      >
        <span
          className="text-white/28 text-[9px] tracking-[0.32em] uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <div className="w-px h-10 overflow-hidden rounded-full bg-white/12">
          <div
            className="w-full rounded-full bg-white/55"
            style={{ height: "38%", animation: "scrollCue 2s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>
  );
}
