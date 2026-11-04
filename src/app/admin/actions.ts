"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/authz";

function adminAuth() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function updateUserRole(userId: string, role: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from("profiles").update({ role }).eq("id", userId).select("id");
  if (error) return { error: error.message };
  // Roles live on the profile row; an account without one has nothing to update
  if (!data?.length) return { error: "This account has no profile row, so its role can't be changed here." };
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const supabase = await createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  // "user_not_found" means the auth user is already gone (e.g. a leftover
  // orphaned profile row from a previous partial delete) — still clean up
  // the profile row in that case so deletes are idempotent. Any other error
  // is a real failure, so bail out without touching profiles.
  if (error && error.code !== "user_not_found") return { error: error.message };
  // auth.users has no cascade into profiles — clean it up explicitly so
  // deleted accounts don't leave an orphaned row behind.
  await supabase.from("profiles").delete().eq("id", userId);
  revalidatePath("/admin");
  return { success: true };
}

export async function banUser(userId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const admin = adminAuth();
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "876600h" }); // ~100 years
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function unbanUser(userId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const admin = adminAuth();
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function sendPasswordReset(email: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const admin = adminAuth();
  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteMessage(messageId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const supabase = await createAdminClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", messageId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function updateStoryStatus(id: string, status: "approved" | "rejected") {
  const authError = await requireAdmin();
  if (authError) return authError;
  const supabase = await createAdminClient();
  // The `stories` table has a CHECK constraint allowing only
  // 'published' | 'draft' | 'pending' — "draft" stands in for "rejected".
  const targetStatus = status === "approved" ? "published" : "draft";

  const { data, error } = await supabase
    .from("stories")
    .update({ status: targetStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };

  // Best-effort mirror to story-data bucket, purely as an extra fallback for
  // getPublishedStories() if the DB table is ever unreachable — the DB row
  // above is the actual source of truth.
  if (status === "approved" && data) {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(b => b.name === "story-data")) {
        await supabase.storage.createBucket("story-data", { public: false });
      }
      const bytes = new TextEncoder().encode(JSON.stringify(data));
      await supabase.storage.from("story-data").upload(`stories/${data.slug}.json`, bytes, {
        contentType: "application/json",
        upsert: true,
      });
    } catch (e) {
      console.error("Failed to mirror story to story-data bucket:", e);
    }
  }
  // A story taken down after approval must leave the fallback copy too
  if (status === "rejected" && data) {
    await supabase.storage.from("story-data").remove([`stories/${data.slug}.json`]).catch(() => {});
  }

  revalidatePath("/admin");
  revalidatePath("/stories");
  return { success: true };
}

export async function deleteStory(id: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const supabase = await createAdminClient();
  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function adminGetAllReviews() {
  const authError = await requireAdmin();
  if (authError) return { reviews: [], error: authError.error };
  const admin = adminAuth();
  const { data, error } = await admin
    .from("reviews")
    .select("id, adventure_slug, username, rating, body, created_at, user_id")
    .order("created_at", { ascending: false });
  if (error) return { reviews: [], error: error.message };
  return { reviews: data ?? [] };
}

export async function adminDeleteReview(reviewId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const admin = adminAuth();
  const { data: deleted, error } = await admin.from("reviews").delete().eq("id", reviewId).select("adventure_slug");
  if (error) return { error: error.message };
  deleted?.forEach((r) => revalidatePath(`/experiences/${r.adventure_slug}`));
  return { success: true };
}

// ── Photos ────────────────────────────────────────────────────────────────────

const PHOTO_BUCKET = "adventure-photos";

interface PhotoMeta {
  id: string;
  slug: string;
  user_id: string;
  username: string;
  avatar_id: number | null;
  caption: string;
  url: string;
  path: string;
  created_at: string;
}

export async function adminGetAllPhotos(): Promise<{ photos: PhotoMeta[] }> {
  const authError = await requireAdmin();
  if (authError) return { photos: [] };
  const admin = adminAuth();
  // List all slug folders
  const { data: folders } = await admin.storage.from(PHOTO_BUCKET).list("", { limit: 200 });
  if (!folders) return { photos: [] };

  const allPhotos: PhotoMeta[] = [];
  await Promise.all(
    folders.map(async (folder) => {
      const { data } = await admin.storage.from(PHOTO_BUCKET).download(`${folder.name}/_index.json`);
      if (!data) return;
      try {
        const text = await data.text();
        const photos = JSON.parse(text) as PhotoMeta[];
        allPhotos.push(...photos);
      } catch {}
    })
  );
  allPhotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return { photos: allPhotos };
}

export async function adminDeletePhoto(photoId: string, slug: string, path: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const admin = adminAuth();
  // Delete the file
  await admin.storage.from(PHOTO_BUCKET).remove([path]);
  // Update the index
  const { data } = await admin.storage.from(PHOTO_BUCKET).download(`${slug}/_index.json`);
  if (data) {
    try {
      const text = await data.text();
      const photos = (JSON.parse(text) as PhotoMeta[]).filter(p => p.id !== photoId);
      const bytes = new TextEncoder().encode(JSON.stringify(photos));
      await admin.storage.from(PHOTO_BUCKET).upload(`${slug}/_index.json`, bytes, {
        contentType: "application/json", upsert: true,
      });
    } catch {}
  }
  return { success: true };
}


// ── Group Match ────────────────────────────────────────────────────────────────
// Admins see every group (the service role reads past the members-only rules) and can step in:
// reset a leaked invite link, remove someone, or delete a group outright.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AdminGroup = {
  id: string; name: string; code: string; created_at: string; owner_id: string;
  members: { user_id: string; name: string; joined_at: string; updated_at: string; ace_total: number }[];
  picks: { slug: string; added_by: string; created_at: string; yes: number; no: number }[];
};

/** Every group with its members, wishlist and votes; empty when the tables aren't there yet */
export async function adminGetAllGroups(): Promise<{ groups: AdminGroup[] }> {
  const authError = await requireAdmin();
  if (authError) return { groups: [] };
  const supabase = await createAdminClient();
  const [g, m, p, v] = await Promise.all([
    supabase.from("match_groups").select("id, name, invite_code, owner_id, created_at").order("created_at", { ascending: false }),
    supabase.from("match_group_members").select("group_id, user_id, display_name, ace, joined_at, updated_at"),
    supabase.from("match_group_picks").select("group_id, slug, added_by, created_at"),
    supabase.from("match_group_votes").select("group_id, slug, user_id, vote"),
  ]);
  if (g.error || !g.data) return { groups: [] };
  const groups = g.data.map((row) => {
    const members = (m.data ?? []).filter((x) => x.group_id === row.id);
    const seated = new Set(members.map((x) => x.user_id as string));
    const votes = (v.data ?? []).filter((x) => x.group_id === row.id && seated.has(x.user_id as string));
    return {
      id: row.id as string, name: row.name as string, code: row.invite_code as string,
      created_at: row.created_at as string, owner_id: row.owner_id as string,
      members: members
        .map((x) => ({
          user_id: x.user_id as string, name: x.display_name as string,
          joined_at: x.joined_at as string, updated_at: x.updated_at as string,
          ace_total: ((x.ace as number[]) ?? []).reduce((s, n) => s + n, 0),
        }))
        .sort((a, b) => a.joined_at.localeCompare(b.joined_at)),
      picks: (p.data ?? []).filter((x) => x.group_id === row.id).map((x) => ({
        slug: x.slug as string, added_by: x.added_by as string, created_at: x.created_at as string,
        yes: votes.filter((y) => y.slug === x.slug && y.vote === 1).length,
        no: votes.filter((y) => y.slug === x.slug && y.vote === -1).length,
      })).sort((a, b) => b.yes - a.yes || a.no - b.no),
    };
  });
  return { groups };
}

/** A new invite link: the old one stops working, members keep their seats */
export async function adminResetGroupInvite(groupId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!UUID_RE.test(groupId)) return { error: "Group not found." };
  const { randomBytes } = await import("crypto");
  const code = randomBytes(6).toString("hex");
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from("match_groups").update({ invite_code: code }).eq("id", groupId).select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Group not found." };
  revalidatePath("/admin");
  return { success: true, code };
}

/** Takes someone out of a group. If they owned it, the longest-standing member takes over;
 *  if they were the last, the group goes (the database does both) */
export async function adminRemoveGroupMember(groupId: string, userId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!UUID_RE.test(groupId) || !UUID_RE.test(userId)) return { error: "Member not found." };
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from("match_group_members").delete().eq("group_id", groupId).eq("user_id", userId).select("user_id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Member not found." };
  revalidatePath("/admin");
  return { success: true };
}

/** Deletes a group with its members, wishlist and votes */
export async function adminDeleteGroup(groupId: string) {
  const authError = await requireAdmin();
  if (authError) return authError;
  if (!UUID_RE.test(groupId)) return { error: "Group not found." };
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from("match_groups").delete().eq("id", groupId).select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Group not found." };
  revalidatePath("/admin");
  return { success: true };
}
