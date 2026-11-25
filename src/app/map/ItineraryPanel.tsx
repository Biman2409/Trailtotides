"use client";

import Link from "next/link";
import { X, Download, ArrowRight, Box, ArrowUp, ArrowDown, BedDouble, Car, Route, Mountain, CalendarDays, TrendingUp } from "lucide-react";
import type { Adventure } from "@/lib/data";
import TrailElevation from "@/components/ui/custom/TrailElevation";
import { dayBands } from "@/lib/trails/dayBands";
import { sideTripOn, trailClimbM, trailHighPoint, trailProfile, trailWalkKm, type Trail } from "@/lib/trails/shared";
import { hasTrekGuide, trekGuideHref } from "@/lib/trekGuides";
import FlyTrail from "./FlyTrail";

// The trail's itinerary and elevation, opened from the adventure's card without leaving the
// map: beside the panel on a desktop, over the map on a phone. The trail stays drawn behind it.

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

export default function ItineraryPanel({ adventure: a, trail, onClose, phone }: {
  adventure: Adventure; trail: Trail; onClose: () => void; phone?: boolean;
}) {
  const pts = trailProfile(trail).map((p) => [p.km, p.ele] as [number, number]);
  // The number a place has on the map (1 is the start), or null when it isn't a mapped stop
  const stopNo = (name: string) => { const i = trail.stops.findIndex((s) => s.name === name); return i < 0 ? null : i + 1; };
  const top = trailHighPoint(trail);
  const stats: [React.ReactNode, string, string][] = [
    [<Route key="r" className="w-3.5 h-3.5" />, `${trailWalkKm(trail)} km`, "on foot"],
    [<TrendingUp key="t" className="w-3.5 h-3.5" />, `${fmt(trailClimbM(trail))} m`, "of climbing"],
    [<Mountain key="m" className="w-3.5 h-3.5" />, `${fmt(top.ele)} m`, top.name ? `at ${top.name}` : "highest point"],
    [<CalendarDays key="c" className="w-3.5 h-3.5" />, `${trail.days.length} days`, a.durationDays === `${trail.days.length} days` ? "start to finish" : a.durationDays],
  ];

  return (
    <section className={`tm-glass flex flex-col overflow-hidden ${phone ? "rounded-none" : "rounded-3xl"}`} style={{ height: "100%" }}
      role="dialog" aria-label={`${a.name}: itinerary and elevation`}>
      <header className="flex items-start gap-3 px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="min-w-0 flex-1">
          <p className="tm-label !mb-1">Itinerary &amp; elevation</p>
          <h2 className="text-[17px] font-bold leading-tight text-white truncate">{a.name}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close the itinerary" className="tm-iconbtn shrink-0"><X className="w-3.5 h-3.5" /></button>
      </header>

      <div className="flex-1 overflow-y-auto tm-scroll px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {stats.map(([icon, v, sub]) => (
            <div key={v} className="tm-panel !py-2.5">
              <p className="flex items-center gap-1.5 text-[14px] font-bold text-white tabular-nums"><span className="text-[var(--tm-peach)]">{icon}</span>{v}</p>
              <p className="text-[11px] text-white/45 mt-0.5 truncate">{sub}</p>
            </div>
          ))}
        </div>

        <FlyTrail name={a.name} trail={trail} className="tm-btn w-full !h-12 !justify-start !px-3.5 gap-2.5">
          <Box className="w-4 h-4 text-[var(--tm-peach)] shrink-0" />
          <span className="text-left leading-tight">
            <span className="block text-white">Fly the trail in 3D</span>
            <span className="block text-[11px] font-medium text-white/50">Walk it day by day over the real terrain</span>
          </span>
        </FlyTrail>

        <TrailElevation pts={pts} bands={dayBands(trail)} compact peakM={top.ele} />
        {/* The profile is the main route; say so when the high point is on a side trip */}
        {(trail.sideTrips ?? []).length > 0 && (
          <p className="text-[11.5px] text-white/50 -mt-2">
            The profile is the main route. Side trips ({trail.sideTrips!.map((s) => `${s.name}${s.ele != null ? `, ${fmt(s.ele)} m` : ""}`).join("; ")}) go out and back from camp and are drawn dashed on the map.
          </p>
        )}

        <ol className="space-y-2">
          {trail.days.map((d) => (
            <li key={d.day} className="tm-panel flex gap-3">
              <span className="w-9 shrink-0 text-center">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">Day</span>
                <span className="block text-[18px] font-bold text-white leading-none mt-0.5">{d.day}</span>
              </span>
              <div className="min-w-0 flex-1">
                {/* Places carry the same numbers as the stops drawn on the map */}
                <p className="text-[13px] font-semibold text-white leading-snug">
                  {d.kind === "rest" ? <>Rest day at <Place name={d.from} n={stopNo(d.from)} /></>
                    : d.to && d.to !== d.from ? <><Place name={d.from} n={stopNo(d.from)} /> → <Place name={d.to} n={stopNo(d.to)} /></>
                    : <Place name={d.from} n={stopNo(d.from)} />}
                </p>
                {(() => {
                  // A side trip off the main line is named as one; other places are just "via"
                  const side = sideTripOn(trail, d);
                  const vias = (d.via ?? []).filter((v) => v !== side?.name);
                  return <>
                    {side && <p className="text-[11px] text-[#5fd3dc]">▲ Side trip to {side.name}: {side.km} km each way, out and back</p>}
                    {vias.length ? <p className="text-[11px] text-white/45">via {vias.join(", ")}</p> : null}
                  </>;
                })()}
                {d.note && <p className="text-[12px] text-white/60 leading-snug mt-1">{d.note}</p>}
                {d.kind === "walk" && (
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11.5px] text-white/60 tabular-nums">
                    {d.km != null && <span className="inline-flex items-center gap-1"><Route className="w-3 h-3" />{d.approx ? "about " : ""}{d.km} km</span>}
                    {!!d.up && <span className="inline-flex items-center gap-1"><ArrowUp className="w-3 h-3 text-[var(--tm-peach)]" />{fmt(d.up)} m up</span>}
                    {!!d.down && <span className="inline-flex items-center gap-1"><ArrowDown className="w-3 h-3 text-[var(--tm-mint)]" />{fmt(d.down)} m down</span>}
                    {d.sleepEle != null && <span className="inline-flex items-center gap-1"><BedDouble className="w-3 h-3" />sleep at {fmt(d.sleepEle)} m</span>}
                    {d.driveKm != null && <span className="inline-flex items-center gap-1"><Car className="w-3 h-3" />{fmt(d.driveKm)} km by road</span>}
                  </p>
                )}
                {(d.kind === "travel" || d.kind === "drive") && <p className="text-[11.5px] text-white/50 mt-1">By road, not on foot{d.driveKm != null ? `: ${fmt(d.driveKm)} km` : ""}</p>}
              </div>
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-white/35">A typical plan, measured along the mapped trail. Operators vary it a little.</p>
      </div>

      <footer className="flex gap-2 px-4 py-3 border-t border-white/[0.06]">
        <a href={`/experiences/${a.slug}/trail.gpx`} download className="tm-btn tm-btn-primary flex-1"><Download className="w-3.5 h-3.5" /> Download GPX</a>
        <Link href={hasTrekGuide(a) ? trekGuideHref(a.slug) : `/experiences/${a.slug}`} className="tm-btn flex-1">
          {hasTrekGuide(a) ? "Full trek guide" : "Full details"} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </footer>
    </section>
  );
}

/** A place name with its number from the map, in the map's own stop style */
function Place({ name, n }: { name: string; n: number | null }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {n != null && (
        <span aria-label={`stop ${n} on the map`} className="inline-grid place-items-center w-[17px] h-[17px] rounded-full text-[9.5px] font-bold shrink-0"
          style={{ background: n === 1 ? "#16a34a" : "#ff5100", color: n === 1 ? "#ffffff" : "#1c1814", boxShadow: "0 0 0 1.5px #fff" }}>{n}</span>
      )}
      {name}
    </span>
  );
}
