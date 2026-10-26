import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import { adventures } from "@/lib/data";
import { prefsOf } from "@/lib/apiUser";
import { searchMatches, wishlistNews, type AlertState } from "@/lib/alerts";
import { sendAlertDigest, type AlertItem } from "@/lib/email";
import { EMAIL_ALERTS } from "@/lib/features";

// The daily alerts job (vercel.json runs it each morning). For every account it collects
// wishlist news (season about to open, price drop) and new matches for saved map searches,
// then sends one digest email. Nothing is sent when there's nothing new.

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SITE = "https://www.trailtotides.com";
const bySlug = new Map(adventures.map((a) => [a.slug, a]));
// Wishlists are stored as <user id>.json in the "wishlists" bucket (trip logs share it as triplog-<id>.json)
const WISHLIST_FILE = /^([0-9a-f-]{36})\.json$/;

type Digest = { wishlist: AlertItem[]; searches: { name: string; link: string; items: AlertItem[] }[] };

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!EMAIL_ALERTS) return NextResponse.json({ skipped: "Email alerts are switched off" });

  const admin = await createAdminClient();
  const digests = new Map<string, Digest>();
  const digestFor = (id: string) => digests.get(id) ?? digests.set(id, { wishlist: [], searches: [] }).get(id)!;
  const users = new Map<string, User | null>();
  const userFor = async (id: string) => {
    if (!users.has(id)) users.set(id, (await admin.auth.admin.getUserById(id)).data.user ?? null);
    return users.get(id)!;
  };

  // ── Wishlists ──
  let wishlistsChecked = 0;
  for (const userId of await wishlistOwners(admin)) {
    const user = await userFor(userId);
    if (!user || !prefsOf(user).wishlistAlerts) continue;
    const slugs = await readWishlist(admin, userId);
    if (!slugs.length) continue;
    wishlistsChecked++;

    const { data: rows } = await admin.from("wishlist_alert_state").select("slug, last_price, season_alerted").eq("user_id", userId);
    const prev = new Map((rows ?? []).map((r) => [r.slug as string, r as AlertState]));
    const updates = [];
    for (const slug of slugs) {
      const a = bySlug.get(slug);
      if (!a) continue;
      const { line, next } = wishlistNews(a, prev.get(slug) ?? null);
      if (line) digestFor(userId).wishlist.push({ name: a.name, slug, line });
      updates.push({ user_id: userId, slug, ...next, updated_at: new Date().toISOString() });
    }
    if (updates.length) await admin.from("wishlist_alert_state").upsert(updates);
  }

  // ── Saved map searches ──
  const { data: searches } = await admin.from("saved_searches").select("id, user_id, name, query, seen_slugs").eq("alerts", true);
  for (const s of searches ?? []) {
    const matches = searchMatches(s.query);
    const seen = new Set<string>(s.seen_slugs ?? []);
    const fresh = matches.filter((a) => !seen.has(a.slug));
    if (!fresh.length) continue;
    digestFor(s.user_id).searches.push({
      name: s.name,
      link: `${SITE}/map?${s.query}`,
      items: fresh.map((a) => ({ name: a.name, slug: a.slug, line: `${a.type} · ${a.state}` })),
    });
    await admin.from("saved_searches")
      .update({ seen_slugs: [...new Set([...seen, ...matches.map((a) => a.slug)])], last_alerted_at: new Date().toISOString() })
      .eq("id", s.id);
  }

  // ── One email per person ──
  let sent = 0, failed = 0;
  for (const [userId, d] of digests) {
    if (!d.wishlist.length && !d.searches.length) continue;
    const user = await userFor(userId);
    if (!user?.email) continue;
    const name = String(user.user_metadata?.full_name ?? "").trim().split(/\s+/)[0] || user.user_metadata?.username || "explorer";
    const res = await sendAlertDigest(user.email, name, d.wishlist, d.searches);
    if ("error" in res) failed++; else sent++;
  }

  return NextResponse.json({ wishlistsChecked, searchesChecked: searches?.length ?? 0, sent, failed });
}

async function wishlistOwners(admin: SupabaseClient): Promise<string[]> {
  const ids: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await admin.storage.from("wishlists").list("", { limit: 1000, offset });
    if (error || !data?.length) break;
    for (const f of data) {
      const m = WISHLIST_FILE.exec(f.name);
      if (m) ids.push(m[1]);
    }
    if (data.length < 1000) break;
  }
  return ids;
}

async function readWishlist(admin: SupabaseClient, userId: string): Promise<string[]> {
  const { data } = await admin.storage.from("wishlists").download(`${userId}.json`);
  if (!data) return [];
  try { return JSON.parse(await data.text()) as string[]; } catch { return []; }
}
