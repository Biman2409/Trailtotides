"use client";

import { useState, type ReactNode } from "react";
import { useWeather, WeatherCell, WeatherDetails } from "./WeatherWidget";

export interface Stat {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

/**
 * The trek's key facts plus a live-weather cell, sized to fit the screen (no
 * sideways scrolling): one row on desktop, two or three per row on smaller
 * screens. Clicking the weather cell opens the full forecast below the strip.
 */
export default function StatsStrip({ stats, weather: place }: {
  stats: Stat[];
  weather: { lat: number; lng: number; locationName: string; altitude?: string; isBaseCamp?: boolean };
}) {
  const { weather, loading, error, retry } = useWeather(place.lat, place.lng);
  const [open, setOpen] = useState(false);

  // Cells sit on a 1px-gap grid over the border colour, so dividers line up however they wrap
  const cell = "min-w-0 basis-[calc(50%-1px)] sm:basis-[calc(33.333%-1px)] lg:basis-0 grow";

  return (
    <>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex flex-wrap gap-px" style={{ background: "var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
          {stats.map(({ icon, label, value }) => (
            <div key={label} className={`${cell} flex items-center gap-2.5 px-4 py-3`} style={{ background: "var(--bg-surface)" }}>
              <div className="shrink-0 opacity-80">{icon}</div>
              <div className="min-w-0">
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1" style={{ color: "var(--text-tertiary)" }}>{label}</div>
                <div className="font-medium text-[13px] leading-tight" style={{ color: "var(--text-primary)" }}>{value}</div>
              </div>
            </div>
          ))}
          {/* Weather: full width on phones, its own cell from tablet up */}
          <div className="min-w-0 basis-full sm:basis-[calc(33.333%-1px)] lg:basis-0 grow lg:grow-[1.4]" style={{ background: "var(--bg-surface)" }}>
            <WeatherCell weather={weather} loading={loading} error={error} open={open} onToggle={() => setOpen((v) => !v)} onRetry={retry} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden transition-[max-height] duration-300 ease-in-out" style={{ maxHeight: open && weather ? "1400px" : "0px" }}>
        {weather && (
          <div className="bg-black/[0.01] dark:bg-white/[0.012]" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <WeatherDetails weather={weather} {...place} />
          </div>
        )}
      </div>
    </>
  );
}
