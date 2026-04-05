import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// One-time setup endpoint: POST /api/setup-operator-tables
// Creates operator_profiles and operator_submissions tables via raw SQL
export async function POST() {
  const adminClient = await createAdminClient();

  const sql = `
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
  `;

  const { error } = await adminClient.rpc("exec_sql", { query: sql });

  if (error) {
    // Try direct table creation via insert into information_schema check
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
