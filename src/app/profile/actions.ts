"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const newUsername = (formData.get("username") as string)?.toLowerCase().trim();
  const newEmail = formData.get("email") as string;

  // Username availability check if changed
  if (newUsername && newUsername !== (user.user_metadata?.username ?? "")) {
    if (newUsername.length < 3 || newUsername.length > 20) {
      throw new Error("Username must be between 3 and 20 characters.");
    }
    const { data: allUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const taken = allUsers?.users.some(
      (u) => u.id !== user.id && (u.user_metadata?.username ?? "").toLowerCase() === newUsername
    );
    if (taken) throw new Error(`@${newUsername} is already taken.`);
  }

  // Update auth user (email + metadata)
  await adminClient.auth.admin.updateUser(user.id, {
    ...(newEmail && newEmail !== user.email ? { email: newEmail, email_confirm: true } : {}),
    user_metadata: {
      ...user.user_metadata,
      full_name: fullName,
      username: newUsername || user.user_metadata?.username,
      phone,
    },
  });

  // Update profiles table
  await supabase.from("profiles").update({
    full_name: fullName,
    phone,
    ...(newUsername ? { username: newUsername } : {}),
    ...(newEmail && newEmail !== user.email ? { email: newEmail } : {}),
    updated_at: new Date().toISOString(),
  }).eq("id", user.id);

  revalidatePath("/profile");
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword) throw new Error("Please enter your current password.");
  if (newPassword.length < 6) throw new Error("New password must be at least 6 characters.");
  if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");

  // Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });
  if (signInError) throw new Error("Current password is incorrect.");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);

  return { success: true };
}
