"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Users, Cloud, TrendingUp, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { AXIS_LABEL, STALE_AFTER_DAYS, PENDING_GROUP_KEY } from "@/lib/fitness";

/**
 * The "what next" cards at the top of Matchmaker results: refine a quick result, refresh an old
 * one, save it to an account, plan with friends, and how completed trips lifted the profile.
 */
export default function ResultsNextSteps({
  isQuick, onRefine, onRetake, ageDays, placement,
}: {
  isQuick: boolean;
  onRefine?: () => void;
  onRetake: () => void;
  ageDays: number | null;
  /** "top": only what changes how to read the result (quick / old profile, group waiting). "bottom": everything else. */
  placement: "top" | "bottom";
}) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [pendingGroup, setPendingGroup] = useState<string | null>(null);
  const { credits } = useFitnessProfile();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    try {
      const g = localStorage.getItem(PENDING_GROUP_KEY);
      if (g && g.startsWith("/matchmaker/group")) setPendingGroup(g);
    } catch {}
  }, []);

  const stale = ageDays !== null && ageDays >= STALE_AFTER_DAYS;
  const top = placement === "top";
  const next = encodeURIComponent("/matchmaker");

  return (
    <div className={`space-y-3 ${top ? "mb-5 sm:mb-6" : "mt-5 sm:mt-6"}`}>
      {/* Came here from a group link — send them back to add themselves */}
      {top && pendingGroup && (
        <Card tone="orange" icon={<Users className="w-4 h-4" />}
          title="Your group is waiting"
          body="Your profile is ready. Join now to see your group's capability and the adventures you can all do."
          action={
            <Link href={pendingGroup} onClick={() => { try { localStorage.removeItem(PENDING_GROUP_KEY); } catch {} }} className={primaryBtn}>
              Join the group <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          } />
      )}

      {top && isQuick && onRefine && (
        <Card tone="orange" icon={<Sparkles className="w-4 h-4" />}
          title="This is a quick estimate"
          body="It's based on 5 answers, with the rest estimated. Answer 9 more for a profile you can rely on — your 5 answers are kept."
          action={<button onClick={onRefine} className={primaryBtn}>Refine my profile <ArrowRight className="w-3.5 h-3.5" /></button>} />
      )}

      {top && !isQuick && stale && (
        <Card tone="amber" icon={<RefreshCw className="w-4 h-4" />}
          title={`Your profile is ${Math.floor((ageDays ?? 0) / 30)} months old`}
          body="Fitness changes. A refresh takes about 3 minutes and keeps your matches honest."
          action={<button onClick={onRetake} className={primaryBtn}>Refresh profile <ArrowRight className="w-3.5 h-3.5" /></button>} />
      )}

      {!top && loggedIn === false && (
        <Card tone="neutral" icon={<Cloud className="w-4 h-4" />}
          title="Keep your profile on every device"
          body="Right now it's only saved in this browser. A free account keeps your matches, wishlist and trips together."
          action={
            <div className="flex items-center gap-3">
              <Link href={`/auth/signup?next=${next}`} className={primaryBtn}>Create free account</Link>
              <Link href={`/auth/login?next=${next}`} className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Log in</Link>
            </div>
          } />
      )}

      {!top && credits.length > 0 && (
        <Card tone="green" icon={<TrendingUp className="w-4 h-4" />}
          title="Your completed trips count too"
          body={`Matches across the site use the higher of your answers and what you've already done: ${[...new Map(credits.map((c) => [c.axis, c])).values()]
            .map((c) => `${AXIS_LABEL[c.axis]} ${c.from}→${c.to} (${c.adventure})`).join(", ")}.`} />
      )}

      {/* Group Match is signed-in only — signed-out visitors are sent through login first */}
      {!top && loggedIn !== null && <Card tone="neutral" icon={<Users className="w-4 h-4" />}
        title="Planning with friends?"
        body={loggedIn
          ? "Share a link — each friend adds their profile, and you'll see the adventures you're all ready for."
          : "Group Match needs a free account for everyone in the group. Sign in to start one and share the link."}
        action={loggedIn
          ? <Link href="/matchmaker/group" className={secondaryBtn}>Start a group <ArrowRight className="w-3.5 h-3.5" /></Link>
          : <Link href={`/auth/login?next=${encodeURIComponent("/matchmaker/group")}&message=${encodeURIComponent("Sign in to start a Group Match")}`} className={secondaryBtn}>Sign in to start <ArrowRight className="w-3.5 h-3.5" /></Link>} />}
    </div>
  );
}

const primaryBtn = "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors";
const secondaryBtn = "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] text-[var(--text-primary)]";

const TONES = {
  orange: { color: "#ff7d47", bg: "rgba(255,81,0,0.07)", border: "rgba(255,81,0,0.25)" },
  amber: { color: "#f59e0b", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.25)" },
  green: { color: "#10b981", bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.25)" },
  neutral: { color: "var(--text-secondary)", bg: "var(--bg-surface)", border: "var(--border-subtle)" },
};

function Card({ tone, icon, title, body, action }: {
  tone: keyof typeof TONES; icon: React.ReactNode; title: string; body: string; action?: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div className="rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ color: t.color, background: "var(--bg-card-hover)" }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>
        <p className="text-xs leading-relaxed mt-0.5" style={{ color: "var(--text-secondary)" }}>{body}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
