import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current request's session belongs to an admin, using the
 * cookie-scoped client (not the service-role client) so this reflects who's
 * actually calling right now — Server Actions are independently POST-able
 * by their action reference regardless of which page rendered them, so page-
 * level redirects alone don't protect them. Every admin-only action must
 * call this itself.
 */
export async function requireAdmin(): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") return { error: "Not authorised." };
  return null;
}
