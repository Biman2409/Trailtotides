import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/authLinks";

// Where email links land: the verification link from sign-up (signup, or magiclink when
// resent) and the password-reset link (recovery).
//
// Opening a link only shows /auth/confirm; the one-time token is spent when the person presses
// its button, which POSTs back here. Mail scanners (Zoho, Outlook, corporate filters) open every
// link in an email to check it, and when opening the link was enough, they used the token up
// seconds after the email arrived, so the real click hit "expired".
const TYPES: EmailOtpType[] = ["signup", "magiclink", "recovery", "email", "email_change", "invite"];

function originOf(request: Request) {
  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

const typeOf = (raw: string | null) => (raw && TYPES.includes(raw as EmailOtpType) ? (raw as EmailOtpType) : null);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = typeOf(requestUrl.searchParams.get("type"));
  const next = safeNext(requestUrl.searchParams.get("next"));
  const origin = originOf(request);

  // PKCE flow (code exchange)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Email links: hand over to the confirm page without touching the token
  if (token_hash && type) {
    const confirm = new URL("/auth/confirm", origin);
    confirm.searchParams.set("token_hash", token_hash);
    confirm.searchParams.set("type", type);
    confirm.searchParams.set("next", next);
    return NextResponse.redirect(confirm.toString());
  }

  return failed(origin, type, next);
}

// The confirm page's button: spend the token and sign the person in
export async function POST(request: Request) {
  const form = await request.formData();
  const token_hash = String(form.get("token_hash") ?? "");
  const type = typeOf(String(form.get("type") ?? ""));
  const next = safeNext(String(form.get("next") ?? ""));
  const origin = originOf(request);

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      // 303 so the browser follows with a GET
      if (type === "recovery") return NextResponse.redirect(`${origin}/auth/reset-password`, 303);
      // Just verified: they're signed in, and the page says so once
      const dest = new URL(next, origin);
      if (type === "signup" || type === "magiclink") dest.searchParams.set("welcome", "1");
      return NextResponse.redirect(dest.toString(), 303);
    }
  }

  return failed(origin, type, next);
}

async function failed(origin: string, type: EmailOtpType | null, next: string) {
  // An old verification link opened by someone who's already verified and signed in: nothing to fix
  if (type !== "recovery") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email_confirmed_at) return NextResponse.redirect(`${origin}${next}`, 303);
  }

  // Links work once and expire; say which, and how to get a fresh one
  const message = type === "recovery"
    ? "That reset link has expired or was already used. Ask for a new one below."
    : "That link has expired or was already used. Log in to get a new verification email.";
  const back = type === "recovery" ? "/auth/forgot-password" : "/auth/login";
  return NextResponse.redirect(`${origin}${back}?error=${encodeURIComponent(message)}`, 303);
}
