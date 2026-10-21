import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { INVITE_CODE_RE } from "@/lib/matchGroups";

// Same eight axes as /api/ace-profile; the group keeps a whole-number snapshot (1–5) of each.
const level = z.number().min(0).max(5).transform((n) => Math.min(5, Math.max(1, Math.round(n))));
export const aceSchema = z.object({
  stamina: level, power: level, strength: level, agility: level,
  water: level, altitude: level, focus: level, nerve: level,
}).transform((a) => [a.stamina, a.power, a.strength, a.agility, a.water, a.altitude, a.focus, a.nerve]);

const cleanName = (max: number) => z.string().transform((s) => s.replace(/\s+/g, " ").trim().slice(0, max)).pipe(z.string().min(1));
export const displayNameSchema = cleanName(24);
export const groupNameSchema = cleanName(40);

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** The signed-in caller, or a 401 response to return as-is. */
export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) } as const;
  return { supabase, user } as const;
}

export function badCode(code: string) {
  return INVITE_CODE_RE.test(code) ? null : NextResponse.json({ error: "Group not found" }, { status: 404 });
}

/** The group behind a code — only found when the caller is a member (RLS). */
export async function groupIdFor(supabase: Supabase, code: string) {
  const { data } = await supabase.from("match_groups").select("id, owner_id").eq("invite_code", code).maybeSingle();
  return data as { id: string; owner_id: string } | null;
}

export async function readJson(req: Request): Promise<unknown> {
  try { return await req.json(); } catch { return null; }
}
