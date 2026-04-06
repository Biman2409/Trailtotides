import { redirect } from "next/navigation";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import { createClient } from "@/lib/supabase/server";
import { getOperatorProfile, getSubmissionsForOperator } from "@/app/auth/operator-actions";
import { adventures } from "@/lib/data";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Operator Profile — Trail to Tides",
};

export const dynamic = "force-dynamic";

export default async function OperatorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?role=operator");

  const profile = await getOperatorProfile(user.id);
  if (!profile) redirect("/auth/operator-signup");

  const submissions = await getSubmissionsForOperator(user.id);

  // For each unique adventure slug, take the most recent submission
  const latestBySlug = new Map<string, typeof submissions[number]>();
  submissions.forEach(sub => {
    const existing = latestBySlug.get(sub.adventure_slug);
    if (!existing || new Date(sub.created_at) > new Date(existing.created_at)) {
      latestBySlug.set(sub.adventure_slug, sub);
    }
  });

  const listings = [...latestBySlug.entries()].flatMap(([slug, sub]) => {
    const adv = adventures.find(a => a.slug === slug);
    return adv ? [{ adventure: adv, submission: sub }] : [];
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <ScrollToTop />
      <Navbar />

      <section className="pt-28 lg:pt-36 pb-24 px-5 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[#ff5100] text-xs font-bold tracking-[0.25em] uppercase mb-3">Operator Profile</p>
            <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-tight">
              Manage Your Listings
            </h1>
            <p className="text-white/40 text-sm mt-2 leading-relaxed">
              View and update the adventures you offer, adjust pricing, and add departure dates.
            </p>
          </div>

          <DashboardClient
            profile={profile}
            listings={listings}
            allAdventures={adventures}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
