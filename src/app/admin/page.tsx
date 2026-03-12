import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("[admin] getUser error:", userError.message);
    }

    if (!user) redirect("/auth/login");

    // Check if admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[admin] profile error:", profileError.message);
    }

    if (!profile || profile.role !== "admin") {
      redirect("/");
    }

    // Fetch all users using admin client
    const adminClient = await createAdminClient();
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("[admin] profiles fetch error:", profilesError.message);
    }

    // Fetch messages
    const { data: messages, error: messagesError } = await adminClient
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (messagesError) {
      console.error("[admin] messages fetch error:", messagesError.message);
    }

    return <AdminDashboardClient profiles={profiles ?? []} currentUserId={user.id} messages={messages ?? []} />;
  } catch (err: unknown) {
    const isRedirect = err instanceof Error && (err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT");
    if (isRedirect) throw err;
    console.error("[admin] unexpected error:", err);
    throw err;
  }
}
