"use client";

import { useState } from "react";
import { updatePassword } from "@/app/auth/actions";
import Link from "next/link";
import { Eye, EyeOff, Mountain, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);
    
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.success });
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
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
            <div className="w-10 h-10 bg-[#ff5100] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff5100]/20">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <span>TRAIL TO TIDES</span>
          </Link>
          
                <div className="max-w-md">
                  <h2 className="text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                    Wild is calling, <br />
                    <span className="text-[#ff5100] font-black">answer it.</span>
                  </h2>
                  <p className="text-white/70 text-lg font-medium leading-relaxed max-w-sm">
                    Join our community of explorers and get access to exclusive trails, expert advice, and verified operators.
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
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-32 bg-[#0a0a0a] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-md w-full mx-auto relative z-10">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#ff5100] rounded-lg flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">TRAIL TO TIDES</span>
          </Link>

          <Link href="/auth/login" className="inline-flex items-center gap-1 text-white/40 hover:text-white/80 text-sm mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">New password</h1>
            <p className="text-white/40 font-medium">Please enter a new password for your account.</p>
          </div>

          {message && (
            <div
              className={`mb-8 px-5 py-4 rounded-2xl text-sm font-semibold flex items-center gap-3 ${
                message.type === "error"
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : "bg-green-500/10 border border-green-500/20 text-green-400"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${message.type === "error" ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">New Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
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
              className="w-full bg-[#ff5100] hover:bg-[#d84315] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#ff5100]/20 mt-2"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <p className="mt-8 text-center text-white/30 text-sm font-medium">
            Remembered your password?{" "}
            <Link href="/auth/login" className="text-[#ff5100] hover:text-[#ff7d47] font-bold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
