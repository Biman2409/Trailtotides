"use client";

import type { ACE, AceAxis } from "@/lib/ace";
import { ACE_AXIS_COLORS } from "@/lib/ace";
import { useTheme } from "next-themes";

interface Props {
  ace: ACE;
  size?: number;
  showLabels?: boolean;
  userAce?: ACE;
  userColor?: string;
  highlightAxis?: AceAxis | null;
}

const AXIS_ORDER: AceAxis[] = [
  "stamina", "power", "strength", "agility",
  "water", "altitude", "focus", "nerve",
];

const AXIS_ABBR: Record<AceAxis, string> = {
  stamina:  "Stamina",
  power:    "Power",
  strength: "Strength",
  agility:  "Agility",
  water:    "Water",
  altitude: "Altitude",
  focus:    "Focus",
  nerve:    "Nerve",
};


function polarToXY(angle: number, r: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function buildPath(values: number[], max: number, cx: number, cy: number, radius: number) {
  const n = values.length;
  return values
    .map((v, i) => {
      const angle = (360 / n) * i;
      const r = (v / max) * radius;
      const { x, y } = polarToXY(angle, r, cx, cy);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

// hex → rgb helper for rgba usage
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

export default function ACERadar({ ace, size = 220, showLabels = true, userAce, userColor = "#38bdf8", highlightAxis = null }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  // Colors that work in both modes — use mid-grey instead of white/black
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const spokeColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const labelInactive = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)";
  const scoreInactive = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)";
  const pad = 36;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.30;
  const labelRadius = size * 0.44;
  const n = AXIS_ORDER.length;
  const max = 5;

  const gridLevels = [1, 2, 3, 4, 5];
  const adventureValues = AXIS_ORDER.map((k) => ace[k]);
  const userValues = userAce ? AXIS_ORDER.map((k) => userAce[k]) : null;
  const adventurePath = buildPath(adventureValues, max, cx, cy, radius);
  const userPath = userValues ? buildPath(userValues, max, cx, cy, radius) : null;

  // dominant color = axis with highest value
  const maxVal = Math.max(...adventureValues);
  const dominantAxis = AXIS_ORDER[adventureValues.indexOf(maxVal)];
  const dominantColor = ACE_AXIS_COLORS[dominantAxis] ?? "#ff5100";
  const dominantRgb = hexToRgb(dominantColor);

  // Dim every axis but the hovered one when a breakdown row is highlighted
  const dimmed = (key: AceAxis) => !!highlightAxis && key !== highlightAxis;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Ambient glow under the chart */}
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={dominantColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={dominantColor} stopOpacity="0" />
        </radialGradient>

        {/* Fill gradient for user shape */}
        <radialGradient id="userFill" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={`rgb(${dominantRgb})`} stopOpacity="0.28" />
          <stop offset="100%" stopColor={`rgb(${dominantRgb})`} stopOpacity="0.08" />
        </radialGradient>

        {/* Per-axis dot glow filters */}
        {AXIS_ORDER.map((key) => {
          const color = ACE_AXIS_COLORS[key];
          return (
            <filter key={`glow-${key}`} id={`glow-${key}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          );
        })}
      </defs>

      {/* Ambient background glow */}
      <ellipse
        cx={cx} cy={cy}
        rx={radius * 1.5} ry={radius * 1.5}
        fill="url(#radarGlow)"
      />

      {/* Grid rings — subtle polygons */}
      {gridLevels.map((level) => {
        const r = (level / max) * radius;
        const pts = Array.from({ length: n }, (_, i) => {
          const angle = (360 / n) * i;
          const { x, y } = polarToXY(angle, r, cx, cy);
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(" ");
        const isFull = level === 5;
        return (
          <polygon
            key={level}
            points={pts}
            fill={isFull ? `rgba(${dominantRgb},0.03)` : "none"}
            stroke={isFull ? `rgba(${dominantRgb},0.18)` : gridColor}
            strokeWidth={isFull ? "1" : "0.6"}
          />
        );
      })}

      {/* Axis spokes */}
      {AXIS_ORDER.map((key, i) => {
        const angle = (360 / n) * i;
        const outer = polarToXY(angle, radius, cx, cy);
        const color = ACE_AXIS_COLORS[key];
        const val = ace[key];
        const isHighlighted = highlightAxis === key;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
            stroke={isHighlighted ? `${color}90` : val > 0 ? `${color}30` : spokeColor}
            strokeWidth={isHighlighted ? "1.5" : "0.75"}
            opacity={dimmed(key) ? 0.25 : 1}
            style={{ transition: "opacity 150ms ease, stroke 150ms ease, stroke-width 150ms ease" }}
          />
        );
      })}

      {/* User ACE fill (behind main) */}
      {userPath && (
        <path
          d={userPath}
          fill={`${userColor}18`}
          stroke={userColor}
          strokeWidth="1.5"
          strokeDasharray="4 2.5"
          strokeLinejoin="round"
        />
      )}

      {/* Main fill shape */}
      <path
        d={adventurePath}
        fill="url(#userFill)"
        stroke={dominantColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.95"
      />

      {/* Data point dots with per-axis color glow */}
      {adventureValues.map((v, i) => {
        const angle = (360 / n) * i;
        const r = (v / max) * radius;
        const { x, y } = polarToXY(angle, r, cx, cy);
        const key = AXIS_ORDER[i];
        const color = ACE_AXIS_COLORS[key];
        if (v === 0) return null;
        const isHighlighted = highlightAxis === key;
        return (
          <g key={i} opacity={dimmed(key) ? 0.25 : 1} style={{ transition: "opacity 150ms ease" }}>
            {/* halo */}
            <circle
              cx={x.toFixed(2)} cy={y.toFixed(2)}
              r={isHighlighted ? "8" : "5"}
              fill={color}
              opacity={isHighlighted ? "0.22" : "0.12"}
              style={{ transition: "r 150ms ease, opacity 150ms ease" }}
            />
            {/* dot */}
            <circle
              cx={x.toFixed(2)} cy={y.toFixed(2)}
              r={isHighlighted ? "4.2" : "2.8"}
              fill={color}
              filter={`url(#glow-${key})`}
              style={{ transition: "r 150ms ease" }}
            />
          </g>
        );
      })}

      {/* Labels */}
      {showLabels &&
        AXIS_ORDER.map((key, i) => {
          const angle = (360 / n) * i;
          const { x, y } = polarToXY(angle, labelRadius, cx, cy);
          const color = ACE_AXIS_COLORS[key];
          const val = ace[key];
          const active = val > 0;

          const anchor =
            Math.abs(x - cx) < 4 ? "middle" : x < cx ? "end" : "start";

          const abbr = AXIS_ABBR[key];
          const isHighlighted = highlightAxis === key;

          return (
            <g
              key={key}
              opacity={dimmed(key) ? 0.25 : active ? 1 : 0.3}
              style={{ transition: "opacity 150ms ease" }}
            >
              {/* abbr label */}
              <text
                x={x.toFixed(2)} y={(y - 4).toFixed(2)}
                textAnchor={anchor}
                dominantBaseline="central"
                fill={active ? color : labelInactive}
                fontSize={isHighlighted ? (size < 180 ? "8" : "9.5") : size < 180 ? "7" : "8.5"}
                fontWeight="800"
                letterSpacing="0.05em"
                fontFamily="system-ui, sans-serif"
                style={{ transition: "font-size 150ms ease" }}
              >
                {abbr}
              </text>
              {/* score */}
              <text
                x={x.toFixed(2)}
                y={(y + (size < 180 ? 8 : 10)).toFixed(2)}
                textAnchor={anchor}
                fill={active ? `rgba(${hexToRgb(color)},0.65)` : scoreInactive}
                fontSize={size < 180 ? "6.5" : "7.5"}
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                {val}/5
              </text>
            </g>
          );
        })}
    </svg>
  );
}
