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
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };
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
  const { error } = await admin.from("reviews").delete().eq("id", reviewId);
  if (error) return { error: error.message };
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

// ── XP Reset ──────────────────────────────────────────────────────────────────

export async function adminResetAllXP(): Promise<{ success: boolean; deleted: number; error?: string }> {
  const authError = await requireAdmin();
  if (authError) return { success: false, deleted: 0, error: authError.error };
  const admin = adminAuth();
  const BUCKET = "user-data";

  // List all files under xp/
  const { data: files, error } = await admin.storage.from(BUCKET).list("xp", { limit: 1000 });
  if (error) return { success: false, deleted: 0, error: error.message };
  if (!files || files.length === 0) return { success: true, deleted: 0 };

  const paths = files.map(f => `xp/${f.name}`);
  const { error: removeError } = await admin.storage.from(BUCKET).remove(paths);
  if (removeError) return { success: false, deleted: 0, error: removeError.message };

  return { success: true, deleted: paths.length };
}
