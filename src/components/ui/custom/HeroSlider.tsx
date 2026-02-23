"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const slides = [
  {
    // Mountain: solo trekker on high-altitude ridge
    src: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=2560&q=95",
    alt: "Trekker on a high-altitude Himalayan ridge",
    panFrom: "50% 60%",
    panTo: "50% 42%",
    scaleFrom: 1.08,
    scaleTo: 1.18,
  },
  {
    // Ocean: kayaking through sea caves / coastal water
    src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=2560&q=95",
    alt: "Kayaker paddling through vivid turquoise coastal waters",
    panFrom: "50% 45%",
    panTo: "50% 58%",
    scaleFrom: 1.06,
    scaleTo: 1.16,
  },
  {
    // Mountain: rock climber scaling a sheer cliff face
      src: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=2560&q=95",
      alt: "Rock climber scaling a dramatic sheer cliff face",
      panFrom: "52% 60%",
      panTo: "48% 38%",
    scaleFrom: 1.07,
    scaleTo: 1.17,
  },
  {
    // Ocean: surfer riding a wave at golden hour
    src: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=2560&q=95",
    alt: "Surfer carving a wave at golden hour",
    panFrom: "55% 50%",
    panTo: "45% 50%",
    scaleFrom: 1.06,
    scaleTo: 1.15,
  },
  {
    // Mountain: mountain biker flying on a dusty singletrack trail
    src: "https://images.unsplash.com/photo-1594942274846-a7f7db97cad8?w=2560&q=95",
    alt: "Mountain biker launching off a trail ridge at speed",
    panFrom: "48% 55%",
    panTo: "52% 40%",
    scaleFrom: 1.07,
    scaleTo: 1.16,
  },
  {
    // Mountain: mountaineer on snowy summit
    src: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=2560&q=95",
    alt: "Mountaineer silhouetted against a vast snowy summit",
    panFrom: "50% 52%",
    panTo: "50% 38%",
    scaleFrom: 1.08,
    scaleTo: 1.18,
  },
];

const SLIDE_DURATION = 6000;
const TRANSITION_MS = 1600;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [fired, setFired] = useState<Set<number>>(new Set([0]));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kick off Ken Burns on slide 0 immediately
  useEffect(() => {
    const id = requestAnimationFrame(() => setFired(new Set([0])));
    return () => cancelAnimationFrame(id);
  }, []);

  function goTo(index: number) {
    if (transitioning || index === current) return;
    setPrev(current);
    setTransitioning(true);
    setCurrent(index);
    setFired((f) => new Set(f).add(index));
    setTimeout(() => {
      setPrev(null);
      setTransitioning(false);
    }, TRANSITION_MS);
  }

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => goTo((current + 1) % slides.length), SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, transitioning]);

  return (
    <div className="absolute inset-0 overflow-hidden">

      {/* ── SLIDES ─────────────────────────────────────────── */}
      {slides.map((slide, i) => {
        const isActive = i === current;
        const isPrev = i === prev;
        if (!isActive && !isPrev) return null;
        const hasFired = fired.has(i);

        return (
          <div
            key={slide.src}
            className="absolute inset-0"
            style={{
              zIndex: isActive ? 2 : 1,
              opacity: isActive ? 1 : 0,
              transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`,
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
                transformOrigin: hasFired ? slide.panTo : slide.panFrom,
                transform: `scale(${hasFired ? slide.scaleTo : slide.scaleFrom})`,
                transition: hasFired
                  ? `transform ${SLIDE_DURATION + TRANSITION_MS}ms cubic-bezier(0.22,0.61,0.36,1), transform-origin ${SLIDE_DURATION + TRANSITION_MS}ms ease`
                  : "none",
              }}
            />
          </div>
        );
      })}

      {/* ── OVERLAY STACK ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        {/* Heavy bottom-up gradient — text lives here */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />
        {/* Top darkening so navbar reads well */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
        {/* Subtle vignette edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 110% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      </div>

      {/* ── PROGRESS DOTS ──────────────────────────────────── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
        style={{ zIndex: 5 }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="relative overflow-hidden rounded-full"
            style={{
              width: i === current ? 40 : 8,
              height: 4,
              background: "rgba(255,255,255,0.2)",
              transition: "width 0.4s ease",
            }}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: "#f07a42",
                width: i === current ? "100%" : "0%",
                transition: i === current ? `width ${SLIDE_DURATION}ms linear` : "none",
              }}
            />
          </button>
        ))}
      </div>

      {/* ── SCROLL CUE ─────────────────────────────────────── */}
      <div
        className="absolute bottom-8 right-10 flex flex-col items-center gap-2"
        style={{ zIndex: 5 }}
      >
        <span
          className="text-white/30 text-[9px] tracking-[0.3em] uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <div className="w-px h-10 overflow-hidden rounded-full bg-white/15">
          <div
            className="w-full rounded-full bg-white/60"
            style={{ height: "38%", animation: "scrollCue 2s ease-in-out infinite" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollCue {
          0%   { transform: translateY(-130%); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: translateY(310%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
