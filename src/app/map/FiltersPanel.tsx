"use client";

import { RotateCcw } from "lucide-react";
import type { AdventureType, Region, Difficulty, Duration } from "@/lib/data";
import { toggleSelection, REGION_GROUPS } from "@/lib/filterOptions";
import { GENRES, difficultyColor } from "./mapShared";

// The finer filters. Genre, season, fit and verified live on the map itself; these sit
// one tap away under Filters.

export interface FineFilters {
  regions: Region[];
  subRegions: string[];
  types: AdventureType[];
  difficulties: Difficulty[];
  durations: Duration[];
}

export const NO_FILTERS: FineFilters = { regions: [], subRegions: [], types: [], difficulties: [], durations: [] };

export function countFilters(f: FineFilters) {
  return f.regions.length + f.subRegions.length + f.types.length + f.difficulties.length + f.durations.length;
}

const DIFFICULTIES: Difficulty[] = ["Easy", "Moderate", "Hard", "Advanced", "Extreme"];
const DURATIONS: Duration[] = ["Weekend", "3–5 days", "7+ days"];

function Chip({ on, color = "#ff7d47", onClick, children }: { on: boolean; color?: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
      style={{ background: on ? `${color}22` : "rgba(255,255,255,0.04)", color: on ? color : "rgba(255,255,255,0.55)", border: `1px solid ${on ? `${color}55` : "rgba(255,255,255,0.07)"}` }}
    >
      {children}
    </button>
  );
}

export default function FiltersPanel({ value, onChange }: { value: FineFilters; onChange: (f: FineFilters) => void }) {
  const set = <K extends keyof FineFilters>(k: K) => (v: FineFilters[K]) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <section>
        <p className="tm-label">Region</p>
        <div className="space-y-2">
          {REGION_GROUPS.map((rg) => (
            <div key={rg.name} className="flex flex-wrap items-center gap-1.5">
              <Chip on={value.regions.includes(rg.name)} onClick={() => toggleSelection(value.regions, rg.name, set("regions"))}>{rg.name}</Chip>
              {value.regions.includes(rg.name) && rg.subRegions.map((sr) => (
                <Chip key={sr} on={value.subRegions.includes(sr)} color="#ffb37a" onClick={() => toggleSelection(value.subRegions, sr, set("subRegions"))}>{sr}</Chip>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="tm-label">Activity</p>
        <div className="space-y-2">
          {GENRES.map((g) => (
            <div key={g.key} className="flex flex-wrap gap-1.5">
              {g.types.map((t) => (
                <Chip key={t} on={value.types.includes(t)} color={g.color} onClick={() => toggleSelection(value.types, t, set("types"))}>{t}</Chip>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="tm-label">Difficulty</p>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((d) => (
            <Chip key={d} on={value.difficulties.includes(d)} color={difficultyColor(d)} onClick={() => toggleSelection(value.difficulties, d, set("difficulties"))}>{d}</Chip>
          ))}
        </div>
      </section>

      <section>
        <p className="tm-label">Duration</p>
        <div className="flex flex-wrap gap-1.5">
          {DURATIONS.map((d) => (
            <Chip key={d} on={value.durations.includes(d)} onClick={() => toggleSelection(value.durations, d, set("durations"))}>{d}</Chip>
          ))}
        </div>
      </section>

      {countFilters(value) > 0 && (
        <button type="button" onClick={() => onChange(NO_FILTERS)} className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-white/50 hover:text-white">
          <RotateCcw className="w-3 h-3" /> Clear these filters
        </button>
      )}
    </div>
  );
}
