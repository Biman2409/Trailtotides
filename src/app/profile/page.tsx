import type { Metadata } from "next";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your Trail to Tides profile — view your ACE score, trip log, achievements, and adventure history.",
  alternates: { canonical: "https://trailtotides.com/profile" },
  robots: { index: false, follow: false },
};
import { redirect } from "next/navigation";
import { Calendar, Shield, Package } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import TripLogSection from "./TripLogSection";
import TrekStreakCounter from "./TrekStreakCounter";
import ACEProfileSection from "./ACEProfileSection";
import AvatarPicker from "./AvatarPicker";
import TrophyCabinet from "./TrophyCabinet";
import ExpeditionProfile from "./ExpeditionProfile";
import { getOperatorProfile, getSubmissionsForOperator } from "@/app/auth/operator-actions";
import { adventures } from "@/lib/data";
import DashboardClient from "@/app/auth/operator-dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch profile
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Create on the fly if missing
  if (!profile) {
    const adminClient = await createAdminClient();
    const { data: newProfile, error: createError } = await adminClient
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Adventurer",
        role: "user",
      })
      .select()
      .single();

    profile = createError
      ? { id: user.id, email: user.email, full_name: user.user_metadata?.full_name || "Adventurer", role: "user", created_at: new Date().toISOString(), phone: null }
      : newProfile;
  }

  const isOperator = profile.role === "operator";

  // Fetch operator data if applicable
  let operatorProfile = null;
  let operatorListings: { adventure: typeof adventures[0]; submission: Awaited<ReturnType<typeof getSubmissionsForOperator>>[0] }[] = [];

  if (isOperator) {
    operatorProfile = await getOperatorProfile(user.id);
    if (operatorProfile) {
      const submissions = await getSubmissionsForOperator(user.id);
      const latestBySlug = new Map<string, typeof submissions[number]>();
      submissions.forEach(sub => {
        const existing = latestBySlug.get(sub.adventure_slug);
        if (!existing || new Date(sub.created_at) > new Date(existing.created_at)) {
          latestBySlug.set(sub.adventure_slug, sub);
        }
      });
      operatorListings = [...latestBySlug.entries()].flatMap(([slug, sub]) => {
        const adv = adventures.find(a => a.slug === slug);
        return adv ? [{ adventure: adv, submission: sub }] : [];
      });
    }
  }

  const displayName = profile.full_name || user.user_metadata?.company_name || "Adventurer";
  const username = user.user_metadata?.username || profile.username;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <ScrollToTop />
      <Navbar />

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div
        className="relative pt-32 pb-16 px-5 lg:px-8 overflow-hidden"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: "radial-gradient(ellipse, #ff5100 0%, transparent 70%)" }} />

        <div className="max-w-4xl mx-auto relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <AvatarPicker />
              {/* Role badge */}
              <div
                className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                style={
                  profile.role === "admin"
                    ? { background: "rgba(139,92,246,0.2)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }
                    : profile.role === "operator"
                    ? { background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }
                    : { background: "rgba(255,81,0,0.12)", color: "#ff7d47", border: "1px solid rgba(255,81,0,0.2)" }
                }
              >
                {profile.role}
              </div>
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight truncate">
                {displayName}
              </h1>
              {username && (
                <p className="text-[#ff5100]/70 text-sm font-medium mt-0.5">@{username}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-white/35">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {profile.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "Recently"}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/35">
                  <Shield className="w-3.5 h-3.5" />
                  {profile.email}
                </span>
              </div>
            </div>

            {/* Admin chip */}
            {profile.role === "admin" && (
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                  style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}
                >
                  <Shield className="w-3.5 h-3.5" /> Admin
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <section className="py-14 px-5 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">

          {isOperator ? (
            /* ── Operator view ─────────────────────────────────── */
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-5 rounded-full" style={{ background: "#34d399" }} />
                <h2 className="text-white font-bold text-base uppercase tracking-widest" style={{ letterSpacing: "0.12em" }}>Operator Profile</h2>
              </div>
              <p className="text-white/40 text-sm ml-4 mb-6">
                Manage your listed adventures, pricing, and departure dates.
              </p>

              {operatorProfile ? (
                <DashboardClient
                  profile={operatorProfile}
                  listings={operatorListings}
                  allAdventures={adventures}
                />
              ) : (
                <div
                  className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
                  style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}
                >
                  <Package className="w-8 h-8 text-emerald-400/40" />
                  <p className="text-white/50 text-sm">No operator profile found.</p>
                  <a
                    href="/auth/operator-signup"
                    className="text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:brightness-110"
                    style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    Set up operator profile
                  </a>
                </div>
              )}
            </div>
          ) : (
            /* ── Explorer view ─────────────────────────────────── */
            <>
              {/* Expedition Profile */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-5 rounded-full" style={{ background: "#ff5100" }} />
                  <h2 className="text-white font-bold text-base uppercase tracking-widest" style={{ letterSpacing: "0.12em" }}>Expedition Profile</h2>
                </div>
                <ExpeditionProfile />
              </div>

              {/* ACE Profile */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-5 rounded-full bg-[#ff5100]" />
                  <h2 className="text-white font-bold text-base uppercase tracking-widest" style={{ letterSpacing: "0.12em" }}>Capability Profile</h2>
                </div>
                <ACEProfileSection />
              </div>

              {/* Trophy Cabinet */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-5 rounded-full" style={{ background: "#fbbf24" }} />
                  <h2 className="text-white font-bold text-base uppercase tracking-widest" style={{ letterSpacing: "0.12em" }}>Trophy Cabinet</h2>
                </div>
                <TrophyCabinet />
              </div>

              {/* My Adventures */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-5 rounded-full" style={{ background: "#ff5100" }} />
                  <h2 className="text-white font-bold text-base uppercase tracking-widest" style={{ letterSpacing: "0.12em" }}>My Adventures</h2>
                </div>
                <TrekStreakCounter />
                <div className="mt-4">
                  <TripLogSection />
                </div>
              </div>
            </>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}
