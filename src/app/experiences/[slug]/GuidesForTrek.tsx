import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { guidesForAdventure, guideHref } from "@/lib/adventurepedia";
import { GuideIcon } from "@/app/adventurepedia/blocks";

/** Adventurepedia guides that matter for this adventure, under its safety notes */
export default function GuidesForTrek({ type, altitudeM, hasTrail }: { type: string; altitudeM: number; hasTrail: boolean }) {
  const guides = guidesForAdventure(type, altitudeM, hasTrail);
  if (!guides.length) return null;
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>read before you go</p>
        <Link href="/adventurepedia" className="text-[12.5px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--accent-ink)" }}>
          Adventurepedia <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
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
