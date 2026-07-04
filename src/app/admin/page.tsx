import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import { getAllOperatorProfiles, getAllOperatorSubmissions } from "@/app/auth/operator-actions";
import { adminGetAllReviews, adminGetAllPhotos } from "./actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  const adminClient = await createAdminClient();

  const [
    { data: profiles },
    { data: messages },
    { data: { users: authUsers } },
  ] = await Promise.all([
    adminClient.from("profiles").select("*").order("created_at", { ascending: false }),
    adminClient.from("contact_messages").select("*").order("created_at", { ascending: false }),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  // Merge auth metadata into profiles (last_sign_in, banned, ace_profile, avatar_id)
  const authMap = new Map((authUsers ?? []).map((u) => [u.id, u]));
  const enrichedProfiles = (profiles ?? []).map((p) => {
    const au = authMap.get(p.id);
    return {
      ...p,
      last_sign_in_at: au?.last_sign_in_at ?? null,
      banned: !!(au?.banned_until && new Date(au.banned_until) > new Date()),
      ace_profile: au?.user_metadata?.ace_profile ?? null,
      avatar_id: au?.user_metadata?.avatar_id ?? null,
    };
  });

  // Operator data from storage buckets
  const [operatorProfiles, operatorSubmissions, { reviews }, { photos }] = await Promise.all([
    getAllOperatorProfiles(),
    getAllOperatorSubmissions(),
    adminGetAllReviews(),
    adminGetAllPhotos(),
  ]);

  // Story submissions from Storage bucket — include file name for status updates
  let storySubmissions: Record<string, unknown>[] = [];
  try {
    const { data: files } = await adminClient.storage
      .from("story-submissions")
      .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

    if (files && files.length > 0) {
      const downloads = await Promise.all(
        files.map(async (file) => {
          const { data } = await adminClient.storage.from("story-submissions").download(file.name);
          if (!data) return null;
          const text = await data.text();
          try { return { ...JSON.parse(text), _fileName: file.name }; } catch { return null; }
        })
      );
      storySubmissions = downloads.filter(Boolean) as Record<string, unknown>[];
      storySubmissions.sort((a, b) =>
        new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
      );
    }

    // Also check story-data/stories/ for submissions that may have been saved there
    // by the old code path (before the fallback was fixed to also save to story-submissions)
    const { data: storyDataFiles } = await adminClient.storage
      .from("story-data")
      .list("stories", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

    if (storyDataFiles && storyDataFiles.length > 0) {
      const existingSlugs = new Set(storySubmissions.map(s => s.slug as string));
      const missing = storyDataFiles.filter(f => f.name.endsWith(".json") && !existingSlugs.has(f.name.replace(".json", "")));
      if (missing.length > 0) {
        const extra = await Promise.all(
          missing.map(async (file) => {
            const { data } = await adminClient.storage.from("story-data").download(`stories/${file.name}`);
            if (!data) return null;
            const text = await data.text();
            try { return { ...JSON.parse(text), _fileName: file.name }; } catch { return null; }
          })
        );
        storySubmissions.push(...extra.filter(Boolean) as Record<string, unknown>[]);
        storySubmissions.sort((a, b) =>
          new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
        );
      }
    }
  } catch {
    // bucket may not exist yet
  }

  return (
    <AdminDashboardClient
      profiles={enrichedProfiles}
      currentUserId={user.id}
      messages={messages ?? []}
      storySubmissions={storySubmissions as never}
      operatorProfiles={operatorProfiles}
      operatorSubmissions={operatorSubmissions}
      operatorTablesExist={true}
      reviews={reviews}
      photos={photos}
    />
  );
}
