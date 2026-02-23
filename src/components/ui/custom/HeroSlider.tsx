"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=90",
    alt: "Himalayan peaks at sunrise",
    label: "Himalayas",
  },
  {
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=2400&q=90",
    alt: "Coastal cliffs and ocean waves",
    label: "Coastline",
  },
  {
    src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=2400&q=90",
    alt: "Dense green forest trail",
    label: "Western Ghats",
  },
  {
    src: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=2400&q=90",
    alt: "Desert sand dunes",
    label: "Thar Desert",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function goTo(index: number) {
    if (transitioning || index === current) return;
    setPrev(current);
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => {
      setPrev(null);
      setTransitioning(false);
    }, 1200);
  }

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      const next = (current + 1) % slides.length;
      goTo(next);
    }, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, transitioning]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Slides */}
      {slides.map((slide, i) => {
        const isActive = i === current;
        const isPrev = i === prev;
        if (!isActive && !isPrev) return null;
        return (
          <div
            key={slide.src}
            className="absolute inset-0"
            style={{
              zIndex: isActive ? 2 : 1,
              opacity: isActive ? 1 : 0,
              transition: isActive ? "opacity 1.2s ease-in-out" : "none",
            }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              className="object-cover"
              style={{
                transform: isActive ? "scale(1.06)" : "scale(1.0)",
                transition: isActive
                  ? "transform 7s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                  : "none",
              }}
            />
          </div>
        );
      })}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f2e]/55 via-[#1a1f2e]/20 to-[#1a1f2e]/85" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-radial-gradient" style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(26,31,46,0.4) 100%)"
        }} />
      </div>

      {/* Slide indicators */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3"
        style={{ zIndex: 4 }}
      >
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group flex flex-col items-center gap-1.5 cursor-pointer"
            aria-label={`Go to slide ${i + 1}: ${slide.label}`}
          >
            <span
              className="text-[10px] font-medium tracking-widest uppercase transition-all duration-500"
              style={{
                color: i === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
              }}
            >
              {slide.label}
            </span>
            <span
              className="block rounded-full transition-all duration-500"
              style={{
                width: i === current ? "32px" : "6px",
                height: "3px",
                background: i === current ? "#c4622d" : "rgba(255,255,255,0.3)",
              }}
            />
          </button>
        ))}
      </div>

      {/* Animated scroll cue */}
      <div
        className="absolute bottom-10 right-10 flex flex-col items-center gap-2"
        style={{ zIndex: 4 }}
      >
        <span
          className="text-white/30 text-[10px] tracking-[0.2em] uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <div className="w-[1px] h-10 overflow-hidden">
          <div
            className="w-full bg-white/40"
            style={{
              height: "50%",
              animation: "scrollCue 1.8s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollCue {
          0% { transform: translateY(-100%); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateY(200%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
