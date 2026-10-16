import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import GroupClient from "./GroupClient";

export const metadata: Metadata = {
  title: "Group Match",
  description: "Add everyone's fitness profile and find the adventures your whole group is ready for.",
  // Group links carry each member's fitness levels — keep them out of search results.
  robots: { index: false, follow: false },
};

// Group Match is for signed-in accounts only: every member is a real person who can be told
// apart from the others, and a group can't be filled with made-up profiles.
export default async function GroupMatchPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const here = m ? `/matchmaker/group?m=${encodeURIComponent(m)}` : "/matchmaker/group";
    const message = m ? "Sign in to join your group's match" : "Sign in to start a Group Match";
    redirect(`/auth/login?next=${encodeURIComponent(here)}&message=${encodeURIComponent(message)}`);
  }

  const meta = user.user_metadata ?? {};
  const firstName = String(meta.full_name ?? "").trim().split(/\s+/)[0] || String(meta.username ?? "").trim();

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative">
        <Suspense>
          <GroupClient viewer={{ id: user.id, name: firstName.slice(0, 24) }} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
