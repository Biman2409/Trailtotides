"use client";

import { createClient } from "@/lib/supabase/client";

export async function submitMessage(message: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("contact_messages").insert({
    user_id: user.id,
    email: user.email,
    name: profile?.full_name || user.email?.split("@")[0],
    message,
  });

  if (error) throw error;
  return { success: true };
}
