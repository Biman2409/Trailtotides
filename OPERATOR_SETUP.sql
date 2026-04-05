-- ============================================================
-- Trail to Tides — Operator Auth Tables
-- Run this once in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

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

-- Operators can view and insert their own profile
DO $$ BEGIN
  CREATE POLICY "Operators view own profile"
    ON public.operator_profiles FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Operators insert profile"
    ON public.operator_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Operators can view and insert their own submissions
DO $$ BEGIN
  CREATE POLICY "Operators view own submissions"
    ON public.operator_submissions FOR SELECT
    USING (operator_id IN (
      SELECT id FROM public.operator_profiles WHERE user_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Operators insert submissions"
    ON public.operator_submissions FOR INSERT
    WITH CHECK (operator_id IN (
      SELECT id FROM public.operator_profiles WHERE user_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Service role (used by admin actions) bypasses RLS
DO $$ BEGIN
  CREATE POLICY "Service role full access profiles"
    ON public.operator_profiles FOR ALL TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access submissions"
    ON public.operator_submissions FOR ALL TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Done!
SELECT 'operator_profiles and operator_submissions tables created successfully.' AS result;
