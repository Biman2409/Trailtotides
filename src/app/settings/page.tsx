import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import ProfileForm from "@/app/profile/ProfileForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings — Trail to Tides",
};

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

      <section className="pt-32 pb-20 px-5 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <p className="text-[#ff5100] text-xs font-bold tracking-[0.25em] uppercase mb-2">Account</p>
            <h1 className="text-white text-3xl font-black tracking-tight">Settings</h1>
            <p className="text-white/40 text-sm mt-2">Manage your personal details and password.</p>
          </div>

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
