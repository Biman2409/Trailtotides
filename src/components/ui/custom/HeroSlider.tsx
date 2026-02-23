"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&q=95",
    alt: "Golden Himalayan peaks above the clouds",
    label: "Himalayas",
    region: "Uttarakhand",
    panOrigin: "50% 60%",
    panEnd: "50% 45%",
  },
  {
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=2560&q=95",
    alt: "Turquoise ocean meeting dramatic coastal cliffs",
    label: "Coastline",
    region: "Andaman Islands",
    panOrigin: "55% 50%",
    panEnd: "45% 55%",
  },
  {
    src: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=2560&q=95",
    alt: "Ancient forest trail through misty Western Ghats",
    label: "Western Ghats",
    region: "Kerala",
    panOrigin: "50% 45%",
    panEnd: "50% 60%",
  },
  {
    src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=2560&q=95",
    alt: "Endless Thar desert dunes at golden hour",
    label: "Thar Desert",
    region: "Rajasthan",
    panOrigin: "45% 55%",
    panEnd: "55% 45%",
  },
  {
    src: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=2560&q=95",
    alt: "Mountain biker on high altitude ridge trail",
    label: "Spiti Valley",
    region: "Himachal Pradesh",
    panOrigin: "50% 50%",
    panEnd: "50% 38%",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [activated, setActivated] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setActivated(new Set([0]));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  function goTo(index: number) {
    if (transitioning || index === current) return;
    setPrev(current);
    setTransitioning(true);
    setCurrent(index);
    setActivated((a) => new Set(a).add(index));
    setTimeout(() => {
      setPrev(null);
      setTransitioning(false);
    }, 1400);
  }

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      goTo((current + 1) % slides.length);
    }, 6000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, transitioning]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* ── Slides ─────────────────────────────────────── */}
      {slides.map((slide, i) => {
        const isActive = i === current;
        const isPrev = i === prev;
        const hasFired = activated.has(i);
        if (!isActive && !isPrev) return null;

        return (
          <div
            key={slide.src}
            className="absolute inset-0"
            style={{
              zIndex: isActive ? 2 : 1,
              opacity: isActive ? 1 : 0,
              transition: isActive ? "opacity 1.4s ease-in-out" : "none",
            }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              style={{
                transformOrigin: hasFired ? slide.panEnd : slide.panOrigin,
                transform: hasFired ? "scale(1.12)" : "scale(1.0)",
                transition: hasFired
                  ? "transform 10s cubic-bezier(0.22, 0.61, 0.36, 1), transform-origin 10s ease"
                  : "none",
              }}
            />
          </div>
        );
      })}

      {/* ── Layered gradients ───────────────────────────── */}
      <div className="absolute inset-0" style={{ zIndex: 3, pointerEvents: "none" }}>
          {/* solid dark base so text is always readable */}
          <div className="absolute inset-0 bg-black/55" />
          {/* bottom-up fade for extra depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/85" />
          {/* centre spotlight — keeps the text area dark */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 100%)",
            }}
          />
        {/* subtle film-grain texture via SVG noise */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" aria-hidden>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>



      {/* ── Progress bar + dot indicators ──────────────── */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4"
        style={{ zIndex: 4 }}
      >
        {slides.map((slide, i) => (
          <button
              key={i}
              onClick={() => goTo(i)}
              className="group flex flex-col items-center gap-2 cursor-pointer"
              aria-label={`Go to slide ${i + 1}`}
            >
              {/* Animated fill bar */}
              <span
              className="block rounded-full overflow-hidden"
              style={{
                width: i === current ? "36px" : "6px",
                height: "3px",
                background: "rgba(255,255,255,0.15)",
                transition: "width 0.5s ease",
              }}
            >
              <span
                className="block h-full rounded-full"
                style={{
                  background: i === current ? "#c4622d" : "transparent",
                  width: i === current ? "100%" : "0%",
                  transition: i === current ? "width 6s linear" : "none",
                }}
              />
            </span>
          </button>
        ))}
      </div>

      {/* ── Animated scroll cue ────────────────────────── */}
      <div
        className="absolute bottom-10 right-10 flex flex-col items-center gap-2"
        style={{ zIndex: 4 }}
      >
        <span
          className="text-white/25 text-[9px] tracking-[0.25em] uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <div className="w-px h-12 overflow-hidden rounded-full bg-white/10">
          <div
            className="w-full rounded-full bg-white/50"
            style={{
              height: "40%",
              animation: "scrollCue 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollCue {
          0%   { transform: translateY(-120%); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateY(280%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
