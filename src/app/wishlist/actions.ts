"use server";

import { createClient } from "@/lib/supabase/server";

export async function loadWishlist(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlists")
    .select("adventure_slug")
    .eq("user_id", user.id);

  if (error || !data) return [];
  return data.map((row: { adventure_slug: string }) => row.adventure_slug);
}

export async function saveWishlist(slugs: string[]): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Delete all existing entries for this user
  await supabase.from("wishlists").delete().eq("user_id", user.id);

  if (slugs.length === 0) return;

  // Insert new entries
  await supabase.from("wishlists").insert(
    slugs.map((slug) => ({ user_id: user.id, adventure_slug: slug }))
  );
}
