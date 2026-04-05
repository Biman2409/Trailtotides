import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OperatorDashboardClient from "./OperatorDashboardClient";
import { adventures } from "@/lib/data";
import { getOperatorProfile, getSubmissionsForOperator } from "@/app/auth/operator-actions";

export default async function OperatorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/operator/dashboard");

  const operatorProfile = await getOperatorProfile(user.id);

  if (!operatorProfile) redirect("/auth/operator-signup");

  const submissions = await getSubmissionsForOperator(user.id);

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
      submissions={submissions}
      adventures={adventureList}
    />
  );
}
