import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import { guidesForAdventure, guideHref } from "@/lib/adventurepedia";
import { trekGuideHref, TREK_TYPES } from "@/lib/trekGuides";
import { GuideIcon } from "@/app/adventurepedia/blocks";

/** This trek's own Adventurepedia guide, then the topic guides that matter for it */
export default function GuidesForTrek({ slug, name, type, altitudeM, hasTrail }: { slug: string; name: string; type: string; altitudeM: number; hasTrail: boolean }) {
  const guides = guidesForAdventure(type, altitudeM, hasTrail);
  const hasTrekGuide = (TREK_TYPES as readonly string[]).includes(type);
  if (!guides.length && !hasTrekGuide) return null;
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>read before you go</p>
        <Link href="/adventurepedia" className="text-[12.5px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--accent-ink)" }}>
          Adventurepedia <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {hasTrekGuide && (
        <Link href={trekGuideHref(slug)} className="group flex items-center gap-3 rounded-xl p-3 mb-2 transition-colors" style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.22)" }}>
          <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#ff5100" }}>
            <BookOpenText className="w-[18px] h-[18px] text-white" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold group-hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-primary)" }}>The complete {name} guide</span>
            <span className="block text-[12.5px]" style={{ color: "var(--text-tertiary)" }}>Getting there, day by day, permits, packing and cost</span>
          </span>
          <ArrowRight className="w-4 h-4 shrink-0" style={{ color: "var(--accent-ink)" }} />
        </Link>
      )}
      <ul className="grid sm:grid-cols-2 gap-2">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={guideHref(g)} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--bg-surface-2)]">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.1)" }}>
                <GuideIcon icon={g.icon} className="w-4 h-4 text-[#ff5100]" />
              </span>
              <span className="text-[14px] font-medium leading-snug group-hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-primary)" }}>{g.short}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
