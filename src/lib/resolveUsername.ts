import type { SupabaseClient } from "@supabase/supabase-js";

// Safety cap so a bad response can't spin this into an unbounded loop.
const MAX_PAGES = 20; // up to 20,000 users scanned

/**
 * Paginate through auth users to find one whose metadata username matches.
 * Returns null when genuinely not found. Throws if listUsers itself fails,
 * so callers can fail closed instead of silently treating an API error as
 * "username not taken" / "no such account".
 */
export async function findUserByUsername(
  adminClient: SupabaseClient,
  username: string
): Promise<{ email: string | undefined } | null> {
  const lower = username.toLowerCase();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const match = data.users.find(
      (u) => (u.user_metadata?.username ?? "").toLowerCase() === lower
    );
    if (match) return { email: match.email };

    if (data.users.length < 1000) break;
  }

  return null;
}
