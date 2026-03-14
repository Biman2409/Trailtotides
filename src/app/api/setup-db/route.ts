import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS public.story_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  body text NOT NULL,
  author_name text NOT NULL,
  author_role text,
  author_bio text,
  email text,
  phone text,
  date_of_adventure text,
  region text NOT NULL,
  hero_image_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.story_submissions ENABLE ROW LEVEL SECURITY;

DO $outer$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'story_submissions'
      AND policyname = 'Anyone can submit a story'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can submit a story" ON public.story_submissions FOR INSERT WITH CHECK (true)';
  END IF;
END $outer$;

DO $outer2$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'story_submissions'
      AND policyname = 'Service role can read all submissions'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role can read all submissions" ON public.story_submissions FOR SELECT USING (true)';
  END IF;
END $outer2$;
`;

export async function POST(req: NextRequest) {
  let dbPassword: string | null = null;
  try {
    const body = await req.json();
    dbPassword = body.password || null;
  } catch {}

  const dbUrl = process.env.DATABASE_URL
    || process.env.POSTGRES_URL
    || (dbPassword
      ? `postgresql://postgres.vmpvmjzursbjwkrgulyp:${encodeURIComponent(dbPassword)}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
      : null);

  if (!dbUrl) {
    return NextResponse.json(
      { error: "Provide your Supabase DB password in the request body as { password: '...' }" },
      { status: 400 }
    );
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    await client.query(MIGRATION_SQL);
    await client.end();
    return NextResponse.json({ success: true, message: "story_submissions table created successfully." });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // If connection failed with this region, try other regions
    if (message.includes("Tenant or user not found") && dbPassword) {
      const regions = ["us-east-1", "eu-west-1", "ap-southeast-1", "us-west-1", "eu-central-1"];
      for (const region of regions) {
        const altUrl = `postgresql://postgres.vmpvmjzursbjwkrgulyp:${encodeURIComponent(dbPassword)}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
        const altClient = new Client({ connectionString: altUrl, ssl: { rejectUnauthorized: false } });
        try {
          await altClient.connect();
          await altClient.query(MIGRATION_SQL);
          await altClient.end();
          return NextResponse.json({ success: true, message: `Migration completed via ${region} pooler.` });
        } catch (e2) {
          const m = e2 instanceof Error ? e2.message : String(e2);
          if (!m.includes("Tenant or user not found")) {
            return NextResponse.json({ error: m }, { status: 500 });
          }
        }
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
