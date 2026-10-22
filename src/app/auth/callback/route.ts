import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/authLinks";

// Where email links land: the verification link from sign-up (signup, or magiclink when
// resent) and the password-reset link (recovery). Opening one signs the person in.
const TYPES: EmailOtpType[] = ["signup", "magiclink", "recovery", "email", "email_change", "invite"];

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const rawType = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const type = rawType && TYPES.includes(rawType) ? rawType : null;
  const next = safeNext(requestUrl.searchParams.get("next"));

  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  const supabase = await createClient();

  // PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Email OTP / token_hash flow (confirmation links)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      if (type === "recovery") return NextResponse.redirect(`${origin}/auth/reset-password`);
      // Just verified: they're signed in, and the page says so once
      const dest = new URL(next, origin);
      if (type === "signup" || type === "magiclink") dest.searchParams.set("welcome", "1");
      return NextResponse.redirect(dest.toString());
    }
  }

  // An old verification link opened by someone who's already verified and signed in: nothing to fix
  if (type !== "recovery") {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email_confirmed_at) return NextResponse.redirect(`${origin}${next}`);
  }

  // Links work once and expire; say which, and how to get a fresh one
  const message = type === "recovery"
    ? "That reset link has expired or was already used. Ask for a new one below."
    : "That link has expired or was already used. Log in to get a new verification email.";
  const back = type === "recovery" ? "/auth/forgot-password" : "/auth/login";
  return NextResponse.redirect(`${origin}${back}?error=${encodeURIComponent(message)}`);
}
