// Building blocks shared by the Adventurepedia library and its guide pages
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Mountain, Backpack, Dumbbell, CalendarDays, BadgeCheck, FileText, Footprints, Droplets, LifeBuoy, Leaf, Bike, Waves, MapPinned,
  AlertTriangle, Lightbulb,
} from "lucide-react";
import type { Block, Guide } from "@/lib/adventurepedia";

export const serif = { fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600 } as const;

const ICONS: Record<Guide["icon"], typeof Mountain> = {
  altitude: Mountain, pack: Backpack, fitness: Dumbbell, season: CalendarDays, operator: BadgeCheck, permit: FileText,
  trail: Footprints, water: Droplets, emergency: LifeBuoy, leaf: Leaf, ride: Bike, raft: Waves, map: MapPinned,
};

export function GuideIcon({ icon, className }: { icon: Guide["icon"]; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} />;
}

/** Inline text: **bold** and [label](href). Internal links stay in the app; others open a new tab. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*.+?\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const bold = part.match(/^\*\*(.+)\*\*$/);
        if (bold) return <b key={i} className="t-text font-semibold">{bold[1]}</b>;
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const cls = "font-semibold t-text underline underline-offset-2 decoration-[#ff5100]/50 hover:decoration-[#ff5100]";
          return link[2].startsWith("/")
            ? <Link key={i} href={link[2]} className={cls}>{link[1]}</Link>
            : <a key={i} href={link[2]} target="_blank" rel="noopener" className={cls}>{link[1]}</a>;
        }
        return part;
      })}
    </>
  );
}

export function BlockView({ block }: { block: Block }) {
  if ("p" in block) return <p className="text-[15.5px] leading-[1.75] t-text-2 mb-4"><Rich text={block.p} /></p>;

  if ("list" in block) return (
    <ul className="my-4 space-y-2.5">
      {block.list.map((item, i) => (
        <li key={i} className="relative pl-5 text-[15px] leading-[1.7] t-text-2">
          <span className="absolute left-0 top-[0.7em] w-1.5 h-1.5 rounded-full" style={{ background: "#ff5100" }} aria-hidden />
          <Rich text={item} />
        </li>
      ))}
    </ul>
  );

  if ("steps" in block) return (
    <ol className="relative my-5">
      {block.steps.map((s, i) => (
        <li key={i} className="relative flex gap-3.5 pb-4 last:pb-0">
          {i < block.steps.length - 1 && <span className="absolute left-[13px] top-8 bottom-0 w-px" style={{ background: "var(--border-subtle)" }} aria-hidden />}
          <span className="relative w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: "#ff5100" }}>{i + 1}</span>
          <p className="text-[15px] leading-[1.7] t-text-2 pt-0.5"><Rich text={s} /></p>
        </li>
      ))}
    </ol>
  );

  if ("callout" in block) {
    const warn = block.callout === "warn";
    const Icon = warn ? AlertTriangle : Lightbulb;
    return (
      <aside className="my-5 rounded-2xl p-4 sm:p-5 flex gap-3.5" role="note"
        style={warn
          ? { background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.28)" }
          : { background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.22)" }}>
        <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: warn ? "var(--danger-ink, #dc2626)" : "var(--accent-ink)" }} />
        <div>
          <p className="text-[14.5px] font-semibold t-text mb-1">{block.title}</p>
          <p className="text-[14.5px] leading-[1.65] t-text-2"><Rich text={block.text} /></p>
        </div>
      </aside>
    );
  }

  // Tables scroll sideways on phones rather than squeezing their columns
  return (
    <div className="my-5 overflow-x-auto rounded-xl">
      <table className="min-w-[540px] w-full text-[14px] border-separate border-spacing-0 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
        <thead>
          <tr>
            {block.table.head.map((h) => (
              <th key={h} scope="col" className="text-left text-[11.5px] font-bold uppercase tracking-wider px-3.5 py-2.5 t-text-3" style={{ background: "var(--bg-surface-2)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className={`px-3.5 py-3 align-top leading-[1.55] ${c === 0 ? "font-semibold t-text" : "t-text-2"}`}
                  style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
                  <Rich text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TopicChip({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center text-[11.5px] font-semibold px-2.5 py-1 rounded-full" style={{ color: "var(--accent-ink)", background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.2)" }}>{children}</span>;
}
