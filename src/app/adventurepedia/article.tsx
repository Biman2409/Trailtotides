// Pieces every Adventurepedia article shares: the short version, the update line, sources,
// the health note, and the structured data search engines read
import { CalendarCheck, ExternalLink, Stethoscope } from "lucide-react";
import { jsonLd } from "@/lib/jsonLd";
import type { Source } from "@/lib/adventurepedia";
import { Rich } from "./blocks";

const SITE = "https://www.trailtotides.com";

export function ShortVersion({ items }: { items: string[] }) {
  return (
    <section id="short-version" className="scroll-mt-28 mt-8 rounded-2xl p-5 sm:p-6" style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.2)" }}>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: "var(--accent-ink)" }}>The short version</h2>
      <ul className="space-y-2.5">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-[1.6] t-text">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-[#1c1814] shrink-0 mt-0.5" style={{ background: "#ff5100" }} aria-hidden>{i + 1}</span>
            <span><Rich text={t} /></span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });

/** When it was last updated: shown in the header */
export function Updated({ date }: { date: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CalendarCheck className="w-3.5 h-3.5" />Updated <time dateTime={date}>{fmtDate(date)}</time>
    </span>
  );
}

export function Sources({ sources }: { sources?: Source[] }) {
  if (!sources?.length) return null;
  return (
    <section className="mt-10" aria-labelledby="sources">
      <h2 id="sources" className="text-[11px] font-bold uppercase tracking-[0.16em] t-text-3 mb-2">Sources and further reading</h2>
      <ul className="space-y-1.5">
        {sources.map((s) => (
          <li key={s.url} className="text-[13.5px] leading-[1.55]">
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 t-text-2 underline underline-offset-2 decoration-[var(--border-default)] hover:decoration-[#ff5100]">
              {s.label}<ExternalLink className="w-3 h-3 mt-1 shrink-0" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HealthNote({ kind = "health" }: { kind?: "health" | "activity" }) {
  return (
    <p className="mt-10 flex gap-2.5 text-[13px] leading-[1.6] t-text-3">
      <Stethoscope className="w-4 h-4 shrink-0 mt-0.5" />
      {kind === "health"
        ? "This guide is general information to help you prepare, not medical advice. Talk to a doctor about your own health before a high-altitude trip, and follow your trek leader on the mountain."
        : "This guide is general information to help you prepare, not professional instruction or medical advice. Learn from a qualified instructor, follow your guide's calls on the day, and ask a doctor if you have a health condition."}
    </p>
  );
}

/** Article and breadcrumb structured data for one page */
export function ArticleLd({ title, description, path, updated, crumbs }: {
  title: string; description: string; path: string; updated: string; crumbs: { name: string; path: string }[];
}) {
  const url = `${SITE}${path}`;
  const data = [
    {
      "@context": "https://schema.org", "@type": "Article", headline: title, description, url, mainEntityOfPage: url,
      dateModified: updated, inLanguage: "en-IN",
      author: { "@type": "Organization", name: "Trail to Tides", url: SITE },
      publisher: { "@type": "Organization", name: "Trail to Tides", url: SITE },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE}${c.path}` })),
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
