import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import ProfileForm from "@/app/profile/ProfileForm";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const adminClient = await createAdminClient();
    const { data: newProfile } = await adminClient
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Adventurer",
        role: "user",
      })
      .select()
      .single();
    profile = newProfile ?? {
      id: user.id, email: user.email,
      full_name: user.user_metadata?.full_name || "Adventurer",
      role: "user", created_at: new Date().toISOString(), phone: null,
    };
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <ScrollToTop />
      <Navbar />

      {/* Hero banner — matches profile page */}
      <div
        className="relative pt-32 pb-12 px-5 lg:px-8 overflow-hidden"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[240px] rounded-full blur-3xl opacity-8 pointer-events-none" style={{ background: "radial-gradient(ellipse, #ff5100 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto relative">
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Account</p>
          <h1 className="text-white text-3xl font-black tracking-tight">Settings</h1>
          <p className="text-white/35 text-sm mt-2">Manage your profile picture, personal details and password.</p>
        </div>
      </div>

      <section className="py-12 px-5 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <ProfileForm profile={{
            ...profile,
            username: user.user_metadata?.username || profile.username || null,
            phone: profile.phone || user.user_metadata?.phone || null,
          }} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
