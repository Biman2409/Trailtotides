"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type Props = { slug: string; fallbackPage: number };

function BackLink({ slug, page }: { slug: string; page: number }) {
  return (
    <Link
      href={`/explore?page=${page}&scroll=${slug}`}
      className="absolute top-20 left-5 lg:left-8 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-all text-sm font-medium backdrop-blur-md px-3 sm:px-4 py-2 rounded-full"
      style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      <ChevronLeft className="w-4 h-4" />
      <span className="hidden sm:inline">All Adventures</span>
    </Link>
  );
}

// Explore links here with ?from=<page>; read in the browser so the page stays static
function FromPage({ slug, fallbackPage }: Props) {
  const from = parseInt(useSearchParams().get("from") ?? "", 10);
  return <BackLink slug={slug} page={from > 0 ? from : fallbackPage} />;
}

/** Back to the Explore page this adventure was opened from. */
export default function ExploreBackLink(props: Props) {
  return (
    <Suspense fallback={<BackLink slug={props.slug} page={props.fallbackPage} />}>
      <FromPage {...props} />
    </Suspense>
  );
}
