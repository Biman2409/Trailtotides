"use client";

import { useEffect, useState } from "react";
import { Play, Pause, CalendarDays } from "lucide-react";
import type { Adventure, Month } from "@/lib/data";
import { MONTHS, currentMonthIndexIST } from "@/lib/homeCuration";

// Pick a month and the map shows what's in season then: the rest fade. Play steps through
// the year so you can watch seasons move across the country. Bars show how much is on.

const STEP_MS = 1300;

export default function SeasonScrubber({
  month,
  onChange,
  adventures,
}: {
  month: Month | null;
  onChange: (m: Month | null) => void;
  adventures: Adventure[];
}) {
  const [playing, setPlaying] = useState(false);
  const counts = MONTHS.map((m) => adventures.filter((a) => a.bestMonths.includes(m)).length);
  const max = Math.max(1, ...counts);
  const now = MONTHS[currentMonthIndexIST()];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      onChange(MONTHS[(MONTHS.indexOf(month ?? now) + 1) % 12]);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [playing, month, now, onChange]);

  return (
    <div className="tm-glass rounded-2xl px-2 py-1.5 flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => { if (!playing && !month) onChange(now); setPlaying((p) => !p); }}
        aria-label={playing ? "Pause the seasons" : "Play through the year"}
        className="w-8 h-8 rounded-xl grid place-items-center shrink-0 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <div className="flex items-end gap-[3px]" role="group" aria-label="In season in">
        {MONTHS.map((m, i) => {
          const on = month === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => { setPlaying(false); onChange(on ? null : m); }}
              aria-pressed={on}
              title={`${counts[i]} in season in ${m}`}
              className="group flex flex-col items-center gap-1 w-[19px] sm:w-[30px] pt-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="w-[5px] rounded-full transition-all duration-300"
                style={{ height: 4 + (counts[i] / max) * 16, background: on ? "#ff7d47" : m === now ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)", boxShadow: on ? "0 0 10px rgba(255,125,71,0.7)" : "none" }} />
              <span className={`text-[9.5px] font-bold leading-none pb-1 ${on ? "text-[#ff9a66]" : m === now ? "text-white/70" : "text-white/35"}`}>{m.slice(0, 1)}<span className="hidden sm:inline">{m.slice(1)}</span></span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => { setPlaying(false); onChange(month ? null : now); }}
        aria-label={month ? "Any time of year" : "In season now"}
        className={`h-8 px-2 sm:px-2.5 rounded-xl text-[11px] font-semibold shrink-0 inline-flex items-center gap-1 transition-colors ${month ? "text-white/60 hover:text-white hover:bg-white/10" : "text-[#ff9a66] bg-[rgba(255,81,0,0.12)]"}`}
      >
        <CalendarDays className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{month ? "Any time" : "Now"}</span>
      </button>
    </div>
  );
}
