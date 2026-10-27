"use client";

// The trail's three drop-down panels in the "At a glance" strip: the day-by-day itinerary, the
// elevation profile, and the weather at every place the itinerary sleeps.

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BedDouble, Footprints, Moon, Plane, Route, RotateCw } from "lucide-react";
import { trailProfile, type Trail, type TrailDay } from "@/lib/trails/shared";
import { WeatherIcon, iconColor, desc } from "./WeatherWidget";

const ORANGE = "#ff5100";
const fmt = (n: number) => n.toLocaleString("en-IN");

// ── Itinerary ────────────────────────────────────────────────────────────────

function dayTitle(d: TrailDay) {
  if (d.kind === "rest") return `Rest day at ${d.from}`;
  if (d.kind === "travel") return d.note.split(" (")[0];
  return `${d.from} → ${d.to}`;
}

export function ItineraryPanel({ trail }: { trail: Trail }) {
  const walking = trail.days.filter((d) => d.kind === "walk");
  const totalKm = walking.reduce((s, d) => s + (d.km ?? 0), 0);
  const rest = trail.days.filter((d) => d.kind === "rest").length;

  return (
    <div className="p-4 sm:p-5">
      <p className="text-[13px] mb-4" style={{ color: "var(--text-secondary)" }}>
        <b style={{ color: "var(--text-primary)" }}>{trail.days.length} days</b> from {trail.days[0].from}: {walking.length} walking, {rest} rest {rest === 1 ? "day" : "days"} to acclimatise, about {Math.round(totalKm)} km on foot. A typical plan; operators vary it a little.
      </p>
      <ol className="relative">
        {trail.days.map((d, i) => {
          const Icon = d.kind === "rest" ? Moon : d.kind === "travel" ? Plane : Footprints;
          const last = i === trail.days.length - 1;
          return (
            <li key={d.day} className="relative flex gap-3.5 pb-4 last:pb-0">
              {/* The day's dot on a line running down the list */}
              {!last && <span className="absolute left-[15px] top-8 bottom-0 w-px" style={{ background: "var(--border-subtle)" }} aria-hidden />}
              <span className="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                style={d.kind === "walk" ? { background: ORANGE, color: "#fff" } : { background: "var(--bg-surface-2)", color: "var(--text-secondary)" }}>
                {d.day}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[14px] font-semibold flex items-center gap-1.5 flex-wrap" style={{ color: "var(--text-primary)" }}>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: d.kind === "walk" ? ORANGE : "var(--text-tertiary)" }} />
                  {dayTitle(d)}
                  {d.via && d.via.length > 0 && <span className="font-normal text-[12px]" style={{ color: "var(--text-tertiary)" }}>via {d.via.join(", ")}</span>}
                </p>
                {d.kind === "walk" && (
                  <p className="flex flex-wrap gap-x-3.5 gap-y-1 mt-1 text-[12px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
                    <span className="inline-flex items-center gap-1"><Route className="w-3 h-3" />{d.approx ? "≈" : ""}{d.km} km</span>
                    <span className="inline-flex items-center gap-1"><ArrowUp className="w-3 h-3" />{fmt(d.up ?? 0)} m</span>
                    <span className="inline-flex items-center gap-1"><ArrowDown className="w-3 h-3" />{fmt(d.down ?? 0)} m</span>
                    {d.sleepEle != null && <span className="inline-flex items-center gap-1"><BedDouble className="w-3 h-3" />sleep at {fmt(d.sleepEle)} m</span>}
                  </p>
                )}
                {d.kind === "rest" && d.sleepEle != null && (
                  <p className="mt-1 text-[12px] inline-flex items-center gap-1" style={{ color: "var(--text-secondary)" }}><BedDouble className="w-3 h-3" />sleep at {fmt(d.sleepEle)} m</p>
                )}
                {d.note && d.kind !== "travel" && <p className="text-[13px] mt-1 leading-snug" style={{ color: "var(--text-tertiary)" }}>{d.note.replace(/^Acclimatisation day: /, "")}</p>}
                {d.kind === "travel" && d.note.includes("(") && <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>{d.note.slice(d.note.indexOf("(") + 1, -1).replace(/^./, (c) => c.toUpperCase())}.</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Elevation ────────────────────────────────────────────────────────────────

export function ElevationPanel({ trail }: { trail: Trail }) {
  const profile = useMemo(() => trailProfile(trail), [trail]);
  const [hover, setHover] = useState<number | null>(null);
  const W = 1000, H = 230, PAD = { l: 48, r: 14, t: 44, b: 26 };
  const maxKm = profile[profile.length - 1].km;
  const eles = profile.map((p) => p.ele);
  const lo = Math.floor((Math.min(...eles) - 150) / 500) * 500;
  const hi = Math.ceil((Math.max(...eles, ...trail.stops.map((s) => s.ele ?? 0)) + 100) / 500) * 500;
  const x = (km: number) => PAD.l + (km / maxKm) * (W - PAD.l - PAD.r);
  const y = (e: number) => PAD.t + (1 - (e - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const line = profile.map((p, i) => `${i ? "L" : "M"}${x(p.km).toFixed(1)},${y(p.ele).toFixed(1)}`).join("");
  const area = `${line}L${x(maxKm)},${H - PAD.b}L${x(0)},${H - PAD.b}Z`;
  const ticks: number[] = [];
  for (let e = lo; e <= hi; e += 1000) ticks.push(e);
  const kmTicks: number[] = [];
  for (let k = 0; k <= maxKm; k += 10) kmTicks.push(k);

  function move(e: React.PointerEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const km = ((e.clientX - box.left) / box.width * W - PAD.l) / (W - PAD.l - PAD.r) * maxKm;
    if (km < 0 || km > maxKm) return setHover(null);
    let best = 0;
    for (let i = 1; i < profile.length; i++) if (Math.abs(profile[i].km - km) < Math.abs(profile[best].km - km)) best = i;
    setHover(best);
  }

  const h = hover != null ? profile[hover] : null;
  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
        <span>From <b style={{ color: "var(--text-primary)" }}>{fmt(trail.stops[0].ele ?? eles[0])} m</b> at {trail.stops[0].name} to <b style={{ color: "var(--text-primary)" }}>{fmt(trail.stops[trail.stops.length - 1].ele ?? eles[eles.length - 1])} m</b> at {trail.stops[trail.stops.length - 1].name}, about {fmt(trail.ascentM)} m of climbing on the way up</span>
        <span className="tabular-nums text-[12px]" style={{ color: "var(--text-tertiary)" }}>{h ? `km ${h.km.toFixed(1)} · ${fmt(h.ele)} m` : "Move along the chart"}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none select-none" onPointerMove={move} onPointerLeave={() => setHover(null)} role="img"
        aria-label={`Elevation from ${fmt(eles[0])} m to ${fmt(eles[eles.length - 1])} m over ${trail.lengthKm} km`}>
        <defs>
          <linearGradient id="strip-elev-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={ORANGE} stopOpacity="0.32" />
            <stop offset="1" stopColor={ORANGE} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {ticks.map((e) => (
          <g key={e}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(e)} y2={y(e)} stroke="var(--border-subtle)" strokeDasharray="3 4" />
            <text x={PAD.l - 6} y={y(e) + 4} textAnchor="end" fontSize="11" fill="var(--text-tertiary)">{fmt(e)}</text>
          </g>
        ))}
        {kmTicks.map((k) => <text key={k} x={x(k)} y={H - PAD.b + 16} textAnchor="middle" fontSize="10.5" fill="var(--text-tertiary)">{k} km</text>)}
        <path d={area} fill="url(#strip-elev-fill)" />
        <path d={line} fill="none" stroke={ORANGE} strokeWidth="2.2" strokeLinejoin="round" />
        {/* Stops: a tick on the line and the name above, on alternating rows so close ones don't collide */}
        {trail.stops.map((s, i) => {
          const sy = y(s.ele ?? 0);
          const ly = i % 2 ? 14 : 30;
          return (
            <g key={s.name}>
              <line x1={x(s.km)} x2={x(s.km)} y1={ly + 4} y2={sy} stroke="var(--text-tertiary)" strokeOpacity="0.35" strokeDasharray="2 3" />
              <circle cx={x(s.km)} cy={sy} r="4" fill={ORANGE} stroke="var(--bg-surface)" strokeWidth="1.5" />
              <text x={x(s.km)} y={ly} textAnchor={i === 0 ? "start" : i === trail.stops.length - 1 ? "end" : "middle"} fontSize="11" fontWeight="600" fill="var(--text-secondary)">{s.name}</text>
            </g>
          );
        })}
        {h && (
          <g>
            <line x1={x(h.km)} x2={x(h.km)} y1={PAD.t} y2={H - PAD.b} stroke="var(--text-primary)" strokeOpacity="0.35" />
            <circle cx={x(h.km)} cy={y(h.ele)} r="5" fill={ORANGE} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      <p className="text-[11.5px] mt-2" style={{ color: "var(--text-tertiary)" }}>One way, along the mapped trail. The way back follows the same path.</p>
    </div>
  );
}

// ── Weather along the trail ──────────────────────────────────────────────────

interface Day { code: number; max: number; min: number; rain: number }
type Source = "forecast" | "last-year";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (s: string, n: number) => { const d = new Date(`${s}T00:00:00`); d.setDate(d.getDate() + n); return iso(d); };
const pretty = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

/** Daily weather for several places at once from Open-Meteo, corrected to each place's height */
async function fetchDaily(api: "forecast" | "archive", places: Trail["sleepPlaces"], range?: { start: string; end: string }) {
  const url = new URL(api === "forecast" ? "https://api.open-meteo.com/v1/forecast" : "https://archive-api.open-meteo.com/v1/archive");
  url.searchParams.set("latitude", places.map((p) => p.lat).join(","));
  url.searchParams.set("longitude", places.map((p) => p.lng).join(","));
  if (places.every((p) => p.ele != null)) url.searchParams.set("elevation", places.map((p) => p.ele).join(","));
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
  url.searchParams.set("timezone", "auto");
  if (range) { url.searchParams.set("start_date", range.start); url.searchParams.set("end_date", range.end); }
  else url.searchParams.set("forecast_days", "16");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("weather");
  const json = await res.json();
  const list = Array.isArray(json) ? json : [json];
  // name → date → day
  const out = new Map<string, Map<string, Day>>();
  list.forEach((r: { daily: Record<string, (number | string)[]> }, i: number) => {
    const m = new Map<string, Day>();
    (r.daily.time as string[]).forEach((t, k) => m.set(t, {
      code: r.daily.weather_code[k] as number,
      max: Math.round(r.daily.temperature_2m_max[k] as number),
      min: Math.round(r.daily.temperature_2m_min[k] as number),
      rain: Math.round((r.daily.precipitation_sum[k] as number) * 10) / 10,
    }));
    out.set(places[i].name, m);
  });
  return out;
}

export function TrailWeather({ trail }: { trail: Trail }) {
  const [start, setStart] = useState<string>(() => iso(new Date()));
  const [rows, setRows] = useState<{ day: TrailDay; date: string; place: string; ele: number | null; w: Day | null; source: Source | null }[] | null>(null);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);
  const today = iso(new Date());
  const lastForecast = addDays(today, 15);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setError(false);
    const plan = trail.days.map((d, i) => {
      const place = d.to ?? d.from;
      return { day: d, date: addDays(start, i), place, ele: trail.sleepPlaces.find((p) => p.name === place)?.ele ?? d.sleepEle };
    });
    const needsArchive = plan.some((p) => p.date > lastForecast);
    const yearAgo = (s: string) => addDays(s, -364); // same weekday, a year earlier
    Promise.all([
      fetchDaily("forecast", trail.sleepPlaces),
      needsArchive ? fetchDaily("archive", trail.sleepPlaces, { start: yearAgo(plan[0].date), end: yearAgo(plan[plan.length - 1].date) }) : Promise.resolve(null),
    ]).then(([fc, past]) => {
      if (cancelled) return;
      setRows(plan.map((p) => {
        const f = p.date <= lastForecast ? fc.get(p.place)?.get(p.date) ?? null : null;
        const old = !f && past ? past.get(p.place)?.get(yearAgo(p.date)) ?? null : null;
        return { ...p, w: f ?? old, source: f ? "forecast" : old ? "last-year" : null };
      }));
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [trail, start, nonce, lastForecast]);

  const anyPast = rows?.some((r) => r.source === "last-year");

  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
        <label className="text-[13px] font-semibold" htmlFor="trail-weather-start" style={{ color: "var(--text-primary)" }}>Starting the trek on</label>
        <input id="trail-weather-start" type="date" value={start} min={today} onChange={(e) => e.target.value && setStart(e.target.value)}
          className="h-9 px-3 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#ff5100]/30"
          style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", colorScheme: "light dark" }} />
        <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Each day shows the weather where you sleep that night.</span>
      </div>

      {error ? (
        <div className="flex items-center gap-3 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          Couldn&apos;t load the weather.
          <button onClick={() => setNonce((n) => n + 1)} className="inline-flex items-center gap-1 font-semibold" style={{ color: ORANGE }}><RotateCw className="w-3.5 h-3.5" />Try again</button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
          {(rows ?? trail.days.map((d, i) => ({ day: d, date: addDays(start, i), place: d.to ?? d.from, ele: d.sleepEle, w: null, source: null }))).map((r, i) => (
            <div key={r.day.day} className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:grid-cols-[2.5rem_7rem_minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-2.5 text-[13px]"
              style={{ borderTop: i ? "1px solid var(--border-subtle)" : undefined, background: "var(--bg-surface)" }}>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--text-tertiary)" }}>Day {r.day.day}</span>
              <span className="hidden sm:block text-[12px] tabular-nums" style={{ color: "var(--text-secondary)" }}>{pretty(r.date)}</span>
              <span className="min-w-0">
                <span className="font-semibold truncate block" style={{ color: "var(--text-primary)" }}>{r.place}{r.ele != null && <span className="font-normal text-[12px]" style={{ color: "var(--text-tertiary)" }}> · {fmt(r.ele)} m</span>}</span>
                <span className="sm:hidden text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>{pretty(r.date)}</span>
              </span>
              {r.w ? (
                <span className="flex items-center gap-2.5 justify-end">
                  <span className={iconColor(r.w.code)} title={desc(r.w.code)}><WeatherIcon code={r.w.code} className="w-5 h-5" /></span>
                  <span className="tabular-nums whitespace-nowrap"><b style={{ color: "var(--text-primary)" }}>{r.w.max}°</b> <span style={{ color: "var(--text-tertiary)" }}>/ {r.w.min}°</span></span>
                  <span className="hidden sm:inline tabular-nums text-[12px] w-14 text-right" style={{ color: "var(--text-tertiary)" }}>{r.w.rain > 0 ? `${r.w.rain} mm` : "dry"}</span>
                  {r.source === "last-year" && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}>last yr</span>}
                </span>
              ) : (
                <span className="h-4 w-24 rounded animate-pulse justify-self-end" style={{ background: "var(--bg-surface-2)" }} />
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-[11.5px] mt-2.5" style={{ color: "var(--text-tertiary)" }}>
        Forecasts from Open-Meteo, adjusted for each place&apos;s height.{anyPast ? " Days marked “last yr” are too far ahead to forecast, so they show the same dates last year as a guide." : ""} Mountain weather changes fast: check again before you set off.
      </p>
    </div>
  );
}
