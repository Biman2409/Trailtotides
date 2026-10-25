import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { publicPassportUserId } from "@/lib/passportData";
import Passport from "@/app/profile/Passport";

// Someone's Adventure Passport, for anyone with the link. Only shown when its owner turned
// "Public Adventure Passport" on in Settings; otherwise it's a 404, same as no such user.

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const isPublic = !!(await publicPassportUserId(username));
  const image = `/api/passport?u=${encodeURIComponent(username)}&page=stats`;
  return {
    title: isPublic ? `@${username}'s Adventure Passport` : "Passport not found",
    description: "Adventures done, stamps collected and rank earned on Trail to Tides.",
    robots: { index: false, follow: false },
    ...(isPublic ? { openGraph: { images: [image] }, twitter: { card: "summary_large_image", images: [image] } } : {}),
  };
}

export default async function PublicPassportPage({ params }: Props) {
  const { username } = await params;
  if (!(await publicPassportUserId(username))) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-5 lg:px-8 pt-28 pb-20" style={{ background: "var(--bg-page)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] uppercase mb-2">Adventure Passport</p>
          <h1 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight mb-6">@{username}</h1>
          <Passport publicUsername={username} />
          <div className="mt-8 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <div className="min-w-0">
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Start your own passport</p>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>Log the adventures you&apos;ve done, earn stamps and badges, and see your rank.</p>
            </div>
            <Link href="/auth/signup" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[13px] font-semibold text-white" style={{ background: "#ff5100" }}>
              Create a free account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
