"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

// What to have sorted before leaving home for this trek, ticked off in this browser (kept per
// trek, so a half-done list is there when you come back)

export interface ChecklistItem { id: string; text: string; href?: string; link?: string }

export default function TrekChecklist({ slug, items }: { slug: string; items: ChecklistItem[] }) {
  const key = `ttt_ready_${slug}`;
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => { try { setDone(new Set(JSON.parse(localStorage.getItem(key) ?? "[]"))); } catch {} }, [key]);
  const toggle = (id: string) => setDone((cur) => {
    const next = new Set(cur);
    if (next.has(id)) next.delete(id); else next.add(id);
    try { localStorage.setItem(key, JSON.stringify([...next])); } catch {}
    return next;
  });
  const n = items.filter((i) => done.has(i.id)).length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-2)" }} aria-hidden>
          <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${(n / items.length) * 100}%`, background: n === items.length ? "#10b981" : "#ff5100" }} />
        </span>
        <span className="text-[13px] font-semibold tabular-nums t-text-2">{n === items.length ? "All set" : `${n} of ${items.length} ready`}</span>
      </div>
      <ul>
        {items.map((i, k) => {
          const on = done.has(i.id);
          return (
            <li key={i.id} className="flex items-start gap-3 px-4 py-3" style={{ borderTop: k ? "1px solid var(--border-subtle)" : undefined }}>
              <button type="button" onClick={() => toggle(i.id)} aria-pressed={on} aria-label={`${on ? "Untick" : "Tick"}: ${i.text}`}
                className="mt-0.5 w-5 h-5 rounded-md grid place-items-center shrink-0 transition-colors"
                style={on ? { background: "#10b981", color: "#fff" } : { border: "1.5px solid var(--border-default)" }}>
                {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </button>
              <span className={`text-[14.5px] leading-[1.55] ${on ? "t-text-3 line-through" : "t-text-2"}`}>
                {i.text}
                {i.href && <> <Link href={i.href} className="font-semibold underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>{i.link}</Link></>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
