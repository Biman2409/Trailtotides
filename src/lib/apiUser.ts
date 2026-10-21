import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Small helpers for the signed-in-only API routes (comparisons, saved searches, quotes, prefs).

/** The signed-in caller, or a 401 response to return as-is. */
export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) } as const;
  return { supabase, user } as const;
}

export async function readJson(req: Request): Promise<unknown> {
  try { return await req.json(); } catch { return null; }
}

/** 12 hex characters: the secret part of a share link */
export const newShareCode = () => randomBytes(6).toString("hex");
export const SHARE_CODE_RE = /^[0-9a-f]{12}$/;

// Account preferences live in user_metadata, next to the username and avatar.
export interface AccountPrefs {
  /** Email when a wishlisted adventure's season opens or its price drops. On unless turned off. */
  wishlistAlerts: boolean;
  /** Anyone with the link can see the Adventure Passport at /passport/<username>. Off unless turned on. */
  passportPublic: boolean;
}

export function prefsOf(user: Pick<User, "user_metadata">): AccountPrefs {
  const m = user.user_metadata ?? {};
  return { wishlistAlerts: m.wishlist_alerts !== false, passportPublic: m.passport_public === true };
}
