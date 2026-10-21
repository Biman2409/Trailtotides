import { headers } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";

// Links in verification and password-reset emails. They point at our own /auth/callback with
// a one-time token_hash, which the callback exchanges for a session on the server.
//
// In production the links always use the real site address. Building them from the request's
// Host header would let a forged request plant someone else's domain in the email.

const SITE_URL = process.env.SITE_URL || "https://trailtotides.com";

export async function siteOrigin(): Promise<string> {
  if (process.env.NODE_ENV === "production") return SITE_URL;
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  return `${host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https"}://${host}`;
}

/** Only same-site paths, so a link can't bounce someone to another site */
export const safeNext = (next: string | null | undefined, fallback = "/") =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;

export async function callbackLink(hashedToken: string, type: EmailOtpType, next?: string) {
  const url = new URL("/auth/callback", await siteOrigin());
  url.searchParams.set("token_hash", hashedToken);
  url.searchParams.set("type", type);
  if (next) url.searchParams.set("next", safeNext(next));
  return url.toString();
}
