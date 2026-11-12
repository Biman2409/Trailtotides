"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Google is set up in Supabase (Authentication → Providers → Google) with the OAuth client
// "Trail to Tides website (Supabase)" in Google Cloud project TTTCompassAI. Set
// NEXT_PUBLIC_GOOGLE_AUTH=off in Vercel to hide the button without a code change.
export const GOOGLE_AUTH_ON = process.env.NEXT_PUBLIC_GOOGLE_AUTH !== "off";

// Public by design: it identifies the site to Google and appears in every sign-in request
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "813387616110-ouijlgplqp59hu6ielvhb1n9ntpt7ujb.apps.googleusercontent.com";
const GSI_SRC = "https://accounts.google.com/gsi/client";

type CredentialResponse = { credential?: string };
type GoogleId = {
  initialize: (o: Record<string, unknown>) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
  prompt: () => void;
};
declare global {
  interface Window { google?: { accounts?: { id?: GoogleId } } }
}

/** Loads Google's sign-in script once per page */
let gsiPromise: Promise<GoogleId> | null = null;
function loadGsi(): Promise<GoogleId> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  gsiPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.onload = () => (window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error("no gsi")));
    s.onerror = () => { gsiPromise = null; reject(new Error("gsi failed to load")); };
    document.head.appendChild(s);
  });
  return gsiPromise;
}

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Google's own "Sign in with Google" button. Google's screens run on trailtotides.com, so they
 * name this site (not the Supabase address the redirect flow showed). Google hands back an ID
 * token, which Supabase checks against the nonce and turns into a normal session.
 * If Google's script can't load (blocked, offline), it falls back to the redirect flow.
 */
export default function GoogleSignInButton({ next = "/", label = "Continue with Google" }: { next?: string; label?: string }) {
  const slot = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"loading" | "google" | "fallback">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!GOOGLE_AUTH_ON) return;
    let cancelled = false;
    (async () => {
      try {
        const gsi = await loadGsi();
        // The raw nonce goes to Supabase; Google signs its hash into the ID token
        const raw = crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + b.toString(16).padStart(2, "0"), "");
        const hashed = await sha256Hex(raw);
        if (cancelled || !slot.current) return;
        gsi.initialize({
          client_id: CLIENT_ID,
          nonce: hashed,
          use_fedcm_for_prompt: true,
          itp_support: true,
          context: label.toLowerCase().includes("sign up") ? "signup" : "signin",
          callback: async (res: CredentialResponse) => {
            if (!res.credential) return;
            setBusy(true);
            setError("");
            const { error: err } = await createClient().auth.signInWithIdToken({ provider: "google", token: res.credential, nonce: raw });
            if (err) {
              console.error("Google sign-in failed:", err.message);
              setError("Google sign-in didn't go through. Try again, or use your email.");
              setBusy(false);
              return;
            }
            // A full load, so every server-rendered part of the site sees the new session
            window.location.assign(next);
          },
        });
        const width = Math.min(400, Math.max(200, Math.round(slot.current.getBoundingClientRect().width)));
        gsi.renderButton(slot.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: label.toLowerCase().includes("sign up") ? "signup_with" : "continue_with",
          logo_alignment: "center",
          width,
        });
        setMode("google");
        // Returning visitors also get Google's one-tap "Continue as …" card
        gsi.prompt();
      } catch {
        if (!cancelled) setMode("fallback");
      }
    })();
    return () => { cancelled = true; };
  }, [next, label]);

  if (!GOOGLE_AUTH_ON) return null;

  // Redirect flow, used only when Google's script can't load
  async function redirectFlow() {
    setBusy(true);
    setError("");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: err } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (err) { setError("Google sign-in isn't available right now. Use your email instead."); setBusy(false); }
  }

  return (
    <div className="space-y-3">
      {mode !== "fallback" ? (
        <div className="relative min-h-11 flex justify-center">
          <div ref={slot} className="w-full flex justify-center" style={{ colorScheme: "light" }} />
          {(mode === "loading" || busy) && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white text-[#1f1f1f] text-sm font-semibold">
              {busy ? "Signing you in…" : label}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={redirectFlow}
          disabled={busy}
          className="w-full h-11 flex items-center justify-center gap-2.5 rounded-full bg-white text-[#1f1f1f] text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.94 10.94 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          {busy ? "Opening Google…" : label}
        </button>
      )}
      {error && <p className="text-[12px] text-red-400 text-center">{error}</p>}
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
        <span className="flex-1 h-px bg-white/10" />or with email<span className="flex-1 h-px bg-white/10" />
      </div>
    </div>
  );
}
