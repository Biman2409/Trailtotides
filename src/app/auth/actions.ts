"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, phone },
      emailRedirectTo: undefined, // use OTP flow, not magic link
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect to OTP verify page with email as query param
  redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyOtp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const token = formData.get("token") as string;

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function resendOtp(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "A new code has been sent to your email." };
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
