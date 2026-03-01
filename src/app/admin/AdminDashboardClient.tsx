"use client";

import { useState, useMemo } from "react";
import { updateUserRole, deleteUser } from "./actions";
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
  MessageSquare
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
  Pie
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

export default function AdminDashboardClient({
  profiles,
  currentUserId,
  messages = [],
}: {
  profiles: Profile[];
  currentUserId: string;
  messages?: Message[];
}) {
  const [activeTab, setActiveTab] = useState("users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all"); // all, 7d, 30d, 90d
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localProfiles, setLocalProfiles] = useState<Profile[]>(profiles);

  // Filtering logic
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

  // Analytics Data
  const analyticsData = useMemo(() => {
    // Growth Data (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, "MMM dd");
      const count = localProfiles.filter(p => 
        format(parseISO(p.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      ).length;
      return { date: dateStr, count };
    });

    // Cumulative Growth
    let total = 0;
    const growthData = last30Days.map(d => {
      total += d.count;
      return { ...d, total };
    });

    // Role Distribution
    const roleData = [
      { name: "Users", value: localProfiles.filter(p => p.role === "user").length, color: "#ff5100" },
      { name: "Admins", value: localProfiles.filter(p => p.role === "admin").length, color: "#a855f7" },
    ];

    // Activity by Month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthData = months.map((month, idx) => {
      const count = localProfiles.filter(p => parseISO(p.created_at).getMonth() === idx).length;
      return { month, count };
    });

    return { growthData, roleData, monthData };
  }, [localProfiles]);

  const totalUsers = localProfiles.filter((p) => p.role === "user").length;
  const totalAdmins = localProfiles.filter((p) => p.role === "admin").length;

  async function handleRoleChange(userId: string, newRole: string) {
    setLoadingId(userId);
    await updateUserRole(userId, newRole);
    setLocalProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
    );
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
    const dataToExport = filtered.map(p => ({
      ID: p.id,
      Name: p.full_name || "N/A",
      Email: p.email || "N/A",
      Phone: p.phone || "N/A",
      Role: p.role,
      Joined: format(parseISO(p.created_at), "yyyy-MM-dd HH:mm:ss")
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    
    // Generate buffer and download
    XLSX.writeFile(workbook, `TrailToTides_Users_${format(new Date(), "yyyyMMdd")}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#ff5100]/10 flex items-center justify-center group-hover:bg-[#ff5100]/20 transition-colors">
              <Mountain className="w-5 h-5 text-[#ff7d47]" />
            </div>
            <span className="font-semibold text-lg tracking-tight">TRAIL TO TIDES</span>
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-white/50 text-sm font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">View Site</Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-white/50 mt-1">Analytics and user management for your platform.</p>
          </div>
          
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="bg-white/5 p-1 rounded-xl flex gap-1 self-start md:self-auto">
          <Tabs.Trigger 
            value="users" 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-[#ff5100] text-white' : 'text-white/60 hover:text-white'}`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="messages" 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'messages' ? 'bg-[#ff5100] text-white' : 'text-white/60 hover:text-white'}`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
              {messages.length > 0 && (
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{messages.length}</span>
              )}
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="analytics" 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-[#ff5100] text-white' : 'text-white/60 hover:text-white'}`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </div>
          </Tabs.Trigger>
        </Tabs.Root>

        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ff5100]/5 rounded-full blur-2xl group-hover:bg-[#ff5100]/10 transition-all" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#ff5100]/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#ff7d47]" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <ArrowUpRight className="w-3 h-3" />
              <span>Active Community</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Admins</p>
                <p className="text-2xl font-bold">{totalAdmins}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-white/30 text-xs">
              <span>Platform Control</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Growth</p>
                <p className="text-2xl font-bold">+{analyticsData.growthData[29]?.count || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-blue-400 text-xs">
              <span>New Today</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Retention</p>
                <p className="text-2xl font-bold">100%</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <span>All time high</span>
            </div>
          </div>
        </div>

        <Tabs.Content value="users" className="space-y-6 outline-none">
          {/* Filters & Actions */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#ff7d47]/50 text-sm transition-all shadow-sm"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff7d47]/50 cursor-pointer shadow-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff7d47]/50 cursor-pointer shadow-sm"
                >
                  <option value="all">Joined (All Time)</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          {/* Table */}
          <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/2">
                    <th className="text-left px-6 py-4 text-white/40 font-semibold uppercase tracking-wider text-[10px]">User Details</th>
                    <th className="text-left px-6 py-4 text-white/40 font-semibold uppercase tracking-wider text-[10px] hidden md:table-cell">Contact</th>
                    <th className="text-left px-6 py-4 text-white/40 font-semibold uppercase tracking-wider text-[10px]">Role</th>
                    <th className="text-left px-6 py-4 text-white/40 font-semibold uppercase tracking-wider text-[10px] hidden sm:table-cell">Joined</th>
                    <th className="text-right px-6 py-4 text-white/40 font-semibold uppercase tracking-wider text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-20">
                        <div className="flex flex-col items-center gap-2 text-white/20">
                          <Users className="w-12 h-12" />
                          <p className="text-base font-medium">No users found match your criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filtered.map((profile) => (
                    <tr
                      key={profile.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-all group/row"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#ff5100]/10 flex items-center justify-center text-[#ff7d47] font-bold text-sm flex-shrink-0 group-hover/row:scale-110 transition-transform">
                            {(profile.full_name?.[0] ?? profile.email?.[0] ?? "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover/row:text-[#ff7d47] transition-colors">
                              {profile.full_name || "Guest User"}
                              {profile.id === currentUserId && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-[#ff5100]/10 text-[10px] text-[#ff7d47] font-bold uppercase tracking-wider">you</span>
                              )}
                            </p>
                            <p className="text-white/40 text-xs font-mono">{profile.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/50 hidden md:table-cell">
                        <p className="text-xs font-mono">{profile.phone || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            profile.role === "admin"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-white/10 text-white/60"
                          }`}
                        >
                          {profile.role === "admin" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <Users className="w-3 h-3" />
                          )}
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/40 hidden sm:table-cell text-xs font-medium">
                        {format(parseISO(profile.created_at), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {profile.id !== currentUserId && (
                            <>
                              <button
                                onClick={() =>
                                  handleRoleChange(
                                    profile.id,
                                    profile.role === "admin" ? "user" : "admin"
                                  )
                                }
                                disabled={loadingId === profile.id}
                                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
                                  profile.role === "admin"
                                    ? "border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                                    : "border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                }`}
                              >
                                {profile.role === "admin" ? "Demote" : "Promote"}
                              </button>
                              <button
                                onClick={() => handleDelete(profile.id)}
                                disabled={loadingId === profile.id}
                                className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </div>
          <p className="text-white/30 text-xs font-medium uppercase tracking-widest text-center py-4">
            Total results: {filtered.length} Users
          </p>
        </Tabs.Content>

        <Tabs.Content value="analytics" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">User Growth</h3>
                  <p className="text-white/40 text-xs">New user registrations over the last 30 days.</p>
                </div>
                <div className="bg-[#ff5100]/20 px-3 py-1 rounded-full">
                  <span className="text-[#ff7d47] text-[10px] font-bold uppercase tracking-wider">Live View</span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#ffffff33" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="#ffffff33" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                        itemStyle={{ color: "#ff5100" }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#ff5100" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: "#ff5100", strokeWidth: 0 }} 
                        activeDot={{ r: 6, fill: "#fff" }}
                      />

                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total Accumulation */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Total Community</h3>
                  <p className="text-white/40 text-xs">Cumulative user count growth over time.</p>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-400 opacity-50" />
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#ffffff33" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="#ffffff33" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                      itemStyle={{ color: "#3b82f6" }}
                    />
                    <Line 
                      type="stepAfter" 
                      dataKey="total" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">User Distribution</h3>
                  <p className="text-white/40 text-xs">Ratio between standard users and platform admins.</p>
                </div>
              </div>
              <div className="h-[300px] w-full flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-4 pr-10">
                  {analyticsData.roleData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{item.name}</p>
                        <p className="text-xl font-bold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Activity */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Monthly Influx</h3>
                  <p className="text-white/40 text-xs">New registrations grouped by calendar month.</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.monthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#ffffff33" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#ffffff33" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                    />
                      <Bar 
                        dataKey="count" 
                        fill="#ff5100" 
                        radius={[6, 6, 0, 0]} 
                        barSize={24}
                      />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Tabs.Content>
      </div>
    </div>
  );
}
