"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, CalendarPlus, X } from "lucide-react";
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
const addDays = (iso: string, n: number) => { const d = parse(iso); d.setDate(d.getDate() + n); return isoOf(d); };
/** Last day on the trail: the start date when the length isn't known */
const endOf = (d: Departure) => (d.days ? addDays(d.date, d.days - 1) : d.date);
const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (key: string, long = false) =>
  parse(`${key}-01`).toLocaleDateString("en-IN", { month: long ? "long" : "short", year: long ? "numeric" : "2-digit" });
const dayLabel = (iso: string) => parse(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const shortLabel = (iso: string) => parse(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
/** "₹12.5k" for the month chips */
const shortInr = (n: number) => (n >= 1000 ? `₹${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "")}k` : inr(n));

/** A one-batch .ics file, so the dates can sit in the visitor's own calendar while they decide */
function downloadIcs(d: Departure, title: string) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const esc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Trail to Tides//Departures//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${d.date}-${d.operator.replace(/\W+/g, "")}-${(d.trekSlug ?? title).replace(/\W+/g, "")}@trailtotides.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${d.date.replace(/-/g, "")}`,
    `DTEND;VALUE=DATE:${addDays(endOf(d), 1).replace(/-/g, "")}`,
    `SUMMARY:${esc(`${title} with ${d.operator}`)}`,
    `DESCRIPTION:${esc(`${d.days ? `${d.days} days. ` : ""}${d.price ? `${inr(d.price)} per person. ` : ""}Confirm seats on the operator's page before booking travel.`)}`,
    ...(d.url ? [`URL:${d.url}`] : []),
    "END:VEVENT", "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${title} ${d.date}.ics`.replace(/[^\w .-]+/g, "");
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const chip = (on: boolean) => ({
  background: on ? "#ff5100" : "transparent",
  color: on ? "#fff" : "var(--text-secondary)",
  border: on ? "1px solid #ff5100" : "1px solid var(--border)",
});

/**
 * Every listed start date on one calendar, so someone with fixed leave can see at a glance what
 * starts when, then book that batch on the operator's page. On a trek page the dots are operators;
 * on an operator's page (by="trek") they are that operator's treks.
 */
export default function DepartureCalendar({ departures, slug, today, by = "operator", trekName }: {
  departures: Departure[];
  slug?: string;
  today: string;
  by?: "operator" | "trek";
  /** The trek's name on a trek page, for the calendar file */
  trekName?: string;
}) {
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
  // "My dates": only batches that start and finish inside the visitor's leave
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"date" | "price">("date");
  const [month, setMonth] = useState<string | undefined>();
  const [day, setDay] = useState<string | undefined>();
  // The batch being pointed at in the list: its days are shaded on the grid
  const [span, setSpan] = useState<{ start: string; end: string } | null>(null);

  if (upcoming.length === 0) return null;

  const fits = (d: Departure) => (!from || d.date >= from) && (!to || endOf(d) <= to);
  const shown = upcoming.filter((d) => !hidden.has(keyOf(d)) && fits(d));
  const months = [...new Set(shown.map((d) => monthKey(d.date)))];
  const activeMonth = month && months.includes(month) ? month : months[0];

  const byDay = new Map<string, Departure[]>();
  for (const d of shown) if (monthKey(d.date) === activeMonth) byDay.set(d.date, [...(byDay.get(d.date) ?? []), d]);
  const activeDay = day && byDay.has(day) ? day : undefined;
  const monthList = [...byDay.values()].flat();
  const list = [...(activeDay ? byDay.get(activeDay)! : monthList)]
    .sort((a, b) => (sort === "price" ? (a.price ?? Infinity) - (b.price ?? Infinity) : 0) || a.date.localeCompare(b.date));
  const priced = monthList.map((d) => d.price).filter((p): p is number => !!p);
  const lowest = priced.length > 1 && Math.min(...priced) < Math.max(...priced) ? Math.min(...priced) : undefined;

  const monthIdx = activeMonth ? months.indexOf(activeMonth) : -1;
  const go = (i: number) => { setMonth(months[i]); setDay(undefined); };
  const pickDay = (iso?: string) => {
    setDay(iso);
    const first = iso && byDay.get(iso)?.[0];
    setSpan(first ? { start: first.date, end: endOf(first) } : null);
  };

  // Grid cells for the month: blanks up to the first weekday (Monday first), then each day
  const cells: (string | null)[] = [];
  if (activeMonth) {
    const first = parse(`${activeMonth}-01`);
    const lead = (first.getDay() + 6) % 7;
    const len = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= len; d++) cells.push(isoOf(new Date(first.getFullYear(), first.getMonth(), d)));
  }

  function toggleGroup(g: string) {
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(g)) next.delete(g);
      else if (groups.length - next.size > 1) next.add(g); // keep at least one on
      return next;
    });
    pickDay(undefined);
  }
  const clearLeave = () => { setFrom(""); setTo(""); setLeaveOpen(false); pickDay(undefined); };

  return (
    <div className="space-y-4 @container">
      <p className="text-[14px] leading-[1.6] max-w-[66ch]" style={{ color: "var(--text-secondary)" }}>
        {upcoming.length} start {upcoming.length === 1 ? "date" : "dates"}{" "}
        {by === "trek"
          ? <>across {groups.length} {groups.length === 1 ? "trek" : "treks"}, as listed on the operator&apos;s own pages. Pick a day to see what starts then.</>
          : <>from {groups.length} {groups.length === 1 ? "operator" : "operators"}, as listed on their own pages. Pick a day to see who starts then.</>}
      </p>

      {/* Filters: which operators (or treks), and the visitor's own dates */}
      <div className="flex flex-wrap items-center gap-2">
        {many && (
          <label className="inline-flex items-center gap-2 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Show
            <select
              value={hidden.size ? groups.find((g) => !hidden.has(g)) : ""}
              onChange={(e) => { const v = e.target.value; setHidden(new Set(v ? groups.filter((g) => g !== v) : [])); pickDay(undefined); }}
              className="rounded-lg border px-2.5 py-1.5 text-[13.5px] max-w-[240px]"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}
            >
              <option value="">All {groups.length} {by === "trek" ? "treks" : "operators"}</option>
              {groups.map((g) => <option key={g} value={g}>{g} ({upcoming.filter((d) => keyOf(d) === g).length})</option>)}
            </select>
          </label>
        )}
        {groups.length > 1 && !many && groups.map((g) => {
          const on = !hidden.has(g);
          return (
            <button
              key={g}
              type="button"
              aria-pressed={on}
              onClick={() => toggleGroup(g)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] transition-opacity"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)", opacity: on ? 1 : 0.45 }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colour(g) }} aria-hidden />
              {g}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => (leaveOpen && (from || to) ? clearLeave() : setLeaveOpen((o) => !o))}
          aria-expanded={leaveOpen}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-semibold"
          style={chip(!!(from || to))}
        >
          {from || to ? <>My dates <X className="w-3 h-3" /></> : "Fits my dates"}
        </button>
      </div>

      {leaveOpen && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border p-3 max-w-xl" style={{ borderColor: "var(--border)" }}>
          <label className="flex flex-col gap-1 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Free from
            <input type="date" value={from} min={today} onChange={(e) => { setFrom(e.target.value); pickDay(undefined); }}
              className="rounded-lg border px-2.5 py-1.5 text-[13.5px]" style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }} />
          </label>
          <label className="flex flex-col gap-1 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Back by
            <input type="date" value={to} min={from || today} onChange={(e) => { setTo(e.target.value); pickDay(undefined); }}
              className="rounded-lg border px-2.5 py-1.5 text-[13.5px]" style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }} />
          </label>
          <p className="text-[12.5px] pb-2" style={{ color: "var(--text-secondary)" }}>
            {from || to ? `${shown.length} ${shown.length === 1 ? "batch fits" : "batches fit"}` : "Shows only batches that start and finish inside your dates."}
          </p>
        </div>
      )}

      {shown.length === 0 ? (
        <div className="rounded-xl border p-5 text-[14px] max-w-xl" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          No batch starts and finishes inside those dates.{" "}
          <button type="button" onClick={clearLeave} className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Show all dates</button>
        </div>
      ) : (
      /* Side by side only when the section itself is wide enough for both */
      <div className="grid grid-cols-1 @[620px]:grid-cols-[minmax(0,290px)_minmax(0,1fr)] gap-5">
        {/* Month grid */}
        <div className="rounded-xl border p-3 w-full max-w-[360px] self-start" style={{ borderColor: "var(--border)" }}>
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
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((iso, i) => {
              if (!iso) return <span key={`b${i}`} />;
              const deps = byDay.get(iso);
              const n = Number(iso.slice(8));
              const isToday = iso === today;
              // Days the pointed-at batch is on the trail, shaded as one band
              const inSpan = span && iso >= span.start && iso <= span.end;
              const band = inSpan
                ? { background: "rgba(255,81,0,0.16)", borderRadius: `${iso === span.start ? 8 : 0}px ${iso === span.end ? 8 : 0}px ${iso === span.end ? 8 : 0}px ${iso === span.start ? 8 : 0}px` }
                : {};
              const todayRing = isToday ? { boxShadow: "inset 0 0 0 1.5px var(--text-tertiary)" } : {};
              if (!deps) {
                return (
                  <span key={iso} className="h-10 flex items-start justify-center pt-1.5 text-[12.5px]" style={band}>
                    <span className="w-6 h-6 -mt-0.5 leading-6 text-center rounded-full" title={isToday ? "Today" : undefined}
                      style={{ color: iso < today ? "var(--text-tertiary)" : "var(--text-secondary)", opacity: iso < today ? 0.4 : 0.7, ...todayRing }}>{n}</span>
                  </span>
                );
              }
              const selected = iso === activeDay;
              const gs = [...new Set(deps.map(keyOf))];
              return (
                <span key={iso} className="h-10" style={band}>
                  <button
                    type="button"
                    onClick={() => pickDay(selected ? undefined : iso)}
                    aria-pressed={selected}
                    aria-label={`${dayLabel(iso)}: ${gs.join(", ")}`}
                    className="w-full h-full rounded-lg flex flex-col items-center pt-1.5 gap-1 text-[12.5px] font-semibold transition-colors"
                    style={{
                      color: selected ? "#fff" : "var(--text-primary)",
                      background: selected ? "#ff5100" : inSpan ? "transparent" : "rgba(255,81,0,0.10)",
                      ...todayRing,
                    }}
                  >
                    {n}
                    <span className="flex gap-0.5" aria-hidden>
                      {gs.slice(0, 3).map((g) => (
                        <span key={g} className="w-1.5 h-1.5 rounded-full" style={{ background: selected ? "#fff" : colour(g) }} />
                      ))}
                    </span>
                  </button>
                </span>
              );
            })}
          </div>
          {/* Month chips: a quick jump, with how many batches each month has and its lowest price */}
          {months.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto mt-3 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {months.map((m, i) => {
                const inMonth = shown.filter((d) => monthKey(d.date) === m);
                const low = Math.min(...inMonth.map((d) => d.price ?? Infinity));
                return (
                  <button key={m} type="button" onClick={() => go(i)} className="shrink-0 rounded-full px-2.5 py-1 text-[11.5px] whitespace-nowrap" style={chip(m === activeMonth)}
                    title={`${inMonth.length} ${inMonth.length === 1 ? "batch" : "batches"}${Number.isFinite(low) ? `, from ${inr(low)}` : ""}`}>
                    {monthLabel(m)} · {inMonth.length}{Number.isFinite(low) ? ` · ${shortInr(low)}` : ""}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Who starts when */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-[13px] tracking-[0.1em] !font-normal" style={{ color: "var(--text-tertiary)", fontVariant: "small-caps" }}>
              {activeDay ? `starting ${dayLabel(activeDay)}` : `all of ${activeMonth ? monthLabel(activeMonth, true) : ""}`}
              <span className="tracking-normal"> · {list.length}</span>
            </h3>
            <div className="flex items-center gap-3 text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>
              {activeDay && (
                <button type="button" onClick={() => pickDay(undefined)} className="hover:text-[#ff5100]">Whole month</button>
              )}
              {list.length > 2 && (
                <span className="inline-flex rounded-full border p-0.5" style={{ borderColor: "var(--border)" }} role="group" aria-label="Sort">
                  {(["date", "price"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setSort(s)} aria-pressed={sort === s} className="rounded-full px-2 py-0.5 text-[11.5px]"
                      style={{ background: sort === s ? "var(--bg-surface)" : "transparent", color: sort === s ? "var(--text-primary)" : "var(--text-tertiary)", fontWeight: sort === s ? 600 : 400 }}>
                      {s === "date" ? "Soonest" : "Cheapest"}
                    </button>
                  ))}
                </span>
              )}
            </div>
          </div>
          <ul className="divide-y max-h-[360px] overflow-y-auto pr-1" style={{ borderColor: "var(--border)" }} onMouseLeave={() => !activeDay && setSpan(null)}>
            {list.map((d) => {
              const end = endOf(d);
              const title = d.trek ?? trekName ?? "Trek";
              const showSpan = () => setSpan({ start: d.date, end });
              return (
                <li key={`${d.date}-${d.operator}-${d.trek ?? ""}`} className="flex items-center gap-3 py-2.5" style={{ borderColor: "var(--border)" }}
                  onMouseEnter={showSpan} onFocus={showSpan}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colour(keyOf(d)) }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium" style={{ color: "var(--text-primary)" }}>
                      {dayLabel(d.date)}
                      {end !== d.date && <span className="font-normal whitespace-nowrap" style={{ color: "var(--text-tertiary)" }}> → {shortLabel(end)}</span>}
                    </p>
                    <p className="text-[12.5px]" style={{ color: "var(--text-secondary)" }}>
                      {by === "trek" && d.trekSlug
                        ? <Link href={`/experiences/${d.trekSlug}`} className="hover:text-[#ff5100] underline-offset-2 hover:underline">{d.trek}</Link>
                        : by === "trek" ? d.trek : d.operator}
                      {d.price ? ` · ${inr(d.price)}` : ""}{d.days ? ` · ${d.days} days` : ""}
                      {lowest !== undefined && d.price === lowest && (
                        <span className="ml-1.5 inline-block rounded-full px-1.5 py-px text-[10.5px] font-semibold align-[1px]" style={{ background: "rgba(63,168,119,0.15)", color: "var(--accent-green)" }}>
                          lowest this month
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadIcs(d, title)}
                    aria-label={`Add ${dayLabel(d.date)} with ${d.operator} to your calendar`}
                    title="Add to your calendar"
                    className="shrink-0 p-1.5 rounded-full transition-colors hover:text-[#ff5100]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </button>
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
      )}
    </div>
  );
}
