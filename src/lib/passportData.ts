import { createClient, createAdminClient } from "@/lib/supabase/server";
import { adventures, type Adventure } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";
import { getAchievements } from "@/lib/achievements";
import {
  RADAR_AXES, getAceRank, dominantDomain, declutterStamps,
  DIFFICULTY_LEVEL, hashSeed, type StampDomain,
  PASSPORT_MAP_W, PASSPORT_MAP_H,
} from "@/lib/passportVisuals";

export interface PassportStamp {
  slug: string;
  name: string;
  type: string;
  date: string;
  difficulty: string;
  domain: StampDomain;
  seed: number;
  dispX: number;
  dispY: number;
  stampScale: number;
}

export interface PassportData {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  passportNo: string;
  issueDateISO: string;
  totalAdventures: number;
  statesCount: number;
  hardest: { name: string; type: string; difficulty: string } | null;
  hasAceData: boolean;
  userAce: Record<string, number>;
  topAxis: string;
  aceRank: { label: string; color: string } | null;
  totalBadges: number;
  badges: { id: string; name: string; icon: string; color: string }[];
  badgeOverflow: number;
  stamps: PassportStamp[];
  stampOverflow: number;
}

const MAP_W = PASSPORT_MAP_W, MAP_H = PASSPORT_MAP_H;

/** Everything the Adventure Passport needs — computed once, shared by the
 * JSON API (interactive book) and the share-image routes (next/og), so the
 * two never drift out of sync. `demoMode` is only honored outside production
 * ("few" | "many" | "empty") for local preview without needing real trip-log
 * data. */
export async function computePassportData(origin: string, demoMode?: string | null): Promise<PassportData | null> {
  const DEBUG_DEMO = process.env.NODE_ENV !== "production" ? demoMode : null;

  const supabase = await createClient();
  const { data: { user: realUser } } = await supabase.auth.getUser();
  if (!realUser && !DEBUG_DEMO) return null;
  const user = realUser ?? {
    id: "demo-user-id",
    created_at: "2024-03-01T00:00:00.000Z",
    user_metadata: { full_name: "Demo Explorer", username: "demoexplorer", ace_profile: { stamina: 4, power: 3, strength: 3, agility: 2, water: 4, altitude: 5, focus: 3, nerve: 2 } },
  } as unknown as NonNullable<typeof realUser>;

  const admin = await createAdminClient();
  let entries: { slug: string; date: string }[] = [];
  if (DEBUG_DEMO) {
    const count = DEBUG_DEMO === "many" ? 24 : DEBUG_DEMO === "empty" ? 0 : 6;
    entries = adventures.slice(0, count).map((a, i) => ({ slug: a.slug, date: `2024-${String((i % 12) + 1).padStart(2, "0")}-1${i % 9}` }));
  } else {
    const { data: blob } = await admin.storage.from("wishlists").download(`triplog-${user.id}.json`);
    if (blob) {
      try { entries = JSON.parse(await blob.text()); } catch { entries = []; }
    }
  }

  const stampsRaw = entries
    .map((e) => {
      const adv = adventures.find((a) => a.slug === e.slug);
      if (!adv) return null;
      const difficulty = computeDifficulty(getACE(adv));
      return { adv, date: e.date, difficulty };
    })
    .filter((x): x is { adv: Adventure; date: string; difficulty: string } => !!x)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const name = (user.user_metadata?.full_name as string) || (user.user_metadata?.username as string) || "Explorer";
  const username = (user.user_metadata?.username as string | undefined) ?? null;
  const avatarId = user.user_metadata?.avatar_id as number | null | undefined;
  const avatarUrl = avatarId ? `${origin}/avatars/avatar-${avatarId}.png` : null;
  // The real, permanent system-wide id (see migration 20260909000000) — the
  // TT- hash is only a fallback for an account that predates that backfill.
  const { data: profileRow } = await admin.from("profiles").select("public_id").eq("id", user.id).single();
  const passportNo = profileRow?.public_id ?? `TT-${user.id.replace(/-/g, "").slice(-6).toUpperCase()}`;
  const issueDateISO = (user.created_at ? new Date(user.created_at) : new Date()).toISOString();

  const statesCount = new Set(stampsRaw.map((s) => s.adv.state)).size;
  const hardest = stampsRaw.reduce<{ adv: Adventure; difficulty: string; level: number } | null>((best, s) => {
    const level = DIFFICULTY_LEVEL[s.difficulty] ?? 1;
    if (!best || level > best.level) return { adv: s.adv, difficulty: s.difficulty, level };
    return best;
  }, null);

  // The explorer's own ACE self-assessment (from the matchmaker quiz), stored
  // flat on user_metadata by /api/ace-profile — not derived from adventures.
  const userAceRaw = user.user_metadata?.ace_profile as Record<string, number> | undefined;
  const userAce: Record<string, number> = Object.fromEntries(RADAR_AXES.map((ax) => [ax, userAceRaw?.[ax] ?? 0]));
  const hasAceData = RADAR_AXES.some((ax) => userAce[ax] > 0);
  const topAxis = RADAR_AXES.reduce((best, ax) => (userAce[ax] > userAce[best] ? ax : best), RADAR_AXES[0]);
  const aceSum = RADAR_AXES.reduce((sum, ax) => sum + userAce[ax], 0);
  const aceRank = hasAceData ? getAceRank(aceSum) : null;

  // Achievement badges — same source as the Trophy Cabinet on /profile.
  const { data: xpBlob } = await admin.storage.from("user-data").download(`xp/${user.id}.json`);
  let xpEvents: { action: string; adventure_slug?: string; xp?: number; revoked?: boolean }[] = [];
  if (xpBlob) {
    try { xpEvents = JSON.parse(await xpBlob.text()); } catch { xpEvents = []; }
  }
  const activeXp = xpEvents.filter((e) => !e.revoked);
  const totalXP = activeXp.reduce((sum, e) => sum + (e.xp ?? 0), 0);
  const uniqBy = (action: string) => new Set(activeXp.filter((e) => e.action === action).map((e) => e.adventure_slug)).size;
  const engagement = {
    completed: uniqBy("trip_log"), reviews: uniqBy("review"),
    wishlisted: uniqBy("wishlist"), photos: uniqBy("photo"), compares: uniqBy("compare"),
  };
  const badgeAce = { stamina: userAce.stamina, power: userAce.power, strength: userAce.strength, agility: userAce.agility, water: userAce.water, altitude: userAce.altitude, focus: userAce.focus, nerve: userAce.nerve };
  const allEarnedBadges = getAchievements(badgeAce, totalXP, engagement);
  const badges = allEarnedBadges.slice(0, 6).map((b) => ({ id: b.id, name: b.name, icon: b.icon, color: b.color }));

  const shown = stampsRaw.slice(0, 18);
  const stampOverflow = stampsRaw.length - shown.length;
  const declutteredStamps = declutterStamps(
    shown.map((s) => ({ slug: s.adv.slug, lng: s.adv.lng, lat: s.adv.lat, difficulty: s.difficulty })),
    MAP_W, MAP_H
  );
  const stamps: PassportStamp[] = shown.map((s, i) => ({
    slug: s.adv.slug,
    name: s.adv.name,
    type: s.adv.type,
    date: s.date,
    difficulty: s.difficulty,
    domain: dominantDomain(getACE(s.adv)),
    seed: hashSeed(s.adv.slug),
    dispX: declutteredStamps[i].dispX,
    dispY: declutteredStamps[i].dispY,
    stampScale: declutteredStamps[i].stampScale,
  }));

  return {
    name, username, avatarUrl, passportNo, issueDateISO,
    totalAdventures: stampsRaw.length, statesCount,
    hardest: hardest ? { name: hardest.adv.name, type: hardest.adv.type, difficulty: hardest.difficulty } : null,
    hasAceData, userAce, topAxis, aceRank,
    totalBadges: allEarnedBadges.length, badges, badgeOverflow: allEarnedBadges.length - badges.length,
    stamps, stampOverflow,
  };
}
