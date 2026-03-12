import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
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

  // Build a response and use createServerClient so it handles cookie chunking correctly
  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }

  return response;
}
