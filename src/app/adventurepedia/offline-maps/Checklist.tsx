"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

const KEY = "ttt_offline_checklist";

/** The before-you-go list as tick boxes, remembered on this device so it survives a reload */
export default function Checklist({ items }: { items: { id: string; text: ReactNode }[] }) {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setDone(JSON.parse(raw)); } catch {}
  }, []);
  const toggle = (id: string) => setDone((d) => {
    const next = d.includes(id) ? d.filter((x) => x !== id) : [...d, id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    return next;
  });
  const count = items.filter((i) => done.includes(i.id)).length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <p className="text-[13px] font-semibold t-text">Before you leave home</p>
        <p className="text-[12px] tabular-nums" style={{ color: count === items.length ? "#16a34a" : "var(--text-tertiary)" }}>
          {count === items.length ? "All set" : `${count} of ${items.length} done`}
        </p>
      </div>
      <ul>
        {items.map((it, i) => {
          const on = done.includes(it.id);
          return (
            <li key={it.id} style={{ borderTop: i ? "1px solid var(--border-subtle)" : undefined }}>
              <button type="button" onClick={() => toggle(it.id)} aria-pressed={on} className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-surface-2)]">
                <span className="w-5 h-5 mt-0.5 rounded-md flex items-center justify-center shrink-0 transition-colors"
                  style={on ? { background: "#16a34a", border: "1.5px solid #16a34a" } : { border: "1.5px solid var(--border-default)" }}>
                  {on && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </span>
                <span className={`text-[14.5px] leading-[1.55] ${on ? "line-through opacity-60" : ""}`} style={{ color: "var(--text-secondary)" }}>{it.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
