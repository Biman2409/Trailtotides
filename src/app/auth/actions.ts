"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const full_name = formData.get("full_name") as string;
  const username = (formData.get("username") as string).toLowerCase().trim();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const country_code = formData.get("country_code") as string;
  const phone_number = formData.get("phone") as string;
  const phone = `${country_code}${phone_number.replace(/\s+/g, "")}`;

  // Validate username format
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: "Username must be 3–20 characters: lowercase letters, numbers and _ only." };
  }

  // Check username uniqueness server-side
  const { data: existing } = await adminClient
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return { error: `The username @${username} is already taken. Please choose another.` };
  }

  // Get origin for verification link
  const headersList = await (await import("next/headers")).headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  // Sign up using normal client first
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name,
        username,
        phone,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  // Save username to profiles table
  if (data.user) {
    await adminClient
      .from("profiles")
      .upsert({ id: data.user.id, username, full_name, phone }, { onConflict: "id" });
  }

  // If we have a Resend key, generate a link and send it manually
    if (process.env.RESEND_API_KEY) {
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'signup',
        email: email,
        password: password,
        options: {
          redirectTo: `${origin}/auth/callback`,
        }
      });

    if (!linkError && linkData?.properties?.action_link) {
      await sendVerificationEmail(
        email,
        linkData.properties.action_link,
        full_name
      );
    }
  }

  return { success: "Registration successful! Please check your email to verify your account before logging in." };
}


export async function login(formData: FormData) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const identifier = (formData.get("email") as string).trim();
  const password = formData.get("password") as string;

  let email = identifier;

  // If identifier doesn't look like an email, treat it as a username
  if (!identifier.includes("@")) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("username", identifier.toLowerCase())
      .maybeSingle();

    if (!profile) {
      return { error: "No account found with that username." };
    }

    const { data: userData } = await adminClient.auth.admin.getUserById(profile.id);
    if (!userData?.user?.email) {
      return { error: "Could not resolve account. Please use your email instead." };
    }
    email = userData.user.email;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const email = formData.get("email") as string;

  // Get origin for verification link
  const headersList = await (await import("next/headers")).headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  // If we have Resend, use it for more reliable delivery
  if (process.env.RESEND_API_KEY) {
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
      }
    });

    if (!linkError && linkData?.properties?.action_link) {
      await sendPasswordResetEmail(email, linkData.properties.action_link);
      return { success: "Password reset link sent! Please check your email." };
    }
  }

  // Fallback to Supabase built-in
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset link sent! Please check your email." };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password updated successfully!" };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
