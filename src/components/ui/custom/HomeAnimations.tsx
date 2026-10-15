"use client";

import { useEffect, useLayoutEffect, useRef, ReactNode } from "react";
import { TIDES_WAVE_SRCS } from "./heroTextures";
import CanvasText, { type Painter } from "./CanvasText";

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
// Painters for the canvas-drawn words (see CanvasText). They paint inside the letters only.
const TRAIL_IMAGES = ["/hero/trail-contours.png"];
const easeInOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;

// TRAIL: warm gradient with the contour map drifting across, there and back over 32s
const paintTrail: Painter = (ctx, w, h, t, [contours]) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#ffc27a"); g.addColorStop(0.45, "#ff8a33"); g.addColorStop(1, "#f2560f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (contours?.complete && contours.naturalWidth) {
    const cycle = (t % 32) / 16; // 0→2
    const p = easeInOutSine(cycle <= 1 ? cycle : 2 - cycle);
    ctx.drawImage(contours, -w * p, 0, w * 2, h);
  }
};

// TIDES: cool gradient with two layers of wave lines sliding past each other
const paintTides: Painter = (ctx, w, h, t, waves) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#b8f6ec"); g.addColorStop(0.45, "#4fd6cf"); g.addColorStop(1, "#1797a8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const shift = ((t % 9) / 9) * 240;
  waves.forEach((img, i) => {
    if (!img.complete || !img.naturalWidth) return;
    const pattern = ctx.createPattern(img, "repeat");
    if (!pattern) return;
    pattern.setTransform(new DOMMatrix([1, 0, 0, 1, i === 0 ? shift : -shift, 0]));
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
  });
};

export function HeroHeadline() {
  const ref = useRef<HTMLHeadingElement>(null);
  const trailRef = useRef<HTMLSpanElement>(null);
  const tidesRef = useRef<HTMLSpanElement>(null);

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
          <span ref={trailRef} className="hh-word">Trail<CanvasText targetRef={trailRef} paint={paintTrail} images={TRAIL_IMAGES} animate /></span>
        </span>
      </span>
      <span className="hh-row hh-row2" style={{ animation: "heroLineIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.12s both" }}>
        <span className="hh-lead">To <strong>Ocean</strong></span>
        <span className="hh-wrap" data-text="Tides">
          <span ref={tidesRef} className="hh-word">Tides<CanvasText targetRef={tidesRef} paint={paintTides} images={TIDES_WAVE_SRCS} animate /></span>
        </span>
      </span>
      <style>{`
        .hh { margin: 0; display: flex; flex-direction: column; text-transform: uppercase; transform-origin: center;
              font-family: var(--font-jakarta), 'Plus Jakarta Sans', sans-serif; letter-spacing: 0; }
        .hh-row { display: flex; flex-direction: column; align-items: flex-start; gap: 0.1rem; }
        .hh-row2 { margin: clamp(0.15rem, 0.6svh, 0.4rem) 0 0 12vw; }
        /* Leads in the logo tagline's hand-lettered script, so the headline reads like the wordmark */
        .hh-lead { font-family: var(--font-script), cursive; font-weight: 600; text-transform: none; font-size: 1.05rem;
                   line-height: 1; letter-spacing: 0.01em; color: rgba(255,255,255,0.72); white-space: nowrap;
                   text-shadow: 0 1px 12px rgba(0,0,0,0.5); }
        .hh-lead strong { font-weight: 700; color: #fff; }
        /* Sized by the shorter of width and height, so short screens don't push the search off */
        .hh-wrap { position: relative; display: block; font-weight: 800; font-size: min(17vw, 9.5svh); line-height: 0.8;
                   letter-spacing: -0.025em; }
        /* Shadow lives on a static copy behind the word, so it's painted once
           rather than re-filtered on every animation frame */
        .hh-wrap::before { content: attr(data-text); position: absolute; left: 0; top: 0; padding-right: 0.04em;
                           color: transparent; text-shadow: 0 0.6rem 1.6rem rgba(0,0,0,0.32); pointer-events: none; }
        /* The real text is invisible; CanvasText paints the textured letters over it */
        .hh-word { position: relative; display: block; padding-right: 0.04em; color: transparent !important;
                   -webkit-text-fill-color: transparent !important; }
        @media (min-width: 768px) {
          .hh-row { gap: clamp(0.1rem, 0.25vw, 0.3rem); }
          .hh-row2 { margin: clamp(0.2rem, min(0.6vw, 0.8svh), 0.7rem) 0 0 clamp(6rem, 14vw, 11rem); }
          .hh-lead { font-size: clamp(1.8rem, 2.8vw, 2.4rem); }
          .hh-wrap { font-size: clamp(5.4rem, min(15.8vw, 22.3svh), 14rem); }
        }
        /* Desktop: JS centres it horizontally over the search box */
        @media (min-width: 1024px) {
          .hh { position: relative; }
        }
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
