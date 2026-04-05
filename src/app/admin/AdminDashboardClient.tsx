"use client";

import { useState, useMemo } from "react";
import { updateUserRole, deleteUser } from "./actions";
import { approveOperatorSubmission, rejectOperatorSubmission, type OperatorProfile, type OperatorSubmission } from "@/app/auth/operator-actions";
import { logout } from "@/app/auth/actions";
import {
  Mountain,
  Users,
  Shield,
  Trash2,
  ChevronDown,
  LogOut,
  Search,
  Download,
  BarChart3,
  Calendar,
  Filter,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  BookOpen,
  MapPin,
  Tag,
  Clock,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Globe,
  FileText,
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import * as Tabs from "@radix-ui/react-tabs";
import { format, subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
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
  const [localProfiles, setLocalProfiles] = useState<Profile[]>(profiles);
  const [localOperatorProfiles, setLocalOperatorProfiles] = useState<OperatorProfile[]>(operatorProfiles);
  const [localOperatorSubmissions, setLocalOperatorSubmissions] = useState<OperatorSubmission[]>(operatorSubmissions);

  const filtered = useMemo(() => {
    return localProfiles.filter((p) => {
      const matchesSearch =
        (p.full_name?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
        (p.email?.toLowerCase() ?? "").includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || p.role === roleFilter;
      let matchesDate = true;
      if (dateRange !== "all") {
        const date = parseISO(p.created_at);
        const now = new Date();
        const days = parseInt(dateRange.replace("d", ""));
        matchesDate = isWithinInterval(date, {
          start: startOfDay(subDays(now, days)),
          end: endOfDay(now),
        });
      }
      return matchesSearch && matchesRole && matchesDate;
    });
  }, [localProfiles, search, roleFilter, dateRange]);

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
    const growthData = last30Days.map((d) => {
      total += d.count;
      return { ...d, total };
    });

    const roleData = [
      { name: "Users", value: localProfiles.filter((p) => p.role === "user").length, color: "#ff5100" },
      { name: "Admins", value: localProfiles.filter((p) => p.role === "admin").length, color: "#a855f7" },
    ];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthData = months.map((month, idx) => {
      const count = localProfiles.filter((p) => parseISO(p.created_at).getMonth() === idx).length;
      return { month, count };
    });

    return { growthData, roleData, monthData };
  }, [localProfiles]);

  const totalUsers = localProfiles.filter((p) => p.role === "user").length;
  const totalAdmins = localProfiles.filter((p) => p.role === "admin").length;
  const newToday = analyticsData.growthData[29]?.count || 0;
  const pendingOperatorSubmissions = localOperatorSubmissions.filter((s) => s.status === "pending").length;

  async function handleOperatorSubmissionAction(subId: string, action: "approve" | "reject") {
    setLoadingId(subId);
    if (action === "approve") {
      await approveOperatorSubmission(subId);
      setLocalOperatorSubmissions((prev) => prev.map((s) => s.id === subId ? { ...s, status: "approved" } : s));
    } else {
      await rejectOperatorSubmission(subId);
      setLocalOperatorSubmissions((prev) => prev.map((s) => s.id === subId ? { ...s, status: "rejected" } : s));
    }
    setLoadingId(null);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setLoadingId(userId);
    await updateUserRole(userId, newRole);
    setLocalProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p)));
    setLoadingId(null);
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setLoadingId(userId);
    await deleteUser(userId);
    setLocalProfiles((prev) => prev.filter((p) => p.id !== userId));
    setLoadingId(null);
  }

  const exportToExcel = () => {
    const dataToExport = filtered.map((p) => ({
      ID: p.id,
      Name: p.full_name || "N/A",
      Email: p.email || "N/A",
      Phone: p.phone || "N/A",
      Role: p.role,
      Joined: format(parseISO(p.created_at), "yyyy-MM-dd HH:mm:ss"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, `TrailToTides_Users_${format(new Date(), "yyyyMMdd")}.xlsx`);
  };

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#111",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "10px",
      fontSize: "12px",
      color: "#fff",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    },
    itemStyle: { color: "#ff7d47" },
    labelStyle: { color: "rgba(255,255,255,0.5)", marginBottom: 4 },
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>

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
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Site
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Page title + Tabs row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff5100]/70 mb-1">Overview</p>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>

          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] p-1 rounded-xl">
              {[
                { value: "users", icon: Users, label: "Users" },
                { value: "messages", icon: MessageSquare, label: "Messages", badge: messages.length },
                { value: "stories", icon: BookOpen, label: "Stories", badge: storySubmissions.filter(s => s.status === "pending").length },
                { value: "operators", icon: Building2, label: "Operators", badge: pendingOperatorSubmissions },
                { value: "analytics", icon: BarChart3, label: "Analytics" },
              ].map(({ value, icon: Icon, label, badge }) => (
                <Tabs.Trigger
                  key={value}
                  value={value}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all outline-none ${
                    activeTab === value
                      ? "bg-[#ff5100] text-white shadow-lg shadow-[#ff5100]/20"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {badge != null && badge > 0 && (
                    <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                      {badge}
                    </span>
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-10">
          {[
            {
              label: "Total Users",
              value: totalUsers,
              sub: "Active community",
              icon: Users,
              color: "#ff5100",
              bg: "bg-[#ff5100]/10",
              glow: "bg-[#ff5100]/20",
              subColor: "text-[#ff7d47]",
            },
            {
              label: "Admins",
              value: totalAdmins,
              sub: "Platform control",
              icon: Shield,
              color: "#a855f7",
              bg: "bg-purple-500/10",
              glow: "bg-purple-500/20",
              subColor: "text-purple-400",
            },
            {
              label: "New Today",
              value: `+${newToday}`,
              sub: "Registrations",
              icon: TrendingUp,
              color: "#3b82f6",
              bg: "bg-blue-500/10",
              glow: "bg-blue-500/20",
              subColor: "text-blue-400",
            },
            {
              label: "Messages",
              value: messages.length,
              sub: "Contact inbox",
              icon: MessageSquare,
              color: "#22c55e",
              bg: "bg-green-500/10",
              glow: "bg-green-500/20",
              subColor: "text-green-400",
            },
            {
              label: "Story Submissions",
              value: storySubmissions.length,
              sub: `${storySubmissions.filter(s => s.status === "pending").length} pending review`,
              icon: BookOpen,
              color: "#f59e0b",
              bg: "bg-amber-500/10",
              glow: "bg-amber-500/20",
              subColor: "text-amber-400",
            },
            {
              label: "Operators",
              value: localOperatorProfiles.length,
              sub: `${pendingOperatorSubmissions} pending submissions`,
              icon: Building2,
              color: "#06b6d4",
              bg: "bg-cyan-500/10",
              glow: "bg-cyan-500/20",
              subColor: "text-cyan-400",
            },
          ].map(({ label, value, sub, icon: Icon, bg, glow, subColor }) => (
            <div
              key={label}
              className="relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 overflow-hidden group hover:border-white/[0.12] transition-all"
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 ${glow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: "inherit" }} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-1">{label}</p>
              <p className="text-3xl font-black tracking-tight">{value}</p>
              <div className={`flex items-center gap-1 mt-2 text-[11px] font-semibold ${subColor}`}>
                <ArrowUpRight className="w-3 h-3" />
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* Tab Contents */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>

          {/* ── USERS TAB ── */}
          <Tabs.Content value="users" className="outline-none space-y-5">
            <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                  <input
                    type="text"
                    placeholder="Search name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-white text-[13px] placeholder-white/25 focus:outline-none focus:border-[#ff5100]/40 focus:bg-white/[0.06] transition-all"
                  />
                </div>

                {/* Role filter */}
                <div className="relative">
                  <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#ff5100]/40 cursor-pointer transition-all"
                  >
                    <option value="all" className="bg-[#111]">All Roles</option>
                    <option value="user" className="bg-[#111]">Users only</option>
                    <option value="admin" className="bg-[#111]">Admins only</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                </div>

                {/* Date filter */}
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#ff5100]/40 cursor-pointer transition-all"
                  >
                    <option value="all" className="bg-[#111]">All time</option>
                    <option value="7d" className="bg-[#111]">Last 7 days</option>
                    <option value="30d" className="bg-[#111]">Last 30 days</option>
                    <option value="90d" className="bg-[#111]">Last 90 days</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.14] text-white/70 hover:text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Export Excel
              </button>
            </div>

            {/* Table */}
            <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">User</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden md:table-cell">Phone</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Role</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden sm:table-cell">Joined</th>
                    <th className="text-right px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3 text-white/20">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                            <Users className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-semibold">No users match your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((profile) => (
                      <tr
                        key={profile.id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group/row last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff5100]/20 to-[#ff5100]/5 border border-[#ff5100]/10 flex items-center justify-center text-[#ff7d47] font-black text-sm flex-shrink-0">
                              {(profile.full_name?.[0] ?? profile.email?.[0] ?? "?").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white/90 text-[13px] group-hover/row:text-white transition-colors leading-tight">
                                {profile.full_name || "Unnamed User"}
                                {profile.id === currentUserId && (
                                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#ff5100]/15 text-[9px] text-[#ff7d47] font-black uppercase tracking-wider">you</span>
                                )}
                              </p>
                              <p className="text-white/35 text-[11px] font-mono mt-0.5">{profile.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/35 hidden md:table-cell">
                          <p className="text-[11px] font-mono">{profile.phone || "—"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              profile.role === "admin"
                                ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                                : "bg-white/5 text-white/40 border border-white/8"
                            }`}
                          >
                            {profile.role === "admin" ? <Shield className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
                            {profile.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/35 hidden sm:table-cell">
                          <p className="text-[11px] font-medium">{format(parseISO(profile.created_at), "MMM d, yyyy")}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {profile.id !== currentUserId && (
                              <>
                                <button
                                  onClick={() => handleRoleChange(profile.id, profile.role === "admin" ? "user" : "admin")}
                                  disabled={loadingId === profile.id}
                                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40 ${
                                    profile.role === "admin"
                                      ? "border-white/10 text-white/35 hover:border-white/25 hover:text-white/70"
                                      : "border-purple-500/25 text-purple-400/80 hover:bg-purple-500/10 hover:border-purple-500/40"
                                  }`}
                                >
                                  {loadingId === profile.id ? "…" : profile.role === "admin" ? "Demote" : "Promote"}
                                </button>
                                <button
                                  onClick={() => handleDelete(profile.id)}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 py-2">
              {filtered.length} {filtered.length === 1 ? "user" : "users"} shown
            </p>
          </Tabs.Content>

          {/* ── MESSAGES TAB ── */}
          <Tabs.Content value="messages" className="outline-none space-y-5">
            <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Sender</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Message</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 whitespace-nowrap">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3 text-white/20">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                            <MessageSquare className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-semibold">No messages yet</p>
                          <p className="text-xs text-white/15">Messages from your contact form will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    messages.map((msg) => (
                      <tr key={msg.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors last:border-0">
                        <td className="px-6 py-4 align-top w-44">
                          <p className="font-semibold text-white/90 text-[13px] leading-tight">{msg.name || "Guest"}</p>
                          <p className="text-white/35 text-[11px] font-mono mt-0.5">{msg.email}</p>
                        </td>
                        <td className="px-6 py-4 text-white/60 text-[13px] leading-relaxed whitespace-pre-wrap max-w-xl">
                          {msg.message}
                        </td>
                        <td className="px-6 py-4 text-white/30 text-[11px] font-medium whitespace-nowrap align-top">
                          {format(parseISO(msg.created_at), "MMM d · HH:mm")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 py-2">
              {messages.length} {messages.length === 1 ? "message" : "messages"} total
            </p>
          </Tabs.Content>

          {/* ── STORY SUBMISSIONS TAB ── */}
          <Tabs.Content value="stories" className="outline-none space-y-5">
            <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Submitter</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Story</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden lg:table-cell">Location</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden md:table-cell">Status</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 whitespace-nowrap hidden sm:table-cell">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {storySubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3 text-white/20">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                            <BookOpen className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-semibold">No story submissions yet</p>
                          <p className="text-xs text-white/15">Submissions from /stories/submit will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    storySubmissions.map((sub) => (
                      <tr key={sub.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors last:border-0 group/row">
                        <td className="px-6 py-4 align-top w-56">
                          <p className="font-semibold text-white/90 text-[13px] leading-tight group-hover/row:text-white transition-colors">{sub.author_name}</p>
                          {sub.author_role && <p className="text-white/35 text-[11px] mt-0.5">{sub.author_role}</p>}
                          {sub.author_bio && (
                            <p className="text-white/40 text-[11px] leading-relaxed mt-1.5 italic line-clamp-3">{sub.author_bio}</p>
                          )}
                          <div className="flex flex-col gap-1 mt-2">
                            {sub.email && (
                            <a href={`mailto:${sub.email}`} className="inline-flex items-center gap-1 text-[11px] text-[#ff7d47]/70 hover:text-[#ff7d47] transition-colors font-mono">
                              <Mail className="w-2.5 h-2.5 flex-shrink-0" />{sub.email}
                            </a>
                            )}
                            {sub.phone && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-white/35 font-mono">
                                <Phone className="w-2.5 h-2.5 flex-shrink-0" />{sub.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top max-w-xs">
                          <p className="font-semibold text-white/90 text-[13px] leading-tight mb-1">{sub.title}</p>
                          <p className="text-white/40 text-[11px] leading-relaxed line-clamp-2 mb-2">{sub.excerpt}</p>
                          {sub.tags && sub.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {sub.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="inline-flex items-center gap-0.5 bg-white/5 border border-white/8 text-white/35 text-[9px] font-semibold px-2 py-0.5 rounded-full">
                                  <Tag className="w-2 h-2" />{tag}
                                </span>
                              ))}
                              {sub.tags.length > 3 && (
                                <span className="text-white/25 text-[9px] font-semibold px-1 py-0.5">+{sub.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                          {sub.read_time && (
                            <span className="inline-flex items-center gap-1 text-white/25 text-[10px] mt-1.5">
                              <Clock className="w-2.5 h-2.5" />{sub.read_time}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-white/50 text-[12px]">
                            <MapPin className="w-3 h-3 text-white/25 flex-shrink-0" />
                            <span>{sub.state}</span>
                          </div>
                          <p className="text-white/30 text-[10px] mt-1 ml-4">{sub.region}</p>
                          {sub.date_of_adventure && (
                            <p className="text-white/25 text-[10px] mt-1 ml-4 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {format(new Date(sub.date_of_adventure), "MMM d, yyyy")}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top hidden md:table-cell">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            sub.status === "pending"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                              : sub.status === "approved"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                              : "bg-white/5 text-white/30 border border-white/8"
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/30 text-[11px] font-medium align-top whitespace-nowrap hidden sm:table-cell">
                          {format(parseISO(sub.created_at), "MMM d · HH:mm")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 py-2">
              {storySubmissions.length} {storySubmissions.length === 1 ? "submission" : "submissions"} total
            </p>
          </Tabs.Content>

          {/* ── OPERATORS TAB ── */}
          <Tabs.Content value="operators" className="outline-none space-y-8">

            {/* Setup banner when tables don't exist */}
            {!operatorTablesExist && (
              <div className="flex items-start gap-4 bg-amber-500/8 border border-amber-500/25 rounded-2xl p-5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-400" style={{ width: 18, height: 18 }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-300 mb-1">Database Tables Not Set Up</p>
                  <p className="text-[12px] text-white/50 leading-relaxed mb-3">
                    The operator tables don't exist in Supabase yet. Run <code className="text-[#ff7d47] font-mono bg-white/5 px-1.5 py-0.5 rounded">OPERATOR_SETUP.sql</code> in your Supabase Dashboard → SQL Editor to enable the operator system.
                  </p>
                  <div className="bg-black/30 rounded-xl p-3 text-xs text-white/40 font-mono leading-relaxed">
                    1. Open Supabase Dashboard → SQL Editor<br />
                    2. Click "New query"<br />
                    3. Paste and run <span className="text-amber-400">OPERATOR_SETUP.sql</span> from the project root<br />
                    4. Refresh this page
                  </div>
                </div>
              </div>
            )}

            {/* Operator Accounts */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-white/30" />
                <h2 className="text-base font-bold">Registered Operators</h2>
                <span className="bg-white/8 text-white/40 text-[9px] font-black px-2 py-0.5 rounded-full">
                  {localOperatorProfiles.length} total
                </span>
              </div>
              {localOperatorProfiles.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/30 text-sm font-semibold">No operator accounts yet</p>
                  <p className="text-white/20 text-xs mt-1">Operators register at /auth/operator-signup</p>
                </div>
              ) : (
                <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Company</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden md:table-cell">Contact</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden sm:table-cell">Website</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localOperatorProfiles.map((op) => (
                        <tr key={op.user_id} className="border-b border-white/[0.04] hover:bg-white/[0.03] last:border-0 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center text-cyan-400 font-black text-sm shrink-0">
                                {op.company_name[0]?.toUpperCase() ?? "?"}
                              </div>
                              <div>
                                <p className="font-semibold text-white/90 text-[13px] leading-tight">{op.company_name}</p>
                                <p className="text-white/35 text-[10px] font-mono mt-0.5">{op.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <p className="text-white/60 text-[12px]">{op.contact_name}</p>
                            <p className="text-white/30 text-[10px] font-mono mt-0.5">{op.phone}</p>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            {op.website ? (
                              <a href={op.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#ff7d47]/70 hover:text-[#ff7d47] text-[11px] transition-colors">
                                <Globe className="w-3 h-3" />
                                {op.website.replace(/^https?:\/\//, "")}
                              </a>
                            ) : (
                              <span className="text-white/25 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-white/30 text-[11px]">
                            {new Date(op.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Operator Price/Date Submissions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-white/30" />
                <h2 className="text-base font-bold">Price & Date Submissions</h2>
                {pendingOperatorSubmissions > 0 && (
                  <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                    {pendingOperatorSubmissions} pending
                  </span>
                )}
              </div>
              {localOperatorSubmissions.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/30 text-sm font-semibold">No submissions yet</p>
                  <p className="text-white/20 text-xs mt-1">Approved operators submit price/date updates from their dashboard</p>
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
                      {localOperatorSubmissions.map((sub) => (
                        <tr key={sub.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] last:border-0 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-white/90 text-[12px] leading-tight">
                              {sub.company_name ?? sub.operator_name}
                            </p>
                            <p className="text-white/30 text-[10px] font-mono mt-0.5">{sub.operator_id}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-white/80 text-[12px] font-semibold">{sub.adventure_slug}</p>
                            <p className="text-white/30 text-[10px] mt-0.5 font-medium">{sub.operator_name}</p>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <span className="text-[#ff7d47] font-bold text-[13px]">₹{sub.price_from}</span>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            {sub.exact_dates && sub.exact_dates.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {sub.exact_dates.slice(0, 2).map((d, i) => (
                                  <span key={i} className="bg-white/5 border border-white/8 text-white/50 text-[10px] px-2 py-0.5 rounded-lg font-mono">{d}</span>
                                ))}
                                {sub.exact_dates.length > 2 && (
                                  <span className="text-white/25 text-[10px] py-0.5">+{sub.exact_dates.length - 2}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-white/25 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {sub.status === "approved" ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                                <CheckCircle2 className="w-2.5 h-2.5" />Approved
                              </span>
                            ) : sub.status === "rejected" ? (
                              <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/25 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                                <XCircle className="w-2.5 h-2.5" />Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                                <Clock className="w-2.5 h-2.5" />Pending
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {sub.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleOperatorSubmissionAction(sub.id, "approve")}
                                    disabled={loadingId === sub.id}
                                    className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-emerald-500/25 text-emerald-400/80 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all disabled:opacity-40"
                                  >
                                    {loadingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                                  </button>
                                  <button
                                    onClick={() => handleOperatorSubmissionAction(sub.id, "reject")}
                                    disabled={loadingId === sub.id}
                                    className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:border-red-500/35 transition-all disabled:opacity-40"
                                  >
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
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.growthData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} minTickGap={40} />
                      <YAxis stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip {...tooltipStyle} />
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
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.growthData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} minTickGap={40} />
                      <YAxis stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip {...tooltipStyle} itemStyle={{ color: "#3b82f6" }} />
                      <Line type="stepAfter" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Role Distribution */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-1">Breakdown</p>
                  <h3 className="text-base font-bold">User Distribution</h3>
                </div>
                <div className="h-[260px] flex items-center gap-6">
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie data={analyticsData.roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                        {analyticsData.roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle.contentStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-5 flex-1">
                    {analyticsData.roleData.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="text-[10px] font-bold text-white/35 uppercase tracking-wider">{item.name}</p>
                          <p className="text-2xl font-black">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly Influx */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-1">By Month</p>
                  <h3 className="text-base font-bold">Monthly Influx</h3>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="month" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} {...tooltipStyle} />
                      <Bar dataKey="count" fill="#ff5100" radius={[5, 5, 0, 0]} barSize={20} />
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
