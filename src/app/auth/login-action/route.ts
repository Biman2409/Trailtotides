import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/server";
import { findUserByUsername } from "@/lib/resolveUsername";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Build an absolute URL using the real public host (works behind Orchids/ngrok proxies) */
function buildUrl(request: NextRequest, path: string): URL {
  const forwarded = request.headers.get("x-forwarded-host");
  const host = forwarded || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0] || "https";
  return new URL(path, `${proto}://${host}`);
}

// This route handles form POST submissions (not JSON API)
// Returns a redirect with Set-Cookie so the browser gets the cookie
// as part of a navigation (not fetch), bypassing any proxy cookie restrictions.
export async function POST(request: NextRequest) {
  const { allowed } = rateLimit(`login:${getClientIp(request)}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.redirect(
      buildUrl(request, `/auth/login?error=${encodeURIComponent("Too many login attempts. Please try again shortly.")}`)
    );
  }

  const formData = await request.formData();
  const identifier = ((formData.get("identifier") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const next = (formData.get("next") as string) || "/";

  // Resolve username → email
  let email = identifier;
  if (!email.includes("@")) {
    const adminClient = await createAdminClient();
    try {
      const match = await findUserByUsername(adminClient, email);
      if (!match?.email) {
        return NextResponse.redirect(
          buildUrl(request, `/auth/login?error=${encodeURIComponent("No account found with that username.")}`)
        );
      }
      email = match.email;
    } catch (err) {
      console.error("login-action username lookup failed:", err);
      return NextResponse.redirect(
        buildUrl(request, `/auth/login?error=${encodeURIComponent("Could not sign in right now")}`)
      );
    }
  }

  // Call Supabase token endpoint
  const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || tokenData.error) {
    const msg = tokenData.error_description || tokenData.error || "Invalid credentials";
    return NextResponse.redirect(
      buildUrl(request, `/auth/login?error=${encodeURIComponent(msg)}`)
    );
  }

  // Build redirect response with session cookies
  const redirectResponse = NextResponse.redirect(buildUrl(request, next));

  const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          redirectResponse.cookies.set(name, value, {
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

  return redirectResponse;
}
