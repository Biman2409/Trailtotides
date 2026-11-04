"use client";

import { useRef, useState } from "react";

// The trek's elevation profile, walked day by day: each walking day is a band along the line,
// and moving along the chart shows the kilometre, the height and which day you're on, with
// that day's band lit. The same chart as before for anyone not pointing at it.

import type { DayBand } from "@/lib/trails/dayBands";
export type { DayBand };

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

/** compact: drawn on a narrower canvas, so its labels stay readable in a side panel */
export default function TrailElevation({ pts, bands, compact = false, peakM }: {
  pts: [number, number][]; bands: DayBand[]; compact?: boolean;
  /** The height to label the top with, when the page states it elsewhere (so the two agree) */
  peakM?: number;
}) {
  const W = compact ? 480 : 1000, H = compact ? 220 : 236, PAD = { l: 44, r: 12, t: 34, b: 24 };
  const maxKm = pts[pts.length - 1][0] || 1;
  const eles = pts.map((p) => p[1]);
  const lo = Math.floor((Math.min(...eles) - 100) / 500) * 500;
  const hi = Math.ceil((Math.max(...eles) + 100) / 500) * 500;
  const x = (km: number) => PAD.l + (km / maxKm) * (W - PAD.l - PAD.r);
  const y = (e: number) => PAD.t + (1 - (e - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const line = pts.map(([k, e], i) => `${i ? "L" : "M"}${x(k).toFixed(1)},${y(e).toFixed(1)}`).join("");
  const top = pts.reduce((m, p) => (p[1] > m[1] ? p : m), pts[0]);
  const ticks: number[] = [];
  for (let e = lo; e <= hi; e += hi - lo > 2000 ? 1000 : 500) ticks.push(e);

  const svgRef = useRef<SVGSVGElement>(null);
  const [at, setAt] = useState<[number, number] | null>(null);
  const bandAt = (km: number) => bands.find((b) => km >= Math.min(b.from, b.to) - 0.05 && km <= Math.max(b.from, b.to) + 0.05) ?? null;
  const onMove = (clientX: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const km = Math.max(0, Math.min(maxKm, ((clientX - r.left) / r.width * W - PAD.l) / (W - PAD.l - PAD.r) * maxKm));
    const p = pts.reduce((m, q) => (Math.abs(q[0] - km) < Math.abs(m[0] - km) ? q : m), pts[0]);
    setAt(p);
  };
  const lit = at ? bandAt(at[0]) : null;

  return (
    <figure className="rounded-2xl p-3 sm:p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-pan-y select-none"
        role="img" aria-label={`Elevation from ${fmt(eles[0])} m, highest ${fmt(top[1])} m, over ${maxKm.toFixed(0)} km, in ${bands.length} walking days`}
        onPointerMove={(e) => onMove(e.clientX)} onPointerDown={(e) => onMove(e.clientX)} onPointerLeave={() => setAt(null)}>
        <defs>
          <linearGradient id="tg-elev" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ff5100" stopOpacity="0.32" />
            <stop offset="1" stopColor="#ff5100" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Each walking day's stretch, alternately shaded and labelled */}
        {bands.map((b, i) => {
          const x0 = x(Math.min(b.from, b.to)), x1 = x(Math.max(b.from, b.to));
          const on = lit?.day === b.day;
          return (
            <g key={b.day}>
              <rect x={x0} y={PAD.t - 4} width={Math.max(1, x1 - x0)} height={H - PAD.t - PAD.b + 4}
                fill={on ? "rgba(255,81,0,0.12)" : i % 2 ? "var(--bg-surface-2)" : "transparent"} opacity={on ? 1 : 0.6} />
              {x1 - x0 > 34 && <text x={(x0 + x1) / 2} y={PAD.t - 12} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={on ? "#ff5100" : "var(--text-tertiary)"}>Day {b.day}</text>}
            </g>
          );
        })}
        {ticks.map((e) => (
          <g key={e}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(e)} y2={y(e)} stroke="var(--border-subtle)" strokeDasharray="3 4" />
            <text x={PAD.l - 6} y={y(e) + 4} textAnchor="end" fontSize="13" fill="var(--text-tertiary)">{fmt(e)}</text>
          </g>
        ))}
        <path d={`${line}L${x(maxKm)},${H - PAD.b}L${x(0)},${H - PAD.b}Z`} fill="url(#tg-elev)" />
        <path d={line} fill="none" stroke="#ff5100" strokeWidth="2.5" strokeLinejoin="round" />
        {!at && (
          <>
            <circle cx={x(top[0])} cy={y(top[1])} r="5" fill="#ff5100" stroke="var(--bg-surface)" strokeWidth="2" />
            <text x={x(top[0])} y={y(top[1]) - 10} textAnchor={x(top[0]) > W - 80 ? "end" : x(top[0]) < PAD.l + 60 ? "start" : "middle"} fontSize="14" fontWeight="700" fill="var(--text-primary)">{fmt(peakM ?? top[1])} m</text>
          </>
        )}
        {/* Where you're pointing: the kilometre, the height, the day */}
        {at && (
          <g pointerEvents="none">
            <line x1={x(at[0])} x2={x(at[0])} y1={PAD.t - 4} y2={H - PAD.b} stroke="var(--text-secondary)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={x(at[0])} cy={y(at[1])} r="5.5" fill="#ff5100" stroke="var(--bg-surface)" strokeWidth="2" />
            <text x={x(at[0]) + (x(at[0]) > W - (compact ? 170 : 220) ? -10 : 10)} y={Math.max(PAD.t + 14, y(at[1]) - 12)} textAnchor={x(at[0]) > W - (compact ? 170 : 220) ? "end" : "start"} fontSize="14" fontWeight="700" fill="var(--text-primary)">
              {fmt(at[1])} m · km {at[0].toFixed(1)}{lit ? ` · Day ${lit.day}` : ""}
            </text>
          </g>
        )}
        <text x={PAD.l} y={H - 6} fontSize="13" fill="var(--text-tertiary)">0 km</text>
        <text x={W - PAD.r} y={H - 6} textAnchor="end" fontSize="13" fill="var(--text-tertiary)">{maxKm.toFixed(0)} km</text>
      </svg>
      <figcaption className="mt-2 text-[13px] t-text-2 min-h-[20px]">
        {lit ? <><b className="t-text">Day {lit.day}:</b> {lit.label}</> : <span className="t-text-3">Move along the chart to walk it day by day.</span>}
      </figcaption>
    </figure>
  );
}
