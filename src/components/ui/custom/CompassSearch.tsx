"use client";

// The site's one search box, powered by Compass.AI (see lib/compassSearch). Results open right under
// the box (no chat pop-up): Compass.AI's picks with a reason each, then instant matches by name.
//   variant "hero"     the home page's bar: results drop down over the hero
//   variant "overlay"  the header's search: the same, in the search window
// The picks block (CompassPicks) is also used on its own by Explore and the map.

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUp, BookOpen, Building2, Loader2, MapPin, MessageCircle, Mountain, Library, X, Info } from "lucide-react";
import { CompassAIMark } from "@/components/ui/custom/BrandMarks";
import { askCompass, COMPASS_GRADIENT } from "@/lib/compass";
import { COMPASS_PROMPTS, PICKS_NOTE, useCompassSearch, type CompassAnswer } from "@/lib/compassSearch";
import type { SearchResult } from "@/app/api/search/route";
import type { ACE } from "@/lib/ace";
import { track } from "@/lib/analytics";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const ICON: Record<SearchResult["type"], typeof MapPin> = { adventure: Mountain, place: MapPin, "trek-guide": BookOpen, operator: Building2, guide: Library, story: BookOpen };

/** Compass.AI's answer: the reply, the picks with their reasons, and where the picks come from */
export function CompassPicks({ answer, onRetry, onPick, linkFor = (slug) => `/experiences/${slug}`, compact = false, idPrefix, activeId }: {
  answer: CompassAnswer;
  onRetry?: () => void;
  onPick?: (slug: string) => void;
  linkFor?: (slug: string) => string;
  compact?: boolean;
  /** For keyboard navigation from the search box: each pick's option id is `${idPrefix}-pick-${i}` */
  idPrefix?: string;
  activeId?: string | null;
}) {
  if (answer.status === "idle") return null;
  return (
    <section aria-live="polite" aria-busy={answer.status === "loading"} className="rounded-2xl p-3"
      style={{ background: "linear-gradient(180deg, rgba(255,81,0,0.08), rgba(255,81,0,0.02))", border: "1px solid rgba(255,125,71,0.28)" }}>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--accent-ink, #ff7d47)" }}>
        <CompassAIMark className="w-3.5 h-3.5" /> Compass.AI picks
        <span className="normal-case tracking-normal font-normal truncate" style={{ color: "var(--text-tertiary)" }}>for “{answer.question}”</span>
      </p>

      {answer.status === "loading" && (
        <div className="mt-2.5 space-y-2" aria-label="Compass.AI is picking">
          <p className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text-secondary)" }}><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading the catalogue for you…</p>
          {[0, 1].map((i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--bg-surface-2)" }} />)}
        </div>
      )}

      {answer.status === "error" && (
        <p className="mt-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          {answer.error} {onRetry && <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink, #ff7d47)" }}>Try again</button>}
        </p>
      )}

      {answer.status === "done" && (
        <>
          {answer.text && <p className={`mt-2 text-[13px] leading-snug ${compact ? "line-clamp-3" : ""}`} style={{ color: "var(--text-secondary)" }}>{answer.text}</p>}
          {answer.picks.length > 0 && (
            <ul className="mt-2.5 space-y-1.5" role="group" aria-label="Compass.AI picks">
              {answer.picks.map((p, i) => {
                const a = p.card;
                const id = idPrefix ? `${idPrefix}-pick-${i}` : undefined;
                return (
                  <li key={p.slug}>
                    <Link id={id} role={idPrefix ? "option" : undefined} aria-selected={id ? activeId === id : undefined}
                      href={linkFor(p.slug)} onClick={() => { track("compass_search_pick", { slug: p.slug }); onPick?.(p.slug); }}
                      className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--bg-surface-2)] aria-selected:bg-[var(--bg-surface-2)]">
                      <span className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--bg-surface-2)" }}>
                        {a?.heroImage && <Image src={a.heroImage} alt="" fill sizes="56px" className="object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                        {a && <span className="block text-[11.5px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{[a.durationDays, a.state].filter(Boolean).join(" · ")}</span>}
                        <span className="block text-[12.5px] leading-snug mt-0.5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{p.reason}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {answer.status !== "loading" && (
        <div className="mt-2.5 pt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px]" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="inline-flex items-start gap-1.5 flex-1 min-w-[200px]" style={{ color: "var(--text-tertiary)" }}>
            <Info className="w-3.5 h-3.5 shrink-0 mt-px" /> {PICKS_NOTE}
          </p>
          {answer.status === "done" && (
            <button type="button" onClick={() => askCompass(answer.question)} className="inline-flex items-center gap-1 font-semibold" style={{ color: "var(--accent-ink, #ff7d47)" }}>
              <MessageCircle className="w-3 h-3" /> Ask a follow-up
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default function CompassSearch({ variant, autoFocus = false, onNavigate, ace, placeholders }: {
  variant: "hero" | "overlay";
  autoFocus?: boolean;
  /** After a result is opened (the header closes its window) */
  onNavigate?: () => void;
  ace?: ACE | null;
  placeholders?: string[];
}) {
  const router = useRouter();
  const s = useCompassSearch({ ace, source: variant });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [ph, setPh] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId().replace(/:/g, "");
  const listId = `${uid}-results`;
  const hero = variant === "hero";
  const q = s.query.trim();

  useEffect(() => { if (autoFocus) { inputRef.current?.focus(); s.warm(); } }, [autoFocus]); // eslint-disable-line react-hooks/exhaustive-deps

  // The placeholder cycles through example trips while nobody is typing
  const prompts = placeholders ?? ["Search or describe a trip…"];
  useEffect(() => {
    if (prompts.length < 2 || open || s.query) return;
    const id = setInterval(() => setPh((i) => i + 1), 3400);
    return () => clearInterval(id);
  }, [prompts.length, open, s.query]);

  // A click outside closes the results (the hero's); the header's window closes itself
  useEffect(() => {
    if (!hero || !open) return;
    const onDown = (e: PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [hero, open]);

  // The hero clips what spills out of it, and the bar sits low in it: the results open upward when
  // there's more room above, and never taller than the room they have (under the navbar)
  const [fit, setFit] = useState<{ up: boolean; max: number }>({ up: false, max: 560 });
  useEffect(() => {
    if (!hero || !open) return;
    const measure = () => {
      const box = rootRef.current?.getBoundingClientRect();
      if (!box) return;
      const clip = rootRef.current?.closest("section")?.getBoundingClientRect();
      const top = Math.max(clip?.top ?? 0, 0) + 76, bottom = Math.min(clip?.bottom ?? window.innerHeight, window.innerHeight) - 12;
      const below = bottom - box.bottom - 8, above = box.top - top - 8;
      const up = below < 340 && above > below;
      setFit({ up, max: Math.max(200, Math.min(560, up ? above : below)) });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => { window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure); };
  }, [hero, open]);

  // Every row the arrow keys move through, in the order they're drawn
  const rows = useMemo(() => {
    const out: { id: string; url?: string; ask?: string }[] = [];
    if (q && s.answer.question !== q) out.push({ id: `${uid}-ask`, ask: q });
    if (s.answer.status === "done") s.answer.picks.forEach((p, i) => out.push({ id: `${uid}-pick-${i}`, url: `/experiences/${p.slug}` }));
    s.matches.groups.forEach((g) => g.items.forEach((r) => out.push({ id: `${uid}-${r.id}`, url: r.url })));
    if (s.matches.adventures > 0) out.push({ id: `${uid}-all`, url: `/explore?q=${encodeURIComponent(q)}` });
    return out;
  }, [q, s.answer, s.matches, uid]);

  const go = (url: string) => { setOpen(false); onNavigate?.(); router.push(url); };
  const submit = (text = s.query) => {
    const t = text.trim();
    if (!t) { inputRef.current?.focus(); return; }
    s.setQuery(t);
    setOpen(true);
    s.ask(t);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { if (open) { e.stopPropagation(); setOpen(false); } return; }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter") return;
    if (e.key === "Enter") {
      const row = rows.find((r) => r.id === active);
      e.preventDefault();
      if (row?.url) go(row.url); else submit();
      return;
    }
    e.preventDefault();
    setOpen(true);
    const i = rows.findIndex((r) => r.id === active);
    const n = e.key === "ArrowDown" ? Math.min(rows.length - 1, i + 1) : Math.max(-1, i - 1);
    const next = n < 0 ? null : rows[n].id;
    setActive(next);
    if (next) document.getElementById(next)?.scrollIntoView({ block: "nearest" });
  };
  useEffect(() => setActive(null), [s.query]);

  const showPanel = open && (q.length > 0 || s.answer.status !== "idle" || !hero);
  const empty = !q;

  const input = (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} role="search"
      className={hero ? "w-full rounded-[18px] p-px transition-shadow duration-300" : "w-full"}
      style={hero ? { background: open ? COMPASS_GRADIENT : "rgba(255,255,255,0.2)", boxShadow: open ? "0 0 0 4px rgba(255,81,0,0.18), 0 12px 40px rgba(0,0,0,0.35)" : "0 12px 40px rgba(0,0,0,0.3)" } : undefined}>
      <div className={hero
        ? "flex items-center gap-2.5 rounded-[17px] pl-3.5 pr-1.5 py-1.5 bg-[rgba(14,12,12,0.86)] sm:bg-[rgba(14,12,12,0.72)] sm:backdrop-blur-[18px]"
        : "flex items-center gap-3 px-4 py-3.5"}
        style={hero ? undefined : { borderBottom: "1px solid var(--border-subtle)" }}>
        <CompassAIMark className="w-4 h-4 shrink-0" style={{ color: "#ff8a5c" }} strokeWidth={2} />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={active ?? undefined}
          aria-autocomplete="list"
          aria-label="Search adventures, places and guides, or describe a trip for Compass.AI"
          value={s.query}
          onChange={(e) => { s.setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); s.warm(); }}
          onKeyDown={onKey}
          placeholder={prompts[ph % prompts.length]}
          enterKeyHint="search"
          autoComplete="off"
          className={hero
            ? "flex-1 min-w-0 bg-transparent text-base sm:text-[15px] py-1 sm:py-1.5 truncate placeholder:text-white/75 focus:placeholder:text-white/45"
            : "flex-1 min-w-0 bg-transparent text-[16px] sm:text-[15px] outline-none"}
          style={hero ? { color: "#fff", caretColor: "#ff5100", outline: "none" } : { color: "var(--text-primary)", caretColor: "#ff5100" }}
        />
        {s.query && (
          <button type="button" onClick={() => { s.clear(); inputRef.current?.focus(); }} aria-label="Clear the search"
            className="w-7 h-7 rounded-full grid place-items-center shrink-0" style={{ color: hero ? "rgba(255,255,255,0.6)" : "var(--text-tertiary)" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button type="submit" aria-label="Ask Compass.AI"
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition duration-200 ${empty ? "opacity-50" : "hover:scale-105 active:scale-95"}`}
          style={{ background: COMPASS_GRADIENT }}>
          {s.answer.status === "loading" ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <ArrowUp className="w-4 h-4 text-white" strokeWidth={2.5} />}
        </button>
      </div>
    </form>
  );

  const panel = showPanel && (
    <div id={listId} role="listbox" aria-label="Search results"
      className={hero
        ? `absolute left-0 right-0 ${fit.up ? "bottom-full mb-2" : "top-full mt-2"} z-[60] rounded-2xl p-2.5 overflow-y-auto shadow-2xl text-left`
        : "p-2.5 max-h-[min(68vh,620px)] overflow-y-auto"}
      style={hero ? { background: "var(--bg-surface)", border: "1px solid var(--border-default)", maxHeight: fit.max } : undefined}>

      {/* Nothing typed: what to try */}
      {empty && s.answer.status === "idle" && (
        <div className="p-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: "var(--text-tertiary)" }}>Try asking Compass.AI</p>
          <div className="flex flex-wrap gap-1.5">
            {COMPASS_PROMPTS.map((p) => (
              <button key={p} type="button" onClick={() => submit(p)} className="text-[12.5px] px-3 py-1.5 rounded-full transition-colors hover:text-[var(--text-primary)]"
                style={{ background: "var(--bg-surface-2)", color: "var(--text-secondary)" }}>{p}</button>
            ))}
          </div>
          <p className="text-[12px] mt-3" style={{ color: "var(--text-tertiary)" }}>Or type a trek, a place, an operator or a guide.</p>
        </div>
      )}

      {/* A name or a few words: offer to ask Compass.AI, the top row */}
      {q && s.answer.question !== q && (
        <button id={`${uid}-ask`} role="option" aria-selected={active === `${uid}-ask`} type="button" onClick={() => submit()}
          className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-surface-2)] aria-selected:bg-[var(--bg-surface-2)]">
          <span className="w-8 h-8 rounded-full grid place-items-center shrink-0" style={{ background: COMPASS_GRADIENT }}><CompassAIMark className="w-4 h-4 text-white" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>Ask Compass.AI: “{q}”</span>
            <span className="block text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>Picks matched to your trip, with a reason for each · Enter</span>
          </span>
        </button>
      )}

      {s.answer.status !== "idle" && (
        <div className="mt-1.5">
          <CompassPicks answer={s.answer} onRetry={() => s.ask(s.answer.question)} onPick={() => { setOpen(false); onNavigate?.(); }} compact idPrefix={uid} activeId={active} />
        </div>
      )}

      {/* Instant matches by name */}
      {q && !s.indexReady && <p className="flex items-center gap-2 px-2.5 py-3 text-[12.5px]" style={{ color: "var(--text-tertiary)" }}><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…</p>}
      {q && s.indexReady && s.matches.groups.map((g) => (
        <div key={g.type} className="mt-2.5">
          <p className="px-2.5 mb-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-tertiary)" }}>{g.label}</p>
          {g.items.map((r) => {
            const Icon = ICON[r.type];
            const id = `${uid}-${r.id}`;
            return (
              <Link key={r.id} id={id} role="option" aria-selected={active === id} href={r.url}
                onClick={() => { track("compass_search_open", { type: r.type }); setOpen(false); onNavigate?.(); }}
                className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-[var(--bg-surface-2)] aria-selected:bg-[var(--bg-surface-2)]">
                <span className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 grid place-items-center" style={{ background: "var(--bg-surface-2)" }}>
                  {r.image ? <Image src={r.image} alt="" fill sizes="36px" className="object-cover" /> : <Icon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{r.title}</span>
                  <span className="block text-[11.5px] truncate" style={{ color: "var(--text-tertiary)" }}>
                    {r.type === "adventure" && r.meta ? [r.subtitle, r.meta.days, r.meta.difficulty, r.meta.price ? `from ${inr(r.meta.price)}` : null].filter(Boolean).join(" · ") : r.subtitle}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ))}
      {q && s.indexReady && s.matches.total === 0 && s.answer.status === "idle" && (
        <p className="px-2.5 py-3 text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>Nothing by that name. Press Enter and Compass.AI will look for the closest trips.</p>
      )}
      {q && s.matches.adventures > 0 && (
        <Link id={`${uid}-all`} role="option" aria-selected={active === `${uid}-all`} href={`/explore?q=${encodeURIComponent(q)}`} onClick={() => { setOpen(false); onNavigate?.(); }}
          className="mt-2 flex items-center justify-between rounded-xl px-2.5 py-2 text-[12.5px] font-semibold transition-colors hover:bg-[var(--bg-surface-2)] aria-selected:bg-[var(--bg-surface-2)]"
          style={{ color: "var(--accent-ink, #ff7d47)" }}>
          See all {s.matches.adventures} matching {s.matches.adventures === 1 ? "adventure" : "adventures"} on Explore <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );

  return (
    <div ref={rootRef} className={hero ? "relative w-full" : "w-full"}>
      {input}
      {panel}
    </div>
  );
}
