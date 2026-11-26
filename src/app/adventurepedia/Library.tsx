"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Clock, Search, X, CornerDownRight, BookOpen, ListChecks, Gauge, Compass } from "lucide-react";
import type { Guide, SearchEntry, Topic } from "@/lib/adventurepedia";
import type { Element } from "@/lib/activityGuides";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import { GuideIcon, serif } from "./blocks";
import { useRead } from "./readState";

export interface GuideCard {
  slug: string; title: string; short: string; summary: string; topic: Topic; icon: Guide["icon"];
  featured: boolean; minutes: number; sections: number;
}
/** One stop on the reading path: a guide, an activity page or a tool */
export interface PathStep { href: string; title: string; why: string; minutes?: number; icon: Guide["icon"] }

const href = (slug: string, section?: string) => `/adventurepedia/${slug}${section ? `#${section}` : ""}`;
const suggestHref = (q: string) => `/contact?topic=${encodeURIComponent("Suggest a guide")}&message=${encodeURIComponent(q ? `I searched Adventurepedia for "${q}" and couldn't find what I needed. ` : "")}`;

// Words people search with that the guides spell differently
const ALIASES: Record<string, string[]> = {
  ams: ["altitude"], hape: ["hape", "lungs"], hace: ["hace", "brain"], diamox: ["acetazolamide"],
  packing: ["pack"], kit: ["pack", "kit"], shoes: ["shoes"], boots: ["shoes"], gear: ["pack", "layer"],
  rain: ["monsoon", "rain"], snow: ["snow", "winter"], cold: ["cold", "winter", "layer", "hypothermia"],
  gps: ["gpx", "gps"], map: ["map", "gpx"], signal: ["signal", "satellite"], sos: ["emergency", "rescue"],
  bike: ["motorcycle", "ride", "bike"], rafting: ["rapid", "raft"], training: ["fit", "training"],
  visa: ["passport", "permit"], toilet: ["toilet"], garbage: ["waste", "rubbish"], doctor: ["medical", "doctor"],
  river: ["river", "stream"], rivers: ["river", "stream"], crossing: ["cross"], wear: ["wear", "layer", "cloth"],
  kids: ["children", "child"], kid: ["children", "child"], child: ["children"], family: ["children", "families"],
  senior: ["older"], seniors: ["older"], elderly: ["older"], old: ["older"], age: ["older", "age"],
  female: ["women"], woman: ["women"], girls: ["women"], ladies: ["women"], period: ["period", "menstrual"], periods: ["period", "menstrual"],
  solo: ["solo", "alone"], alone: ["solo", "alone"], dog: ["dog", "rabies"], dogs: ["dog", "rabies"], snake: ["snake"], snakes: ["snake"],
  bear: ["bear"], bears: ["bear"], budget: ["budget", "cost", "price"], cheap: ["cost", "budget"], money: ["cost", "budget"], price: ["cost", "price"],
  veg: ["vegetarian"], vegan: ["vegan", "vegetarian"], jain: ["jain", "vegetarian"], shower: ["clean", "wash"], bath: ["clean", "wash"],
  tent: ["tent"], camping: ["camp", "tent"], charging: ["power bank", "charging"], phone: ["phone", "signal"],
  scuba: ["diving", "dive"], frostbite: ["frostbite"], hypothermia: ["hypothermia"], tip: ["tip", "tipping"], tipping: ["tip", "tipping"],
};
/** How much an alias match counts next to the word itself: enough to find, not enough to flood */
const ALIAS_WEIGHT = 0.35;
// Words that carry no meaning in a search ("what to wear in winter")
const STOP = new Set(["what", "to", "the", "a", "an", "and", "or", "how", "do", "does", "i", "my", "for", "in", "on", "of", "is", "are", "at", "with", "when", "should", "can", "you", "it"]);
const SUGGESTIONS = ["altitude sickness", "what to wear", "frostbite", "periods", "permits", "kids", "Diamox", "snake bite"];
const SHOWN = 8;

function tokens(q: string) {
  return q.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));
}

const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "iu");
/** 1 when `hay` has this word at the start of a word, ALIAS_WEIGHT when only an alias, 0 when neither */
function strength(hay: string, token: string) {
  if (wordRe(token).test(hay)) return 1;
  return (ALIASES[token] ?? []).some((a) => a !== token && wordRe(a).test(hay)) ? ALIAS_WEIGHT : 0;
}

/** ~160 characters around the first hit, so a result shows why it matched */
function snippet(text: string, toks: string[]) {
  const lower = text.toLowerCase();
  let at = -1;
  for (const t of toks) for (const a of [t, ...(ALIASES[t] ?? [])]) { const i = lower.indexOf(a); if (i >= 0 && (at < 0 || i < at)) at = i; }
  if (at < 0) return text.slice(0, 160) + (text.length > 160 ? "…" : "");
  const start = Math.max(0, text.lastIndexOf(" ", Math.max(0, at - 60)) + 1);
  const end = Math.min(text.length, start + 170);
  return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
}

function Highlight({ text, toks }: { text: string; toks: string[] }) {
  const words = toks.flatMap((t) => [t, ...(ALIASES[t] ?? [])]).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(${words.join("|")})`, "gi");
  return <>{text.split(re).map((part, i) => i % 2 ? <mark key={i} className="rounded px-0.5" style={{ background: "rgba(255,81,0,0.18)", color: "inherit" }}>{part}</mark> : part)}</>;
}

export interface TrekTile { slug: string; name: string; state: string; days: string; image: string }
/** One kind of adventure: how many are live (0 = coming soon) */
export interface ActivityTile { slug: string; type: string; element: Element; count: number }

export default function Library({ guides, topics, index, treks, activities, elements, path }: {
  guides: GuideCard[];
  topics: { id: Topic; label: string; blurb: string }[];
  index: SearchEntry[];
  treks: { count: number; featured: TrekTile[] };
  activities: ActivityTile[];
  elements: { id: Element; label: string; blurb: string }[];
  path: PathStep[];
}) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [all, setAll] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const read = useRead();

  // Read ?q= and ?topic= after load, so the page itself stays static and crawlable
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("topic");
    if (p.get("q")) setQ(p.get("q")!);
    if (t && topics.some((x) => x.id === t)) setTopic(t as Topic);
  }, [topics]);
  // …and keep them in the address, so a search can be shared
  useEffect(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (topic !== "all") p.set("topic", topic);
    const s = p.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
    setAll(false);
  }, [q, topic]);

  const toks = useMemo(() => tokens(q), [q]);

  // A guide matches when every word (or an alias of it) appears somewhere in it. Its sections are
  // ranked by how many of the words they hold, with words in titles and headings counting for
  // more and aliases counting for less. Rare words weigh more than common ones, so "goechala
  // permit" puts the Goechala guide above the permits guide.
  const results = useMemo(() => {
    if (!toks.length) return [];
    const hayOf = (e: SearchEntry) => `${e.guide} ${e.section ?? ""} ${e.text}`;
    const guidesTotal = new Set(index.map((e) => e.href)).size;
    const weight = Object.fromEntries(toks.map((t) => {
      const df = new Set(index.filter((e) => strength(hayOf(e), t) > 0).map((e) => e.href)).size || 1;
      return [t, Math.log(1 + guidesTotal / df)];
    }));
    const perGuide = new Map<string, { first: SearchEntry; found: Set<string>; score: number; hits: { entry: SearchEntry; score: number }[] }>();
    for (const e of index) {
      if (topic !== "all" && e.topic !== topic) continue;
      let score = 0;
      const hit: string[] = [];
      for (const t of toks) {
        const s = strength(hayOf(e), t);
        if (!s) continue;
        hit.push(t);
        score += weight[t] * s * (strength(e.guide, t) * 6 + (e.section ? strength(e.section, t) * 4 : 0) + 2);
      }
      if (!hit.length) continue;
      const r = perGuide.get(e.href) ?? { first: e, found: new Set<string>(), score: 0, hits: [] };
      hit.forEach((t) => r.found.add(t));
      // Best section counts most; more matching sections only nudge the guide up
      r.score = Math.max(r.score, score) + 0.5;
      r.hits.push({ entry: e, score });
      perGuide.set(e.href, r);
    }
    return [...perGuide.values()]
      .filter((r) => r.found.size === toks.length)
      .map((r) => ({ guide: r.first, score: r.score, hits: r.hits.filter((h) => h.entry.section).sort((a, b) => b.score - a.score).slice(0, 3) }))
      .sort((a, b) => b.score - a.score);
  }, [toks, index, topic]);

  const searching = toks.length > 0;
  const live = activities.filter((a) => a.count > 0).length;

  return (
    <>
      {/* ── Hero with search ── */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-10 sm:pb-12" style={{ background: "linear-gradient(180deg, rgba(255,81,0,0.07), transparent 85%)" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-ink)" }}>Learn</p>
          <h1 className="text-[42px] sm:text-6xl t-text leading-[1.02]" style={{ ...serif, letterSpacing: "-0.025em" }}>Adventurepedia</h1>
          <p className="text-[17px] sm:text-[19px] leading-[1.55] t-text-2 mt-4 max-w-2xl">
            Everything you need to know before an adventure in India, and on the way. Learn how it works, prepare properly, check you&apos;re ready, then find the trip.
          </p>

          <div className="mt-7 max-w-2xl" role="search">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 t-text-3 pointer-events-none" />
              <input
                ref={input}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") setQ(""); }}
                placeholder="Search guides: altitude, permits, diving, kids…"
                aria-label="Search the guides"
                className="w-full h-14 pl-12 pr-14 rounded-2xl text-[16px] t-text outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(255,81,0,0.18)]"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", boxShadow: "0 8px 30px rgba(var(--shadow-color),0.08)" }}
              />
              {q && (
                <button onClick={() => { setQ(""); input.current?.focus(); }} aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center t-text-3 hover:bg-[var(--bg-surface-2)]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-[12.5px] t-text-3">Try</span>
              {SUGGESTIONS.slice(0, 6).map((s) => (
                <button key={s} onClick={() => setQ(s)} className="text-[12.5px] font-medium px-2.5 py-1 rounded-full t-text-2 transition-colors hover:border-[#ff5100]/50"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        {/* ── Topics ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap" style={{ scrollbarWidth: "none" }} role="group" aria-label="Filter guides by topic">
          {[{ id: "all" as const, label: "Everything", n: undefined as number | undefined }, ...topics.map((t) => ({ id: t.id, label: t.label, n: guides.filter((g) => g.topic === t.id).length }))].map((t) => {
            const on = topic === t.id;
            return (
              <button key={t.id} onClick={() => setTopic(t.id)} aria-pressed={on}
                className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-[14px] font-semibold transition-colors"
                style={on ? { background: "#ff5100", color: "#1c1814" } : { color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                {t.label}{t.n !== undefined && <span className="text-[12px] tabular-nums" style={{ opacity: 0.7 }}>{t.n}</span>}
              </button>
            );
          })}
          <a href="#every-adventure" onClick={() => setTopic("all")} className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-[14px] font-semibold t-text-2" style={{ border: "1px solid var(--border-default)" }}>
            Every adventure<span className="text-[12px] tabular-nums" style={{ opacity: 0.7 }}>{activities.length}</span>
          </a>
          <Link href="/adventurepedia/treks" className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-[14px] font-semibold transition-colors"
            style={{ color: "var(--accent-ink)", border: "1px solid rgba(255,81,0,0.35)", background: "rgba(255,81,0,0.06)" }}>
            Trek guides<span className="text-[12px] tabular-nums" style={{ opacity: 0.7 }}>{treks.count}</span><ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {searching ? (
          <Results q={q} toks={toks} results={all ? results : results.slice(0, SHOWN)} total={results.length} showAll={() => setAll(true)} topic={topic} clearTopic={() => setTopic("all")} suggest={setQ} />
        ) : topic === "all" ? (
          <>
            {/* ── The journey ── */}
            <Journey />

            {/* ── Start here: the reading path ── */}
            <div id="start-here" className="scroll-mt-28">
              <SectionHead title="Start here" blurb="Planning your first big adventure? Read these in order. Ticks show what you've read on this device." />
            </div>
            <ReadingPath steps={path} read={read} />

            {/* ── Every adventure ── */}
            <div id="every-adventure" className="scroll-mt-28">
              <SectionHead title="Every adventure" blurb={`A full guide to each one: where and when in India, safety, what it asks of your body and how to pick an operator. ${live} to book now, more coming soon.`} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {elements.map((el) => (
                <div key={el.id} className="rounded-2xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                  <h3 className="text-[17px] t-text" style={serif}>{el.label}</h3>
                  <p className="text-[12.5px] t-text-3 mb-3">{el.blurb}</p>
                  <ul className="space-y-0.5">
                    {activities.filter((a) => a.element === el.id).map((a) => (
                      <li key={a.slug}>
                        <Link href={`/adventurepedia/activities/${a.slug}`} className="group flex items-center gap-2.5 -mx-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-surface-2)]">
                          <span className="w-7 h-7 rounded-lg grid place-items-center shrink-0" style={a.count > 0 ? { background: "rgba(255,81,0,0.1)", color: "#ff5100" } : { background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}>
                            {ADVENTURE_TYPE_ICONS[a.type]?.(15)}
                          </span>
                          <span className="flex-1 min-w-0 text-[14px] font-semibold t-text truncate group-hover:text-[#ff5100] transition-colors">{a.type}</span>
                          {read.has(`/adventurepedia/activities/${a.slug}`) && <Check className="w-3.5 h-3.5 text-emerald-500" aria-label="Read" />}
                          {a.count > 0
                            ? <span className="text-[11.5px] font-semibold tabular-nums" style={{ color: "#10b981" }} title={`${a.count} to book`}>{a.count}</span>
                            : <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] t-text-3" title="Guide ready; listings coming soon">Soon</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-[12.5px] t-text-3 mt-2.5">Green numbers are adventures you can book now. Every guide is ready to read, including the ones coming soon.</p>

            {/* ── Trek guides ── */}
            <SectionHead title="Trek guides" blurb={`A complete guide to each of our ${treks.count} treks and climbs: season, travel, day-by-day plan, an acclimatisation check, permits and cost.`}
              action={<Link href="/adventurepedia/treks" className="text-[13px] font-semibold inline-flex items-center gap-1 whitespace-nowrap" style={{ color: "var(--accent-ink)" }}>All {treks.count} <ArrowRight className="w-3.5 h-3.5" /></Link>} />
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {treks.featured.map((t) => (
                <li key={t.slug}>
                  <Link href={`/adventurepedia/treks/${t.slug}`} className="group relative block aspect-[4/5] rounded-2xl overflow-hidden">
                    <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 270px, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.78))" }} />
                    <span className="absolute inset-x-0 bottom-0 p-3.5">
                      <span className="block text-[11.5px] font-semibold text-white/75">{t.state} · {t.days}</span>
                      <span className="block text-[16px] sm:text-[17px] font-semibold text-white leading-snug mt-0.5">{t.name}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* ── Every topic guide, grouped ── */}
            <SectionHead title="All guides" blurb="Planning, health and life on the trail, for every kind of adventure." />
            <div className="grid md:grid-cols-3 gap-4">
              {topics.map((t) => (
                <div key={t.id} className="rounded-2xl p-4 sm:p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-[18px] t-text" style={serif}>{t.label}</h3>
                    <button onClick={() => { setTopic(t.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-[12.5px] font-semibold" style={{ color: "var(--accent-ink)" }}>Only these</button>
                  </div>
                  <p className="text-[12.5px] t-text-3 mb-3">{t.blurb}</p>
                  <ul className="space-y-0.5">
                    {guides.filter((g) => g.topic === t.id).map((g) => <li key={g.slug}><GuideLine g={g} read={read.has(href(g.slug))} /></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <SectionHead title={topics.find((t) => t.id === topic)!.label} blurb={topics.find((t) => t.id === topic)!.blurb} />
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {guides.filter((g) => g.topic === topic).map((g) => <li key={g.slug}><GuideRow g={g} read={read.has(href(g.slug))} /></li>)}
            </ul>
          </>
        )}

        {/* ── Missing something? ── */}
        <div className="mt-16 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <div>
            <h2 className="text-[20px] t-text" style={serif}>Can&apos;t find what you need?</h2>
            <p className="text-[14.5px] t-text-2 mt-1">Tell us the question you had before your trip. We write new guides from what people ask.</p>
          </div>
          <Link href={suggestHref(q.trim())} className="shrink-0 inline-flex items-center gap-1.5 h-11 px-5 rounded-full text-[14px] font-semibold text-[#1c1814]" style={{ background: "#ff5100" }}>
            Suggest a guide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

/** Learn, prepare, check you're ready, then go: each step's next move */
function Journey() {
  const steps = [
    { n: 1, icon: BookOpen, title: "Learn", text: "How each adventure works, where and when to go in India.", href: "#every-adventure", cta: "Every adventure" },
    { n: 2, icon: ListChecks, title: "Prepare", text: "Fitness, kit, altitude, permits and choosing an operator.", href: "#start-here", cta: "Start here" },
    { n: 3, icon: Gauge, title: "Check you're ready", text: "A readiness checklist, and the Matchmaker for your fitness.", href: "/adventurepedia/ready", cta: "Am I ready?" },
    { n: 4, icon: Compass, title: "Explore", text: "Compare adventures and operators, and book.", href: "/explore", cta: "Find a trip" },
  ];
  return (
    <ol className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="How to use Adventurepedia">
      {steps.map((s) => (
        <li key={s.n}>
          <Link href={s.href} className="group flex flex-col h-full rounded-2xl p-4 transition-colors hover:border-[#ff5100]/50" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <span className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl grid place-items-center" style={{ background: "rgba(255,81,0,0.1)" }}><s.icon className="w-4 h-4 text-[#ff5100]" /></span>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] t-text-3">Step {s.n}</span>
            </span>
            <span className="text-[16px] font-semibold t-text">{s.title}</span>
            <span className="text-[13px] leading-[1.5] t-text-2 mt-1 flex-1 hidden sm:block">{s.text}</span>
            <span className="text-[13px] font-semibold inline-flex items-center gap-1 mt-2" style={{ color: "var(--accent-ink)" }}>{s.cta} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" /></span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function ReadingPath({ steps, read }: { steps: PathStep[]; read: Set<string> }) {
  const done = steps.filter((s) => read.has(s.href)).length;
  return (
    <div className="rounded-2xl p-4 sm:p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-2)" }} role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done} aria-label="Guides read">
          <div className="h-full rounded-full transition-all" style={{ width: `${(done / steps.length) * 100}%`, background: "#ff5100" }} />
        </div>
        <span className="text-[12.5px] font-semibold t-text-3 tabular-nums">{done} of {steps.length} read</span>
      </div>
      <ol className="grid md:grid-cols-2 gap-x-6">
        {steps.map((s, i) => {
          const isRead = read.has(s.href);
          return (
            <li key={s.href}>
              <Link href={s.href} className="group flex gap-3 py-2.5 -mx-2 px-2 rounded-xl transition-colors hover:bg-[var(--bg-surface-2)]">
                <span className="w-7 h-7 rounded-full grid place-items-center shrink-0 text-[12px] font-bold mt-0.5"
                  style={isRead ? { background: "#10b981", color: "white" } : { background: "rgba(255,81,0,0.1)", color: "var(--accent-ink)" }}>
                  {isRead ? <Check className="w-3.5 h-3.5" aria-label="Read" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold t-text leading-snug group-hover:text-[#ff5100] transition-colors">{s.title}</span>
                  <span className="block text-[13px] t-text-3 leading-snug mt-0.5">{s.why}{s.minutes ? ` · ${s.minutes} min` : ""}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SectionHead({ title, blurb, action }: { title: string; blurb: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mt-12 mb-4">
      <div>
        <h2 className="text-[24px] sm:text-[28px] t-text leading-tight" style={serif}>{title}</h2>
        <p className="text-[14px] t-text-3 mt-1">{blurb}</p>
      </div>
      {action}
    </div>
  );
}

function GuideLine({ g, read }: { g: GuideCard; read: boolean }) {
  return (
    <Link href={href(g.slug)} className="group flex items-center gap-2.5 -mx-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-surface-2)]">
      <GuideIcon icon={g.icon} className="w-4 h-4 text-[#ff5100] shrink-0" />
      <span className="flex-1 min-w-0 text-[14px] font-semibold t-text truncate group-hover:text-[#ff5100] transition-colors">{g.short}</span>
      {read ? <Check className="w-3.5 h-3.5 text-emerald-500" aria-label="Read" /> : <span className="text-[11.5px] t-text-3 tabular-nums">{g.minutes} min</span>}
    </Link>
  );
}

function GuideRow({ g, read }: { g: GuideCard; read: boolean }) {
  return (
    <Link href={href(g.slug)} className="group flex gap-3.5 h-full rounded-2xl p-4 transition-colors hover:border-[#ff5100]/50"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)" }}>
        <GuideIcon icon={g.icon} className="w-5 h-5 text-[#ff5100]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[15.5px] font-semibold t-text leading-snug group-hover:text-[#ff5100] transition-colors">{g.short}</span>
        <span className="block text-[13.5px] leading-[1.55] t-text-2 mt-1 line-clamp-2">{g.summary}</span>
        <span className="flex items-center gap-1.5 text-[12px] t-text-3 mt-2"><Clock className="w-3 h-3" />{g.minutes} min · {g.sections} sections{read && <><span>·</span><Check className="w-3 h-3 text-emerald-500" />Read</>}</span>
      </span>
    </Link>
  );
}

function Results({ q, toks, results, total, showAll, topic, clearTopic, suggest }: {
  q: string; toks: string[]; total: number; showAll: () => void; topic: Topic | "all"; clearTopic: () => void; suggest: (s: string) => void;
  results: { guide: SearchEntry; hits: { entry: SearchEntry }[] }[];
}) {
  return (
    <div className="mt-8" aria-live="polite">
      <p className="text-[14px] t-text-3 mb-4">
        {total ? <><b className="t-text">{total}</b> {total === 1 ? "guide" : "guides"} for &ldquo;{q.trim()}&rdquo;</> : <>No guides match &ldquo;{q.trim()}&rdquo;</>}
        {topic !== "all" && <> in this topic · <button onClick={clearTopic} className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>search everything</button></>}
      </p>

      {total === 0 ? (
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <p className="text-[15px] t-text-2">Try fewer or different words. People often search for:</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => suggest(s)} className="text-[13px] font-medium px-3 py-1.5 rounded-full t-text-2 hover:border-[#ff5100]/50" style={{ border: "1px solid var(--border-default)" }}>{s}</button>
            ))}
          </div>
          <p className="text-[14px] t-text-2 mt-5">Still missing? <Link href={suggestHref(q.trim())} className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Ask us to write a guide on &ldquo;{q.trim()}&rdquo;</Link>.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {results.map(({ guide: g, hits }) => (
              <li key={g.href} className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                <Link href={g.href} className="group flex gap-3.5 p-4">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)" }}><GuideIcon icon={g.icon} className="w-5 h-5 text-[#ff5100]" /></span>
                  <span className="min-w-0">
                    <span className="block text-[16px] font-semibold t-text group-hover:text-[#ff5100] transition-colors"><Highlight text={g.guide} toks={toks} /></span>
                    <span className="block text-[13.5px] t-text-2 mt-0.5 line-clamp-2">{g.summary}</span>
                  </span>
                </Link>
                {hits.length > 0 && (
                  <ul style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    {hits.map(({ entry }) => (
                      <li key={entry.sectionId}>
                        <Link href={`${g.href}#${entry.sectionId}`} className="group flex gap-2.5 px-4 py-3 transition-colors hover:bg-[var(--bg-surface-2)]">
                          <CornerDownRight className="w-4 h-4 t-text-3 shrink-0 mt-0.5" />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-semibold t-text group-hover:text-[#ff5100]"><Highlight text={entry.section!} toks={toks} /></span>
                            <span className="block text-[13px] leading-[1.55] t-text-2 mt-0.5"><Highlight text={snippet(entry.text, toks)} toks={toks} /></span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {total > results.length && (
            <button onClick={showAll} className="mt-4 h-11 px-5 rounded-full text-[14px] font-semibold t-text" style={{ border: "1px solid var(--border-default)" }}>
              Show all {total}
            </button>
          )}
        </>
      )}
    </div>
  );
}
