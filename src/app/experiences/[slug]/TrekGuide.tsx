// The trek guide chapter: the route summed up, then each day of the itinerary with what it asks
// of you — distance, climb, walking time, the day's high point, where you sleep and how much
// higher than the night before, and the shape of the day as a small profile.

import { AlertTriangle, ArrowDown, ArrowUp, BedDouble, Clock, Footprints, Moon, Mountain, Plane, Route } from "lucide-react";
import type { Trail } from "@/lib/trails/shared";
import { trekGuide, type GuideDay } from "@/lib/trails/guide";

const ORANGE = "#ff5100";
const fmt = (n: number) => n.toLocaleString("en-IN");
const hrs = ([a, b]: [number, number]) => (a === b ? `${a} h` : `${a}–${b} h`);

function DayProfile({ heights, label }: { heights: number[]; label: string }) {
  if (heights.length < 2) return null;
  const W = 200, H = 34;
  const lo = Math.min(...heights), hi = Math.max(...heights);
  const span = Math.max(80, hi - lo); // flat days stay flat-looking
  const y = (e: number) => H - 3 - ((e - lo) / span) * (H - 8);
  const pts = heights.map((e, i) => `${((i / (heights.length - 1)) * W).toFixed(1)},${y(e).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full max-w-[260px] h-[34px] mt-2" role="img" aria-label={label}>
      <path d={`M${pts.join("L")}L${W},${H}L0,${H}Z`} fill="rgba(255,81,0,0.12)" />
      <path d={`M${pts.join("L")}`} fill="none" stroke={ORANGE} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Fact({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0 px-3.5 py-2.5" style={{ background: "var(--bg-surface)" }}>
      <p className="text-[11.5px] tracking-[0.1em] lowercase leading-none mb-1.5" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>{label}</p>
      <p className="text-[15px] font-medium leading-snug tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</p>
      {sub && <p className="text-[12px] leading-snug mt-0.5" style={{ color: "var(--text-tertiary)" }}>{sub}</p>}
    </div>
  );
}

function Day({ g, last }: { g: GuideDay; last: boolean }) {
  const d = g.day;
  const Icon = d.kind === "rest" ? Moon : d.kind === "travel" ? Plane : Footprints;
  const title = d.kind === "rest" ? `Rest day at ${d.from}` : d.kind === "travel" ? d.note.split(" (")[0] : `${d.from} → ${d.to}`;
  const via = (d.via ?? []).filter((v) => v !== d.to);
  return (
    <li className="relative flex gap-3.5 pb-6 last:pb-0">
      {!last && <span className="absolute left-[15px] top-8 bottom-0 w-px" style={{ background: "var(--border-subtle)" }} aria-hidden />}
      <span className="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
        style={d.kind === "walk" ? { background: ORANGE, color: "#fff" } : { background: "var(--bg-surface-2)", color: "var(--text-secondary)" }}>
        {d.day}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="text-[15px] font-semibold flex items-start gap-1.5" style={{ color: "var(--text-primary)" }}>
          <Icon className="w-3.5 h-3.5 shrink-0 mt-[0.2rem]" style={{ color: d.kind === "walk" ? ORANGE : "var(--text-tertiary)" }} />
          <span>Day {d.day}: {title}</span>
        </h3>
        {via.length > 0 && <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Via {via.join(", ")}</p>}

        {d.kind === "walk" && (
          <p className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[12.5px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
            <span className="inline-flex items-center gap-1"><Route className="w-3 h-3" />{d.approx ? "≈" : ""}{d.km} km</span>
            <span className="inline-flex items-center gap-1"><ArrowUp className="w-3 h-3" />{fmt(d.up ?? 0)} m</span>
            <span className="inline-flex items-center gap-1"><ArrowDown className="w-3 h-3" />{fmt(d.down ?? 0)} m</span>
            {g.hours && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{hrs(g.hours)} walking</span>}
            {g.highM != null && <span className="inline-flex items-center gap-1"><Mountain className="w-3 h-3" />high point {fmt(g.highM)} m{g.highAt ? ` (${g.highAt})` : ""}</span>}
          </p>
        )}

        {d.note && d.kind !== "travel" && <p className="text-[14px] mt-2 leading-[1.6] max-w-[66ch]" style={{ color: "var(--text-secondary)" }}>{d.note.replace(/^Acclimatisation day: (.)/, (_, c: string) => `Acclimatisation day. ${c.toUpperCase()}`)}</p>}
        {d.kind === "travel" && d.note.includes("(") && <p className="text-[14px] mt-2" style={{ color: "var(--text-secondary)" }}>{d.note.slice(d.note.indexOf("(") + 1, -1).replace(/^./, (c) => c.toUpperCase())}.</p>}

        {d.kind === "walk" && <DayProfile heights={g.profile} label={`Day ${d.day} profile, ${fmt(Math.min(...(g.profile.length ? g.profile : [0])))} to ${fmt(Math.max(...(g.profile.length ? g.profile : [0])))} m`} />}

        {d.sleepEle != null && (
          <p className="mt-2 text-[12.5px] flex items-start gap-1.5 tabular-nums" style={{ color: "var(--text-secondary)" }}>
            <BedDouble className="w-3.5 h-3.5 shrink-0 mt-[0.1rem]" />
            <span>
              Sleep at {d.to ?? d.from}, {fmt(d.sleepEle)} m
              {g.sleepGain != null && Math.abs(g.sleepGain) >= 50 && <span style={{ color: "var(--text-tertiary)" }}> ({g.sleepGain > 0 ? "+" : "−"}{fmt(Math.abs(g.sleepGain))} m on last night)</span>}
            </span>
          </p>
        )}
        {g.fastGain && (
          <p className="mt-2 text-[12.5px] flex items-start gap-1.5 max-w-[66ch]" style={{ color: "#b45309" }}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            You sleep {fmt(g.sleepGain ?? 0)} m higher than last night. Above 3,000 m the usual advice is no more than about 500 m a night: walk slowly, drink well, and tell your guide about any headache.
          </p>
        )}
        {d.approx && <p className="mt-1.5 text-[12px]" style={{ color: "var(--text-tertiary)" }}>Part of this day is off the mapped trail or its camp isn&apos;t on the map yet, so its figures are estimates.</p>}
      </div>
    </li>
  );
}

export default function TrekGuide({ trail }: { trail: Trail }) {
  const g = trekGuide(trail);
  const longest = g.longestDay, climb = g.biggestClimbDay;
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: "var(--border-subtle)", border: "1px solid var(--border-default)" }}>
        <Fact label="on foot" value={`${g.walkKm} km`} sub={`${trail.days.length} days from ${trail.days[0]?.from}`} />
        <Fact label="climbing" value={`${fmt(g.climbM)} m`} sub="up, over the whole trek" />
        <Fact label="highest point" value={`${fmt(g.highM)} m`} sub={g.highAt || undefined} />
        <Fact label="highest night" value={`${fmt(g.highNightM)} m`} sub={g.highNightAt} />
        <Fact label="nights high up" value={`${g.nightsAbove3000} above 3,000 m`} sub={g.nightsAbove4000 ? `${g.nightsAbove4000} above 4,000 m` : undefined} />
        {longest && <Fact label="longest day" value={`${longest.km} km`} sub={`Day ${longest.day}${climb && climb.day !== longest.day ? `; most climbing: day ${climb.day}, +${fmt(climb.up ?? 0)} m` : ", also the most climbing"}`} />}
      </dl>

      <ol>
        {g.days.map((day, i) => <Day key={day.day.day} g={day} last={i === g.days.length - 1} />)}
      </ol>

      <p className="text-[12px] leading-relaxed max-w-[66ch]" style={{ color: "var(--text-tertiary)" }}>
        Distances, climbs and heights are measured along the trail from OpenStreetMap data, walking times by
        Naismith&apos;s rule slowed for altitude. They&apos;re a typical plan: operators, weather and snow change it.
        Trail data © OpenStreetMap contributors.
      </p>
    </div>
  );
}
