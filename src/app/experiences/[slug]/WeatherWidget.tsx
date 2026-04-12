"use client";

import { useEffect, useState } from "react";
import {
  Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets,
  CloudLightning, CloudDrizzle, CloudFog, Thermometer, ChevronDown,
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

function color(code: number) {
  if (code === 0 || code === 1) return "text-amber-400";
  if (code === 2 || code === 3) return "text-slate-400";
  if (code === 45 || code === 48) return "text-slate-500";
  if (code >= 51 && code <= 65) return "text-sky-400";
  if (code >= 71 && code <= 77) return "text-blue-300";
  if (code >= 80 && code <= 86) return "text-sky-400";
  if (code >= 95) return "text-violet-400";
  return "text-slate-400";
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
}

export default function WeatherWidget({ lat, lng, locationName, altitude }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day");
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
    url.searchParams.set("wind_speed_unit", "kmh");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("timezone", "auto");

    fetch(url.toString())
      .then((r) => r.json())
      .then((d) => {
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lng]);

  const altM = altitude ? parseFloat(altitude.replace(/[^0-9.]/g, "")) : null;

  // While loading — skeleton row (parent owns outer border)
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3.5 flex items-center gap-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="w-3.5 h-3.5 rounded-full bg-white/8 animate-pulse" />
        <div className="w-24 h-2.5 rounded bg-white/8 animate-pulse" />
        <div className="w-16 h-2.5 rounded bg-white/6 animate-pulse ml-2" />
      </div>
    );
  }

  if (!weather) return null;

  const w = weather.current;

  return (
    <div>
      {/* ── COLLAPSED ROW ── */}
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left hover:bg-white/[0.015] transition-colors">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center overflow-x-auto no-scrollbar" style={{ borderTop: "1px solid var(--border-subtle)" }}>

            {/* Live weather label + location */}
            <div className="flex items-center gap-2 px-5 lg:px-6 py-3.5 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
              <div>
                <div className="text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">Live Weather</div>
                <div className="text-white/55 text-[13px] font-medium leading-none truncate max-w-[110px]">{locationName}</div>
              </div>
            </div>

            {/* Condition icon + label */}
            {/* Condition */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
              <div className={`${color(w.weatherCode)} drop-shadow-sm`}>
                <WeatherIcon code={w.weatherCode} isDay={w.isDay} className="w-4 h-4" />
              </div>
              <div>
                <div className="text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">Condition</div>
                <div className="text-white/85 font-medium text-[13px] leading-none">{desc(w.weatherCode)}</div>
              </div>
            </div>

            {/* Temperature */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
              <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <div>
                <div className="text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">Temperature</div>
                <div className="text-white/85 font-medium text-[13px] leading-none">{w.temp}°C <span className="text-white/35 text-[11px] font-normal">/ feels {w.apparent}°</span></div>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="hidden md:flex items-center gap-2.5 px-5 py-3.5 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
              <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div>
                <div className="text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">Wind Speed</div>
                <div className="text-white/85 font-medium text-[13px] leading-none">{w.wind} <span className="text-white/35 text-[11px] font-normal">km/h</span></div>
              </div>
            </div>

            {/* Humidity */}
            <div className="hidden md:flex items-center gap-2.5 px-5 py-3.5 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
              <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div>
                <div className="text-white/30 text-[9px] font-semibold uppercase tracking-[0.18em] leading-none mb-1">Humidity</div>
                <div className="text-white/85 font-medium text-[13px] leading-none">{w.humidity}<span className="text-white/35 text-[11px] font-normal">%</span></div>
              </div>
            </div>

            {/* 3-day mini */}
            <div className="hidden lg:flex items-center gap-4 px-5 py-3.5 flex-1">
              {weather.daily.slice(1, 4).map((day, i) => (
                <div key={day.date} className="flex items-center gap-1.5">
                  <span className="text-white/25 text-[10px] font-medium">{dayLabel(day.date, i + 1).slice(0, 3)}</span>
                  <div className={color(day.weatherCode)}>
                    <WeatherIcon code={day.weatherCode} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-white/50 text-[10px] font-semibold">{day.tempMax}°</span>
                </div>
              ))}
            </div>

            {/* Chevron */}
            <div className="flex items-center gap-1.5 px-5 py-3.5 ml-auto shrink-0">
              <span className="text-white/20 text-[10px] hidden sm:block tracking-wide">7-day</span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/20 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </div>

          </div>
        </div>
      </button>

      {/* ── EXPANDED PANEL ── */}
      <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? "320px" : "0px" }}>
        <div style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.012)" }}>
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5">
            <div className="grid grid-cols-7 gap-1.5">
              {weather.daily.map((day, i) => (
                <div
                  key={day.date}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl ${i === 0 ? "bg-white/[0.04]" : ""}`}
                >
                  <span className="text-white/25 text-[9px] font-semibold uppercase tracking-[0.12em]">{dayLabel(day.date, i)}</span>
                  <div className={`${color(day.weatherCode)} mt-0.5`}>
                    <WeatherIcon code={day.weatherCode} className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-center gap-0.5 mt-0.5">
                    <span className="text-white/75 text-[11px] font-semibold">{day.tempMax}°</span>
                    <span className="text-white/20 text-[10px]">{day.tempMin}°</span>
                  </div>
                  {day.precipitation > 0 && (
                    <span className="text-sky-400/50 text-[9px] font-medium">{day.precipitation}mm</span>
                  )}
                </div>
              ))}
            </div>
            {altM && altM >= 3500 ? (
              <p className="mt-4 text-white/20 text-[9px] flex items-center gap-1.5">
                <Thermometer className="w-3 h-3 text-amber-400/40 shrink-0" />
                At {altitude}, summit temps run 10–15°C colder. Data reflects base-area conditions.
                <span className="ml-auto text-white/12">Open-Meteo</span>
              </p>
            ) : (
              <p className="mt-3 text-white/12 text-[9px] text-right">Open-Meteo · Updated now</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
