// The full guide for every kind of adventure, keyed by activity slug and split by element.
// /adventurepedia/activities/[slug] renders it under the at-a-glance facts in lib/activityGuides.
// A test checks every activity has one, and that every internal link in them leads somewhere.
import type { ActivityDetail } from "./types";
import { EARTH } from "./earth";
import { WATER } from "./water";
import { SNOW } from "./snow";
import { AIR } from "./air";

export type { ActivityDetail } from "./types";
export { TRAINING } from "./training";

/** The heading every activity page gives its training section */
export const TRAINING_TITLE = "Where to learn and train";

export const ACTIVITY_DETAILS: Record<string, ActivityDetail> = { ...EARTH, ...WATER, ...SNOW, ...AIR };

export const activityDetail = (slug: string): ActivityDetail | undefined => ACTIVITY_DETAILS[slug];
