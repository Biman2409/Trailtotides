import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vmpvmjzursbjwkrgulyp.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcHZtanp1cnNiandrcmd1bHlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0NjE2NCwiZXhwIjoyMDg3NjIyMTY0fQ.KPYx4a7tUV9K2PEU1fhkLDYsCzwJPAeX8zBIXRgzR_Q";

// Try using the pg REST endpoint
const sql = `
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
`;

const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
  method: "POST",
  headers: {
    "apikey": SERVICE_KEY,
    "Authorization": `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
  },
  body: JSON.stringify({ query: sql }),
});
console.log("Status:", res.status, await res.text());
