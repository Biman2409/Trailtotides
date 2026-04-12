import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/setup-photos-table — one-time setup for adventure_photos table + storage bucket
export async function POST() {
  const admin = await createAdminClient();

  // Create table
  const { error: tableError } = await admin.rpc("exec_sql", {
    query: `
      CREATE TABLE IF NOT EXISTS public.adventure_photos (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        slug text NOT NULL,
        user_id uuid NOT NULL,
        username text NOT NULL,
        avatar_id int,
        caption text DEFAULT '',
        url text NOT NULL,
        path text NOT NULL,
        created_at timestamptz DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_adventure_photos_slug ON public.adventure_photos(slug);
      ALTER TABLE public.adventure_photos ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public read" ON public.adventure_photos;
      CREATE POLICY "Public read" ON public.adventure_photos FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Auth insert" ON public.adventure_photos;
      CREATE POLICY "Auth insert" ON public.adventure_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
      DROP POLICY IF EXISTS "Own delete" ON public.adventure_photos;
      CREATE POLICY "Own delete" ON public.adventure_photos FOR DELETE USING (auth.uid() = user_id);
    `,
  });

  // Create storage bucket
  const { data: buckets } = await admin.storage.listBuckets();
  let bucketError = null;
  if (!buckets?.find((b) => b.name === "adventure-photos")) {
    const { error } = await admin.storage.createBucket("adventure-photos", {
      public: true,
      fileSizeLimit: 8 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    });
    bucketError = error;
  }

  if (tableError) return NextResponse.json({ error: tableError.message }, { status: 500 });
  if (bucketError) return NextResponse.json({ error: (bucketError as Error).message }, { status: 500 });

  return NextResponse.json({ success: true });
}
