"use client";

import { useState, useMemo } from "react";
import {
  updateUserRole, deleteUser, banUser, unbanUser,
  sendPasswordReset, deleteMessage, updateStoryStatus, deleteStory,
} from "./actions";
import { approveOperatorSubmission, rejectOperatorSubmission, type OperatorProfile, type OperatorSubmission } from "@/app/auth/operator-actions";
import { logout } from "@/app/auth/actions";
import {
  Mountain, Users, Shield, Trash2, ChevronDown, LogOut, Search, Download,
  BarChart3, Calendar, Filter, ArrowUpRight, TrendingUp, MessageSquare,
  ExternalLink, BookOpen, MapPin, Tag, Clock, Phone, Mail, Building2,
  CheckCircle2, AlertCircle, XCircle, Loader2, Globe, FileText,
  Ban, KeyRound, ChevronRight, Eye, Copy, RefreshCw, Activity,
  Star,
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie,
} from "recharts";
import * as Tabs from "@radix-ui/react-tabs";
import { format, subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";

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

// ── Tooltip style ──────────────────────────────────────────────────────────────

const TT = {
  contentStyle: { backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12, color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" },
  itemStyle: { color: "#ff7d47" },
  labelStyle: { color: "rgba(255,255,255,0.5)", marginBottom: 4 },
};

// ── ACE rank helpers ───────────────────────────────────────────────────────────
const RANKS = ["Uncharted","Pathfinder","Navigator","Trailblazer","Vanguard","Apex"] as const;
const RANK_COLORS: Record<string,string> = { Uncharted:"#6b7280",Pathfinder:"#22d3ee",Navigator:"#4ade80",Trailblazer:"#f59e0b",Vanguard:"#f97316",Apex:"#a78bfa" };
function getRank(ace: Record<string,number>) {
  const total = Object.values(ace).reduce((a,b) => a+b, 0);
  if (total >= 40) return "Apex"; if (total >= 32) return "Vanguard";
  if (total >= 24) return "Trailblazer"; if (total >= 16) return "Navigator";
  if (total >= 8) return "Pathfinder"; return "Uncharted";
}

// ── Tiny toast ─────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const show = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  return { toast, show };
}

// ── Copy to clipboard ──────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded-md hover:bg-white/10 transition-colors text-white/25 hover:text-white/60"
      title="Copy"
    >
      {copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ── User detail panel ──────────────────────────────────────────────────────────
function UserDetailPanel({
  profile, currentUserId, onAction,
}: {
  profile: Profile;
  currentUserId: string;
  onAction: (type: string, id: string, extra?: string) => void;
}) {
  const isSelf = profile.id === currentUserId;
  const ace = profile.ace_profile?.ace;
  const rank = ace ? getRank(ace) : null;
  const rankColor = rank ? RANK_COLORS[rank] : "#6b7280";

  return (
    <tr>
      <td colSpan={6} className="px-0 py-0">
        <div className="mx-2 mb-2 rounded-2xl border p-5 grid grid-cols-1 md:grid-cols-3 gap-5"
          style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.08)" }}>

          {/* Col 1: Identity */}
          <div className="space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">Identity</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-white/25 shrink-0" />
                <span className="text-[12px] font-mono text-white/70 truncate">{profile.email}</span>
                {profile.email && <CopyBtn text={profile.email} />}
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-white/25 shrink-0" />
                  <span className="text-[12px] font-mono text-white/70">{profile.phone}</span>
                  <CopyBtn text={profile.phone} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-white/25 shrink-0" />
                <span className="text-[11px] text-white/45">Joined {format(parseISO(profile.created_at), "MMM d, yyyy")}</span>
              </div>
              {profile.last_sign_in_at && (
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-white/25 shrink-0" />
                  <span className="text-[11px] text-white/45">Last seen {format(parseISO(profile.last_sign_in_at), "MMM d, yyyy · HH:mm")}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Copy className="w-3 h-3 text-white/25 shrink-0" />
                <span className="text-[10px] font-mono text-white/25 truncate">{profile.id}</span>
                <CopyBtn text={profile.id} />
              </div>
            </div>
          </div>

          {/* Col 2: ACE Profile */}
          <div className="space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">ACE Profile</p>
            {ace ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-black" style={{ color: rankColor }}>{rank}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${rankColor}18`, color: rankColor }}>
                    Score {Object.values(ace).reduce((a,b) => a+b, 0)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(ace).map(([axis, val]) => (
                    <div key={axis} className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-white/[0.07]">
                        <div className="h-full rounded-full bg-[#ff5100]" style={{ width: `${(val/5)*100}%` }} />
                      </div>
                      <span className="text-[9px] text-white/35 w-12 capitalize">{axis}</span>
                      <span className="text-[9px] font-black text-white/50 w-3">{val}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 py-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white/20" />
                </div>
                <span className="text-[11px] text-white/30">No assessment taken</span>
              </div>
            )}
          </div>

          {/* Col 3: Actions */}
          {!isSelf && (
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">Actions</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => profile.email && onAction("reset", profile.id, profile.email)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 text-white/50 hover:text-blue-300"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Send Password Reset
                </button>
                <button
                  onClick={() => onAction(profile.banned ? "unban" : "ban", profile.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all border ${
                    profile.banned
                      ? "border-green-500/25 hover:border-green-500/45 hover:bg-green-500/10 text-green-400/70 hover:text-green-300"
                      : "border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/8 text-white/40 hover:text-amber-300"
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  {profile.banned ? "Unban User" : "Ban User"}
                </button>
                <button
                  onClick={() => onAction("delete", profile.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all border border-red-500/15 hover:border-red-500/40 hover:bg-red-500/8 text-white/35 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Account
                </button>
              </div>
            </div>
          )}
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
  operatorTablesExist = false,
}: {
  profiles: Profile[];
  currentUserId: string;
  messages?: Message[];
  storySubmissions?: StorySubmission[];
  operatorProfiles?: OperatorProfile[];
  operatorSubmissions?: OperatorSubmission[];
  operatorTablesExist?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("users");
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
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const { toast, show: showToast } = useToast();

  // ── Filtered users ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return localProfiles.filter((p) => {
      // Operators only appear in the Operators tab, not Users tab
      if (p.role === "operator") return false;
      const matchesSearch =
        (p.full_name?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
        (p.email?.toLowerCase() ?? "").includes(search.toLowerCase());
      const matchesRole =
        roleFilter === "all" ? true :
        roleFilter === "banned" ? !!p.banned :
        roleFilter === "ace" ? !!p.ace_profile :
        p.role === roleFilter;
      let matchesDate = true;
      if (dateRange !== "all") {
        const date = parseISO(p.created_at);
        const days = parseInt(dateRange.replace("d", ""));
        matchesDate = isWithinInterval(date, { start: startOfDay(subDays(new Date(), days)), end: endOfDay(new Date()) });
      }
      return matchesSearch && matchesRole && matchesDate;
    });
  }, [localProfiles, search, roleFilter, dateRange]);

  // ── Analytics data ────────────────────────────────────────────────────────────
  const analyticsData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, "MMM dd");
      const count = localProfiles.filter(
        (p) => format(parseISO(p.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      ).length;
      return { date: dateStr, count };
    });
    let total = 0;
    const growthData = last30Days.map((d) => { total += d.count; return { ...d, total }; });

    const roleData = [
      { name: "Users", value: localProfiles.filter((p) => p.role === "user").length, color: "#ff5100" },
      { name: "Admins", value: localProfiles.filter((p) => p.role === "admin").length, color: "#a855f7" },
      { name: "Operators", value: localProfiles.filter((p) => p.role === "operator").length, color: "#06b6d4" },
    ];

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthData = months.map((month, idx) => ({
      month,
      count: localProfiles.filter((p) => parseISO(p.created_at).getMonth() === idx).length,
    }));

    // ACE rank distribution
    const rankCounts: Record<string, number> = {};
    localProfiles.forEach((p) => {
      if (!p.ace_profile?.ace) return;
      const r = getRank(p.ace_profile.ace);
      rankCounts[r] = (rankCounts[r] ?? 0) + 1;
    });
    const aceData = RANKS.map((r) => ({ rank: r, count: rankCounts[r] ?? 0, color: RANK_COLORS[r] })).filter(d => d.count > 0);

    return { growthData, roleData, monthData, aceData };
  }, [localProfiles]);

  const totalUsers = localProfiles.filter((p) => p.role === "user").length;
  const totalAdmins = localProfiles.filter((p) => p.role === "admin").length;
  const totalOperators = localProfiles.filter((p) => p.role === "operator").length;
  const newToday = analyticsData.growthData[29]?.count || 0;
  const aceCount = localProfiles.filter((p) => !!p.ace_profile).length;
  const pendingOperatorSubmissions = localOperatorSubmissions.filter((s) => s.status === "pending").length;
  const pendingStories = localStories.filter(s => s.status === "pending").length;

  // ── User action handler ───────────────────────────────────────────────────────
  async function handleUserAction(type: string, userId: string, extra?: string) {
    setLoadingId(userId);
    if (type === "role") {
      await updateUserRole(userId, extra!);
      setLocalProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: extra! } : p));
      showToast("Role updated");
    } else if (type === "ban") {
      if (!confirm("Ban this user? They won't be able to sign in.")) { setLoadingId(null); return; }
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
      if (!confirm("Delete this user permanently? Cannot be undone.")) { setLoadingId(null); return; }
      await deleteUser(userId);
      setLocalProfiles(prev => prev.filter(p => p.id !== userId));
      setExpandedUserId(null);
      showToast("User deleted");
    }
    setLoadingId(null);
  }

  // ── Operator submission handler ───────────────────────────────────────────────
  async function handleOperatorSubmissionAction(subId: string, action: "approve" | "reject") {
    setLoadingId(subId);
    if (action === "approve") {
      await approveOperatorSubmission(subId);
      setLocalOperatorSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: "approved" } : s));
    } else {
      await rejectOperatorSubmission(subId);
      setLocalOperatorSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: "rejected" } : s));
    }
    setLoadingId(null);
  }

  // ── Message delete ────────────────────────────────────────────────────────────
  async function handleDeleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    setLoadingId(id);
    await deleteMessage(id);
    setLocalMessages(prev => prev.filter(m => m.id !== id));
    setLoadingId(null);
    showToast("Message deleted");
  }

  // ── Story actions ─────────────────────────────────────────────────────────────
  async function handleStoryAction(story: StorySubmission, action: "approve" | "reject" | "delete") {
    if (!story._fileName) { showToast("Missing file name"); return; }
    setLoadingId(story.id);
    if (action === "delete") {
      if (!confirm("Delete this story submission?")) { setLoadingId(null); return; }
      await deleteStory(story._fileName);
      setLocalStories(prev => prev.filter(s => s.id !== story.id));
      showToast("Story deleted");
    } else {
      const status = action === "approve" ? "approved" : "rejected";
      await updateStoryStatus(story._fileName, status);
      setLocalStories(prev => prev.map(s => s.id === story.id ? { ...s, status } : s));
      showToast(`Story ${status}`);
    }
    setLoadingId(null);
  }

  const exportToExcel = () => {
    const data = filtered.map(p => ({
      ID: p.id, Name: p.full_name || "N/A", Email: p.email || "N/A",
      Phone: p.phone || "N/A", Role: p.role,
      Banned: p.banned ? "Yes" : "No",
      ACE: p.ace_profile ? "Yes" : "No",
      Joined: format(parseISO(p.created_at), "yyyy-MM-dd HH:mm:ss"),
      LastLogin: p.last_sign_in_at ? format(parseISO(p.last_sign_in_at), "yyyy-MM-dd HH:mm:ss") : "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `TrailToTides_Users_${format(new Date(), "yyyyMMdd")}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] border border-white/10 text-white text-[12px] font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between sticky top-0 bg-[#080808]/90 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center group-hover:bg-[#ff5100]/20 transition-all">
              <Mountain className="w-4 h-4 text-[#ff7d47]" />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-white/80 group-hover:text-white transition-colors">Trail to Tides</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            <ExternalLink className="w-3.5 h-3.5" /> View Site
          </Link>
          <form action={logout}>
            <button type="submit" className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/5">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Page title + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff5100]/70 mb-1">Overview</p>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="flex flex-wrap items-center gap-1 bg-white/[0.04] border border-white/[0.07] p-1 rounded-xl">
              {[
                { value: "users",     icon: Users,       label: "Users" },
                { value: "messages",  icon: MessageSquare, label: "Messages", badge: localMessages.length },
                { value: "stories",   icon: BookOpen,    label: "Stories",   badge: pendingStories },
                { value: "operators", icon: Building2,   label: "Operators", badge: pendingOperatorSubmissions },
                { value: "analytics", icon: BarChart3,   label: "Analytics" },
              ].map(({ value, icon: Icon, label, badge }) => (
                <Tabs.Trigger key={value} value={value}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all outline-none ${
                    activeTab === value ? "bg-[#ff5100] text-white shadow-lg shadow-[#ff5100]/20" : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {badge != null && badge > 0 && (
                    <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">{badge}</span>
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-10">
          {[
            { label: "Total Users",   value: totalUsers,           sub: "Registered accounts",   icon: Users,       color: "#ff5100" },
            { label: "Admins",        value: totalAdmins,          sub: "Platform control",      icon: Shield,      color: "#a855f7" },
            { label: "New Today",     value: `+${newToday}`,       sub: "Registrations",         icon: TrendingUp,  color: "#3b82f6" },
            { label: "ACE Complete",  value: aceCount,             sub: `${Math.round((aceCount/Math.max(localProfiles.length,1))*100)}% of users`, icon: Star, color: "#f59e0b" },
            { label: "Messages",      value: localMessages.length, sub: "Contact inbox",         icon: MessageSquare, color: "#22c55e" },
            { label: "Operators",     value: totalOperators, sub: `${pendingOperatorSubmissions} pending`, icon: Building2, color: "#06b6d4" },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 overflow-hidden group hover:border-white/[0.12] transition-all">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: color + "33" }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: color + "18" }}>
                <Icon className="w-[18px] h-[18px]" style={{ color }} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-1">{label}</p>
              <p className="text-3xl font-black tracking-tight">{value}</p>
              <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold" style={{ color }}>
                <ArrowUpRight className="w-3 h-3" />{sub}
              </div>
            </div>
          ))}
        </div>

        {/* Tab contents */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>

          {/* ── USERS TAB ── */}
          <Tabs.Content value="users" className="outline-none space-y-5">
            <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                  <input type="text" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-white text-[13px] placeholder-white/25 focus:outline-none focus:border-[#ff5100]/40 transition-all" />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#ff5100]/40 cursor-pointer transition-all">
                    <option value="all" className="bg-[#111]">All Roles</option>
                    <option value="user" className="bg-[#111]">Users</option>
                    <option value="admin" className="bg-[#111]">Admins</option>
                    <option value="banned" className="bg-[#111]">Banned</option>
                    <option value="ace" className="bg-[#111]">Has ACE</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                    className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#ff5100]/40 cursor-pointer transition-all">
                    <option value="all" className="bg-[#111]">All time</option>
                    <option value="7d" className="bg-[#111]">Last 7 days</option>
                    <option value="30d" className="bg-[#111]">Last 30 days</option>
                    <option value="90d" className="bg-[#111]">Last 90 days</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                </div>
              </div>
              <button onClick={exportToExcel}
                className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.14] text-white/70 hover:text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95 whitespace-nowrap">
                <Download className="w-3.5 h-3.5" /> Export Excel
              </button>
            </div>

            <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="w-8 px-4 py-3.5" />
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">User</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden md:table-cell">Last Login</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Role</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden sm:table-cell">ACE</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden lg:table-cell">Joined</th>
                    <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-white/20">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center"><Users className="w-7 h-7" /></div>
                        <p className="text-sm font-semibold">No users match your filters</p>
                      </div>
                    </td></tr>
                  ) : filtered.map((profile) => {
                    const isExpanded = expandedUserId === profile.id;
                    const isSelf = profile.id === currentUserId;
                    const aceRank = profile.ace_profile?.ace ? getRank(profile.ace_profile.ace) : null;
                    return (
                      <>
                        <tr key={profile.id}
                          className={`border-b border-white/[0.04] transition-colors group/row last:border-0 ${isExpanded ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}>
                          {/* Expand toggle */}
                          <td className="pl-4 pr-2 py-4">
                            <button onClick={() => setExpandedUserId(isExpanded ? null : profile.id)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/25 hover:text-white/60">
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff5100]/20 to-[#ff5100]/5 border border-[#ff5100]/10 flex items-center justify-center text-[#ff7d47] font-black text-sm shrink-0">
                                {(profile.full_name?.[0] ?? profile.email?.[0] ?? "?").toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white/90 text-[13px] leading-tight">
                                  {profile.full_name || "Unnamed User"}
                                  {isSelf && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#ff5100]/15 text-[9px] text-[#ff7d47] font-black uppercase tracking-wider">you</span>}
                                  {profile.banned && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-500/15 text-[9px] text-red-400 font-black uppercase tracking-wider">banned</span>}
                                </p>
                                <p className="text-white/35 text-[11px] font-mono mt-0.5">{profile.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <p className="text-[11px] text-white/40 font-medium">
                              {profile.last_sign_in_at ? format(parseISO(profile.last_sign_in_at), "MMM d, yyyy") : "—"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              profile.role === "admin" ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                              : profile.role === "operator" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                              : "bg-white/5 text-white/40 border border-white/8"
                            }`}>
                              {profile.role === "admin" ? <Shield className="w-2.5 h-2.5" /> : profile.role === "operator" ? <Building2 className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
                              {profile.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            {aceRank ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{ background: RANK_COLORS[aceRank]+"18", color: RANK_COLORS[aceRank] }}>
                                <Star className="w-2.5 h-2.5" />{aceRank}
                              </span>
                            ) : (
                              <span className="text-white/20 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <p className="text-[11px] text-white/35 font-medium">{format(parseISO(profile.created_at), "MMM d, yyyy")}</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isSelf && (
                                <>
                                  <button
                                    onClick={() => handleUserAction(profile.banned ? "unban" : "ban", profile.id)}
                                    disabled={loadingId === profile.id}
                                    className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${
                                      profile.banned ? "text-green-400/60 hover:text-green-300 hover:bg-green-500/10" : "text-white/20 hover:text-amber-400 hover:bg-amber-500/10"
                                    }`}
                                    title={profile.banned ? "Unban" : "Ban"}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleUserAction("delete", profile.id)}
                                    disabled={loadingId === profile.id}
                                    className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <UserDetailPanel key={`detail-${profile.id}`} profile={profile} currentUserId={currentUserId} onAction={handleUserAction} />
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 py-2">
              {filtered.length} {filtered.length === 1 ? "user" : "users"} shown
            </p>
          </Tabs.Content>

          {/* ── MESSAGES TAB ── */}
          <Tabs.Content value="messages" className="outline-none space-y-5">
            {localMessages.length === 0 ? (
              <div className="border border-white/[0.07] rounded-2xl p-20 text-center">
                <div className="flex flex-col items-center gap-3 text-white/20">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center"><MessageSquare className="w-7 h-7" /></div>
                  <p className="text-sm font-semibold">No messages yet</p>
                  <p className="text-xs text-white/15">Messages from your contact form will appear here.</p>
                </div>
              </div>
            ) : localMessages.map((msg) => (
              <div key={msg.id} className="border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all group">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/15 flex items-center justify-center text-green-400 font-black text-sm shrink-0">
                      {(msg.name?.[0] ?? msg.email?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white/90 text-[13px] leading-tight">{msg.name || "Guest"}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-white/35 text-[11px] font-mono">{msg.email}</p>
                        <CopyBtn text={msg.email} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-white/30 text-[11px] font-medium whitespace-nowrap">
                      {format(parseISO(msg.created_at), "MMM d · HH:mm")}
                    </span>
                    <a href={`mailto:${msg.email}?subject=Re: Your message to Trail to Tides`}
                      className="p-1.5 text-white/25 hover:text-[#ff7d47] hover:bg-[#ff5100]/10 rounded-lg transition-all" title="Reply">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => handleDeleteMessage(msg.id)} disabled={loadingId === msg.id}
                      className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40" title="Delete">
                      {loadingId === msg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="ml-12 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.05]">
                  <p className="text-white/60 text-[13px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            ))}
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 py-2">
              {localMessages.length} {localMessages.length === 1 ? "message" : "messages"} total
            </p>
          </Tabs.Content>

          {/* ── STORIES TAB ── */}
          <Tabs.Content value="stories" className="outline-none space-y-4">
            {/* Filter tabs */}
            <div className="flex gap-2">
              {(["all","pending","approved","rejected"] as const).map(s => (
                <button key={s} onClick={() => {}}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/[0.07] text-white/40 hover:text-white/70 hover:border-white/[0.15] transition-all capitalize">
                  {s} {s === "all" ? `(${localStories.length})` : `(${localStories.filter(x => x.status === s).length})`}
                </button>
              ))}
            </div>
            {localStories.length === 0 ? (
              <div className="border border-white/[0.07] rounded-2xl p-20 text-center">
                <div className="flex flex-col items-center gap-3 text-white/20">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center"><BookOpen className="w-7 h-7" /></div>
                  <p className="text-sm font-semibold">No story submissions yet</p>
                </div>
              </div>
            ) : localStories.map(sub => {
              const isExpanded = expandedStoryId === sub.id;
              return (
                <div key={sub.id} className="border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all">
                  {/* Header row */}
                  <div className="flex items-start gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-bold text-white/90 text-[14px] leading-tight mb-0.5">{sub.title}</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-white/50 text-[12px] font-semibold">{sub.author_name}</span>
                            {sub.state && <div className="flex items-center gap-1 text-white/30 text-[11px]"><MapPin className="w-2.5 h-2.5" />{sub.state}</div>}
                            <span className="text-white/25 text-[11px]">{format(parseISO(sub.created_at), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          sub.status === "pending" ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                          : sub.status === "approved" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                          : "bg-white/5 text-white/30 border border-white/8"
                        }`}>{sub.status}</span>
                      </div>
                      <p className="text-white/40 text-[12px] leading-relaxed line-clamp-2 mb-3">{sub.excerpt}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {sub.email && <a href={`mailto:${sub.email}`} className="inline-flex items-center gap-1 text-[11px] text-[#ff7d47]/70 hover:text-[#ff7d47] transition-colors"><Mail className="w-3 h-3" />{sub.email}</a>}
                        {sub.tags?.slice(0,3).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-0.5 bg-white/5 border border-white/8 text-white/30 text-[9px] font-semibold px-2 py-0.5 rounded-full"><Tag className="w-2 h-2" />{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="border-t border-white/[0.05] px-5 py-3 flex items-center justify-between gap-3 bg-white/[0.01]">
                    <button onClick={() => setExpandedStoryId(isExpanded ? null : sub.id)}
                      className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/60 font-semibold transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      {isExpanded ? "Hide" : "Read Full Story"}
                    </button>
                    <div className="flex items-center gap-2">
                      {sub.status !== "approved" && (
                        <button onClick={() => handleStoryAction(sub, "approve")} disabled={loadingId === sub.id}
                          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-emerald-500/25 text-emerald-400/80 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all disabled:opacity-40">
                          {loadingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                        </button>
                      )}
                      {sub.status !== "rejected" && (
                        <button onClick={() => handleStoryAction(sub, "reject")} disabled={loadingId === sub.id}
                          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:border-red-500/35 transition-all disabled:opacity-40">
                          {loadingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Reject
                        </button>
                      )}
                      <button onClick={() => handleStoryAction(sub, "delete")} disabled={loadingId === sub.id}
                        className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded story body */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.05] px-5 py-5 bg-white/[0.01]">
                      <p className="text-white/60 text-[13px] leading-relaxed whitespace-pre-wrap">{sub.body}</p>
                    </div>
                  )}
                </div>
              );
            })}
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 py-2">
              {localStories.length} {localStories.length === 1 ? "submission" : "submissions"} total
            </p>
          </Tabs.Content>

          {/* ── OPERATORS TAB ── */}
          <Tabs.Content value="operators" className="outline-none space-y-8">
            {!operatorTablesExist && (
              <div className="flex items-start gap-4 bg-amber-500/8 border border-amber-500/25 rounded-2xl p-5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0"><AlertCircle className="w-[18px] h-[18px] text-amber-400" /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-300 mb-1">Database Tables Not Set Up</p>
                  <p className="text-[12px] text-white/50 leading-relaxed">Run <code className="text-[#ff7d47] font-mono bg-white/5 px-1.5 py-0.5 rounded">OPERATOR_SETUP.sql</code> in Supabase Dashboard → SQL Editor.</p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-white/30" />
                <h2 className="text-base font-bold">Registered Operators</h2>
                <span className="bg-white/8 text-white/40 text-[9px] font-black px-2 py-0.5 rounded-full">{totalOperators} total</span>
              </div>
              {totalOperators === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 text-center">
                  <Building2 className="w-6 h-6 text-white/20 mx-auto mb-2" />
                  <p className="text-white/30 text-sm font-semibold">No operator accounts yet</p>
                </div>
              ) : (
                <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Operator</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden md:table-cell">Contact</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden sm:table-cell">Website</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localProfiles.filter(p => p.role === "operator").map(p => {
                        const op = localOperatorProfiles.find(o => o.user_id === p.id);
                        return (
                        <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] last:border-0 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center text-cyan-400 font-black text-sm shrink-0">
                                {(op?.company_name?.[0] ?? p.full_name?.[0] ?? p.email?.[0] ?? "?").toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white/90 text-[13px] leading-tight">{op?.company_name ?? p.full_name ?? "—"}</p>
                                <p className="text-white/35 text-[10px] font-mono mt-0.5">{p.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <p className="text-white/60 text-[12px]">{op?.contact_name ?? p.full_name ?? "—"}</p>
                            <p className="text-white/30 text-[10px] font-mono mt-0.5">{op?.phone ?? p.phone ?? "—"}</p>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            {op?.website ? (
                              <a href={op.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#ff7d47]/70 hover:text-[#ff7d47] text-[11px] transition-colors">
                                <Globe className="w-3 h-3" />{op.website.replace(/^https?:\/\//, "")}
                              </a>
                            ) : <span className="text-white/25 text-[11px]">—</span>}
                          </td>
                          <td className="px-5 py-4 text-white/30 text-[11px]">
                            {format(parseISO(p.created_at), "MMM d, yyyy")}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-white/30" />
                <h2 className="text-base font-bold">Price & Date Submissions</h2>
                {pendingOperatorSubmissions > 0 && <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full">{pendingOperatorSubmissions} pending</span>}
              </div>
              {localOperatorSubmissions.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 text-center">
                  <FileText className="w-6 h-6 text-white/20 mx-auto mb-2" />
                  <p className="text-white/30 text-sm font-semibold">No submissions yet</p>
                </div>
              ) : (
                <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Operator</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Adventure</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden sm:table-cell">Price From</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden md:table-cell">Dates</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Status</th>
                        <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localOperatorSubmissions.map(sub => (
                        <tr key={sub.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] last:border-0 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-white/90 text-[12px] leading-tight">{sub.company_name ?? sub.operator_name}</p>
                            <p className="text-white/30 text-[10px] font-mono mt-0.5">{sub.operator_id}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-white/80 text-[12px] font-semibold">{sub.adventure_slug}</p>
                            <p className="text-white/30 text-[10px] mt-0.5">{sub.operator_name}</p>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <span className="text-[#ff7d47] font-bold text-[13px]">₹{sub.price_from}</span>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            {sub.exact_dates?.length ? (
                              <div className="flex flex-wrap gap-1">
                                {sub.exact_dates.slice(0,2).map((d,i) => <span key={i} className="bg-white/5 border border-white/8 text-white/50 text-[10px] px-2 py-0.5 rounded-lg font-mono">{d}</span>)}
                                {sub.exact_dates.length > 2 && <span className="text-white/25 text-[10px] py-0.5">+{sub.exact_dates.length-2}</span>}
                              </div>
                            ) : <span className="text-white/25 text-[11px]">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            {sub.status === "approved" ? <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"><CheckCircle2 className="w-2.5 h-2.5"/>Approved</span>
                            : sub.status === "rejected" ? <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/25 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"><XCircle className="w-2.5 h-2.5"/>Rejected</span>
                            : <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"><Clock className="w-2.5 h-2.5"/>Pending</span>}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {sub.status === "pending" && (
                                <>
                                  <button onClick={() => handleOperatorSubmissionAction(sub.id, "approve")} disabled={loadingId === sub.id}
                                    className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-emerald-500/25 text-emerald-400/80 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all disabled:opacity-40">
                                    {loadingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                                  </button>
                                  <button onClick={() => handleOperatorSubmissionAction(sub.id, "reject")} disabled={loadingId === sub.id}
                                    className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:border-red-500/35 transition-all disabled:opacity-40">
                                    {loadingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reject"}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Tabs.Content>

          {/* ── ANALYTICS TAB ── */}
          <Tabs.Content value="analytics" className="outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* User Growth */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-1">30-Day Trend</p>
                    <h3 className="text-base font-bold">User Growth</h3>
                  </div>
                  <span className="bg-[#ff5100]/10 border border-[#ff5100]/20 text-[#ff7d47] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">Live</span>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.growthData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} minTickGap={40} />
                      <YAxis stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip {...TT} />
                      <Line type="monotone" dataKey="count" stroke="#ff5100" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#ff5100", strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cumulative */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-1">Cumulative</p>
                    <h3 className="text-base font-bold">Total Community</h3>
                  </div>
                  <TrendingUp className="w-4 h-4 text-blue-400/50" />
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.growthData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} minTickGap={40} />
                      <YAxis stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip {...TT} itemStyle={{ color: "#3b82f6" }} />
                      <Line type="stepAfter" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ACE Rank Distribution */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-1">ACE Assessment</p>
                  <h3 className="text-base font-bold">Rank Distribution</h3>
                  <p className="text-[11px] text-white/30 mt-1">{aceCount} of {localProfiles.length} users completed</p>
                </div>
                {analyticsData.aceData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-white/20 text-sm">No ACE data yet</div>
                ) : (
                  <div className="space-y-2.5">
                    {RANKS.map(rank => {
                      const d = analyticsData.aceData.find(x => x.rank === rank);
                      const count = d?.count ?? 0;
                      const pct = aceCount > 0 ? Math.round((count / aceCount) * 100) : 0;
                      return (
                        <div key={rank} className="flex items-center gap-3">
                          <span className="w-20 text-[11px] font-semibold shrink-0" style={{ color: RANK_COLORS[rank] }}>{rank}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/[0.06]">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: RANK_COLORS[rank] }} />
                          </div>
                          <span className="text-[11px] font-black tabular-nums w-6 text-right" style={{ color: RANK_COLORS[rank] + "99" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Monthly Influx */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-1">By Month</p>
                  <h3 className="text-base font-bold">Monthly Influx</h3>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="month" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} {...TT} />
                      <Bar dataKey="count" fill="#ff5100" radius={[5,5,0,0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </Tabs.Content>

        </Tabs.Root>
      </div>
    </div>
  );
}
