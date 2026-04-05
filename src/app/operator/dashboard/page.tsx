import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OperatorDashboardClient from "./OperatorDashboardClient";
import { adventures } from "@/lib/data";

export default async function OperatorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/operator/dashboard");

  const adminClient = await createAdminClient();

  // Get operator profile
  const { data: operatorProfile } = await adminClient
    .from("operator_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // If no operator profile found, redirect to operator signup
  if (!operatorProfile) {
    redirect("/auth/operator-signup");
  }

  // Get this operator's submissions
  const { data: submissions } = await adminClient
    .from("operator_submissions")
    .select("*")
    .eq("operator_id", operatorProfile.id)
    .order("created_at", { ascending: false });

  // Pass adventures list for browse/search
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
      operatorProfile={operatorProfile}
      submissions={submissions ?? []}
      adventures={adventureList}
    />
  );
}
