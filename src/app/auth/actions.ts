"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { callbackLink, safeNext } from "@/lib/authLinks";
import { rateLimit } from "@/lib/rateLimit";
import { findUserByUsername } from "@/lib/resolveUsername";

const firstName = (full: string) => full.trim().split(/\s+/)[0] || "explorer";

/** Per-IP limit for actions that send email, so a form can't be used to spam inboxes */
async function emailLimit(kind: string) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return rateLimit(`${kind}:${ip}`, 5, 15 * 60 * 1000).allowed;
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  const adminClient = await createAdminClient();

  const full_name = formData.get("full_name") as string;
  const username = (formData.get("username") as string).toLowerCase().trim();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const country_code = formData.get("country_code") as string;
  const phone_number = formData.get("phone") as string;
  const phone = `${country_code}${phone_number.replace(/\s+/g, "")}`;
  const avatar_id_raw = formData.get("avatar_id");
  const avatar_id = avatar_id_raw ? Number(avatar_id_raw) : null;

  // Validate username length
  if (username.length < 3 || username.length > 20) {
    return { error: "Username must be between 3 and 20 characters." };
  }

  // Check username uniqueness across every page of users; if the lookup fails, don't guess
  let taken: boolean;
  try {
    taken = (await findUserByUsername(adminClient, username)) !== null;
  } catch (err) {
    console.error("signup username lookup failed:", err);
    return { error: "Couldn't check that username right now. Please try again." };
  }
  if (taken) {
    return { error: `The username @${username} is already taken. Please choose another.` };
  }

  if (!(await emailLimit("signup"))) return { error: "Too many sign-ups from here. Try again in a few minutes." };
  const next = safeNext(formData.get("next") as string | null, "/");

  // Creates the account unconfirmed and gives us its one-time verification token. Login is
  // refused until the emailed link is opened (see /api/auth/login).
  const { data, error: signUpError } = await adminClient.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: { data: { full_name, username, phone, ...(avatar_id !== null ? { avatar_id } : {}) } },
  });

  if (signUpError || !data?.properties?.hashed_token) {
    if (signUpError && /already|registered|exists/i.test(signUpError.message)) {
      return { error: "There's already an account with this email. Log in, or reset your password." };
    }
    return { error: signUpError?.message ?? "Couldn't create the account. Please try again." };
  }

  const link = await callbackLink(data.properties.hashed_token, "signup", next);
  const sent = await sendVerificationEmail(email, link, firstName(full_name));
  if ("error" in sent) {
    // Don't leave an account nobody can verify: remove it so they can simply try again
    console.error("verification email failed:", sent.error);
    await adminClient.auth.admin.deleteUser(data.user.id);
    return { error: "We couldn't send the verification email. Please try again in a moment." };
  }

  return { success: "Check your inbox", email };
}

/** Login says an account isn't verified yet: send a fresh link (works once, like the first) */
export async function resendVerification(email: string, next?: string) {
  const generic = { success: "If that account still needs verifying, a new link is on its way." };
  if (!email || !(await emailLimit("verify"))) return generic;

  const adminClient = await createAdminClient();
  // A magic link for an unverified account verifies it when opened
  const { data, error } = await adminClient.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data?.properties?.hashed_token || data.user.email_confirmed_at) return generic;

  const link = await callbackLink(data.properties.hashed_token, "magiclink", safeNext(next, "/"));
  const sent = await sendVerificationEmail(email, link, firstName(String(data.user.user_metadata?.full_name ?? "")));
  if ("error" in sent) console.error("verification resend failed:", sent.error);
  return generic;
}


type ActionResult = { success?: string; error?: string; expired?: boolean; email?: string };

export async function resetPassword(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  // Same answer whether or not there's an account, so the form can't be used to check emails
  const success = { success: "If there's an account for that email, a reset link is on its way. It works for 1 hour." };
  if (!email) return { error: "Enter your email." };
  if (!(await emailLimit("reset"))) return { error: "Too many requests. Try again in a few minutes." };

  const adminClient = await createAdminClient();
  const { data, error } = await adminClient.auth.admin.generateLink({ type: "recovery", email });
  if (error || !data?.properties?.hashed_token) return success;

  const link = await callbackLink(data.properties.hashed_token, "recovery", "/auth/reset-password");
  const sent = await sendPasswordResetEmail(email, link);
  if ("error" in sent) {
    console.error("password reset email failed:", sent.error);
    return { error: "We couldn't send the email right now. Please try again in a moment." };
  }
  return success;
}

export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  if (!password || password.length < 8) return { error: "Use at least 8 characters." };

  // The reset link signed them in; without that session the link was old or already used
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "This reset link has expired or was already used. Ask for a new one.", expired: true };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: /different from the old/i.test(error.message) ? "Pick a password you haven't used here before." : error.message };
  }

  return { success: "Password updated. You're signed in." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
