"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Link2, Check, X, ArrowRight, UserPlus } from "lucide-react";
import { adventures } from "@/lib/data";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { decodeMembers, encodeMember, groupMatches, PENDING_GROUP_KEY, type GroupMember } from "@/lib/fitness";
import AdventureCard from "@/components/ui/custom/AdventureCard";

const NAME_KEY = "ttt_group_name";

function sameMember(a: GroupMember, b: GroupMember) {
  return a.name === b.name && JSON.stringify(a.ace) === JSON.stringify(b.ace);
}

/**
 * Group match: the group lives entirely in the link (?m=Name~levels,...). Each friend opens it,
 * adds their own profile, and passes the longer link on. Only capability levels are shared.
 */
export default function GroupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const members = useMemo(() => decodeMembers(searchParams.get("m")), [searchParams]);
  const { ace, ready } = useFitnessProfile();
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { try { setName(localStorage.getItem(NAME_KEY) ?? ""); } catch {} }, []);

  const me: GroupMember | null = ace ? { name: name.trim() || "Me", ace } : null;
  const alreadyIn = me ? members.some((m) => JSON.stringify(m.ace) === JSON.stringify(me.ace) && (m.name === me.name || !name.trim())) : false;

  function setMembers(next: GroupMember[]) {
    const m = next.map(encodeMember).join(",");
    router.replace(m ? `/matchmaker/group?m=${m}` : "/matchmaker/group", { scroll: false });
  }

  function addMe() {
    if (!me) return;
    try { localStorage.setItem(NAME_KEY, me.name); } catch {}
    setMembers([...members.filter((m) => !sameMember(m, me)), me]);
  }

  function remove(i: number) { setMembers(members.filter((_, j) => j !== i)); }

  function rememberGroupThenQuiz() {
    // After the quick match, results offer a way back here (see ResultsNextSteps)
    try { localStorage.setItem(PENDING_GROUP_KEY, window.location.pathname + window.location.search); } catch {}
    router.push("/matchmaker");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const { everyone, someStretch } = useMemo(
    () => (members.length >= 2 ? groupMatches(members, adventures) : { everyone: [], someStretch: [] }),
    [members]
  );

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-24 sm:py-28">
      <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-2 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" /> Group match
      </p>
      <h1 className="t-text text-3xl lg:text-4xl font-bold tracking-tight">Find adventures your whole group is ready for</h1>
      <p className="text-sm sm:text-base mt-2 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
        Everyone adds their fitness profile to this link. Only the eight capability levels are shared — never health answers.
      </p>

      {/* Members */}
      <div className="mt-8 rounded-2xl p-4 sm:p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <div className="flex flex-wrap items-center gap-2">
          {members.length === 0 && <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No one has joined yet.</p>}
          {members.map((m, i) => (
            <span key={`${m.name}-${i}`} className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full text-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}>
              {m.name}
              <button onClick={() => remove(i)} aria-label={`Remove ${m.name}`} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[var(--border-subtle)]" style={{ color: "var(--text-tertiary)" }}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {ready && me && !alreadyIn && (
            <>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                maxLength={24}
                aria-label="Your name in this group"
                className="px-3.5 py-2.5 rounded-xl text-sm sm:w-48"
                style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-default)", color: "var(--text-primary)", outline: "none" }}
              />
              <button onClick={addMe} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors">
                <UserPlus className="w-4 h-4" /> Add me to this group
              </button>
            </>
          )}
          {ready && !me && (
            <button onClick={rememberGroupThenQuiz} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors">
              Take the 1-minute quick match to join <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {members.length > 0 && (
            <button onClick={copyLink} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--bg-card-hover)]" style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
              {copied ? <><Check className="w-4 h-4 text-emerald-400" /> Link copied</> : <><Link2 className="w-4 h-4" /> Copy link for the next friend</>}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {members.length < 2 ? (
        <p className="text-sm mt-8" style={{ color: "var(--text-tertiary)" }}>
          Once at least two people have joined, the adventures you&apos;re all ready for appear here.
        </p>
      ) : (
        <>
          <section className="mt-12">
            <h2 className="t-text text-2xl font-bold tracking-tight">Everyone&apos;s ready <span className="text-emerald-400">({everyone.length})</span></h2>
            <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-secondary)" }}>Each of the {members.length} of you is at 80% match or higher.</p>
            {everyone.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No adventure fits everyone comfortably yet — check the stretch list below.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {everyone.slice(0, 9).map((r) => (
                  <AdventureCard key={r.adventure.id} adventure={r.adventure} badge={<GroupNote min={r.min} />} />
                ))}
              </div>
            )}
          </section>

          {someStretch.length > 0 && (
            <section className="mt-12">
              <h2 className="t-text text-2xl font-bold tracking-tight">A stretch for someone <span className="text-amber-400">({someStretch.length})</span></h2>
              <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-secondary)" }}>Possible if the least-ready person trains for it first.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {someStretch.slice(0, 6).map((r) => (
                  <AdventureCard key={r.adventure.id} adventure={r.adventure} badge={<GroupNote min={r.min} />} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <p className="text-xs mt-12" style={{ color: "var(--text-tertiary)" }}>
        Don&apos;t have a profile yet? <Link href="/matchmaker" className="underline">Take the Matchmaker</Link>.
      </p>
    </div>
  );
}

function GroupNote({ min }: { min: number }) {
  const ok = min >= 80;
  return (
    <span className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-[10px] font-semibold leading-none"
      style={{ background: ok ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: ok ? "#10b981" : "#f59e0b", border: `1px solid ${ok ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}` }}>
      <Users className="w-3 h-3" /> Lowest match in group: {min}%
    </span>
  );
}
