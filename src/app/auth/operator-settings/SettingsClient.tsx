"use client";

import { useState, useRef } from "react";
import { User, Mail, Phone, Globe, Building2, Save, Loader2, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { updateOperatorProfile } from "@/app/auth/operator-actions";
import { changePassword } from "@/app/profile/actions";
import type { OperatorProfile } from "@/app/auth/operator-actions";

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

const fieldBase =
  "w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm transition-all focus:outline-none focus:border-[#ff5100]/50 placeholder-white/20";

function CompanyDetails({ profile }: { profile: OperatorProfile }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contactName, setContactName] = useState(profile.contact_name);
  const [companyName, setCompanyName] = useState(profile.company_name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [website, setWebsite] = useState(profile.website ?? "");

  const isDirty =
    contactName !== profile.contact_name ||
    companyName !== profile.company_name ||
    email !== profile.email ||
    phone !== profile.phone ||
    (website || null) !== profile.website;

  function handleCancel() {
    setContactName(profile.contact_name);
    setCompanyName(profile.company_name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setWebsite(profile.website ?? "");
    setError(null);
    setEditing(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setSuccess(false); setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await updateOperatorProfile(fd);
      if (res?.error) { setError(res.error); return; }
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  const ro = !editing;
  const cls = ro
    ? `${fieldBase} text-white/50 cursor-default select-none pointer-events-none`
    : `${fieldBase} text-white cursor-text`;

  return (
    <Section title="Company Details" subtitle="Your operator profile information visible on the platform.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Contact Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input name="contact_name" value={contactName} readOnly={ro}
              onChange={e => setContactName(e.target.value)} placeholder="Your name" required className={cls} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Company Name</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input name="company_name" value={companyName} readOnly={ro}
              onChange={e => setCompanyName(e.target.value)} placeholder="Your company" required className={cls} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input name="email" type="email" value={email} readOnly={ro}
              onChange={e => setEmail(e.target.value)} placeholder="contact@company.com" required className={cls} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input name="phone" type="tel" value={phone} readOnly={ro}
              onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" required className={cls} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Website</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input name="website" type="url" value={website} readOnly={ro}
              onChange={e => setWebsite(e.target.value)} placeholder="https://yourcompany.com" className={cls} />
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
                {isDirty && (
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

  const pwField = "w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-11 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 transition-all";

  return (
    <Section title="Change Password" subtitle="Verify your current password before setting a new one.">
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        {[
          { name: "currentPassword", label: "Current Password", show: showCurrent, toggle: () => setShowCurrent(v => !v), placeholder: "Your current password" },
          { name: "newPassword",     label: "New Password",     show: showNew,     toggle: () => setShowNew(v => !v),     placeholder: "Min. 6 characters" },
          { name: "confirmPassword", label: "Confirm New Password", show: showConfirm, toggle: () => setShowConfirm(v => !v), placeholder: "Repeat new password" },
        ].map(({ name, label, show, toggle, placeholder }) => (
          <div key={name} className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">{label}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input name={name} type={show ? "text" : "password"} placeholder={placeholder} required
                minLength={name === "newPassword" ? 6 : undefined} className={pwField} />
              <button type="button" onClick={toggle}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}

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

export default function SettingsClient({ profile }: { profile: OperatorProfile }) {
  return (
    <div className="space-y-6">
      <CompanyDetails profile={profile} />
      <ChangePasswordSection />
    </div>
  );
}
