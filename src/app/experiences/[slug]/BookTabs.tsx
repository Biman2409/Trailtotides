"use client";

import { useEffect, useState } from "react";

/**
 * "Where to book" as one section with two views of the same question, who to go with and when:
 * the operator comparison, or every operator's start dates on a calendar. A #dates link opens
 * straight on the calendar.
 */
export default function BookTabs({ operators, dates, operatorCount, dateCount }: {
  operators: React.ReactNode;
  dates?: React.ReactNode;
  operatorCount: number;
  dateCount: number;
}) {
  const [tab, setTab] = useState<"operators" | "dates">("operators");

  useEffect(() => {
    const fromHash = () => { if (window.location.hash === "#dates" && dates) setTab("dates"); };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [dates]);

  if (!dates) return <>{operators}</>;

  const tabs = [
    { id: "operators" as const, label: "Operators", count: operatorCount },
    { id: "dates" as const, label: "Dates", count: dateCount },
  ];

  return (
    <div id="dates" className="space-y-4 scroll-mt-32">
      <div role="tablist" aria-label="Compare by" className="inline-flex rounded-full p-1" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`book-${t.id}`}
              onClick={() => setTab(t.id)}
              className="rounded-full px-4 py-1.5 text-[13.5px] font-semibold transition-colors"
              style={{ background: on ? "#ff5100" : "transparent", color: on ? "#fff" : "var(--text-secondary)" }}
            >
              {t.label} <span className="font-normal" style={{ opacity: on ? 0.85 : 0.7 }}>{t.count}</span>
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`book-${tab}`}>
        {tab === "operators" ? operators : dates}
      </div>
    </div>
  );
}
