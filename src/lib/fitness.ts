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
// A member is "Name~34232323": a display name plus one digit (1–5) per axis. Only the eight
// capability levels travel in the link — never health answers.

export interface GroupMember { name: string; ace: ACE }

/** Where a visitor came from when they left a group link to take the quick match. */
export const PENDING_GROUP_KEY = "ttt_pending_group";

export function encodeMember(m: GroupMember): string {
  const name = m.name.replace(/[~,]/g, " ").trim().slice(0, 24) || "Friend";
  return `${encodeURIComponent(name)}~${AXES.map((ax) => Math.min(5, Math.max(1, Math.round(m.ace[ax])))).join("")}`;
}

export function decodeMembers(param: string | null): GroupMember[] {
  if (!param) return [];
  return param.split(",").slice(0, 8).flatMap((chunk) => {
    const [rawName, digits] = chunk.split("~");
    if (!digits || !/^[1-5]{8}$/.test(digits)) return [];
    const ace = Object.fromEntries(AXES.map((ax, i) => [ax, Number(digits[i])])) as unknown as ACE;
    let name = "Friend";
    try { name = decodeURIComponent(rawName || "Friend").slice(0, 24); } catch {}
    return [{ name, ace }];
  });
}

/** Adventures everyone in the group is ready for, plus ones that are a stretch for someone. */
export function groupMatches(members: GroupMember[], all: Adventure[]) {
  const rows = all.map((a) => {
    const scores = members.map((m) => matchScore(m.ace, a));
    return { adventure: a, scores, min: Math.min(...scores) };
  });
  const everyone = rows.filter((r) => r.min >= 80).sort((x, y) => y.min - x.min);
  const someStretch = rows.filter((r) => r.min >= 55 && r.min < 80).sort((x, y) => y.min - x.min);
  return { everyone, someStretch };
}
