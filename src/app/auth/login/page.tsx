"use client";

import { useState, Suspense } from "react";
import { login } from "@/app/auth/actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mountain, ArrowLeft } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="max-w-md w-full mx-auto">
      {/* Mobile logo */}
      <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden">
        <Mountain className="w-8 h-8 text-[#f67345]" />
        <span className="text-white font-bold text-xl tracking-tight">Trail to Tides</span>
      </Link>

      <Link href="/" className="hidden lg:inline-flex items-center gap-1 text-white/40 hover:text-white/80 text-sm mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to home
      </Link>

        <div className="mb-6">
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight leading-tight">
            Wild is calling,<br />
            <span className="text-[#f67345]">answer it.</span>
          </h1>
          <p className="text-white/40 text-xs font-medium leading-relaxed">
            Join our community of explorers and get access to exclusive trails, expert advice, and verified operators.
          </p>
        </div>

      {message && !error && (
        <div className="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
          <input
            name="email"
            type="email"
            required
            placeholder="name@example.com"
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#f67345]/50 focus:bg-white/[0.06] transition-all"
          />
        </div>

        <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Password</label>
              <Link href="/auth/forgot-password" className="text-[10px] font-bold text-[#f67345]/60 hover:text-[#f67345] transition-colors uppercase tracking-widest">
                Forgot?
              </Link>
            </div>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white placeholder-white/20 focus:outline-none focus:border-[#f67345]/50 focus:bg-white/[0.06] transition-all"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f67345] hover:bg-[#f88c64] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#f67345]/20 mt-2"
          >

          {loading ? "Verifying..." : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-center text-white/30 text-sm font-medium">
        New to Trail to Tides?{" "}
        <Link href="/auth/signup" className="text-[#f67345] hover:text-[#f88c64] font-bold transition-colors">
          Create account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
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
            <div className="w-10 h-10 bg-[#f67345] rounded-xl flex items-center justify-center shadow-lg shadow-[#f67345]/20">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <span>Trail to Tides</span>
          </Link>
          
                <div className="max-w-md">
                  <h2 className="text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                    Wild is calling, <br />
                    <span className="text-[#f67345] font-black">answer it.</span>
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
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-32 bg-[#0a0a0a] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f67345]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f67345]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <Suspense fallback={<div className="text-white/50 text-center animate-pulse">Loading adventure...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
