import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, Mail, Phone, Calendar, Shield, MapPin, Camera, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // This shouldn't happen if the signup flow works correctly
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30">
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
              <div className="w-32 h-32 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-4xl font-bold shadow-2xl shadow-orange-500/5 relative overflow-hidden">
                {(profile.full_name?.[0] ?? profile.email?.[0] ?? "?").toUpperCase()}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-[#0a0a0a]" title="Online" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">{profile.full_name || "Guest User"}</h1>
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
                  <Calendar className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-white/30">Member Since</span>
                  <span>{format(new Date(profile.created_at), "MMMM d, yyyy")}</span>
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
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
              <div className="mb-8">
                <h2 className="text-xl font-bold">Account Settings</h2>
                <p className="text-white/40 text-sm mt-1">Manage your public profile and account details.</p>
              </div>

              <ProfileForm profile={profile} />
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10">
              <p className="text-sm text-orange-400/80 leading-relaxed italic">
                "Ready for your next adventure? Your journey with Trail to Tides is just beginning."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
