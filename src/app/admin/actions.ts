"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

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
