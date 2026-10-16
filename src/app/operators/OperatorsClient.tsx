"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, MotionConfig, LayoutGroup, animate, useInView, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Search, ShieldCheck, Star, X, ChevronDown } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

export type OperatorCardData = {
  id: string;
  company_name: string;
  website: string | null;
  email: string;
  logo_url?: string | null;
  adventureSlugs: string[];
  prices: Record<string, string>;
  verified: boolean;
  /** Google rating, for verified operators */
  rating: number | null;
  adventureDetails: {
    slug: string;
    name: string;
    type: string;
    state: string;
    heroImage: string;
  }[];
};

type Stats = { verified: number; adventures: number; states: number; rating: number };

type Props = {
  cards: OperatorCardData[];
  allTypes: string[];
  allStates: string[];
  stats: Stats;
  isOperator: boolean;
};

type Sort = "top" | "most" | "price" | "name";
const SORTS: { id: Sort; label: string }[] = [
  { id: "top", label: "Top rated" },
  { id: "most", label: "Most adventures" },
  { id: "price", label: "Lowest price" },
  { id: "name", label: "A to Z" },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const splitStates = (s: string) => s.split(/\s*[/,]\s*/).map((x) => x.trim()).filter(Boolean);
const rupees = (s: string) => { const n = parseInt(s.replace(/[^\d]/g, ""), 10); return isNaN(n) ? null : n; };
const minPrice = (op: OperatorCardData) => {
  const ns = Object.values(op.prices).map(rupees).filter((n): n is number => n !== null);
  return ns.length ? Math.min(...ns) : null;
};

/** Counts up to `to` once it scrolls into view */
function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(to);
  const text = useTransform(mv, (v) => v.toFixed(decimals));
  useEffect(() => {
    if (!inView) return;
    mv.set(0);
    const c = animate(mv, to, { duration: 1.3, ease: EASE });
    return () => c.stop();
  }, [inView, to, mv]);
  return <motion.span ref={ref}>{text}</motion.span>;
}

export default function OperatorsClient({ cards, allTypes, allStates, stats, isOperator }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [state, setState] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("top");

  const typeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    cards.forEach((c) => new Set(c.adventureDetails.map((a) => a.type)).forEach((t) => { m[t] = (m[t] ?? 0) + 1; }));
    return m;
  }, [cards]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = cards.filter((op) => {
      if (verifiedOnly && !op.verified) return false;
      if (type !== "all" && !op.adventureDetails.some((a) => a.type === type)) return false;
      if (state !== "all" && !op.adventureDetails.some((a) => splitStates(a.state).includes(state))) return false;
      if (q && !op.company_name.toLowerCase().includes(q) && !op.adventureDetails.some((a) => a.name.toLowerCase().includes(q))) return false;
      return true;
    });
    const byVerified = (a: OperatorCardData, b: OperatorCardData) => Number(b.verified) - Number(a.verified);
    return list.sort((a, b) => {
      if (sort === "name") return a.company_name.localeCompare(b.company_name);
      if (sort === "most") return b.adventureDetails.length - a.adventureDetails.length || byVerified(a, b);
      if (sort === "price") return (minPrice(a) ?? Infinity) - (minPrice(b) ?? Infinity) || byVerified(a, b);
      return byVerified(a, b) || (b.rating ?? 0) - (a.rating ?? 0) || b.adventureDetails.length - a.adventureDetails.length;
    });
  }, [cards, query, type, state, verifiedOnly, sort]);

  const filtersOn = query || type !== "all" || state !== "all" || verifiedOnly;
  function clearAll() { setQuery(""); setType("all"); setState("all"); setVerifiedOnly(false); }

  return (
    <MotionConfig reducedMotion="user">
      {/* ── Numbers ── */}
      <section className="px-5 lg:px-8 pb-10">
        {/* 1px gaps over a border-coloured ground draw the dividers */}
        <dl className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--border-subtle)" }}>
          {[
            { v: stats.verified, d: 0, label: "Verified operators" },
            { v: stats.adventures, d: 0, label: "Adventures they run" },
            { v: stats.states, d: 0, label: "States covered" },
            { v: stats.rating, d: 1, label: "Average Google rating", star: true },
          ].map((s) => (
            <div key={s.label} className="px-5 py-5 sm:px-7 sm:py-6" style={{ background: "var(--bg-surface)" }}>
              <dd className="flex items-center gap-1.5 text-3xl sm:text-4xl font-black tabular-nums" style={{ color: "var(--text-primary)" }}>
                <CountUp to={s.v} decimals={s.d} />
                {s.star && <Star className="w-6 h-6 fill-[#f5a524] text-[#f5a524]" />}
              </dd>
              <dt className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Directory ── */}
      <section className="px-5 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <label className="relative flex-1 min-w-0">
                <span className="sr-only">Search operators or adventures</span>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
                <input
                  type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search operators or adventures, e.g. Hampta Pass"
                  className="w-full h-12 pl-11 pr-4 rounded-xl text-[15px] outline-none transition-colors focus:border-[#ff5100]"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                />
              </label>
              <div className="flex gap-3 flex-wrap">
                <SelectBox label="Location" value={state} onChange={setState} options={[{ id: "all", label: "All locations" }, ...allStates.map((s) => ({ id: s, label: s }))]} />
                <SelectBox label="Sort" value={sort} onChange={(v) => setSort(v as Sort)} options={SORTS} />
                <button type="button" role="switch" aria-checked={verifiedOnly} onClick={() => setVerifiedOnly((v) => !v)}
                  className="h-12 inline-flex items-center gap-2.5 px-4 rounded-xl text-[14px] font-semibold transition-colors"
                  style={{ background: verifiedOnly ? "var(--accent-green-soft)" : "var(--bg-card)", border: `1px solid ${verifiedOnly ? "var(--accent-green-border)" : "var(--border-default)"}`, color: verifiedOnly ? "var(--accent-green)" : "var(--text-secondary)" }}>
                  <span className="relative w-8 h-[18px] rounded-full transition-colors" style={{ background: verifiedOnly ? "var(--accent-green)" : "var(--border-default)" }}>
                    <motion.span className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow" animate={{ left: verifiedOnly ? 16 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  </span>
                  Verified only
                </button>
              </div>
            </div>

            {/* Type chips */}
            <LayoutGroup id="op-types">
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap" style={{ scrollbarWidth: "none" }}>
                {[{ t: "all", n: cards.length }, ...allTypes.map((t) => ({ t, n: typeCounts[t] ?? 0 }))].map(({ t, n }) => {
                  const on = type === t;
                  return (
                    <button key={t} type="button" onClick={() => setType(t)} aria-pressed={on}
                      className="relative shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-[14px] font-semibold"
                      style={{ color: on ? "#fff" : "var(--text-secondary)", border: on ? "1px solid transparent" : "1px solid var(--border-default)" }}>
                      {on && <motion.span layoutId="op-type-pill" className="absolute inset-0 rounded-full" style={{ background: "#ff5100" }} transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                      <span className="relative flex items-center gap-2">
                        {t !== "all" && ADVENTURE_TYPE_ICONS[t]?.(15)}
                        {t === "all" ? "All operators" : t}
                        <span className="text-[12px] tabular-nums" style={{ opacity: 0.7 }}>{n}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            <div className="flex items-center justify-between text-[14px]" aria-live="polite">
              <span style={{ color: "var(--text-tertiary)" }}>
                Showing <strong style={{ color: "var(--text-primary)" }}>{shown.length}</strong> {shown.length === 1 ? "operator" : "operators"}
              </span>
              {filtersOn && (
                <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 font-semibold" style={{ color: "#e04800" }}>
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Cards */}
          {shown.length === 0 ? (
            <div className="text-center py-20 rounded-2xl" style={{ border: "1px dashed var(--border-default)" }}>
              <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>No operators match that</p>
              <p className="text-[14px] mt-1" style={{ color: "var(--text-tertiary)" }}>Try another adventure type or location.</p>
              <button type="button" onClick={clearAll} className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white" style={{ background: "#ff5100" }}>
                Show all operators
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout" initial={false}>
                {shown.map((op) => <OperatorCard key={op.id} op={op} />)}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── For operators ── */}
      <section className="px-5 lg:px-8 pb-24">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-14 grid md:grid-cols-[minmax(0,1fr)_auto] gap-8 items-center"
          style={{ background: "linear-gradient(135deg, #1c140f, #2a1810)", color: "#fff" }}>
          <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,81,0,0.35), transparent 70%)" }} />
          <div className="relative min-w-0">
            <p className="font-mono text-[11px] font-bold tracking-[0.24em] uppercase mb-3" style={{ color: "#ff8a4c" }}>For operators</p>
            <h2 className="text-3xl sm:text-4xl leading-tight mb-3" style={{ color: "#fff", textWrap: "balance" }}>Run adventures in India?</h2>
            <p className="text-[15px] sm:text-base leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.75)" }}>
              List your company and your trips, and reach travellers looking for exactly what you run. Once our team has reviewed you, you get the Verified badge.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            {isOperator ? (
              <Link href="/auth/operator-dashboard" className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] text-white" style={{ background: "#ff5100" }}>
                Manage your listings <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link href="/auth/operator-signup" className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] text-white" style={{ background: "#ff5100" }}>
                  List your company <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/auth/login?role=operator" className="inline-flex items-center px-5 py-3.5 rounded-xl font-semibold text-[15px]" style={{ color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
                  Operator log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

/* ── One operator ─────────────────────────────────────────────── */

function OperatorCard({ op }: { op: OperatorCardData }) {
  const [open, setOpen] = useState(false);
  const imgs = [...new Set(op.adventureDetails.map((a) => a.heroImage).filter(Boolean))].slice(0, 3);
  const types = [...new Set(op.adventureDetails.map((a) => a.type))];
  const states = [...new Set(op.adventureDetails.flatMap((a) => splitStates(a.state)))];
  const from = minPrice(op);
  const list = open ? op.adventureDetails : op.adventureDetails.slice(0, 3);
  const extra = op.adventureDetails.length - 3;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="group flex flex-col rounded-2xl overflow-hidden transition-shadow hover:shadow-[0_24px_48px_-24px_rgba(var(--shadow-color),0.45)]"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      {/* Photo mosaic of their own adventures */}
      <div className="relative h-40 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,81,0,0.18), rgba(14,124,134,0.18))" }}>
        {imgs.length > 0 && (
          <div className={`absolute inset-0 grid gap-0.5 ${imgs.length >= 3 ? "grid-cols-[2fr_1fr] grid-rows-2" : imgs.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {imgs.map((src, i) => (
              <div key={src} className={`relative overflow-hidden ${imgs.length >= 3 && i === 0 ? "row-span-2" : ""}`}>
                <Image src={src} alt="" fill sizes="(min-width: 1280px) 260px, (min-width: 640px) 45vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            ))}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent 50%)" }} />
        {op.verified && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold text-white" style={{ background: "rgba(21,128,61,0.92)" }}>
            <ShieldCheck className="w-3.5 h-3.5" /> Verified
          </span>
        )}
      </div>

      <div className="relative flex-1 flex flex-col px-5 pb-5">
        {/* Monogram or logo, overlapping the photos */}
        <div className="relative -mt-7 mb-3 w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black shadow-md"
          style={{ background: "var(--bg-surface)", border: "3px solid var(--bg-surface)", color: "#ff5100", fontFamily: "var(--font-display), Georgia, serif" }}>
          {op.logo_url ? <Image src={op.logo_url} alt="" fill sizes="56px" className="object-contain p-1" /> : op.company_name.charAt(0).toUpperCase()}
        </div>

        <h2 className="text-[21px] leading-tight" style={{ color: "var(--text-primary)" }}>{op.company_name}</h2>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px]" style={{ color: "var(--text-tertiary)" }}>
          {op.rating ? (
            <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "var(--text-primary)" }}>
              <Star className="w-3.5 h-3.5 fill-[#f5a524] text-[#f5a524]" />{op.rating.toFixed(1)}<span className="font-normal" style={{ color: "var(--text-tertiary)" }}>Google</span>
            </span>
          ) : !op.verified ? <span>Not yet verified</span> : null}
          {op.adventureDetails.length > 0 && <span>{op.adventureDetails.length} {op.adventureDetails.length === 1 ? "adventure" : "adventures"}</span>}
          {from !== null && <span>from <strong style={{ color: "var(--text-primary)" }}>₹{from.toLocaleString("en-IN")}</strong></span>}
        </p>

        {types.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {types.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold" style={{ background: "rgba(255,81,0,0.09)", color: "#d94600" }}>
                {ADVENTURE_TYPE_ICONS[t]?.(12)}{t}
              </span>
            ))}
          </div>
        )}
        {states.length > 0 && (
          <p className="mt-2 text-[13px] leading-snug" style={{ color: "var(--text-tertiary)" }}>
            {states.slice(0, 3).join(" · ")}{states.length > 3 ? ` · +${states.length - 3} more` : ""}
          </p>
        )}

        {/* Their adventures */}
        {op.adventureDetails.length > 0 ? (
          <motion.ul layout className="mt-4 pt-3 space-y-0.5 flex-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <AnimatePresence initial={false}>
              {list.map((a) => (
                <motion.li key={a.slug} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                  <Link href={`/experiences/${a.slug}`} className="flex items-center justify-between gap-3 py-1.5 rounded-lg text-[14px] group/row">
                    <span className="truncate transition-colors group-hover/row:text-[#ff5100]" style={{ color: "var(--text-secondary)" }}>{a.name}</span>
                    {op.prices[a.slug] && <span className="shrink-0 text-[13px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>{op.prices[a.slug]}</span>}
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <p className="mt-4 pt-3 flex-1 text-[14px] italic" style={{ color: "var(--text-tertiary)", borderTop: "1px solid var(--border-subtle)" }}>Listings under review.</p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          {extra > 0 ? (
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex items-center gap-1 text-[13.5px] font-semibold" style={{ color: "#e04800" }}>
              {open ? "Show fewer" : `Show all ${op.adventureDetails.length}`}
              <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: open ? "rotate(180deg)" : undefined }} />
            </button>
          ) : <span />}
          {op.website && (
            <a href={op.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13.5px] font-semibold transition-colors hover:text-[#ff5100]" style={{ color: "var(--text-secondary)" }}>
              Website <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* A labelled native select, styled to match */
function SelectBox({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) {
  return (
    <label className="relative h-12 flex-1 md:flex-none inline-flex items-center rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
      <span className="pl-4 text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-full flex-1 min-w-0 appearance-none bg-transparent pl-2 pr-9 text-[14px] font-semibold outline-none cursor-pointer"
        style={{ color: "var(--text-primary)" }}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-3 w-4 h-4 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
    </label>
  );
}
