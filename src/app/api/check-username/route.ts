import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { findUserByUsername } from "@/lib/resolveUsername";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { USERNAME_RE } from "@/lib/username";

// `reason` tells the form why a name isn't available, so it never has to guess:
// "invalid" (characters/length), "taken" (a real clash), "rate_limited" / "error" (try again).
export async function GET(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(`check-username:${getClientIp(req)}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { available: false, reason: "rate_limited", error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const username = (req.nextUrl.searchParams.get("username") ?? "").trim().toLowerCase();

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const supabase = await createAdminClient();

  try {
    const match = await findUserByUsername(supabase, username);
    return match === null
      ? NextResponse.json({ available: true })
      : NextResponse.json({ available: false, reason: "taken" });
  } catch (err) {
    console.error("check-username lookup failed:", err);
    // Fail closed: if we can't verify uniqueness, don't claim it's available, and don't claim
    // it's taken either.
    return NextResponse.json(
      { available: false, reason: "error", error: "Could not verify username" },
      { status: 500 }
    );
  }
}
