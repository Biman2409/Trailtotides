"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Link2, Check, X, ArrowRight, UserPlus, Share2, RefreshCw, LogOut, Lock, Crown, ChevronRight, Save } from "lucide-react";
import { MatchmakerMark } from "@/components/ui/custom/BrandMarks";
import { adventures } from "@/lib/data";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import type { ACE } from "@/lib/ace";
import {
  AXIS_LABEL, MAX_GROUP, PENDING_GROUP_KEY, bucketFor, groupMatches, memberTag,
  type GroupMember, type GroupRow,
} from "@/lib/fitness";
import { aceToLevels, type GroupPreview, type GroupSummary, type StoredGroup } from "@/lib/matchGroups";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import SectionTexture from "@/components/ui/custom/SectionTexture";

const NAME_KEY = "ttt_group_name";
// Names from an old link that was saved as a stored group, shown once so the owner can re-invite them
const REINVITE_KEY = (code: string) => `ttt_group_reinvite_${code}`;
const SEEN_KEY = (id: string) => `ttt_group_seen_${id}`;
// One colour per seat, so a person keeps their colour across chips and results
const SEAT_COLORS = ["#5fe0d4", "#ff7d47", "#60a5fa", "#c4b5fd", "#ffc46b", "#f472b6", "#4ade80", "#f87171"];

type View =
  /** /matchmaker/group — your groups, start one; `legacy` holds an old ?m= link's members */
  | { kind: "home"; groups: GroupSummary[]; legacy: GroupMember[] }
  /** /matchmaker/group/<code> as a member */
  | { kind: "stored"; group: StoredGroup }
  /** /matchmaker/group/<code> before joining — name and head count only; null when the link is dead */
  | { kind: "invite"; code: string; preview: GroupPreview | null };

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Something went wrong — try again.");
  return json;
}

const sameLevels = (a: ACE, b: ACE) => aceToLevels(a).every((v, i) => v === aceToLevels(b)[i]);

/**
 * Group match. Groups are stored server-side (match_groups): the invite link only carries a
 * code, members are real accounts, and only members can see anyone's levels. Only the eight
 * capability levels are shared — never health answers. Old link-only groups (?m=...) still
 * open, read-only, with an offer to save them as a private group.
 */
export default function GroupClient({ viewer, view }: { viewer: { id: string; name: string }; view: View }) {
  const router = useRouter();
  const { ace, ready } = useFitnessProfile();
  const [name, setName] = useState(viewer.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A name typed for an earlier group beats the account name (people often use a nickname)
  useEffect(() => { try { const n = localStorage.getItem(NAME_KEY); if (n) setName(n); } catch {} }, []);

  const displayName = () => {
    const n = name.trim() || viewer.name || "Me";
    try { localStorage.setItem(NAME_KEY, n); localStorage.removeItem(PENDING_GROUP_KEY); } catch {}
    return n;
  };

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  }

  function quizThenReturn() {
    // Results show a "Your group is waiting" card that brings them back here
    try { localStorage.setItem(PENDING_GROUP_KEY, window.location.pathname + window.location.search); } catch {}
    router.push("/matchmaker?mode=quick");
  }

  const ctx: Ctx = { viewer, ace, ready, name, setName, busy, error, run, displayName, quizThenReturn, router };

  if (view.kind === "stored") return <StoredView ctx={ctx} group={view.group} />;
  if (view.kind === "invite") return <InviteView ctx={ctx} code={view.code} preview={view.preview} />;
  if (view.legacy.length > 0) return <LegacyView ctx={ctx} members={view.legacy} />;
  return <HomeView ctx={ctx} groups={view.groups} />;
}

interface Ctx {
  viewer: { id: string; name: string };
  ace: ACE | null;
  ready: boolean;
  name: string;
  setName: (n: string) => void;
  busy: boolean;
  error: string | null;
  run: (fn: () => Promise<void>) => Promise<void>;
  displayName: () => string;
  quizThenReturn: () => void;
  router: ReturnType<typeof useRouter>;
}

// ─── Views ───────────────────────────────────────────────────────────────────

function HomeView({ ctx, groups }: { ctx: Ctx; groups: GroupSummary[] }) {
  const [groupName, setGroupName] = useState("");

  function create() {
    if (!ctx.ace) return;
    const ace = ctx.ace;
    return ctx.run(async () => {
      const { code } = await api("/api/match-groups", "POST", { name: groupName.trim() || undefined, displayName: ctx.displayName(), ace });
      ctx.router.push(`/matchmaker/group/${code}`);
    });
  }

  return (
    <Shell step={1} subtitle="Start a private group, invite friends with a link, and see which adventures you're all ready for. Only members can see anyone's levels.">
      <div className="grid lg:grid-cols-[1fr_340px] gap-5 mt-5">
        <Panel>
          <h2 className="t-text text-lg font-bold">Start a group</h2>
          <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-secondary)" }}>You&apos;ll be its first member and can remove people later.</p>
          <ProfileGate ctx={ctx}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <TextInput value={groupName} onChange={setGroupName} placeholder="Group name (optional)" label="Group name" max={40} />
              <TextInput value={ctx.name} onChange={ctx.setName} placeholder="Your first name" label="Your name in this group" max={24} />
              <PrimaryButton onClick={create} disabled={ctx.busy}><UserPlus className="w-4 h-4" /> Start group</PrimaryButton>
            </div>
          </ProfileGate>
          <ErrorLine error={ctx.error} />
        </Panel>

        <Panel>
          <h2 className="t-text text-lg font-bold">Your groups</h2>
          {groups.length === 0 ? (
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>None yet. Groups you start or join show up here.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {groups.map((g) => (
                <li key={g.code}>
                  <Link href={`/matchmaker/group/${g.code}`} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-[var(--bg-card-hover)]" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                    <Users className="w-4 h-4 shrink-0 text-[#ff7d47]" />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-semibold t-text truncate">
                        {g.name}{g.isOwner && <Crown className="w-3 h-3 text-amber-400" aria-label="You own this group" />}
                      </span>
                      <span className="block text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>{g.memberCount} / {MAX_GROUP} people</span>
                    </span>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </Shell>
  );
}

/** An old link-only group (?m=): read-only, with an offer to save it as a private stored group. */
function LegacyView({ ctx, members }: { ctx: Ctx; members: GroupMember[] }) {
  const myTag = useMemo(() => memberTag(ctx.viewer.id), [ctx.viewer.id]);
  const mine = members.find((m) => m.id === myTag);
  // Save with your seat from the link, or your current profile if you weren't in it yet
  const saveAce = ctx.ace ?? mine?.ace ?? null;

  function save() {
    if (!saveAce) return;
    const ace = saveAce;
    return ctx.run(async () => {
      const { code } = await api("/api/match-groups", "POST", { displayName: ctx.displayName(), ace });
      const others = members.filter((m) => m !== mine).map((m) => m.name);
      try { if (others.length) sessionStorage.setItem(REINVITE_KEY(code), JSON.stringify(others)); } catch {}
      ctx.router.push(`/matchmaker/group/${code}`);
    });
  }

  return (
    <Shell step={members.length < 2 ? 2 : 3} subtitle="This is an old-style group link: the link itself holds everyone's levels, so anyone who has it can see them.">
      <div className="grid lg:grid-cols-[1fr_340px] gap-5 mt-5">
        <Panel>
          <MembersHeader count={members.length} />
          <ul className="grid sm:grid-cols-2 gap-2">
            {members.map((m, i) => (
              <MemberChip key={`${m.name}-${i}`} name={m.name} ace={m.ace} color={SEAT_COLORS[i % SEAT_COLORS.length]} isMe={m.id === myTag} />
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="t-text text-lg font-bold flex items-center gap-2"><Lock className="w-4 h-4 text-[#ff7d47]" /> Make it private</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Save this as a stored group. You become its owner, only members can see levels, and you get a new invite link to send everyone else.
          </p>
          <div className="mt-4">
            {!ctx.ready ? <Skeleton /> : saveAce ? (
              <PrimaryButton onClick={save} disabled={ctx.busy} full><Save className="w-4 h-4" /> Save this group</PrimaryButton>
            ) : (
              <ProfileGate ctx={ctx}>{null}</ProfileGate>
            )}
          </div>
          <ErrorLine error={ctx.error} />
        </Panel>
      </div>
      <GroupResults members={members} />
    </Shell>
  );
}

function InviteView({ ctx, code, preview }: { ctx: Ctx; code: string; preview: GroupPreview | null }) {
  function join() {
    if (!ctx.ace) return;
    const ace = ctx.ace;
    return ctx.run(async () => {
      await api(`/api/match-groups/${code}/join`, "POST", { displayName: ctx.displayName(), ace });
      ctx.router.refresh();
    });
  }

  if (!preview) {
    return (
      <Shell step={1} subtitle="Find adventures your whole group is ready for.">
        <Panel className="mt-5">
          <h2 className="t-text text-lg font-bold">This invite link doesn&apos;t work any more</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            The group may have been deleted, or its owner reset the link. Ask them for a new one — or start your own group.
          </p>
          <Link href="/matchmaker/group" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#ff7d47] hover:underline">Go to Group Match <ArrowRight className="w-4 h-4" /></Link>
        </Panel>
      </Shell>
    );
  }

  const full = preview.memberCount >= MAX_GROUP;
  return (
    <Shell step={1} subtitle="You've been invited to a private group. Join to see everyone's match — members only see the eight capability levels, never health answers.">
      <Panel className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>You&apos;re invited to</p>
        <h2 className="t-text text-2xl font-bold mt-1">{preview.name}</h2>
        <p className="text-sm mt-1 tabular-nums" style={{ color: "var(--text-secondary)" }}>
          {preview.ownerName ? `Started by ${preview.ownerName} · ` : ""}{preview.memberCount} / {MAX_GROUP} people
        </p>
        <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {full ? (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>This group is full ({MAX_GROUP} people). Ask the owner to make room, or start a new group.</p>
          ) : (
            <ProfileGate ctx={ctx}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <TextInput value={ctx.name} onChange={ctx.setName} placeholder="Your first name" label="Your name in this group" max={24} />
                <PrimaryButton onClick={join} disabled={ctx.busy}><UserPlus className="w-4 h-4" /> Join this group</PrimaryButton>
              </div>
            </ProfileGate>
          )}
          <ErrorLine error={ctx.error} />
        </div>
      </Panel>
    </Shell>
  );
}

function StoredView({ ctx, group }: { ctx: Ctx; group: StoredGroup }) {
  const { viewer, ace, router } = ctx;
  const isOwner = group.ownerId === viewer.id;
  const me = group.members.find((m) => m.userId === viewer.id);
  const outdated = !!me && !!ace && !sameLevels(ace, me.ace);
  const members: GroupMember[] = useMemo(() => group.members.map((m) => ({ name: m.name, ace: m.ace })), [group.members]);
  const [copied, setCopied] = useState<"copied" | "failed" | null>(null);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [reinvite, setReinvite] = useState<string[]>([]);
  const [removedNote, setRemovedNote] = useState<string | null>(null);
  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/matchmaker/group/${group.code}` : "";

  // Who joined since you last looked — remembered per browser, so a first visit shows nothing new
  useEffect(() => {
    try {
      setLastSeen(localStorage.getItem(SEEN_KEY(group.id)));
      localStorage.setItem(SEEN_KEY(group.id), new Date().toISOString());
      const r = sessionStorage.getItem(REINVITE_KEY(group.code));
      if (r) setReinvite(JSON.parse(r));
    } catch {}
  }, [group.id, group.code]);

  // Pick up friends joining while the page is open
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") router.refresh(); };
    const t = setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", refresh); };
  }, [router]);

  const isNew = (joinedAt: string, userId: string) => !!lastSeen && userId !== viewer.id && joinedAt > lastSeen;
  const newcomers = group.members.filter((m) => isNew(m.joinedAt, m.userId)).map((m) => m.name);

  const updateLevels = () => ace && ctx.run(async () => {
    await api(`/api/match-groups/${group.code}/me`, "PATCH", { displayName: ctx.displayName(), ace });
    router.refresh();
  });

  const leave = () => {
    const heir = group.members.find((m) => m.userId !== viewer.id);
    const msg = isOwner && heir ? `Leave ${group.name}? ${heir.name} will become its owner.` : `Leave ${group.name}?`;
    if (!window.confirm(msg)) return;
    return ctx.run(async () => {
      await api(`/api/match-groups/${group.code}/me`, "DELETE");
      router.push("/matchmaker/group");
      router.refresh();
    });
  };

  const remove = (userId: string, who: string) => {
    if (!window.confirm(`Remove ${who} from ${group.name}?`)) return;
    return ctx.run(async () => {
      await api(`/api/match-groups/${group.code}/members/${userId}`, "DELETE");
      setRemovedNote(who);
      router.refresh();
    });
  };

  const resetLink = () => {
    if (!window.confirm("Reset the invite link? The current link stops working; members keep their seats.")) return;
    return ctx.run(async () => {
      const { code } = await api(`/api/match-groups/${group.code}`, "PATCH", { resetInvite: true });
      setRemovedNote(null);
      router.replace(`/matchmaker/group/${code}`);
    });
  };

  async function share() {
    const text = `Join "${group.name}" on Trail to Tides — add your fitness profile and we'll see which adventures we're all ready for.`;
    if (navigator.share) {
      try { await navigator.share({ title: "Group Match", text, url: inviteUrl }); return; } catch { /* dismissed — fall through to copy */ }
    }
    try { await navigator.clipboard.writeText(inviteUrl); setCopied("copied"); } catch { setCopied("failed"); }
    setTimeout(() => setCopied(null), 2500);
  }

  return (
    <Shell title={group.name} step={group.members.length < 2 ? 2 : 3} subtitle="A private group: only its members can see anyone's levels. Only the eight capability levels are shared — never health answers.">
      {newcomers.length > 0 && (
        <Banner tone="good">{listNames(newcomers)} joined since your last visit.</Banner>
      )}
      {reinvite.length > 0 && (
        <Banner onDismiss={() => { setReinvite([]); try { sessionStorage.removeItem(REINVITE_KEY(group.code)); } catch {} }}>
          Saved. Send the new invite link to {listNames(reinvite)} — they need to join again so their own account holds their seat.
        </Banner>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 mt-5">
        <Panel>
          <MembersHeader count={group.members.length} />
          <ul className="grid sm:grid-cols-2 gap-2">
            {group.members.map((m, i) => {
              const isMe = m.userId === viewer.id;
              return (
                <MemberChip
                  key={m.userId}
                  name={m.name}
                  ace={m.ace}
                  color={SEAT_COLORS[i % SEAT_COLORS.length]}
                  isMe={isMe}
                  isOwner={m.userId === group.ownerId}
                  isNew={isNew(m.joinedAt, m.userId)}
                  action={isMe ? (
                    <IconButton onClick={leave} label="Leave this group" disabled={ctx.busy}><LogOut className="w-3.5 h-3.5" /></IconButton>
                  ) : isOwner ? (
                    <IconButton onClick={() => remove(m.userId, m.name)} label={`Remove ${m.name}`} disabled={ctx.busy}><X className="w-3.5 h-3.5" /></IconButton>
                  ) : null}
                />
              );
            })}
          </ul>

          <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            {!ctx.ready ? <Skeleton /> : outdated ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <TextInput value={ctx.name} onChange={ctx.setName} placeholder="Your first name" label="Your name in this group" max={24} />
                <PrimaryButton onClick={updateLevels} disabled={ctx.busy}><RefreshCw className="w-4 h-4" /> Update my levels</PrimaryButton>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Your profile changed since you joined.</span>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm" style={{ color: "#10b981" }}>
                <Check className="w-4 h-4" /> You&apos;re in this group with your latest profile.
              </p>
            )}
            {removedNote && (
              <p className="text-xs mt-3" style={{ color: "var(--text-tertiary)" }}>
                {removedNote} was removed. Anyone with the invite link can still join — reset it below if you don&apos;t want them back.
              </p>
            )}
            <ErrorLine error={ctx.error} />
          </div>
        </Panel>

        <aside className="rounded-[24px] border p-5 sm:p-6 h-fit" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <h2 className="t-text text-lg font-bold">Invite friends</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {group.members.length >= MAX_GROUP
              ? `The group is full (${MAX_GROUP} people).`
              : "Send this link. Each friend signs in, joins with their profile, and appears here."}
          </p>
          <button
            onClick={share}
            disabled={group.members.length >= MAX_GROUP}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-card-hover)]"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
          >
            {copied === "copied" ? <><Check className="w-4 h-4 text-emerald-400" /> Link copied</> : <><Share2 className="w-4 h-4" /> Share the invite link</>}
          </button>
          {copied === "failed" && (
            <div className="mt-3">
              <p className="text-xs mb-1.5" style={{ color: "var(--text-tertiary)" }}>Couldn&apos;t copy automatically — copy it from here:</p>
              <input readOnly value={inviteUrl} onFocus={(e) => e.currentTarget.select()}
                className="w-full px-3 py-2 rounded-lg text-xs" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            </div>
          )}
          <p className="flex items-start gap-2 text-[11px] mt-4" style={{ color: "var(--text-tertiary)" }}>
            <Link2 className="w-3.5 h-3.5 shrink-0 mt-px" />
            The link lets people join; it doesn&apos;t show anyone&apos;s levels until they do.
          </p>
          {isOwner && (
            <button onClick={resetLink} disabled={ctx.busy} className="mt-3 text-[11px] font-semibold text-[#ff7d47] hover:underline disabled:opacity-40">
              Reset invite link
            </button>
          )}
        </aside>
      </div>

      <GroupResults members={members} />
    </Shell>
  );
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

function Shell({ title, subtitle, step, children }: { title?: string; subtitle: string; step: number; children: ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 pt-24 sm:pt-28 pb-16">
      <div className="relative overflow-hidden rounded-[28px] border p-6 sm:p-8" style={{ background: "linear-gradient(165deg, var(--bg-surface), var(--bg-card))", borderColor: "var(--border-subtle)" }}>
        <SectionTexture kind="trail" color="#ff5100" at="90% 10%" opacity={0.22} />
        <div className="relative">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Group match
          </p>
          <h1 className="t-text text-3xl lg:text-4xl font-bold tracking-tight max-w-2xl">{title ?? "Find adventures your whole group is ready for"}</h1>
          <p className="text-sm sm:text-base mt-2 max-w-2xl" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>

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
      {children}
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[24px] border p-5 sm:p-6 ${className}`} style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
      {children}
    </section>
  );
}

function MembersHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="t-text text-lg font-bold">In this group</h2>
      <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-tertiary)" }}>{count} / {MAX_GROUP}</span>
    </div>
  );
}

function MemberChip({ name, ace, color, isMe, isOwner, isNew, action }: {
  name: string; ace: ACE; color: string; isMe: boolean; isOwner?: boolean; isNew?: boolean; action?: ReactNode;
}) {
  const total = Object.values(ace).reduce((a, b) => a + b, 0);
  return (
    <li className="flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: "var(--bg-card)", border: `1px solid ${isMe ? `${color}66` : "var(--border-subtle)"}` }}>
      <span className="w-9 h-9 rounded-full grid place-items-center text-sm font-bold shrink-0" style={{ background: `${color}22`, color }}>
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold t-text truncate">
          {name}
          {isOwner && <Crown className="w-3 h-3 shrink-0 text-amber-400" aria-label="Owner" />}
          {isMe && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>You</span>}
          {isNew && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>New</span>}
        </span>
        <span className="block text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>Fitness score {total}/40</span>
      </span>
      {action}
    </li>
  );
}

/** Children when there's a fitness profile; otherwise the "take the quick match" prompt. */
function ProfileGate({ ctx, children }: { ctx: Ctx; children: ReactNode }) {
  if (!ctx.ready) return <Skeleton />;
  if (ctx.ace) return <>{children}</>;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="flex items-start gap-2.5 flex-1 text-sm" style={{ color: "var(--text-secondary)" }}>
        <MatchmakerMark className="w-4 h-4 mt-0.5 shrink-0 text-[#ff5100]" />
        You need a fitness profile first. The quick match takes about a minute, and you&apos;ll come straight back here.
      </span>
      <PrimaryButton onClick={ctx.quizThenReturn}>Take the quick match <ArrowRight className="w-4 h-4" /></PrimaryButton>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, label, max }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; max: number }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={max}
      aria-label={label}
      className="px-3.5 py-2.5 rounded-xl text-sm sm:w-48"
      style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-default)", color: "var(--text-primary)", outline: "none" }}
    />
  );
}

function PrimaryButton({ onClick, disabled, full, children }: { onClick: () => void; disabled?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors shrink-0 disabled:opacity-50 ${full ? "w-full" : ""}`}>
      {children}
    </button>
  );
}

function IconButton({ onClick, label, disabled, children }: { onClick: () => void; label: string; disabled?: boolean; children: ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className="w-7 h-7 rounded-full grid place-items-center transition-colors hover:bg-[var(--bg-card-hover)] disabled:opacity-40" style={{ color: "var(--text-tertiary)" }}>
      {children}
    </button>
  );
}

function Banner({ children, tone, onDismiss }: { children: ReactNode; tone?: "good"; onDismiss?: () => void }) {
  const color = tone === "good" ? "#10b981" : "#ff7d47";
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm" style={{ background: `${color}14`, border: `1px solid ${color}55`, color: "var(--text-primary)" }}>
      <span className="flex-1">{children}</span>
      {onDismiss && <IconButton onClick={onDismiss} label="Dismiss"><X className="w-3.5 h-3.5" /></IconButton>}
    </div>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  return error ? <p role="alert" className="text-xs mt-3 text-rose-400">{error}</p> : null;
}

function Skeleton() {
  return <div className="h-11 rounded-xl animate-pulse" style={{ background: "var(--bg-card)" }} />;
}

function listNames(names: string[]) {
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// ─── Results ─────────────────────────────────────────────────────────────────

function GroupResults({ members }: { members: GroupMember[] }) {
  const { everyone, someStretch } = useMemo(
    () => (members.length >= 2 ? groupMatches(members, adventures) : { everyone: [], someStretch: [] }),
    [members]
  );

  if (members.length < 2) {
    return (
      <p className="text-sm mt-10" style={{ color: "var(--text-tertiary)" }}>
        Once at least two people have joined, the adventures you&apos;re all ready for appear here.
      </p>
    );
  }

  return (
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
