interface Props {
  className?: string;
}

export function Skeleton({ className = "" }: Props) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: "var(--bg-card)" }}
    />
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <Skeleton className="h-52 w-full !rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <Skeleton className="w-7 h-7 !rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedStorySkeleton() {
  return (
    <div className="relative h-[380px] md:h-[480px] lg:h-[580px] rounded-2xl lg:rounded-3xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <Skeleton className="w-full h-full !rounded-none" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 !rounded-full" />
          <Skeleton className="h-6 w-24 !rounded-full" />
        </div>
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 !rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdventureCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <Skeleton className="h-48 w-full !rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}