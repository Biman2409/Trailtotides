// The files an account leaves in Storage, removed when the account is deleted. Database rows go
// with the account (their foreign keys cascade), but Storage has no such link, so without this a
// deleted person's profile photo, XP history, wishlist, trip log and badges stayed behind.
// Photos shared on adventure pages are left in place: they're listed per adventure, not per
// account, and whether they should go too is a policy decision (the Privacy Policy doesn't say).
import type { SupabaseClient } from "@supabase/supabase-js";

export function accountFiles(userId: string): { bucket: string; paths: string[] }[] {
  return [
    { bucket: "profile-avatars", paths: ["jpg", "png", "webp"].map((e) => `${userId}.${e}`) },
    { bucket: "user-data", paths: [`xp/${userId}.json`, `achievements/${userId}.json`] },
    { bucket: "wishlists", paths: [`${userId}.json`, `triplog-${userId}.json`] },
  ];
}

/** Removes them; a file that was never created is simply skipped. Returns how many were removed. */
export async function deleteAccountFiles(admin: SupabaseClient, userId: string): Promise<number> {
  let removed = 0;
  for (const { bucket, paths } of accountFiles(userId)) {
    const { data } = await admin.storage.from(bucket).remove(paths);
    removed += data?.length ?? 0;
  }
  return removed;
}
