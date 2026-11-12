import type { Metadata } from "next";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import { getAllOperatorProfiles, getAllOperatorSubmissions } from "@/app/auth/operator-actions";
import { adminGetAllReviews, adminGetAllPhotos, adminGetAllGroups } from "./actions";
import { adventures } from "@/lib/data";
import { DESTINATIONS } from "@/lib/destinations";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  const adminClient = await createAdminClient();
  // Counts only: these tables can be big and the dashboard needs totals, not rows
  const count = async (table: string) => {
    const { count: n } = await adminClient.from(table).select("*", { count: "exact", head: true });
    return n ?? 0;
  };
  // Wishlists aren't a table: each account's saves are <user id>.json (a list of slugs) in the
  // "wishlists" bucket, beside triplog-<id>.json files. Total saves = all those lists added up.
  const wishlistSaves = async () => {
    const { data: files } = await adminClient.storage.from("wishlists").list("", { limit: 1000 });
    const owners = (files ?? []).filter((f) => /^[0-9a-f-]{36}\.json$/.test(f.name));
    const sizes = await Promise.all(owners.map(async (f) => {
      const { data } = await adminClient.storage.from("wishlists").download(f.name);
      try { const slugs: unknown = JSON.parse((await data?.text()) ?? "[]"); return Array.isArray(slugs) ? slugs.length : 0; } catch { return 0; }
    }));
    return sizes.reduce((a, b) => a + b, 0);
  };

  const [
    { data: profiles },
    { data: messages },
    { data: { users: authUsers } },
    wishlistCount,
    savedSearchCount,
  ] = await Promise.all([
    adminClient.from("profiles").select("*").order("created_at", { ascending: false }),
    adminClient.from("contact_messages").select("*").order("created_at", { ascending: false }),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
    wishlistSaves(),
    count("saved_searches"),
  ]);

  // Book clicks out to operators in the last 30 days, and the operator that got the most
  const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
  const { data: clickRows } = await adminClient.from("outbound_clicks").select("operator").gte("created_at", since30).limit(10000);
  const byOperator = new Map<string, number>();
  for (const r of clickRows ?? []) byOperator.set(r.operator as string, (byOperator.get(r.operator as string) ?? 0) + 1);
  const topBookOperator = [...byOperator.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Accounts are the source of truth: a profile row outlives a deleted account, and an account
  // can exist without a profile row. Start from the accounts and add profile details where there
  // are some. Auth metadata adds sign-in, ban and ACE state.
  const profileMap = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  const enrichedProfiles = (authUsers ?? [])
    .map((au) => {
      const p = profileMap.get(au.id);
      const ace = au.user_metadata?.ace_profile;
      return {
        id: au.id,
        full_name: (p?.full_name as string | null) ?? (au.user_metadata?.full_name as string | undefined) ?? (au.user_metadata?.name as string | undefined) ?? null,
        phone: (p?.phone as string | null) ?? au.phone ?? null,
        role: (p?.role as string | undefined) ?? "user",
        created_at: (p?.created_at as string | undefined) ?? au.created_at,
        has_profile_row: !!p,
        email: (p?.email as string | null) ?? au.email ?? null,
        last_sign_in_at: au.last_sign_in_at ?? null,
        email_confirmed: !!au.email_confirmed_at,
        banned: !!(au.banned_until && new Date(au.banned_until) > new Date()),
        // Saved flat ({ stamina: 3, ... }) by /api/ace-profile
        ace: ace && typeof ace === "object" ? (ace as Record<string, number>) : null,
        ace_updated_at: (au.user_metadata?.ace_profile_updated_at as string | undefined) ?? null,
        has_health_answers: !!au.user_metadata?.ace_medical,
        avatar_id: au.user_metadata?.avatar_id ?? null,
      };
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  // Operator data from storage buckets
  const [operatorProfiles, operatorSubmissions, { reviews }, { photos }, { groups }] = await Promise.all([
    getAllOperatorProfiles(),
    getAllOperatorSubmissions(),
    adminGetAllReviews(),
    adminGetAllPhotos(),
    adminGetAllGroups(),
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
      reviews={reviews}
      photos={photos}
      groups={groups}
      counts={{ wishlists: wishlistCount, savedSearches: savedSearchCount, adventures: adventures.length, destinations: DESTINATIONS.length, bookClicks30: clickRows?.length ?? 0, topBookOperator }}
      adventureNames={Object.fromEntries(adventures.map((a) => [a.slug, a.name]))}
    />
  );
}
