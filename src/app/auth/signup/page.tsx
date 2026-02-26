"use client";

import { useState } from "react";
import { signUp } from "@/app/auth/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mountain, ArrowLeft } from "lucide-react";
import countries from "@/lib/countries.json";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    
    if (result?.error) {
      setLoading(false);
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.success });
      // Clear form on success
      (e.target as HTMLFormElement).reset();
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">
      {/* Left panel — image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551632811-561732d1e306?w=2560&q=95')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight hover:scale-[1.02] transition-transform origin-left">
            <div className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff6b35]/20">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <span>Trail to Tides</span>
          </Link>
          
                <div className="max-w-md">
                  <h2 className="text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                    Wild is calling, <br />
                    <span className="text-[#ff6b35] font-black">answer it.</span>
                  </h2>
                  <p className="text-white/70 text-lg font-medium leading-relaxed max-w-sm">
                    Join our community of explorers and get access to exclusive trails, expert advice, and verified operators.
                  </p>
                </div>

          <div className="flex items-center gap-6 text-white/30 text-[11px] font-bold uppercase tracking-[0.15em]">
            <span>© 2026 Trail to Tides</span>
            <div className="w-1.5 h-px bg-white/20" />
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <div className="w-1.5 h-px bg-white/20" />
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-20 xl:px-32 bg-[#0a0a0a] relative overflow-y-auto lg:overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b35]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff6b35]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="max-w-md w-full mx-auto relative z-10">
            {/* Mobile logo */}
            <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 bg-[#ff6b35] rounded-lg flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Trail to Tides</span>
            </Link>
  
            <Link href="/" className="hidden lg:inline-flex items-center gap-1 text-white/40 hover:text-white/80 text-sm mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to home
            </Link>
  
                <div className="mb-6">
                  <h1 className="text-4xl font-black text-white mb-2 tracking-tight leading-tight">
                    Wild is calling,<br />
                    <span className="text-[#ff6b35]">answer it.</span>
                  </h1>
                  <p className="text-white/40 text-xs font-medium leading-relaxed">
                    Join our community of explorers and get access to exclusive trails, expert advice, and verified operators.
                  </p>
                </div>
  
  
            {message && (
              <div
                className={`mb-6 px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-3 ${
                  message.type === "error"
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : "bg-green-500/10 border border-green-500/20 text-green-400"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${message.type === "error" ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
                {message.text}
              </div>
            )}
  
              <form onSubmit={handleSubmit} className="space-y-3.5">

              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                <input
                  name="full_name"
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff6b35]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@email.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff6b35]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>


            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">Phone Number</label>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    name="country_code"
                    defaultValue="+91"
                    className="h-full bg-white/[0.03] border border-white/10 rounded-2xl pl-5 pr-10 py-3.5 text-white text-sm focus:outline-none focus:border-[#ff6b35]/50 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer min-w-[100px]"
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
                  placeholder="98765 43210"
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff6b35]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 pr-14 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff6b35]/50 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded-lg border-white/10 bg-white/5 text-[#ff6b35] focus:ring-[#ff6b35]/20 transition-all cursor-pointer"
                />
              </div>
              <label htmlFor="terms" className="text-[11px] text-white/40 leading-snug cursor-pointer font-medium">
                I agree to the{" "}
                <Link href="/terms" className="text-[#ff6b35]/70 hover:text-[#ff6b35] transition-colors underline underline-offset-2">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-[#ff6b35]/70 hover:text-[#ff6b35] transition-colors underline underline-offset-2">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff6b35] hover:bg-[#ff8e64] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#ff6b35]/20 text-sm mt-2"
            >
              {loading ? "Creating adventure..." : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-white/30 text-xs font-medium">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#ff6b35] hover:text-[#ff8e64] font-bold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
