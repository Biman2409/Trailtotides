import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST() {
  const log: string[] = [];
  try {
    const admin = await createAdminClient();

    // Check if stories table exists
    const { data: existing, error: checkErr } = await admin
      .from("stories")
      .select("slug")
      .limit(1);

    log.push(`Table check - data: ${JSON.stringify(existing)}, error: ${checkErr?.message || "none"}`);

    if (checkErr) {
      log.push("Table does not exist. Run this SQL in Supabase dashboard SQL editor:");
      log.push("https://supabase.com/dashboard/project/vmpvmjzursbjwkrgulyp/sql/new");
      log.push("--- PASTE BELOW ---");
      log.push(MIGRATION_SQL);
      return NextResponse.json({ error: "Table not found", help: log }, { status: 400 });
    }

    log.push(`Found ${existing?.length || 0} existing stories`);

    // Try the seed insert
    const { data: photo } = await admin
      .from("stories")
      .select("slug")
      .eq("slug", "the-night-photi-la-tested-us")
      .maybeSingle();

    if (photo) {
      log.push("Stories already seeded, skipping insert");
      return NextResponse.json({ message: "Already seeded", log });
    }

    // Insert from static data
    const { stories: staticStories } = await import("@/lib/data");
    let inserted = 0;

    for (const s of staticStories) {
      const submittedBy = s.submittedBy && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.submittedBy)
        ? s.submittedBy
        : null;

      const { error: insErr } = await admin.from("stories").insert({
        slug: s.slug,
        title: s.title,
        excerpt: s.excerpt,
        body: "",
        author_name: s.author,
        author_role: s.authorRole || "",
        author_bio: s.authorBio || "",
        author_avatar: s.authorAvatar || "",
        hero_image: s.heroImage,
        read_time: s.readTime,
        tags: s.tags || [],
        region: s.region,
        date: s.date,
        status: "published",
        submitted_by: submittedBy,
      });

      if (insErr) {
        log.push(`Insert error for ${s.slug}: ${insErr.message}`);
      } else {
        log.push(`Inserted ${s.slug}`);
        inserted++;
      }
    }

    log.push(`Done: ${inserted} inserted`);

    // Seed story views
    const { error: viewsErr } = await admin.from("story_views").upsert([
      { slug: "the-night-photi-la-tested-us", views: 342 },
      { slug: "riding-through-a-revolution", views: 156 },
    ], { onConflict: "slug" });

    if (viewsErr) log.push(`Views seed error: ${viewsErr.message}`);
    else log.push("Views seeded");

    return NextResponse.json({ inserted, log });
  } catch (err: any) {
    log.push(`Fatal: ${err.message}`);
    return NextResponse.json({ error: err.message, log }, { status: 500 });
  }
}

const MIGRATION_SQL = `CREATE TABLE IF NOT EXISTS public.stories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL,
  body text NOT NULL DEFAULT '',
  author_name text NOT NULL,
  author_role text NOT NULL DEFAULT '',
  author_bio text DEFAULT '',
  author_avatar text DEFAULT '',
  hero_image text NOT NULL,
  read_time text NOT NULL DEFAULT '5 min read',
  tags text[] DEFAULT '{}',
  region text NOT NULL DEFAULT 'Himalayas',
  date text NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'pending')),
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.story_views (
  slug text NOT NULL PRIMARY KEY,
  views integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read published stories" ON public.stories FOR SELECT USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Auth users can insert stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authors can update own stories" ON public.stories FOR UPDATE USING (auth.uid() = submitted_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Service role full access" ON public.stories FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Anyone can read story views" ON public.story_views FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Service role full access views" ON public.story_views FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;`;