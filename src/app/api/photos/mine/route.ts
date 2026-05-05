/**
 * GET /api/photos/mine
 * Returns all photos uploaded by the current authenticated user,
 * each enriched with the adventure's lat/lng for map pinning.
 */

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { adventures } from "@/lib/data";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "adventure-photos";

interface PhotoMeta {
  id: string;
  slug: string;
  user_id: string;
  username: string;
  avatar_id: number | null;
  caption: string;
  url: string;
  path: string;
  created_at: string;
}

async function readIndex(slug: string): Promise<PhotoMeta[]> {
  const { data, error } = await admin.storage
    .from(BUCKET)
    .download(`${slug}/_index.json`);
  if (error || !data) return [];
  try {
    const text = await data.text();
    return JSON.parse(text) as PhotoMeta[];
  } catch {
    return [];
  }
}

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Fetch indexes for all adventures in parallel (batched to avoid overload)
    const slugs = adventures.map(a => a.slug);
    const BATCH = 8;
    const photos: (PhotoMeta & { lat: number; lng: number; adventureName: string })[] = [];

    for (let i = 0; i < slugs.length; i += BATCH) {
      const batch = slugs.slice(i, i + BATCH);
      const results = await Promise.all(batch.map(readIndex));
      results.forEach((list, j) => {
        const slug = batch[j];
        const adv = adventures.find(a => a.slug === slug);
        if (!adv) return;
        const mine = list.filter(p => p.user_id === user.id);
        mine.forEach(photo => {
          photos.push({ ...photo, lat: adv.lat, lng: adv.lng, adventureName: adv.name });
        });
      });
    }

    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
