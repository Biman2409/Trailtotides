"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

interface Props {
  routePoints: [number, number][];
  maxAltitude?: string; // e.g. "3,636m (Sandakphu)"
  adventureName: string;
}

// Haversine distance between two lat/lng points (km)
function distKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Rough altitude estimation from lat/lng using DEM-like heuristics
// This is a visual approximation for display purposes
function estimateAlt(lat: number, lng: number): number {
  // Very rough India mountain elevation model
  // Himalayas: high lat + certain lng bands = high altitude
  const baseLat = 27;
  const baseLng = 80;
  const latDelta = lat - baseLat;
  const lngDelta = lng - baseLng;

  // Mountain bias based on known ranges
  let alt = 1200;

  // Himalayas core
  if (lat > 28 && lat < 36 && lng > 74 && lng < 92) {
    alt = 2800 + latDelta * 180 + Math.sin(lngDelta * 0.4) * 600;
  }
  // Western Himalayas (HP/Uttarakhand)
  if (lat > 30 && lat < 34 && lng > 76 && lng < 80) {
    alt = 3200 + (lat - 30) * 400 + Math.cos((lng - 78) * 1.5) * 800;
  }
  // Ladakh
  if (lat > 33 && lat < 36 && lng > 76 && lng < 78) {
    alt = 4000 + (lat - 33) * 500;
  }
  // Northeast (Sikkim/Darjeeling)
  if (lat > 26 && lat < 28.5 && lng > 87 && lng < 89.5) {
    alt = 2000 + (lat - 26) * 600;
  }
  // Gangotri / Kedarnath area
  if (lat > 30.5 && lat < 31.5 && lng > 78.5 && lng < 80) {
    alt = 3500 + (lat - 30.5) * 1200;
  }

  return Math.max(500, Math.round(alt));
}

export default function ElevationProfile({ routePoints, maxAltitude, adventureName }: Props) {
  const data = useMemo(() => {
    if (!routePoints || routePoints.length < 2) return null;

    let cumDist = 0;
    const pts = routePoints.map((p, i) => {
      if (i > 0) cumDist += distKm(routePoints[i - 1], p);
      return { dist: cumDist, alt: estimateAlt(p[0], p[1]) };
    });

    const maxAlt = Math.max(...pts.map((p) => p.alt));
    const minAlt = Math.min(...pts.map((p) => p.alt));
    const totalDist = pts[pts.length - 1].dist;
    const altRange = maxAlt - minAlt || 1;

    return { pts, maxAlt, minAlt, totalDist, altRange };
  }, [routePoints]);

  if (!data) return null;

  const W = 560;
  const H = 120;
  const PAD = { top: 14, right: 16, bottom: 28, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  function xOf(dist: number) {
    return PAD.left + (dist / data.totalDist) * chartW;
  }
  function yOf(alt: number) {
    return PAD.top + chartH - ((alt - data.minAlt) / data.altRange) * chartH;
  }

  const pathD = data.pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.dist).toFixed(1)} ${yOf(p.alt).toFixed(1)}`)
    .join(" ");

  const fillD =
    pathD +
    ` L ${xOf(data.totalDist).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${PAD.left} ${(PAD.top + chartH).toFixed(1)} Z`;

  // Y-axis ticks
  const altStep = Math.ceil(data.altRange / 3 / 100) * 100;
  const yTicks: number[] = [];
  for (let a = Math.ceil(data.minAlt / altStep) * altStep; a <= data.maxAlt; a += altStep) {
    yTicks.push(a);
  }

  // Peak point
  const peakIdx = data.pts.reduce(
    (best, p, i) => (p.alt > data.pts[best].alt ? i : best),
    0
  );
  const peak = data.pts[peakIdx];

  const parsedMax = maxAltitude ? maxAltitude.replace(/[^0-9]/g, "") : null;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Elevation Profile</p>
        </div>
        {parsedMax && (
          <span className="text-[10px] font-semibold text-sky-400/70">
            Summit ~{parseInt(parsedMax).toLocaleString()}m
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="px-2 pb-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: H, display: "block" }}
        >
          <defs>
            <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((a) => (
            <g key={a}>
              <line
                x1={PAD.left}
                y1={yOf(a)}
                x2={PAD.left + chartW}
                y2={yOf(a)}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 5}
                y={yOf(a) + 3.5}
                textAnchor="end"
                fill="rgba(255,255,255,0.25)"
                fontSize="8"
                fontFamily="monospace"
              >
                {a >= 1000 ? `${(a / 1000).toFixed(1)}k` : a}
              </text>
            </g>
          ))}

          {/* X-axis distance ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const d = frac * data.totalDist;
            const x = xOf(d);
            return (
              <text
                key={frac}
                x={x}
                y={H - 4}
                textAnchor="middle"
                fill="rgba(255,255,255,0.2)"
                fontSize="8"
                fontFamily="monospace"
              >
                {d.toFixed(0)}km
              </text>
            );
          })}

          {/* Fill */}
          <path d={fillD} fill="url(#elevGrad)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Peak marker */}
          <circle cx={xOf(peak.dist)} cy={yOf(peak.alt)} r="3.5" fill="#ff5100" />
          <circle cx={xOf(peak.dist)} cy={yOf(peak.alt)} r="6" fill="none" stroke="#ff5100" strokeWidth="1" strokeOpacity="0.4" />
          <text
            x={xOf(peak.dist)}
            y={yOf(peak.alt) - 9}
            textAnchor="middle"
            fill="#ff9d70"
            fontSize="8"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            {peak.alt >= 1000 ? `${(peak.alt / 1000).toFixed(2)}k m` : `${peak.alt}m`}
          </text>

          {/* Start dot */}
          <circle cx={xOf(0)} cy={yOf(data.pts[0].alt)} r="2.5" fill="#10b981" />

          {/* End dot */}
          <circle
            cx={xOf(data.totalDist)}
            cy={yOf(data.pts[data.pts.length - 1].alt)}
            r="2.5"
            fill="#a78bfa"
          />
        </svg>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-5 px-4 pb-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
          <span className="text-[9px] text-white/30">Start</span>
        </div>
        <div className="flex items-center gap-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-[#ff5100] block" />
          <span className="text-[9px] text-white/30">Peak</span>
        </div>
        <div className="flex items-center gap-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-violet-400 block" />
          <span className="text-[9px] text-white/30">End</span>
        </div>
        <div className="flex items-center gap-1.5 pt-2 ml-auto">
          <span className="text-[9px] text-white/20">~{data.totalDist.toFixed(0)}km route</span>
        </div>
      </div>
    </div>
  );
}
