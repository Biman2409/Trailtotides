import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OperatorDashboardClient from "./OperatorDashboardClient";
import { adventures } from "@/lib/data";
import Link from "next/link";

export default async function OperatorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/operator/dashboard");

  const adminClient = await createAdminClient();

  // Get operator profile — table may not exist yet
  let operatorProfile = null;
  let submissions: unknown[] = [];
  let tablesExist = true;

  try {
    const { data, error } = await adminClient
      .from("operator_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && (error.code === "PGRST205" || error.message?.includes("schema cache"))) {
      tablesExist = false;
    } else {
      operatorProfile = data;
    }
  } catch {
    tablesExist = false;
  }

  // Tables not set up yet — show setup instructions
  if (!tablesExist) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white/[0.03] border border-amber-500/20 rounded-3xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-white mb-2">Database Setup Required</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            The operator tables haven't been created in Supabase yet.
            An admin needs to run the setup SQL once in the Supabase Dashboard.
          </p>
          <div className="bg-black/30 rounded-2xl p-4 mb-6 text-left">
            <p className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest mb-2">Steps</p>
            <ol className="text-xs text-white/50 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Open <strong className="text-white/70">Supabase Dashboard → SQL Editor</strong></li>
              <li>Run the contents of <code className="text-[#ff7d47] font-mono">OPERATOR_SETUP.sql</code> (in the project root)</li>
              <li>Come back and refresh this page</li>
            </ol>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  // If no operator profile found, redirect to operator signup
  if (!operatorProfile) {
    redirect("/auth/operator-signup");
  }

  try {
    const { data } = await adminClient
      .from("operator_submissions")
      .select("*")
      .eq("operator_id", (operatorProfile as { id: string }).id)
      .order("created_at", { ascending: false });
    submissions = data ?? [];
  } catch {
    submissions = [];
  }

  const adventureList = adventures.map((a) => ({
    slug: a.slug,
    name: a.name,
    region: a.region,
    state: a.state,
    type: a.type,
    difficulty: a.difficulty,
    heroImage: a.heroImage,
    operators: a.operators,
  }));

  return (
    <OperatorDashboardClient
      operatorProfile={operatorProfile as Parameters<typeof OperatorDashboardClient>[0]["operatorProfile"]}
      submissions={submissions as Parameters<typeof OperatorDashboardClient>[0]["submissions"]}
      adventures={adventureList}
    />
  );
}
