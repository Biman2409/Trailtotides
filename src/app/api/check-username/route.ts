import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { findUserByUsername } from "@/lib/resolveUsername";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(`check-username:${getClientIp(req)}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { available: false, error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const username = req.nextUrl.searchParams.get("username") ?? "";

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ available: false });
  }

  const supabase = await createAdminClient();

  try {
    const match = await findUserByUsername(supabase, username);
    return NextResponse.json({ available: match === null });
  } catch (err) {
    console.error("check-username lookup failed:", err);
    // Fail closed: if we can't verify uniqueness, don't claim it's available.
    return NextResponse.json({ available: false, error: "Could not verify username" }, { status: 500 });
  }
}
