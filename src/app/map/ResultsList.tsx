"use client";

import Image from "next/image";
import { BadgeCheck, Sparkles, GitCompareArrows, Check, MapPinned } from "lucide-react";
import type { Adventure, Month } from "@/lib/data";
import { useCompare } from "@/contexts/CompareContext";
import { difficultyOf, difficultyColor, verifiedOperators, priceFrom, formatINR, inSeason, type Fit } from "./mapShared";

// What's in view, as a list you can scan: fit, season, verified operators and price on every row.

function Row({ a, fit, month, active, onPick, onHover }: {
  a: Adventure; fit: Fit | null | undefined; month: Month | null; active: boolean; onPick: (slug: string) => void; onHover: (slug: string | null) => void;
}) {
  const { isSelected, add, remove, isFull } = useCompare();
  const diff = difficultyOf(a);
  // Same colour as the row's pin on the map
  const c = difficultyColor(diff);
  const v = verifiedOperators(a).length;
  const price = priceFrom(a);
  const off = !inSeason(a, month);
  const comparing = isSelected(a.id);

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onPick(a.slug)}
        onMouseEnter={() => onHover(a.slug)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(a.slug)}
        onBlur={() => onHover(null)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(a.slug); } }}
        className={`tm-row group ${active ? "is-active" : ""} ${off ? "is-off" : ""}`}
        style={{ "--g": c } as React.CSSProperties}
      >
        <span className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
          <Image src={a.heroImage} alt="" fill className="object-cover" sizes="56px" unoptimized />
          {fit && <span className="absolute bottom-1 left-1 text-[9px] font-black px-1 rounded" style={{ background: "rgba(11,13,16,0.85)", color: fit.bucket.color }}>{fit.score}</span>}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c, boxShadow: `0 0 6px ${c}88` }} />
            <span className="text-[13px] font-semibold text-white/90 truncate">{a.name}</span>
          </span>
          <span className="block text-[10.5px] text-white/40 truncate mt-0.5">
            {a.type} · {a.durationDays} · <span style={{ color: difficultyColor(diff) }}>{diff}</span>
          </span>
          <span className="flex items-center gap-2 mt-1 text-[10.5px]">
            {fit && <span className="font-semibold" style={{ color: fit.bucket.color }}>{fit.bucket.label}</span>}
            {v > 0 && <span className="inline-flex items-center gap-0.5 text-[#6ff0e0]/80"><BadgeCheck className="w-3 h-3" />{v}</span>}
            {price !== null && <span className="text-white/55">from <b className="text-white/85">{formatINR(price)}</b></span>}
            {off && month && <span className="text-white/30">Off-season</span>}
          </span>
        </span>
        <button
          type="button"
          aria-label={comparing ? `Remove ${a.name} from compare` : `Compare ${a.name}`}
          aria-pressed={comparing}
          disabled={!comparing && isFull}
          onClick={(e) => { e.stopPropagation(); if (comparing) remove(a.id); else add(a); }}
          className={`tm-cmp ${comparing ? "is-on" : ""}`}
          title={comparing ? "Comparing" : isFull ? "Compare is full (3)" : "Add to compare"}
        >
          {comparing ? <Check className="w-3.5 h-3.5" /> : <GitCompareArrows className="w-3.5 h-3.5" />}
        </button>
      </div>
    </li>
  );
}

export default function ResultsList({
  list,
  picks,
  fits,
  month,
  selected,
  matches,
  onPick,
  onHover,
  onShowAll,
  onClear,
}: {
  list: Adventure[];
  picks: Adventure[];
  fits: Map<string, Fit | null>;
  month: Month | null;
  selected: string | null;
  /** How many adventures match the filters anywhere on the map */
  matches: number;
  onPick: (slug: string) => void;
  onHover: (slug: string | null) => void;
  onShowAll: () => void;
  onClear: () => void;
}) {
  const pickSet = new Set(picks.map((p) => p.slug));
  const rest = list.filter((a) => !pickSet.has(a.slug));
  const row = (a: Adventure) => <Row key={a.slug} a={a} fit={fits.get(a.slug)} month={month} active={selected === a.slug} onPick={onPick} onHover={onHover} />;
  return (
    <div className="space-y-4">
      {picks.length > 0 && (
        <section>
          <p className="tm-label flex items-center gap-1.5 !text-[#ffb37a]"><Sparkles className="w-3 h-3" /> Picked for you by Compass</p>
          <ul className="space-y-1.5">{picks.map(row)}</ul>
        </section>
      )}
      <section>
        {picks.length > 0 && <p className="tm-label">Also in view</p>}
        {rest.length ? (
          <ul className="space-y-1.5">{rest.map(row)}</ul>
        ) : matches > 0 ? (
          // Matches exist, just not here: say so and take them there
          <div className="py-6 text-center">
            <p className="text-[12.5px] text-white/55">Nothing in this part of the map.</p>
            <button type="button" onClick={onShowAll} className="mt-3 tm-btn px-4 mx-auto">
              <MapPinned className="w-3.5 h-3.5" /> Show all {matches} match{matches > 1 ? "es" : ""}
            </button>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-[12.5px] text-white/55">No adventures match these filters.</p>
            <button type="button" onClick={onClear} className="mt-3 tm-btn px-4 mx-auto">Clear filters</button>
          </div>
        )}
      </section>
    </div>
  );
}
