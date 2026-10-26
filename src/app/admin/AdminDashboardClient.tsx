"use client";

import { useState, useMemo, useEffect, useSyncExternalStore, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import NextImage from "next/image";
import {
  updateUserRole, deleteUser, banUser, unbanUser,
  sendPasswordReset, deleteMessage, updateStoryStatus, deleteStory,
  adminDeleteReview, adminDeletePhoto,
} from "./actions";
import { approveOperatorSubmission, rejectOperatorSubmission, type OperatorProfile, type OperatorSubmission } from "@/app/auth/operator-actions";
import { logout } from "@/app/auth/actions";
import ThemeToggleButton from "@/components/ui/custom/ThemeToggleButton";
import { getTier, getTierLabel } from "@/lib/tiers";
import { ACE_AXES, ACE_AXIS_LABELS, ACE_AXIS_COLORS } from "@/lib/ace";
import {
  LayoutDashboard, Users, Building2, Inbox, BookOpen, Star,   Search, Download, ExternalLink, LogOut, Trash2, Ban, UserCheck, RotateCcw, Send,
  CheckCircle2, XCircle, Copy, ChevronDown, ChevronRight, Loader2, Mail, Phone, Globe,
  Image as ImageIcon, MessageSquare, FileText, Clock, Sparkles, Heart, Bookmark, Map as MapIcon,
  MailOpen, Reply,
} from "lucide-react";
import { format, parseISO, subDays, startOfDay, differenceInCalendarDays, formatDistanceToNowStrict } from "date-fns";

// ── Types ──────────────────────────────────────────────────────────────────────

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  last_sign_in_at?: string | null;
  email_confirmed?: boolean;
  banned?: boolean;
  /** Flat ACE axes ({ stamina: 3, ... }) or null if they haven't taken the Matchmaker */
  ace?: Record<string, number> | null;
  ace_updated_at?: string | null;
  has_health_answers?: boolean;
  /** False when the account has no row in the profiles table (role can't be changed) */
  has_profile_row?: boolean;
  avatar_id?: number | null;
};

type Message = { id: string; user_id: string | null; email: string; name: string | null; message: string; created_at: string };

type StorySubmission = {
  id: string; slug: string; title: string; excerpt: string; body: string;
  author_name: string; author_role: string | null; author_bio: string | null; author_avatar: string | null;
  hero_image: string | null; tags: string[] | null; region: string; date: string; status: string;
  submitted_by: string | null; created_at: string;
};

type Review = { id: string; adventure_slug: string; user_id: string; username: string; rating: number; body: string; created_at: string };

type Photo = { id: string; slug: string; user_id: string; username: string; avatar_id: number | null; caption: string; url: string; path: string; created_at: string };

type Counts = { wishlists: number; savedSearches: number; adventures: number; destinations: number };

const SECTIONS = [
  { key: "overview",  label: "Overview",          icon: LayoutDashboard },
  { key: "people",    label: "People",            icon: Users },
  { key: "inbox",     label: "Inbox",             icon: Inbox },
  { key: "stories",   label: "Stories",           icon: BookOpen },
  { key: "community", label: "Reviews & photos",  icon: Star },
  { key: "operators", label: "Operators",         icon: Building2 },
] as const;
type SectionKey = typeof SECTIONS[number]["key"];

// Outside tools, one click from the sidebar
const TOOLS = [
  { label: "Vercel", href: "https://vercel.com/1bimanaz-1042s-projects/trailtotides" },
  { label: "Supabase", href: "https://supabase.com/dashboard/project/eylgddhfxzxwovcodihx" },
  { label: "Search Console", href: "https://search.google.com/search-console?resource_id=sc-domain%3Atrailtotides.com" },
  { label: "Resend", href: "https://resend.com/emails" },
  { label: "Zoho Mail", href: "https://mail.zoho.in" },
];

// ── Small helpers ──────────────────────────────────────────────────────────────

// Messages sent from our own addresses (setup tests, checks) aren't visitors contacting us
const TEAM_EMAILS = ["1.biman.az@gmail.com"];
const isInternal = (email: string) => {
  const e = email.trim().toLowerCase();
  return e.endsWith("@trailtotides.com") || TEAM_EMAILS.includes(e);
};

const aceTotal = (ace: Record<string, number>) => ACE_AXES.reduce((s, k) => s + (ace[k] ?? 0), 0);
const ago = (iso: string) => formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
const day = (iso: string) => format(parseISO(iso), "d MMM yyyy");
const initial = (s: string | null | undefined) => (s?.trim()?.[0] ?? "?").toUpperCase();

// Theme-aware status colours: darker text on the light theme, lighter on dark
const TONE = {
  ok:    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warn:  "bg-amber-500/12 text-amber-700 dark:text-amber-400",
  bad:   "bg-red-500/10 text-red-700 dark:text-red-400",
  info:  "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  brand: "bg-[#ff5100]/10 text-[#c44200] dark:text-[#ff7d47]",
  muted: "bg-[var(--bg-surface-2)] text-[var(--text-tertiary)]",
} as const;

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const show = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };
  return { toast, show };
}

// Read / replied marks for the inbox live in this browser, so they survive a reload
const INBOX_KEY = "ttt_admin_inbox";
function useInboxMarks() {
  const [marks, setMarks] = useState<{ read: string[]; replied: string[] }>({ read: [], replied: [] });
  useEffect(() => {
    try { const raw = localStorage.getItem(INBOX_KEY); if (raw) setMarks(JSON.parse(raw)); } catch {}
  }, []);
  const update = (fn: (m: { read: string[]; replied: string[] }) => { read: string[]; replied: string[] }) =>
    setMarks((m) => { const next = fn(m); try { localStorage.setItem(INBOX_KEY, JSON.stringify(next)); } catch {} return next; });
  return {
    isRead: (id: string) => marks.read.includes(id),
    isReplied: (id: string) => marks.replied.includes(id),
    markRead: (id: string) => update((m) => (m.read.includes(id) ? m : { ...m, read: [...m.read, id] })),
    markUnread: (id: string) => update((m) => ({ ...m, read: m.read.filter((x) => x !== id) })),
    markReplied: (id: string) => update((m) => ({ read: m.read.includes(id) ? m.read : [...m.read, id], replied: m.replied.includes(id) ? m.replied : [...m.replied, id] })),
  };
}

// ── UI primitives ──────────────────────────────────────────────────────────────

function Card({ children, className = "", pad = true, accent }: { children: ReactNode; className?: string; pad?: boolean; accent?: string }) {
  return (
    <div className={`rounded-2xl border ${pad ? "p-5" : ""} ${className}`} style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)", ...(accent ? { borderLeft: `4px solid ${accent}` } : {}) }}>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff5100] mb-1">{children}</p>;
}

function CardTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div>
        {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.18em] t-text-3 mb-0.5">{eyebrow}</p>}
        <h3 className="text-[15px] font-semibold t-text">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function Pill({ tone = "muted", children }: { tone?: keyof typeof TONE; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${TONE[tone]}`}>{children}</span>;
}

function Chip({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold border whitespace-nowrap shrink-0 transition-colors ${active ? "bg-[#ff5100] border-[#ff5100] text-white" : "t-text-2 hover:text-[var(--text-primary)]"}`}
      style={active ? undefined : { borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
    >
      {children}
      {count != null && <span className={`text-[10px] tabular-nums ${active ? "text-white/80" : "t-text-3"}`}>{count}</span>}
    </button>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative flex-1 min-w-[200px] max-w-sm">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 t-text-3" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-3 rounded-xl text-[13px] t-text outline-none focus:ring-2 focus:ring-[#ff5100]/30"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
      />
    </label>
  );
}

function Empty({ icon: Icon, title, hint }: { icon: typeof Inbox; title: string; hint?: string }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-11 h-11 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--bg-surface-2)" }}>
        <Icon className="w-5 h-5 t-text-3" />
      </div>
      <p className="text-sm font-semibold t-text-2">{title}</p>
      {hint && <p className="text-[12px] t-text-3 mt-1 max-w-xs mx-auto">{hint}</p>}
    </div>
  );
}

function Avatar({ name, tone = "brand" }: { name: string | null | undefined; tone?: keyof typeof TONE }) {
  return <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[13px] shrink-0 ${TONE[tone]}`}>{initial(name)}</div>;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
      className="p-1 rounded-md t-text-3 hover:text-[var(--text-primary)] transition-colors"
      title="Copy"
    >
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

/**
 * With `confirm`, the first click only arms the button (its label becomes the question) and the
 * second click runs it; it disarms itself after a few seconds. The browser's confirm() box isn't
 * used: some browsers (embedded panes, apps) never show it and answer "no", so nothing happened.
 */
function ActionBtn({ onClick, icon: Icon, children, tone = "default", disabled, href, confirm }: {
  onClick?: () => void; icon: typeof Send; children: ReactNode; tone?: "default" | "danger" | "primary" | "ok"; disabled?: boolean; href?: string; confirm?: string;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  if (confirm && armed) {
    return (
      <button
        onClick={() => { setArmed(false); onClick?.(); }}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40"
        autoFocus
      >
        <Icon className="w-3.5 h-3.5" />{confirm}
      </button>
    );
  }
  const handle = confirm ? () => setArmed(true) : onClick;
  const toneCls = {
    default: "t-text-2 hover:text-[var(--text-primary)]",
    danger: "text-red-700 dark:text-red-400 hover:bg-red-500/10",
    ok: "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10",
    primary: "bg-[#ff5100] text-white border-[#ff5100] hover:bg-[#ff6a1f]",
  }[tone];
  const cls = `inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold border transition-colors disabled:opacity-40 ${toneCls}`;
  const style = tone === "primary" ? undefined : { borderColor: "var(--border-subtle)" };
  if (href) return <a href={href} onClick={onClick} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={cls} style={style}><Icon className="w-3.5 h-3.5" />{children}</a>;
  return <button onClick={handle} disabled={disabled} className={cls} style={style}><Icon className="w-3.5 h-3.5" />{children}</button>;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? "fill-amber-400 text-amber-400" : "t-text-3"}`} />)}
    </span>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

// Every date and "ago" here must use the reader's clock and time zone. Rendered on the server
// (UTC) they came out a day off for India in the evening, and the mismatch broke hydration
// (React error #418). This page is private and dynamic, so it simply renders in the browser.
const noSubscribe = () => () => {};
export default function AdminDashboardClient(props: ComponentProps<typeof Dashboard>) {
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);
  if (!inBrowser) return <div className="min-h-screen" style={{ background: "var(--bg-page)" }} aria-busy="true" />;
  return <Dashboard {...props} />;
}

function Dashboard({
  profiles, currentUserId, messages = [], storySubmissions = [], operatorProfiles = [], operatorSubmissions = [],
  reviews = [], photos = [], counts, adventureNames,
}: {
  profiles: Profile[];
  currentUserId: string;
  messages?: Message[];
  storySubmissions?: StorySubmission[];
  operatorProfiles?: OperatorProfile[];
  operatorSubmissions?: OperatorSubmission[];
  reviews?: Review[];
  photos?: Photo[];
  counts: Counts;
  adventureNames: Record<string, string>;
}) {
  const [section, setSection] = useState<SectionKey>("overview");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [people, setPeople] = useState<Profile[]>(profiles);
  const [inbox, setInbox] = useState<Message[]>(messages);
  const [stories, setStories] = useState<StorySubmission[]>(storySubmissions);
  const [subs, setSubs] = useState<OperatorSubmission[]>(operatorSubmissions);
  const [reviewList, setReviewList] = useState<Review[]>(reviews);
  const [photoList, setPhotoList] = useState<Photo[]>(photos);
  const marks = useInboxMarks();
  const { toast, show: showToast } = useToast();
  const advName = (slug: string) => adventureNames[slug] ?? slug;

  // The section lives in the address (#people), so a reload or a shared link opens the same place
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (SECTIONS.some((s) => s.key === h)) setSection(h as SectionKey);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  const go = (key: SectionKey) => {
    setSection(key);
    history.replaceState(null, "", `#${key}`);
    window.scrollTo({ top: 0 });
  };

  // Keys 1–7 jump between sections
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= SECTIONS.length) go(SECTIONS[n - 1].key);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ── Counts ──────────────────────────────────────────────────────────────────
  const visitorInbox = inbox.filter((m) => !isInternal(m.email));
  const unread = visitorInbox.filter((m) => !marks.isRead(m.id)).length;
  const pendingStories = stories.filter((s) => s.status === "pending").length;
  const pendingSubs = subs.filter((s) => s.status === "pending").length;
  const lowReviews = reviewList.filter((r) => r.rating <= 2);
  const weekAgo = subDays(new Date(), 7);
  const newThisWeek = people.filter((p) => parseISO(p.created_at) >= weekAgo).length;
  const withAce = people.filter((p) => p.ace).length;

  const badges: Partial<Record<SectionKey, number>> = {
    inbox: unread, stories: pendingStories, operators: pendingSubs,
  };

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function run(id: string, fn: () => Promise<unknown>, ok: string, after?: () => void) {
    setLoadingId(id);
    try {
      const res = await fn();
      if (res && typeof res === "object" && "error" in res && (res as { error?: string }).error) {
        showToast((res as { error: string }).error, "error");
        return;
      }
      after?.();
      showToast(ok);
    } catch {
      showToast("That didn't work. Try again.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  const userActions = {
    role: (p: Profile, role: string) => run(p.id, () => updateUserRole(p.id, role), `${p.full_name ?? p.email} is now ${role}`, () => setPeople((l) => l.map((x) => (x.id === p.id ? { ...x, role } : x)))),
    ban: (p: Profile) => run(p.id, () => banUser(p.id), "Account banned", () => setPeople((l) => l.map((x) => (x.id === p.id ? { ...x, banned: true } : x)))),
    unban: (p: Profile) => run(p.id, () => unbanUser(p.id), "Ban lifted", () => setPeople((l) => l.map((x) => (x.id === p.id ? { ...x, banned: false } : x)))),
    reset: (p: Profile) => p.email && run(p.id, () => sendPasswordReset(p.email!), `Reset link sent to ${p.email}`),
    remove: (p: Profile) => run(p.id, () => deleteUser(p.id), "Account deleted", () => setPeople((l) => l.filter((x) => x.id !== p.id))),
  };

  // ── Activity feed: everything that happened, newest first ─────────────────────
  const activity = useMemo(() => {
    type Ev = { at: string; icon: typeof Users; tone: keyof typeof TONE; text: string; sub?: string; to: SectionKey };
    const ev: Ev[] = [
      ...people.map((p) => ({ at: p.created_at, icon: Users, tone: "brand" as const, text: `${p.full_name ?? p.email ?? "Someone"} signed up`, sub: p.email ?? undefined, to: "people" as const })),
      ...people.filter((p) => p.ace_updated_at).map((p) => ({ at: p.ace_updated_at!, icon: Sparkles, tone: "info" as const, text: `${p.full_name ?? p.email} saved an ACE profile`, sub: getTierLabel(aceTotal(p.ace!)), to: "people" as const })),
      ...reviewList.map((r) => ({ at: r.created_at, icon: Star, tone: r.rating <= 2 ? "bad" as const : "warn" as const, text: `${r.username} rated ${advName(r.adventure_slug)} ${r.rating}★`, sub: r.body.slice(0, 80), to: "community" as const })),
      ...photoList.map((p) => ({ at: p.created_at, icon: ImageIcon, tone: "info" as const, text: `${p.username} added a photo to ${advName(p.slug)}`, sub: p.caption || undefined, to: "community" as const })),
      ...visitorInbox.map((m) => ({ at: m.created_at, icon: MessageSquare, tone: "ok" as const, text: `Message from ${m.name ?? m.email}`, sub: m.message.slice(0, 80), to: "inbox" as const })),
      ...stories.map((s) => ({ at: s.created_at, icon: BookOpen, tone: "brand" as const, text: `Story: ${s.title}`, sub: `${s.author_name} · ${s.status}`, to: "stories" as const })),
      ...subs.map((s) => ({ at: s.created_at, icon: Building2, tone: "info" as const, text: `${s.company_name || s.operator_name} listed ${advName(s.adventure_slug)}`, sub: `₹${s.price_from} · ${s.status}`, to: "operators" as const })),
    ];
    return ev.filter((e) => e.at).sort((a, b) => b.at.localeCompare(a.at));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people, reviewList, photoList, visitorInbox, stories, subs]);

  // Signups per day for the last 30 days
  const signups30 = useMemo(() => {
    const start = startOfDay(subDays(new Date(), 29));
    const days = Array.from({ length: 30 }, (_, i) => ({ date: subDays(new Date(), 29 - i), n: 0 }));
    people.forEach((p) => {
      const i = differenceInCalendarDays(parseISO(p.created_at), start);
      if (i >= 0 && i < 30) days[i].n++;
    });
    return days;
  }, [people]);

  const sectionMeta: Record<SectionKey, { eyebrow: string; title: string; blurb: string }> = {
    overview:  { eyebrow: "Admin", title: "Today on Trail to Tides", blurb: "What needs you, what's happening, and how the site is growing." },
    people:    { eyebrow: "Accounts", title: "People", blurb: "Everyone with an account: roles, ACE profiles, sign-ins and account actions." },
    inbox:     { eyebrow: "Contact form", title: "Inbox", blurb: "Messages from the contact page. Read and replied marks are kept in this browser." },
    stories:   { eyebrow: "Field stories", title: "Stories", blurb: "Submitted stories waiting for review, and everything already published." },
    community: { eyebrow: "Community", title: "Reviews & photos", blurb: "What travellers post on adventure pages. Remove anything that breaks the rules." },
    operators: { eyebrow: "Partners", title: "Operators", blurb: "Operator accounts and the prices and dates they submit for approval." },
  };
  const meta = sectionMeta[section];

  return (
    <div className="min-h-screen lg:flex" style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-[13px] font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border ${toast.type === "error" ? "text-red-700 dark:text-red-300" : "t-text"}`}
          style={{ background: "var(--bg-surface)", borderColor: toast.type === "error" ? "rgba(239,68,68,0.35)" : "var(--border-default)" }}
          role="status"
        >
          {toast.type === "error" ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {toast.msg}
        </div>
      )}

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r px-4 py-5" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}>
        <Wordmark />
        <nav className="mt-8 space-y-0.5" aria-label="Admin sections">
          {SECTIONS.map(({ key, label, icon: Icon }, i) => {
            const active = section === key;
            const badge = badges[key];
            return (
              <button
                key={key}
                onClick={() => go(key)}
                className={`w-full flex items-center gap-3 h-10 px-3 rounded-xl text-[13px] font-semibold transition-colors ${active ? "bg-[#ff5100]/10 text-[#c44200] dark:text-[#ff7d47]" : "t-text-2 hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]"}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge ? <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#ff5100] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">{badge}</span>
                  : <kbd className="text-[10px] t-text-3 font-mono opacity-60">{i + 1}</kbd>}
              </button>
            );
          })}
        </nav>

        <div className="mt-8">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] t-text-3 mb-1.5">Tools</p>
          {TOOLS.map((t) => (
            <a key={t.label} href={t.href} target="_blank" rel="noreferrer" className="flex items-center justify-between h-8 px-3 rounded-lg text-[12px] t-text-2 hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors">
              {t.label}<ExternalLink className="w-3 h-3 t-text-3" />
            </a>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t flex items-center gap-1" style={{ borderColor: "var(--border-subtle)" }}>
          <Link href="/" className="flex-1 flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] font-semibold t-text-2 hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]">
            <ExternalLink className="w-3.5 h-3.5" />View site
          </Link>
          <ThemeToggleButton />
          <form action={logout}>
            <button type="submit" title="Sign out" className="h-9 w-9 flex items-center justify-center rounded-lg t-text-2 hover:text-red-600 hover:bg-red-500/10">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* ── Top bar (phones and tablets) ── */}
      <div className="lg:hidden sticky top-0 z-30 border-b" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center justify-between px-4 h-14">
          <Wordmark />
          <div className="flex items-center gap-1">
            <ThemeToggleButton />
            <form action={logout}><button type="submit" title="Sign out" className="h-9 w-9 flex items-center justify-center rounded-lg t-text-2"><LogOut className="w-4 h-4" /></button></form>
          </div>
        </div>
        <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none]" aria-label="Admin sections">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <Chip key={key} active={section === key} onClick={() => go(key)} count={badges[key] || undefined}>
              <Icon className="w-3.5 h-3.5" />{label}
            </Chip>
          ))}
        </nav>
      </div>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-9">
        <div className="max-w-6xl mx-auto">
          <header className="mb-7">
            <Eyebrow>{meta.eyebrow}</Eyebrow>
            <h1 className="text-3xl sm:text-4xl t-text" style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 600, letterSpacing: "-0.02em" }}>{meta.title}</h1>
            <p className="text-[14px] t-text-2 mt-1.5">{meta.blurb}</p>
          </header>

          {section === "overview" && (
            <Overview
              go={go}
              people={people}
              newThisWeek={newThisWeek}
              withAce={withAce}
              unread={unread}
              pendingStories={pendingStories}
              pendingSubs={pendingSubs}
              lowReviews={lowReviews.length}
              reviews={reviewList.length}
              photos={photoList.length}
              messages={visitorInbox.length}
              counts={counts}
              stories={stories}
              activity={activity}
              signups30={signups30}
            />
          )}
          {section === "people" && <People people={people} currentUserId={currentUserId} loadingId={loadingId} actions={userActions} />}
          {section === "inbox" && (
            <InboxSection
              inbox={inbox}
              marks={marks}
              loadingId={loadingId}
              onDelete={(m) => run(m.id, () => deleteMessage(m.id), "Message deleted", () => setInbox((l) => l.filter((x) => x.id !== m.id)))}
            />
          )}
          {section === "stories" && (
            <StoriesSection
              stories={stories}
              loadingId={loadingId}
              onStatus={(s, action) => run(s.id, () => updateStoryStatus(s.id, action === "publish" ? "approved" : "rejected"), action === "publish" ? "Story published" : "Story moved to drafts", () => setStories((l) => l.map((x) => (x.id === s.id ? { ...x, status: action === "publish" ? "published" : "draft" } : x))))}
              onDelete={(s) => run(s.id, () => deleteStory(s.id), "Story deleted", () => setStories((l) => l.filter((x) => x.id !== s.id)))}
            />
          )}
          {section === "community" && (
            <CommunitySection
              reviews={reviewList}
              photos={photoList}
              advName={advName}
              loadingId={loadingId}
              onDeleteReview={(r) => run(r.id, () => adminDeleteReview(r.id), "Review deleted", () => setReviewList((l) => l.filter((x) => x.id !== r.id)))}
              onDeletePhoto={(p) => run(p.id, () => adminDeletePhoto(p.id, p.slug, p.path), "Photo deleted", () => setPhotoList((l) => l.filter((x) => x.id !== p.id)))}
            />
          )}
          {section === "operators" && (
            <OperatorsSection
              operators={operatorProfiles}
              subs={subs}
              advName={advName}
              loadingId={loadingId}
              onDecide={(s, approve) => run(s.id, () => (approve ? approveOperatorSubmission(s.id) : rejectOperatorSubmission(s.id)), approve ? "Approved: now live on the adventure page" : "Rejected", () => setSubs((l) => l.map((x) => (x.id === s.id ? { ...x, status: approve ? "approved" : "rejected" } : x))))}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-1">
      <span className="text-[15px] leading-none tracking-tight t-text">
        <span className="font-black uppercase">Trail</span>
        <span style={{ fontFamily: "var(--font-script), cursive", fontWeight: 600 }} className="text-[15px] normal-case tracking-normal mx-1 t-text-2">to</span>
        <span className="font-black uppercase">Tides</span>
      </span>
      <Pill tone="brand">Admin</Pill>
    </Link>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────

function Overview(props: {
  go: (k: SectionKey) => void; people: Profile[]; newThisWeek: number; withAce: number; unread: number;
  pendingStories: number; pendingSubs: number; lowReviews: number;
  reviews: number; photos: number; messages: number; counts: Counts; stories: StorySubmission[];
  activity: { at: string; icon: typeof Users; tone: keyof typeof TONE; text: string; sub?: string; to: SectionKey }[];
  signups30: { date: Date; n: number }[];
}) {
  const { go, people } = props;
  const todo = [
    { n: props.pendingStories, label: "stories waiting for review", to: "stories" as const, icon: BookOpen },
    { n: props.pendingSubs, label: "operator listings to approve", to: "operators" as const, icon: Building2 },
    { n: props.unread, label: "unread messages", to: "inbox" as const, icon: Inbox },
    { n: props.lowReviews, label: "reviews rated 2★ or lower", to: "community" as const, icon: Star },
  ].filter((t) => t.n > 0);

  const ranks = new Map<string, number>();
  people.forEach((p) => { if (p.ace) { const r = getTierLabel(aceTotal(p.ace)); ranks.set(r, (ranks.get(r) ?? 0) + 1); } });
  const maxDay = Math.max(1, ...props.signups30.map((d) => d.n));
  const signups30Total = props.signups30.reduce((s, d) => s + d.n, 0);
  const published = props.stories.filter((s) => s.status === "published").length;

  const kpis = [
    { label: "Accounts", value: people.length, sub: props.newThisWeek ? `+${props.newThisWeek} this week` : "None new this week", icon: Users, to: "people" as const },
    { label: "ACE profiles", value: props.withAce, sub: `${people.length ? Math.round((props.withAce / people.length) * 100) : 0}% of accounts`, icon: Sparkles, to: "people" as const },
    { label: "Wishlist saves", value: props.counts.wishlists, sub: "across all accounts", icon: Heart, to: "people" as const },
    { label: "Saved searches", value: props.counts.savedSearches, sub: "with alerts on", icon: Bookmark, to: "people" as const },
    { label: "Reviews", value: props.reviews, sub: `${props.photos} photo${props.photos === 1 ? "" : "s"}`, icon: Star, to: "community" as const },
    { label: "Messages", value: props.messages, sub: props.unread ? `${props.unread} unread` : "All read", icon: Inbox, to: "inbox" as const },
  ];

  return (
    <div className="space-y-5">
      {/* Needs you */}
      <Card className={todo.length ? "" : "flex items-center gap-4"}>
        {todo.length ? (
          <>
            <CardTitle eyebrow="Needs you" title={`${todo.length} thing${todo.length === 1 ? "" : "s"} to look at`} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {todo.map((t) => (
                <button key={t.label} onClick={() => go(t.to)} className="group flex items-center gap-3 p-3 rounded-xl border text-left transition-colors hover:border-[#ff5100]/50" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-page)" }}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${TONE.brand}`}><t.icon className="w-4 h-4" /></div>
                  <p className="flex-1 text-[13px] t-text-2"><span className="text-lg font-bold t-text tabular-nums mr-1">{t.n}</span>{t.label}</p>
                  <ChevronRight className="w-4 h-4 t-text-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${TONE.ok}`}><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <p className="text-[15px] font-semibold t-text">All clear</p>
              <p className="text-[13px] t-text-2">No stories, listings, messages or low reviews waiting for you.</p>
            </div>
          </>
        )}
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <button key={k.label} onClick={() => go(k.to)} className="text-left rounded-2xl border p-4 transition-colors hover:border-[#ff5100]/40" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <k.icon className="w-4 h-4 text-[#ff5100] mb-3" />
            <p className="text-2xl font-bold t-text tabular-nums leading-none">{k.value}</p>
            <p className="text-[12px] font-semibold t-text-2 mt-1.5">{k.label}</p>
            <p className="text-[11px] t-text-3 mt-0.5">{k.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
        {/* Activity */}
        <Card>
          <CardTitle eyebrow="Activity" title="What's been happening" />
          {props.activity.length ? (
            <ol className="relative">
              {props.activity.slice(0, 14).map((e, i) => (
                <li key={i}>
                  <button onClick={() => go(e.to)} className="w-full flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-xl text-left hover:bg-[var(--bg-surface-2)] transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${TONE[e.tone]}`}><e.icon className="w-3.5 h-3.5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] t-text truncate">{e.text}</p>
                      {e.sub && <p className="text-[12px] t-text-3 truncate">{e.sub}</p>}
                    </div>
                    <span className="text-[11px] t-text-3 whitespace-nowrap pt-0.5">{ago(e.at)}</span>
                  </button>
                </li>
              ))}
            </ol>
          ) : <Empty icon={Clock} title="Nothing yet" />}
        </Card>

        <div className="space-y-5">
          {/* Signups */}
          <Card>
            <CardTitle eyebrow="Last 30 days" title={`${signups30Total} new account${signups30Total === 1 ? "" : "s"}`} />
            <div className="flex items-end gap-[3px] h-20" aria-label="Signups per day, last 30 days">
              {props.signups30.map((d, i) => (
                <div key={i} className="flex-1 rounded-t-[3px] min-h-[3px]" title={`${format(d.date, "d MMM")}: ${d.n}`}
                  style={{ height: `${(d.n / maxDay) * 100}%`, background: d.n ? "#ff5100" : "var(--bg-surface-2)" }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] t-text-3 mt-1.5">
              <span>{format(props.signups30[0].date, "d MMM")}</span><span>Today</span>
            </div>
          </Card>

          {/* ACE ranks */}
          <Card>
            <CardTitle eyebrow="Matchmaker" title="ACE ranks" />
            {props.withAce ? (
              <div className="space-y-2">
                {["Pathfinder", "Navigator", "Trailblazer", "Vanguard", "Apex"].map((r) => {
                  const n = ranks.get(r) ?? 0;
                  return (
                    <div key={r} className="flex items-center gap-3 text-[12px]">
                      <span className="w-20 font-semibold" style={{ color: getTier(r).color }}>{r}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-2)" }}>
                        <div className="h-full rounded-full" style={{ width: `${(n / props.withAce) * 100}%`, background: getTier(r).color }} />
                      </div>
                      <span className="w-5 text-right tabular-nums t-text-2">{n}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-[13px] t-text-3">No one has saved an ACE profile yet.</p>}
          </Card>

          {/* Site content */}
          <Card>
            <CardTitle eyebrow="On the site" title="Content" />
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                { n: props.counts.adventures, l: "Adventures", icon: MapIcon },
                { n: props.counts.destinations, l: "Destinations", icon: Globe },
                { n: published, l: "Stories", icon: BookOpen },
              ].map((c) => (
                <div key={c.l} className="rounded-xl py-3" style={{ background: "var(--bg-page)" }}>
                  <dd className="text-xl font-bold t-text tabular-nums">{c.n}</dd>
                  <dt className="text-[11px] t-text-3">{c.l}</dt>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── People ─────────────────────────────────────────────────────────────────────

type UserActions = { role: (p: Profile, r: string) => void; ban: (p: Profile) => void; unban: (p: Profile) => void; reset: (p: Profile) => void; remove: (p: Profile) => void };

function People({ people, currentUserId, loadingId, actions }: { people: Profile[]; currentUserId: string; loadingId: string | null; actions: UserActions }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "operator" | "ace" | "banned" | "unverified">("all");
  const [open, setOpen] = useState<string | null>(null);

  const match = (p: Profile) =>
    filter === "all" ? true : filter === "ace" ? !!p.ace : filter === "banned" ? !!p.banned : filter === "unverified" ? !p.email_confirmed : p.role === filter;
  const list = people.filter((p) => match(p) && (!q || `${p.full_name ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  const n = (f: typeof filter) => people.filter((p) => (f === "all" ? true : f === "ace" ? !!p.ace : f === "banned" ? !!p.banned : f === "unverified" ? !p.email_confirmed : p.role === f)).length;

  async function exportSheet() {
    const XLSX = await import("xlsx");
    const rows = list.map((p) => ({
      Name: p.full_name ?? "", Email: p.email ?? "", Phone: p.phone ?? "", Role: p.role,
      Verified: p.email_confirmed ? "Yes" : "No", Banned: p.banned ? "Yes" : "No",
      "ACE rank": p.ace ? getTierLabel(aceTotal(p.ace)) : "", "ACE total": p.ace ? aceTotal(p.ace) : "",
      Joined: format(parseISO(p.created_at), "yyyy-MM-dd HH:mm"),
      "Last sign-in": p.last_sign_in_at ? format(parseISO(p.last_sign_in_at), "yyyy-MM-dd HH:mm") : "",
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "People");
    XLSX.writeFile(wb, `TrailToTides_People_${format(new Date(), "yyyyMMdd")}.xlsx`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox value={q} onChange={setQ} placeholder="Search name or email" />
        {([["all", "All"], ["admin", "Admins"], ["operator", "Operators"], ["ace", "With ACE"], ["unverified", "Unverified"], ["banned", "Banned"]] as const).map(([k, l]) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)} count={n(k)}>{l}</Chip>
        ))}
        <div className="ml-auto"><ActionBtn icon={Download} onClick={exportSheet}>Export</ActionBtn></div>
      </div>

      <Card pad={false} className="overflow-hidden">
        {list.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase tracking-[0.14em] t-text-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <th className="px-5 py-3">Person</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">ACE</th>
                  <th className="px-3 py-3 hidden md:table-cell">Joined</th><th className="px-3 py-3 hidden md:table-cell">Last sign-in</th><th className="px-3 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const self = p.id === currentUserId;
                  const isOpen = open === p.id;
                  const total = p.ace ? aceTotal(p.ace) : 0;
                  const rank = p.ace ? getTier(getTierLabel(total)) : null;
                  return (
                    <PersonRows key={p.id} p={p} self={self} isOpen={isOpen} rank={rank} total={total} loading={loadingId === p.id}
                      onToggle={() => setOpen(isOpen ? null : p.id)} actions={actions} />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty icon={Users} title="No one matches" hint="Try another filter or search." />}
      </Card>
      <p className="text-[12px] t-text-3">{list.length} of {people.length} accounts</p>
    </div>
  );
}

function PersonRows({ p, self, isOpen, rank, total, loading, onToggle, actions }: {
  p: Profile; self: boolean; isOpen: boolean; rank: ReturnType<typeof getTier> | null; total: number; loading: boolean; onToggle: () => void; actions: UserActions;
}) {
  return (
    <>
      <tr className="border-b cursor-pointer hover:bg-[var(--bg-surface-2)] transition-colors" style={{ borderColor: "var(--border-subtle)" }} onClick={onToggle}>
        <td className="px-5 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={p.full_name ?? p.email} tone={p.banned ? "bad" : "brand"} />
            <div className="min-w-0">
              <p className="font-semibold t-text truncate flex items-center gap-1.5">
                {p.full_name ?? "No name"}
                {self && <Pill tone="info">You</Pill>}
                {p.banned && <Pill tone="bad">Banned</Pill>}
                {!p.email_confirmed && <Pill tone="warn">Unverified</Pill>}
                {p.has_profile_row === false && <Pill tone="muted">No profile row</Pill>}
              </p>
              <p className="text-[12px] t-text-3 truncate">{p.email}</p>
            </div>
          </div>
        </td>
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          {self ? <Pill tone="brand">{p.role}</Pill> : (
            <select
              value={p.role}
              disabled={loading}
              onChange={(e) => actions.role(p, e.target.value)}
              className="h-8 rounded-lg px-2 text-[12px] font-semibold t-text outline-none capitalize"
              style={{ background: "var(--bg-page)", border: "1px solid var(--border-subtle)" }}
              aria-label={`Role for ${p.email}`}
            >
              <option value="user">User</option><option value="operator">Operator</option><option value="admin">Admin</option>
            </select>
          )}
        </td>
        <td className="px-3 py-3">
          {rank ? <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: rank.color }}>{rank.label}<span className="t-text-3 font-normal tabular-nums">{total}/40</span></span>
            : <span className="text-[12px] t-text-3">Not taken</span>}
        </td>
        <td className="px-3 py-3 hidden md:table-cell t-text-2 whitespace-nowrap">{day(p.created_at)}</td>
        <td className="px-3 py-3 hidden md:table-cell t-text-2 whitespace-nowrap">{p.last_sign_in_at ? ago(p.last_sign_in_at) : "Never"}</td>
        <td className="px-3 py-3">{loading ? <Loader2 className="w-4 h-4 animate-spin t-text-3" /> : <ChevronDown className={`w-4 h-4 t-text-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />}</td>
      </tr>
      {isOpen && (
        <tr className="border-b" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-page)" }}>
          <td colSpan={6} className="px-5 py-5">
            <div className="grid md:grid-cols-[1fr_1fr] gap-6">
              <div className="space-y-2 text-[12px]">
                <p className="flex items-center gap-2 t-text-2"><Mail className="w-3.5 h-3.5 t-text-3" />{p.email ?? "No email"}{p.email && <CopyBtn text={p.email} />}</p>
                {p.phone && <p className="flex items-center gap-2 t-text-2"><Phone className="w-3.5 h-3.5 t-text-3" />{p.phone}<CopyBtn text={p.phone} /></p>}
                <p className="flex items-center gap-2 t-text-2"><Clock className="w-3.5 h-3.5 t-text-3" />Joined {day(p.created_at)} · last sign-in {p.last_sign_in_at ? ago(p.last_sign_in_at) : "never"}</p>
                <p className="flex items-center gap-2 t-text-3 font-mono text-[11px]">{p.id}<CopyBtn text={p.id} /></p>
                {p.has_health_answers && <p className="t-text-3">Has answered the optional health questions.</p>}
                {!self && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    <ActionBtn icon={RotateCcw} onClick={() => actions.reset(p)} disabled={loading || !p.email}>Send reset link</ActionBtn>
                    {p.email && <ActionBtn icon={Send} href={`mailto:${p.email}`}>Email</ActionBtn>}
                    {p.banned ? <ActionBtn icon={UserCheck} tone="ok" onClick={() => actions.unban(p)} disabled={loading}>Lift ban</ActionBtn>
                      : <ActionBtn icon={Ban} tone="danger" onClick={() => actions.ban(p)} disabled={loading} confirm="Ban this account?">Ban</ActionBtn>}
                    <ActionBtn icon={Trash2} tone="danger" onClick={() => actions.remove(p)} disabled={loading} confirm="Delete for good?">Delete</ActionBtn>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] t-text-3 mb-2">ACE profile{p.ace_updated_at ? ` · ${ago(p.ace_updated_at)}` : ""}</p>
                {p.ace ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {ACE_AXES.map((k) => (
                      <div key={k} className="flex items-center gap-2 text-[11px]">
                        <span className="w-14 t-text-2">{ACE_AXIS_LABELS[k]}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-2)" }}>
                          <div className="h-full rounded-full" style={{ width: `${((p.ace![k] ?? 0) / 5) * 100}%`, background: ACE_AXIS_COLORS[k] }} />
                        </div>
                        <span className="w-3 tabular-nums t-text-2">{p.ace![k] ?? 0}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-[12px] t-text-3">They haven&apos;t taken the Matchmaker yet.</p>}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Inbox ──────────────────────────────────────────────────────────────────────

function InboxSection({ inbox, marks, loadingId, onDelete }: { inbox: Message[]; marks: ReturnType<typeof useInboxMarks>; loadingId: string | null; onDelete: (m: Message) => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");
  // Only visitors by default; our own test messages stay one click away
  const [showInternal, setShowInternal] = useState(false);
  const internal = inbox.filter((m) => isInternal(m.email)).length;
  const base = showInternal ? inbox : inbox.filter((m) => !isInternal(m.email));
  const list = base.filter((m) =>
    (filter === "all" || (filter === "unread" ? !marks.isRead(m.id) : marks.isReplied(m.id))) &&
    (!q || `${m.name ?? ""} ${m.email} ${m.message}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox value={q} onChange={setQ} placeholder="Search messages" />
        <Chip active={filter === "all"} onClick={() => setFilter("all")} count={base.length}>All</Chip>
        <Chip active={filter === "unread"} onClick={() => setFilter("unread")} count={base.filter((m) => !marks.isRead(m.id)).length}>Unread</Chip>
        <Chip active={filter === "replied"} onClick={() => setFilter("replied")} count={base.filter((m) => marks.isReplied(m.id)).length}>Replied</Chip>
        {internal > 0 && (
          <button onClick={() => setShowInternal(!showInternal)} className="ml-auto text-[12px] t-text-3 hover:text-[var(--text-primary)] underline underline-offset-2">
            {showInternal ? "Hide" : "Show"} {internal} from our own addresses
          </button>
        )}
      </div>
      {list.length ? list.map((m) => {
        const read = marks.isRead(m.id);
        const topic = m.message.match(/^\[([^\]]+)\]\s*/);
        return (
          <Card key={m.id} accent={read ? undefined : "#ff5100"}>
            <div className="flex items-start gap-3">
              <Avatar name={m.name ?? m.email} tone={read ? "muted" : "brand"} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className={`text-[14px] t-text ${read ? "font-medium" : "font-bold"}`}>{m.name ?? "No name"}</p>
                  <span className="text-[12px] t-text-3">{m.email}</span>
                  {topic && <Pill tone="info">{topic[1]}</Pill>}
                  {marks.isReplied(m.id) && <Pill tone="ok">Replied</Pill>}
                  <span className="text-[11px] t-text-3 ml-auto" title={format(parseISO(m.created_at), "d MMM yyyy, HH:mm")}>{ago(m.created_at)}</span>
                </div>
                <p className="text-[13px] t-text-2 mt-2 whitespace-pre-line leading-relaxed">{topic ? m.message.slice(topic[0].length) : m.message}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <ActionBtn icon={Reply} tone="primary" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Trail to Tides")}`} onClick={() => marks.markReplied(m.id)}>Reply</ActionBtn>
                  {read ? <ActionBtn icon={Mail} onClick={() => marks.markUnread(m.id)}>Mark unread</ActionBtn>
                    : <ActionBtn icon={MailOpen} onClick={() => marks.markRead(m.id)}>Mark read</ActionBtn>}
                  {!marks.isReplied(m.id) && <ActionBtn icon={CheckCircle2} onClick={() => marks.markReplied(m.id)}>Mark replied</ActionBtn>}
                  <ActionBtn icon={Trash2} tone="danger" onClick={() => onDelete(m)} disabled={loadingId === m.id} confirm="Delete message?">Delete</ActionBtn>
                </div>
              </div>
            </div>
          </Card>
        );
      }) : <Card><Empty icon={Inbox} title={filter === "unread" ? "Nothing unread" : "No messages"} /></Card>}
    </div>
  );
}

// ── Stories ────────────────────────────────────────────────────────────────────

const STORY_TONE: Record<string, keyof typeof TONE> = { pending: "warn", published: "ok", draft: "muted" };

function StoriesSection({ stories, loadingId, onStatus, onDelete }: {
  stories: StorySubmission[]; loadingId: string | null;
  onStatus: (s: StorySubmission, a: "publish" | "unpublish") => void; onDelete: (s: StorySubmission) => void;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "published" | "draft">(stories.some((s) => s.status === "pending") ? "pending" : "all");
  const [open, setOpen] = useState<string | null>(null);
  const list = stories.filter((s) => (filter === "all" || s.status === filter) && (!q || `${s.title} ${s.author_name} ${s.region}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox value={q} onChange={setQ} placeholder="Search title, author or region" />
        {([["pending", "Waiting"], ["published", "Published"], ["draft", "Drafts"], ["all", "All"]] as const).map(([k, l]) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k)} count={k === "all" ? stories.length : stories.filter((s) => s.status === k).length}>{l}</Chip>
        ))}
      </div>
      {list.length ? list.map((s) => {
        const isOpen = open === s.id;
        return (
          <Card key={s.id} pad={false} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              {s.hero_image && (
                <div className="relative sm:w-48 h-36 sm:h-auto shrink-0">
                  <NextImage src={s.hero_image} alt="" fill sizes="192px" className="object-cover" unoptimized={!s.hero_image.startsWith("/")} />
                </div>
              )}
              <div className="p-5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Pill tone={STORY_TONE[s.status] ?? "muted"}>{s.status === "draft" ? "Draft" : s.status === "pending" ? "Waiting" : "Published"}</Pill>
                  <span className="text-[12px] t-text-3">{s.region} · submitted {ago(s.created_at)}</span>
                </div>
                <h3 className="text-[17px] font-semibold t-text" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>{s.title}</h3>
                <p className="text-[12px] t-text-2 mt-0.5">{s.author_name}{s.author_role ? ` · ${s.author_role}` : ""}</p>
                <p className="text-[13px] t-text-2 mt-2 line-clamp-2">{s.excerpt}</p>
                {isOpen && (
                  <div className="mt-3 max-h-80 overflow-y-auto rounded-xl p-4 text-[13px] t-text-2 leading-relaxed whitespace-pre-line" style={{ background: "var(--bg-page)" }}>{s.body}</div>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <ActionBtn icon={FileText} onClick={() => setOpen(isOpen ? null : s.id)}>{isOpen ? "Hide story" : "Read story"}</ActionBtn>
                  {s.status === "published" && <ActionBtn icon={ExternalLink} href={`/stories/${s.slug}`}>View</ActionBtn>}
                  {s.status !== "published" && <ActionBtn icon={CheckCircle2} tone="primary" onClick={() => onStatus(s, "publish")} disabled={loadingId === s.id}>Publish</ActionBtn>}
                  {s.status !== "draft" && <ActionBtn icon={XCircle} onClick={() => onStatus(s, "unpublish")} disabled={loadingId === s.id}>{s.status === "pending" ? "Reject" : "Unpublish"}</ActionBtn>}
                  <ActionBtn icon={Trash2} tone="danger" onClick={() => onDelete(s)} disabled={loadingId === s.id} confirm="Delete for good?">Delete</ActionBtn>
                </div>
              </div>
            </div>
          </Card>
        );
      }) : <Card><Empty icon={BookOpen} title={filter === "pending" ? "No stories waiting" : "No stories"} /></Card>}
    </div>
  );
}

// ── Reviews & photos ───────────────────────────────────────────────────────────

function CommunitySection({ reviews, photos, advName, loadingId, onDeleteReview, onDeletePhoto }: {
  reviews: Review[]; photos: Photo[]; advName: (s: string) => string; loadingId: string | null;
  onDeleteReview: (r: Review) => void; onDeletePhoto: (p: Photo) => void;
}) {
  const [view, setView] = useState<"reviews" | "photos">("reviews");
  const [q, setQ] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const rs = reviews.filter((r) => (!lowOnly || r.rating <= 2) && (!q || `${r.username} ${r.body} ${advName(r.adventure_slug)}`.toLowerCase().includes(q.toLowerCase())));
  const ps = photos.filter((p) => !q || `${p.username} ${p.caption} ${advName(p.slug)}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={view === "reviews"} onClick={() => setView("reviews")} count={reviews.length}><Star className="w-3.5 h-3.5" />Reviews</Chip>
        <Chip active={view === "photos"} onClick={() => setView("photos")} count={photos.length}><ImageIcon className="w-3.5 h-3.5" />Photos</Chip>
        <SearchBox value={q} onChange={setQ} placeholder={view === "reviews" ? "Search reviews" : "Search photos"} />
        {view === "reviews" && <Chip active={lowOnly} onClick={() => setLowOnly(!lowOnly)} count={reviews.filter((r) => r.rating <= 2).length}>2★ or lower</Chip>}
        {view === "reviews" && reviews.length > 0 && <span className="ml-auto text-[12px] t-text-2">Average <b className="t-text">{avg.toFixed(1)}★</b></span>}
      </div>

      {view === "reviews" ? (
        rs.length ? rs.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Stars n={r.rating} />
              <Link href={`/experiences/${r.adventure_slug}`} className="text-[13px] font-semibold t-text hover:text-[#ff5100]">{advName(r.adventure_slug)}</Link>
              <span className="text-[12px] t-text-3">by {r.username} · {ago(r.created_at)}</span>
            </div>
            <p className="text-[13px] t-text-2 leading-relaxed">{r.body}</p>
            <div className="mt-3"><ActionBtn icon={Trash2} tone="danger" onClick={() => onDeleteReview(r)} disabled={loadingId === r.id} confirm="Delete review?">Delete</ActionBtn></div>
          </Card>
        )) : <Card><Empty icon={Star} title="No reviews" hint="Traveller reviews posted on adventure pages appear here. Seed reviews that ship with the site aren't listed." /></Card>
      ) : (
        ps.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ps.map((p) => (
              <Card key={p.id} pad={false} className="overflow-hidden">
                <div className="relative aspect-[4/3]"><NextImage src={p.url} alt={p.caption || "Traveller photo"} fill sizes="300px" className="object-cover" unoptimized /></div>
                <div className="p-3">
                  <p className="text-[12px] font-semibold t-text truncate">{advName(p.slug)}</p>
                  <p className="text-[11px] t-text-3 truncate">{p.username} · {ago(p.created_at)}</p>
                  {p.caption && <p className="text-[12px] t-text-2 mt-1 line-clamp-2">{p.caption}</p>}
                  <div className="mt-2"><ActionBtn icon={Trash2} tone="danger" onClick={() => onDeletePhoto(p)} disabled={loadingId === p.id} confirm="Delete photo?">Delete</ActionBtn></div>
                </div>
              </Card>
            ))}
          </div>
        ) : <Card><Empty icon={ImageIcon} title="No photos" /></Card>
      )}
    </div>
  );
}

// ── Operators ──────────────────────────────────────────────────────────────────

const SUB_TONE: Record<string, keyof typeof TONE> = { pending: "warn", approved: "ok", rejected: "bad" };

function OperatorsSection({ operators, subs, advName, loadingId, onDecide }: {
  operators: OperatorProfile[]; subs: OperatorSubmission[]; advName: (s: string) => string; loadingId: string | null;
  onDecide: (s: OperatorSubmission, approve: boolean) => void;
}) {
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">(subs.some((s) => s.status === "pending") ? "pending" : "all");
  const list = subs.filter((s) => filter === "all" || s.status === filter);

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="text-[15px] font-semibold t-text mr-2">Listings</h2>
          {(["pending", "approved", "rejected", "all"] as const).map((k) => (
            <Chip key={k} active={filter === k} onClick={() => setFilter(k)} count={k === "all" ? subs.length : subs.filter((s) => s.status === k).length}>
              {k === "pending" ? "Waiting" : k[0].toUpperCase() + k.slice(1)}
            </Chip>
          ))}
        </div>
        {list.length ? (
          <div className="space-y-3">
            {list.map((s) => (
              <Card key={s.id}>
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={SUB_TONE[s.status]}>{s.status === "pending" ? "Waiting" : s.status}</Pill>
                      <span className="text-[12px] t-text-3">{ago(s.created_at)}</span>
                    </div>
                    <p className="text-[15px] font-semibold t-text mt-1">{advName(s.adventure_slug)}</p>
                    <p className="text-[12px] t-text-2">{s.company_name || s.operator_name}{s.website ? <> · <a href={s.website} target="_blank" rel="noreferrer" className="hover:text-[#ff5100]">{s.website.replace(/^https?:\/\//, "")}</a></> : null}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold t-text tabular-nums">₹{s.price_from}</p>
                    <p className="text-[11px] t-text-3">from, per person</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[12px] t-text-2">
                  <span>{s.exact_dates?.length ? `${s.exact_dates.length} departure${s.exact_dates.length === 1 ? "" : "s"}: ${s.exact_dates.slice(0, 3).join(", ")}${s.exact_dates.length > 3 ? "…" : ""}` : "No fixed dates"}</span>
                  <span>Cloakroom {s.cloakroom ? `yes${s.cloakroom_charge ? ` (₹${s.cloakroom_charge})` : ""}` : "no"}</span>
                  <span>Offloading {s.offloading ? `yes${s.offloading_charge ? ` (₹${s.offloading_charge})` : ""}` : "no"}</span>
                </div>
                {s.notes && <p className="text-[12px] t-text-2 mt-2 rounded-lg p-3" style={{ background: "var(--bg-page)" }}>{s.notes}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  {s.status !== "approved" && <ActionBtn icon={CheckCircle2} tone="primary" onClick={() => onDecide(s, true)} disabled={loadingId === s.id}>Approve</ActionBtn>}
                  {s.status !== "rejected" && <ActionBtn icon={XCircle} tone="danger" onClick={() => onDecide(s, false)} disabled={loadingId === s.id}>Reject</ActionBtn>}
                  <ActionBtn icon={ExternalLink} href={`/experiences/${s.adventure_slug}`}>Adventure page</ActionBtn>
                </div>
              </Card>
            ))}
          </div>
        ) : <Card><Empty icon={FileText} title={filter === "pending" ? "No listings waiting" : "No listings"} hint="Operators submit prices and dates from their dashboard; they go live once approved." /></Card>}
      </section>

      <section>
        <h2 className="text-[15px] font-semibold t-text mb-3">Operator accounts <span className="t-text-3 font-normal">{operators.length}</span></h2>
        {operators.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {operators.map((o) => (
              <Card key={o.id}>
                <div className="flex items-center gap-3">
                  <Avatar name={o.company_name} tone="info" />
                  <div className="min-w-0">
                    <p className="font-semibold t-text truncate">{o.company_name}</p>
                    <p className="text-[12px] t-text-3 truncate">{o.contact_name} · joined {day(o.created_at)}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-[12px] t-text-2">
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 t-text-3" />{o.email}<CopyBtn text={o.email} /></p>
                  {o.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 t-text-3" />{o.phone}<CopyBtn text={o.phone} /></p>}
                  {o.website && <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 t-text-3" /><a href={o.website} target="_blank" rel="noreferrer" className="hover:text-[#ff5100] truncate">{o.website}</a></p>}
                </div>
              </Card>
            ))}
          </div>
        ) : <Card><Empty icon={Building2} title="No operator accounts yet" hint="Operators sign up at /auth/operator-signup." /></Card>}
      </section>
    </div>
  );
}
