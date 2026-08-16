"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets,
  CloudLightning, CloudDrizzle, CloudFog, Thermometer, ChevronDown, CalendarDays, RotateCw,
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

interface WeatherData {
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

function desc(code: number) { return WMO[code] ?? "Unknown"; }

function WeatherIcon({ code, isDay = 1, className = "w-4 h-4" }: { code: number; isDay?: number; className?: string }) {
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

function iconColor(code: number) {
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


interface Props {
  lat: number;
  lng: number;
  locationName: string;
  altitude?: string;
  isBaseCamp?: boolean;
}

export default function WeatherWidget({ lat, lng, locationName, altitude, isBaseCamp }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [open, setOpen] = useState(false);

  // Date picker state
  const [selectedDate, setSelectedDate] = useState("");
  const [dateWeather, setDateWeather] = useState<WeatherDay & { historical?: boolean; year?: number } | null>(null);
  const [dateError, setDateError] = useState(false);
  const [dateFetching, setDateFetching] = useState(false);
  const weatherRef = React.useRef<WeatherData | null>(null);

  function loadWeather() {
    setLoading(true);
    setWeatherError(false);

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day");
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
    url.searchParams.set("wind_speed_unit", "kmh");
    url.searchParams.set("forecast_days", "16");
    url.searchParams.set("timezone", "auto");

    fetch(url.toString())
      .then((r) => r.json())
      .then((d) => {
        if (!d?.current || !d?.daily?.time) throw new Error("Unexpected weather response shape");
        const c = d.current;
        const parsed: WeatherData = {
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
        };
        weatherRef.current = parsed;
        setWeather(parsed);
      })
      .catch(() => setWeatherError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  function fetchDateWeather(date: string) {
    if (!date) return;
    setDateError(false);
    setDateWeather(null);

    // Check forecast cache first (today .. +15 days, live data)
    const cached = weatherRef.current?.daily.find(d => d.date === date);
    if (cached) { setDateWeather(cached); return; }

    setDateFetching(true);
    const todayUTC = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const [y, m, d2] = date.split("-").map(Number);
    const targetUTC = Date.UTC(y, m - 1, d2);
    const diffDays = Math.round((targetUTC - todayUTC) / 86400000);

    // Within live forecast horizon but missed the cache (e.g. widget loaded before this date existed): ask the live forecast source directly
    if (diffDays >= 0 && diffDays <= 15) {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", lat.toString());
      url.searchParams.set("longitude", lng.toString());
      url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
      url.searchParams.set("wind_speed_unit", "kmh");
      url.searchParams.set("start_date", date);
      url.searchParams.set("end_date", date);
      url.searchParams.set("timezone", "auto");

      fetch(url.toString())
        .then(r => r.json())
        .then(data => {
          if (data.daily?.time?.[0]) {
            setDateWeather({
              date: data.daily.time[0],
              tempMax: Math.round(data.daily.temperature_2m_max[0]),
              tempMin: Math.round(data.daily.temperature_2m_min[0]),
              precipitation: Math.round(data.daily.precipitation_sum[0] * 10) / 10,
              weatherCode: data.daily.weather_code[0],
            });
          } else {
            setDateError(true);
          }
        })
        .catch(() => setDateError(true))
        .finally(() => setDateFetching(false));
      return;
    }

    // Genuine past date: fetch what actually happened, not a shifted year
    if (diffDays < 0) {
      const url = new URL("https://archive-api.open-meteo.com/v1/archive");
      url.searchParams.set("latitude", lat.toString());
      url.searchParams.set("longitude", lng.toString());
      url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
      url.searchParams.set("wind_speed_unit", "kmh");
      url.searchParams.set("start_date", date);
      url.searchParams.set("end_date", date);
      url.searchParams.set("timezone", "auto");

      fetch(url.toString())
        .then(r => r.json())
        .then(data => {
          if (data.daily?.time?.[0]) {
            setDateWeather({
              date: data.daily.time[0],
              tempMax: Math.round(data.daily.temperature_2m_max[0]),
              tempMin: Math.round(data.daily.temperature_2m_min[0]),
              precipitation: Math.round(data.daily.precipitation_sum[0] * 10) / 10,
              weatherCode: data.daily.weather_code[0],
            });
          } else {
            setDateError(true);
          }
        })
        .catch(() => setDateError(true))
        .finally(() => setDateFetching(false));
      return;
    }

    // Far-future date, beyond any forecast horizon: fall back to the same date last year as a historical estimate
    const histDate = `${y - 1}-${String(m).padStart(2, "0")}-${String(d2).padStart(2, "0")}`;
    const histYear = y - 1;

    const url = new URL("https://archive-api.open-meteo.com/v1/archive");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
    url.searchParams.set("wind_speed_unit", "kmh");
    url.searchParams.set("start_date", histDate);
    url.searchParams.set("end_date", histDate);
    url.searchParams.set("timezone", "auto");

    fetch(url.toString())
      .then(r => r.json())
      .then(data => {
        if (data.daily?.time?.[0]) {
          setDateWeather({
            date,
            tempMax: Math.round(data.daily.temperature_2m_max[0]),
            tempMin: Math.round(data.daily.temperature_2m_min[0]),
            precipitation: Math.round(data.daily.precipitation_sum[0] * 10) / 10,
            weatherCode: data.daily.weather_code[0],
            historical: true,
            year: histYear,
          });
        } else {
          setDateError(true);
        }
      })
      .catch(() => setDateError(true))
      .finally(() => setDateFetching(false));
  }

  const altM = altitude ? parseFloat(altitude.replace(/[^0-9.]/g, "")) : null;

  // Surface this before the user hits "Check", not just after — otherwise the
  // result card looks identical to a real forecast with no upfront hint that
  // dates beyond the 16-day horizon fall back to last year's data.
  let selectedDiffDays: number | null = null;
  if (selectedDate) {
    const todayUTC = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const [sy, sm, sd] = selectedDate.split("-").map(Number);
    selectedDiffDays = Math.round((Date.UTC(sy, sm - 1, sd) - todayUTC) / 86400000);
  }
  const willUseHistorical = selectedDiffDays !== null && selectedDiffDays > 15;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3.5 flex items-center gap-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="w-3.5 h-3.5 rounded-full bg-black/8 dark:bg-white/8 animate-pulse" />
        <div className="w-24 h-2.5 rounded bg-black/8 dark:bg-white/8 animate-pulse" />
        <div className="w-16 h-2.5 rounded bg-black/6 dark:bg-white/6 animate-pulse ml-2" />
      </div>
    );
  }

  if (weatherError || !weather) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3.5 flex items-center gap-2.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <Cloud className="w-3.5 h-3.5 text-black/30 dark:text-white/25 shrink-0" />
        <span className="text-black/40 dark:text-white/35 text-[12px]">Weather unavailable right now.</span>
        <button
          onClick={loadWeather}
          className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold transition-colors hover:text-[#ff7d47]"
          style={{ color: "#ff5100" }}
        >
          <RotateCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    );
  }

  const w = weather.current;

  return (
    <div>
      {/* ── COLLAPSED ROW ── */}
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-stretch" style={{ borderTop: "1px solid var(--border-subtle)" }}>

            {/* Scrollable stats */}
            <div className="relative flex-1 min-w-0">
            <div className="flex items-center overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 px-5 lg:px-6 py-3.5 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
                <div>
                  <div className="text-black/40 dark:text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">{isBaseCamp ? "Base Camp" : "Live Weather"}</div>
                  <div className="text-black/60 dark:text-white/55 text-[13px] font-medium leading-none truncate max-w-[110px]">{locationName}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-5 py-3.5 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
                <div className={`${iconColor(w.weatherCode)} drop-shadow-sm`}>
                  <WeatherIcon code={w.weatherCode} isDay={w.isDay} className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-black/40 dark:text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">Condition</div>
                  <div className="text-black/85 dark:text-white/85 font-medium text-[13px] leading-none">{desc(w.weatherCode)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-5 py-3.5 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
                <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <div>
                  <div className="text-black/40 dark:text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">Temperature</div>
                  <div className="text-black/85 dark:text-white/85 font-medium text-[13px] leading-none">{w.temp}°C <span className="text-black/40 dark:text-white/35 text-[11px] font-normal">/ feels {w.apparent}°</span></div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2.5 px-5 py-3.5 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
                <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <div>
                  <div className="text-black/40 dark:text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">Wind Speed</div>
                  <div className="text-black/85 dark:text-white/85 font-medium text-[13px] leading-none">{w.wind} <span className="text-black/40 dark:text-white/35 text-[11px] font-normal">km/h</span></div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2.5 px-5 py-3.5 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
                <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <div>
                  <div className="text-black/40 dark:text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">Humidity</div>
                  <div className="text-black/85 dark:text-white/85 font-medium text-[13px] leading-none">{w.humidity}<span className="text-black/40 dark:text-white/35 text-[11px] font-normal">%</span></div>
                </div>
              </div>
            </div>
            {/* Scroll hint — this row overflows on mobile with no other affordance */}
            <div className="md:hidden pointer-events-none absolute top-0 right-0 bottom-0 w-8" style={{ background: "linear-gradient(to right, transparent, var(--bg-surface))" }} />
            </div>

            {/* Toggle button — always visible */}
            <div className="flex items-center gap-3 px-4 shrink-0" style={{ borderLeft: "1px solid var(--border-subtle)" }}>
              {/* Toggle button */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border ${
                  open
                    ? "bg-[rgba(255,81,0,0.12)] border-[rgba(255,81,0,0.3)]"
                    : "bg-black/[0.03] dark:bg-white/[0.05] border-black/[0.08] dark:border-white/[0.1]"
                }`}
              >
                <CalendarDays className={`w-3.5 h-3.5 sm:hidden shrink-0 ${open ? "text-[#ff5100]" : "text-black/45 dark:text-white/45"}`} />
                <span className={`text-[11px] font-semibold hidden sm:block whitespace-nowrap ${open ? "text-[#ff5100]" : "text-black/45 dark:text-white/45"}`}>
                  Week Ahead
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180 text-[#ff5100]" : "text-black/35 dark:text-white/35"}`} />
              </div>
            </div>

          </div>{/* end outer flex */}
        </div>
      </button>

      {/* ── EXPANDED PANEL ── */}
      <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? "600px" : "0px" }}>
        <div className="bg-black/[0.01] dark:bg-white/[0.012]" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5">

            {/* 7-day grid */}
            <div className="grid grid-cols-7 gap-2.5 mb-5">
              {weather.daily.slice(0, 7).map((day, i) => (
                <div
                  key={day.date}
                  className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border ${
                    i === 0
                      ? "bg-black/[0.04] dark:bg-white/[0.05] border-black/10 dark:border-white/10"
                      : "bg-black/[0.02] dark:bg-white/[0.025] border-black/[0.06] dark:border-white/[0.06]"
                  }`}
                >
                  <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${i === 0 ? "text-black/60 dark:text-white/60" : "text-black/35 dark:text-white/35"}`}>
                    {dayLabel(day.date, i)}
                  </span>
                  <div className={iconColor(day.weatherCode)}>
                    <WeatherIcon code={day.weatherCode} className="w-5 h-5" />
                  </div>
                  <span className="text-black/35 dark:text-white/30 text-[8px] text-center leading-tight min-h-[20px] flex items-center justify-center">
                    {desc(day.weatherCode)}
                  </span>
                  <div className="w-full h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-black/35 dark:text-white/30 text-[7px] uppercase tracking-wide">High</span>
                    <span className="text-black/80 dark:text-white/80 text-[12px] font-bold leading-none">{day.tempMax}°</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-black/35 dark:text-white/30 text-[7px] uppercase tracking-wide">Low</span>
                    <span className="text-black/45 dark:text-white/40 text-[11px] font-medium leading-none">{day.tempMin}°</span>
                  </div>
                  {day.precipitation > 0 ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <Droplets className="w-3 h-3 text-sky-400/50" />
                      <span className="text-sky-400/70 text-[9px] font-semibold leading-none">{day.precipitation}mm</span>
                    </div>
                  ) : (
                    <div className="h-[26px]" />
                  )}
                </div>
              ))}
            </div>

            {/* ── Date picker ── */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>

              {/* Picker row */}
              <div className="flex items-center gap-3 px-4 py-3 bg-black/[0.02] dark:bg-white/[0.025]">
                <CalendarDays className="w-3.5 h-3.5 text-[#ff5100] shrink-0" />
                <span className="text-black/45 dark:text-white/40 text-xs font-semibold shrink-0">Check a date</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => { setSelectedDate(e.target.value); setDateWeather(null); setDateError(false); }}
                  className="flex-1 bg-transparent text-black/70 dark:text-white/65 text-xs px-2 py-1.5 rounded-lg outline-none min-w-0 border-black/10 dark:border-white/[0.08]"
                  style={{ borderWidth: "1px", borderStyle: "solid", colorScheme: isDark ? "dark" : "light" }}
                />
                <button
                  disabled={!selectedDate || dateFetching}
                  onClick={() => fetchDateWeather(selectedDate)}
                  className="shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-30 hover:brightness-110"
                  style={{ background: "#ff5100" }}
                >
                  {dateFetching ? "…" : "Check"}
                </button>
              </div>

              {/* Upfront disclosure — shown as soon as a far-future date is picked, before "Check" is even clicked */}
              {willUseHistorical && !dateWeather && (
                <div className="px-4 py-2.5 flex items-start gap-2" style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(56,189,248,0.08)" }}>
                  <CalendarDays className="w-3 h-3 text-sky-400/70 shrink-0 mt-0.5" />
                  <p className="text-sky-400/70 text-[10.5px] leading-snug">
                    This date is beyond the 16-day forecast — we'll show last year's conditions for this date instead of a live forecast.
                  </p>
                </div>
              )}

              {/* Result card */}
              {dateError && (
                <div className="px-4 py-3 flex items-center gap-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <p className="text-red-500/80 dark:text-red-400/60 text-xs">No data available for this date.</p>
                </div>
              )}

              {dateWeather && (() => {
                const col = iconColor(dateWeather.weatherCode);
                const formatted = new Date(dateWeather.date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
                return (
                  <div
                    className="px-4 py-4 flex items-center gap-5 bg-black/[0.015] dark:bg-white/[0.018]"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
                  >
                    {/* Big icon */}
                    <div className={`${col} shrink-0`}>
                      <WeatherIcon code={dateWeather.weatherCode} className="w-10 h-10 opacity-90" />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-black/40 dark:text-white/35 text-[9px] uppercase tracking-widest font-semibold mb-0.5">{formatted}</p>
                      <p className="text-black/85 dark:text-white/85 text-sm font-bold leading-tight">{desc(dateWeather.weatherCode)}</p>
                      {dateWeather.historical && (
                        <p className="text-black/35 dark:text-white/30 text-[9px] mt-0.5">Based on {dateWeather.year} data</p>
                      )}
                    </div>

                    {/* Temp */}
                    <div className="text-right shrink-0">
                      <p className="text-black/80 dark:text-white/80 text-xl font-black leading-none">{dateWeather.tempMax}°</p>
                      <p className="text-black/35 dark:text-white/30 text-xs font-medium mt-0.5">Low {dateWeather.tempMin}°</p>
                    </div>

                    {/* Precipitation */}
                    {dateWeather.precipitation > 0 && (
                      <div
                        className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl shrink-0"
                        style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)" }}
                      >
                        <Droplets className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-sky-400 text-[10px] font-bold">{dateWeather.precipitation}mm</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {altM && altM >= 3500 ? (
              <p className="mt-4 text-black/35 dark:text-white/30 text-[9px] flex items-center gap-1.5">
                <Thermometer className="w-3 h-3 text-amber-500/50 dark:text-amber-400/40 shrink-0" />
                At {altitude}, summit temps run 10–15°C colder. Data reflects base-area conditions.
                <span className="ml-auto text-black/40 dark:text-white/35">Open-Meteo</span>
              </p>
            ) : (
              <p className="mt-3 text-black/40 dark:text-white/35 text-[9px] text-right">Open-Meteo · Updated now</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
