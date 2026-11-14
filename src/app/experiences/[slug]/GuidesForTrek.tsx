import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import { guidesForAdventure, guideHref } from "@/lib/adventurepedia";
import { trekGuideHref, TREK_TYPES } from "@/lib/trekGuides";
import { GuideIcon } from "@/app/adventurepedia/blocks";

/**
 * This trek's own Adventurepedia guide, then the topic guides that matter for it, as one compact
 * row of links rather than a block of cards.
 */
export default function GuidesForTrek({ slug, name, type, altitudeM, hasTrail }: { slug: string; name: string; type: string; altitudeM: number; hasTrail: boolean }) {
  const guides = guidesForAdventure(type, altitudeM, hasTrail);
  const hasTrekGuide = (TREK_TYPES as readonly string[]).includes(type);
  if (!guides.length && !hasTrekGuide) return null;
  const pill = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors hover:text-[#ff5100]";
  return (
    <div>
      <p className="text-[12px] tracking-[0.1em] lowercase mb-2" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>read before you go</p>
      <ul className="flex flex-wrap gap-2">
        {hasTrekGuide && (
          <li>
            <Link href={trekGuideHref(slug)} className={pill} style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.28)", color: "var(--text-primary)" }}
              title="Getting there, day by day, permits, packing and cost">
              <BookOpenText className="w-3.5 h-3.5 text-[#ff5100]" /> The complete {name} guide <ArrowRight className="w-3 h-3" />
            </Link>
          </li>
        )}
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={guideHref(g)} className={pill} style={{ border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
              <GuideIcon icon={g.icon} className="w-3.5 h-3.5 text-[#ff5100]" /> {g.short}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
