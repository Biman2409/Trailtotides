import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vmpvmjzursbjwkrgulyp.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcHZtanp1cnNiandrcmd1bHlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0NjE2NCwiZXhwIjoyMDg3NjIyMTY0fQ.KPYx4a7tUV9K2PEU1fhkLDYsCzwJPAeX8zBIXRgzR_Q";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Try to create tables by doing inserts that reveal structure
// First check if tables exist
const { error: checkError } = await admin
  .from("operator_profiles")
  .select("id")
  .limit(1);

if (!checkError) {
  console.log("Tables already exist!");
  process.exit(0);
}

console.log("Tables don't exist yet:", checkError.message);
console.log(
  "\nPlease run this SQL in your Supabase Dashboard > SQL Editor:\n"
);
console.log(`
-- ============================================
-- Operator Auth Tables for Trail to Tides
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.operator_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  company_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  website text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.operator_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id uuid NOT NULL REFERENCES public.operator_profiles(id) ON DELETE CASCADE,
  adventure_slug text NOT NULL,
  operator_name text NOT NULL,
  price_from text NOT NULL,
  exact_dates text[] DEFAULT '{}',
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_submissions ENABLE ROW LEVEL SECURITY;

-- Policies: operators can read/insert their own rows
CREATE POLICY "Operators can view own profile"
  ON public.operator_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Operators can insert profile"
  ON public.operator_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Operators can view own submissions"
  ON public.operator_submissions FOR SELECT
  USING (operator_id IN (SELECT id FROM public.operator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Operators can insert submissions"
  ON public.operator_submissions FOR INSERT
  WITH CHECK (operator_id IN (SELECT id FROM public.operator_profiles WHERE user_id = auth.uid()));

-- Service role bypasses RLS automatically
`);
