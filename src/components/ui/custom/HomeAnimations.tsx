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
        fontSize: "clamp(2.6rem, 7.5vw, 6rem)",
        lineHeight: 1.02,
        color: "white",
        textShadow: "0 4px 40px rgba(0,0,0,0.6)",
        letterSpacing: "-0.02em",
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
    <div
      className="flex flex-col items-center gap-5 mx-auto px-10 py-7 rounded-2xl"
      style={{
        maxWidth: 500,
        animation: "heroLineIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.55s both",
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Word trio */}
      <div className="flex items-center gap-0 text-white font-black tracking-wide italic" style={{ fontSize: "clamp(0.85rem, 2vw, 1.05rem)", letterSpacing: "0.05em" }}>
        {["Discover", "Compare", "Book"].map((word, i) => (
          <span key={word} className="flex items-center">
            <span>{word}</span>
            {i < 2 && (
              <span className="mx-3 text-[#ff5100]/70" style={{ fontSize: "0.45em" }}>◆</span>
            )}
          </span>
        ))}
      </div>

      {/* Thin separator */}
      <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

      {/* Supporting copy */}
      <p
        className="text-white/45 text-sm leading-relaxed text-center"
        style={{ letterSpacing: "0.015em" }}
      >
        Elite adventures across India — tailored to your body,<br />precision&#8209;mapped by AI, and led by trusted operators.
      </p>
      <style>{`
        @keyframes heroLineIn {
          from { opacity: 0; transform: translateY(20px); }
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
          style={{ background: "rgba(10,14,22,0.72)", backdropFilter: "blur(16px)" }}
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
          from { opacity: 0; transform: translateY(20px); }
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
