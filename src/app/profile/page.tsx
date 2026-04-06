import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getOperatorProfile } from "@/app/auth/operator-actions";
import { Calendar, Shield, Camera, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ProfileForm from "./ProfileForm";
import TripLogSection from "./TripLogSection";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Operators have their own profile — the dashboard
  if (user.user_metadata?.role === "operator") {
    const opProfile = await getOperatorProfile(user.id);
    if (opProfile) redirect("/auth/operator-dashboard");
  }

  // Fetch profile
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If profile is missing (should be rare due to trigger), create it on the fly
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

    if (createError) {
      console.error("Error creating profile:", createError);
      // Fallback object to allow page to render
      profile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "Adventurer",
        role: "user",
        created_at: new Date().toISOString(),
        phone: null,
      };
    } else {
      profile = newProfile;
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar / Info */}
          <div className="md:w-1/3 space-y-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center text-[#ff7d47] text-4xl font-bold shadow-2xl shadow-[#ff5100]/5 relative overflow-hidden">
                {(profile.full_name?.[0] ?? profile.email?.[0] ?? "?").toUpperCase()}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">{profile.full_name || "Guest User"}</h1>
              {(user.user_metadata?.username || profile.username) && (
                <p className="text-[#ff5100]/70 text-sm font-medium mt-0.5">@{user.user_metadata?.username || profile.username}</p>
              )}
              <p className="text-white/40 text-sm mt-1">{profile.email}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-white/30">Account Role</span>
                  <span className="capitalize">{profile.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-white/60">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#ff7d47]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-white/30">Member Since</span>
                  <span>{profile.created_at ? format(new Date(profile.created_at), "MMMM d, yyyy") : "Recently Joined"}</span>
                </div>
              </div>
            </div>

            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="block w-full text-center py-3 rounded-xl bg-purple-600/10 border border-purple-600/20 text-purple-400 text-sm font-bold uppercase tracking-wider hover:bg-purple-600/20 transition-all active:scale-[0.98]"
              >
                Access Admin Panel
              </Link>
            )}

          </div>

          {/* Main Content / Form */}
          <div className="flex-1">
            <ProfileForm profile={{
              ...profile,
              username: user.user_metadata?.username || profile.username || null,
              phone: profile.phone || user.user_metadata?.phone || null,
            }} />
            <TripLogSection />
          </div>
        </div>
      </div>
    </div>
  );
}
