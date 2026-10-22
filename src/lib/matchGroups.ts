// Stored Group Match groups (tables match_groups / match_group_members — see
// supabase/migrations/20261016000000_create_match_groups.sql). Shapes shared by the API
// routes, the group pages and GroupClient. Pure — safe on server and client.
import type { ACE } from "@/lib/ace";
import { AXES, MAX_GROUP } from "@/lib/fitness";

export { MAX_GROUP };

/** /matchmaker/group/<code> — 12 hex digits */
export const INVITE_CODE_RE = /^[0-9a-f]{12}$/;

export interface StoredMember {
  userId: string;
  name: string;
  ace: ACE;
  joinedAt: string;
  updatedAt: string;
}

export interface StoredGroup {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  createdAt: string;
  members: StoredMember[];
}

/** A group you're in, as listed on /matchmaker/group */
export interface GroupSummary {
  name: string;
  code: string;
  isOwner: boolean;
  memberCount: number;
}

/** What an invite shows before you join: no levels, no other names */
export interface GroupPreview {
  name: string;
  ownerName: string | null;
  memberCount: number;
}

/** The eight levels as stored: whole numbers 1–5 in AXES order */
export function aceToLevels(ace: ACE): number[] {
  return AXES.map((ax) => Math.min(5, Math.max(1, Math.round(ace[ax]))));
}

export function levelsToAce(levels: number[]): ACE {
  return Object.fromEntries(AXES.map((ax, i) => [ax, levels[i] ?? 1])) as unknown as ACE;
}

/** An adventure on the group wishlist, with each current member's vote (1 = I'm in, -1 = not for me) */
export interface GroupPick {
  slug: string;
  addedBy: string;
  createdAt: string;
  votes: Record<string, 1 | -1>;
}
