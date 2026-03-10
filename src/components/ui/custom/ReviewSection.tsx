"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  username: string;
  rating: number;
  body: string;
  created_at: string;
  user_id: string;
}

interface Props {
  slug: string;
  currentUserId?: string;
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

export default function ReviewSection({ slug, currentUserId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableReady, setTableReady] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");

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
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-5 h-5 text-[#ff5100]" />
        <div>
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase">
            Traveller Reviews
          </p>
          {avgRating !== null ? (
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating value={Math.round(avgRating)} />
              <span className="text-[#1a1f2e] text-sm font-semibold">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-[#9a9590] text-xs">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          ) : (
            <p className="text-[#9a9590] text-sm mt-0.5">No reviews yet — be the first</p>
          )}
        </div>
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
            Done this adventure? Share your experience with others.
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
      ) : !tableReady ? (
        <p className="text-[#9a9590] text-sm text-center py-8">
          Reviews are being set up — check back shortly.
        </p>
      ) : reviews.length === 0 ? (
        <p className="text-[#9a9590] text-sm text-center py-8">
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-[#e0d8cc] rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#1a1f2e] font-semibold text-sm">
                      {r.username}
                    </span>
                    <StarRating value={r.rating} />
                    <span className="text-[#9a9590] text-xs">{timeAgo(r.created_at)}</span>
                  </div>
                </div>
                {currentUserId === r.user_id && (
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deleting === r.id}
                    className="text-[#9a9590] hover:text-red-500 transition-colors disabled:opacity-40 shrink-0"
                    title="Delete review"
                  >
                    {deleting === r.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-[#1a1f2e]/75 text-sm leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
