"use client";

import { useState, useRef } from "react";
import { signUpOperator } from "@/app/auth/operator-actions";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Building2, Globe, Mail, Lock, User, Upload, X, ImageIcon } from "lucide-react";
import countries from "@/lib/countries.json";
import Logo from "@/components/ui/custom/Logo";
import TermsModal from "@/components/ui/custom/TermsModal";

export default function OperatorSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setLogoError("File too large (max 4 MB)");
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setLogoError("Only JPG, PNG, WebP or SVG allowed");
      return;
    }
    setLogoError(null);
    setLogoFile(file);
    setLogoUrl(null);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl(null);
    setLogoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    // Upload logo before the account exists; server assigns the storage path
    if (logoFile) {
      setLogoUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", logoFile);
        const res = await fetch("/api/operator-logo", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) {
          formData.set("logo_url", data.url);
        } else {
          setLogoError(data.error ?? "Logo upload failed");
        }
      } catch {
        setLogoError("Logo upload failed");
      } finally {
        setLogoUploading(false);
      }
    }

    const result = await signUpOperator(formData);
    setLoading(false);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }

    setMessage({ type: "success", text: result?.success ?? "Account created! You can now log in." });
    (e.target as HTMLFormElement).reset();
    setTermsAccepted(false);
    removeLogo();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex overflow-hidden">
      {showTermsModal && (
        <TermsModal
          onAccept={() => setTermsAccepted(true)}
          onClose={() => setShowTermsModal(false)}
        />
      )}
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&q=100')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="lg" />
          <div className="max-w-md">
            <h2 className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Grow your<br />
              <span className="text-[#ff5100]">adventure business.</span>
            </h2>
            <p className="text-white/60 text-base font-medium leading-relaxed max-w-sm">
              List your treks, update prices, manage dates, and connect with thousands of adventure seekers across India.
            </p>
          </div>
          <div className="flex items-center gap-6 text-white/30 text-[11px] font-bold uppercase tracking-[0.15em]">
            <span>© 2026 TRAIL TO TIDES</span>
            <div className="w-1.5 h-px bg-white/20" />
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <div className="w-1.5 h-px bg-white/20" />
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-16 xl:px-24 bg-[#0a0a0a] relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-md w-full mx-auto relative z-10">
          <div className="mb-5 lg:hidden">
            <Logo size="sm" />
          </div>

          <Link href="/" className="hidden lg:inline-flex items-center gap-1 text-white/40 hover:text-white/80 text-sm mb-5 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight leading-tight">
              Register your <span className="text-[#ff5100]">Company</span>
            </h1>
            <p className="text-white/40 text-xs font-medium">
              Create your operator account and start listing adventures instantly.
            </p>
          </div>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
              message.type === "error"
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : "bg-green-500/10 border border-green-500/20 text-green-400"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Contact Person */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Contact Person</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  name="contact_name"
                  type="text"
                  required
                  placeholder="Rajesh Kumar"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Company / Agency Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  name="company_name"
                  type="text"
                  required
                  placeholder="Summit Adventures Pvt. Ltd."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Business Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="info@summitadventures.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Phone Number</label>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    name="country_code"
                    defaultValue="+91"
                    className="h-full bg-white/[0.03] border border-white/10 rounded-2xl pl-5 pr-10 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer min-w-[100px]"
                  >
                    {[
                      ...countries.filter(c => c.code === "IN"),
                      ...countries.filter(c => c.code !== "IN").sort((a, b) => a.name.localeCompare(b.name))
                    ].map((country) => (
                      <option key={`${country.code}-${country.dial_code}`} value={country.dial_code} className="bg-[#0a0a0a] text-white">
                        {country.flag} {country.dial_code}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="9876543210"
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            {/* Website (optional) */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Website <span className="normal-case tracking-normal text-white/20">(optional)</span></label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  name="website"
                  type="url"
                  placeholder="https://summitadventures.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-14 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ── Company Logo ──────────────────────────────────── */}
            <div className="rounded-2xl border p-3.5" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                  Company Logo <span className="normal-case tracking-normal font-normal text-white/20">(optional)</span>
                </label>
                {logoPreview && (
                  <button type="button" onClick={removeLogo} className="text-[9px] font-semibold text-white/25 hover:text-red-400 transition-colors flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>

              {logoPreview ? (
                /* Preview */
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-semibold leading-snug truncate">{logoFile?.name}</p>
                    <p className="text-white/25 text-[10px] mt-0.5">
                      {logoFile ? `${(logoFile.size / 1024).toFixed(0)} KB` : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-[10px] text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
                    >
                      Change image
                    </button>
                  </div>
                </div>
              ) : (
                /* Drop zone */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl border border-dashed transition-all hover:border-white/20 hover:bg-white/[0.03]"
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,81,0,0.1)" }}>
                    <ImageIcon className="w-4 h-4 text-[#ff5100]/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/50 text-xs font-medium flex items-center gap-1.5 justify-center">
                      <Upload className="w-3 h-3" /> Upload logo
                    </p>
                    <p className="text-white/20 text-[10px] mt-0.5">PNG, JPG, WebP or SVG · max 4 MB</p>
                  </div>
                </button>
              )}

              {logoError && (
                <p className="mt-2 text-[10px] text-red-400 font-medium">{logoError}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>

            <div className="flex items-start gap-3 py-0.5">
              <div className="flex items-center h-5 mt-0.5 shrink-0">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={() => {
                    if (!termsAccepted) setShowTermsModal(true);
                    else setTermsAccepted(false);
                  }}
                  className="w-4 h-4 rounded-lg border-white/10 bg-white/5 text-[#ff5100] focus:ring-[#ff5100]/20 transition-all cursor-pointer accent-[#ff5100]"
                />
              </div>
              <label className="text-[11px] text-white/40 leading-snug font-medium">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#ff5100]/70 hover:text-[#ff5100] transition-colors underline underline-offset-2"
                >
                  Terms
                </button>
                {" "}and{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#ff5100]/70 hover:text-[#ff5100] transition-colors underline underline-offset-2"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || logoUploading || !termsAccepted}
              className="w-full bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-3 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#ff5100]/20 text-sm mt-1"
            >
              {loading || logoUploading ? "Setting up account…" : "Register as Operator"}
            </button>
          </form>

          <p className="mt-5 text-center text-white/30 text-xs font-medium">
            Already have an operator account?{" "}
            <Link href="/auth/login?role=operator" className="text-[#ff5100] hover:text-[#ff7d47] font-bold transition-colors">
              Log in
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <p className="text-center text-white/20 text-xs font-medium">
              Are you an explorer?{" "}
              <Link href="/auth/signup" className="text-white/40 hover:text-[#ff7d47] transition-colors font-semibold">
                Create an explorer account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
