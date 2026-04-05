"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUpOperator(formData: FormData) {
  const adminClient = await createAdminClient();

  const contact_name = formData.get("contact_name") as string;
  const company_name = formData.get("company_name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const website = (formData.get("website") as string) || null;
  const password = formData.get("password") as string;

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  // Create auth user with operator role metadata
  const { data, error: signUpError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: contact_name,
      role: "operator",
      company_name,
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { error: "Failed to create user account." };
  }

  // Insert operator profile row (pending approval)
  const { error: profileError } = await adminClient
    .from("operator_profiles")
    .insert({
      user_id: userId,
      contact_name,
      company_name,
      email,
      phone,
      website,
      status: "pending",
    });

  if (profileError) {
    // Clean up auth user if profile insert fails
    await adminClient.auth.admin.deleteUser(userId);
    return { error: "Failed to create operator profile. Please try again." };
  }

  return {
    success: "Application submitted! Our team will review and approve your account within 24 hours.",
  };
}

export async function submitOperatorUpdate(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const adminClient = await createAdminClient();

  // Verify operator is approved
  const { data: opProfile } = await adminClient
    .from("operator_profiles")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (!opProfile) return { error: "Operator profile not found." };
  if (opProfile.status !== "approved") return { error: "Your account is pending admin approval." };

  const adventure_slug = formData.get("adventure_slug") as string;
  const operator_name = formData.get("operator_name") as string;
  const price_from = formData.get("price_from") as string;
  const exact_dates_raw = formData.get("exact_dates") as string;
  const notes = (formData.get("notes") as string) || null;

  let exact_dates: string[] = [];
  try {
    exact_dates = JSON.parse(exact_dates_raw);
  } catch {
    exact_dates = exact_dates_raw ? [exact_dates_raw] : [];
  }

  const { error } = await adminClient.from("operator_submissions").insert({
    operator_id: opProfile.id,
    adventure_slug,
    operator_name,
    price_from,
    exact_dates,
    notes,
    status: "pending",
  });

  if (error) return { error: error.message };

  return { success: "Update submitted for admin review." };
}

export async function approveOperatorSubmission(submissionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const adminClient = await createAdminClient();

  // Verify admin
  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized." };

  const { data: submission, error: fetchError } = await adminClient
    .from("operator_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) return { error: "Submission not found." };

  // Mark as approved
  await adminClient
    .from("operator_submissions")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", submissionId);

  return { success: "Submission approved." };
}

export async function rejectOperatorSubmission(submissionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const adminClient = await createAdminClient();

  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized." };

  await adminClient
    .from("operator_submissions")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", submissionId);

  return { success: "Submission rejected." };
}

export async function approveOperatorAccount(operatorProfileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const adminClient = await createAdminClient();

  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized." };

  await adminClient
    .from("operator_profiles")
    .update({ status: "approved" })
    .eq("id", operatorProfileId);

  return { success: "Operator account approved." };
}

export async function rejectOperatorAccount(operatorProfileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const adminClient = await createAdminClient();

  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized." };

  await adminClient
    .from("operator_profiles")
    .update({ status: "rejected" })
    .eq("id", operatorProfileId);

  return { success: "Operator account rejected." };
}
