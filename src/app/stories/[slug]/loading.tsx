import Navbar from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/custom/Skeleton";

export default function StoryDetailLoading() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero skeleton */}
      <section className="relative h-[55vh] md:h-[65vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--bg-surface)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-8 pb-8 lg:pb-14 w-full space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 !rounded-full" />
            <Skeleton className="h-6 w-24 !rounded-full" />
          </div>
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-10 w-1/2" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 !rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </section>

      {/* Article skeleton */}
      <div className="max-w-2xl mx-auto px-5 lg:px-6 py-10 lg:py-20 space-y-5">
        <Skeleton className="h-24 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ))}
        <div className="pt-8">
          <Skeleton className="h-32 w-full !rounded-2xl" />
        </div>
      </div>
    </div>
  );
}