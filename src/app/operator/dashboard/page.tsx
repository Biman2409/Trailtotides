import { redirect } from "next/navigation";

// Legacy route — canonical URL is now /auth/operator-dashboard
export default function LegacyOperatorDashboard() {
  redirect("/auth/operator-dashboard");
}
