import Link from "next/link";
import { Users, Crown, ChevronRight, Plus } from "lucide-react";
import type { GroupSummary } from "@/lib/matchGroups";
import { MAX_GROUP } from "@/lib/fitness";

/** The groups you're in, each a link back to its match and wishlist; or a nudge to start one */
export default function GroupMatchSection({ groups }: { groups: GroupSummary[] }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-xl px-4 py-6 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
        <Users className="w-5 h-5 mx-auto mb-2 text-[#ff7d47]" />
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Not in a group yet. Invite friends and see which adventures you&apos;re all ready for.
        </p>
        <Link href="/matchmaker/group" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#ff7d47] hover:underline">
          <Plus className="w-3.5 h-3.5" /> Start a Group Match
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
        {groups.map((g, i) => (
          <Link key={g.code} href={`/matchmaker/group/${g.code}`}
            className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--bg-card-hover)]"
            style={i < groups.length - 1 ? { borderBottom: "1px solid var(--border-subtle)" } : {}}>
            <span className="w-10 h-10 rounded-lg grid place-items-center shrink-0" style={{ background: "rgba(255,125,71,0.12)" }}>
              <Users className="w-4 h-4 text-[#ff7d47]" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-1.5 text-[14px] font-medium leading-snug truncate" style={{ color: "var(--text-secondary)" }}>
                {g.name}{g.isOwner && <Crown className="w-3 h-3 shrink-0 text-amber-400" aria-label="You started this group" />}
              </span>
              <span className="block text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                {g.memberCount} / {MAX_GROUP} people · match and wishlist
              </span>
            </span>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--text-tertiary)" }} />
          </Link>
        ))}
      </div>
      <Link href="/matchmaker/group" className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#ff7d47] hover:underline">
        <Plus className="w-3.5 h-3.5" /> Start another group
      </Link>
    </div>
  );
}
