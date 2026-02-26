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
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=100&w=2000')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <Mountain className="w-8 h-8 text-orange-500" />
            <span>Trail to Tides</span>
          </Link>
          
          <div className="max-w-md">
            <div className="inline-block px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-6">
              Start Your Journey
            </div>
            <h2 className="text-5xl font-black text-white leading-[1.1] mb-6">
              The first step to<br />
              <span className="text-orange-500">greatness.</span>
            </h2>
            <p className="text-white/80 text-xl font-medium leading-relaxed">
              Join our community of explorers and get access to exclusive trails and deals.
            </p>
          </div>

          <div className="flex items-center gap-6 text-white/50 text-sm font-medium">
            <span>© 2026 Trail to Tides</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-16 xl:px-24 bg-[#0a0a0a] overflow-y-auto lg:overflow-hidden">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden">
            <Mountain className="w-8 h-8 text-orange-500" />
            <span className="text-white font-bold text-xl tracking-tight">Trail to Tides</span>
          </Link>

          <Link href="/" className="hidden lg:inline-flex items-center gap-1 text-white/40 hover:text-white/80 text-sm mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          <div className="mb-6">
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Join adventure</h1>
            <p className="text-white/40 font-medium">Create an account to start exploring.</p>
          </div>

          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 ${
                message.type === "error"
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : "bg-green-500/10 border border-green-500/20 text-green-400"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${message.type === "error" ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                  name="full_name"
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@email.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    name="country_code"
                    defaultValue="+91"
                    className="h-full bg-white/[0.03] border border-white/10 rounded-2xl pl-4 pr-8 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer min-w-[90px]"
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="98765 43210"
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 pr-12 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all"
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

            <div className="flex items-start gap-3 py-1">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded-lg border-white/10 bg-white/5 text-orange-500 focus:ring-orange-500/20 transition-all cursor-pointer"
                />
              </div>
              <label htmlFor="terms" className="text-[11px] text-white/40 leading-snug cursor-pointer font-medium">
                I agree to the{" "}
                <Link href="/terms" className="text-orange-500/70 hover:text-orange-500 transition-colors underline underline-offset-2">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-orange-500/70 hover:text-orange-500 transition-colors underline underline-offset-2">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-3.5 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-orange-500/20 text-sm"
            >
              {loading ? "Creating adventure..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-white/30 text-xs font-medium">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 font-bold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
