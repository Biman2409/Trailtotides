"use client";

// Compass.AI search, the one search across the site (the hero, the header, Explore, the map):
//   matches   instant, as you type: adventures, places, trek guides, operators, Adventurepedia and
//             stories from /api/search, matched word by word (typos and synonyms forgiven)
//   picks     Compass.AI's own picks with a reason each, from /api/chat: asked on Enter, or by
//             itself once the words read like a trip ("a 5-day trek in October")
// Pure state; the CompassSearch component draws it.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchResult } from "@/app/api/search/route";
import type { Adventure } from "@/lib/data";
import type { ACE } from "@/lib/ace";
import { matchesWords } from "@/lib/textMatch";
import { track } from "@/lib/analytics";

/** Shown wherever Compass.AI's picks are */
export const PICKS_NOTE = "Picks come from Trail to Tides listings. Confirm dates and prices with the operator.";

export const COMPASS_PROMPTS = [
  "A 5-day trek with big views, not too hard",
  "First Himalayan trek in October",
  "A weekend trek near Delhi",
  "Somewhere quiet and remote this winter",
];

// The index, fetched once per page and shared by every search box on it
let indexPromise: Promise<SearchResult[]> | null = null;
export function loadIndex(): Promise<SearchResult[]> {
  indexPromise ??= fetch("/api/search")
    .then((r) => (r.ok ? r.json() : { results: [] }))
    .then((d) => (d.results ?? []) as SearchResult[])
    .catch(() => { indexPromise = null; return []; });
  return indexPromise;
}

const GROUPS: { type: SearchResult["type"]; label: string; max: number }[] = [
  { type: "adventure", label: "Adventures", max: 5 },
  { type: "place", label: "Places", max: 3 },
  { type: "trek-guide", label: "Trek guides", max: 2 },
  { type: "operator", label: "Operators", max: 3 },
  { type: "guide", label: "Adventurepedia", max: 2 },
  { type: "story", label: "Stories", max: 2 },
];

/** The best matches for `query`, grouped and ranked: name first, then subtitle, then keywords */
export function rankMatches(index: SearchResult[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { groups: [] as { type: SearchResult["type"]; label: string; items: SearchResult[] }[], total: 0, adventures: 0 };
  const score = (r: SearchResult) => {
    const t = r.title.toLowerCase();
    if (t === q) return 100;
    if (t.startsWith(q)) return 90;
    if (t.split(/[^a-z0-9]+/).some((w) => w.startsWith(q))) return 75;
    if (matchesWords(r.title, q)) return 60;
    if (matchesWords(`${r.title} ${r.subtitle}`, q)) return 40;
    if (r.keywords && matchesWords(`${r.title} ${r.subtitle} ${r.keywords}`, q)) return 20;
    return 0;
  };
  const scored = index.map((r) => ({ r, s: score(r) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  const groups = GROUPS.map((g) => ({ type: g.type, label: g.label, items: scored.filter((x) => x.r.type === g.type).slice(0, g.max).map((x) => x.r) })).filter((g) => g.items.length);
  return { groups, total: scored.length, adventures: scored.filter((x) => x.r.type === "adventure").length };
}

/** Words that read like a trip being described, not a name being looked up */
const TRIP_CUES = /\b(\d+\s*-?\s*days?|weekend|week|near|from|in (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*|january|february|march|april|june|july|august|september|october|november|december|winter|summer|monsoon|autumn|spring|easy|beginner|first|hard|quiet|remote|budget|cheap|under|with (my|a|friends|family|kids)|solo|views?|snow|best)\b/i;
export const looksLikeTrip = (q: string) => q.trim().split(/\s+/).length >= 3 || (q.trim().split(/\s+/).length >= 2 && TRIP_CUES.test(q));

export interface CompassPick { slug: string; name: string; reason: string; card?: Adventure }
export interface CompassAnswer {
  status: "idle" | "loading" | "done" | "error";
  question: string;
  text: string;
  picks: CompassPick[];
  error?: string;
}
const IDLE: CompassAnswer = { status: "idle", question: "", text: "", picks: [] };

export function useCompassSearch({ ace, source, autoAsk = true }: { ace?: ACE | null; source: string; autoAsk?: boolean }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchResult[] | null>(null);
  const [answer, setAnswer] = useState<CompassAnswer>(IDLE);
  const controller = useRef<AbortController | null>(null);

  // The index loads the first time someone starts typing (or focuses the box), not on page load
  const warm = useCallback(() => { if (!index) loadIndex().then(setIndex); }, [index]);
  useEffect(() => { if (query && !index) warm(); }, [query, index, warm]);

  const matches = useMemo(() => rankMatches(index ?? [], query), [index, query]);

  const ask = useCallback(async (raw: string) => {
    const question = raw.trim();
    if (!question) return;
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setAnswer({ status: "loading", question, text: "", picks: [] });
    track("compass_search_ask", { source, length: question.length });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        // The server gives up on the AI well before this; never leave the box spinning
        signal: AbortSignal.any ? AbortSignal.any([c.signal, AbortSignal.timeout(45_000)]) : c.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: question }], recommendationRounds: 0, ace: ace ?? undefined }),
      });
      const data = await res.json();
      const cards: Adventure[] = data.cards ?? [];
      const picks: CompassPick[] = (data.recommendations ?? []).map((r: { slug: string; name: string; reason: string }) => ({ ...r, card: cards.find((a) => a.slug === r.slug) }));
      if (c.signal.aborted) return;
      if (!res.ok || data.rateLimited || (!data.text && !picks.length)) {
        setAnswer({ status: "error", question, text: "", picks: [], error: data.error ?? "Compass.AI couldn't answer just now. The matches below still work; try again in a moment." });
      } else setAnswer({ status: "done", question, text: data.text ?? "", picks });
    } catch {
      if (!c.signal.aborted) setAnswer({ status: "error", question, text: "", picks: [], error: "Compass.AI couldn't answer just now. The matches below still work; try again in a moment." });
    }
  }, [ace, source]);

  // A described trip asks Compass.AI by itself once you pause typing
  useEffect(() => {
    if (!autoAsk) return;
    const q = query.trim();
    if (!looksLikeTrip(q) || q === answer.question) return;
    const t = setTimeout(() => ask(q), 1100);
    return () => clearTimeout(t);
  }, [query, autoAsk, ask, answer.question]);

  const clear = useCallback(() => { controller.current?.abort(); setQuery(""); setAnswer(IDLE); }, []);
  useEffect(() => () => controller.current?.abort(), []);

  return { query, setQuery, matches, indexReady: !!index, warm, answer, ask, clear };
}
