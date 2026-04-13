"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

function adminAuth() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function banUser(userId: string) {
  const admin = adminAuth();
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "876600h" }); // ~100 years
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function unbanUser(userId: string) {
  const admin = adminAuth();
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function sendPasswordReset(email: string) {
  const admin = adminAuth();
  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteMessage(messageId: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", messageId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function updateStoryStatus(fileName: string, status: "approved" | "rejected") {
  const supabase = await createAdminClient();
  // Download existing file
  const { data, error: dlErr } = await supabase.storage.from("story-submissions").download(fileName);
  if (dlErr || !data) return { error: dlErr?.message ?? "Download failed" };
  const text = await data.text();
  const json = JSON.parse(text);
  json.status = status;
  // Re-upload with updated status
  const { error: upErr } = await supabase.storage
    .from("story-submissions")
    .upload(fileName, new Blob([JSON.stringify(json, null, 2)], { type: "application/json" }), {
      upsert: true, contentType: "application/json",
    });
  if (upErr) return { error: upErr.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteStory(fileName: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.storage.from("story-submissions").remove([fileName]);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function adminGetAllReviews() {
  const admin = adminAuth();
  const { data, error } = await admin
    .from("reviews")
    .select("id, adventure_slug, username, rating, body, created_at, user_id")
    .order("created_at", { ascending: false });
  if (error) return { reviews: [], error: error.message };
  return { reviews: data ?? [] };
}

export async function adminDeleteReview(reviewId: string) {
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
