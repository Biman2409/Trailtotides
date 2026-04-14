"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

const BUCKET = "wishlists";
const path = (userId: string) => `${userId}.json`;

export async function loadWishlist(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = await createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).download(path(user.id));
  if (error || !data) return [];
  try { return JSON.parse(await data.text()) as string[]; } catch { return []; }
}

export async function saveWishlist(slugs: string[]): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const admin = await createAdminClient();
  const blob = new Blob([JSON.stringify(slugs)], { type: "application/json" });
  await admin.storage.from(BUCKET).upload(path(user.id), blob, { upsert: true, contentType: "application/json" });
}
