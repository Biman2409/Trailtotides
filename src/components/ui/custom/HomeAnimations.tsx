"use client";

import { useEffect, useLayoutEffect, useRef, ReactNode } from "react";
import { TRAIL_FILL, TRAIL_SIZE, TIDES_FILL, TIDES_SIZE } from "./heroTextures";

/* ── Scroll-triggered fade/slide-up ── */
export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ── Staggered children wrapper ── */
export function StaggerChildren({
  children,
  baseDelay = 0,
  step = 80,
  className = "",
}: {
  children: ReactNode[];
  baseDelay?: number;
  step?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <FadeUp key={i} delay={baseDelay + i * step}>
          {child}
        </FadeUp>
      ))}
    </div>
  );
}

/* ── Hero ambient orb (purely decorative) ── */
export function HeroOrbs() {
  return (
    <>
      {/* top-left warm orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "10%",
          left: "-8%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,140,80,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "orbFloat 9s ease-in-out infinite",
        }}
      />
      {/* bottom-right cool orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "5%",
          right: "-6%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.09) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "orbFloat 12s ease-in-out infinite reverse",
        }}
      />
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-24px) scale(1.04); }
        }
      `}</style>
    </>
  );
}

/* ── Shimmer line (horizontal rule accent) ── */
export function ShimmerLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px w-full ${className}`}
      style={{
        background: "linear-gradient(90deg, transparent, rgba(255,81,0,0.4) 40%, rgba(255,81,0,0.4) 60%, transparent)",
        animation: "shimmerPulse 3s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes shimmerPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Hero headline ──
   FROM MOUNTAIN TRAIL / TO OCEAN TIDES on one left axis, TIDES stepped in under TRAIL.
   TRAIL carries a drifting contour map, TIDES moving wave lines — mountain and ocean
   drawn into the words themselves. Each lead-in sits directly above its word. */
export function HeroHeadline() {
  const ref = useRef<HTMLHeadingElement>(null);

  // Repainting text-clipped backgrounds every frame isn't free — pause the drift and the
  // waves whenever the hero is scrolled out of view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      el.toggleAttribute("data-paused", !entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The headline is the one part of the hero that gives way on short screens: it scales down
  // to whatever height its slot gets, so the promise, search bar and links below always fit
  // on the first screen. Never scales up, so normal screens keep the full-size words.
  useLayoutEffect(() => {
    const el = ref.current, slot = el?.parentElement;
    if (!el || !slot) return;
    const search = document.getElementById("hero-compass-input")?.closest("form") ?? null;
    const fit = () => {
      // Desktop: centre the headline over the search box rather than the page
      let dx = 0;
      if (search && window.matchMedia("(min-width: 1024px)").matches) {
        const s = search.getBoundingClientRect(), slotBox = slot.getBoundingClientRect();
        dx = s.left + s.width / 2 - (slotBox.left + slotBox.width / 2);
      }
      el.style.left = dx ? `${dx}px` : "";
      // Leave room for the horizontal nudge so the moved headline still fits
      const scale = Math.min(1, slot.clientHeight / el.offsetHeight, (slot.clientWidth - 2 * Math.abs(dx)) / el.offsetWidth);
      el.style.transform = scale < 1 ? `scale(${Math.max(scale, 0.4)})` : "";
      // Shrink toward the bottom on desktop, where the headline sits low in its slot
      el.style.transformOrigin = dx ? "center bottom" : "";
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(slot);
    ro.observe(el);
    if (search) ro.observe(search);
    return () => ro.disconnect();
  }, []);

  return (
    <h1 ref={ref} className="hh">
      <span className="hh-row" style={{ animation: "heroLineIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both" }}>
        <span className="hh-lead">From <strong>Mountain</strong></span>
        <span className="hh-wrap" data-text="Trail">
          <span className="hh-word hh-trail" style={{ backgroundImage: TRAIL_FILL, backgroundSize: TRAIL_SIZE }}>Trail</span>
        </span>
      </span>
      <span className="hh-row hh-row2" style={{ animation: "heroLineIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.12s both" }}>
        <span className="hh-lead">To <strong>Ocean</strong></span>
        <span className="hh-wrap" data-text="Tides">
          <span className="hh-word hh-tides" style={{ backgroundImage: TIDES_FILL, backgroundSize: TIDES_SIZE }}>Tides</span>
        </span>
      </span>
      <style>{`
        .hh { margin: 0; display: flex; flex-direction: column; text-transform: uppercase; transform-origin: center;
              font-family: var(--font-jakarta), 'Plus Jakarta Sans', sans-serif; letter-spacing: 0; }
        .hh-row { display: flex; flex-direction: column; align-items: flex-start; gap: 0.35rem; }
        .hh-row2 { margin: clamp(0.75rem, 2svh, 1.25rem) 0 0 12vw; }
        /* Leads in the logo tagline's hand-lettered script, so the headline reads like the wordmark */
        .hh-lead { font-family: var(--font-script), cursive; font-weight: 600; text-transform: none; font-size: 1.05rem;
                   line-height: 1; letter-spacing: 0.01em; color: rgba(255,255,255,0.72); white-space: nowrap;
                   text-shadow: 0 1px 12px rgba(0,0,0,0.5); }
        .hh-lead strong { font-weight: 700; color: #fff; }
        /* Sized by the shorter of width and height, so short screens don't push the search off */
        .hh-wrap { position: relative; display: block; font-weight: 800; font-size: min(17vw, 9.5svh); line-height: 0.86;
                   letter-spacing: -0.025em; }
        /* Shadow lives on a static copy behind the word, so it's painted once
           rather than re-filtered on every animation frame */
        .hh-wrap::before { content: attr(data-text); position: absolute; left: 0; top: 0; padding-right: 0.04em;
                           color: transparent; text-shadow: 0 0.6rem 1.6rem rgba(0,0,0,0.32); pointer-events: none; }
        .hh-word { position: relative; display: block; padding-right: 0.04em;
                   color: transparent; -webkit-background-clip: text; background-clip: text; }
        .hh-trail { animation: hhTrail 16s ease-in-out infinite alternate; }
        .hh-tides { animation: hhTides 9s linear infinite; }
        .hh[data-paused] .hh-word { animation-play-state: paused; }
        @media (min-width: 768px) {
          .hh-row { gap: clamp(0.45rem, 0.8vw, 0.75rem); }
          .hh-row2 { margin: clamp(0.75rem, min(2.2vw, 2.5svh), 2rem) 0 0 clamp(6rem, 14vw, 11rem); }
          .hh-lead { font-size: clamp(1.8rem, 2.8vw, 2.4rem); }
          .hh-wrap { font-size: clamp(5.4rem, min(15.8vw, 22.3svh), 14rem); }
        }
        /* Desktop: JS centres it horizontally over the search box */
        @media (min-width: 1024px) {
          .hh { position: relative; }
        }
        @keyframes hhTrail { to { background-position: 100% 0, 0 0; } }
        @keyframes hhTides { to { background-position: 240px 0, -240px 0, 0 0; } }
      `}</style>
    </h1>
  );
}

/* ── Hero 4-box feature grid ── */
const HERO_FEATURES = [
  {
    num: "01",
    title: "Body Assessment",
    body: "Our AI evaluates your fitness, medical history, and past adventure experience to build your physiological profile.",
  },
  {
    num: "02",
    title: "AI Matching",
    body: "We compare your profile against 340+ expeditions to surface routes that challenge without overextending you.",
  },
  {
    num: "03",
    title: "Precision Mapping",
    body: "Every route is layered with elevation, weather windows, resupply points, and emergency egress mapped to the meter.",
  },
  {
    num: "04",
    title: "Trusted Operators",
    body: "Book only through India's most vetted guides — operators who have passed our rigorous safety, ethics, and experience review.",
  },
];

export function HeroFeatureBoxes() {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-px w-full max-w-4xl mx-auto rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.08)",
        animation: "heroLineIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.55s both",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.4)",
      }}
    >
      {HERO_FEATURES.map(({ num, title, body }) => (
        <div
          key={num}
          className="flex flex-col gap-3 p-5 lg:p-6 text-left"
          style={{ background: "rgba(20,16,14,0.72)", backdropFilter: "blur(16px)" }}
        >
          <span
            className="text-[10px] font-black tracking-[0.25em]"
            style={{ color: "#ff5100" }}
          >
            {num}
          </span>
          <p className="text-white text-[13px] font-bold leading-snug tracking-tight uppercase" style={{ letterSpacing: "0.04em" }}>
            {title}
          </p>
          <p className="text-white/45 text-[11px] leading-relaxed">
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── CTA wrapper fade-in ── */
export function HeroCTAWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-full"
      style={{
        animation: "heroLineIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.28s both",
      }}
    >
      {children}
    </div>
  );
}
