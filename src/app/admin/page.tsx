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

  // Story submissions — the `stories` table is the source of truth (it's what
  // both the submit route writes to and the public site reads from).
  let storySubmissions: Record<string, unknown>[] = [];
  try {
    const { data, error } = await adminClient
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) storySubmissions = data;
  } catch {}

  // Legacy fallback: submissions that only ever made it into Storage — either
  // old pre-DB submissions in story-submissions/, or new ones that landed in
  // story-data/stories/ because the `stories` table doesn't exist on this project.
  if (storySubmissions.length === 0) {
    try {
      const fallbackBuckets: { bucket: string; path: string }[] = [
        { bucket: "story-submissions", path: "" },
        { bucket: "story-data", path: "stories" },
      ];
      const collected: Record<string, unknown>[] = [];
      const seenSlugs = new Set<string>();

      for (const { bucket, path } of fallbackBuckets) {
        const { data: files } = await adminClient.storage
          .from(bucket)
          .list(path, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
        if (!files?.length) continue;

        const downloads = await Promise.all(
          files.filter(f => f.name.endsWith(".json")).map(async (file) => {
            const filePath = path ? `${path}/${file.name}` : file.name;
            const { data } = await adminClient.storage.from(bucket).download(filePath);
            if (!data) return null;
            try { return JSON.parse(await data.text()) as Record<string, unknown>; } catch { return null; }
          })
        );
        for (const story of downloads) {
          const slug = story?.slug as string | undefined;
          if (!story || (slug && seenSlugs.has(slug))) continue;
          if (slug) seenSlugs.add(slug);
          collected.push(story);
        }
      }

      storySubmissions = collected.sort((a, b) =>
        new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
      );
    } catch {
      // buckets may not exist yet
    }
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
