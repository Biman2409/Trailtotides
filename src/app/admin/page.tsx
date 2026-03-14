import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

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

  return <AdminDashboardClient profiles={profiles ?? []} currentUserId={user.id} messages={messages ?? []} storySubmissions={storySubmissions} />;
}
