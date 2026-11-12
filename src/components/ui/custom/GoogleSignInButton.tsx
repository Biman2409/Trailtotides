"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// On: Google is set up in Supabase (Authentication → Providers → Google) with the OAuth client
// "Trail to Tides website (Supabase)" in Google Cloud project TTTCompassAI. Set
// NEXT_PUBLIC_GOOGLE_AUTH=off in Vercel to hide the button without a code change.
export const GOOGLE_AUTH_ON = process.env.NEXT_PUBLIC_GOOGLE_AUTH !== "off";

/** "Continue with Google", returning to `next` through /auth/callback (which exchanges the code) */
export default function GoogleSignInButton({ next = "/", label = "Continue with Google" }: { next?: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!GOOGLE_AUTH_ON) return null;

  async function go() {
    setBusy(true);
    setError("");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: err } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (err) { setError("Google sign-in isn't available right now. Use your email instead."); setBusy(false); }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="w-full h-11 flex items-center justify-center gap-2.5 rounded-2xl bg-white text-[#1f1f1f] text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.94 10.94 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
        </svg>
        {busy ? "Opening Google…" : label}
      </button>
      {error && <p className="text-[12px] text-red-400 text-center">{error}</p>}
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
        <span className="flex-1 h-px bg-white/10" />or with email<span className="flex-1 h-px bg-white/10" />
      </div>
    </div>
  );
}
