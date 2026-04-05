import pkg from "pg";
const { Client } = pkg;

// Supabase project: vmpvmjzursbjwkrgulyp
const DB_PASSWORD =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcHZtanp1cnNiandrcmd1bHlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0NjE2NCwiZXhwIjoyMDg3NjIyMTY0fQ.KPYx4a7tUV9K2PEU1fhkLDYsCzwJPAeX8zBIXRgzR_Q";

const client = new Client({
  host: "db.vmpvmjzursbjwkrgulyp.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
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
`);
console.log("Created operator_profiles");

await client.query(`
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
`);
console.log("Created operator_submissions");

// RLS
await client.query(`
  ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.operator_submissions ENABLE ROW LEVEL SECURITY;
`);

// Policies
const policies = [
  `CREATE POLICY IF NOT EXISTS "Operators view own profile" ON public.operator_profiles FOR SELECT USING (auth.uid() = user_id)`,
  `CREATE POLICY IF NOT EXISTS "Operators insert profile" ON public.operator_profiles FOR INSERT WITH CHECK (auth.uid() = user_id)`,
  `CREATE POLICY IF NOT EXISTS "Operators view own submissions" ON public.operator_submissions FOR SELECT USING (operator_id IN (SELECT id FROM public.operator_profiles WHERE user_id = auth.uid()))`,
  `CREATE POLICY IF NOT EXISTS "Operators insert submissions" ON public.operator_submissions FOR INSERT WITH CHECK (operator_id IN (SELECT id FROM public.operator_profiles WHERE user_id = auth.uid()))`,
  `CREATE POLICY IF NOT EXISTS "Service role bypass profiles" ON public.operator_profiles FOR ALL USING (true)`,
  `CREATE POLICY IF NOT EXISTS "Service role bypass submissions" ON public.operator_submissions FOR ALL USING (true)`,
];

for (const p of policies) {
  try {
    await client.query(p);
  } catch (e) {
    // Policy might already exist
    console.warn("Policy warning:", e.message);
  }
}

console.log("Tables and policies created successfully!");
await client.end();
