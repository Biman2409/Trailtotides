import pg from "pg";
const { Client } = pg;

const hosts = [
  "aws-0-ap-south-1.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com",
];

for (const host of hosts) {
  for (const port of [5432, 6543]) {
    try {
      const client = new Client({
        host, port,
        database: "postgres",
        user: `postgres.vmpvmjzursbjwkrgulyp`,
        password: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcHZtanp1cnNiandrcmd1bHlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0NjE2NCwiZXhwIjoyMDg3NjIyMTY0fQ.KPYx4a7tUV9K2PEU1fhkLDYsCzwJPAeX8zBIXRgzR_Q",
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      await client.connect();
      console.log(`Connected via ${host}:${port}`);
      await client.query(`CREATE TABLE IF NOT EXISTS public.adventure_photos (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, slug text NOT NULL, user_id uuid NOT NULL, username text NOT NULL, avatar_id int, caption text DEFAULT '', url text NOT NULL, path text NOT NULL, created_at timestamptz DEFAULT now()); CREATE INDEX IF NOT EXISTS idx_adventure_photos_slug ON public.adventure_photos(slug); ALTER TABLE public.adventure_photos ENABLE ROW LEVEL SECURITY;`);
      console.log("✓ Done");
      await client.end();
      process.exit(0);
    } catch(e) {
      console.log(`${host}:${port} — ${e.message}`);
    }
  }
}
