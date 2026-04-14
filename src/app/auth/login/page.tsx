"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/custom/Logo";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0];
const COOKIE_NAME = `sb-${PROJECT_REF}-auth-token`;

const COOKIE_CHUNK_SIZE = 3180;

function encodeValue(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return "base64-" + btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function setSessionCookies(session: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: object;
}) {
  const value = encodeValue(JSON.stringify(session));
  const maxAge = 400 * 24 * 60 * 60;
  const opts = `; path=/; max-age=${maxAge}; samesite=lax`;

  // Clear any old chunks first (same key and up to 5 chunks)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
  for (let i = 0; i < 5; i++) {
    document.cookie = `${COOKIE_NAME}.${i}=; path=/; max-age=0; samesite=lax`;
  }

  // @supabase/ssr createChunks: if encodeURIComponent(value) fits in one chunk,
  // store as plain `key` (no .0 suffix). Otherwise split into key.0, key.1, ...
  const encoded = encodeURIComponent(value);
  if (encoded.length <= COOKIE_CHUNK_SIZE) {
    document.cookie = `${COOKIE_NAME}=${value}${opts}`;
  } else {
    // Split on encoded boundaries, store decoded chunks
    let remaining = encoded;
    let i = 0;
    while (remaining.length > 0) {
      let head = remaining.slice(0, COOKIE_CHUNK_SIZE);
      // Don't split in middle of a % escape
      const lastPct = head.lastIndexOf("%");
      if (lastPct > COOKIE_CHUNK_SIZE - 3) head = head.slice(0, lastPct);
      const chunk = decodeURIComponent(head);
      document.cookie = `${COOKIE_NAME}.${i}=${chunk}${opts}`;
      remaining = remaining.slice(head.length);
      i++;
    }
  }
}

function LoginForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const errorParam = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    let identifier = (fd.get("identifier") as string).trim();
    const password = fd.get("password") as string;

    try {
      // Resolve username → email if needed (our own API, no Set-Cookie issues)
      let email = identifier;
      if (!identifier.includes("@")) {
        const res = await fetch("/api/auth/resolve-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: identifier }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || "No account found with that username.");
          setPending(false);
          return;
        }
        email = data.email;
      }

      // Call Supabase auth DIRECTLY from browser — bypasses proxy entirely
      const tokenRes = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: ANON_KEY },
          body: JSON.stringify({ email, password }),
        }
      );
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || tokenData.error) {
        setError(tokenData.error_description || tokenData.error || "Invalid credentials");
        setPending(false);
        return;
      }

      // Write session cookie directly — same chunked format @supabase/ssr uses
      setSessionCookies({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        expires_at: tokenData.expires_at,
        token_type: tokenData.token_type,
        user: tokenData.user,
      });

      // Hard reload to homepage — server and client will now see the cookie
      window.location.replace("/");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="mb-6 lg:hidden">
        <Logo size="sm" />
      </div>

      <Link href="/" className="hidden lg:inline-flex items-center gap-1 text-white/40 hover:text-white/80 text-sm mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to home
      </Link>

      <div className="mb-6">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight leading-tight">
          Wild is calling,<br />
          <span className="text-[#ff5100]">answer it.</span>
        </h1>
        <p className="text-white/40 text-xs font-medium leading-relaxed">
          Track adventures, build your wishlist, and earn XP — all in one place.
        </p>
      </div>

      {message && !error && (
        <div className="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold bg-green-500/10 border border-green-500/20 text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">
            Username or Email
          </label>
          <input
            name="identifier"
            type="text"
            required
            placeholder="rahul_explorer or rahul@email.com"
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 ml-1">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Password</label>
            <Link href="/auth/forgot-password" className="text-[10px] font-bold text-[#ff5100]/60 hover:text-[#ff5100] transition-colors uppercase tracking-widest">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
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
          disabled={pending}
          className="w-full bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#ff5100]/20 mt-2"
        >
          {pending ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-center text-white/30 text-sm font-medium">
        New here?{" "}
        <Link href="/auth/signup" className="text-[#ff5100] hover:text-[#ff7d47] font-bold transition-colors">
          Create account
        </Link>
      </p>

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
    <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&q=100')" }}
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

      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-32 bg-[#0a0a0a] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff5100]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
        <Suspense fallback={<div className="text-white/50 text-center">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
