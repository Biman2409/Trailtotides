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
      <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
        <Mountain className="w-6 h-6 text-orange-400" />
        <span className="text-white font-semibold text-lg">Trail to Tides</span>
      </Link>

      <Link href="/" className="hidden lg:inline-flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">Log in</h1>
      <p className="text-white/50 mb-8">Continue your adventure journey.</p>

      {message && !error && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium bg-green-500/10 border border-green-500/30 text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="rahul@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-400/60 focus:bg-white/8 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Your password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-orange-400/60 focus:bg-white/8 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 transition-colors"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-white/50 text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
          Sign up
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
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=100&w=2000')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <Mountain className="w-8 h-8 text-orange-500" />
            <span>Trail to Tides</span>
          </Link>
          
          <div className="max-w-md">
            <div className="inline-block px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-6">
              Adventure Awaits
            </div>
            <h2 className="text-5xl font-black text-white leading-[1.1] mb-6">
              The wild is calling,<br />
              <span className="text-orange-500">answer it.</span>
            </h2>
            <p className="text-white/80 text-xl font-medium leading-relaxed">
              Log in to access your custom itineraries and discover India&apos;s hidden gems.
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
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-[#0a0a0a]">
        <Suspense fallback={<div className="text-white/50 text-center animate-pulse">Loading adventure...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
