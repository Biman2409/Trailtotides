"use client";

import { useEffect, useRef, ReactNode, type CSSProperties } from "react";

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

/* Accent words in the hero headline: hand-painted marker in brand orange against the
   DM Sans sans, sized down slightly because Permanent Marker's caps run large. */
const HERO_ACCENT_STYLE: CSSProperties = {
  fontFamily: "var(--font-marker), cursive",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "calc(0.92em + 5px)",
  letterSpacing: "-0.01em",
  color: "#ff7d47",
};

/* ── Hero headline reveal ── */
export function HeroHeadline() {
  return (
    <h1
      className="font-extrabold tracking-tight"
      style={{
        fontSize: "clamp(2.3rem, 6vw, 4.8rem)",
        lineHeight: 1.08,
        color: "white",
        textShadow: "0 4px 40px rgba(0,0,0,0.6)",
        letterSpacing: "-0.02em",
      }}
    >
      <span
        style={{
          display: "block",
          animation: "heroLineIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both",
        }}
      >
        {/* Keep "Mountain Trail" together so narrow screens break after "From", not before "Trail" */}
        From <span className="whitespace-nowrap">Mountain <em style={HERO_ACCENT_STYLE}>Trail</em></span>
      </span>
      <span
        style={{
          display: "block",
          animation: "heroLineIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.12s both",
        }}
      >
        To <span className="whitespace-nowrap">Ocean <em style={HERO_ACCENT_STYLE}>Tides</em></span>
      </span>
      <style>{`
        @keyframes heroLineIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </h1>
  );
}

/* ── Subheading fade-in ── */
export function HeroSubheading() {
  return (
    <div
      className="flex flex-col items-center gap-3 w-full mx-auto"
      style={{
        maxWidth: "100%",
        animation: "heroLineIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both",
      }}
    >
      {/* Three-step promise + supporting line — unboxed, so headline → promise → copy → search
          reads as one continuous column. Legibility over busy photos comes from the hero scrim
          and text shadow, not from containers. */}
      <p
        className="font-bold uppercase text-center text-white"
        style={{
          fontSize: "clamp(0.85rem, 1.7vw, 1.05rem)",
          letterSpacing: "0.24em",
          textShadow: "0 1px 2px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.55)",
        }}
      >
        Discover <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span> Compare <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span> Book
      </p>

      <p
        className="text-center font-medium leading-relaxed"
        style={{
          fontSize: "clamp(1rem, 2.1vw, 1.2rem)",
          color: "rgba(255,255,255,0.88)",
          letterSpacing: "0.01em",
          textWrap: "balance",
          textShadow: "0 1px 2px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.55)",
        }}
      >
        Adventures matched to your body, recommended by AI, run by real operators.
      </p>

      <style>{`
        @keyframes heroLineIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
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
      <style>{`
        @keyframes heroLineIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
      <style>{`
        @keyframes heroLineIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
