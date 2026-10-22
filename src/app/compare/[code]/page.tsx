import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createAdminClient } from "@/lib/supabase/server";
import { adventures } from "@/lib/data";
import { SHARE_CODE_RE } from "@/lib/apiUser";
import SharedComparison from "./SharedComparison";

// A comparison someone saved and shared. Anyone with the link can see it; the code is the secret.

type Props = { params: Promise<{ code: string }> };

async function load(code: string) {
  if (!SHARE_CODE_RE.test(code)) return null;
  const admin = await createAdminClient();
  const { data } = await admin.from("saved_comparisons").select("name, slugs, user_id").eq("share_code", code).maybeSingle();
  if (!data) return null;
  const list = (data.slugs as string[]).map((s) => adventures.find((a) => a.slug === s)).filter((a) => !!a);
  if (list.length < 2) return null;
  const { data: owner } = await admin.auth.admin.getUserById(data.user_id);
  const by = String(owner.user?.user_metadata?.full_name ?? "").trim().split(/\s+/)[0] || owner.user?.user_metadata?.username || null;
  return { name: data.name as string, slugs: list.map((a) => a.slug), by };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await load((await params).code);
  return {
    title: c ? c.name : "Comparison not found",
    description: "A side-by-side comparison of adventures on Trail to Tides.",
    robots: { index: false, follow: false },
  };
}

export default async function SharedComparisonPage({ params }: Props) {
  const c = await load((await params).code);
  if (!c) notFound();
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-5 lg:px-8 pt-28 pb-20" style={{ background: "var(--bg-page)" }}>
        <SharedComparison name={c.name} by={c.by} slugs={c.slugs} />
      </main>
      <Footer />
    </>
  );
}
