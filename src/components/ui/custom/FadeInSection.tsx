"use client";

import { motion } from "framer-motion";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right";
type Animation = "fade" | "slide" | "scale" | "reveal";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  as?: "div" | "section" | "article" | "span";
  direction?: Direction;
  distance?: number;
  once?: boolean;
};

const spring = { type: "spring", stiffness: 260, damping: 30 };
const smooth = (duration = 0.6) => ({
  duration,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
});

export default function FadeInSection({
  children, className, style, delay = 0, duration = 0.6,
  as = "div", direction = "up", distance = 24, once = true,
}: Props) {
  const Component = motion[as as keyof typeof motion] as typeof motion.div;
  const dirMap: Record<Direction, { x?: number; y?: number }> = {
    up:    { y: distance },
    down:  { y: -distance },
    left:  { x: distance },
    right: { x: -distance },
  };
  const offset = dirMap[direction];

  return (
    <Component
      className={className}
      style={style}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{ delay, ...smooth(duration) }}
    >
      {children}
    </Component>
  );
}

/* ── Slide from sides ── */
export function SlideLeft({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <FadeInSection className={className} delay={delay} direction="left" distance={40}>{children}</FadeInSection>;
}

export function SlideRight({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <FadeInSection className={className} delay={delay} direction="right" distance={40}>{children}</FadeInSection>;
}

/* ── Scale in (subtle pop) ── */
export function ScaleIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Staggered grid children ── */
export function StaggerContainer({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Zoom image on scroll (parallax-like) ── */
export function ZoomImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <motion.div
      className={`overflow-hidden ${className ?? ""}`}
      initial={{ scale: 1.1 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </motion.div>
  );
}

/* ── Count-up number animation ── */
export function CountUp({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 30;
          const increment = value / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref} className={className}>{count}{suffix}</span>;
}

/* ── Text reveal (word by word) ── */
export function RevealText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay + i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {word}{i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}