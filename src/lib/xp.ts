/**
 * XP & Level system for Trail to Tides gamification
 * Stored in localStorage under "ttt_xp"
 */

export interface XPState {
  total: number;
  checkIns: number;
  reviews: number;
  photos: number;
  checkedSlugs: string[];
  reviewedSlugs: string[];
  photoSlugs: string[];
  /** ISO date string of last XP-earning action (for streak) */
  lastActionDate?: string;
  /** Current streak in days */
  streak?: number;
}

export interface Level {
  level: number;
  name: string;
  color: string;
  icon: string;
  minXP: number;
  maxXP: number;
  perk: string;
}

export const LEVELS: Level[] = [
  { level: 1, name: "Wanderer",      color: "#60a5fa", icon: "🥾", minXP: 0,    maxXP: 150,       perk: "Begin your journey" },
  { level: 2, name: "Explorer",      color: "#34d399", icon: "🧭", minXP: 150,  maxXP: 400,       perk: "Trailblazer in the making" },
  { level: 3, name: "Trailblazer",   color: "#f97316", icon: "⛰️",  minXP: 400,  maxXP: 900,       perk: "Seasoned adventurer" },
  { level: 4, name: "Summit Seeker", color: "#fbbf24", icon: "🏔️",  minXP: 900,  maxXP: 1800,      perk: "Few summits remain" },
  { level: 5, name: "Legend",        color: "#e879f9", icon: "🌟", minXP: 1800, maxXP: Infinity,   perk: "Your name echoes on the trail" },
];

export const XP_REWARDS = {
  checkIn: 50,
  review:  30,
  photo:   20,
} as const;

const KEY = "ttt_xp";

function defaultState(): XPState {
  return {
    total: 0, checkIns: 0, reviews: 0, photos: 0,
    checkedSlugs: [], reviewedSlugs: [], photoSlugs: [],
    lastActionDate: undefined, streak: 0,
  };
}

export function loadXP(): XPState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function saveXP(state: XPState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

/** Returns { multiplier, newStreak } and updates the streak field */
function applyStreak(state: XPState): { multiplier: number; newStreak: number } {
  const today = new Date().toISOString().slice(0, 10);
  const last = state.lastActionDate;
  let streak = state.streak ?? 0;

  if (!last) {
    streak = 1;
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (last === today) {
      // same day — no change
    } else if (last === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
  }

  state.lastActionDate = today;
  state.streak = streak;

  // Bonus: 1.5× at 3-day streak, 2× at 7-day streak
  const multiplier = streak >= 7 ? 2 : streak >= 3 ? 1.5 : 1;
  return { multiplier, newStreak: streak };
}

export function getCurrentLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(xp: number): Level | null {
  const cur = getCurrentLevel(xp);
  return LEVELS.find(l => l.level === cur.level + 1) ?? null;
}

/** Returns XP gained (0 if already recorded for this slug) */
export function addCheckIn(slug: string): number {
  const state = loadXP();
  if (state.checkedSlugs.includes(slug)) return 0;
  const { multiplier } = applyStreak(state);
  const gain = Math.round(XP_REWARDS.checkIn * multiplier);
  state.total += gain;
  state.checkIns++;
  state.checkedSlugs.push(slug);
  saveXP(state);
  return gain;
}

export function removeCheckIn(slug: string): void {
  const state = loadXP();
  if (!state.checkedSlugs.includes(slug)) return;
  state.total = Math.max(0, state.total - XP_REWARDS.checkIn);
  state.checkIns = Math.max(0, state.checkIns - 1);
  state.checkedSlugs = state.checkedSlugs.filter(s => s !== slug);
  saveXP(state);
}

/** Returns XP gained (0 if already reviewed this slug) */
export function addReview(slug: string): number {
  const state = loadXP();
  if (state.reviewedSlugs.includes(slug)) return 0;
  const { multiplier } = applyStreak(state);
  const gain = Math.round(XP_REWARDS.review * multiplier);
  state.total += gain;
  state.reviews++;
  state.reviewedSlugs.push(slug);
  saveXP(state);
  return gain;
}

/** Returns XP gained */
export function addPhoto(slug: string): number {
  const state = loadXP();
  const { multiplier } = applyStreak(state);
  const gain = Math.round(XP_REWARDS.photo * multiplier);
  state.total += gain;
  state.photos++;
  state.photoSlugs.push(slug);
  saveXP(state);
  return gain;
}
