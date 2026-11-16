import type { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map doesn't grow unbounded on a long-running server.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Simple fixed-window in-memory rate limiter, keyed per-process.
 * Good enough for a single-instance deployment; does not share state
 * across multiple server instances.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (bucket.count < limit) {
    bucket.count++;
    return { allowed: true, retryAfterMs: 0 };
  }
  return { allowed: false, retryAfterMs: bucket.resetAt - now };
}

let shared: SupabaseClient | null | undefined;
function sharedClient(): SupabaseClient | null {
  if (shared === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    shared = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  }
  return shared;
}

/**
 * The same limit, counted across every server instance (the rate_limits table), for the routes
 * where a per-instance count isn't enough: Compass.AI (each answer costs money) and uploads.
 * This instance's own count is checked first, so a flood never reaches the database; if the
 * shared counter is unavailable (table not created yet, database slow), the instance count stands.
 */
export async function rateLimitShared(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const local = rateLimit(key, limit, windowMs);
  if (!local.allowed) return local;
  const db = sharedClient();
  if (!db) return local;
  try {
    const { data, error } = await db.rpc("rate_limit_hit", { p_key: key.slice(0, 200), p_limit: limit, p_window_seconds: Math.ceil(windowMs / 1000) });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return local;
    return { allowed: !!row.allowed, retryAfterMs: Number(row.retry_after_ms) || 0 };
  } catch {
    return local;
  }
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
