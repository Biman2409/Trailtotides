"use client";

// The /ace page's own radar. Unlike the shared ACERadar it takes every colour from the
// page's CSS variables (so light and dark mode each get readable shades), and it animates
// from the inside: the grid draws itself, a sweep circles the chart, the shape morphs
// between profiles, the scores count, and a "you" outline can show the gaps to close.

import { useEffect, useId, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

export const AXIS_KEYS = ["stamina", "power", "strength", "agility", "water", "altitude", "focus", "nerve"] as const;
export const AXIS_NAMES = ["Stamina", "Power", "Strength", "Agility", "Water", "Altitude", "Focus", "Nerve"];
export const axisColor = (i: number) => `var(--ace-${AXIS_KEYS[i]})`;

const C = 220;   // centre
const R = 140;   // radius of a 5
const LR = 180;  // label radius

/** Point at `deg` degrees clockwise from 12 o'clock */
function polar(deg: number, r: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
}
const axisPoint = (i: number, v: number) => polar(i * 45, (v / 5) * R);

function shapePath(values: number[]) {
  return values.map((v, i) => {
    const [x, y] = axisPoint(i, v);
    return `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ") + "Z";
}
const ringPath = (level: number) => shapePath(Array(8).fill(level));

const MORPH = { duration: 0.85, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] };

/** A number that rolls to its new value instead of jumping */
export function RollingNumber({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
  const spring = useSpring(value, { stiffness: 140, damping: 22 });
  useEffect(() => { spring.set(value); }, [value, spring]);
  const text = useTransform(spring, v => Math.round(v).toString());
  return <motion.span className={className} style={style}>{text}</motion.span>;
}

function RollingTspan({ value, ...rest }: { value: number } & React.SVGProps<SVGTSpanElement>) {
  const spring = useSpring(value, { stiffness: 140, damping: 22 });
  useEffect(() => { spring.set(value); }, [value, spring]);
  const text = useTransform(spring, v => Math.round(v).toString());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <motion.tspan {...(rest as any)}>{text}</motion.tspan>;
}

type Props = {
  values: number[];
  /** CSS colour for the shape, e.g. "var(--lv-4)" */
  color: string;
  /** Optional second profile drawn dashed, with gaps marked where it falls short */
  you?: number[] | null;
  highlight?: number | null;
  onHover?: (axis: number | null) => void;
  labels?: boolean;
  /** Show each axis score under its name; off when the scores are shown elsewhere */
  scores?: boolean;
  sweep?: boolean;
  title: string;
  className?: string;
};

export default function AceRadar({ values, color, you = null, highlight = null, onHover, labels = true, scores = true, sweep = false, title, className }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.35 });
  const uid = useId().replace(/:/g, "");
  const zero = values.map(() => 0);
  const shown = seen ? values : zero;
  const youShown = you ? (seen ? you : zero) : null;
  const dim = (i: number) => highlight !== null && highlight !== i;

  const [lx, ly] = polar(-4, R * 0.75);
  const [tx, ty] = polar(-55, R * 0.75);
  const [ex, ey] = polar(-55, R + 2);

  return (
    <svg
      ref={ref}
      viewBox={labels ? "-60 0 560 440" : "72 72 296 296"}
      className={className}
      role="img"
      aria-label={title}
      style={{ overflow: "visible" }}
      onMouseLeave={() => onHover?.(null)}
    >
      <defs>
        <clipPath id={`${uid}-clip`}><path d={ringPath(5)} /></clipPath>
        <linearGradient id={`${uid}-sweep`} gradientUnits="userSpaceOnUse" x1={lx} y1={ly} x2={tx} y2={ty}>
          <stop offset="0" style={{ stopColor: color, stopOpacity: 0.3, transition: "stop-color 600ms" }} />
          <stop offset="1" style={{ stopColor: color, stopOpacity: 0, transition: "stop-color 600ms" }} />
        </linearGradient>
      </defs>

      {/* Plate and grid: rings draw themselves in, inside out */}
      <path d={ringPath(5)} style={{ fill: "var(--ace-plate)" }} />
      {[1, 2, 3, 4, 5].map(l => (
        <motion.path
          key={l} d={ringPath(l)} fill="none"
          style={{ stroke: l === 5 ? "var(--ace-grid-strong)" : "var(--ace-grid)" }}
          strokeWidth={l === 5 ? 1.5 : 1}
          initial={{ pathLength: 0 }} animate={{ pathLength: seen ? 1 : 0 }}
          transition={{ duration: 0.9, delay: 0.05 + l * 0.08, ease: "easeOut" }}
        />
      ))}
      {AXIS_KEYS.map((_, i) => {
        const [x, y] = axisPoint(i, 5);
        const on = highlight === i;
        return (
          <motion.line
            key={i} x1={C} y1={C} x2={x} y2={y}
            style={{ stroke: on ? axisColor(i) : "var(--ace-grid)", transition: "stroke 200ms" }}
            strokeWidth={on ? 2 : 1}
            initial={{ pathLength: 0 }} animate={{ pathLength: seen ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.04 }}
          />
        );
      })}

      {/* Level numbers on each ring, between the first two spokes so they never sit under a point */}
      {labels && [1, 2, 3, 4, 5].map(l => {
        const [x, y] = polar(22.5, (l / 5) * R * Math.cos(Math.PI / 8));
        return <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="600" style={{ fill: "var(--ace-faint)" }}>{l}</text>;
      })}

      {/* The sweep: a soft beam circling the chart */}
      {sweep && (
        <g clipPath={`url(#${uid}-clip)`} aria-hidden>
          <g className="ace-sweep" style={{ transformOrigin: `${C}px ${C}px` }}>
            <path d={`M${C} ${C} L${polar(0, R + 2).join(" ")} A${R + 2} ${R + 2} 0 0 0 ${ex} ${ey} Z`} fill={`url(#${uid}-sweep)`} />
            <line x1={C} y1={C} x2={C} y2={C - R - 2} style={{ stroke: color, transition: "stroke 600ms" }} strokeOpacity="0.55" strokeWidth="1.5" />
          </g>
        </g>
      )}

      {/* "You": dashed outline behind the adventure */}
      {youShown && (
        <motion.path
          initial={false} animate={{ d: shapePath(youShown) }} transition={MORPH}
          strokeWidth="2" strokeDasharray="6 5" strokeLinejoin="round"
          style={{ fill: "var(--ace-you-fill)", stroke: "var(--ace-you)" }}
        />
      )}

      {/* The adventure's shape */}
      <motion.path
        initial={false} animate={{ d: shapePath(shown) }} transition={MORPH}
        strokeWidth="2.5" strokeLinejoin="round"
        style={{ fill: `color-mix(in srgb, ${color} 20%, transparent)`, stroke: color, transition: "fill 600ms, stroke 600ms" }}
      />

      {/* Gaps: where "you" fall short, a thick segment from your score out to what's needed */}
      {you && seen && values.map((v, i) => {
        if (v <= you[i]) return null;
        const [x1, y1] = axisPoint(i, you[i]);
        const [x2, y2] = axisPoint(i, v);
        const t = { duration: 0.5, delay: 0.75 + i * 0.05 };
        return (
          <g key={`${i}-${you[i]}-${v}`}>
            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="10" strokeLinecap="round"
              style={{ stroke: "var(--ace-plate-solid)" }}
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={t} />
            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="5" strokeLinecap="round"
              style={{ stroke: v - you[i] >= 2 ? "var(--bad)" : "var(--warn)" }}
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={t} />
          </g>
        );
      })}

      {/* Points, each with a slow pulse */}
      {shown.map((v, i) => {
        const [x, y] = axisPoint(i, v);
        const hidden = values[i] === 0;
        return (
          <motion.g key={i} initial={false} animate={{ opacity: hidden ? 0 : dim(i) ? 0.3 : 1 }} transition={{ duration: 0.3 }}>
            <motion.circle
              initial={false} animate={{ cx: x, cy: y }} transition={{ ...MORPH, delay: i * 0.02 }}
              r="5" className="ace-ping" style={{ fill: axisColor(i), animationDelay: `${i * 0.35}s` }}
            />
            <motion.circle
              initial={false} animate={{ cx: x, cy: y }} transition={{ ...MORPH, delay: i * 0.02 }}
              r={highlight === i ? 7 : 5} strokeWidth="2"
              style={{ fill: axisColor(i), stroke: "var(--ace-plate-solid)", transition: "r 200ms" }}
            />
          </motion.g>
        );
      })}

      {/* Labels: name and a rolling score */}
      {labels && AXIS_KEYS.map((_, i) => {
        const [x, y] = polar(i * 45, LR);
        const anchor = Math.abs(x - C) < 5 ? "middle" : x < C ? "end" : "start";
        const zeroed = values[i] === 0;
        return (
          <g key={i} style={{ opacity: dim(i) ? 0.3 : zeroed ? 0.5 : 1, transition: "opacity 200ms" }}>
            <text x={x} y={scores ? y - 5 : y} textAnchor={anchor} dominantBaseline={scores ? undefined : "central"} fontSize={scores ? 19 : 23} fontWeight="700" style={{ fill: axisColor(i) }}>{AXIS_NAMES[i]}</text>
            {scores && <text x={x} y={y + 16} textAnchor={anchor} fontSize="16" fontWeight="600" style={{ fill: "var(--ace-soft)", fontVariantNumeric: "tabular-nums" }}>
              <RollingTspan value={values[i]} style={{ fill: "var(--ace-ink)" } as React.CSSProperties} />/5
            </text>}
          </g>
        );
      })}

      {/* Hover targets: one wedge per axis */}
      {onHover && AXIS_KEYS.map((_, i) => {
        const [ax, ay] = polar(i * 45 - 22.5, LR + 30);
        const [bx, by] = polar(i * 45 + 22.5, LR + 30);
        return (
          <path
            key={i} d={`M${C} ${C} L${ax} ${ay} L${bx} ${by} Z`} fill="transparent"
            onMouseEnter={() => onHover(i)} onClick={() => onHover(highlight === i ? null : i)}
          />
        );
      })}
    </svg>
  );
}
