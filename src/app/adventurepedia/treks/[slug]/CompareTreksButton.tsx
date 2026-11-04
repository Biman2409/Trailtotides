"use client";

import { ArrowRight } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import { adventures } from "@/lib/data";

// Puts this trek and its closest match into the site's compare (the same one as the Compare
// button on every adventure) and opens it. Anything already in compare stays, unless it needs
// the room: compare holds three, so the oldest others make way.

const MAX = 3;

export default function CompareTreksButton({ slugs, label }: { slugs: string[]; label: string }) {
  const { selected, add, remove, openDrawer } = useCompare();
  const pair = slugs.map((s) => adventures.find((a) => a.slug === s)).filter((a) => !!a);

  function go() {
    const missing = pair.filter((a) => !selected.some((s) => s.id === a.id));
    const others = selected.filter((s) => !pair.some((a) => a.id === s.id));
    const over = selected.length + missing.length - MAX;
    others.slice(0, Math.max(0, over)).forEach((s) => remove(s.id));
    missing.forEach(add);
    openDrawer();
  }

  return (
    <button type="button" onClick={go} className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: "var(--accent-ink)" }}>
      {label} <ArrowRight className="w-4 h-4" />
    </button>
  );
}
