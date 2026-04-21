"use client";

import { useEffect, useRef, ReactNode } from "react";

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
          background: "radial-gradient(circle, rgba(255,81,0,0.13) 0%, transparent 70%)",
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

/* ── Hero headline reveal ── */
export function HeroHeadline() {
  return (
    <h1
      className="font-black tracking-tight"
      style={{
        fontSize: "clamp(2.4rem, 7vw, 5.6rem)",
        lineHeight: 1.04,
        color: "white",
        textShadow: "0 4px 32px rgba(0,0,0,0.55)",
      }}
    >
      <span
        style={{
          display: "block",
          animation: "heroLineIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both",
        }}
      >
        From Mountain{" "}
        <em style={{ fontStyle: "italic", fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>Trail</em>
      </span>
      <span
        style={{
          display: "block",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,81,0,0.5) 30%, rgba(255,81,0,0.5) 70%, transparent)",
          margin: "0.4em auto",
          maxWidth: "400px",
          animation: "dividerExpand 1s cubic-bezier(0.22,1,0.36,1) 0.45s both",
          transformOrigin: "center",
        }}
      />
      <span
        style={{
          display: "block",
          animation: "heroLineIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s both",
        }}
      >
        To Ocean{" "}
        <em style={{ fontStyle: "italic", fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>Tides</em>
      </span>
      <style>{`
        @keyframes heroLineIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dividerExpand {
          from { opacity: 0; transform: scaleX(0); }
          to   { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
    </h1>
  );
}

/* ── Subheading fade-in ── */
export function HeroSubheading() {
  return (
    <p
      className="text-white/60 text-base md:text-lg mx-auto leading-relaxed"
      style={{
        maxWidth: 480,
        textShadow: "0 1px 12px rgba(0,0,0,0.9)",
        animation: "heroLineIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.55s both",
        letterSpacing: "0.01em",
      }}
    >
      Discover, compare, and book India&apos;s elite adventures.<br />Matched to your body. Guided by AI.
      <style>{`
        @keyframes heroLineIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </p>
  );
}

/* ── CTA wrapper fade-in ── */
export function HeroCTAWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        animation: "heroLineIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.75s both",
      }}
    >
      {children}
      <style>{`
        @keyframes heroLineIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
