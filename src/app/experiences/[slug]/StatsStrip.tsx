"use client";

import { useState, type ReactNode } from "react";
import { useWeather, WeatherCell, WeatherDetails } from "./WeatherWidget";

export interface Stat {
  label: string;
  value: ReactNode;
}

/**
 * The trek's key facts plus live weather, as one bordered band split by hairlines.
 * It always fits the screen: a single row on desktop, three across on tablets,
 * two on phones (weather takes its own full row there). Clicking the weather cell
 * opens the full forecast underneath the band.
 */
export default function StatsStrip({ stats, weather: place }: {
  stats: Stat[];
  weather: { lat: number; lng: number; locationName: string; altitude?: string; isBaseCamp?: boolean };
}) {
  const { weather, loading, error, retry } = useWeather(place.lat, place.lng);
  const [open, setOpen] = useState(false);

  const cell = "min-w-0 px-3.5 py-2";

  return (
    <section aria-labelledby="at-a-glance" className="max-w-7xl mx-auto px-5 lg:px-8">
      <h2 id="at-a-glance" className="text-[12px] tracking-[0.12em] lowercase !font-normal mb-1.5" style={{ color: "var(--text-secondary)", fontVariant: "small-caps", fontFamily: "var(--font-dm-sans)" }}>
        at a glance
      </h2>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
        {/* 1px gaps over the border colour draw the dividers, however the cells wrap */}
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr gap-px" style={{ background: "var(--border-subtle)" }}>
          {stats.map(({ label, value }) => (
            <div key={label} className={cell} style={{ background: "var(--bg-surface)" }}>
              <dt className="text-[11.5px] tracking-[0.1em] lowercase leading-none mb-1.5" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>{label}</dt>
              <dd className="text-[14px] font-medium leading-snug" style={{ color: "var(--text-primary)" }}>{value}</dd>
            </div>
          ))}
          <div className={`${cell} col-span-2 sm:col-span-3 lg:col-span-1 transition-colors ${open ? "bg-[rgba(255,81,0,0.06)]" : ""}`} style={open ? undefined : { background: "var(--bg-surface)" }}>
            <WeatherCell weather={weather} loading={loading} error={error} open={open} onToggle={() => setOpen((v) => !v)} onRetry={retry} />
          </div>
        </dl>

        <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open && weather ? "1fr" : "0fr" }}>
          <div className="overflow-hidden">
            {weather && (
              <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <WeatherDetails weather={weather} {...place} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
