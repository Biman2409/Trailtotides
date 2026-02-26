import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const host = request.headers.get("host");
      const protocol = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
      const origin = `${protocol}://${host}`;
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback to home if no code or error
  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`);
}
