"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { openOperator } from "@/lib/outbound";
import { inr } from "@/lib/operatorOffer";

/** One batch: an operator starting the trek on a given day */
export type Departure = {
  /** ISO start date, YYYY-MM-DD */
  date: string;
  operator: string;
  url?: string;
  /** Per person, as the comparison shows it (fee with GST plus paid transport) */
  price?: number;
  days?: number;
  /** The trek, when one calendar covers several (an operator's page) */
  trek?: string;
  trekSlug?: string;
};

// One colour per operator, distinct in light and dark
const COLOURS = ["#ff5100", "#3fa877", "#4a8fd4", "#b36ad8", "#d4a72c", "#d4675a"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Local-time date from YYYY-MM-DD, so a date never slips a day across time zones */
const parse = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (key: string, long = false) =>
  parse(`${key}-01`).toLocaleDateString("en-IN", { month: long ? "long" : "short", year: long ? "numeric" : "2-digit" });
const dayLabel = (iso: string) => parse(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

/**
 * Every listed start date on one calendar, so someone with fixed leave can see at a glance what
 * starts when, then book that batch on the operator's page. On a trek page the dots are operators;
 * on an operator's page (by="trek") they are that operator's treks.
 */
export default function DepartureCalendar({ departures, slug, today, by = "operator" }: { departures: Departure[]; slug?: string; today: string; by?: "operator" | "trek" }) {
  const upcoming = useMemo(
    () => departures.filter((d) => d.date >= today).sort((a, b) => a.date.localeCompare(b.date) || (a.price ?? Infinity) - (b.price ?? Infinity)),
    [departures, today],
  );
  const keyOf = (d: Departure) => (by === "trek" ? d.trek ?? "" : d.operator);
  const groups = [...new Set(upcoming.map(keyOf))].sort();
  // More groups than colours (a big operator's many treks): one colour, and a dropdown to pick one
  const many = groups.length > COLOURS.length;
  const colour = (g: string) => (many ? "#ff5100" : COLOURS[groups.indexOf(g) % COLOURS.length]);

  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const shown = upcoming.filter((d) => !hidden.has(keyOf(d)));
  const months = [...new Set(shown.map((d) => monthKey(d.date)))];

  const [month, setMonth] = useState<string | undefined>(months[0]);
  const [day, setDay] = useState<string | undefined>();
  const activeMonth = month && months.includes(month) ? month : months[0];

  if (upcoming.length === 0) return null;

  const byDay = new Map<string, Departure[]>();
  for (const d of shown) if (monthKey(d.date) === activeMonth) byDay.set(d.date, [...(byDay.get(d.date) ?? []), d]);
  const activeDay = day && byDay.has(day) ? day : undefined;
  const list = activeDay ? byDay.get(activeDay)! : [...byDay.values()].flat();

  const monthIdx = activeMonth ? months.indexOf(activeMonth) : -1;
  const go = (i: number) => { setMonth(months[i]); setDay(undefined); };

  // Grid cells for the month: blanks up to the first weekday (Monday first), then each day
  const cells: (string | null)[] = [];
  if (activeMonth) {
    const first = parse(`${activeMonth}-01`);
    const lead = (first.getDay() + 6) % 7;
    const len = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= len; d++) cells.push(isoOf(new Date(first.getFullYear(), first.getMonth(), d)));
  }

  function toggleOperator(op: string) {
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(op)) next.delete(op);
      else if (groups.length - next.size > 1) next.add(op); // keep at least one on
      return next;
    });
    setDay(undefined);
  }

  return (
    <div className="space-y-4 @container">
      <p className="text-[14px] leading-[1.6] max-w-[66ch]" style={{ color: "var(--text-secondary)" }}>
        {upcoming.length} start {upcoming.length === 1 ? "date" : "dates"}{" "}
        {by === "trek"
          ? <>across {groups.length} {groups.length === 1 ? "trek" : "treks"}, as listed on the operator&apos;s own pages. Pick a day to see what starts then.</>
          : <>from {groups.length} {groups.length === 1 ? "operator" : "operators"}, as listed on their own pages. Pick a day to see who starts then.</>}
      </p>

      {many && (
        <label className="inline-flex items-center gap-2 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Show
          <select
            value={hidden.size ? groups.find((g) => !hidden.has(g)) : ""}
            onChange={(e) => { const v = e.target.value; setHidden(new Set(v ? groups.filter((g) => g !== v) : [])); setDay(undefined); }}
            className="rounded-lg border px-2.5 py-1.5 text-[13.5px] max-w-[260px]"
            style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}
          >
            <option value="">All {groups.length} {by === "trek" ? "treks" : "operators"}</option>
            {groups.map((g) => <option key={g} value={g}>{g} ({upcoming.filter((d) => keyOf(d) === g).length})</option>)}
          </select>
        </label>
      )}

      {/* Colour key, which doubles as a filter */}
      {groups.length > 1 && !many && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={by === "trek" ? "Show treks" : "Show operators"}>
          {groups.map((op) => {
            const on = !hidden.has(op);
            return (
              <button
                key={op}
                type="button"
                aria-pressed={on}
                onClick={() => toggleOperator(op)}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] transition-opacity"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", opacity: on ? 1 : 0.45 }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colour(op) }} aria-hidden />
                {op}
              </button>
            );
          })}
        </div>
      )}

      {/* Side by side only when the section itself is wide enough for both */}
      <div className="grid grid-cols-1 @[620px]:grid-cols-[minmax(0,290px)_minmax(0,1fr)] gap-5">
        {/* Month grid */}
        <div className="rounded-xl border p-3 w-full max-w-[360px]" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => go(monthIdx - 1)} disabled={monthIdx <= 0} aria-label="Previous month with departures" className="p-1.5 rounded-full disabled:opacity-25 hover:text-[#ff5100]" style={{ color: "var(--text-secondary)" }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>{activeMonth && monthLabel(activeMonth, true)}</span>
            <button type="button" onClick={() => go(monthIdx + 1)} disabled={monthIdx >= months.length - 1} aria-label="Next month with departures" className="p-1.5 rounded-full disabled:opacity-25 hover:text-[#ff5100]" style={{ color: "var(--text-secondary)" }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            {WEEKDAYS.map((w) => <span key={w}>{w.slice(0, 2)}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((iso, i) => {
              if (!iso) return <span key={`b${i}`} />;
              const deps = byDay.get(iso);
              const n = Number(iso.slice(8));
              if (!deps) {
                return <span key={iso} className="h-10 flex items-start justify-center pt-1.5 text-[12.5px]" style={{ color: iso < today ? "var(--text-tertiary)" : "var(--text-secondary)", opacity: iso < today ? 0.4 : 0.7 }}>{n}</span>;
              }
              const selected = iso === activeDay;
              const ops = [...new Set(deps.map(keyOf))];
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setDay(selected ? undefined : iso)}
                  aria-pressed={selected}
                  aria-label={`${dayLabel(iso)}: ${ops.join(", ")}`}
                  className="h-10 rounded-lg flex flex-col items-center pt-1.5 gap-1 text-[12.5px] font-semibold transition-colors"
                  style={{
                    color: selected ? "#fff" : "var(--text-primary)",
                    background: selected ? "#ff5100" : "rgba(255,81,0,0.10)",
                  }}
                >
                  {n}
                  <span className="flex gap-0.5" aria-hidden>
                    {ops.slice(0, 3).map((op) => (
                      <span key={op} className="w-1.5 h-1.5 rounded-full" style={{ background: selected ? "#fff" : colour(op) }} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Month chips: a quick jump, with how many batches each month has */}
          {months.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto mt-3 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {months.map((m, i) => {
                const n = shown.filter((d) => monthKey(d.date) === m).length;
                const on = m === activeMonth;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => go(i)}
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11.5px] whitespace-nowrap"
                    style={{ background: on ? "#ff5100" : "transparent", color: on ? "#fff" : "var(--text-secondary)", border: on ? "1px solid #ff5100" : "1px solid var(--border)" }}
                  >
                    {monthLabel(m)} · {n}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Who starts when */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <h3 className="text-[13px] tracking-[0.1em] !font-normal" style={{ color: "var(--text-tertiary)", fontVariant: "small-caps" }}>
              {activeDay ? `starting ${dayLabel(activeDay)}` : `all of ${activeMonth ? monthLabel(activeMonth, true) : ""}`}
            </h3>
            {activeDay && (
              <button type="button" onClick={() => setDay(undefined)} className="text-[12.5px] hover:text-[#ff5100]" style={{ color: "var(--text-tertiary)" }}>
                Whole month
              </button>
            )}
          </div>
          <ul className="divide-y max-h-[340px] overflow-y-auto pr-1" style={{ borderColor: "var(--border)" }}>
            {list.map((d) => {
              const end = d.days ? parse(d.date) : undefined;
              end?.setDate(end.getDate() + d.days! - 1);
              return (
                <li key={`${d.date}-${d.operator}-${d.trek ?? ""}`} className="flex items-center gap-3 py-2.5" style={{ borderColor: "var(--border)" }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colour(keyOf(d)) }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {dayLabel(d.date)}
                      {end && <span className="font-normal" style={{ color: "var(--text-tertiary)" }}> → {dayLabel(isoOf(end))}</span>}
                    </p>
                    <p className="text-[12.5px]" style={{ color: "var(--text-secondary)" }}>
                      {by === "trek" && d.trekSlug
                        ? <Link href={`/experiences/${d.trekSlug}`} className="hover:text-[#ff5100] underline-offset-2 hover:underline">{d.trek}</Link>
                        : by === "trek" ? d.trek : d.operator}
                      {d.price ? ` · ${inr(d.price)}` : ""}{d.days ? ` · ${d.days} days` : ""}
                    </p>
                  </div>
                  {d.url && (
                    <button
                      type="button"
                      onClick={() => openOperator({ url: d.url!, operator: d.operator, source: "calendar", slug: slug ?? d.trekSlug })}
                      className="shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12.5px] font-semibold transition-colors hover:border-[#ff5100] hover:text-[#ff5100]"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      Book <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-[11.5px] mt-2" style={{ color: "var(--text-tertiary)" }}>
            Seats and dates change: confirm on the operator&apos;s page before you book travel.
          </p>
        </div>
      </div>
    </div>
  );
}
