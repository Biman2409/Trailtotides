import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/custom/Breadcrumbs";
import { FeaturedStorySkeleton, StoryCardSkeleton } from "@/components/ui/custom/Skeleton";

export default function StoriesLoading() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Breadcrumbs items={[{ label: "Stories" }]} />

      {/* Hero header */}
      <section className="pt-28 lg:pt-36 pb-10 lg:pb-14 px-6 lg:px-8" style={{ background: "var(--bg-surface-2)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="h-3 w-24 mb-4 rounded-full" style={{ background: "var(--bg-card)" }} />
          <div className="h-14 w-96 mb-5 rounded-lg" style={{ background: "var(--bg-card)" }} />
          <div className="h-5 w-160 rounded-md" style={{ background: "var(--bg-card)" }} />
        </div>
      </section>

      {/* Featured skeleton */}
      <section className="px-6 lg:px-8" style={{ background: "var(--bg-surface-2)" }}>
        <div className="max-w-7xl mx-auto pb-16 lg:pb-24">
          <FeaturedStorySkeleton />
        </div>
      </section>

      {/* Grid skeletons */}
      <section className="py-14 lg:py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 lg:mb-10">
            <div className="flex items-center gap-3">
              <div className="h-7 w-28 rounded-md" style={{ background: "var(--bg-card)" }} />
              <div className="h-5 w-8 rounded-full" style={{ background: "var(--bg-card)" }} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <StoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}