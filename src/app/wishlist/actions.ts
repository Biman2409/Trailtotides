"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

const BUCKET = "wishlists";

async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function loadWishlist(): Promise<string[]> {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const admin = await createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).download(`${userId}.json`);
  if (error || !data) return [];

  try {
    const text = await data.text();
    return JSON.parse(text) as string[];
  } catch {
    return [];
  }
}

export async function saveWishlist(slugs: string[]): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) return;

  const admin = await createAdminClient();
  const blob = new Blob([JSON.stringify(slugs)], { type: "application/json" });
  await admin.storage
    .from(BUCKET)
    .upload(`${userId}.json`, blob, { upsert: true, contentType: "application/json" });
}
