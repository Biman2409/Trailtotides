import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GroupClient from "./GroupClient";

export const metadata: Metadata = {
  title: "Group Match",
  description: "Add everyone's fitness profile and find the adventures your whole group is ready for.",
  // Group links carry each member's fitness levels — keep them out of search results.
  robots: { index: false, follow: false },
};

export default function GroupMatchPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen relative">
        <Suspense>
          <GroupClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
