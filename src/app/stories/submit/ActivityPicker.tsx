"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import { STORY_ACTIVITY_GROUPS } from "@/lib/storyView";

/**
 * A searchable list of every adventure type, grouped Earth / Water / Snow / Air.
 * Types we don't list trips for yet are still pickable, marked "Soon".
 * Keyboard: type to filter, ↑ ↓ to move, Enter to pick, Esc to close.
 */
export default function ActivityPicker({ id, value, onChange, live, invalid, describedBy }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  /** Types that have trips on the site today */
  live: string[];
  invalid?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const liveSet = useMemo(() => new Set(live), [live]);

  // Groups narrowed to the search, plus a flat list for keyboard moves
  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    return STORY_ACTIVITY_GROUPS
      .map((g) => ({ label: g.label, types: g.types.filter((t) => !term || t.toLowerCase().includes(term) || g.label.toLowerCase().includes(term)) }))
      .filter((g) => g.types.length);
  }, [q]);
  const flat = useMemo(() => groups.flatMap((g) => g.types as readonly string[]), [groups]);

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) { setOpen(false); setQ(""); } };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  // Keep the highlighted row in view while arrowing through
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function pick(t: string) {
    onChange(t);
    setOpen(false);
    setQ("");
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { if (open && flat[active]) { e.preventDefault(); pick(flat[active]); } }
    else if (e.key === "Escape") { setOpen(false); setQ(""); }
  }

  let i = -1;
  return (
    <div ref={wrap} className="relative">
      {value && !open ? (
        // The choice, with a way to change or clear it
        <div className="flex items-center gap-2 rounded-xl pl-3 pr-1.5 py-1.5 border" style={{ background: "var(--bg-card)", borderColor: invalid ? "rgba(239,68,68,0.6)" : "var(--border-subtle)" }}>
          <span className="inline-flex items-center gap-2 h-9 px-3 rounded-full text-[14px] font-semibold text-white" style={{ background: "#ff5100" }}>
            {ADVENTURE_TYPE_ICONS[value]?.(14)}{value}
          </span>
          {!liveSet.has(value) && <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>No trips listed yet, stories welcome</span>}
          <button type="button" onClick={() => { setOpen(true); setTimeout(() => input.current?.focus(), 0); }}
            className="ml-auto text-[13px] font-semibold px-3 py-2 rounded-lg hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-secondary)" }}>
            Change
          </button>
          <button type="button" aria-label="Clear trip type" onClick={() => onChange("")}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-tertiary)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
          <input
            ref={input}
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && flat[active] ? `${listId}-${active}` : undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            autoComplete="off"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
            placeholder="Search: trekking, diving, skiing…"
            className="w-full rounded-xl pl-10 pr-10 py-3 text-[15px] border focus:outline-none focus:border-[#ff5100]/60 focus:ring-2 focus:ring-[#ff5100]/15 transition-all"
            style={{ background: "var(--bg-card)", color: "var(--text-primary)", borderColor: invalid ? "rgba(239,68,68,0.6)" : "var(--border-subtle)" }}
          />
          <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} />
        </div>
      )}

      {open && (
        <ul ref={list} id={listId} role="listbox" aria-label="Trip types"
          className="absolute z-30 left-0 right-0 mt-2 max-h-[320px] overflow-y-auto rounded-xl py-1.5 shadow-2xl"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {flat.length === 0 && (
            <li className="px-4 py-3 text-[13.5px]" style={{ color: "var(--text-tertiary)" }}>
              No match. Pick the closest one; you can say more in the story.
            </li>
          )}
          {groups.map((g) => (
            <li key={g.label} role="presentation">
              <p className="px-4 pt-2.5 pb-1 text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>{g.label}</p>
              <ul role="presentation">
                {g.types.map((t) => {
                  i += 1;
                  const idx = i;
                  const on = value === t;
                  return (
                    <li key={t} id={`${listId}-${idx}`} data-i={idx} role="option" aria-selected={on}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(t)}
                      onMouseEnter={() => setActive(idx)}
                      className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-[14px]"
                      style={{ background: idx === active ? "var(--bg-card-hover)" : "transparent", color: on ? "var(--accent-ink)" : "var(--text-primary)", fontWeight: on ? 600 : 500 }}>
                      <span className="w-5 flex justify-center" style={{ color: "var(--accent-ink)" }}>{ADVENTURE_TYPE_ICONS[t]?.(15)}</span>
                      {t}
                      {!liveSet.has(t) && (
                        <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full" style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}>Soon</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
