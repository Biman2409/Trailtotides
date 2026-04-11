"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Trash2, Loader2, MessageSquare, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  username: string;
  rating: number;
  body: string;
  created_at: string;
  user_id: string;
  avatar_id?: number | null;
}

interface Props {
  slug: string;
  currentUserId?: string;
  adventureType?: string;
  adventureName?: string;
}

const SUMMIT_KEYWORDS = /summit|peak/i;

function ctaText(type?: string, name?: string): string {
  if (type === "Trekking" && name && SUMMIT_KEYWORDS.test(name)) {
    return "Done this summit? Tell others what to expect.";
  }
  switch (type) {
    case "Trekking":       return "Done this trek? Tell others what to expect.";
    case "Mountaineering": return "Summited this peak? Share how it went.";
    case "Biking":         return "Ridden this route? Share the experience.";
    case "Cycling":        return "Cycled this route? Share the experience.";
    case "Diving":         return "Dived here? Tell others what's down there.";
    case "Kayaking":       return "Paddled this stretch? Share your story.";
    case "Skiing":         return "Skied these slopes? Tell others about it.";
    case "Rock Climbing":  return "Climbed here? Share the beta.";
    case "Scrambling":     return "Scrambled this route? Share the conditions.";
    case "Paragliding":    return "Flown here? Tell others what it's like.";
    default:               return "Done this adventure? Share your experience.";
  }
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          disabled={!onChange}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              s <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200 fill-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function ReviewSection({ slug, currentUserId, adventureType, adventureName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableReady, setTableReady] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const INITIAL_COUNT = 3;
  const visibleReviews = showAll ? reviews : reviews.slice(0, INITIAL_COUNT);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  }

  useEffect(() => {
    updateScrollState();
  }, [visibleReviews]);

  const hasReviewed = currentUserId
    ? reviews.some((r) => r.user_id === currentUserId)
    : false;

  useEffect(() => {
    fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews ?? []);
        setTableReady(d.tableReady !== false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating"); return; }
    if (!body.trim()) { setError("Please write a review"); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, rating, body }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setReviews((prev) => [data.review, ...prev]);
      setRating(0);
      setBody("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-0.5">
            Reviews
          </p>
          <h2 className="text-white font-semibold text-base">What People Say</h2>
        </div>
        {avgRating !== null ? (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avgRating)} />
            <span className="text-white text-sm font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-white/40 text-xs">({reviews.length})</span>
          </div>
        ) : (
          <p className="text-white/30 text-xs">No reviews yet</p>
        )}
      </div>

      {/* Write a review */}
      {currentUserId ? (
        !hasReviewed ? (
          <form
            onSubmit={handleSubmit}
            className="bg-[#fafaf8] border border-[#e0d8cc] rounded-2xl p-5 mb-8"
          >
            <p className="text-[#1a1f2e] text-sm font-semibold mb-4">
              Share your experience
            </p>
            <div className="mb-4">
              <p className="text-[#9a9590] text-xs mb-2">Your rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What was it like? Tips for others?"
              rows={3}
              maxLength={600}
              className="w-full bg-white border border-[#e0d8cc] rounded-xl p-3.5 text-sm text-[#1a1f2e] placeholder:text-[#9a9590]/60 resize-none focus:outline-none focus:ring-1 focus:ring-[#ff5100]/40 focus:border-[#ff5100]/40"
            />
            <div className="flex items-center justify-between mt-3 gap-3">
              <span className="text-[#9a9590] text-xs">{body.length}/600</span>
              <div className="flex items-center gap-3">
                {error && (
                  <p className="text-red-500 text-xs">{error}</p>
                )}
                {success && (
                  <p className="text-emerald-600 text-xs font-medium">Review posted!</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#ff5100] hover:bg-[#e64800] disabled:opacity-50 text-white font-semibold py-2 px-5 rounded-xl text-sm transition-colors"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Post review
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-3 mb-8 text-emerald-700 text-sm flex items-center gap-2">
            <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            You've already reviewed this adventure
          </div>
        )
      ) : (
        <div className="bg-[#fafaf8] border border-[#e0d8cc] rounded-2xl p-5 mb-8 flex items-center justify-between gap-4">
          <p className="text-[#9a9590] text-sm">
            {ctaText(adventureType, adventureName)}
          </p>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/auth/login"
              className="bg-[#ff5100] hover:bg-[#e64800] text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors"
            >
              Log in to review
            </Link>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[#9a9590]" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-[#9a9590] text-sm text-center py-8">
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <>
          <div className="relative">
            {/* Left arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-[#e0d8cc] shadow-md flex items-center justify-center hover:border-[#1a1f2e]/30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[#1a1f2e]" />
              </button>
            )}

            {/* Right arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-[#e0d8cc] shadow-md flex items-center justify-center hover:border-[#1a1f2e]/30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-[#1a1f2e]" />
              </button>
            )}

            {/* Right fade */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-[#fafaf8] to-transparent pointer-events-none z-[5]" />
            )}

            <div
              ref={scrollRef}
              onScroll={updateScrollState}
              className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar scroll-smooth"
            >
            {visibleReviews.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-[#e0d8cc] rounded-2xl p-5 shadow-sm flex-none w-72 snap-start flex flex-col"
              >
                {/* Avatar + name + date */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 t-bg-surface2">
                    {r.avatar_id
                      ? <img src={`/avatars/avatar-${r.avatar_id}.png`} alt={r.username} className="w-full h-full object-cover" />
                      : <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold uppercase">{r.username.charAt(0)}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#1a1f2e] font-semibold text-sm leading-none truncate">
                      {r.username}
                    </p>
                    <p className="text-[#9a9590] text-xs mt-0.5">{timeAgo(r.created_at)}</p>
                  </div>
                  {currentUserId === r.user_id && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      className="ml-auto text-[#9a9590] hover:text-red-500 transition-colors disabled:opacity-40 shrink-0"
                      title="Delete review"
                    >
                      {deleting === r.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                <StarRating value={r.rating} />

                <div className="border-t border-[#f0ebe3] my-3" />

                <p className="text-[#1a1f2e]/75 text-sm leading-relaxed flex-1">{r.body}</p>
              </div>
            ))}
            </div>
          </div>

          {reviews.length > INITIAL_COUNT && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-[#1a1f2e]/60 hover:text-[#1a1f2e] border border-[#e0d8cc] rounded-2xl hover:border-[#1a1f2e]/30 transition-all bg-white"
            >
              <ChevronDown className="w-4 h-4" />
              Show all {reviews.length} reviews
            </button>
          )}
        </>
      )}
    </section>
  );
}
