"use client";

// Live weather for an adventure's base, in two parts: a compact cell that sits in
// the stats strip, and the full details (current conditions, 7-day forecast,
// check-a-date) that open below the strip when the cell is clicked.

import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets,
  CloudLightning, CloudDrizzle, CloudFog, Thermometer, ChevronDown, CalendarDays, RotateCw, MapPin,
} from "lucide-react";

interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  weatherCode: number;
}

interface CurrentWeather {
  temp: number;
  apparent: number;
  humidity: number;
  wind: number;
  weatherCode: number;
  isDay: number;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: WeatherDay[];
}

const WMO: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Showers", 81: "Rain showers", 82: "Violent showers",
  85: "Snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm + hail", 99: "Thunderstorm + heavy hail",
};

export function desc(code: number) { return WMO[code] ?? "Unknown"; }

export function WeatherIcon({ code, isDay = 1, className = "w-4 h-4" }: { code: number; isDay?: number; className?: string }) {
  if (code === 0 || code === 1) return isDay
    ? <Sun className={className} />
    : <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" /></svg>;
  if (code === 2 || code === 3) return <Cloud className={className} />;
  if (code === 45 || code === 48) return <CloudFog className={className} />;
  if (code >= 51 && code <= 55) return <CloudDrizzle className={className} />;
  if (code >= 61 && code <= 65) return <CloudRain className={className} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={className} />;
  if (code >= 80 && code <= 86) return <CloudRain className={className} />;
  if (code >= 95) return <CloudLightning className={className} />;
  return <Cloud className={className} />;
}

export function iconColor(code: number) {
  if (code === 0 || code === 1) return "text-amber-400";
  if (code === 2) return "text-sky-300";
  if (code === 3) return "text-sky-400";
  if (code === 45 || code === 48) return "text-slate-300";
  if (code >= 51 && code <= 55) return "text-cyan-400";
  if (code >= 61 && code <= 65) return "text-sky-400";
  if (code >= 71 && code <= 77) return "text-blue-200";
  if (code >= 80 && code <= 86) return "text-indigo-400";
  if (code >= 95) return "text-violet-400";
  return "text-sky-300";
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function dayLabel(dateStr: string, i: number) {
  if (i === 0) return "Today";
  if (i === 1) return "Tomorrow";
  return DAYS[new Date(dateStr).getDay()];
}

const DAILY_FIELDS = "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum";

// ── Data ──────────────────────────────────────────────────────────────────────

export function useWeather(lat: number, lng: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day");
    url.searchParams.set("daily", DAILY_FIELDS);
    url.searchParams.set("wind_speed_unit", "kmh");
    url.searchParams.set("forecast_days", "16");
    url.searchParams.set("timezone", "auto");

    fetch(url.toString())
      .then((r) => r.json())
      .then((d) => {
        if (!d?.current || !d?.daily?.time) throw new Error("Unexpected weather response shape");
        const c = d.current;
        setWeather({
          current: {
            temp: Math.round(c.temperature_2m),
            apparent: Math.round(c.apparent_temperature),
            humidity: c.relative_humidity_2m,
            wind: Math.round(c.wind_speed_10m),
            weatherCode: c.weather_code,
            isDay: c.is_day,
          },
          daily: d.daily.time.map((date: string, i: number) => ({
            date,
            tempMax: Math.round(d.daily.temperature_2m_max[i]),
            tempMin: Math.round(d.daily.temperature_2m_min[i]),
            precipitation: Math.round(d.daily.precipitation_sum[i] * 10) / 10,
            weatherCode: d.daily.weather_code[i],
          })),
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  useEffect(() => { load(); }, [load]);

  return { weather, loading, error, retry: load };
}

// ── The stats-strip cell ──────────────────────────────────────────────────────

export function WeatherCell({ weather, loading, error, open, onToggle, onRetry }: {
  weather: WeatherData | null;
  loading: boolean;
  error: boolean;
  open: boolean;
  onToggle: () => void;
  onRetry: () => void;
}) {
  // Same shape as the other stats: a small-caps label over the value
  const label = <dt className="text-[11.5px] tracking-[0.1em] lowercase leading-none mb-1.5" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>weather now</dt>;

  if (loading) {
    return (
      <div>{label}<dd className="w-24 h-3.5 rounded bg-black/8 dark:bg-white/8 animate-pulse" /></div>
    );
  }

  if (error || !weather) {
    return (
      <div>
        {label}
        <dd>
          <button onClick={onRetry} className="inline-flex items-center gap-1.5 text-[14px] font-medium hover:underline" style={{ color: "#ff5100" }}>
            <RotateCw className="w-3.5 h-3.5" /> Retry
          </button>
        </dd>
      </div>
    );
  }

  const w = weather.current;
  return (
    <div>
      {label}
      <dd>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="weather-details"
          className="group inline-flex items-center gap-1.5 text-[14px] font-medium leading-snug text-left"
          style={{ color: "var(--text-primary)" }}
        >
          <span className={iconColor(w.weatherCode)}><WeatherIcon code={w.weatherCode} isDay={w.isDay} className="w-4 h-4" /></span>
          <span className="underline decoration-dotted decoration-[rgba(255,81,0,0.6)] underline-offset-4 group-hover:text-[#ff5100] transition-colors">
            {w.temp}°C, {desc(w.weatherCode).toLowerCase()}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180 text-[#ff5100]" : ""}`} style={open ? undefined : { color: "var(--text-tertiary)" }} />
        </button>
      </dd>
    </div>
  );
}

// ── The details that open below the strip ─────────────────────────────────────

type DateResult = WeatherDay & { historical?: boolean; year?: number };

export function WeatherDetails({ weather, lat, lng, locationName, altitude, isBaseCamp }: {
  weather: WeatherData;
  lat: number;
  lng: number;
  locationName: string;
  altitude?: string;
  isBaseCamp?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  // resolvedTheme is unknown to the server. Treating "unknown" as dark baked dark colours into
  // the static HTML, and React keeps server attributes on hydration, so the widget could stay
  // dark in the light theme. Stay light until mounted, then switch (as OperatorListingPanel does).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme !== "light";
  const [selectedDate, setSelectedDate] = useState("");
  const [dateWeather, setDateWeather] = useState<DateResult | null>(null);
  const [dateError, setDateError] = useState(false);
  const [dateFetching, setDateFetching] = useState(false);

  // One day from the forecast or the archive API
  function fetchDay(api: "forecast" | "archive", day: string): Promise<WeatherDay | null> {
    const url = new URL(api === "forecast" ? "https://api.open-meteo.com/v1/forecast" : "https://archive-api.open-meteo.com/v1/archive");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("daily", DAILY_FIELDS);
    url.searchParams.set("start_date", day);
    url.searchParams.set("end_date", day);
    url.searchParams.set("timezone", "auto");
    return fetch(url.toString())
      .then((r) => r.json())
      .then((data) => data.daily?.time?.[0] ? {
        date: data.daily.time[0],
        tempMax: Math.round(data.daily.temperature_2m_max[0]),
        tempMin: Math.round(data.daily.temperature_2m_min[0]),
        precipitation: Math.round(data.daily.precipitation_sum[0] * 10) / 10,
        weatherCode: data.daily.weather_code[0],
      } : null);
  }

  function diffFromToday(date: string) {
    const now = new Date();
    const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const [y, m, d] = date.split("-").map(Number);
    return Math.round((Date.UTC(y, m - 1, d) - todayUTC) / 86400000);
  }

  function checkDate(date: string) {
    if (!date) return;
    setDateError(false);
    setDateWeather(null);

    // Within the 16-day forecast we already have it
    const cached = weather.daily.find((d) => d.date === date);
    if (cached) { setDateWeather(cached); return; }

    const diff = diffFromToday(date);
    const [y, m, d] = date.split("-").map(Number);
    // Inside the forecast horizon → live forecast; a past date → what actually
    // happened; beyond the horizon → the same date last year, flagged as such
    const request = diff >= 0 && diff <= 15
      ? fetchDay("forecast", date)
      : diff < 0
        ? fetchDay("archive", date)
        : fetchDay("archive", `${y - 1}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`)
            .then((r) => r && { ...r, date, historical: true, year: y - 1 });

    setDateFetching(true);
    request
      .then((r) => (r ? setDateWeather(r) : setDateError(true)))
      .catch(() => setDateError(true))
      .finally(() => setDateFetching(false));
  }

  const willUseHistorical = !!selectedDate && diffFromToday(selectedDate) > 15;
  const altM = altitude ? parseFloat(altitude.replace(/[^0-9.]/g, "")) : null;
  const w = weather.current;

  const detail = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-3" style={{ background: "rgba(var(--fg-rgb),0.025)", border: "1px solid var(--border-subtle)" }}>
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[9px] font-semibold uppercase tracking-[0.16em] leading-none mb-1" style={{ color: "var(--text-tertiary)" }}>{label}</div>
        <div className="font-medium text-[13px] leading-tight truncate" style={{ color: "var(--text-primary)" }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div id="weather-details" className="px-4 py-4">

      {/* Current conditions */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 mb-5">
        {detail(<MapPin className="w-3.5 h-3.5 text-[#ff5100]" />, isBaseCamp ? "Weather at" : "Live weather", locationName)}
        {detail(<span className={iconColor(w.weatherCode)}><WeatherIcon code={w.weatherCode} isDay={w.isDay} className="w-3.5 h-3.5" /></span>, "Condition", desc(w.weatherCode))}
        {detail(<Thermometer className="w-3.5 h-3.5 text-orange-400" />, "Temperature", <>{w.temp}°C <span className="text-[11px] font-normal" style={{ color: "var(--text-tertiary)" }}>/ feels {w.apparent}°</span></>)}
        {detail(<Wind className="w-3.5 h-3.5 text-sky-400" />, "Wind", <>{w.wind} <span className="text-[11px] font-normal" style={{ color: "var(--text-tertiary)" }}>km/h</span></>)}
        {detail(<Droplets className="w-3.5 h-3.5 text-blue-400" />, "Humidity", <>{w.humidity}<span className="text-[11px] font-normal" style={{ color: "var(--text-tertiary)" }}>%</span></>)}
      </div>

      {/* Week ahead — 4 across on phones so each day stays readable */}
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2.5" style={{ color: "var(--text-tertiary)" }}>Week ahead</p>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-2.5 mb-5">
        {weather.daily.slice(0, 7).map((day, i) => (
          <div
            key={day.date}
            className={`flex flex-col items-center gap-1.5 py-3 px-1.5 rounded-xl border ${
              i === 0
                ? "bg-black/[0.04] dark:bg-white/[0.05] border-black/10 dark:border-white/10"
                : "bg-black/[0.02] dark:bg-white/[0.025] border-black/[0.06] dark:border-white/[0.06]"
            }`}
          >
            <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${i === 0 ? "text-black/60 dark:text-white/60" : "text-black/40 dark:text-white/40"}`}>
              {dayLabel(day.date, i)}
            </span>
            <div className={iconColor(day.weatherCode)}><WeatherIcon code={day.weatherCode} className="w-5 h-5" /></div>
            <span className="text-black/40 dark:text-white/35 text-[9px] text-center leading-tight min-h-[22px] flex items-center justify-center">{desc(day.weatherCode)}</span>
            <span className="text-black/80 dark:text-white/80 text-[12px] font-bold leading-none">{day.tempMax}° <span className="text-black/40 dark:text-white/40 font-medium">{day.tempMin}°</span></span>
            {day.precipitation > 0
              ? <span className="text-sky-400/80 text-[9px] font-semibold leading-none flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5" />{day.precipitation}mm</span>
              : <span className="h-[9px]" />}
          </div>
        ))}
      </div>

      {/* Check a date */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 bg-black/[0.02] dark:bg-white/[0.025]">
          <CalendarDays className="w-3.5 h-3.5 text-[#ff5100] shrink-0" />
          <span className="text-black/45 dark:text-white/40 text-xs font-semibold shrink-0">Check a date</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setDateWeather(null); setDateError(false); }}
            className="flex-1 bg-transparent text-black/70 dark:text-white/65 text-xs px-2 py-1.5 rounded-lg outline-none min-w-[140px] border-black/10 dark:border-white/[0.08]"
            style={{ borderWidth: "1px", borderStyle: "solid", colorScheme: isDark ? "dark" : "light" }}
          />
          <button
            disabled={!selectedDate || dateFetching}
            onClick={() => checkDate(selectedDate)}
            className="shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-30 hover:brightness-110"
            style={{ background: "#ff5100" }}
          >
            {dateFetching ? "…" : "Check"}
          </button>
        </div>

        {/* Said up front, before Check: beyond the 16-day forecast it's last year's data */}
        {willUseHistorical && !dateWeather && (
          <div className="px-4 py-2.5 flex items-start gap-2" style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(56,189,248,0.08)" }}>
            <CalendarDays className="w-3 h-3 text-sky-400/70 shrink-0 mt-0.5" />
            <p className="text-sky-400/70 text-[10.5px] leading-snug">
              This date is beyond the 16-day forecast, so you&apos;ll see last year&apos;s conditions for it instead of a live forecast.
            </p>
          </div>
        )}

        {dateError && (
          <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <p className="text-red-500/80 dark:text-red-400/60 text-xs">No data available for this date.</p>
          </div>
        )}

        {dateWeather && (
          <div className="px-4 py-4 flex items-center gap-5 bg-black/[0.015] dark:bg-white/[0.018]" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <div className={`${iconColor(dateWeather.weatherCode)} shrink-0`}>
              <WeatherIcon code={dateWeather.weatherCode} className="w-10 h-10 opacity-90" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-black/40 dark:text-white/35 text-[9px] uppercase tracking-widest font-semibold mb-0.5">
                {new Date(dateWeather.date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <p className="text-black/85 dark:text-white/85 text-sm font-bold leading-tight">{desc(dateWeather.weatherCode)}</p>
              {dateWeather.historical && <p className="text-black/35 dark:text-white/30 text-[9px] mt-0.5">Based on {dateWeather.year} data</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-black/80 dark:text-white/80 text-xl font-black leading-none">{dateWeather.tempMax}°</p>
              <p className="text-black/35 dark:text-white/30 text-xs font-medium mt-0.5">Low {dateWeather.tempMin}°</p>
            </div>
            {dateWeather.precipitation > 0 && (
              <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl shrink-0" style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)" }}>
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-sky-400 text-[10px] font-bold">{dateWeather.precipitation}mm</span>
              </div>
            )}
          </div>
        )}
      </div>

      {altM && altM >= 3500 ? (
        <p className="mt-4 text-black/35 dark:text-white/30 text-[10px] flex items-center gap-1.5">
          <Thermometer className="w-3 h-3 text-amber-500/50 dark:text-amber-400/40 shrink-0" />
          At {altitude}, summit temps run 10–15°C colder. Data reflects base-area conditions.
          <span className="ml-auto text-black/40 dark:text-white/35">Open-Meteo</span>
        </p>
      ) : (
        <p className="mt-3 text-black/40 dark:text-white/35 text-[10px] text-right">Open-Meteo · Updated now</p>
      )}
    </div>
  );
}
