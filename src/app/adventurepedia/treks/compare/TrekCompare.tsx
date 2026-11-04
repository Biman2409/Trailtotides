"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { ACE_AXES, ACE_AXIS_LABELS, ACE_AXIS_COLORS, type ACE } from "@/lib/ace";

// Two treks side by side. The pair lives in the address (?a=&b=), so a comparison can be shared
// or linked from a trek guide's "similar treks".

export interface CompareTrek {
  slug: string; name: string; state: string; difficulty: string; type: string; image: string;
  duration: string; months: string[];
  lengthKm: number | null; ascentM: number | null; topM: number | null;
  walkDays: number | null; hardestUpM: number | null;
  price: string | null; priceLo: number | null; operators: number;
  gateway: string | null;
  ace: ACE;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const short = (n: string) => n.replace(/ (Summit )?(Trek|Expedition|Climb)$/, "");
const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");
const card = { background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" } as const;

/** A number row, with the gap between the two spelt out under it */
function NumRow({ label, a, b, unit, more, less, name }: { label: string; a: number | null; b: number | null; unit: string; more: string; less: string; name: string }) {
  const max = Math.max(a ?? 0, b ?? 0) || 1;
  const diff = a != null && b != null ? a - b : null;
  const bar = (v: number | null, color: string) => (
    <div>
      <span className="text-[17px] font-semibold t-text tabular-nums">{v == null ? "—" : `${fmt(v)}${unit}`}</span>
      <span className="block mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-2)" }} aria-hidden>
        <span className="block h-full rounded-full" style={{ width: `${((v ?? 0) / max) * 100}%`, background: color }} />
      </span>
    </div>
  );
  return (
    <Row label={label} note={diff && Math.abs(diff) >= 1 ? `${name} is ${fmt(Math.abs(diff))}${unit} ${diff > 0 ? more : less}` : undefined}>
      {bar(a, "#ff5100")}
      {bar(b, "#3b82f6")}
    </Row>
  );
}

function Row({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[150px_1fr_1fr] gap-x-4 gap-y-1 px-4 py-3.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="col-span-2 sm:col-span-1">
        <span className="text-[12px] font-bold uppercase tracking-[0.1em] t-text-3">{label}</span>
        {note && <span className="block text-[12px] t-text-3 mt-0.5 sm:max-w-[140px]">{note}</span>}
      </div>
      {children}
    </div>
  );
}

export default function TrekCompare({ treks }: { treks: CompareTrek[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const bySlug = new Map(treks.map((t) => [t.slug, t]));
  const A = bySlug.get(params.get("a") ?? "") ?? treks[0];
  const B = bySlug.get(params.get("b") ?? "") ?? treks.find((t) => t.slug !== A.slug)!;
  const set = (a: string, b: string) => router.replace(`?a=${a}&b=${b}`, { scroll: false });

  const pick = (which: "a" | "b", t: CompareTrek, color: string) => (
    <div className="rounded-2xl overflow-hidden" style={card}>
      <Link href={`/adventurepedia/treks/${t.slug}`} className="block relative aspect-[5/2]" style={{ background: "var(--bg-surface-2)" }}>
        <Image src={t.image} alt="" fill sizes="(max-width: 640px) 50vw, 400px" className="object-cover" />
        <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: color }} />
      </Link>
      <div className="p-3">
        <label className="sr-only" htmlFor={`trek-${which}`}>{which === "a" ? "First trek" : "Second trek"}</label>
        <select id={`trek-${which}`} value={t.slug}
          onChange={(e) => (which === "a" ? set(e.target.value, B.slug) : set(A.slug, e.target.value))}
          className="w-full rounded-lg px-2.5 py-2 text-[14.5px] font-semibold t-text"
          style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}>
          {treks.map((x) => <option key={x.slug} value={x.slug} disabled={x.slug === (which === "a" ? B.slug : A.slug)}>{x.name}</option>)}
        </select>
        <p className="text-[12.5px] t-text-3 mt-1.5 px-0.5">{t.state} · {t.type}</p>
      </div>
    </div>
  );

  const months = (t: CompareTrek, color: string) => (
    <div className="flex gap-[3px]" aria-label={`Best months: ${t.months.join(", ")}`}>
      {MONTHS.map((m) => {
        const on = t.months.includes(m);
        return <span key={m} className="flex-1 text-center text-[10px] font-semibold rounded py-1" title={m}
          style={on ? { background: color, color: "#fff" } : { background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}>{m[0]}</span>;
      })}
    </div>
  );
  const both = A.months.filter((m) => B.months.includes(m));

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:pl-[166px] relative">
        {pick("a", A, "#ff5100")}
        {pick("b", B, "#3b82f6")}
        <button type="button" onClick={() => set(B.slug, A.slug)} aria-label="Swap the two treks"
          className="absolute left-1/2 sm:left-[calc(50%+83px)] top-[28%] -translate-x-1/2 w-9 h-9 rounded-full grid place-items-center shadow-md"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <ArrowLeftRight className="w-4 h-4 t-text-2" />
        </button>
      </div>

      <div className="mt-5 rounded-2xl overflow-hidden" style={card}>
        <Row label="Difficulty">
          <span className="text-[16px] font-semibold t-text">{A.difficulty}</span>
          <span className="text-[16px] font-semibold t-text">{B.difficulty}</span>
        </Row>
        <Row label="Duration">
          <span className="text-[16px] font-semibold t-text">{A.duration}</span>
          <span className="text-[16px] font-semibold t-text">{B.duration}</span>
        </Row>
        <NumRow label="Trail length" a={A.lengthKm} b={B.lengthKm} unit=" km" more="longer" less="shorter" name={short(A.name)} />
        <NumRow label="Total climb" a={A.ascentM} b={B.ascentM} unit=" m" more="more" less="less" name={short(A.name)} />
        <NumRow label="Highest point" a={A.topM} b={B.topM} unit=" m" more="higher" less="lower" name={short(A.name)} />
        <NumRow label="Hardest day's climb" a={A.hardestUpM} b={B.hardestUpM} unit=" m" more="more" less="less" name={short(A.name)} />
        <Row label="Best months" note={both.length ? `Both in ${both.join(", ")}` : "No month in common"}>
          {months(A, "#ff5100")}
          {months(B, "#3b82f6")}
        </Row>
        <Row label="Cost">
          <span className="text-[15px] font-semibold t-text">{A.price ?? "—"}<span className="block text-[12px] font-normal t-text-3">{A.operators} operator{A.operators === 1 ? "" : "s"}</span></span>
          <span className="text-[15px] font-semibold t-text">{B.price ?? "—"}<span className="block text-[12px] font-normal t-text-3">{B.operators} operator{B.operators === 1 ? "" : "s"}</span></span>
        </Row>
        <Row label="Gateway town">
          <span className="text-[15px] t-text">{A.gateway ?? "—"}</span>
          <span className="text-[15px] t-text">{B.gateway ?? "—"}</span>
        </Row>
      </div>

      <h2 className="mt-10 text-[22px] t-text" style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600 }}>What each asks of you, on ACE™</h2>
      <p className="text-[14px] t-text-2 mt-1 mb-3">Each capability out of 5. <span style={{ color: "#ff5100" }}>●</span> {A.name} &nbsp;<span style={{ color: "#3b82f6" }}>●</span> {B.name}</p>
      <div className="rounded-2xl p-4 grid sm:grid-cols-2 gap-x-8 gap-y-3" style={card}>
        {ACE_AXES.map((k) => (
          <div key={k} className="flex items-center gap-3">
            <span className="w-16 text-[13px] font-semibold" style={{ color: ACE_AXIS_COLORS[k] }}>{ACE_AXIS_LABELS[k]}</span>
            <span className="flex-1 grid gap-1">
              {([[A, "#ff5100"], [B, "#3b82f6"]] as const).map(([t, c]) => (
                <span key={t.slug} className="flex gap-1" aria-label={`${t.name}: ${ACE_AXIS_LABELS[k]} ${t.ace[k]} of 5`}>
                  {[1, 2, 3, 4, 5].map((n) => <span key={n} className="h-1.5 flex-1 rounded-full" style={{ background: n <= t.ace[k] ? c : "var(--bg-surface-2)" }} />)}
                </span>
              ))}
            </span>
            <span className="w-10 text-right text-[12.5px] tabular-nums t-text-3">{A.ace[k]} · {B.ace[k]}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {[A, B].map((t) => (
          <Link key={t.slug} href={`/adventurepedia/treks/${t.slug}`} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold" style={card}>
            {t.name} guide <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ))}
        <Link href={`/matchmaker?from=${A.slug}`} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold text-white" style={{ background: "#ff5100" }}>
          Check your fit in the Matchmaker <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
