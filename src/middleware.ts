import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const NOINDEX_WITH_QUERY = new Set(["/explore", "/map", "/stories", "/operators", "/destinations", "/adventurepedia/treks"]);

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Signed-out visitors (most traffic) have no Supabase session cookie, so there's nothing to
  // refresh: skip the round trip to Supabase and just apply the robots rule
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
  if (!hasSession) return withRobots(request, supabaseResponse);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return withRobots(request, supabaseResponse);
}

// Filtered, searched and map-positioned variants of a listing page show the same page as
// the clean one (their canonical): keep them out of the index, but follow their links
function withRobots(request: NextRequest, response: NextResponse) {
  if (NOINDEX_WITH_QUERY.has(request.nextUrl.pathname) && request.nextUrl.search) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
