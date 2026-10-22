"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { GitCompareArrows, BookmarkPlus, MessageSquareQuote, Link2, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { adventures } from "@/lib/data";
import { EMAIL_ALERTS, QUOTE_REQUESTS } from "@/lib/features";

// Everything an account keeps besides the wishlist and trip log: saved comparisons (with
// share links), saved map searches (with email alerts) and quote requests sent to operators.

type Comparison = { id: string; name: string; slugs: string[]; share_code: string };
type Search = { id: string; name: string; query: string; alerts: boolean; matches: number };
type Quote = { id: string; slug: string; operators: string[]; start_date: string; flexible: boolean; group_size: number; created_at: string };

const nameOf = (slug: string) => adventures.find((a) => a.slug === slug)?.name ?? slug;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const get = <T,>(url: string, key: string) => fetch(url)
  .then((r) => (r.ok ? r.json() : {}) as Promise<Record<string, unknown>>)
  .then((d) => (d[key] ?? []) as T[])
  .catch(() => [] as T[]);

function Block({ icon, title, empty, children, count }: { icon: React.ReactNode; title: string; empty: React.ReactNode; children: React.ReactNode; count: number | null }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
      <p className="flex items-center gap-1.5 text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>{icon}{title}</p>
      {count === null ? <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Loading…</p>
        : count === 0 ? <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{empty}</p>
        : <ul className="space-y-2.5">{children}</ul>}
    </div>
  );
}

const rowBtn = "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--bg-surface-2)]";

export default function AccountExtras() {
  const [comparisons, setComparisons] = useState<Comparison[] | null>(null);
  const [searches, setSearches] = useState<Search[] | null>(null);
  const [quotes, setQuotes] = useState<Quote[] | null>(null);

  useEffect(() => {
    get<Comparison>("/api/comparisons", "comparisons").then(setComparisons);
    get<Search>("/api/saved-searches", "searches").then(setSearches);
    if (QUOTE_REQUESTS) get<Quote>("/api/quotes", "requests").then(setQuotes);
  }, []);

  async function removeComparison(id: string) {
    setComparisons((l) => l?.filter((c) => c.id !== id) ?? null);
    await fetch(`/api/comparisons?id=${id}`, { method: "DELETE" });
  }
  async function removeSearch(id: string) {
    setSearches((l) => l?.filter((s) => s.id !== id) ?? null);
    await fetch(`/api/saved-searches?id=${id}`, { method: "DELETE" });
  }
  async function setAlerts(id: string, alerts: boolean) {
    setSearches((l) => l?.map((s) => (s.id === id ? { ...s, alerts } : s)) ?? null);
    const res = await fetch("/api/saved-searches", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, alerts }) });
    if (!res.ok) toast.error("Couldn't change alerts. Try again.");
  }
  function copy(code: string) {
    navigator.clipboard.writeText(`${window.location.origin}/compare/${code}`).then(() => toast.success("Link copied."), () => {});
  }

  return (
    <div className={`grid grid-cols-1 ${QUOTE_REQUESTS ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-4`}>
      <Block icon={<GitCompareArrows className="w-3.5 h-3.5 text-[#ff5100]" />} title="Saved comparisons" count={comparisons?.length ?? null}
        empty={<>Compare 2 or 3 adventures, then <b>Save &amp; share</b> to keep them here with a link for friends.</>}>
        {comparisons?.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <Link href={`/compare/${c.share_code}`} className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold truncate hover:text-[#ff5100]" style={{ color: "var(--text-primary)" }}>{c.name}</span>
              <span className="block text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{c.slugs.map(nameOf).join(" · ")}</span>
            </Link>
            <button onClick={() => copy(c.share_code)} aria-label="Copy share link" className={rowBtn} style={{ color: "var(--text-tertiary)" }}><Link2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => removeComparison(c.id)} aria-label="Delete comparison" className={rowBtn} style={{ color: "var(--text-tertiary)" }}><Trash2 className="w-3.5 h-3.5" /></button>
          </li>
        ))}
      </Block>

      <Block icon={<BookmarkPlus className="w-3.5 h-3.5 text-[#ff5100]" />} title="Saved map searches" count={searches?.length ?? null}
        empty={<>Set filters on the <Link href="/map" className="text-[#ff5100] font-semibold">map</Link> and tap <b>Save search</b>.{EMAIL_ALERTS && <> We&apos;ll email you when new adventures match.</>}</>}>
        {searches?.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <Link href={`/map?${s.query}`} className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold truncate hover:text-[#ff5100]" style={{ color: "var(--text-primary)" }}>{s.name}</span>
              <span className="block text-[11px]" style={{ color: "var(--text-tertiary)" }}>{s.matches} {s.matches === 1 ? "match" : "matches"} today</span>
            </Link>
            {EMAIL_ALERTS && <Switch checked={s.alerts} onCheckedChange={(on) => setAlerts(s.id, on)} aria-label="Email me new matches" />}
            <button onClick={() => removeSearch(s.id)} aria-label="Delete search" className={rowBtn} style={{ color: "var(--text-tertiary)" }}><Trash2 className="w-3.5 h-3.5" /></button>
          </li>
        ))}
      </Block>

      {QUOTE_REQUESTS && <Block icon={<MessageSquareQuote className="w-3.5 h-3.5 text-[#ff5100]" />} title="Quote requests" count={quotes?.length ?? null}
        empty={<>On any adventure, <b>Get quotes</b> asks its verified operators for a price. Replies come to your email.</>}>
        {quotes?.map((q) => (
          <li key={q.id}>
            <Link href={`/experiences/${q.slug}`} className="block text-[13px] font-semibold truncate hover:text-[#ff5100]" style={{ color: "var(--text-primary)" }}>{nameOf(q.slug)}</Link>
            <span className="block text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {q.group_size} {q.group_size === 1 ? "person" : "people"} · from {fmtDate(q.start_date)}{q.flexible ? " (flexible)" : ""} · sent to {q.operators.length} on {fmtDate(q.created_at)}
            </span>
          </li>
        ))}
      </Block>}
    </div>
  );
}
