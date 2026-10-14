import type { Month } from "@/lib/data";

const MONTHS: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Twelve tiny bars, one per month — lit when it's a good month to go. The current month gets
 * a ring so "is it on now?" reads at a glance.
 */
export default function SeasonStrip({ months, currentMonthIdx, size = "sm", label = true }: {
  months: Month[];
  currentMonthIdx?: number;
  size?: "sm" | "md";
  label?: boolean;
}) {
  const w = size === "md" ? 7 : 5;
  const h = size === "md" ? 10 : 8;
  return (
    <span className="inline-flex items-center gap-[2px]" aria-label={label ? `Best months: ${months.join(", ")}` : undefined} role={label ? "img" : undefined}>
      {MONTHS.map((m, i) => {
        const on = months.includes(m);
        const now = i === currentMonthIdx;
        return (
          <span
            key={m}
            title={m}
            className="rounded-[2px]"
            style={{
              width: w,
              height: h,
              background: on ? "#10b981" : "var(--border-default)",
              opacity: on ? 1 : 0.6,
              outline: now ? "1.5px solid var(--text-secondary)" : undefined,
              outlineOffset: now ? 1 : undefined,
            }}
          />
        );
      })}
    </span>
  );
}
