import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { loadGroup, previewGroup, viewerFrom } from "@/lib/matchGroupsServer";
import GroupClient from "../GroupClient";

export const metadata: Metadata = {
  title: "Group Match",
  description: "Join your group and see which adventures you're all ready for.",
  robots: { index: false, follow: false },
};

// A stored group. Members see everyone's levels; anyone else holding the invite sees only the
// group's name and head count until they join (enforced by RLS, not just this page).
export default async function StoredGroupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const here = `/matchmaker/group/${encodeURIComponent(code)}`;
    redirect(`/auth/login?next=${encodeURIComponent(here)}&message=${encodeURIComponent("Sign in to join your group's match")}`);
  }

  const group = await loadGroup(supabase, code);
  const view = group
    ? ({ kind: "stored", group } as const)
    : ({ kind: "invite", code, preview: await previewGroup(supabase, code) } as const);

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative">
        <Suspense>
          <GroupClient viewer={viewerFrom(user)} view={view} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
