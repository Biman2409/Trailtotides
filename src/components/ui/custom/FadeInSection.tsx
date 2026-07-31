"use client";

import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

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
