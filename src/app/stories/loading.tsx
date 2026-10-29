import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { StoryCardSkeleton } from "@/components/ui/custom/Skeleton";

// Mirrors the page: hero, featured story (photo beside text), then the grid
export default function StoriesLoading() {
  const bar = { background: "var(--bg-surface-2)" };
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-20 lg:pt-24 pb-10 sm:pb-14" style={{ background: "linear-gradient(180deg, rgba(255,81,0,0.07), transparent 85%)" }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-14 sm:pt-20 animate-pulse">
          <div className="h-3 w-20 mb-4 rounded-full" style={bar} />
          <div className="h-14 w-full max-w-xl mb-5 rounded-lg" style={bar} />
          <div className="h-5 w-full max-w-lg rounded-md" style={bar} />
          <div className="h-11 w-44 mt-7 rounded-xl" style={bar} />
        </div>
      </section>

      <section className="px-5 lg:px-8 pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.35fr_1fr] rounded-3xl overflow-hidden animate-pulse" style={{ border: "1px solid var(--border-subtle)" }}>
          <div className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[460px]" style={bar} />
          <div className="p-8 space-y-4" style={{ background: "var(--bg-surface)" }}>
            <div className="h-3 w-40 rounded-full" style={bar} />
            <div className="h-9 w-full rounded-lg" style={bar} />
            <div className="h-9 w-2/3 rounded-lg" style={bar} />
            <div className="h-16 w-full rounded-md" style={bar} />
          </div>
        </div>
      </section>

      <section className="px-5 lg:px-8 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-40 mb-6 rounded-md" style={bar} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => <StoryCardSkeleton key={i} />)}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
