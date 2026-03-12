import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { identifier, password } = await request.json();

  // Resolve username → email
  let email = identifier.trim();
  if (!email.includes("@")) {
    const adminClient = await createAdminClient();
    const { data: allUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const match = allUsers?.users.find(
      (u: { user_metadata?: { username?: string }; email?: string }) =>
        (u.user_metadata?.username ?? "").toLowerCase() === email.toLowerCase()
    );
    if (!match?.email) {
      return NextResponse.json({ error: "No account found with that username." }, { status: 400 });
    }
    email = match.email;
  }

  // Sign in via Supabase REST directly to get tokens
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await res.json();

  if (!res.ok || data.error) {
    return NextResponse.json(
      { error: data.error_description || data.msg || "Invalid credentials" },
      { status: 401 }
    );
  }

  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!
    .replace("https://", "")
    .split(".")[0];

  const cookieOpts = {
    path: "/",
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: data.expires_in ?? 3600,
  };

  const response = NextResponse.json({ ok: true });

  // Set the Supabase session cookies directly
  response.cookies.set(
    `sb-${projectRef}-auth-token`,
    JSON.stringify({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      expires_at: data.expires_at,
      refresh_token: data.refresh_token,
      user: data.user,
    }),
    cookieOpts
  );

  return response;
}
