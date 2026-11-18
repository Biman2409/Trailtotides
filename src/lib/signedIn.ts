"use client";
import { createClient } from "@/lib/supabase/client";

/**
 * Whether this browser holds a signed-in session, read locally (no network). Saves that only
 * an account can keep (ACE profile, consent, medical flags, XP) check this first, so a signed-out
 * visitor doesn't send requests that can only come back 401.
 */
export async function hasSession(): Promise<boolean> {
  try {
    const { data } = await createClient().auth.getSession();
    return !!data.session;
  } catch {
    return false;
  }
}
