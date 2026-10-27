"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays, ChevronDown, CloudSun, Mountain, RotateCw } from "lucide-react";
import { useWeather, WeatherDetails } from "./WeatherWidget";
import { ItineraryPanel, ElevationPanel, TrailWeather } from "./TrailPanels";
import type { Trail } from "@/lib/trails/shared";

export interface Stat {
  label: string;
  value: ReactNode;
}

type Panel = "itinerary" | "elevation" | "weather";
type Place = { lat: number; lng: number; locationName: string; altitude?: string; isBaseCamp?: boolean };

const TRAIL_TABS: { key: Panel; label: string; short?: string; icon: typeof CalendarDays }[] = [
  { key: "itinerary", label: "Itinerary", icon: CalendarDays },
  { key: "elevation", label: "Elevation", icon: Mountain },
  { key: "weather", label: "Weather", short: "Weather", icon: CloudSun },
];
const BASE_TABS: typeof TRAIL_TABS = [{ key: "weather", label: "Weather", icon: CloudSun }];

/**
 * The trek's key facts as one bordered band split by hairlines: a single row on desktop, three
 * across on tablets, two on phones. Under the facts, a row of drop-downs opens one panel at a
 * time below the band. Treks with a mapped trail get the day-by-day itinerary, the elevation
 * profile and the weather at every place the itinerary sleeps; the rest get the forecast for
 * their base.
 */
export default function StatsStrip({ stats, weather: place, trail }: {
  stats: Stat[];
  weather: Place;
  trail?: Trail | null;
}) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p));
  const hasTrail = !!trail && trail.days?.length > 0;
  const tabs = hasTrail ? TRAIL_TABS : BASE_TABS;

  return (
    <section aria-labelledby="at-a-glance" className="max-w-7xl mx-auto px-5 lg:px-8">
      <h2 id="at-a-glance" className="text-[12px] tracking-[0.12em] lowercase !font-normal mb-1.5" style={{ color: "var(--text-secondary)", fontVariant: "small-caps", fontFamily: "var(--font-dm-sans)" }}>
        at a glance
      </h2>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
        {/* 1px gaps over the border colour draw the dividers, however the cells wrap */}
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr gap-px" style={{ background: "var(--border-subtle)" }}>
          {stats.map(({ label, value }) => (
            <div key={label} className="min-w-0 px-3.5 py-2" style={{ background: "var(--bg-surface)" }}>
              <dt className="text-[11.5px] tracking-[0.1em] lowercase leading-none mb-1.5" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>{label}</dt>
              <dd className="text-[14px] font-medium leading-snug" style={{ color: "var(--text-primary)" }}>{value}</dd>
            </div>
          ))}
        </dl>

        {/* The drop-downs */}
        <div className="grid" role="tablist" aria-label="Trek details" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, borderTop: "1px solid var(--border-subtle)" }}>
          {tabs.map(({ key, label, short, icon: Icon }, i) => {
            const active = panel === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                aria-controls="at-a-glance-panel"
                onClick={() => toggle(key)}
                className="relative flex items-center justify-center gap-1.5 h-11 px-2 text-[12.5px] sm:text-[13px] font-semibold transition-colors"
                style={{
                  color: active ? "#ff5100" : "var(--text-secondary)",
                  background: active ? "rgba(255,81,0,0.06)" : "transparent",
                  borderLeft: i ? "1px solid var(--border-subtle)" : undefined,
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{short ? <><span className="sm:hidden">{short}</span><span className="hidden sm:inline">{label}</span></> : label}</span>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${active ? "rotate-180" : ""}`} />
                {active && <span className="absolute left-0 right-0 bottom-0 h-[2px]" style={{ background: "#ff5100" }} />}
              </button>
            );
          })}
        </div>

        <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: panel ? "1fr" : "0fr" }}>
          <div className="overflow-hidden" id="at-a-glance-panel" role="tabpanel">
            {panel && (
              <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
                {panel === "itinerary" && trail && <ItineraryPanel trail={trail} />}
                {panel === "elevation" && trail && <ElevationPanel trail={trail} />}
                {panel === "weather" && (hasTrail && trail ? <TrailWeather trail={trail} /> : <BaseWeather place={place} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** The forecast for the trek's base, loaded when the Weather tab is first opened */
function BaseWeather({ place }: { place: Place }) {
  const { weather, loading, error, retry } = useWeather(place.lat, place.lng);
  if (weather) return <WeatherDetails weather={weather} {...place} />;
  return (
    <div className="p-4 sm:p-5 text-[13px] flex items-center gap-3" style={{ color: "var(--text-secondary)" }}>
      {loading ? "Loading the forecast…" : error ? (
        <>Couldn&apos;t load the weather.
          <button onClick={retry} className="inline-flex items-center gap-1 font-semibold text-[#ff5100]"><RotateCw className="w-3.5 h-3.5" />Try again</button>
        </>
      ) : null}
    </div>
  );
}
