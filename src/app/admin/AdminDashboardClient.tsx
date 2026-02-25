"use client";

import { useState } from "react";
import { updateUserRole, deleteUser } from "./actions";
import { logout } from "@/app/auth/actions";
import { Mountain, Users, Shield, Trash2, ChevronDown, LogOut, Search } from "lucide-react";
import Link from "next/link";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

export default function AdminDashboardClient({
  profiles,
  currentUserId,
}: {
  profiles: Profile[];
  currentUserId: string;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localProfiles, setLocalProfiles] = useState<Profile[]>(profiles);

  const filtered = localProfiles.filter((p) => {
    const matchesSearch =
      (p.full_name?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (p.email?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="w-6 h-6 text-orange-400" />
            <span className="font-semibold text-lg">Trail to Tides</span>
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-white/50 text-sm font-medium">Admin Dashboard</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </form>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">User Management</h1>
        <p className="text-white/50 mb-8">View and manage all registered users.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-white/50 text-sm">Total Users</span>
            </div>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-white/50 text-sm">Admins</span>
            </div>
            <p className="text-3xl font-bold">{totalAdmins}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-white/50 text-sm">Total Accounts</span>
            </div>
            <p className="text-3xl font-bold">{localProfiles.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-400/50 text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-white text-sm focus:outline-none focus:border-orange-400/50 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-4 text-white/40 font-medium">User</th>
                  <th className="text-left px-5 py-4 text-white/40 font-medium hidden md:table-cell">Phone</th>
                  <th className="text-left px-5 py-4 text-white/40 font-medium">Role</th>
                  <th className="text-left px-5 py-4 text-white/40 font-medium hidden sm:table-cell">Joined</th>
                  <th className="text-right px-5 py-4 text-white/40 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-white/30">
                      No users found.
                    </td>
                  </tr>
                )}
                {filtered.map((profile) => (
                  <tr
                    key={profile.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-semibold text-xs flex-shrink-0">
                          {(profile.full_name?.[0] ?? profile.email?.[0] ?? "?").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {profile.full_name || "—"}
                            {profile.id === currentUserId && (
                              <span className="ml-2 text-xs text-orange-400/70">(you)</span>
                            )}
                          </p>
                          <p className="text-white/40 text-xs">{profile.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/50 hidden md:table-cell">
                      {profile.phone || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          profile.role === "admin"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {profile.role === "admin" ? (
                          <Shield className="w-3 h-3 mr-1" />
                        ) : (
                          <Users className="w-3 h-3 mr-1" />
                        )}
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/40 hidden sm:table-cell text-xs">
                      {new Date(profile.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
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
                              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                                profile.role === "admin"
                                  ? "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                                  : "border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                              }`}
                            >
                              {profile.role === "admin" ? "Remove Admin" : "Make Admin"}
                            </button>
                            <button
                              onClick={() => handleDelete(profile.id)}
                              disabled={loadingId === profile.id}
                              className="p-1.5 text-white/30 hover:text-red-400 transition-colors disabled:opacity-50"
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

        <p className="mt-4 text-white/30 text-xs">
          Showing {filtered.length} of {localProfiles.length} users
        </p>
      </div>
    </div>
  );
}
