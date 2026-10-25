import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { findUserByUsername } from "@/lib/resolveUsername";
import { adventures, type Adventure } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";
import { getAchievements, nextBadges } from "@/lib/achievements";
import { getTier } from "@/lib/xp";
import { loadUserBadges } from "@/lib/userAchievements";
import {
  RADAR_AXES, dominantDomain, deriveTripTrophies, project,
  DIFFICULTY_LEVEL, hashSeed, type TripTrophy,
} from "@/lib/passportVisuals";

const PHOTO_BUCKET = "adventure-photos";
interface PhotoMeta { id: string; user_id: string; caption: string; url: string; created_at: string }
async function readPhotoIndex(admin: SupabaseClient, slug: string): Promise<PhotoMeta[]> {
  const { data, error } = await admin.storage.from(PHOTO_BUCKET).download(`${slug}/_index.json`);
  if (error || !data) return [];
  try { return JSON.parse(await data.text()) as PhotoMeta[]; } catch { return []; }
}
/** Every completed adventure's most recent photo BY THIS USER, keyed by slug — fetched in small parallel batches to avoid hammering storage. */
async function readMyPhotosBySlug(admin: SupabaseClient, userId: string, slugs: string[]): Promise<Map<string, PhotoMeta>> {
  const result = new Map<string, PhotoMeta>();
  const BATCH = 8;
  for (let i = 0; i < slugs.length; i += BATCH) {
    const batch = slugs.slice(i, i + BATCH);
    const lists = await Promise.all(batch.map((slug) => readPhotoIndex(admin, slug)));
    lists.forEach((list, j) => {
      const mine = list.find((p) => p.user_id === userId);
      if (mine) result.set(batch[j], mine);
    });
  }
  return result;
}

export interface PassportStamp {
  slug: string;
  name: string;
  type: string;
  date: string;
  difficulty: string;
  state: string;
  seed: number;
  /** Position on the India map, as % of its width/height */
  xPct: number;
  yPct: number;
}

/** One slot in the stamp collection: every adventure, done or not */
export interface CollectionSlot { slug: string; name: string; type: string; done: boolean; date: string | null; seed: number; difficulty: string }
export interface CollectionState { state: string; slots: CollectionSlot[]; done: number }

export interface AdventureLogEntry {
  slug: string;
  name: string;
  type: string;
  difficulty: string;
  date: string;
  photoUrl: string;
  photoCaption: string | null;
  isPersonalPhoto: boolean;
  memorableMoment: string;
  trophies: TripTrophy[];
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
  /** XP level — the one rank the passport shows */
  level: { name: string; color: string };
  totalXP: number;
  /** Sum of the 8 ACE skills, out of 40; null before the assessment */
  aceScore: number | null;
  nextBadge: { name: string; hint: string; have: number; need: number } | null;
  recentStamps: { name: string; state: string; date: string }[];
  totalBadges: number;
  /** Every earned badge, rarest first */
  badges: { id: string; name: string; icon: string; color: string; description: string }[];
  logPages: AdventureLogEntry[];
  /** Every completed adventure, newest first */
  stamps: PassportStamp[];
  /** Every adventure on the site by state — states with the most stamps first */
  collection: CollectionState[];
  totalCollectable: number;
}

/** Everything the Adventure Passport needs — computed once, shared by the
 * JSON API (interactive book) and the share-image routes (next/og), so the
 * two never drift out of sync. `demoMode` is only honored outside production
 * ("few" | "many" | "empty") for local preview without needing real trip-log
 * data. */
/** The signed-in user's passport, or with `publicUserId` someone else's (callers check they made it public) */
export async function computePassportData(origin: string, demoMode?: string | null, publicUserId?: string): Promise<PassportData | null> {
  const DEBUG_DEMO = process.env.NODE_ENV !== "production" && !publicUserId ? demoMode : null;

  let realUser;
  if (publicUserId) {
    realUser = (await (await createAdminClient()).auth.admin.getUserById(publicUserId)).data.user;
  } else {
    const supabase = await createClient();
    realUser = (await supabase.auth.getUser()).data.user;
  }
  if (!realUser && !DEBUG_DEMO) return null;
  const user = realUser ?? {
    id: "demo-user-id",
    created_at: "2024-03-01T00:00:00.000Z",
    user_metadata: { full_name: "Demo Explorer", username: "demoexplorer", ace_profile: { stamina: 4, power: 3, strength: 3, agility: 2, water: 4, altitude: 5, focus: 3, nerve: 2 } },
  } as unknown as NonNullable<typeof realUser>;

  const admin = await createAdminClient();
  let entries: { slug: string; date: string; note?: string }[] = [];
  if (DEBUG_DEMO) {
    const count = DEBUG_DEMO === "many" ? 24 : DEBUG_DEMO === "empty" ? 0 : 6;
    // Every other adventure, so the demo spreads across states
    entries = adventures.filter((_, i) => i % 2 === 0).slice(0, count).map((a, i) => ({ slug: a.slug, date: `2024-${String((i % 12) + 1).padStart(2, "0")}-1${i % 9}` }));
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
      return { adv, date: e.date, note: e.note, difficulty };
    })
    .filter((x): x is { adv: Adventure; date: string; note: string | undefined; difficulty: string } => !!x)
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
  const aceScore = hasAceData ? Math.round(RADAR_AXES.reduce((sum, ax) => sum + userAce[ax], 0)) : null;

  // Achievement badges — same source as the Trophy Cabinet on /profile.
  const userBadges = await loadUserBadges(admin, user);
  // Demo trips aren't in a stored trip log, so count them here
  const engagement = DEBUG_DEMO ? { ...userBadges.engagement, completed: entries.length } : userBadges.engagement;
  const allEarnedBadges = DEBUG_DEMO ? getAchievements(userBadges.ace, userBadges.totalXP, engagement) : userBadges.earned;
  // Rarest first — getAchievements already lists them that way
  const badges = allEarnedBadges.map((b) => ({ id: b.id, name: b.name, icon: b.icon, color: b.color, description: b.description }));
  const [next] = nextBadges(new Set(allEarnedBadges.map((b) => b.id)), userBadges.ace, userBadges.totalXP, engagement, 1);
  const nextBadge = next ? { name: next.badge.name, ...next.progress } : null;
  const tier = getTier(userBadges.totalXP);
  const recentStamps = stampsRaw.slice(0, 3).map((s) => ({ name: s.adv.name, state: s.adv.state, date: s.date }));

  const stamps: PassportStamp[] = stampsRaw.map((s) => {
    const { xPct, yPct } = project(s.adv.lng, s.adv.lat);
    return {
      slug: s.adv.slug, name: s.adv.name, type: s.adv.type, date: s.date,
      difficulty: s.difficulty, state: s.adv.state, seed: hashSeed(s.adv.slug), xPct, yPct,
    };
  });

  // The stamp collection: a slot for every adventure, grouped by state
  const doneBySlug = new Map(stampsRaw.map((s) => [s.adv.slug, s.date]));
  const byState = new Map<string, CollectionSlot[]>();
  for (const a of adventures) {
    const date = doneBySlug.get(a.slug) ?? null;
    const slot: CollectionSlot = { slug: a.slug, name: a.name, type: a.type, done: date !== null, date, seed: hashSeed(a.slug), difficulty: computeDifficulty(getACE(a)) };
    byState.set(a.state, [...(byState.get(a.state) ?? []), slot]);
  }
  const collection: CollectionState[] = [...byState.entries()]
    .map(([state, slots]) => ({
      state,
      // Stamped first (newest first), then the rest by name
      slots: slots.sort((a, b) => Number(b.done) - Number(a.done) || (b.date ?? "").localeCompare(a.date ?? "") || a.name.localeCompare(b.name)),
      done: slots.filter((x) => x.done).length,
    }))
    .sort((a, b) => b.done - a.done || a.state.localeCompare(b.state));

  // ─── Adventure log pages — one per notable completed adventure: a photo
  // (the user's own upload if they made one, else the adventure's own hero
  // shot, so a log page is never empty), 2-3 trip-specific trophies, and a
  // short "memorable moment" line pulled from whatever's most personal: a
  // trip-log note, a review the user wrote, the photo's own caption, or
  // finally the adventure's own tagline.
  const LOG_PAGE_CAP = 8;
  const myPhotosBySlug = DEBUG_DEMO
    ? new Map<string, PhotoMeta>()
    : await readMyPhotosBySlug(admin, user.id, stampsRaw.map((s) => s.adv.slug));

  let reviewBySlug = new Map<string, string>();
  if (!DEBUG_DEMO && stampsRaw.length > 0) {
    // Reviews are public; the service client also reads them for a shared passport
    const { data: myReviews } = await admin
      .from("reviews")
      .select("adventure_slug, body")
      .eq("user_id", user.id)
      .in("adventure_slug", stampsRaw.map((s) => s.adv.slug));
    reviewBySlug = new Map((myReviews ?? []).map((r) => [r.adventure_slug as string, r.body as string]));
  }

  const logPages: AdventureLogEntry[] = stampsRaw
    .map((s) => ({ ...s, photo: myPhotosBySlug.get(s.adv.slug) }))
    // Prioritize adventures with a personal photo, then the hardest —
    // those are the ones most worth a dedicated page.
    .sort((a, b) => {
      if (!!a.photo !== !!b.photo) return a.photo ? -1 : 1;
      return (DIFFICULTY_LEVEL[b.difficulty] ?? 1) - (DIFFICULTY_LEVEL[a.difficulty] ?? 1);
    })
    .slice(0, LOG_PAGE_CAP)
    // Then read like a diary — most recent trip first.
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((s) => ({
      slug: s.adv.slug,
      name: s.adv.name,
      type: s.adv.type,
      difficulty: s.difficulty,
      date: s.date,
      photoUrl: s.photo?.url ?? s.adv.heroImage,
      photoCaption: s.photo?.caption?.trim() || null,
      isPersonalPhoto: !!s.photo,
      memorableMoment: s.note?.trim() || reviewBySlug.get(s.adv.slug)?.trim() || s.photo?.caption?.trim() || s.adv.tagline,
      trophies: deriveTripTrophies({
        type: s.adv.type, difficulty: s.difficulty, domain: dominantDomain(getACE(s.adv)),
        altitude: s.adv.altitude, distance: s.adv.distance,
      }),
    }));

  return {
    name, username, avatarUrl, passportNo, issueDateISO,
    totalAdventures: stampsRaw.length, statesCount,
    hardest: hardest ? { name: hardest.adv.name, type: hardest.adv.type, difficulty: hardest.difficulty } : null,
    hasAceData, userAce, topAxis, aceScore,
    level: { name: tier.name, color: tier.color }, totalXP: userBadges.totalXP,
    nextBadge, recentStamps,
    totalBadges: allEarnedBadges.length, badges,
    logPages,
    stamps, collection, totalCollectable: adventures.length,
  };
}

/** The account behind /passport/<username>, if it exists and its owner made the passport public */
export async function publicPassportUserId(username: string): Promise<string | undefined> {
  if (!/^[a-z0-9_.-]{3,20}$/i.test(username)) return undefined;
  const admin = await createAdminClient();
  const match = await findUserByUsername(admin, username).catch(() => null);
  if (!match) return undefined;
  const { data } = await admin.auth.admin.getUserById(match.id);
  return data.user && data.user.user_metadata?.passport_public === true ? match.id : undefined;
}
