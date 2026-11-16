// Shared fitness-matching helpers used across the Matchmaker, adventure pages, Explore,
// the home page and Compass.AI. Pure functions — no React, safe on server and client.
import type { Adventure } from "@/lib/data";
import { getACE, computeMatchScore, READY_MIN, STRETCH_MIN, type ACE, type AceAxis } from "@/lib/ace";

export const AXES: AceAxis[] = ["stamina", "power", "strength", "agility", "water", "altitude", "focus", "nerve"];

export const AXIS_LABEL: Record<AceAxis, string> = {
  stamina: "Stamina", power: "Power", strength: "Strength", agility: "Agility",
  water: "Water", altitude: "Altitude", focus: "Focus", nerve: "Nerve",
};

export const TRAINING_TIPS: Record<AceAxis, string> = {
  stamina:  "Build aerobic base with 3–4 weekly runs or hikes. Progress to back-to-back long days.",
  power:    "Add interval training and steep hill repeats to develop explosive leg power.",
  strength: "Weighted step-ups, squats and loaded carries will develop the strength needed.",
  agility:  "Practice trail running on technical terrain; add balance and proprioception drills.",
  water:    "Swim 2–3 times a week. Progress from pool to open water, then moving water.",
  altitude: "Spend nights above 3,000m before attempting higher objectives. Acclimatise gradually.",
  focus:    "Exposure therapy on smaller heights — via ferrata and scrambling routes build tolerance.",
  nerve:    "Build comfort in remote settings — overnight solo trips and wilderness navigation without phone support.",
};

/**
 * What reaching each level takes, per axis: index 0 is the step to level 2, index 3 the step to
 * level 5. General preparation guidance, not a medical or coaching prescription.
 */
const TRAINING_STEPS: Record<AceAxis, [string, string, string, string]> = {
  stamina: [
    "Walk 45–60 minutes, 3–4 times a week, until a 10 km walk feels easy.",
    "Build to a 4–5 hour hike with a light daypack, with one long walk every week.",
    "Do back-to-back long days: two 6-hour hikes on consecutive days, carrying 8–10 kg.",
    "Train for multi-day load: 3 consecutive long days with 12+ kg and 1,000 m of climbing each, several times before the trip.",
  ],
  power: [
    "Climb stairs or a steep hill for 15–20 minutes without stopping, twice a week.",
    "Add hill repeats: 6–8 hard uphill efforts of 1–2 minutes, walking down to recover.",
    "Do weekly stair or hill intervals with an 8–10 kg pack, plus step-ups and lunges.",
    "Sustain steep climbs with a heavy pack: 600–800 m of ascent in under 2 hours, repeated in training.",
  ],
  strength: [
    "Start bodyweight squats, lunges and planks twice a week.",
    "Add step-ups and loaded carries (5–8 kg) for legs, back and core.",
    "Train with weights 2–3 times a week: squats, deadlifts, step-ups and carries with 10–15 kg.",
    "Carry 15–20 kg over rough ground for hours; add pull and grip work for scrambling and fixed ropes.",
  ],
  agility: [
    "Practise single-leg balance and walk on uneven paths and trails.",
    "Hike rocky, rooty trails regularly; add lateral hops and balance drills.",
    "Move on boulders, scree and steep descents with poles; practise downhill control with a pack.",
    "Get guided practice on technical ground: scrambling, snow and ice travel with microspikes or crampons.",
  ],
  water: [
    "Get comfortable in water: float, tread water and put your face in.",
    "Swim 200 m without stopping, in a pool.",
    "Swim in open water (lake or sea) and practise staying calm if you fall in.",
    "Train for moving water: swiftwater or rescue skills with a qualified instructor.",
  ],
  altitude: [
    "Spend a weekend at 2,000–2,500 m and notice how your body responds.",
    "Do an easy trek that sleeps around 3,000 m before going higher.",
    "Complete a trek that sleeps at 3,500–4,000 m on a gradual, well-acclimatised itinerary.",
    "Have prior nights above 4,500 m before aiming at 5,000 m+. Altitude can't be trained at home; experience and a slow ascent are what count.",
  ],
  focus: [
    "Walk exposed but safe paths (ridgelines with railings, wide cliff paths) to get used to drops.",
    "Do short scrambles and narrow trail sections with a guide or experienced friend.",
    "Do via ferrata or longer scrambles where a slip matters, and keep concentration for hours.",
    "Get technical training (rope work, glacier travel) and practise sustained, careful movement on exposed ground.",
  ],
  nerve: [
    "Spend a night outdoors at an organised campsite.",
    "Do an overnight trek away from roads with a group.",
    "Do multi-day treks with no phone signal, learning basic navigation and first aid.",
    "Do remote expeditions where help is days away; take a wilderness first-aid course and practise self-reliance.",
  ],
};

/**
 * The next concrete step for one capability, from where someone is towards what they need:
 * the step to the next level, since levels are built one at a time.
 */
export function trainingTip(axis: AceAxis, from: number, to?: number): string {
  const next = Math.min(5, Math.max(2, Math.floor(from) + 1));
  if (to !== undefined && to <= from) return TRAINING_TIPS[axis];
  return TRAINING_STEPS[axis][next - 2];
}

// ─── Match buckets (same thresholds as the match bar on adventure cards) ─────

export type BucketKey = "ready" | "stretch" | "not-yet";
export interface Bucket { key: BucketKey; label: string; color: string; bg: string }

export function bucketFor(score: number): Bucket {
  if (score >= READY_MIN) return { key: "ready", label: "Ready", color: "#10b981", bg: "rgba(16,185,129,0.12)" };
  if (score >= STRETCH_MIN) return { key: "stretch", label: "Stretch", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
  return { key: "not-yet", label: "Not yet", color: "#f43f5e", bg: "rgba(244,63,94,0.12)" };
}

export function matchScore(ace: ACE, adventure: Adventure): number {
  return computeMatchScore(ace, getACE(adventure));
}

// ─── Completed trips raise the profile ───────────────────────────────────────

export interface TripCredit { axis: AceAxis; from: number; to: number; adventure: string }

/**
 * Finishing an adventure proves you can handle what it demands, so each axis is lifted to at
 * least that adventure's requirement. Self-reported answers can only be raised, never lowered.
 */
export function creditFromTrips(ace: ACE, completedSlugs: string[], all: Adventure[]): { ace: ACE; credits: TripCredit[] } {
  const out = { ...ace };
  const credits: TripCredit[] = [];
  for (const slug of completedSlugs) {
    const adv = all.find((a) => a.slug === slug);
    if (!adv) continue;
    const req = getACE(adv);
    for (const axis of AXES) {
      if (req[axis] > out[axis]) {
        credits.push({ axis, from: out[axis], to: req[axis], adventure: adv.name });
        out[axis] = req[axis];
      }
    }
  }
  return { ace: out, credits };
}

// ─── Gaps and "train for this" ───────────────────────────────────────────────

export interface Gap { axis: AceAxis; have: number; need: number }

export function gapsFor(ace: ACE, adventure: Adventure): Gap[] {
  const req = getACE(adventure);
  return AXES.filter((ax) => req[ax] > ace[ax])
    .map((ax) => ({ axis: ax, have: ace[ax], need: req[ax] }))
    .sort((x, y) => (y.need - y.have) - (x.need - x.have));
}

export interface NextStep { axis: AceAxis; from: number; to: number; unlocked: number }

/** Each capability's next level and how many adventures it makes "ready", most first, as the
 *  Matchmaker's training focus ranks them. Levels that open nothing are left out. */
export function nextSteps(ace: ACE, all: Adventure[]): NextStep[] {
  const notReady = all.filter((a) => matchScore(ace, a) < READY_MIN);
  return AXES.filter((axis) => ace[axis] < 5)
    .map((axis) => {
      const lifted = { ...ace, [axis]: ace[axis] + 1 };
      return { axis, from: ace[axis], to: ace[axis] + 1, unlocked: notReady.filter((a) => matchScore(lifted, a) >= READY_MIN).length };
    })
    .filter((s) => s.unlocked > 0)
    .sort((x, y) => y.unlocked - x.unlocked);
}

/** The one level up that opens the most. Null when none opens anything. */
export function bestNextStep(ace: ACE, all: Adventure[]): NextStep | null {
  return nextSteps(ace, all)[0] ?? null;
}

/** Rough weeks of steady training to close the gaps — trained in parallel, ~4 weeks per level. */
export function weeksToReady(gaps: Gap[]): number {
  const trainable = gaps.filter((g) => g.axis !== "altitude");
  return Math.max(0, ...trainable.map((g) => (g.need - g.have) * 4));
}

// ─── Freshness ───────────────────────────────────────────────────────────────

export const STALE_AFTER_DAYS = 180;

export function profileAgeDays(updatedAt?: string): number | null {
  if (!updatedAt) return null;
  const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86_400_000);
  return Number.isNaN(days) || days < 0 ? null : days;
}

export function isStale(updatedAt?: string): boolean {
  const d = profileAgeDays(updatedAt);
  return d !== null && d >= STALE_AFTER_DAYS;
}

// ─── Group links ─────────────────────────────────────────────────────────────
// A member is "Name~34232323~k3x9ab": a display name, one digit (1–5) per axis, and a short
// one-way tag derived from the account id, so the same person is recognised (and replaced,
// not duplicated) when they rejoin with a new name or refreshed levels. Only the eight
// capability levels travel in the link — never health answers. Older links without a tag
// still decode.

export interface GroupMember { name: string; ace: ACE; id?: string }

/** A link holds at most this many people; the page stops new joins at the cap. */
export const MAX_GROUP = 8;

/** Where a visitor came from when they left a group link to take the quick match. */
export const PENDING_GROUP_KEY = "ttt_pending_group";

/** Short, non-reversible tag for an account id (FNV-1a, base36). */
export function memberTag(accountId: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < accountId.length; i++) {
    h ^= accountId.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(6, "0").slice(-6);
}

export function decodeMembers(param: string | null): GroupMember[] {
  if (!param) return [];
  return param.split(",").slice(0, MAX_GROUP).flatMap((chunk) => {
    const [rawName, digits, tag] = chunk.split("~");
    if (!digits || !/^[1-5]{8}$/.test(digits)) return [];
    const ace = Object.fromEntries(AXES.map((ax, i) => [ax, Number(digits[i])])) as unknown as ACE;
    let name = "Friend";
    try { name = decodeURIComponent(rawName || "Friend").slice(0, 24); } catch {}
    const id = tag && /^[0-9a-z]{6}$/.test(tag) ? tag : undefined;
    return [{ name, ace, ...(id ? { id } : {}) }];
  });
}

export interface GroupRow {
  adventure: Adventure;
  scores: number[];
  min: number;
  /** Index of the member with the lowest match — the one the group waits on */
  weakest: number;
  /** What that member is short on for this adventure */
  weakestGaps: Gap[];
}

/** Adventures everyone in the group is ready for, plus ones that are a stretch for someone. */
export function groupMatches(members: GroupMember[], all: Adventure[]) {
  const rows: GroupRow[] = all.map((a) => {
    const scores = members.map((m) => matchScore(m.ace, a));
    const min = Math.min(...scores);
    const weakest = scores.indexOf(min);
    return { adventure: a, scores, min, weakest, weakestGaps: gapsFor(members[weakest].ace, a) };
  });
  const everyone = rows.filter((r) => r.min >= READY_MIN).sort((x, y) => y.min - x.min);
  const someStretch = rows.filter((r) => r.min >= STRETCH_MIN && r.min < READY_MIN).sort((x, y) => y.min - x.min);
  return { everyone, someStretch };
}

/**
 * What the group can do together on each capability: the lowest level in the group (a group
 * moves at its slowest), who sets it, and the group average. Shown as the group's own profile.
 */
export function groupFloor(members: GroupMember[]) {
  const floor = {} as ACE, average = {} as ACE;
  const setBy = {} as Record<AceAxis, number[]>;
  for (const ax of AXES) {
    const vals = members.map((m) => m.ace[ax]);
    const min = Math.min(...vals);
    floor[ax] = min;
    average[ax] = vals.reduce((a, b) => a + b, 0) / vals.length;
    setBy[ax] = vals.flatMap((v, i) => (v === min ? [i] : []));
  }
  return { floor, average, setBy };
}
