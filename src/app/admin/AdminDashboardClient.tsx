"use client";

import { useState, useMemo, useEffect } from "react";
import {
  updateUserRole, deleteUser, banUser, unbanUser,
  sendPasswordReset, deleteMessage, updateStoryStatus, deleteStory,
  adminDeleteReview, adminDeletePhoto,
} from "./actions";
import { approveOperatorSubmission, rejectOperatorSubmission, type OperatorProfile, type OperatorSubmission } from "@/app/auth/operator-actions";
import { logout } from "@/app/auth/actions";
import {
  Mountain, Users, Shield, Trash2, ChevronDown, LogOut, Search, Download,
  BarChart3, Calendar, Filter, ArrowUpRight, TrendingUp, MessageSquare,
  ExternalLink, BookOpen, MapPin, Tag, Clock, Phone, Mail, Building2,
  CheckCircle2, AlertCircle, XCircle, Loader2, Globe, FileText,
  Ban, KeyRound, ChevronRight, Eye, Copy, Activity, Star, TrendingDown,
  Zap, UserCheck, UserX, RefreshCw, ChevronUp, Info, Package, DollarSign,
  Image, StarOff, ArrowUpDown, RotateCcw, Send,
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import * as Tabs from "@radix-ui/react-tabs";
import { format, subDays, isWithinInterval, startOfDay, endOfDay, parseISO, differenceInDays } from "date-fns";

// ── Types ──────────────────────────────────────────────────────────────────────

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  last_sign_in_at?: string | null;
  banned?: boolean;
  ace_profile?: { ace: Record<string, number> } | null;
  avatar_id?: number | null;
};

type Message = {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  message: string;
  created_at: string;
};

type StorySubmission = {
  id: string;
  _fileName?: string;
  title: string;
  excerpt: string;
  body: string;
  author_name: string;
  author_role: string | null;
  author_bio: string | null;
  email: string | null;
  phone: string | null;
  date_of_adventure: string;
  region: string;
  state: string | null;
  tags: string[] | null;
  read_time: string | null;
  hero_image_url: string | null;
  status: string;
  created_at: string;
};

type Review = {
  id: string;
  adventure_slug: string;
  user_id: string;
  username: string;
  rating: number;
  body: string;
  created_at: string;
};

type Photo = {
  id: string;
  slug: string;
  user_id: string;
  username: string;
  avatar_id: number | null;
  caption: string;
  url: string;
  path: string;
  created_at: string;
};

// ── Tooltip style ──────────────────────────────────────────────────────────────

const TT = {
  contentStyle: { backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12, color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" },
  itemStyle: { color: "#ff7d47" },
  labelStyle: { color: "rgba(255,255,255,0.5)", marginBottom: 4 },
};

// ── ACE™ rank helpers ───────────────────────────────────────────────────────────
const RANKS = ["Uncharted","Pathfinder","Navigator","Trailblazer","Vanguard","Apex"] as const;
const RANK_COLORS: Record<string,string> = { Uncharted:"#6b7280",Pathfinder:"#22d3ee",Navigator:"#4ade80",Trailblazer:"#f59e0b",Vanguard:"#f97316",Apex:"#a78bfa" };
function getRank(ace: Record<string,number>) {
  const total = Object.values(ace).reduce((a,b) => a+b, 0);
  if (total >= 40) return "Apex"; if (total >= 32) return "Vanguard";
  if (total >= 24) return "Trailblazer"; if (total >= 16) return "Navigator";
  if (total >= 8) return "Pathfinder"; return "Uncharted";
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const show = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };
  return { toast, show };
}

// ── Copy button ────────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded-md hover:bg-[var(--bg-surface-2)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
      title="Copy"
    >
      {copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ── Stat delta ─────────────────────────────────────────────────────────────────
function Delta({ value, label }: { value: number; label: string }) {
  if (value === 0) return <span className="text-[var(--text-muted)] text-[10px] font-semibold">No change</span>;
  const up = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{value} {label}
    </span>
  );
}

// ── User detail panel ──────────────────────────────────────────────────────────
function UserDetailPanel({
  profile, currentUserId, onAction, loadingId,
  storyCount = 0, messageCount = 0,
}: {
  profile: Profile;
  currentUserId: string;
  loadingId: string | null;
  onAction: (type: string, id: string, extra?: string) => void;
  storyCount?: number;
  messageCount?: number;
}) {
  const isSelf = profile.id === currentUserId;
  const ace = profile.ace_profile?.ace;
  const rank = ace ? getRank(ace) : null;
  const rankColor = rank ? RANK_COLORS[rank] : "#6b7280";
  const daysSinceJoin = differenceInDays(new Date(), parseISO(profile.created_at));
  const daysSinceLogin = profile.last_sign_in_at
    ? differenceInDays(new Date(), parseISO(profile.last_sign_in_at))
    : null;

  return (
    <tr>
      <td colSpan={7} className="px-0 py-0">
        <div className="mx-3 mb-2 rounded-2xl border p-5 grid grid-cols-1 md:grid-cols-2 gap-6"
          style={{ background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.07)" }}>

          {/* Identity + ACE™ */}
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Identity</p>
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              <span className="text-[12px] font-mono text-[var(--text-secondary)] truncate">{profile.email ?? "—"}</span>
              {profile.email && <CopyBtn text={profile.email} />}
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                <span className="text-[12px] font-mono text-[var(--text-secondary)]">{profile.phone}</span>
                <CopyBtn text={profile.phone} />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Joined {format(parseISO(profile.created_at), "MMM d, yyyy")}
                <span className="text-[var(--text-muted)] ml-1">({daysSinceJoin}d ago)</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              <span className={`text-[11px] ${daysSinceLogin != null && daysSinceLogin > 30 ? "text-amber-400/60" : "text-[var(--text-tertiary)]"}`}>
                {profile.last_sign_in_at
                  ? `Last active ${format(parseISO(profile.last_sign_in_at), "MMM d, yyyy")} · ${daysSinceLogin}d ago`
                  : "Never signed in"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              {ace ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold" style={{ color: rankColor }}>{rank}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${rankColor}18`, color: rankColor }}>
                    {Object.values(ace).reduce((a,b) => a+b, 0)} / 40
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-[var(--text-muted)]">No ACE<sup>™</sup> assessment</span>
              )}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-3 h-3 shrink-0" />
              <span className="text-[9px] font-mono text-[var(--text-muted)] truncate">{profile.id}</span>
              <CopyBtn text={profile.id} />
            </div>

            {/* Activity */}
            <div className="pt-2 mt-2 border-t border-[var(--border-subtle)]">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">Activity</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-[var(--border-subtle)]" style={{ background: "var(--bg-surface)" }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Stories</p>
                  <p className="text-sm font-black text-[#ff7d47]">{storyCount}</p>
                </div>
                <div className="p-2.5 rounded-xl border border-[var(--border-subtle)]" style={{ background: "var(--bg-surface)" }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Messages</p>
                  <p className="text-sm font-black text-emerald-400">{messageCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isSelf && (
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Actions</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => profile.email && onAction("reset", profile.id, profile.email)}
                  disabled={loadingId === profile.id}
                  title="Send Password Reset"
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all border border-[var(--border-subtle)] hover:border-blue-500/35 hover:bg-blue-500/8 text-[var(--text-tertiary)] hover:text-blue-300 disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <a
                  href={`mailto:${profile.email}`}
                  title="Email User"
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all border border-[var(--border-subtle)] hover:border-white/20 hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  <Send className="w-3.5 h-3.5" /> Email
                </a>
                <button
                  onClick={() => onAction(profile.banned ? "unban" : "ban", profile.id)}
                  disabled={loadingId === profile.id}
                  title={profile.banned ? "Unban User" : "Ban User"}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all border disabled:opacity-40 ${
                    profile.banned
                      ? "border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/8 text-emerald-400/70 hover:text-emerald-300"
                      : "border-amber-500/15 hover:border-amber-500/35 hover:bg-amber-500/8 text-[var(--text-tertiary)] hover:text-amber-300"
                  }`}
                >
                  {profile.banned ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                  {profile.banned ? "Unban" : "Ban"}
                </button>
                <button
                  onClick={() => onAction("delete", profile.id)}
                  disabled={loadingId === profile.id}
                  title="Delete Account"
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all border border-red-500/10 hover:border-red-500/35 hover:bg-red-500/8 text-[var(--text-muted)] hover:text-red-400 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Submission detail panel ────────────────────────────────────────────────────
function SubmissionDetailPanel({ sub, allSubmissions }: { sub: OperatorSubmission; allSubmissions?: OperatorSubmission[] }) {
  const otherPrices = allSubmissions?.filter(s =>
    s.adventure_slug === sub.adventure_slug && s.id !== sub.id && s.price_from
  ).map(s => s.price_from) ?? [];
  const avgPrice = otherPrices.length > 0
    ? Math.round(otherPrices.reduce((a,b) => a + b, 0) / otherPrices.length)
    : null;
  const priceDiff = avgPrice !== null ? sub.price_from - avgPrice : null;

  return (
    <tr>
      <td colSpan={6} className="px-0 py-0">
        <div className="mx-3 mb-2 rounded-2xl border p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2">Pricing</p>
            <p className="text-lg font-black text-[#ff7d47]">₹{sub.price_from}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Starting price per person</p>
            {priceDiff !== null && (
              <div className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                priceDiff <= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
              }`}>
                {priceDiff <= 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
                ₹{Math.abs(priceDiff)} {priceDiff <= 0 ? "below" : "above"} avg (₹{avgPrice})
              </div>
            )}
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2">Services</p>
            <div className="space-y-1">
              <div className={`flex items-center gap-1.5 text-[11px] ${sub.cloakroom ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                {sub.cloakroom ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                Cloakroom {sub.cloakroom && sub.cloakroom_charge ? `(₹${sub.cloakroom_charge})` : ""}
              </div>
              <div className={`flex items-center gap-1.5 text-[11px] ${sub.offloading ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                {sub.offloading ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                Offloading {sub.offloading && sub.offloading_charge ? `(₹${sub.offloading_charge})` : ""}
              </div>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2">All Dates</p>
            {sub.exact_dates?.length ? (
              <div className="flex flex-wrap gap-1">
                {sub.exact_dates.map((d,i) => (
                  <span key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[10px] px-2 py-0.5 rounded-lg font-mono">{d}</span>
                ))}
              </div>
            ) : <span className="text-[var(--text-muted)] text-[11px]">No specific dates listed</span>}
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2">Notes</p>
            {sub.notes ? (
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{sub.notes}</p>
            ) : <span className="text-[var(--text-muted)] text-[11px]">No notes</span>}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminDashboardClient({
  profiles,
  currentUserId,
  messages = [],
  storySubmissions = [],
  operatorProfiles = [],
  operatorSubmissions = [],
  reviews = [],
  photos = [],
}: {
  profiles: Profile[];
  currentUserId: string;
  messages?: Message[];
  storySubmissions?: StorySubmission[];
  operatorProfiles?: OperatorProfile[];
  operatorSubmissions?: OperatorSubmission[];
  operatorTablesExist?: boolean;
  reviews?: Review[];
  photos?: Photo[];
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [localProfiles, setLocalProfiles] = useState<Profile[]>(profiles);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [localStories, setLocalStories] = useState<StorySubmission[]>(storySubmissions);
  const [localOperatorProfiles] = useState<OperatorProfile[]>(operatorProfiles);
  const [localOperatorSubmissions, setLocalOperatorSubmissions] = useState<OperatorSubmission[]>(operatorSubmissions);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos);
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [storyFilter, setStoryFilter] = useState<"all"|"pending"|"approved"|"rejected">("all");
  const [msgSearch, setMsgSearch] = useState("");
  const [storySearch, setStorySearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [photoSearch, setPhotoSearch] = useState("");
  const [contentView, setContentView] = useState<"reviews"|"photos">("reviews");
  const [readMsgs, setReadMsgs] = useState<Set<string>>(new Set());
  const [repliedMsgs, setRepliedMsgs] = useState<Set<string>>(new Set());
  const [msgFilter, setMsgFilter] = useState<"all"|"unread"|"replied">("all");
  const { toast, show: showToast } = useToast();

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────────
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't fire when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      const tabIdx = parseInt(e.key);
      if (tabIdx >= 1 && tabIdx <= 7) {
        setActiveTab(TABS[tabIdx - 1].value);
      }
      if (e.key === "Escape") {
        setExpandedUserId(null);
        setExpandedStoryId(null);
        setExpandedSubId(null);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ── Derived counts ────────────────────────────────────────────────────────────
  const totalUsers = localProfiles.filter(p => p.role === "user").length;
  const totalAdmins = localProfiles.filter(p => p.role === "admin").length;
  const totalOperators = localProfiles.filter(p => p.role === "operator").length;
  const bannedCount = localProfiles.filter(p => p.banned).length;
  const aceCount = localProfiles.filter(p => !!p.ace_profile).length;
  const pendingOperatorSubmissions = localOperatorSubmissions.filter(s => s.status === "pending").length;
  const pendingStories = localStories.filter(s => s.status === "pending").length;

  // Week-over-week deltas
  const newLast7 = localProfiles.filter(p => {
    const d = parseISO(p.created_at);
    return isWithinInterval(d, { start: startOfDay(subDays(new Date(), 6)), end: endOfDay(new Date()) });
  }).length;
  const newPrev7 = localProfiles.filter(p => {
    const d = parseISO(p.created_at);
    return isWithinInterval(d, { start: startOfDay(subDays(new Date(), 13)), end: endOfDay(subDays(new Date(), 7)) });
  }).length;
  const weekDelta = newLast7 - newPrev7;

  // ── Filtered users ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return localProfiles.filter(p => {
      if (p.role === "operator") return false;
      const q = search.toLowerCase();
      const matchSearch = (p.full_name?.toLowerCase() ?? "").includes(q) || (p.email?.toLowerCase() ?? "").includes(q);
      const matchRole =
        roleFilter === "all" ? true :
        roleFilter === "banned" ? !!p.banned :
        roleFilter === "ace" ? !!p.ace_profile :
        p.role === roleFilter;
      let matchDate = true;
      if (dateRange !== "all") {
        const days = parseInt(dateRange.replace("d", ""));
        matchDate = isWithinInterval(parseISO(p.created_at), {
          start: startOfDay(subDays(new Date(), days)), end: endOfDay(new Date()),
        });
      }
      return matchSearch && matchRole && matchDate;
    });
  }, [localProfiles, search, roleFilter, dateRange]);

  // ── Filtered messages ──────────────────────────────────────────────────────
  const filteredMessages = useMemo(() => {
    let msgs = localMessages;
    if (msgSearch) {
      const q = msgSearch.toLowerCase();
      msgs = msgs.filter(m =>
        (m.name?.toLowerCase() ?? "").includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    if (msgFilter === "unread") {
      msgs = msgs.filter(m => !readMsgs.has(m.id));
    } else if (msgFilter === "replied") {
      msgs = msgs.filter(m => repliedMsgs.has(m.id));
    }
    return msgs;
  }, [localMessages, msgSearch, msgFilter, readMsgs, repliedMsgs]);

  // ── Filtered stories ───────────────────────────────────────────────────────
  const filteredStories = useMemo(() => {
    return localStories.filter(s => {
      const matchStatus = storyFilter === "all" || s.status === storyFilter;
      const matchSearch = !storySearch ||
        s.title.toLowerCase().includes(storySearch.toLowerCase()) ||
        s.author_name.toLowerCase().includes(storySearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [localStories, storyFilter, storySearch]);

  // ── Analytics data ─────────────────────────────────────────────────────────
  const analyticsData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const count = localProfiles.filter(
        p => format(parseISO(p.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      ).length;
      return { date: format(date, "MMM dd"), count };
    });
    let total = 0;
    const growthData = last30Days.map(d => { total += d.count; return { ...d, total }; });

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthData = months.map((month, idx) => ({
      month,
      users: localProfiles.filter(p => p.role === "user" && parseISO(p.created_at).getMonth() === idx).length,
      operators: localProfiles.filter(p => p.role === "operator" && parseISO(p.created_at).getMonth() === idx).length,
    }));

    const rankCounts: Record<string, number> = {};
    localProfiles.forEach(p => {
      if (!p.ace_profile?.ace) return;
      const r = getRank(p.ace_profile.ace);
      rankCounts[r] = (rankCounts[r] ?? 0) + 1;
    });
    const aceData = RANKS.map(r => ({ rank: r, count: rankCounts[r] ?? 0 }));

    // Recent activity feed
    const recentUsers = localProfiles
      .slice()
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return { growthData, monthData, aceData, recentUsers };
  }, [localProfiles]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  async function handleUserAction(type: string, userId: string, extra?: string) {
    setLoadingId(userId);
    try {
      if (type === "role") {
        await updateUserRole(userId, extra!);
        setLocalProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: extra! } : p));
        if (extra === "operator") setExpandedUserId(null);
        showToast(`Role set to ${extra}`);
      } else if (type === "ban") {
        if (!confirm("Ban this user? They won't be able to sign in.")) return;
        await banUser(userId);
        setLocalProfiles(prev => prev.map(p => p.id === userId ? { ...p, banned: true } : p));
        showToast("User banned");
      } else if (type === "unban") {
        await unbanUser(userId);
        setLocalProfiles(prev => prev.map(p => p.id === userId ? { ...p, banned: false } : p));
        showToast("User unbanned");
      } else if (type === "reset") {
        await sendPasswordReset(extra!);
        showToast("Password reset email sent");
      } else if (type === "delete") {
        if (!confirm("Delete this user permanently? Cannot be undone.")) return;
        await deleteUser(userId);
        setLocalProfiles(prev => prev.filter(p => p.id !== userId));
        setExpandedUserId(null);
        showToast("User deleted");
      }
    } catch {
      showToast("Action failed", "error");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleOperatorSubmissionAction(subId: string, action: "approve" | "reject") {
    setLoadingId(subId);
    try {
      if (action === "approve") {
        await approveOperatorSubmission(subId);
        setLocalOperatorSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: "approved" } : s));
        showToast("Submission approved");
      } else {
        await rejectOperatorSubmission(subId);
        setLocalOperatorSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: "rejected" } : s));
        showToast("Submission rejected");
      }
    } catch {
      showToast("Action failed", "error");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDeleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    setLoadingId(id);
    try {
      await deleteMessage(id);
      setLocalMessages(prev => prev.filter(m => m.id !== id));
      showToast("Message deleted");
    } finally { setLoadingId(null); }
  }

  async function handleStoryAction(story: StorySubmission, action: "approve" | "reject" | "delete") {
    if (!story._fileName) { showToast("Missing file reference", "error"); return; }
    setLoadingId(story.id);
    try {
      if (action === "delete") {
        if (!confirm("Delete this story submission?")) return;
        await deleteStory(story._fileName);
        setLocalStories(prev => prev.filter(s => s.id !== story.id));
        showToast("Story deleted");
      } else {
        const status = action === "approve" ? "approved" : "rejected";
        await updateStoryStatus(story._fileName, status);
        setLocalStories(prev => prev.map(s => s.id === story.id ? { ...s, status } : s));
        showToast(`Story ${status}`);
      }
    } catch {
      showToast("Action failed", "error");
    } finally { setLoadingId(null); }
  }

  // ── Filtered reviews & photos ─────────────────────────────────────────────
  const filteredReviews = useMemo(() => {
    if (!reviewSearch) return localReviews;
    const q = reviewSearch.toLowerCase();
    return localReviews.filter(r =>
      r.username.toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q) ||
      r.adventure_slug.toLowerCase().includes(q)
    );
  }, [localReviews, reviewSearch]);

  const filteredPhotos = useMemo(() => {
    if (!photoSearch) return localPhotos;
    const q = photoSearch.toLowerCase();
    return localPhotos.filter(p =>
      p.username.toLowerCase().includes(q) ||
      p.caption.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    );
  }, [localPhotos, photoSearch]);

  async function handleDeleteReview(id: string) {
    if (!confirm("Delete this review? Cannot be undone.")) return;
    setLoadingId(id);
    try {
      await adminDeleteReview(id);
      setLocalReviews(prev => prev.filter(r => r.id !== id));
      showToast("Review deleted");
    } catch {
      showToast("Delete failed", "error");
    } finally { setLoadingId(null); }
  }

  async function handleDeletePhoto(photo: Photo) {
    if (!confirm("Delete this photo? Cannot be undone.")) return;
    setLoadingId(photo.id);
    try {
      await adminDeletePhoto(photo.id, photo.slug, photo.path);
      setLocalPhotos(prev => prev.filter(p => p.id !== photo.id));
      showToast("Photo deleted");
    } catch {
      showToast("Delete failed", "error");
    } finally { setLoadingId(null); }
  }

  const exportToExcel = () => {
    const data = filtered.map(p => ({
      ID: p.id, Name: p.full_name || "N/A", Email: p.email || "N/A",
      Phone: p.phone || "N/A", Role: p.role,
      Banned: p.banned ? "Yes" : "No",
      "ACE™ Rank": p.ace_profile?.ace ? getRank(p.ace_profile.ace) : "None",
      "ACE™ Score": p.ace_profile?.ace ? Object.values(p.ace_profile.ace).reduce((a,b)=>a+b,0) : 0,
      Joined: format(parseISO(p.created_at), "yyyy-MM-dd HH:mm:ss"),
      LastLogin: p.last_sign_in_at ? format(parseISO(p.last_sign_in_at), "yyyy-MM-dd HH:mm:ss") : "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `TrailToTides_Users_${format(new Date(), "yyyyMMdd")}.xlsx`);
  };

  const TABS = [
    { value: "overview",  icon: Zap,           label: "Overview",  key: "1" },
    { value: "users",     icon: Users,          label: "Users",     key: "2", badge: 0 },
    { value: "operators", icon: Building2,      label: "Operators", key: "3", badge: pendingOperatorSubmissions },
    { value: "messages",  icon: MessageSquare,  label: "Messages",  key: "4", badge: localMessages.length },
    { value: "stories",   icon: BookOpen,       label: "Stories",   key: "5", badge: pendingStories },
    { value: "content",   icon: Image,          label: "Content",   key: "6", badge: 0 },
    { value: "analytics", icon: BarChart3,      label: "Analytics", key: "7" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text-primary)", fontFamily: "var(--font-dm-sans)" }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 border text-white text-[12px] font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
          toast.type === "error" ? "bg-red-950 border-red-500/30" : "bg-[var(--bg-surface)] border-[var(--border-default)]"
        }`}>
          {toast.type === "error"
            ? <XCircle className="w-3.5 h-3.5 text-red-400" />
            : <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] px-6 py-3.5 flex items-center justify-between sticky top-0" style={{ background: "var(--bg-page)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center group-hover:bg-[#ff5100]/20 transition-all">
              <Mountain className="w-4 h-4 text-[#ff7d47]" />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase transition-colors hidden sm:block" style={{ color: "var(--text-primary)" }}>Trail to Tides</span>
          </Link>
          <div className="h-4 w-px" style={{ background: "var(--border-subtle)" }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#ff5100]/60">Admin Console</span>
        </div>

        {/* Pending actions in header */}
        <div className="flex items-center gap-1.5">
          {pendingStories > 0 && (
            <button onClick={() => setActiveTab("stories")}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/15 transition-all">
              <BookOpen className="w-3 h-3" />{pendingStories} stories
            </button>
          )}
          {pendingOperatorSubmissions > 0 && (
            <button onClick={() => setActiveTab("operators")}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/15 transition-all">
              <FileText className="w-3 h-3" />{pendingOperatorSubmissions} submissions
            </button>
          )}
          <div className="h-4 w-px bg-[var(--bg-surface-2)] mx-1" />
          <Link href="/" className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--bg-surface)]">
            <ExternalLink className="w-3.5 h-3.5" /><span className="hidden sm:block">View Site</span>
          </Link>
          <form action={logout}>
            <button type="submit" className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-tertiary)] hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/5">
              <LogOut className="w-3.5 h-3.5" /><span className="hidden sm:block">Sign out</span>
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Tab nav */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff5100]/60 mb-1">Trail to Tides</p>
              <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
            </div>
            <Tabs.List className="flex flex-wrap items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-1 rounded-xl">
              {TABS.map(({ value, icon: Icon, label, badge, key }) => (
                <Tabs.Trigger key={value} value={value}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all outline-none ${
                    activeTab === value ? "bg-[#ff5100] text-white shadow-lg shadow-[#ff5100]/20" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">{label}</span>
                  <kbd className="text-[8px] font-mono hidden sm:inline-flex items-center justify-center w-3.5 h-3.5 rounded-[3px] border border-[var(--border-subtle)] opacity-40 ml-0.5" style={{ background: "var(--bg-surface)" }}>{key}</kbd>
                  {badge != null && badge > 0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none ${activeTab === value ? "bg-white/25 text-white" : "bg-amber-500/80 text-white"}`}>{badge}</span>
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>

          {/* ── OVERVIEW TAB ── */}
          <Tabs.Content value="overview" className="outline-none space-y-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Users",      value: totalUsers,    delta: <Delta value={weekDelta} label="this week" />, icon: Users,         color: "#ff5100" },
                { label: "Admins",     value: totalAdmins,   delta: null,                                          icon: Shield,         color: "#a855f7" },
                { label: "Operators",  value: totalOperators, delta: null,                                          icon: Building2,     color: "#06b6d4" },
                { label: "Banned",     value: bannedCount,   delta: null,                                          icon: Ban,            color: "#ef4444" },
                { label: "ACE™ Done",   value: aceCount,      delta: <span className="text-[10px] text-[var(--text-muted)] font-semibold">{Math.round((aceCount/Math.max(totalUsers,1))*100)}% rate</span>, icon: Star, color: "#f59e0b" },
                { label: "Messages",   value: localMessages.length, delta: null,                                   icon: MessageSquare, color: "#22c55e" },
              ].map(({ label, value, delta, icon: Icon, color }) => (
                <div key={label} className="relative bg-white/[0.025] border border-[var(--border-subtle)] rounded-2xl p-4 overflow-hidden group hover:border-white/[0.1] transition-all cursor-default">
                  <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: color + "22" }} />
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "15" }}>
                      <Icon className="w-[15px] h-[15px]" style={{ color }} />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-0.5">{label}</p>
                  <p className="text-2xl font-black tracking-tight mb-1">{value}</p>
                  {delta}
                </div>
              ))}
            </div>

            {/* Two-col layout: activity + pending actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Recent signups */}
              <div className="bg-white/[0.025] border border-[var(--border-subtle)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-0.5">Activity</p>
                    <h3 className="text-sm font-bold">Recent Signups</h3>
                  </div>
                  <button onClick={() => setActiveTab("users")} className="text-[11px] font-semibold text-[#ff5100]/70 hover:text-[#ff7d47] transition-colors flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {analyticsData.recentUsers.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-surface)] transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff5100]/20 to-[#ff5100]/5 border border-[#ff5100]/10 flex items-center justify-center text-[#ff7d47] font-black text-xs shrink-0">
                        {(p.full_name?.[0] ?? p.email?.[0] ?? "?").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[var(--text-muted)] truncate">{p.full_name ?? "Unnamed"}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">{p.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-[var(--text-muted)]">{format(parseISO(p.created_at), "MMM d")}</p>
                        {p.role === "admin" && <span className="text-[9px] text-purple-400 font-bold">Admin</span>}
                        {p.banned && <span className="text-[9px] text-red-400 font-bold">Banned</span>}
                      </div>
                    </div>
                  ))}
                  {analyticsData.recentUsers.length === 0 && (
                    <p className="text-center text-[var(--text-muted)] text-sm py-6">No users yet</p>
                  )}
                </div>
              </div>

              {/* Pending actions */}
              <div className="bg-white/[0.025] border border-[var(--border-subtle)] rounded-2xl p-5">
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-0.5">Needs Attention</p>
                  <h3 className="text-sm font-bold">Pending Actions</h3>
                </div>
                <div className="space-y-2">
                  <button onClick={() => setActiveTab("stories")}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      pendingStories > 0 ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10" : "border-[var(--border-subtle)] opacity-40"
                    }`}>
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-[var(--text-muted)]">Story Submissions</p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">{pendingStories} pending review</p>
                    </div>
                    {pendingStories > 0 && (
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full">{pendingStories}</span>
                    )}
                  </button>

                  <button onClick={() => setActiveTab("operators")}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      pendingOperatorSubmissions > 0 ? "border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10" : "border-[var(--border-subtle)] opacity-40"
                    }`}>
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-[var(--text-muted)]">Operator Submissions</p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">{pendingOperatorSubmissions} price updates pending</p>
                    </div>
                    {pendingOperatorSubmissions > 0 && (
                      <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded-full">{pendingOperatorSubmissions}</span>
                    )}
                  </button>

                  <button onClick={() => setActiveTab("messages")}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      localMessages.length > 0 ? "border-emerald-500/15 bg-emerald-500/5 hover:bg-emerald-500/8" : "border-[var(--border-subtle)] opacity-40"
                    }`}>
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-[var(--text-muted)]">Contact Messages</p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">{localMessages.length} in inbox</p>
                    </div>
                    {localMessages.length > 0 && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">{localMessages.length}</span>
                    )}
                  </button>

                  <button onClick={() => { setRoleFilter("banned"); setActiveTab("users"); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      bannedCount > 0 ? "border-red-500/15 bg-red-500/5 hover:bg-red-500/8" : "border-[var(--border-subtle)] opacity-40"
                    }`}>
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                      <Ban className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-[var(--text-muted)]">Banned Users</p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">{bannedCount} accounts suspended</p>
                    </div>
                    {bannedCount > 0 && (
                      <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full">{bannedCount}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mini growth chart */}
            <div className="bg-white/[0.025] border border-[var(--border-subtle)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-0.5">30-Day</p>
                  <h3 className="text-sm font-bold">User Growth</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Delta value={newLast7} label="new this week" />
                  <button onClick={() => setActiveTab("analytics")} className="text-[11px] font-semibold text-[#ff5100]/70 hover:text-[#ff7d47] transition-colors flex items-center gap-1">
                    Full analytics <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.growthData} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff15" fontSize={8} tickLine={false} axisLine={false} minTickGap={50} />
                    <YAxis stroke="#ffffff15" fontSize={8} tickLine={false} axisLine={false} width={25} />
                    <Tooltip {...TT} />
                    <Line type="monotone" dataKey="count" stroke="#ff5100" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#ff5100", strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Tabs.Content>

          {/* ── USERS TAB ── */}
          <Tabs.Content value="users" className="outline-none space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <input type="text" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-white text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#ff5100]/40 transition-all" />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    className="appearance-none bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl pl-9 pr-8 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#ff5100]/40 cursor-pointer transition-all">
                    <option value="all" className="bg-[#111]">All Roles</option>
                    <option value="user" className="bg-[#111]">Users</option>
                    <option value="admin" className="bg-[#111]">Admins</option>
                    <option value="banned" className="bg-[#111]">Banned</option>
                    <option value="ace" className="bg-[#111]">Has ACE<sup>™</sup></option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
                  <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                    className="appearance-none bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl pl-9 pr-8 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#ff5100]/40 cursor-pointer transition-all">
                    <option value="all" className="bg-[#111]">All time</option>
                    <option value="7d" className="bg-[#111]">Last 7 days</option>
                    <option value="30d" className="bg-[#111]">Last 30 days</option>
                    <option value="90d" className="bg-[#111]">Last 90 days</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>
              <button onClick={exportToExcel}
                className="flex items-center gap-2 bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-default)] text-[var(--text-secondary)] hover:text-white px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95 whitespace-nowrap shrink-0">
                <Download className="w-3.5 h-3.5" /> Export Excel
              </button>
            </div>

            <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                    <th className="w-8 px-4 py-3" />
                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">User</th>
                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hidden md:table-cell">Last Login</th>
                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Role</th>
                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hidden sm:table-cell">ACE<sup>™</sup></th>
                    <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hidden lg:table-cell">Joined</th>
                    <th className="text-right px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center"><Users className="w-6 h-6" /></div>
                        <p className="text-sm font-semibold">No users match filters</p>
                        {(search || roleFilter !== "all" || dateRange !== "all") && (
                          <button onClick={() => { setSearch(""); setRoleFilter("all"); setDateRange("all"); }}
                            className="text-[11px] text-[#ff5100]/70 hover:text-[#ff7d47] flex items-center gap-1 transition-colors">
                            <RefreshCw className="w-3 h-3" /> Clear filters
                          </button>
                        )}
                      </div>
                    </td></tr>
                  ) : filtered.map(profile => {
                    const isExpanded = expandedUserId === profile.id;
                    const isSelf = profile.id === currentUserId;
                    const aceRank = profile.ace_profile?.ace ? getRank(profile.ace_profile.ace) : null;
                    const isInactive = profile.last_sign_in_at
                      ? differenceInDays(new Date(), parseISO(profile.last_sign_in_at)) > 60
                      : false;
                    return (
                      <>
                        <tr key={profile.id}
                          className={`border-b border-[var(--border-subtle)] transition-colors last:border-0 ${isExpanded ? "bg-white/[0.035]" : "hover:bg-[var(--bg-card)]"}`}>
                          <td className="pl-4 pr-2 py-3.5">
                            <button onClick={() => setExpandedUserId(isExpanded ? null : profile.id)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--bg-surface-2)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                                profile.banned ? "bg-red-500/10 border border-red-500/15 text-red-400" :
                                "bg-gradient-to-br from-[#ff5100]/15 to-[#ff5100]/5 border border-[#ff5100]/10 text-[#ff7d47]"
                              }`}>
                                {(profile.full_name?.[0] ?? profile.email?.[0] ?? "?").toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-[var(--text-primary)] text-[13px] leading-tight flex items-center gap-1.5 flex-wrap">
                                  {profile.full_name || "Unnamed User"}
                                  {isSelf && <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#ff5100]/15 text-[9px] text-[#ff7d47] font-black uppercase tracking-wider">you</span>}
                                  {profile.banned && <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-500/15 text-[9px] text-red-400 font-black uppercase tracking-wider">banned</span>}
                                  {isInactive && !profile.banned && <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[var(--bg-surface)] text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">inactive</span>}
                                </p>
                                <p className="text-[var(--text-tertiary)] text-[11px] font-mono mt-0.5">{profile.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <p className="text-[11px] text-[var(--text-tertiary)] font-medium">
                              {profile.last_sign_in_at ? format(parseISO(profile.last_sign_in_at), "MMM d, yyyy") : <span className="text-[var(--text-muted)]">Never</span>}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              profile.role === "admin" ? "bg-purple-500/15 text-purple-300 border border-purple-500/15" : "bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]"
                            }`}>
                              {profile.role === "admin" ? <Shield className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
                              {profile.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 hidden sm:table-cell">
                            {aceRank ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{ background: RANK_COLORS[aceRank]+"15", color: RANK_COLORS[aceRank] }}>
                                <Star className="w-2.5 h-2.5" />{aceRank}
                              </span>
                            ) : <span className="text-[var(--text-muted)] text-[11px]">—</span>}
                          </td>
                          <td className="px-5 py-3.5 hidden lg:table-cell">
                            <p className="text-[11px] text-[var(--text-tertiary)]">{format(parseISO(profile.created_at), "MMM d, yyyy")}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              {!isSelf && (
                                <>
                                  <button onClick={() => profile.email && handleUserAction("reset", profile.id, profile.email)} disabled={loadingId === profile.id} title="Reset password" className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-blue-300 hover:bg-blue-500/10 transition-all disabled:opacity-40">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                  <a href={`mailto:${profile.email}`} title="Email user" className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-all">
                                    <Send className="w-3.5 h-3.5" />
                                  </a>
                                  <button onClick={() => handleUserAction(profile.banned ? "unban" : "ban", profile.id)} disabled={loadingId === profile.id} title={profile.banned ? "Unban" : "Ban"} className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${profile.banned ? "text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10" : "text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/10"}`}>
                                    {loadingId === profile.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : profile.banned ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                                  </button>
                                  <button onClick={() => handleUserAction("delete", profile.id)} disabled={loadingId === profile.id} title="Delete" className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              <button onClick={() => setExpandedUserId(isExpanded ? null : profile.id)} title="More info" className={`p-1.5 rounded-lg transition-all ${isExpanded ? "text-[var(--text-secondary)] bg-[var(--bg-surface-2)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}`}>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <UserDetailPanel key={`detail-${profile.id}`} profile={profile} currentUserId={currentUserId} loadingId={loadingId} onAction={handleUserAction}
                            storyCount={localStories.filter(s => s.email === profile.email).length}
                            messageCount={localMessages.filter(m => m.email === profile.email || m.user_id === profile.id).length}
                          />
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                {filtered.length} of {localProfiles.filter(p => p.role !== "operator").length} users
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">{bannedCount} banned · {aceCount} with ACE<sup>™</sup></p>
            </div>
          </Tabs.Content>

          {/* ── MESSAGES TAB ── */}
          <Tabs.Content value="messages" className="outline-none space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input type="text" placeholder="Search messages…" value={msgSearch} onChange={e => setMsgSearch(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-white text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#ff5100]/40 transition-all" />
              </div>
              <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-0.5 rounded-lg">
                {(["all","unread","replied"] as const).map(f => (
                  <button key={f} onClick={() => setMsgFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                      msgFilter === f ? "bg-[#ff5100] text-white shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    }`}>
                    {f} {f === "unread" && `(${[...readMsgs].length > 0 ? localMessages.length - readMsgs.size : localMessages.length})`}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-[var(--text-muted)] font-semibold ml-auto">{filteredMessages.length} messages</span>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="border border-[var(--border-subtle)] rounded-2xl p-16 text-center">
                <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center"><MessageSquare className="w-6 h-6" /></div>
                  <p className="text-sm font-semibold">{localMessages.length === 0 ? "No messages yet" : "No messages match filter"}</p>
                </div>
              </div>
            ) : filteredMessages.map(msg => {
              const isRead = readMsgs.has(msg.id);
              const isReplied = repliedMsgs.has(msg.id);
              return (
              <div key={msg.id} onClick={() => { if (!isRead) setReadMsgs(prev => new Set(prev).add(msg.id)); }}
                className={`border rounded-2xl overflow-hidden transition-all cursor-default ${
                  isRead ? "border-[var(--border-subtle)]" : "border-[#ff5100]/25"
                } hover:border-white/[0.1]`}>
                <div className="flex items-start gap-3 p-4">
                  <div className="relative w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/12 flex items-center justify-center text-emerald-400 font-black text-sm shrink-0">
                    {(msg.name?.[0] ?? msg.email?.[0] ?? "?").toUpperCase()}
                    {!isRead && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ff5100] rounded-full border-2 border-[var(--bg-page)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-[13px] ${isRead ? "text-[var(--text-primary)]" : "font-bold text-[var(--text-primary)]"}`}>{msg.name || "Guest"}</p>
                      <span className="text-[var(--text-muted)] text-[10px]">·</span>
                      <span className="text-[var(--text-muted)] text-[11px]">{format(parseISO(msg.created_at), "MMM d, yyyy · HH:mm")}</span>
                      {isReplied && <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400/70 bg-emerald-500/10 px-1.5 py-0.5 rounded-full"><CheckCircle2 className="w-2 h-2" />Replied</span>}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <p className="text-[var(--text-tertiary)] text-[11px] font-mono">{msg.email}</p>
                      <CopyBtn text={msg.email} />
                    </div>
                    <div className="bg-white/[0.025] rounded-xl px-4 py-3 border border-[var(--border-subtle)]">
                      <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <a href={`mailto:${msg.email}?subject=Re: Your message to Trail to Tides`}
                      onClick={() => setRepliedMsgs(prev => new Set(prev).add(msg.id))}
                      className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#ff5100]/20 text-[#ff7d47]/70 hover:bg-[#ff5100]/10 hover:border-[#ff5100]/35 hover:text-[#ff7d47] transition-all">
                      <Mail className="w-3 h-3" /> Reply
                    </a>
                    <button onClick={() => handleDeleteMessage(msg.id)} disabled={loadingId === msg.id}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40">
                      {loadingId === msg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </Tabs.Content>

          {/* ── STORIES TAB ── */}
          <Tabs.Content value="stories" className="outline-none space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Status filter pills */}
              <div className="flex flex-wrap gap-1.5">
                {(["all","pending","approved","rejected"] as const).map(s => {
                  const count = s === "all" ? localStories.length : localStories.filter(x => x.status === s).length;
                  return (
                    <button key={s} onClick={() => setStoryFilter(s)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all capitalize flex items-center gap-1.5 ${
                        storyFilter === s
                          ? s === "pending" ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : s === "approved" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                          : s === "rejected" ? "bg-red-500/15 border-red-500/25 text-red-300"
                          : "bg-[#ff5100]/15 border-[#ff5100]/30 text-[#ff7d47]"
                          : "border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-default)]"
                      }`}>
                      {s} <span className="opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input type="text" placeholder="Search title, author…" value={storySearch} onChange={e => setStorySearch(e.target.value)}
                  className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2 text-white text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#ff5100]/40 transition-all w-52" />
              </div>
            </div>

            {filteredStories.length === 0 ? (
              <div className="border border-[var(--border-subtle)] rounded-2xl p-16 text-center">
                <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center"><BookOpen className="w-6 h-6" /></div>
                  <p className="text-sm font-semibold">{localStories.length === 0 ? "No story submissions yet" : "No stories match filters"}</p>
                </div>
              </div>
            ) : (
              <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden divide-y divide-[var(--border-subtle)]">
                {filteredStories.map(sub => {
                  const isExpanded = expandedStoryId === sub.id;
                  const heroUrl = (sub as any).hero_image || (sub as any).hero_image_url || null;
                  return (
                    <div key={sub.id} className="bg-[var(--bg-card)]">
                      {/* ── Main card row ── */}
                      <div className="p-4 lg:p-5">
                        <div className="flex items-start gap-4">
                          {/* Hero image thumbnail */}
                          <div className="hidden sm:block w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden shrink-0 border border-[var(--border-subtle)]">
                            {heroUrl ? (
                              <img src={heroUrl} alt={sub.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full bg-[var(--bg-card)] flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-[var(--text-muted)]" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Top row: title + status badge */}
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Status dot */}
                                <div className={`shrink-0 w-2 h-2 rounded-full mt-0.5 ${
                                  sub.status === "pending" ? "bg-amber-400" :
                                  sub.status === "approved" ? "bg-emerald-400" : "bg-[var(--text-muted)]"
                                }`} />
                                <p className="font-bold text-[var(--text-primary)] text-[14px] leading-tight truncate">{sub.title}</p>
                              </div>
                              <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                sub.status === "pending" ? "bg-amber-500/12 text-amber-300 border border-amber-500/20"
                                : sub.status === "approved" ? "bg-emerald-500/12 text-emerald-300 border border-emerald-500/20"
                                : "bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                              }`}>{sub.status}</span>
                            </div>

                            {/* Meta row: author, region, date, read time */}
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="text-[var(--text-secondary)] text-[12px] font-semibold">{sub.author_name}</span>
                              {sub.author_role && <span className="text-[var(--text-muted)] text-[11px] hidden sm:inline">· {sub.author_role}</span>}
                              {sub.region && <span className="inline-flex items-center gap-1 text-[var(--text-muted)] text-[11px]"><MapPin className="w-2.5 h-2.5" />{sub.region}</span>}
                              {sub.date_of_adventure && <span className="text-[var(--text-muted)] text-[11px]">· {sub.date_of_adventure}</span>}
                            </div>

                            {/* Excerpt */}
                            <p className="text-[var(--text-tertiary)] text-[12px] leading-relaxed line-clamp-2 mb-2.5">{sub.excerpt}</p>

                            {/* Bottom row: contact + tags + date */}
                            <div className="flex flex-wrap items-center gap-2">
                              {sub.email && (
                                <a href={`mailto:${sub.email}`} className="inline-flex items-center gap-1 text-[11px] text-[#ff7d47]/60 hover:text-[#ff7d47] transition-colors">
                                  <Mail className="w-3 h-3" />{sub.email}
                                </a>
                              )}
                              {sub.tags?.slice(0,3).map(tag => (
                                <span key={tag} className="inline-flex items-center gap-0.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-[9px] font-semibold px-2 py-0.5 rounded-full">
                                  <Tag className="w-2 h-2" />{tag}
                                </span>
                              ))}
                              <span className="text-[var(--text-muted)] text-[10px] ml-auto">{format(parseISO(sub.created_at), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── Action bar ── */}
                      <div className="flex items-center justify-between px-4 lg:px-5 py-2.5 bg-[var(--bg-card)]">
                        <button onClick={() => setExpandedStoryId(isExpanded ? null : sub.id)}
                          className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] font-semibold transition-colors">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {isExpanded ? "Collapse" : "View Full Story"}
                        </button>
                        <div className="flex items-center gap-2">
                          {sub.status !== "approved" && (
                            <button onClick={() => handleStoryAction(sub, "approve")} disabled={loadingId === sub.id}
                              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400/70 hover:bg-emerald-500/10 hover:border-emerald-500/35 transition-all disabled:opacity-40">
                              {loadingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                            </button>
                          )}
                          {sub.status !== "rejected" && (
                            <button onClick={() => handleStoryAction(sub, "reject")} disabled={loadingId === sub.id}
                              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-red-500/25 hover:text-red-400/80 hover:bg-red-500/8 transition-all disabled:opacity-40">
                              {loadingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Reject
                            </button>
                          )}
                          <button onClick={() => handleStoryAction(sub, "delete")} disabled={loadingId === sub.id}
                            className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* ── Expanded content ── */}
                      {isExpanded && (
                        <div className="border-t border-[var(--border-subtle)] px-5 lg:px-7 py-5 bg-[var(--bg-card)] space-y-5">
                          {/* Hero image preview */}
                          {heroUrl && (
                            <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                              <img src={heroUrl} alt={sub.title} className="w-full max-h-72 object-cover" loading="lazy" />
                            </div>
                          )}

                          {/* Author card */}
                          <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border-subtle)]" style={{ background: "var(--bg-surface)" }}>
                            <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm" style={{ background: "rgba(255,81,0,0.15)", color: "#ff7d47" }}>
                              {(sub.author_name?.[0] ?? "?").toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-[var(--text-primary)] text-[13px]">{sub.author_name}</p>
                                {sub.author_role && <span className="text-[var(--text-muted)] text-[11px]">· {sub.author_role}</span>}
                              </div>
                              {sub.author_bio && (
                                <p className="text-[var(--text-tertiary)] text-[11px] italic leading-relaxed mt-1">{sub.author_bio}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                {sub.email && (
                                  <a href={`mailto:${sub.email}`} className="inline-flex items-center gap-1 text-[11px] text-[#ff7d47]/70 hover:text-[#ff7d47] transition-colors">
                                    <Mail className="w-3 h-3" />{sub.email}
                                  </a>
                                )}
                                {sub.phone && (
                                  <span className="inline-flex items-center gap-1 text-[var(--text-muted)] text-[11px]">
                                    <Phone className="w-3 h-3" />{sub.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Full metadata grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: "Region", value: sub.region, icon: MapPin },
                              { label: "State", value: (sub as any).state, icon: MapPin },
                              { label: "Date of Adventure", value: sub.date_of_adventure, icon: Calendar },
                              { label: "Date of Adventure", value: sub.date_of_adventure, icon: Calendar },
                            ].filter(item => item.value).map(item => (
                              <div key={item.label} className="p-3 rounded-xl border border-[var(--border-subtle)]" style={{ background: "var(--bg-surface)" }}>
                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">{item.label}</p>
                                <div className="flex items-center gap-1.5">
                                  <item.icon className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                  <span className="text-[12px] font-semibold text-[var(--text-primary)]">{item.value}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Status + submission date row */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[var(--text-muted)] font-semibold">Submitted {format(parseISO(sub.created_at), "MMM d, yyyy · HH:mm")}</span>
                              {(sub as any).slug && (
                                <Link href={`/stories/${(sub as any).slug}`} target="_blank" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ff7d47]/70 hover:text-[#ff7d47] transition-colors">
                                  <ExternalLink className="w-3 h-3" /> View on site
                                </Link>
                              )}
                            </div>
                            {sub.tags && sub.tags.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {sub.tags.map(tag => (
                                  <span key={tag} className="inline-flex items-center gap-0.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-[9px] font-semibold px-2 py-0.5 rounded-full">
                                    <Tag className="w-2 h-2" />{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Story body */}
                          {sub.body ? (
                            <div className="p-4 rounded-xl border border-[var(--border-subtle)]" style={{ background: "var(--bg-surface)" }}>
                              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2">Story Content</p>
                              <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed whitespace-pre-wrap">{sub.body}</p>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl border border-[var(--border-subtle)]" style={{ background: "var(--bg-surface)" }}>
                              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">Story Content</p>
                              <p className="text-[var(--text-muted)] text-[12px] italic">No body content provided</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Tabs.Content>

          {/* ── OPERATORS TAB ── */}
          <Tabs.Content value="operators" className="outline-none space-y-6">

            {/* Operators list */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                <h2 className="text-sm font-bold">Registered Operators</h2>
                <span className="bg-[var(--bg-surface)] text-[var(--text-tertiary)] text-[9px] font-black px-2 py-0.5 rounded-full">{totalOperators}</span>
              </div>
              {totalOperators === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-10 text-center">
                  <Building2 className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-[var(--text-muted)] text-sm font-semibold">No operator accounts yet</p>
                </div>
              ) : (
                <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Company</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hidden md:table-cell">Contact</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hidden sm:table-cell">Website</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hidden lg:table-cell">Submissions</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Joined</th>
                        <th className="text-right px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localProfiles.filter(p => p.role === "operator").map(p => {
                        const op = localOperatorProfiles.find(o => o.user_id === p.id);
                        const subCount = localOperatorSubmissions.filter(s => s.operator_id === p.id).length;
                        const pendingSubs = localOperatorSubmissions.filter(s => s.operator_id === p.id && s.status === "pending").length;
                        const isExpanded = expandedUserId === p.id;
                        return (
                          <>
                            <tr key={p.id} className={`border-b border-[var(--border-subtle)] last:border-0 transition-colors ${isExpanded ? "bg-white/[0.035]" : "hover:bg-white/[0.025]"}`}>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/12 flex items-center justify-center text-cyan-400 font-black text-sm shrink-0">
                                    {(op?.company_name?.[0] ?? p.full_name?.[0] ?? "?").toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[var(--text-primary)] text-[13px] leading-tight">{op?.company_name ?? p.full_name ?? "—"}</p>
                                    <p className="text-[var(--text-muted)] text-[10px] font-mono mt-0.5">{p.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 hidden md:table-cell">
                                <p className="text-[var(--text-secondary)] text-[12px]">{op?.contact_name ?? p.full_name ?? "—"}</p>
                                {op?.phone && <p className="text-[var(--text-muted)] text-[10px] font-mono mt-0.5">{op.phone}</p>}
                              </td>
                              <td className="px-5 py-4 hidden sm:table-cell">
                                {op?.website ? (
                                  <a href={op.website} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[#ff7d47]/60 hover:text-[#ff7d47] text-[11px] transition-colors">
                                    <Globe className="w-3 h-3" />{op.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                                  </a>
                                ) : <span className="text-[var(--text-muted)] text-[11px]">—</span>}
                              </td>
                              <td className="px-5 py-4 hidden lg:table-cell">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[12px] font-semibold text-[var(--text-secondary)]">{subCount}</span>
                                  {pendingSubs > 0 && (
                                    <span className="bg-amber-500/15 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-full">{pendingSubs} pending</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-[var(--text-muted)] text-[11px]">
                                {format(parseISO(p.created_at), "MMM d, yyyy")}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => p.email && handleUserAction("reset", p.id, p.email)} disabled={loadingId === p.id} title="Reset password" className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-blue-300 hover:bg-blue-500/10 transition-all disabled:opacity-40">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                  <a href={`mailto:${p.email}`} title="Email operator" className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-all">
                                    <Send className="w-3.5 h-3.5" />
                                  </a>
                                  <button onClick={() => handleUserAction(p.banned ? "unban" : "ban", p.id)} disabled={loadingId === p.id} title={p.banned ? "Unban" : "Ban"} className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${p.banned ? "text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10" : "text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/10"}`}>
                                    {loadingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : p.banned ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                                  </button>
                                  <button onClick={() => handleUserAction("delete", p.id)} disabled={loadingId === p.id} title="Delete" className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setExpandedUserId(isExpanded ? null : p.id)} title="More info" className={`p-1.5 rounded-lg transition-all ${isExpanded ? "text-[var(--text-secondary)] bg-[var(--bg-surface-2)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}`}>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={6} className="px-0 py-0">
                                  <div className="mx-3 mb-2 rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-2 gap-5"
                                    style={{ background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.07)" }}>
                                    {/* Identity */}
                                    <div className="space-y-2">
                                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Identity</p>
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                        <span className="text-[12px] font-mono text-[var(--text-secondary)] truncate">{p.email ?? "—"}</span>
                                        {p.email && <CopyBtn text={p.email} />}
                                      </div>
                                      {op?.phone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                          <span className="text-[12px] font-mono text-[var(--text-secondary)]">{op.phone}</span>
                                          <CopyBtn text={op.phone} />
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                        <span className="text-[11px] text-[var(--text-tertiary)]">Joined {format(parseISO(p.created_at), "MMM d, yyyy")}</span>
                                      </div>
                                      <div className="flex items-center gap-2 pt-1">
                                        <div className="w-3 h-3 shrink-0" />
                                        <span className="text-[9px] font-mono text-[var(--text-muted)] truncate">{p.id}</span>
                                        <CopyBtn text={p.id} />
                                      </div>
                                    </div>
                                    {/* Quick Actions */}
                                    <div className="space-y-2">
                                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Actions</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        <button
                                          onClick={() => p.email && handleUserAction("reset", p.id, p.email)}
                                          disabled={loadingId === p.id}
                                          title="Send Password Reset"
                                          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all border border-[var(--border-subtle)] hover:border-blue-500/35 hover:bg-blue-500/8 text-[var(--text-tertiary)] hover:text-blue-300 disabled:opacity-40"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                                        </button>
                                        <a href={`mailto:${p.email}`}
                                          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all border border-[var(--border-subtle)] hover:border-white/20 hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                                          <Send className="w-3.5 h-3.5" /> Email
                                        </a>
                                        <button
                                          onClick={() => handleUserAction(p.banned ? "unban" : "ban", p.id)}
                                          disabled={loadingId === p.id}
                                          title={p.banned ? "Unban" : "Ban"}
                                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all border disabled:opacity-40 ${
                                            p.banned
                                              ? "border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/8 text-emerald-400/70 hover:text-emerald-300"
                                              : "border-amber-500/15 hover:border-amber-500/35 hover:bg-amber-500/8 text-[var(--text-tertiary)] hover:text-amber-300"
                                          }`}
                                        >
                                          {p.banned ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                                          {p.banned ? "Unban" : "Ban"}
                                        </button>
                                        <button
                                          onClick={() => handleUserAction("delete", p.id)}
                                          disabled={loadingId === p.id}
                                          title="Delete Account"
                                          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all border border-red-500/10 hover:border-red-500/35 hover:bg-red-500/8 text-[var(--text-muted)] hover:text-red-400 disabled:opacity-40"
                                        >
                                          {loadingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Operator submissions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-[var(--text-muted)]" />
                <h2 className="text-sm font-bold">Price & Date Submissions</h2>
                {pendingOperatorSubmissions > 0 && (
                  <span className="bg-amber-500/15 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full">{pendingOperatorSubmissions} pending</span>
                )}
              </div>
              {localOperatorSubmissions.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-10 text-center">
                  <FileText className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-[var(--text-muted)] text-sm font-semibold">No submissions yet</p>
                </div>
              ) : (
                <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                        <th className="w-8 px-4 py-3" />
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Operator</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Adventure</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hidden sm:table-cell">Price</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Status</th>
                        <th className="text-right px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localOperatorSubmissions.map(sub => {
                        const isExpanded = expandedSubId === sub.id;
                        return (
                          <>
                            <tr key={sub.id} className={`border-b border-[var(--border-subtle)] last:border-0 transition-colors ${isExpanded ? "bg-[var(--bg-card)]" : "hover:bg-[var(--bg-card)]"}`}>
                              <td className="pl-4 pr-2 py-3.5">
                                <button onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--bg-surface-2)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                </button>
                              </td>
                              <td className="px-5 py-3.5">
                                <p className="font-semibold text-[var(--text-muted)] text-[12px]">{sub.company_name ?? sub.operator_name}</p>
                              </td>
                              <td className="px-5 py-3.5">
                                <p className="text-[var(--text-secondary)] text-[12px] font-semibold">{sub.adventure_slug}</p>
                                <p className="text-[var(--text-muted)] text-[10px] mt-0.5">{sub.operator_name}</p>
                              </td>
                              <td className="px-5 py-3.5 hidden sm:table-cell">
                                <span className="text-[#ff7d47] font-black text-[13px]">₹{sub.price_from}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                {sub.status === "approved"
                                  ? <span className="inline-flex items-center gap-1 bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"><CheckCircle2 className="w-2.5 h-2.5"/>Approved</span>
                                  : sub.status === "rejected"
                                  ? <span className="inline-flex items-center gap-1 bg-red-500/12 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"><XCircle className="w-2.5 h-2.5"/>Rejected</span>
                                  : <span className="inline-flex items-center gap-1 bg-amber-500/12 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"><Clock className="w-2.5 h-2.5"/>Pending</span>}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-end gap-1.5">
                                  {sub.status === "pending" && (
                                    <>
                                      <button onClick={() => handleOperatorSubmissionAction(sub.id, "approve")} disabled={loadingId === sub.id}
                                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400/70 hover:bg-emerald-500/10 hover:border-emerald-500/35 transition-all disabled:opacity-40">
                                        {loadingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                                      </button>
                                      <button onClick={() => handleOperatorSubmissionAction(sub.id, "reject")} disabled={loadingId === sub.id}
                                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-red-500/20 hover:text-red-400/70 hover:bg-red-500/8 transition-all disabled:opacity-40">
                                        {loadingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reject"}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {isExpanded && <SubmissionDetailPanel sub={sub} allSubmissions={localOperatorSubmissions} />}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Tabs.Content>

          {/* ── CONTENT TAB (Reviews & Photos) ── */}
          <Tabs.Content value="content" className="outline-none space-y-4">

            {/* Content metrics */}
            {(() => {
              const avgRating = localReviews.length > 0
                ? Math.round((localReviews.reduce((s, r) => s + r.rating, 0) / localReviews.length) * 10) / 10
                : 0;
              const lowRated = localReviews.filter(r => r.rating <= 2).length;
              return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Reviews", value: localReviews.length, icon: StarOff, color: "#f59e0b" },
                  { label: "Total Photos", value: localPhotos.length, icon: Image, color: "#06b6d4" },
                  { label: "Avg Rating", value: avgRating, icon: Star, color: "#22c55e", suffix: "/5" },
                  { label: "Low Rated (≤2★)", value: lowRated, icon: AlertCircle, color: lowRated > 0 ? "#ef4444" : "#6b7280" },
                ].map(({ label, value, icon: Icon, color, suffix }) => (
                  <div key={label} className="border border-[var(--border-subtle)] rounded-2xl p-4" style={{ background: "var(--bg-card)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "15" }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-0.5">{label}</p>
                    <p className="text-xl font-black tracking-tight" style={{ color }}>{value}{suffix && <span className="text-[var(--text-muted)] text-[12px] font-semibold ml-0.5">{suffix}</span>}</p>
                  </div>
                ))}
              </div>
            )})()}

            {/* Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-1 rounded-xl">
                <button onClick={() => setContentView("reviews")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${contentView === "reviews" ? "bg-[#ff5100] text-white shadow-md shadow-[#ff5100]/20" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"}`}>
                  <StarOff className="w-3.5 h-3.5" />
                  Reviews
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${contentView === "reviews" ? "bg-[var(--text-muted)] text-white" : "bg-[var(--bg-surface-2)] text-[var(--text-tertiary)]"}`}>{localReviews.length}</span>
                </button>
                <button onClick={() => setContentView("photos")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${contentView === "photos" ? "bg-[#ff5100] text-white shadow-md shadow-[#ff5100]/20" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"}`}>
                  <Image className="w-3.5 h-3.5" />
                  Photos
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${contentView === "photos" ? "bg-[var(--text-muted)] text-white" : "bg-[var(--bg-surface-2)] text-[var(--text-tertiary)]"}`}>{localPhotos.length}</span>
                </button>
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder={contentView === "reviews" ? "Search reviews…" : "Search photos…"}
                  value={contentView === "reviews" ? reviewSearch : photoSearch}
                  onChange={e => contentView === "reviews" ? setReviewSearch(e.target.value) : setPhotoSearch(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-white text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#ff5100]/40 transition-all"
                />
              </div>
              <span className="text-[11px] text-[var(--text-muted)] font-semibold ml-auto">
                {contentView === "reviews" ? `${filteredReviews.length} reviews` : `${filteredPhotos.length} photos`}
              </span>
            </div>

            {/* ── REVIEWS ── */}
            {contentView === "reviews" && (
              filteredReviews.length === 0 ? (
                <div className="border border-[var(--border-subtle)] rounded-2xl p-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center"><StarOff className="w-6 h-6" /></div>
                    <p className="text-sm font-semibold">{localReviews.length === 0 ? "No reviews yet" : "No reviews match search"}</p>
                  </div>
                </div>
              ) : (
                <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">User</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hidden sm:table-cell">Adventure</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Rating</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hidden md:table-cell">Review</th>
                        <th className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hidden lg:table-cell">Date</th>
                        <th className="text-right px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReviews.map(review => (
                        <tr key={review.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-card)] transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff5100]/15 to-[#ff5100]/5 border border-[#ff5100]/10 flex items-center justify-center text-[#ff7d47] font-black text-xs shrink-0">
                                {review.username[0]?.toUpperCase() ?? "?"}
                              </div>
                              <span className="text-[12px] font-semibold text-[var(--text-primary)]">{review.username}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <span className="text-[11px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-lg">{review.adventure_slug}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-[var(--text-muted)]"}`} />
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell max-w-xs">
                            <p className="text-[12px] text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">{review.body}</p>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className="text-[11px] text-[var(--text-muted)]">{format(parseISO(review.created_at), "MMM d, yyyy")}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                disabled={loadingId === review.id}
                                className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40"
                                title="Delete review"
                              >
                                {loadingId === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* ── PHOTOS ── */}
            {contentView === "photos" && (
              filteredPhotos.length === 0 ? (
                <div className="border border-[var(--border-subtle)] rounded-2xl p-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center"><Image className="w-6 h-6" /></div>
                    <p className="text-sm font-semibold">{localPhotos.length === 0 ? "No photos yet" : "No photos match search"}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredPhotos.map(photo => (
                    <div key={photo.id} className="group relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all bg-[var(--bg-card)]">
                      {/* Image */}
                      <div className="aspect-square relative overflow-hidden bg-[var(--bg-card)]">
                        <img
                          src={photo.url}
                          alt={photo.caption || "Adventure photo"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Delete overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-[var(--bg-card)] transition-all flex items-center justify-center">
                          <button
                            onClick={() => handleDeletePhoto(photo)}
                            disabled={loadingId === photo.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 text-white disabled:opacity-40"
                          >
                            {loadingId === photo.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Delete
                          </button>
                        </div>
                      </div>
                      {/* Meta */}
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[11px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded truncate">{photo.slug}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-[var(--text-secondary)] truncate">{photo.username}</p>
                        {photo.caption && <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 line-clamp-1">{photo.caption}</p>}
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">{format(parseISO(photo.created_at), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </Tabs.Content>

          {/* ── ANALYTICS TAB ── */}
          <Tabs.Content value="analytics" className="outline-none space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Growth */}
              <div className="bg-white/[0.025] border border-[var(--border-subtle)] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">Daily</p>
                    <h3 className="text-sm font-bold">Signups — Last 30 Days</h3>
                  </div>
                  <Delta value={weekDelta} label="vs prev week" />
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.growthData} margin={{ left: -10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff15" fontSize={8} tickLine={false} axisLine={false} minTickGap={40} />
                      <YAxis stroke="#ffffff15" fontSize={8} tickLine={false} axisLine={false} width={28} />
                      <Tooltip {...TT} />
                      <Line type="monotone" dataKey="count" stroke="#ff5100" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#ff5100", strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cumulative */}
              <div className="bg-white/[0.025] border border-[var(--border-subtle)] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">Cumulative</p>
                    <h3 className="text-sm font-bold">Total Community Growth</h3>
                  </div>
                  <TrendingUp className="w-4 h-4 text-blue-400/40" />
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.growthData} margin={{ left: -10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff15" fontSize={8} tickLine={false} axisLine={false} minTickGap={40} />
                      <YAxis stroke="#ffffff15" fontSize={8} tickLine={false} axisLine={false} width={28} />
                      <Tooltip {...TT} itemStyle={{ color: "#3b82f6" }} />
                      <Line type="stepAfter" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly breakdown */}
              <div className="bg-white/[0.025] border border-[var(--border-subtle)] rounded-2xl p-6">
                <div className="mb-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">By Month</p>
                  <h3 className="text-sm font-bold">Monthly Registrations</h3>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthData} margin={{ left: -10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                      <XAxis dataKey="month" stroke="#ffffff15" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff15" fontSize={8} tickLine={false} axisLine={false} width={28} />
                      <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} {...TT} />
                      <Bar dataKey="users" name="Users" fill="#ff5100" radius={[4,4,0,0]} barSize={14} />
                      <Bar dataKey="operators" name="Operators" fill="#06b6d4" radius={[4,4,0,0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ACE™ Distribution */}
              <div className="bg-white/[0.025] border border-[var(--border-subtle)] rounded-2xl p-6">
                <div className="mb-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">ACE<sup>™</sup> Assessment</p>
                  <h3 className="text-sm font-bold">Rank Distribution</h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {aceCount} of {totalUsers} users completed
                    <span className="ml-1.5 text-[var(--text-muted)]">({Math.round((aceCount/Math.max(totalUsers,1))*100)}%)</span>
                  </p>
                </div>
                {aceCount === 0 ? (
                  <div className="h-[160px] flex items-center justify-center text-[var(--text-muted)] text-sm">No ACE<sup>™</sup> data yet</div>
                ) : (
                  <div className="space-y-3">
                    {RANKS.slice().reverse().map(rank => {
                      const d = analyticsData.aceData.find(x => x.rank === rank);
                      const count = d?.count ?? 0;
                      const pct = aceCount > 0 ? Math.round((count / aceCount) * 100) : 0;
                      return (
                        <div key={rank} className="flex items-center gap-3">
                          <span className="w-20 text-[11px] font-semibold shrink-0" style={{ color: RANK_COLORS[rank] }}>{rank}</span>
                          <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface)]">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: RANK_COLORS[rank] }} />
                          </div>
                          <span className="text-[10px] font-black w-8 text-right tabular-nums" style={{ color: RANK_COLORS[rank] + "80" }}>{count}</span>
                          <span className="text-[10px] text-[var(--text-muted)] w-8 text-right tabular-nums">{pct}%</span>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3">
                        <span className="w-20 text-[11px] font-semibold text-[var(--text-muted)] shrink-0">No ACE<sup>™</sup></span>
                        <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface)]">
                          <div className="h-full rounded-full bg-[var(--bg-surface-2)]" style={{ width: `${Math.round(((totalUsers - aceCount)/Math.max(totalUsers,1))*100)}%` }} />
                        </div>
                        <span className="text-[10px] font-black w-8 text-right tabular-nums text-[var(--text-muted)]">{totalUsers - aceCount}</span>
                        <span className="text-[10px] text-[var(--text-muted)] w-8 text-right tabular-nums">{Math.round(((totalUsers-aceCount)/Math.max(totalUsers,1))*100)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Story submission funnel */}
            <div className="border border-[var(--border-subtle)] rounded-2xl p-6" style={{ background: "var(--bg-card)" }}>
              <div className="mb-5">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">Submissions</p>
                <h3 className="text-sm font-bold">Story Submission Funnel</h3>
              </div>
              {localStories.length === 0 ? (
                <div className="h-[100px] flex items-center justify-center text-[var(--text-muted)] text-sm">No story submissions yet</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total", value: localStories.length, color: "#ff5100" },
                    { label: "Pending", value: localStories.filter(s => s.status === "pending").length, color: "#f59e0b" },
                    { label: "Approved", value: localStories.filter(s => s.status === "approved").length, color: "#22c55e" },
                    { label: "Rejected", value: localStories.filter(s => s.status === "rejected").length, color: "#ef4444" },
                  ].map(({ label, value, color }) => {
                    const pct = localStories.length > 0 ? Math.round((value / localStories.length) * 100) : 0;
                    return (
                      <div key={label} className="p-4 rounded-xl border border-[var(--border-subtle)]" style={{ background: "var(--bg-surface)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: color + "18", color }}>{pct}%</span>
                        </div>
                        <p className="text-2xl font-black tracking-tight" style={{ color }}>{value}</p>
                        <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-surface-2)]">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Tabs.Content>

        </Tabs.Root>
      </div>
    </div>
  );
}
