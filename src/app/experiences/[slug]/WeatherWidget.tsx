"use client";

import { useEffect, useState } from "react";
import {
  Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets,
  CloudLightning, CloudDrizzle, CloudFog, Thermometer, Eye,
} from "lucide-react";

interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  windMax: number;
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
  timezone: string;
}

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Showers", 81: "Rain showers", 82: "Violent showers",
  85: "Snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm + hail", 99: "Thunderstorm + heavy hail",
};

function weatherDesc(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? "Unknown";
}

function WeatherIcon({ code, isDay = 1, className = "w-5 h-5" }: { code: number; isDay?: number; className?: string }) {
  if (code === 0 || code === 1) return isDay ? <Sun className={className} /> : <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>;
  if (code === 2 || code === 3) return <Cloud className={className} />;
  if (code === 45 || code === 48) return <CloudFog className={className} />;
  if (code >= 51 && code <= 55) return <CloudDrizzle className={className} />;
  if (code >= 61 && code <= 65) return <CloudRain className={className} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={className} />;
  if (code >= 80 && code <= 82) return <CloudRain className={className} />;
  if (code >= 85 && code <= 86) return <CloudSnow className={className} />;
  if (code >= 95) return <CloudLightning className={className} />;
  return <Cloud className={className} />;
}

function weatherColor(code: number): string {
  if (code === 0 || code === 1) return "text-amber-400";
  if (code === 2 || code === 3) return "text-slate-400";
  if (code === 45 || code === 48) return "text-slate-500";
  if (code >= 51 && code <= 65) return "text-sky-400";
  if (code >= 71 && code <= 77) return "text-blue-300";
  if (code >= 80 && code <= 86) return "text-sky-400";
  if (code >= 95) return "text-violet-400";
  return "text-slate-400";
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDay(dateStr: string, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return DAY_LABELS[new Date(dateStr).getDay()];
}

interface Props {
  lat: number;
  lng: number;
  locationName: string;
  altitude?: string;
}

export default function WeatherWidget({ lat, lng, locationName, altitude }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day");
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max");
    url.searchParams.set("wind_speed_unit", "kmh");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("timezone", "Asia/Kolkata");

    fetch(url.toString())
      .then((r) => r.json())
      .then((d) => {
        const c = d.current;
        const daily: WeatherDay[] = d.daily.time.map((date: string, i: number) => ({
          date,
          tempMax: Math.round(d.daily.temperature_2m_max[i]),
          tempMin: Math.round(d.daily.temperature_2m_min[i]),
          precipitation: Math.round(d.daily.precipitation_sum[i] * 10) / 10,
          windMax: Math.round(d.daily.wind_speed_10m_max[i]),
          weatherCode: d.daily.weather_code[i],
        }));
        setWeather({
          current: {
            temp: Math.round(c.temperature_2m),
            apparent: Math.round(c.apparent_temperature),
            humidity: c.relative_humidity_2m,
            wind: Math.round(c.wind_speed_10m),
            weatherCode: c.weather_code,
            isDay: c.is_day,
          },
          daily,
          timezone: d.timezone,
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  const altM = altitude ? parseFloat(altitude.replace(/[^0-9.]/g, "")) : null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase">Live Weather</p>
          <p className="text-white/50 text-xs mt-0.5 truncate max-w-[180px]">{locationName}</p>
        </div>
        {altM && altM > 0 && (
          <span className="text-white/30 text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {altitude}
          </span>
        )}
      </div>

      <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.05)" }} />

      {loading && (
        <div className="px-4 py-8 flex flex-col items-center gap-2">
          <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-[#ff5100] animate-spin" />
          <p className="text-white/25 text-xs">Fetching weather…</p>
        </div>
      )}

      {error && (
        <div className="px-4 py-6 text-center">
          <p className="text-white/25 text-xs">Weather unavailable</p>
        </div>
      )}

      {weather && !loading && (
        <>
          {/* Current conditions */}
          <div className="px-4 py-4 flex items-center gap-4">
            <div className={`${weatherColor(weather.current.weatherCode)} shrink-0`}>
              <WeatherIcon code={weather.current.weatherCode} isDay={weather.current.isDay} className="w-10 h-10" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-end gap-1.5">
                <span className="text-white text-4xl font-bold leading-none">{weather.current.temp}°</span>
                <span className="text-white/35 text-sm mb-1">C</span>
              </div>
              <p className="text-white/55 text-xs mt-0.5">{weatherDesc(weather.current.weatherCode)}</p>
              <p className="text-white/30 text-[10px] mt-0.5">Feels like {weather.current.apparent}°C</p>
            </div>
            {/* Stats */}
            <div className="shrink-0 space-y-1.5 text-right">
              <div className="flex items-center justify-end gap-1.5 text-[10px] text-white/40">
                <Droplets className="w-3 h-3 text-sky-400/70" />
                <span>{weather.current.humidity}%</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-[10px] text-white/40">
                <Wind className="w-3 h-3 text-slate-400/70" />
                <span>{weather.current.wind} km/h</span>
              </div>
            </div>
          </div>

          <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* 7-day forecast */}
          <div className="px-3 py-3">
            <div className="grid grid-cols-7 gap-0.5">
              {weather.daily.map((day, i) => (
                <div
                  key={day.date}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-colors ${i === 0 ? "bg-white/5" : "hover:bg-white/3"}`}
                >
                  <span className="text-white/35 text-[9px] font-semibold uppercase tracking-wide">{formatDay(day.date, i)}</span>
                  <div className={`${weatherColor(day.weatherCode)} my-0.5`}>
                    <WeatherIcon code={day.weatherCode} className="w-4 h-4" />
                  </div>
                  <span className="text-white/80 text-[10px] font-bold">{day.tempMax}°</span>
                  <span className="text-white/30 text-[9px]">{day.tempMin}°</span>
                  {day.precipitation > 0 && (
                    <span className="text-sky-400/70 text-[8px] font-medium">{day.precipitation}mm</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Altitude warning if high */}
          {altM && altM >= 3500 && (
            <>
              <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div className="px-4 py-3 flex items-start gap-2">
                <Thermometer className="w-3.5 h-3.5 text-amber-400/70 shrink-0 mt-0.5" />
                <p className="text-white/30 text-[10px] leading-relaxed">
                  At {altitude}, temperatures can drop <span className="text-white/50 font-medium">10–15°C colder</span> than shown. Data reflects base-area conditions.
                </p>
              </div>
            </>
          )}

          {/* Source */}
          <div className="px-4 pb-3 pt-1 flex items-center justify-between">
            <p className="text-white/15 text-[9px]">Open-Meteo · Updated now</p>
            <Eye className="w-3 h-3 text-white/10" />
          </div>
        </>
      )}
    </div>
  );
}
