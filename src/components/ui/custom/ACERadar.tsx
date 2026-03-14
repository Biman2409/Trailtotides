"use client";

import type { ACE, AceAxis } from "@/lib/ace";
import { ACE_AXIS_COLORS } from "@/lib/ace";

interface Props {
  ace: ACE;
  size?: number;
  showLabels?: boolean;
  userAce?: ACE;
}

const AXIS_ORDER: AceAxis[] = [
  "stamina", "power", "strength", "agility",
  "water", "altitude", "nerve", "focus",
];

const AXIS_ABBR: Record<AceAxis, string> = {
  stamina:  "STA",
  power:    "PWR",
  strength: "STR",
  agility:  "AGI",
  water:    "WAT",
  altitude: "ALT",
  nerve:    "NRV",
  focus:    "FOC",
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

export default function ACERadar({ ace, size = 200, showLabels = true, userAce }: Props) {
  const pad = 14;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.33;
  const labelRadius = size * 0.44;
  const n = AXIS_ORDER.length;
  const max = 5;

  const gridLevels = [1, 2, 3, 4, 5];

  const adventureValues = AXIS_ORDER.map((k) => ace[k]);
  const userValues = userAce ? AXIS_ORDER.map((k) => userAce[k]) : null;

  const adventurePath = buildPath(adventureValues, max, cx, cy, radius);
  const userPath = userValues ? buildPath(userValues, max, cx, cy, radius) : null;

  return (
    <svg width={size} height={size} viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}>
      {/* Grid rings */}
      {gridLevels.map((level) => {
        const r = (level / max) * radius;
        const pts = Array.from({ length: n }, (_, i) => {
          const angle = (360 / n) * i;
          const { x, y } = polarToXY(angle, r, cx, cy);
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="0.75"
          />
        );
      })}

      {/* Axis spokes */}
      {AXIS_ORDER.map((_, i) => {
        const angle = (360 / n) * i;
        const outer = polarToXY(angle, radius, cx, cy);
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.75"
          />
        );
      })}

      {/* User capability fill (behind adventure) */}
      {userPath && (
        <path
          d={userPath}
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
      )}

      {/* Adventure capability fill */}
      <path
        d={adventurePath}
        fill="rgba(255,81,0,0.18)"
        stroke="#ff5100"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Data point dots */}
      {adventureValues.map((v, i) => {
        const angle = (360 / n) * i;
        const r = (v / max) * radius;
        const { x, y } = polarToXY(angle, r, cx, cy);
        const color = ACE_AXIS_COLORS[AXIS_ORDER[i]];
        return (
          <circle
            key={i}
            cx={x.toFixed(2)} cy={y.toFixed(2)}
            r="3"
            fill={v > 0 ? color : "transparent"}
            stroke={v > 0 ? "rgba(0,0,0,0.4)" : "transparent"}
            strokeWidth="0.5"
          />
        );
      })}

      {/* Labels */}
      {showLabels &&
        AXIS_ORDER.map((key, i) => {
          const angle = (360 / n) * i;
          const { x, y } = polarToXY(angle, labelRadius, cx, cy);
          const color = ACE_AXIS_COLORS[key];
          const val = ace[key];

          // Text anchor based on horizontal position
          const anchor =
            Math.abs(x - cx) < 4 ? "middle" : x < cx ? "end" : "start";

          const shortLabel = AXIS_ABBR[key];

          return (
            <g key={key}>
              <text
                x={x.toFixed(2)} y={y.toFixed(2)}
                textAnchor={anchor}
                dominantBaseline="central"
                fill={val > 0 ? color : "rgba(255,255,255,0.2)"}
                fontSize={size < 160 ? "7" : "8"}
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
                letterSpacing="0.05em"
              >
                {shortLabel}
              </text>
              <text
                  x={x.toFixed(2)}
                  y={(y + (size < 160 ? 9 : 10)).toFixed(2)}
                  textAnchor={anchor}
                  fill="rgba(255,255,255,0.4)"
                  fontSize={size < 160 ? "6" : "7"}
                  fontFamily="system-ui, sans-serif"
                >
                  {val}
                </text>
            </g>
          );
        })}
    </svg>
  );
}
