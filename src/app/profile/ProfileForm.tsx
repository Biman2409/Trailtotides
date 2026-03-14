"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  User, Mail, Phone, Save, Loader2, CheckCircle2, AtSign,
  Eye, EyeOff, Lock, XCircle, ArrowRight,
} from "lucide-react";
import { updateProfile, changePassword } from "./actions";
import ACEProfileSection from "./ACEProfileSection";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  username: string | null;
  role: string;
  created_at: string;
};


function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {subtitle && <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function AccountDetails({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(profile.full_name || "");
  const [username, setUsername] = useState(profile.username || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");

  const [usernameState, setUsernameState] = useState<"idle" | "checking" | "available" | "taken" | "invalid" | "unchanged">("unchanged");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty =
    fullName !== (profile.full_name || "") ||
    username !== (profile.username || "") ||
    email !== (profile.email || "") ||
    phone !== (profile.phone || "");

  const checkUsername = useCallback((val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val || val === profile.username) { setUsernameState("unchanged"); return; }
    if (val.length < 3 || val.length > 20) { setUsernameState("invalid"); return; }
    setUsernameState("checking");
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(val)}`);
      const data = await res.json();
      setUsernameState(data.available ? "available" : "taken");
    }, 500);
  }, [profile.username]);

  function handleCancel() {
    setFullName(profile.full_name || "");
    setUsername(profile.username || "");
    setEmail(profile.email || "");
    setPhone(profile.phone || "");
    setUsernameState("unchanged");
    setError(null);
    setEditing(false);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true); setSuccess(false); setError(null);
    try {
      await updateProfile(formData);
      setSuccess(true);
      setUsernameState("unchanged");
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  const canSave = isDirty && usernameState !== "taken" && usernameState !== "checking" && usernameState !== "invalid";

  const fieldClass = (editable: boolean) =>
    `w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm transition-all ${
      editable
        ? "text-white placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 cursor-text"
        : "text-white/50 cursor-default select-none pointer-events-none"
    }`;

  return (
    <Section title="Account Details" subtitle="Your personal information.">
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff7d47] transition-colors" />
            <input name="fullName" type="text" value={fullName} onChange={e => editing && setFullName(e.target.value)}
              readOnly={!editing} placeholder="Your full name" required className={fieldClass(editing)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Username</label>
          <div className="relative group">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff7d47] transition-colors" />
            <input name="username" type="text" value={username} readOnly={!editing}
              onChange={(e) => { if (!editing) return; const v = e.target.value.toLowerCase(); setUsername(v); checkUsername(v); }}
              placeholder="your_username"
              className={`w-full bg-white/5 border rounded-2xl pl-11 pr-10 py-3 text-sm transition-all ${
                !editing ? "text-white/50 cursor-default select-none pointer-events-none border-white/10" :
                usernameState === "available" ? "text-white border-emerald-500/50 focus:outline-none" :
                usernameState === "taken" || usernameState === "invalid" ? "text-white border-red-500/40 focus:outline-none" :
                "text-white border-white/10 focus:outline-none focus:border-[#ff5100]/50"
              }`} />
            {editing && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {usernameState === "checking"  && <Loader2      className="w-4 h-4 text-white/30 animate-spin" />}
                {usernameState === "available" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {(usernameState === "taken" || usernameState === "invalid") && <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            )}
          </div>
          {editing && usernameState !== "idle" && usernameState !== "unchanged" && (
            <p className={`text-[10px] ml-1 ${
              usernameState === "available" ? "text-emerald-500" :
              usernameState === "taken" ? "text-red-400" : "text-amber-400"
            }`}>
              {usernameState === "checking"  && "Checking availability…"}
              {usernameState === "available" && `@${username} is available`}
              {usernameState === "taken"     && `@${username} is already taken`}
              {usernameState === "invalid"   && "3–20 characters required"}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff7d47] transition-colors" />
            <input name="email" type="email" value={email} readOnly={!editing}
              onChange={e => editing && setEmail(e.target.value)} placeholder="your@email.com"
              className={fieldClass(editing)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Phone Number</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff7d47] transition-colors" />
            <input name="phone" type="tel" value={phone} readOnly={!editing}
              onChange={e => editing && setPhone(e.target.value)} placeholder="+91 9876543210"
              className={fieldClass(editing)} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 gap-3">
          <div>
            {error   && <p className="text-red-400 text-xs font-medium">{error}</p>}
            {success && <p className="text-emerald-400 text-xs font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Saved successfully</p>}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {!editing ? (
              <button type="button" onClick={() => setEditing(true)}
                className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-white/70 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95">
                Update Details
              </button>
            ) : (
              <>
                <button type="button" onClick={handleCancel} disabled={loading}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 transition-colors">
                  Cancel
                </button>
                {canSave && (
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </form>
    </Section>
  );
}

function ChangePasswordSection() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true); setSuccess(false); setError(null);
    try {
      await changePassword(formData);
      setSuccess(true);
      formRef.current?.reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  return (
    <Section title="Change Password" subtitle="Verify your current password before setting a new one.">
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Current Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff7d47] transition-colors" />
            <input name="currentPassword" type={showCurrent ? "text" : "password"} placeholder="Your current password" required
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-11 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 transition-all" />
            <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">New Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff7d47] transition-colors" />
            <input name="newPassword" type={showNew ? "text" : "password"} placeholder="Min. 6 characters" minLength={6} required
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-11 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 transition-all" />
            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Confirm New Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff7d47] transition-colors" />
            <input name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Repeat new password" required
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-11 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 transition-all" />
            <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 gap-4">
          <div>
            {error   && <p className="text-red-400 text-xs font-medium">{error}</p>}
            {success && <p className="text-emerald-400 text-xs font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Password updated</p>}
          </div>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Updating…</> : <><Lock className="w-4 h-4" />Update Password</>}
          </button>
        </div>
      </form>
    </Section>
  );
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-6">
      <AccountDetails profile={profile} />
      <ChangePasswordSection />
      <ACEProfileSection />
    </div>
  );
}
