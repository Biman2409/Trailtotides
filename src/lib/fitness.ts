// Shared fitness-matching helpers used across the Matchmaker, adventure pages, Explore,
// the home page and Compass.AI. Pure functions — no React, safe on server and client.
import type { Adventure } from "@/lib/data";
import { getACE, computeMatchScore, type ACE, type AceAxis } from "@/lib/ace";

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

// ─── Match buckets (same thresholds as the match bar on adventure cards) ─────

export type BucketKey = "ready" | "stretch" | "not-yet";
export interface Bucket { key: BucketKey; label: string; color: string; bg: string }

export function bucketFor(score: number): Bucket {
  if (score >= 80) return { key: "ready", label: "Ready", color: "#10b981", bg: "rgba(16,185,129,0.12)" };
  if (score >= 55) return { key: "stretch", label: "Stretch", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
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
  const everyone = rows.filter((r) => r.min >= 80).sort((x, y) => y.min - x.min);
  const someStretch = rows.filter((r) => r.min >= 55 && r.min < 80).sort((x, y) => y.min - x.min);
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
