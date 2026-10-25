import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import { loadUserBadges } from "@/lib/userAchievements";

// GET — how many explorers hold each badge: { total, counts: { [badgeId]: n } }.
// Worked out with the same rules as everyone's own badges, so it can't drift from them,
// and cached for six hours since it reads every account.

const MAX_ACCOUNTS = 2000;
const BATCH = 8;

const rarity = unstable_cache(async () => {
  const admin = await createAdminClient();
  const users: User[] = [];
  for (let page = 1; users.length < MAX_ACCOUNTS; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data.users.length) break;
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }

  const counts: Record<string, number> = {};
  for (let i = 0; i < users.length; i += BATCH) {
    const results = await Promise.all(users.slice(i, i + BATCH).map((u) => loadUserBadges(admin, u).catch(() => null)));
    for (const r of results) r?.earned.forEach((b) => { counts[b.id] = (counts[b.id] ?? 0) + 1; });
  }
  return { total: users.length, counts };
}, ["badge-rarity"], { revalidate: 6 * 60 * 60 });

export async function GET() {
  try {
    return NextResponse.json(await rarity());
  } catch {
    return NextResponse.json({ total: 0, counts: {} });
  }
}
