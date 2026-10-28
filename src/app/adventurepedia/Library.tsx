"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search, X, CornerDownRight } from "lucide-react";
import type { Guide, SearchEntry, Topic } from "@/lib/adventurepedia";
import { GuideIcon, serif } from "./blocks";

export interface GuideCard {
  slug: string; title: string; short: string; summary: string; topic: Topic; icon: Guide["icon"];
  featured: boolean; minutes: number; sections: number;
}

const href = (slug: string, section?: string) => `/adventurepedia/${slug}${section ? `#${section}` : ""}`;

// Words people search with that the guides spell differently
const ALIASES: Record<string, string[]> = {
  ams: ["altitude"], hape: ["hape", "lungs"], hace: ["hace", "brain"], diamox: ["acetazolamide"],
  packing: ["pack"], kit: ["pack", "kit"], shoes: ["shoes"], boots: ["shoes"], gear: ["pack", "layer"],
  rain: ["monsoon", "rain"], snow: ["snow", "winter"], cold: ["cold", "winter", "layer"],
  gps: ["gpx", "gps"], map: ["map", "gpx"], signal: ["signal", "satellite"], sos: ["emergency", "rescue"],
  bike: ["motorcycle", "ride", "bike"], rafting: ["rapid", "raft"], training: ["fit", "training"],
  visa: ["passport", "permit"], toilet: ["toilet"], garbage: ["waste", "rubbish"], doctor: ["medical", "doctor"],
  river: ["river", "stream"], rivers: ["river", "stream"], crossing: ["cross"], wear: ["wear", "layer", "cloth"],
};
// Words that carry no meaning in a search ("what to wear in winter")
const STOP = new Set(["what", "to", "the", "a", "an", "and", "or", "how", "do", "does", "i", "my", "for", "in", "on", "of", "is", "are", "at", "with", "when", "should", "can", "you", "it"]);
const SUGGESTIONS = ["altitude sickness", "what to wear", "river crossing", "permits", "monsoon", "Diamox", "fuel", "first aid"];

function tokens(q: string) {
  return q.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));
}

/** Does `hay` contain this word, or one of its aliases, at the start of a word? */
function matches(hay: string, token: string) {
  const alts = [token, ...(ALIASES[token] ?? [])];
  return alts.some((a) => new RegExp(`(^|[^\\p{L}\\p{N}])${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "iu").test(hay));
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

export default function Library({ guides, topics, index }: {
  guides: GuideCard[];
  topics: { id: Topic; label: string; blurb: string }[];
  index: SearchEntry[];
}) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<Topic | "all">("all");
  const input = useRef<HTMLInputElement>(null);

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
  }, [q, topic]);
  // "/" jumps to search from anywhere on the page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !el.isContentEditable) { e.preventDefault(); input.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toks = useMemo(() => tokens(q), [q]);
  const byslug = useMemo(() => Object.fromEntries(guides.map((g) => [g.slug, g])), [guides]);

  // Every word has to match somewhere in the entry. Titles count for more than body text.
  // A guide matches when every word appears somewhere in it. Its sections are ranked by how many
  // of the words they hold, with words in titles and headings counting for more.
  const results = useMemo(() => {
    if (!toks.length) return [];
    const perGuide = new Map<string, { found: Set<string>; score: number; hits: { entry: SearchEntry; score: number }[] }>();
    for (const e of index) {
      if (topic !== "all" && e.topic !== topic) continue;
      const hay = `${e.guide} ${e.section ?? ""} ${e.text}`;
      const hit = toks.filter((t) => matches(hay, t));
      if (!hit.length) continue;
      const score = hit.reduce((s, t) => s + (matches(e.guide, t) ? 6 : 0) + (e.section && matches(e.section, t) ? 4 : 0) + 2, 0);
      const r = perGuide.get(e.slug) ?? { found: new Set<string>(), score: 0, hits: [] };
      hit.forEach((t) => r.found.add(t));
      r.score += score;
      r.hits.push({ entry: e, score });
      perGuide.set(e.slug, r);
    }
    return [...perGuide.entries()]
      .filter(([, r]) => r.found.size === toks.length)
      .map(([slug, r]) => ({ guide: byslug[slug], score: r.score, hits: r.hits.filter((h) => h.entry.section).sort((a, b) => b.score - a.score).slice(0, 3) }))
      .filter((r) => r.guide)
      .sort((a, b) => b.score - a.score);
  }, [toks, index, topic, byslug]);

  const shown = topic === "all" ? guides : guides.filter((g) => g.topic === topic);
  const searching = toks.length > 0;

  return (
    <>
      {/* ── Hero with search ── */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-10 sm:pb-14" style={{ background: "linear-gradient(180deg, rgba(255,81,0,0.07), transparent 85%)" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-ink)" }}>Know-how</p>
          <h1 className="text-[42px] sm:text-6xl t-text leading-[1.02]" style={{ ...serif, letterSpacing: "-0.025em" }}>Adventurepedia</h1>
          <p className="text-[17px] sm:text-[19px] leading-[1.55] t-text-2 mt-4 max-w-2xl">
            Everything to know before you go, and on the way. Practical, tested guides for Himalayan treks, rides and rivers.
          </p>

          <div className="mt-7 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 t-text-3 pointer-events-none" />
              <input
                ref={input}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") setQ(""); }}
                placeholder="Search all guides"
                aria-label="Search the guides"
                className="w-full h-14 pl-12 pr-24 rounded-2xl text-[16px] t-text outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(255,81,0,0.18)]"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", boxShadow: "0 8px 30px rgba(var(--shadow-color),0.08)" }}
              />
              {q ? (
                <button onClick={() => { setQ(""); input.current?.focus(); }} aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center t-text-3 hover:bg-[var(--bg-surface-2)]">
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-7 h-7 rounded-lg text-[13px] font-semibold t-text-3" style={{ border: "1px solid var(--border-default)" }}>/</kbd>
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
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap" style={{ scrollbarWidth: "none" }} role="group" aria-label="Topics">
          {[{ id: "all" as const, label: "All guides", n: guides.length }, ...topics.map((t) => ({ id: t.id, label: t.label, n: guides.filter((g) => g.topic === t.id).length }))].map((t) => {
            const on = topic === t.id;
            return (
              <button key={t.id} onClick={() => setTopic(t.id)} aria-pressed={on}
                className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-[14px] font-semibold transition-colors"
                style={on ? { background: "#ff5100", color: "#fff" } : { color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                {t.label}<span className="text-[12px] tabular-nums" style={{ opacity: 0.7 }}>{t.n}</span>
              </button>
            );
          })}
        </div>

        {searching ? (
          <Results q={q} toks={toks} results={results} topic={topic} clearTopic={() => setTopic("all")} suggest={setQ} />
        ) : topic === "all" ? (
          <>
            {/* ── Start here ── */}
            <SectionHead title="Start here" blurb="The three guides every first-time Himalayan trekker should read." />
            <ul className="grid md:grid-cols-3 gap-4">
              {guides.filter((g) => g.featured).map((g) => <li key={g.slug}><FeatureCard g={g} /></li>)}
            </ul>

            {topics.map((t) => (
              <div key={t.id}>
                <SectionHead title={t.label} blurb={t.blurb} action={<button onClick={() => setTopic(t.id)} className="text-[13px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--accent-ink)" }}>Only these <ArrowRight className="w-3.5 h-3.5" /></button>} />
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {guides.filter((g) => g.topic === t.id).map((g) => <li key={g.slug}><GuideRow g={g} /></li>)}
                </ul>
              </div>
            ))}
          </>
        ) : (
          <>
            <SectionHead title={topics.find((t) => t.id === topic)!.label} blurb={topics.find((t) => t.id === topic)!.blurb} />
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shown.map((g) => <li key={g.slug}><GuideRow g={g} /></li>)}
            </ul>
          </>
        )}

        {/* ── Missing something? ── */}
        <div className="mt-16 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <div>
            <p className="text-[20px] t-text" style={serif}>Can&apos;t find what you need?</p>
            <p className="text-[14.5px] t-text-2 mt-1">Tell us the question you had before your trip. We write new guides from what people ask.</p>
          </div>
          <Link href="/contact" className="shrink-0 inline-flex items-center gap-1.5 h-11 px-5 rounded-full text-[14px] font-semibold text-white" style={{ background: "#ff5100" }}>
            Suggest a guide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
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

function FeatureCard({ g }: { g: GuideCard }) {
  return (
    <Link href={href(g.slug)} className="group flex flex-col h-full rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <span className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: "#ff5100", boxShadow: "0 8px 20px rgba(255,81,0,0.28)" }}>
        <GuideIcon icon={g.icon} className="w-6 h-6 text-white" />
      </span>
      <span className="text-[21px] t-text leading-snug group-hover:text-[#ff5100] transition-colors" style={serif}>{g.short}</span>
      <span className="text-[14px] leading-[1.6] t-text-2 mt-2 flex-1">{g.summary}</span>
      <span className="flex items-center justify-between mt-5 text-[12.5px] t-text-3">
        <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{g.minutes} min</span>
        <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "var(--accent-ink)" }}>Read <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" /></span>
      </span>
    </Link>
  );
}

function GuideRow({ g }: { g: GuideCard }) {
  return (
    <Link href={href(g.slug)} className="group flex gap-3.5 h-full rounded-2xl p-4 transition-colors hover:border-[#ff5100]/50"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)" }}>
        <GuideIcon icon={g.icon} className="w-5 h-5 text-[#ff5100]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[15.5px] font-semibold t-text leading-snug group-hover:text-[#ff5100] transition-colors">{g.short}</span>
        <span className="block text-[13.5px] leading-[1.55] t-text-2 mt-1 line-clamp-2">{g.summary}</span>
        <span className="block text-[12px] t-text-3 mt-2">{g.minutes} min · {g.sections} sections</span>
      </span>
    </Link>
  );
}

function Results({ q, toks, results, topic, clearTopic, suggest }: {
  q: string; toks: string[]; topic: Topic | "all"; clearTopic: () => void; suggest: (s: string) => void;
  results: { guide: GuideCard; hits: { entry: SearchEntry }[] }[];
}) {
  return (
    <div className="mt-8" aria-live="polite">
      <p className="text-[14px] t-text-3 mb-4">
        {results.length ? <><b className="t-text">{results.length}</b> {results.length === 1 ? "guide" : "guides"} for &ldquo;{q.trim()}&rdquo;</> : <>No guides match &ldquo;{q.trim()}&rdquo;</>}
        {topic !== "all" && <> in this topic · <button onClick={clearTopic} className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>search all topics</button></>}
      </p>

      {results.length === 0 ? (
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <p className="text-[15px] t-text-2">Try fewer or different words. People often search for:</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => suggest(s)} className="text-[13px] font-medium px-3 py-1.5 rounded-full t-text-2 hover:border-[#ff5100]/50" style={{ border: "1px solid var(--border-default)" }}>{s}</button>
            ))}
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {results.map(({ guide: g, hits }) => (
            <li key={g.slug} className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <Link href={href(g.slug)} className="group flex gap-3.5 p-4">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)" }}><GuideIcon icon={g.icon} className="w-5 h-5 text-[#ff5100]" /></span>
                <span className="min-w-0">
                  <span className="block text-[16px] font-semibold t-text group-hover:text-[#ff5100] transition-colors"><Highlight text={g.title} toks={toks} /></span>
                  <span className="block text-[13.5px] t-text-2 mt-0.5 line-clamp-2">{g.summary}</span>
                </span>
              </Link>
              {hits.length > 0 && (
                <ul style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  {hits.map(({ entry }) => (
                    <li key={entry.sectionId}>
                      <Link href={href(g.slug, entry.sectionId)} className="group flex gap-2.5 px-4 py-3 transition-colors hover:bg-[var(--bg-surface-2)]">
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
      )}
    </div>
  );
}
