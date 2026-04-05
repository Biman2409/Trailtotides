"use client";

import { useState } from "react";
import { signUpOperator } from "@/app/auth/operator-actions";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Building2, Globe, Phone as PhoneIcon, Mail, Lock, User } from "lucide-react";
import Logo from "@/components/ui/custom/Logo";

export default function OperatorSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await signUpOperator(formData);
    setLoading(false);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.success });
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex overflow-hidden">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&q=100')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="lg" />
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 bg-[#ff5100]/10 border border-[#ff5100]/20 rounded-full px-4 py-1.5 mb-6">
              <Building2 className="w-3.5 h-3.5 text-[#ff7d47]" />
              <span className="text-[11px] font-bold text-[#ff7d47] uppercase tracking-widest">Operator Portal</span>
            </div>
            <h2 className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Grow your<br />
              <span className="text-[#ff5100]">adventure business.</span>
            </h2>
            <p className="text-white/60 text-base font-medium leading-relaxed max-w-sm">
              List your treks, update prices, manage dates, and connect with thousands of adventure seekers across India.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { value: "50K+", label: "Monthly visitors" },
                { value: "200+", label: "Adventures listed" },
                { value: "98%", label: "Operator retention" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/5 rounded-2xl p-4 border border-white/8">
                  <p className="text-2xl font-black text-[#ff5100]">{value}</p>
                  <p className="text-[10px] text-white/40 font-semibold mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>
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
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 ml-1">Phone</label>
              <div className="relative">
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-3 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#ff5100]/20 text-sm mt-1"
            >
              {loading ? "Submitting application…" : "Register as Operator"}
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
