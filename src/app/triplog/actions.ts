"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

const BUCKET = "wishlists"; // reuse same bucket, different file

async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export type TripEntry = { slug: string; date: string; note?: string };

export async function loadTripLog(): Promise<TripEntry[]> {
  const userId = await getAuthUserId();
  if (!userId) return [];
  const admin = await createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).download(`triplog-${userId}.json`);
  if (error || !data) return [];
  try { return JSON.parse(await data.text()) as TripEntry[]; } catch { return []; }
}

export async function saveTripLog(entries: TripEntry[]): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) return;
  const admin = await createAdminClient();
  const blob = new Blob([JSON.stringify(entries)], { type: "application/json" });
  await admin.storage.from(BUCKET).upload(`triplog-${userId}.json`, blob, { upsert: true, contentType: "application/json" });
}
