/**
 * XP & Level system for Trail to Tides gamification
 * Stored in localStorage under "ttt_xp"
 */

export interface XPState {
  total: number;
  checkIns: number;
  reviews: number;
  photos: number;
  /** ISO timestamps of each action (for dedup by slug) */
  checkedSlugs: string[];
  reviewedSlugs: string[];
  photoSlugs: string[];
}

export interface Level {
  level: number;
  name: string;
  color: string;
  minXP: number;
  maxXP: number; // exclusive upper bound (or Infinity for last)
}

export const LEVELS: Level[] = [
  { level: 1, name: "Wanderer",       color: "#60a5fa", minXP: 0,    maxXP: 200  },
  { level: 2, name: "Explorer",       color: "#34d399", minXP: 200,  maxXP: 500  },
  { level: 3, name: "Trailblazer",    color: "#f97316", minXP: 500,  maxXP: 1000 },
  { level: 4, name: "Summit Seeker",  color: "#fbbf24", minXP: 1000, maxXP: 2000 },
  { level: 5, name: "Legend",         color: "#e879f9", minXP: 2000, maxXP: Infinity },
];

export const XP_REWARDS = {
  checkIn: 50,
  review: 30,
  photo: 20,
} as const;

const KEY = "ttt_xp";

function defaultState(): XPState {
  return { total: 0, checkIns: 0, reviews: 0, photos: 0, checkedSlugs: [], reviewedSlugs: [], photoSlugs: [] };
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
  const gain = XP_REWARDS.checkIn;
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
  const gain = XP_REWARDS.review;
  state.total += gain;
  state.reviews++;
  state.reviewedSlugs.push(slug);
  saveXP(state);
  return gain;
}

/** Returns XP gained */
export function addPhoto(slug: string): number {
  const state = loadXP();
  const gain = XP_REWARDS.photo;
  state.total += gain;
  state.photos++;
  state.photoSlugs.push(slug);
  saveXP(state);
  return gain;
}
