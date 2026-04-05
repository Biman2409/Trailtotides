import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

type OperatorProfile = {
  id: string;
  user_id: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  website: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type OperatorSubmission = {
  id: string;
  operator_id: string;
  adventure_slug: string;
  operator_name: string;
  price_from: string;
  exact_dates: string[];
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_at: string | null;
  created_at: string;
  operator_profiles?: { company_name: string; contact_name: string; email: string } | null;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Fetch all users using admin client
  const adminClient = await createAdminClient();
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch messages
  const { data: messages } = await adminClient
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch operator profiles (pending/approved/rejected)
  let operatorProfiles: OperatorProfile[] = [];
  let operatorSubmissions: OperatorSubmission[] = [];
  try {
    const { data: opProfiles } = await adminClient
      .from("operator_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    operatorProfiles = (opProfiles ?? []) as OperatorProfile[];

    const { data: opSubs } = await adminClient
      .from("operator_submissions")
      .select("*, operator_profiles(company_name, contact_name, email)")
      .order("created_at", { ascending: false });
    operatorSubmissions = (opSubs ?? []) as unknown as OperatorSubmission[];
  } catch {
    // tables may not exist yet
  }

  // Fetch story submissions from Storage bucket
  let storySubmissions: Record<string, unknown>[] = [];
  try {
    const { data: files } = await adminClient.storage
      .from("story-submissions")
      .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

    if (files && files.length > 0) {
      const downloads = await Promise.all(
        files.map(async (file) => {
          const { data } = await adminClient.storage
            .from("story-submissions")
            .download(file.name);
          if (!data) return null;
          const text = await data.text();
          return JSON.parse(text);
        })
      );
      storySubmissions = downloads.filter(Boolean);
      storySubmissions.sort((a, b) =>
        new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
      );
    }
  } catch {
    // bucket may not exist yet
  }

  return <AdminDashboardClient profiles={profiles ?? []} currentUserId={user.id} messages={messages ?? []} storySubmissions={storySubmissions as never} operatorProfiles={operatorProfiles} operatorSubmissions={operatorSubmissions} />;
}
