"use client";

import { useState } from "react";
import { updateProfile } from "./actions";
import { User, Mail, Phone, Save, Loader2, CheckCircle2 } from "lucide-react";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">
          Full Name
        </label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange-400 transition-colors" />
          <input
            name="fullName"
            type="text"
            defaultValue={profile.full_name || ""}
            placeholder="e.g. John Doe"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
          <input
            type="email"
            defaultValue={profile.email || ""}
            disabled
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white/40 cursor-not-allowed"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 uppercase tracking-wider bg-white/5 px-2 py-1 rounded">
            Primary
          </span>
        </div>
        <p className="text-[10px] text-white/30 pl-1 mt-1">Contact support to change your primary email.</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">
          Phone Number
        </label>
        <div className="relative group">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange-400 transition-colors" />
          <input
            name="phone"
            type="tel"
            defaultValue={profile.phone || ""}
            placeholder="e.g. +91 9876543210"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all"
          />
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between gap-4">
        {error && (
          <p className="text-red-400 text-sm font-medium">{error}</p>
        )}
        {success && (
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium animate-in fade-in slide-in-from-left-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile updated successfully</span>
          </div>
        )}
        <div className="flex-1" />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-2xl text-sm font-bold tracking-tight shadow-xl shadow-orange-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
