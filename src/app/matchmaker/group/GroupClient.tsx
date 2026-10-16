"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Users, Link2, Check, X, ArrowRight, UserPlus, Share2, RefreshCw, LogOut, Activity } from "lucide-react";
import { adventures } from "@/lib/data";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import {
  AXIS_LABEL, MAX_GROUP, PENDING_GROUP_KEY, bucketFor, decodeMembers, encodeMember, groupMatches, memberTag,
  type GroupMember, type GroupRow,
} from "@/lib/fitness";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import SectionTexture from "@/components/ui/custom/SectionTexture";

const NAME_KEY = "ttt_group_name";
// One colour per seat, so a person keeps their colour across chips and results
const SEAT_COLORS = ["#5fe0d4", "#ff7d47", "#60a5fa", "#c4b5fd", "#ffc46b", "#f472b6", "#4ade80", "#f87171"];

/**
 * Group match: the group lives entirely in the link (?m=Name~levels~tag,...). Each friend opens
 * it, signs in, adds their own profile and passes the longer link on. Only the eight capability
 * levels are shared. The page is signed-in only (see page.tsx), so every seat is a real account.
 */
export default function GroupClient({ viewer }: { viewer: { id: string; name: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const members = useMemo(() => decodeMembers(searchParams.get("m")), [searchParams]);
  const { ace, ready } = useFitnessProfile();
  const myTag = useMemo(() => memberTag(viewer.id), [viewer.id]);
  const [name, setName] = useState(viewer.name);
  const [copied, setCopied] = useState<"copied" | "failed" | null>(null);

  // A name typed for an earlier group beats the account name (people often use a nickname)
  useEffect(() => { try { const n = localStorage.getItem(NAME_KEY); if (n) setName(n); } catch {} }, []);

  const myIndex = members.findIndex((m) => m.id === myTag);
  const me = myIndex >= 0 ? members[myIndex] : null;
  const full = members.length >= MAX_GROUP && !me;
  // Your profile changed since you joined — offer to update your seat
  // (compared the way the link stores levels: whole numbers clamped to 1–5)
  const outdated = !!me && !!ace && (Object.keys(ace) as (keyof typeof ace)[]).some((k) => Math.min(5, Math.max(1, Math.round(ace[k]))) !== me.ace[k]);

  function setMembers(next: GroupMember[]) {
    const m = next.slice(0, MAX_GROUP).map(encodeMember).join(",");
    router.replace(m ? `${pathname}?m=${m}` : pathname, { scroll: false });
  }

  function join() {
    if (!ace) return;
    const display = name.trim() || viewer.name || "Me";
    try { localStorage.setItem(NAME_KEY, display); localStorage.removeItem(PENDING_GROUP_KEY); } catch {}
    const mine: GroupMember = { name: display, ace, id: myTag };
    // Replace your own seat (matched by account tag) rather than adding a second one
    setMembers(me ? members.map((m) => (m.id === myTag ? mine : m)) : [...members, mine]);
  }

  function leave() { setMembers(members.filter((m) => m.id !== myTag)); }
  function remove(i: number) { setMembers(members.filter((_, j) => j !== i)); }

  function quizThenReturn() {
    // Results show a "Your group is waiting" card that brings them back here
    try { localStorage.setItem(PENDING_GROUP_KEY, window.location.pathname + window.location.search); } catch {}
    router.push("/matchmaker?mode=quick");
  }

  async function share() {
    const url = window.location.href;
    const text = `Join our Trail to Tides group — add your fitness profile and we'll see which adventures we're all ready for.`;
    if (navigator.share) {
      try { await navigator.share({ title: "Group Match", text, url }); return; } catch { /* dismissed — fall through to copy */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied(null), 2500);
  }

  const { everyone, someStretch } = useMemo(
    () => (members.length >= 2 ? groupMatches(members, adventures) : { everyone: [], someStretch: [] }),
    [members]
  );

  // Steps follow you, not the head count: you haven't "added yourself" just because others have
  const step = !me ? 1 : members.length < 2 ? 2 : 3;

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 pt-24 sm:pt-28 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[28px] border p-6 sm:p-8" style={{ background: "linear-gradient(165deg, var(--bg-surface), var(--bg-card))", borderColor: "var(--border-subtle)" }}>
        <SectionTexture kind="trail" color="#ff5100" at="90% 10%" opacity={0.22} />
        <div className="relative">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Group match
          </p>
          <h1 className="t-text text-3xl lg:text-4xl font-bold tracking-tight max-w-2xl">Find adventures your whole group is ready for</h1>
          <p className="text-sm sm:text-base mt-2 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            Everyone signs in and adds their fitness profile to this link. Only the eight capability levels are shared — never health answers.
          </p>

          {/* Steps */}
          <ol className="grid grid-cols-3 gap-2 mt-6 max-w-2xl">
            {["Add yourself", "Invite friends", "See what you can all do"].map((label, i) => {
              const n = i + 1, done = step > n, on = step === n;
              return (
                <li key={label} className="rounded-xl px-3 py-2.5" style={{ background: on ? "rgba(255,81,0,0.1)" : "var(--bg-card)", border: `1px solid ${on ? "rgba(255,81,0,0.4)" : "var(--border-subtle)"}` }}>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: done ? "#10b981" : on ? "#ff7d47" : "var(--text-tertiary)" }}>
                    {done ? <Check className="w-3.5 h-3.5" /> : <span className="tabular-nums">0{n}</span>}
                  </span>
                  <span className="block text-[12px] font-semibold mt-0.5 leading-tight" style={{ color: on || done ? "var(--text-primary)" : "var(--text-tertiary)" }}>{label}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 mt-5">
        {/* Members */}
        <section className="rounded-[24px] border p-5 sm:p-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="t-text text-lg font-bold">In this group</h2>
            <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-tertiary)" }}>{members.length} / {MAX_GROUP}</span>
          </div>

          {members.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No one has joined yet — you can be first.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-2">
              {members.map((m, i) => {
                const isMe = m.id === myTag;
                const color = SEAT_COLORS[i % SEAT_COLORS.length];
                const total = Object.values(m.ace).reduce((a, b) => a + b, 0);
                return (
                  <li key={`${m.name}-${i}`} className="flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: "var(--bg-card)", border: `1px solid ${isMe ? `${color}66` : "var(--border-subtle)"}` }}>
                    <span className="w-9 h-9 rounded-full grid place-items-center text-sm font-bold shrink-0" style={{ background: `${color}22`, color }}>
                      {m.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-semibold t-text truncate">
                        {m.name}
                        {isMe && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>You</span>}
                      </span>
                      <span className="block text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>Fitness score {total}/40</span>
                    </span>
                    {isMe ? (
                      <button onClick={leave} aria-label="Leave this group" title="Leave this group" className="w-7 h-7 rounded-full grid place-items-center transition-colors hover:bg-[var(--bg-card-hover)]" style={{ color: "var(--text-tertiary)" }}>
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button onClick={() => remove(i)} aria-label={`Remove ${m.name}`} title={`Remove ${m.name}`} className="w-7 h-7 rounded-full grid place-items-center transition-colors hover:bg-[var(--bg-card-hover)]" style={{ color: "var(--text-tertiary)" }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Join / update */}
          <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            {!ready ? (
              <div className="h-11 rounded-xl animate-pulse" style={{ background: "var(--bg-card)" }} />
            ) : !ace ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="flex items-start gap-2.5 flex-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Activity className="w-4 h-4 mt-0.5 shrink-0 text-[#ff5100]" />
                  You need a fitness profile to join. The quick match takes about a minute, and you&apos;ll come straight back here.
                </span>
                <button onClick={quizThenReturn} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors shrink-0">
                  Take the quick match <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : full ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                This group is full ({MAX_GROUP} people). Ask someone to start a new group, or remove a member to make room.
              </p>
            ) : me && !outdated ? (
              <p className="flex items-center gap-2 text-sm" style={{ color: "#10b981" }}>
                <Check className="w-4 h-4" /> You&apos;re in this group with your latest profile.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  maxLength={24}
                  aria-label="Your name in this group"
                  className="px-3.5 py-2.5 rounded-xl text-sm sm:w-48"
                  style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-default)", color: "var(--text-primary)", outline: "none" }}
                />
                <button onClick={join} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors">
                  {me ? <><RefreshCw className="w-4 h-4" /> Update my levels</> : <><UserPlus className="w-4 h-4" /> Add me to this group</>}
                </button>
                {me && <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Your profile changed since you joined.</span>}
              </div>
            )}
          </div>
        </section>

        {/* Invite */}
        <aside className="rounded-[24px] border p-5 sm:p-6 h-fit" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <h2 className="t-text text-lg font-bold">Invite friends</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {members.length === 0
              ? "Add yourself first, then share the link."
              : "Send this link. Each friend signs in, adds themselves, and you'll see the group update."}
          </p>
          <button
            onClick={share}
            disabled={members.length === 0}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-card-hover)]"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
          >
            {copied === "copied" ? <><Check className="w-4 h-4 text-emerald-400" /> Link copied</> : <><Share2 className="w-4 h-4" /> Share the group link</>}
          </button>
          {copied === "failed" && (
            <div className="mt-3">
              <p className="text-xs mb-1.5" style={{ color: "var(--text-tertiary)" }}>Couldn&apos;t copy automatically — copy it from here:</p>
              <input readOnly value={typeof window !== "undefined" ? window.location.href : ""} onFocus={(e) => e.currentTarget.select()}
                className="w-full px-3 py-2 rounded-lg text-xs" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            </div>
          )}
          <p className="flex items-start gap-2 text-[11px] mt-4" style={{ color: "var(--text-tertiary)" }}>
            <Link2 className="w-3.5 h-3.5 shrink-0 mt-px" />
            The link itself holds the group — whoever has it can see everyone&apos;s eight levels. Share it only with the people you&apos;re going with.
          </p>
        </aside>
      </div>

      {/* Results */}
      {members.length < 2 ? (
        <p className="text-sm mt-10" style={{ color: "var(--text-tertiary)" }}>
          Once at least two people have joined, the adventures you&apos;re all ready for appear here.
        </p>
      ) : (
        <>
          <section className="mt-12">
            <h2 className="t-text text-2xl font-bold tracking-tight">Everyone&apos;s ready <span className="text-emerald-400 tabular-nums">({everyone.length})</span></h2>
            <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-secondary)" }}>All {members.length} of you are at 80% match or higher.</p>
            {everyone.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No adventure fits everyone comfortably yet — check the stretch list below.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {everyone.slice(0, 9).map((r) => (
                  <AdventureCard key={r.adventure.id} adventure={r.adventure} badge={<GroupNote row={r} members={members} />} />
                ))}
              </div>
            )}
          </section>

          {someStretch.length > 0 && (
            <section className="mt-12">
              <h2 className="t-text text-2xl font-bold tracking-tight">A stretch for someone <span className="text-amber-400 tabular-nums">({someStretch.length})</span></h2>
              <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-secondary)" }}>Possible if the person it&apos;s a stretch for trains for it first — each card says who and what.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {someStretch.slice(0, 6).map((r) => (
                  <AdventureCard key={r.adventure.id} adventure={r.adventure} badge={<GroupNote row={r} members={members} />} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

/** Each member's match as a small coloured bar, and — when it's a stretch — who and what */
function GroupNote({ row, members }: { row: GroupRow; members: GroupMember[] }) {
  const b = bucketFor(row.min);
  const weakest = members[row.weakest];
  const gaps = row.weakestGaps.slice(0, 2).map((g) => `${AXIS_LABEL[g.axis]} +${g.need - g.have}`).join(", ");
  return (
    <span className="flex flex-col gap-1.5 w-full">
      <span className="flex items-center gap-1" aria-label="Each member's match">
        {row.scores.map((s, i) => (
          <span key={i} className="flex-1 h-1.5 rounded-full overflow-hidden" title={`${members[i].name}: ${s}%`} style={{ background: "var(--border-subtle)" }}>
            <span className="block h-full rounded-full" style={{ width: `${s}%`, background: SEAT_COLORS[i % SEAT_COLORS.length] }} />
          </span>
        ))}
      </span>
      <span className="text-[10px] font-semibold leading-snug" style={{ color: b.color }}>
        {row.min >= 80
          ? <>Everyone ready · lowest {row.min}%</>
          : <>Waiting on {weakest.name} ({row.min}%){gaps ? ` — ${gaps}` : ""}</>}
      </span>
    </span>
  );
}
