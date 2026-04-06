import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Shield } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { createClient } from "@/lib/supabase/server";
import { getOperatorProfile } from "@/app/auth/operator-actions";
import { format } from "date-fns";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings — Trail to Tides",
};

export const dynamic = "force-dynamic";

export default async function OperatorSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?role=operator");

  const profile = await getOperatorProfile(user.id);
  if (!profile) redirect("/auth/operator-signup");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <ScrollToTop />
      <Navbar />

      <section className="pt-28 lg:pt-36 pb-24 px-5 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/auth/operator-dashboard"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Profile</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-12">
            {/* Sidebar */}
            <div className="md:w-1/3 space-y-8">
              <div>
                <div className="w-20 h-20 rounded-3xl bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center text-[#ff7d47] text-3xl font-bold shadow-2xl shadow-[#ff5100]/5">
                  {profile.company_name[0].toUpperCase()}
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{profile.company_name}</h1>
                <p className="text-white/40 text-sm mt-1">{profile.email}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#ff5100]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white/30">Account Type</span>
                    <span>Operator</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-white/60">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#ff7d47]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white/30">Member Since</span>
                    <span>{format(new Date(profile.created_at), "MMMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1">
              <div className="mb-6">
                <p className="text-[#ff5100] text-xs font-bold tracking-[0.25em] uppercase mb-2">Settings</p>
                <h2 className="text-white text-2xl font-bold tracking-tight">Account Settings</h2>
                <p className="text-white/40 text-sm mt-1">Update your company details and manage your password.</p>
              </div>
              <SettingsClient profile={profile} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
