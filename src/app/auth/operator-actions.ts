"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

// ─── Storage-based operator system ───────────────────────────────────────────
// Uses Supabase Storage buckets (operator-profiles, operator-submissions)
// instead of DB tables so no SQL migrations are needed.
// Each operator's profile is a JSON file: operator-profiles/{userId}.json
// Each submission is a JSON file: operator-submissions/{id}.json

export type OperatorProfile = {
  id: string;
  user_id: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  website: string | null;
  status: "approved";
  created_at: string;
};

export type OperatorSubmission = {
  id: string;
  operator_id: string;
  company_name: string;
  adventure_slug: string;
  operator_name: string;
  price_from: string;
  website: string | null;
  exact_dates: string[];
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function readJsonFile(
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
  bucket: string,
  path: string
): Promise<unknown | null> {
  const { data } = await adminClient.storage.from(bucket).download(path);
  if (!data) return null;
  try {
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}

async function writeJsonFile(
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
  bucket: string,
  path: string,
  obj: unknown
): Promise<void> {
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
  await adminClient.storage.from(bucket).upload(path, blob, { upsert: true });
}

async function listAllFiles(
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
  bucket: string
): Promise<{ name: string }[]> {
  const { data } = await adminClient.storage
    .from(bucket)
    .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
  return (data ?? []).filter((f) => f.name.endsWith(".json"));
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getOperatorProfile(userId: string): Promise<OperatorProfile | null> {
  const adminClient = await createAdminClient();
  return readJsonFile(adminClient, "operator-profiles", `${userId}.json`) as Promise<OperatorProfile | null>;
}

export async function getAllOperatorProfiles(): Promise<OperatorProfile[]> {
  const adminClient = await createAdminClient();
  const files = await listAllFiles(adminClient, "operator-profiles");
  const profiles = await Promise.all(
    files.map((f) => readJsonFile(adminClient, "operator-profiles", f.name))
  );
  return profiles.filter(Boolean) as OperatorProfile[];
}

export async function getAllOperatorSubmissions(): Promise<OperatorSubmission[]> {
  const adminClient = await createAdminClient();
  const files = await listAllFiles(adminClient, "operator-submissions");
  const subs = await Promise.all(
    files.map((f) => readJsonFile(adminClient, "operator-submissions", f.name))
  );
  const result = subs.filter(Boolean) as OperatorSubmission[];
  return result.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getSubmissionsForOperator(operatorId: string): Promise<OperatorSubmission[]> {
  const all = await getAllOperatorSubmissions();
  return all.filter((s) => s.operator_id === operatorId);
}

// ─── Server actions ───────────────────────────────────────────────────────────

export async function signUpOperator(formData: FormData) {
  const adminClient = await createAdminClient();

  const contact_name = formData.get("contact_name") as string;
  const company_name = formData.get("company_name") as string;
  const email = formData.get("email") as string;
  const country_code = (formData.get("country_code") as string) || "+91";
  const phone_number = formData.get("phone") as string;
  const phone = `${country_code}${phone_number}`;
  const website = (formData.get("website") as string) || null;
  const password = formData.get("password") as string;

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const { data, error: signUpError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: contact_name, role: "operator", company_name },
  });

  if (signUpError) return { error: signUpError.message };

  const userId = data.user?.id;
  if (!userId) return { error: "Failed to create account." };

  const profile: OperatorProfile = {
    id: userId,
    user_id: userId,
    contact_name,
    company_name,
    email,
    phone,
    website,
    status: "approved",
    created_at: new Date().toISOString(),
  };

  await writeJsonFile(adminClient, "operator-profiles", `${userId}.json`, profile);

  return { success: "Account created! You can now log in and start listing adventures." };
}

export async function submitOperatorUpdate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const adminClient = await createAdminClient();
  const profile = await getOperatorProfile(user.id);
  if (!profile) return { error: "Operator profile not found." };

  const adventure_slug = formData.get("adventure_slug") as string;
  const operator_name = formData.get("operator_name") as string;
  const price_from = formData.get("price_from") as string;
  const notes = (formData.get("notes") as string) || null;
  let exact_dates: string[] = [];
  try {
    exact_dates = JSON.parse(formData.get("exact_dates") as string);
  } catch {
    exact_dates = [];
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const submission: OperatorSubmission = {
    id,
    operator_id: user.id,
    company_name: profile.company_name,
    adventure_slug,
    operator_name,
    price_from,
    website: profile.website ?? null,
    exact_dates,
    notes,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  await writeJsonFile(adminClient, "operator-submissions", `${id}.json`, submission);
  return { success: "Update submitted for admin review." };
}

export type LiveOperator = {
  name: string;
  verified: boolean;
  priceFrom: string;
  rating: number;
  website?: string;
  departureDates?: string[];
  notes?: string | null;
};

/**
 * Returns all approved operator submissions for a given adventure slug,
 * shaped as LiveOperator records ready to render on the experience page.
 */
export async function getApprovedOperatorsForAdventure(adventureSlug: string): Promise<LiveOperator[]> {
  const all = await getAllOperatorSubmissions();
  const approved = all.filter(
    (s) => s.adventure_slug === adventureSlug && s.status === "approved"
  );

  const adminClient = await createAdminClient();

  return Promise.all(
    approved.map(async (sub) => {
      // Try to get website from the operator's profile
      const profile = (await readJsonFile(
        adminClient,
        "operator-profiles",
        `${sub.operator_id}.json`
      )) as OperatorProfile | null;

      const priceNum = parseInt(sub.price_from.replace(/[^\d]/g, ""), 10);
      const priceFrom = isNaN(priceNum)
        ? sub.price_from
        : `₹${priceNum.toLocaleString("en-IN")}`;

      return {
        name: sub.operator_name,
        verified: true,
        priceFrom,
        rating: 0,
        website: sub.website ?? profile?.website ?? undefined,
        departureDates: sub.exact_dates ?? [],
        notes: sub.notes,
      } satisfies LiveOperator;
    })
  );
}

export async function updateOperatorSubmission(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const adminClient = await createAdminClient();
  const submissionId = formData.get("submission_id") as string;

  const existing = (await readJsonFile(
    adminClient, "operator-submissions", `${submissionId}.json`
  )) as OperatorSubmission | null;

  if (!existing) return { error: "Submission not found." };
  if (existing.operator_id !== user.id) return { error: "Not authorised." };

  const price_from = formData.get("price_from") as string;
  const notes = (formData.get("notes") as string) || null;
  let exact_dates: string[] = [];
  try { exact_dates = JSON.parse(formData.get("exact_dates") as string); } catch { exact_dates = []; }

  await writeJsonFile(adminClient, "operator-submissions", `${submissionId}.json`, {
    ...existing,
    price_from,
    notes,
    exact_dates,
    status: "pending", // re-submit for review on any edit
  });

  return { success: "Changes submitted for review." };
}

export async function approveOperatorSubmission(submissionId: string) {
  const adminClient = await createAdminClient();
  const sub = (await readJsonFile(
    adminClient,
    "operator-submissions",
    `${submissionId}.json`
  )) as OperatorSubmission | null;
  if (!sub) return { error: "Submission not found." };

  await writeJsonFile(adminClient, "operator-submissions", `${submissionId}.json`, {
    ...sub,
    status: "approved",
  });
  return { success: "Approved." };
}

export async function rejectOperatorSubmission(submissionId: string) {
  const adminClient = await createAdminClient();
  const sub = (await readJsonFile(
    adminClient,
    "operator-submissions",
    `${submissionId}.json`
  )) as OperatorSubmission | null;
  if (!sub) return { error: "Submission not found." };

  await writeJsonFile(adminClient, "operator-submissions", `${submissionId}.json`, {
    ...sub,
    status: "rejected",
  });
  return { success: "Rejected." };
}
