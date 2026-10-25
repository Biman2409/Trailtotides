import type { ACE } from "./ace";
import { getACE, computeDifficulty } from "./ace";
import { adventures, type AdventureType } from "./data";
import { MAX_XP } from "./xp";

// Every badge, and the one set of rules that decides who has it. Badges reward what
// someone has done on the site — adventures logged, reviews, photos, regions — never the
// ACE™ self-assessment, which stays a capability check and nothing more.

export interface Achievement {
  id: string;
  name: string;
  description: string;
  /** Icon name — mapped in BadgeIcon (and BADGE_ICON_DEFS for the passport) */
  icon: string;
  /** "tier1" = pinnacle | "tier2" = domain masters | "tier3" = expedition badges */
  tier: "tier1" | "tier2" | "tier3";
  /** Shown as "???" until earned */
  secret?: boolean;
  rule: Rule;
}

type Stat = "completed" | "reviews" | "photos" | "wishlisted" | "regions";
type Flag = "allTypes" | "extreme" | "monsoon" | "winter" | "nightOwl" | "groundhog" | "throwback" | "busyMonth";

type Rule =
  /** Log `need` adventures rated 4+ for one ACE skill */
  | { kind: "skill"; axis: keyof ACE; need: number }
  /** Earn `need` of these other badges */
  | { kind: "badges"; ids: string[]; need: number; hint: string }
  | { kind: "count"; stat: Stat; need: number }
  | { kind: "xp"; need: number }
  | { kind: "flag"; flag: Flag; hint: string };

/** An adventure counts toward a skill badge when it's rated at least this for that skill */
const SKILL_MIN = 4;
/** One of each of these for Swiss Army Knife — fixed, so new adventure types don't make it harder later */
const ALL_ROUNDER_TYPES: AdventureType[] = ["Trekking", "Motorcycling", "Cycling", "Mountaineering"];

const AXIS_NAME: Record<keyof ACE, string> = {
  stamina: "Stamina", power: "Power", strength: "Strength", agility: "Agility",
  water: "Water", altitude: "Altitude", focus: "Focus", nerve: "Nerve",
};

// ─── Single-skill badges (Tier 3) ────────────────────────────────────────────

const skill = (id: string, name: string, axis: keyof ACE, icon: string, description: string): Achievement =>
  ({ id, name, icon, description, tier: "tier3", rule: { kind: "skill", axis, need: 5 } });

const SKILL_BADGES: Achievement[] = [
  skill("run-forrest-run",    "Run, Forrest, Run!",  "stamina",  "Timer",        "Five long-haul adventures logged. Built for back-to-back days in the field."),
  skill("rhino-beetle",       "Rhino Beetle",        "power",    "Dumbbell",     "Five adventures that demand raw power. Carries impossible loads without breaking stride."),
  skill("t-800",              "T-800",               "strength", "BicepsFlexed", "Five adventures of sustained physical grind. Never quits."),
  skill("spidey-sense",       "Spidey-Sense",        "agility",  "Footprints",   "Five adventures over rock, scree and ridge. Moves where others hesitate."),
  skill("little-mermaid",     "Little Mermaid",      "water",    "Waves",        "Five adventures on or in the water. Strong currents hold no fear."),
  skill("abominable-snowman", "Abominable Snowman",  "altitude", "MountainSnow", "Five high-altitude adventures. The thin air works for you."),
  skill("master-yoda",        "Master Yoda",         "focus",    "ScanEye",      "Five adventures with real exposure. Calm and precise when it counts."),
  skill("john-rambo",         "John Rambo",          "nerve",    "Shield",       "Five remote, self-reliant adventures. No signal, no problem."),
];
const SKILL_IDS = SKILL_BADGES.map((b) => b.id);

// ─── Tier 1 — the pinnacle ───────────────────────────────────────────────────

const PINNACLE: Achievement[] = [
  {
    id: "one-above-all", name: "The One Above All", icon: "Crown", tier: "tier1",
    description: "Every single-skill badge earned. The complete adventurer — nothing is out of reach.",
    rule: { kind: "badges", ids: SKILL_IDS, need: SKILL_IDS.length, hint: "Earn all 8 single-skill badges" },
  },
  {
    id: "over-9000", name: "It's Over 9000!", icon: "Gauge", tier: "tier1",
    description: "Every XP source maxed out. The scouter can't even measure this power level.",
    rule: { kind: "xp", need: MAX_XP },
  },
  {
    id: "the-mad-titan", name: "The Mad Titan", icon: "Award", tier: "tier1",
    description: "Four single-skill badges. A rare all-rounder with no weak terrain.",
    rule: { kind: "badges", ids: SKILL_IDS, need: 4, hint: "Earn any 4 single-skill badges" },
  },
];

// ─── Tier 2 — domain masters ─────────────────────────────────────────────────

const pair = (id: string, name: string, icon: string, a: string, b: string, description: string): Achievement => {
  const names = [a, b].map((x) => SKILL_BADGES.find((s) => s.id === x)!.name);
  return { id, name, icon, description, tier: "tier2", rule: { kind: "badges", ids: [a, b], need: 2, hint: `Earn ${names[0]} and ${names[1]}` } };
};

const DOMAIN: Achievement[] = [
  pair("incredible-hulk", "Incredible Hulk", "Zap",     "run-forrest-run", "rhino-beetle",       "Endurance and power, both proven. An unstoppable force."),
  pair("iron-sherpa",     "Iron Sherpa",     "Pickaxe", "t-800",           "spidey-sense",       "Strength and agility, both proven. Total command over any terrain."),
  pair("avatar-state",    "Avatar State",    "Wind",    "little-mermaid",  "abominable-snowman", "Water and altitude, both proven. Rides above the clouds and commands the current."),
  pair("awakened-buddha", "Awakened Buddha", "Brain",   "master-yoda",     "john-rambo",         "Focus and nerve, both proven. An unbreakable mind forged in the wild."),
  { id: "indiana-jones",     name: "Indiana Jones",     icon: "Globe",        tier: "tier2", description: "25 adventures logged. A legend of the field — hat and whip optional.", rule: { kind: "count", stat: "completed", need: 25 } },
  { id: "lara-croft",        name: "Lara Croft",        icon: "Medal",        tier: "tier2", description: "10 adventures logged. A seasoned explorer with stories to match.",      rule: { kind: "count", stat: "completed", need: 10 } },
  { id: "marco-polo",        name: "Marco Polo",        icon: "Route",        tier: "tier2", description: "Adventures in 6 regions. The map keeps getting bigger.",                rule: { kind: "count", stat: "regions", need: 6 } },
  { id: "gordon-ramsayd",    name: "Gordon Ramsay'd",   icon: "ChefHat",      tier: "tier2", description: "10 reviews written. The community reads your every word.",             rule: { kind: "count", stat: "reviews", need: 10 } },
  { id: "nolan-vision",      name: "Nolan Vision",      icon: "Clapperboard", tier: "tier2", description: "20 adventure photos uploaded. Your feed is the envy of the community.", rule: { kind: "count", stat: "photos", need: 20 } },
];

// ─── Tier 3 — expedition badges: skills, first steps, collections, secrets ──

const EXPEDITION: Achievement[] = [
  ...SKILL_BADGES,
  { id: "first-blood",     name: "First Blood",       icon: "CheckCircle2", tier: "tier3", description: "Your very first adventure logged. Every legend starts somewhere.",   rule: { kind: "count", stat: "completed", need: 1 } },
  { id: "bilbo-baggins",   name: "Bilbo Baggins",     icon: "Backpack",     tier: "tier3", description: "5 adventures logged. You went on an adventure — and kept going.",     rule: { kind: "count", stat: "completed", need: 5 } },
  { id: "dora-explorer",   name: "Dora the Explorer", icon: "Map",          tier: "tier3", description: "Adventures in 3 regions. ¡Vámonos!",                                   rule: { kind: "count", stat: "regions", need: 3 } },
  { id: "swiss-army-knife", name: "Swiss Army Knife", icon: "Wrench",       tier: "tier3", description: "A trek, a ride, a cycle and a climb. A tool for every terrain.",           rule: { kind: "flag", flag: "allTypes", hint: "Log one each of Trekking, Motorcycling, Cycling and Mountaineering" } },
  { id: "leap-of-faith",   name: "Leap of Faith",     icon: "Flame",        tier: "tier3", description: "Your first Extreme adventure. No turning back now.",                  rule: { kind: "flag", flag: "extreme", hint: "Log an Extreme adventure" } },
  { id: "window-shopper",  name: "Window Shopper",    icon: "Compass",      tier: "tier3", description: "First adventure wishlisted. The dreaming has begun.",                 rule: { kind: "count", stat: "wishlisted", need: 1 } },
  { id: "dream-collector", name: "Dream Collector",   icon: "Heart",        tier: "tier3", description: "10 adventures wishlisted. The bucket list is getting serious.",       rule: { kind: "count", stat: "wishlisted", need: 10 } },
  { id: "rotten-tomato",   name: "Rotten Tomato",     icon: "Star",         tier: "tier3", description: "Your first review. Your voice shapes the adventure community.",      rule: { kind: "count", stat: "reviews", need: 1 } },
  { id: "gossip-girl",     name: "Gossip Girl",       icon: "PenLine",      tier: "tier3", description: "5 reviews written. Everyone reads what you post. XOXO.",              rule: { kind: "count", stat: "reviews", need: 5 } },
  { id: "shutter-bug",     name: "Shutter Bug",       icon: "Camera",       tier: "tier3", description: "Your first adventure photo. Every adventure deserves proof.",         rule: { kind: "count", stat: "photos", need: 1 } },
  { id: "peter-parker",    name: "Peter Parker",      icon: "Aperture",     tier: "tier3", description: "5 adventure photos. The Daily Bugle would like a word.",              rule: { kind: "count", stat: "photos", need: 5 } },
  { id: "singin-in-the-rain", name: "Singin' in the Rain", icon: "CloudRain", tier: "tier3", secret: true, description: "An adventure in the monsoon, July or August. Just singin' in the rain.", rule: { kind: "flag", flag: "monsoon", hint: "Log an adventure done in July or August" } },
  { id: "frozen",          name: "Frozen",            icon: "Snowflake",    tier: "tier3", secret: true, description: "An adventure in the depths of winter. The cold never bothered you anyway.", rule: { kind: "flag", flag: "winter", hint: "Log an adventure done in December, January or February" } },
  { id: "dark-knight",     name: "The Dark Knight",   icon: "Moon",         tier: "tier3", secret: true, description: "Logged an adventure between midnight and 4am. The night is darkest just before the dawn.", rule: { kind: "flag", flag: "nightOwl", hint: "Log an adventure between midnight and 4am" } },
  { id: "groundhog-day",   name: "Groundhog Day",     icon: "Repeat",       tier: "tier3", secret: true, description: "Wishlisted an adventure you've already done. Once wasn't enough.", rule: { kind: "flag", flag: "groundhog", hint: "Wishlist an adventure you've already done" } },
  { id: "back-to-the-future", name: "Back to the Future", icon: "History", tier: "tier3", secret: true, description: "Logged an adventure from five or more years ago. Great Scott!", rule: { kind: "flag", flag: "throwback", hint: "Log an adventure you did 5 or more years ago" } },
  { id: "fast-and-furious", name: "Fast & Furious",   icon: "FastForward",  tier: "tier3", secret: true, description: "Three adventures in a single month. Family, and a very full calendar.", rule: { kind: "flag", flag: "busyMonth", hint: "Log 3 adventures done in the same month" } },
];

/** Every badge, rarest tier first */
export const ALL_BADGES: Achievement[] = [...PINNACLE, ...DOMAIN, ...EXPEDITION];

/** What a badge looks like to someone — a secret one stays "???" until they earn it */
export function badgeFace(b: Achievement, earned: boolean): Achievement {
  return b.secret && !earned ? { ...b, name: "???", icon: "Secret", description: "A secret badge. Keep exploring and you'll stumble on it." } : b;
}

// ─── What someone has done ───────────────────────────────────────────────────

export interface EngagementStats {
  completed?: number;
  reviews?: number;
  wishlisted?: number;
  photos?: number;
  /** The adventures they've logged, with the date they did each */
  trips?: { slug: string; date: string }[];
  /** Slugs on their wishlist */
  wishlist?: string[];
  /** When they logged each trip on the site (ISO times) */
  loggedAt?: string[];
}

interface Facts {
  totalXP: number;
  counts: Record<Stat, number>;
  skill: Record<keyof ACE, number>;
  flags: Record<Flag, boolean>;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function countBy(keys: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
}

/** How many adventures on the site count toward each skill badge — a skill badge is only
 *  reachable once there are enough of them */
const SKILL_AVAILABLE = Object.fromEntries(
  (Object.keys(AXIS_NAME) as (keyof ACE)[]).map((ax) => [ax, adventures.filter((a) => getACE(a)[ax] >= SKILL_MIN).length]),
) as Record<keyof ACE, number>;

function factsOf(totalXP: number, e: EngagementStats): Facts {
  const seen = new Set<string>();
  const logged = (e.trips ?? []).flatMap((t) => {
    const adv = adventures.find((a) => a.slug === t.slug);
    if (!adv || seen.has(adv.slug)) return [];
    seen.add(adv.slug);
    return [{ adv, ace: getACE(adv), date: t.date ?? "", month: Number(t.date?.slice(5, 7)) }];
  });

  const skill = Object.fromEntries((Object.keys(AXIS_NAME) as (keyof ACE)[]).map((ax) => [ax, logged.filter((l) => l.ace[ax] >= SKILL_MIN).length])) as Record<keyof ACE, number>;
  const perState = new Map<string, number>();
  for (const l of logged) perState.set(l.adv.state, (perState.get(l.adv.state) ?? 0) + 1);
  const types = new Set(logged.map((l) => l.adv.type));

  return {
    totalXP,
    counts: {
      completed: e.completed ?? logged.length,
      reviews: e.reviews ?? 0,
      photos: e.photos ?? 0,
      wishlisted: e.wishlisted ?? 0,
      regions: perState.size,
    },
    skill,
    flags: {
      allTypes: ALL_ROUNDER_TYPES.every((t) => types.has(t)),
      extreme: logged.some((l) => computeDifficulty(l.ace) === "Extreme"),
      monsoon: logged.some((l) => l.month === 7 || l.month === 8),
      winter: logged.some((l) => l.month === 12 || l.month === 1 || l.month === 2),
      // Logged on the site between midnight and 4am India time
      nightOwl: (e.loggedAt ?? []).some((at) => { const h = new Date(Date.parse(at) + IST_OFFSET_MS).getUTCHours(); return h < 4; }),
      groundhog: (e.wishlist ?? []).some((slug) => seen.has(slug)),
      throwback: logged.some((l) => l.date && Date.now() - Date.parse(l.date) >= 5 * 365.25 * DAY_MS),
      busyMonth: [...countBy(logged.map((l) => l.date.slice(0, 7)).filter(Boolean)).values()].some((n) => n >= 3),
    },
  };
}

// ─── Progress, and from it who has what ──────────────────────────────────────

export interface BadgeProgress {
  /** How to unlock it, in a few words */
  hint: string;
  have: number;
  need: number;
}

const COUNT_HINT: Record<Stat, (n: number) => string> = {
  completed:  (n) => (n === 1 ? "Log your first adventure" : `Log ${n} adventures`),
  reviews:    (n) => (n === 1 ? "Write your first review" : `Write ${n} reviews`),
  photos:     (n) => (n === 1 ? "Upload your first adventure photo" : `Upload ${n} adventure photos`),
  wishlisted: (n) => (n === 1 ? "Wishlist an adventure" : `Wishlist ${n} adventures`),
  regions:    (n) => `Log adventures in ${n} regions`,
};

/** Can anyone earn this with the adventures on the site today? */
function reachable(b: Achievement): boolean {
  const r = b.rule;
  if (r.kind === "skill") return SKILL_AVAILABLE[r.axis] >= r.need;
  if (r.kind === "badges") return r.ids.filter((id) => reachable(ALL_BADGES.find((x) => x.id === id)!)).length >= r.need;
  return true;
}

function progressWith(b: Achievement, f: Facts, earned: Set<string>): BadgeProgress {
  const r = b.rule;
  switch (r.kind) {
    case "skill": {
      const soon = reachable(b) ? "" : " · more coming soon";
      return { hint: `Log ${r.need} adventures rated ${SKILL_MIN}+ for ${AXIS_NAME[r.axis]}${soon}`, have: Math.min(f.skill[r.axis], r.need), need: r.need };
    }
    case "badges":
      return { hint: r.hint, have: Math.min(r.ids.filter((id) => earned.has(id)).length, r.need), need: r.need };
    case "count":
      return { hint: COUNT_HINT[r.stat](r.need), have: Math.min(f.counts[r.stat], r.need), need: r.need };
    case "xp":
      return { hint: `Max out every XP source (${r.need.toLocaleString("en-IN")} XP)`, have: Math.min(f.totalXP, r.need), need: r.need };
    case "flag":
      return { hint: r.hint, have: f.flags[r.flag] ? 1 : 0, need: 1 };
  }
}

/** Earned badge ids — badges built from other badges are worked out after those */
function earnedIds(f: Facts): Set<string> {
  const earned = new Set<string>();
  const none = new Set<string>();
  for (const b of ALL_BADGES) if (b.rule.kind !== "badges") {
    const p = progressWith(b, f, none);
    if (p.have >= p.need) earned.add(b.id);
  }
  for (const b of ALL_BADGES) if (b.rule.kind === "badges") {
    const p = progressWith(b, f, earned);
    if (p.have >= p.need) earned.add(b.id);
  }
  return earned;
}

/** Every badge someone has earned, rarest first */
export function getAchievements(totalXP = 0, engagement: EngagementStats = {}): Achievement[] {
  const earned = earnedIds(factsOf(totalXP, engagement));
  return ALL_BADGES.filter((b) => earned.has(b.id));
}

/** How far someone is toward any badge, earned or not — the same rules getAchievements uses */
export function badgeProgress(id: string, totalXP = 0, engagement: EngagementStats = {}): BadgeProgress | null {
  const b = ALL_BADGES.find((x) => x.id === id);
  if (!b) return null;
  const f = factsOf(totalXP, engagement);
  return progressWith(b, f, earnedIds(f));
}

/** The locked badges closest to unlocking — never a secret one, or one the site can't support yet */
export function nextBadges(earnedSet: Set<string>, totalXP = 0, engagement: EngagementStats = {}, count = 3): { badge: Achievement; progress: BadgeProgress }[] {
  const f = factsOf(totalXP, engagement);
  const earned = earnedIds(f);
  return ALL_BADGES
    .filter((b) => !earnedSet.has(b.id) && !b.secret && reachable(b))
    .map((badge) => ({ badge, progress: progressWith(badge, f, earned) }))
    // A first step (first review, first trip) counts as half done; one-off feats like
    // finishing a region are further off than their 0-or-1 progress suggests
    .map((x) => ({ ...x, score: x.progress.need > 1 ? x.progress.have / x.progress.need : x.badge.rule.kind === "count" ? 0.5 : 0.2 }))
    .sort((a, b) => b.score - a.score || a.progress.need - b.progress.need)
    .slice(0, count)
    .map(({ badge, progress }) => ({ badge, progress }));
}
