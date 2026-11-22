// Server only. A traveller's optional health answers (ACE™ medical flags), kept in the private
// ace_medical table: row security on and no policies, so only the server's service role reads or
// writes it. They used to live in user_metadata, which is copied into the login token and so
// travelled in a cookie with every request; readers still fall back to it until the migration
// (supabase/migrations/20261122010000_private_ace_medical.sql) has moved every account.
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { MedicalFlags } from "./matchmakerQuestions";

const TABLE = "ace_medical";

export async function readMedicalFlags(admin: SupabaseClient, user: User): Promise<MedicalFlags | null> {
  const { data, error } = await admin.from(TABLE).select("flags").eq("user_id", user.id).maybeSingle();
  if (!error && data) return data.flags as MedicalFlags;
  return (user.user_metadata?.ace_medical as MedicalFlags | undefined) ?? null;
}

/** Saves to the table and clears any copy left in the login metadata */
export async function saveMedicalFlags(admin: SupabaseClient, user: User, flags: MedicalFlags): Promise<boolean> {
  const { error } = await admin.from(TABLE).upsert({ user_id: user.id, flags, updated_at: new Date().toISOString() });
  if (error) return false;
  if (user.user_metadata?.ace_medical != null) {
    await admin.auth.admin.updateUserById(user.id, { user_metadata: { ace_medical: null } });
  }
  return true;
}

export async function deleteMedicalFlags(admin: SupabaseClient, user: User): Promise<void> {
  await admin.from(TABLE).delete().eq("user_id", user.id);
  if (user.user_metadata?.ace_medical != null) {
    await admin.auth.admin.updateUserById(user.id, { user_metadata: { ace_medical: null } });
  }
}

/** Which of these accounts have answered the health questions (for the admin list; no answers shown) */
export async function usersWithMedicalFlags(admin: SupabaseClient): Promise<Set<string>> {
  const { data } = await admin.from(TABLE).select("user_id").limit(10000);
  return new Set((data ?? []).map((r) => r.user_id as string));
}
