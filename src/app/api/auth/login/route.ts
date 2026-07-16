import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/server";
import { findUserByUsername } from "@/lib/resolveUsername";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(`login:${getClientIp(request)}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const { identifier, password } = await request.json();

  // Resolve username → email
  let email = (identifier ?? "").trim();
  if (!email.includes("@")) {
    const adminClient = await createAdminClient();
    try {
      const match = await findUserByUsername(adminClient, email);
      if (!match?.email) {
        return NextResponse.json({ error: "No account found with that username." }, { status: 400 });
      }
      email = match.email;
    } catch (err) {
      console.error("login username lookup failed:", err);
      return NextResponse.json({ error: "Could not sign in right now" }, { status: 500 });
    }
  }

  // Call Supabase token endpoint directly
  const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || tokenData.error) {
    return NextResponse.json(
      { error: tokenData.error_description || tokenData.error || "Invalid credentials" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });

  // Use createServerClient to set properly formatted base64url cookies
  const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, {
            ...options,
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
          })
        );
      },
    },
  });

  await supabase.auth.setSession({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
  });

  return response;
}
