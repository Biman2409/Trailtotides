import type { Metadata } from "next";
import Link from "next/link";
import { Search, Compass, Map as MapIcon, Library, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MatchmakerMark } from "@/components/ui/custom/BrandMarks";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const WAYS = [
  { href: "/explore", label: "Explore adventures", sub: "Every trek, ride and expedition", Icon: Compass },
  { href: "/map", label: "Open the map", sub: "Find adventures near any city", Icon: MapIcon },
  { href: "/matchmaker", label: "Take the Matchmaker", sub: "Adventures you're ready for", Icon: MatchmakerMark },
  { href: "/adventurepedia", label: "Read the guides", sub: "Permits, packing, seasons", Icon: Library },
];

// Shown for any address that doesn't exist, and for notFound() in pages
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-page)" }}>
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 pt-28 lg:pt-36 pb-20">
        <div className="max-w-2xl mx-auto">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5100] mb-3">404 · Off the trail</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4" style={{ color: "var(--text-primary)" }}>
            This path doesn&apos;t lead anywhere
          </h1>
          <p className="text-[16px] leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            The page may have moved, or the link has a typo. Search for the adventure you were after, or pick a way back in.
          </p>

          <form action="/explore" method="get" role="search" className="flex items-center gap-2 h-12 pl-4 pr-1.5 rounded-full mb-10" style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-secondary)" }} aria-hidden />
            <label htmlFor="nf-q" className="sr-only">Search adventures</label>
            <input id="nf-q" name="q" type="search" placeholder="Search treks, places…" className="flex-1 min-w-0 bg-transparent outline-none text-[15px]" style={{ color: "var(--text-primary)" }} />
            <button type="submit" className="h-9 px-4 rounded-full text-[13.5px] font-semibold text-white" style={{ background: "#ff5100" }}>Search</button>
          </form>

          <ul className="grid sm:grid-cols-2 gap-3">
            {WAYS.map(({ href, label, sub, Icon }) => (
              <li key={href}>
                <Link href={href} className="group flex items-center gap-3 p-4 rounded-2xl transition-colors hover:border-[#ff5100]/50" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
                  <span className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-[#ff5100]" style={{ background: "rgba(255,81,0,0.08)" }}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
                    <span className="block text-[13px]" style={{ color: "var(--text-secondary)" }}>{sub}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--text-secondary)" }} />
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-[14px]" style={{ color: "var(--text-secondary)" }}>
            Followed a broken link on our site? <Link href="/contact" className="text-[#ff5100] font-semibold hover:underline">Tell us</Link> and we&apos;ll fix it.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
