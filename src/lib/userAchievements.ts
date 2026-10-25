import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { ACE } from "@/lib/ace";
import { getAchievements, type Achievement, type EngagementStats } from "@/lib/achievements";

// The one place that works out which badges someone has earned. The Trophy Cabinet
// (/api/achievements), the unlock pop-ups and the Adventure Passport all read it, so
// they can't disagree. Counts come from the real records (trip log, wishlist, reviews),
// not the XP log, because XP for some actions is only given once.

const ACE_AXES: (keyof ACE)[] = ["stamina", "power", "strength", "agility", "water", "altitude", "focus", "nerve"];

export interface XPEvent { action: string; adventure_slug?: string; xp?: number; created_at?: string; revoked?: boolean }

export interface UserBadges {
  /** The account's ACE result, or null before the assessment */
  ace: ACE | null;
  totalXP: number;
  /** Active XP events, newest first */
  events: XPEvent[];
  engagement: EngagementStats;
  earned: Achievement[];
}

async function readJson<T>(admin: SupabaseClient, bucket: string, path: string, fallback: T): Promise<T> {
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) return fallback;
  try { return JSON.parse(await data.text()) as T; } catch { return fallback; }
}

/** The ACE result saved on the account by /api/ace-profile, or null if they haven't taken it */
export function accountAce(user: Pick<User, "user_metadata">): ACE | null {
  const raw = user.user_metadata?.ace_profile as Partial<Record<keyof ACE, number>> | undefined;
  if (!raw || !ACE_AXES.some((ax) => (raw[ax] ?? 0) > 0)) return null;
  return Object.fromEntries(ACE_AXES.map((ax) => [ax, raw[ax] ?? 0])) as unknown as ACE;
}

export async function loadUserBadges(admin: SupabaseClient, user: Pick<User, "id" | "user_metadata">): Promise<UserBadges> {
  const [xpEvents, tripLog, wishlist, reviews] = await Promise.all([
    readJson<XPEvent[]>(admin, "user-data", `xp/${user.id}.json`, []),
    readJson<unknown[]>(admin, "wishlists", `triplog-${user.id}.json`, []),
    readJson<unknown[]>(admin, "wishlists", `${user.id}.json`, []),
    admin.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const events = (Array.isArray(xpEvents) ? xpEvents : [])
    .filter((e) => !e.revoked)
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
  const totalXP = events.reduce((sum, e) => sum + (e.xp ?? 0), 0);
  const engagement: EngagementStats = {
    completed: Array.isArray(tripLog) ? tripLog.length : 0,
    wishlisted: Array.isArray(wishlist) ? wishlist.length : 0,
    reviews: reviews.count ?? 0,
    // Each photo XP event is one photo (XP stops at 3 per adventure, so this does too)
    photos: events.filter((e) => e.action === "photo").length,
    compares: new Set(events.filter((e) => e.action === "compare").map((e) => e.adventure_slug)).size,
  };
  const ace = accountAce(user);

  return { ace, totalXP, events, engagement, earned: getAchievements(ace, totalXP, engagement) };
}

const announcedPath = (userId: string) => `achievements/${userId}.json`;

/**
 * Which of `earnedIds` this account hasn't been told about yet; marks them told.
 * The first time an account is seen, `known` (the ids this browser already announced,
 * from before this was stored on the account) seeds the list; with nothing to seed
 * from, everything already earned counts as told so nobody gets a flood of pop-ups.
 */
export async function claimNewBadges(admin: SupabaseClient, userId: string, earnedIds: string[], known?: string[]): Promise<string[]> {
  const stored = await readJson<string[] | null>(admin, "user-data", announcedPath(userId), null);
  const told = new Set(stored ?? known ?? earnedIds);
  const fresh = earnedIds.filter((id) => !told.has(id));
  if (stored && fresh.length === 0) return [];

  fresh.forEach((id) => told.add(id));
  const blob = new Blob([JSON.stringify([...told])], { type: "application/json" });
  await admin.storage.from("user-data").upload(announcedPath(userId), blob, { upsert: true, contentType: "application/json" });
  return fresh;
}
