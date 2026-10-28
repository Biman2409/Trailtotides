"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Users, Cloud, TrendingUp, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { AXIS_LABEL, STALE_AFTER_DAYS, PENDING_GROUP_KEY, MAX_GROUP } from "@/lib/fitness";

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
          body="It's based on 6 answers, with the rest estimated. Answer 6 more for a profile you can rely on — everything you've answered is kept."
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

      {/* Group Match has its own panel near the top of the results (GroupMatchPromo) */}
    </div>
  );
}

/* ── Group Match, up front: the results' second step after your rank ─────────── */

const SAMPLE_GROUP = [
  { name: "You", color: "var(--accent-ink-soft)", status: "Ready", tone: "#10b981" },
  { name: "Aarav", color: "#60a5fa", status: "Ready", tone: "#10b981" },
  { name: "Meera", color: "#c084fc", status: "Stretch", tone: "#f59e0b" },
];

export function GroupMatchPromo() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
  }, []);
  // Group Match is signed-in only: signed-out visitors go through login first
  const href = loggedIn
    ? "/matchmaker/group"
    : `/auth/login?next=${encodeURIComponent("/matchmaker/group")}&message=${encodeURIComponent("Sign in to start a Group Match")}`;

  return (
    <section className="relative overflow-hidden rounded-3xl p-5 sm:p-7 grid md:grid-cols-[minmax(0,1fr)_300px] gap-5 md:gap-8 items-center"
      style={{ background: "linear-gradient(135deg, rgba(255,81,0,0.10), rgba(96,165,250,0.08))", border: "1px solid rgba(255,81,0,0.28)" }}>
      <div className="min-w-0">
        <p className="text-[#ff7d47] text-[11px] font-semibold tracking-[0.22em] uppercase flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Group Match
        </p>
        <h2 className="t-text text-2xl sm:text-3xl font-bold tracking-tight mt-1.5">Going with friends?</h2>
        <p className="text-sm sm:text-[15px] leading-relaxed mt-2 max-w-lg" style={{ color: "var(--text-secondary)" }}>
          Share one link. Each friend adds their profile, and every adventure is rated for the whole group, held to its least-ready member, so nobody is left behind.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
          <Link href={href} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[14px] font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors" style={{ boxShadow: "0 8px 24px rgba(255,81,0,0.28)" }}>
            <Users className="w-4 h-4" /> {loggedIn === false ? "Sign in to start a group" : "Start a group"} <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Private · up to {MAX_GROUP} people · free</span>
        </div>
      </div>

      {/* A sample of what the group sees */}
      <div className="rounded-2xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }} aria-label="Example group result">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {SAMPLE_GROUP.map((m) => (
              <span key={m.name} className="w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold text-[#15110e] ring-2 ring-[var(--bg-surface)]" style={{ background: m.color }}>{m.name[0]}</span>
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>Example</span>
        </div>
        <p className="text-sm font-semibold t-text mt-3">Kedarkantha Summit Trek</p>
        <ul className="mt-2 space-y-1.5">
          {SAMPLE_GROUP.map((m) => (
            <li key={m.name} className="flex items-center justify-between text-[12.5px]">
              <span style={{ color: "var(--text-secondary)" }}>{m.name}</span>
              <span className="font-semibold" style={{ color: m.tone }}>{m.status}</span>
            </li>
          ))}
        </ul>
        <p className="text-[12px] font-semibold mt-3 pt-2.5 flex items-center justify-between" style={{ borderTop: "1px dashed var(--border-default)" }}>
          <span style={{ color: "var(--text-tertiary)" }}>Group verdict</span>
          <span style={{ color: "#f59e0b" }}>A stretch for Meera</span>
        </p>
      </div>
    </section>
  );
}

const primaryBtn = "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors";

const TONES = {
  orange: { color: "var(--accent-ink-soft)", bg: "rgba(255,81,0,0.07)", border: "rgba(255,81,0,0.25)" },
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
