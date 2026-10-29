"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/custom/Logo";
import { ResendButton } from "@/app/auth/ResendVerification";
import AuthContextNote, { intentFor } from "@/app/auth/AuthContextNote";

function LoginForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const errorParam = searchParams.get("error");
  const next = searchParams.get("next");
  const signupHref = next ? `/auth/signup?next=${encodeURIComponent(next)}` : "/auth/signup";
  // Arriving from a group invite: a first-timer has no account yet, so sign-up gets equal billing
  const invited = !!next?.startsWith("/matchmaker/group");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);
  // Set when the account exists but its email isn't verified yet
  const [unverified, setUnverified] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setUnverified(null);

    const fd = new FormData(e.currentTarget);
    const identifier = (fd.get("identifier") as string).trim();
    const password = fd.get("password") as string;

    try {
      // Server route resolves username → email and sets the session via a
      // proper Set-Cookie response header (httpOnly), instead of writing the
      // token to a client-readable cookie via document.cookie.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Invalid credentials");
        if (data.unverified && data.email) setUnverified(data.email);
        setPending(false);
        return;
      }

      // Hard reload so server and client both see the cookie. Return to ?next= if it's a
      // same-site path (e.g. Matchmaker results), otherwise the homepage.
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      window.location.replace(safeNext);
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="max-w-md w-full m-auto relative z-10">
      <div className="mb-6 lg:hidden">
        <Logo size="sm" />
      </div>

      <Link href="/" className="hidden lg:inline-flex items-center gap-1 text-white/40 hover:text-white/80 text-sm mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to home
      </Link>

      <div className="mb-6">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight leading-tight">
          Welcome <span className="text-[#ff5100]">back.</span>
        </h1>
        <p className="text-white/60 text-sm font-medium leading-relaxed">
          Log in to your saved trips, fitness profile and groups.
        </p>
      </div>

      {/* Why they're here (a group invite, a saved match…); otherwise the page's own message */}
      <AuthContextNote next={next} />
      {message && !error && !intentFor(next) && (
        <div role="status" className="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold text-white" style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.25)" }}>
          {message}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
          {unverified && (
            <span className="block mt-1.5 font-medium text-white/60">
              Didn&apos;t get it? <ResendButton email={unverified} next={searchParams.get("next")} />
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-identifier" className="block text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] mb-2 ml-1">
            Username or Email
          </label>
          <input
            id="login-identifier"
            name="identifier"
            type="text"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="rahul_explorer or rahul@email.com"
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 ml-1">
            <label htmlFor="login-password" className="block text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">Password</label>
            <Link href="/auth/forgot-password" className="text-[11px] font-bold text-[#ff5100]/80 hover:text-[#ff5100] transition-colors uppercase tracking-widest py-2 -my-2">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white placeholder-white/30 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-50 disabled:cursor-not-allowed text-[#fff] font-bold rounded-2xl py-4 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#ff5100]/20 mt-2"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      {/* Carry ?next through sign-up so a new account still lands where they were going */}
      {invited ? (
        <Link href={signupHref} className="mt-3 block w-full text-center font-bold rounded-2xl py-4 border border-white/15 text-white hover:border-[#ff5100]/50 transition-colors">
          First time here? Create a free account
        </Link>
      ) : (
        <p className="mt-8 text-center text-white/50 text-sm font-medium">
          New here?{" "}
          <Link href={signupHref} className="text-[#ff5100] hover:text-[#ff7d47] font-bold transition-colors">
            Create a free account
          </Link>
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-white/[0.06]">
        <p className="text-center text-white/20 text-xs font-medium">
          Adventure operator?{" "}
          <Link href="/auth/operator-signup" className="text-white/40 hover:text-[#ff7d47] transition-colors font-semibold">
            Create your operator account →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="h-screen bg-[var(--bg-page)] flex overflow-hidden">
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="lg" />
          <div className="max-w-md">
            <h2 className="text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Wild is calling,<br />
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

      <div className="flex-1 flex flex-col px-6 py-12 lg:px-20 xl:px-32 auth-themed bg-[var(--bg-page)] relative overflow-y-auto overflow-x-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
        <Suspense fallback={<div className="text-white/50 text-center">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
