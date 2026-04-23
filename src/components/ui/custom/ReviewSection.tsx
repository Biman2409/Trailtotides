"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { awardXP } from "@/lib/awardXP";

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
  isCompleted?: boolean;
}

const SUMMIT_KEYWORDS = /summit|peak/i;

function ctaText(type?: string, name?: string): string {
  if (type === "Trekking" && name && SUMMIT_KEYWORDS.test(name)) return "Done this summit? Tell others what to expect.";
  switch (type) {
    case "Trekking":       return "Done this trek? Tell others what to expect.";
    case "Mountaineering": return "Summited this peak? Share how it went.";
    case "Motorcycling":         return "Ridden this route? Share the experience.";
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

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
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
          <Star className={`w-4 h-4 transition-colors ${s <= (hovered || value) ? "text-amber-400 fill-amber-400" : "text-white/15 fill-white/15"}`} />
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

export default function ReviewSection({ slug, currentUserId, adventureType, adventureName, isCompleted }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  useEffect(() => { updateScrollState(); }, [reviews]);

  const hasReviewed = currentUserId ? reviews.some((r) => r.user_id === currentUserId) : false;
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  useEffect(() => {
    fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
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
      setRating(0); setBody("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      awardXP("review", slug);
    } catch {
      setError("Something went wrong.");
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

  return (
    <section>
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(251,191,36,0.08)", background: "rgba(251,191,36,0.04)" }}>
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <h3 className="text-amber-400 text-[10px] font-bold tracking-[0.18em] uppercase">Reviews</h3>
        </div>
        {avgRating !== null && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avgRating)} />
            <span className="text-white/70 text-xs font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-white/30 text-xs">({reviews.length})</span>
          </div>
        )}
      </div>
      <div className="p-4">

      {/* Write / CTA */}
      {currentUserId ? (
        !isCompleted ? (
          <div className="rounded-lg px-3 py-2.5 mb-4 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-white/30 text-xs">Log this adventure to leave a review.</span>
          </div>
        ) : !hasReviewed ? (
          <form onSubmit={handleSubmit} className="rounded-xl p-3 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-white/50 text-xs font-medium mb-3">{ctaText(adventureType, adventureName)}</p>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-white/25 text-[10px] uppercase tracking-widest">Rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What was it like? Tips for others?"
              rows={3}
              maxLength={600}
              className="w-full rounded-lg p-2.5 text-xs text-white/70 placeholder:text-white/20 resize-none focus:outline-none transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <div className="flex items-center justify-between mt-2.5 gap-3">
              <span className="text-white/20 text-[10px]">{body.length}/600</span>
              <div className="flex items-center gap-2">
                {error && <p className="text-red-400 text-xs">{error}</p>}
                {success && <p className="text-emerald-400 text-xs font-medium">Posted!</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #ff5100, #ff7d47)" }}
                >
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  Post Review
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="rounded-lg px-3 py-2.5 mb-4 flex items-center gap-2" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
            <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
            <span className="text-emerald-400 text-xs">You&apos;ve already reviewed this adventure</span>
          </div>
        )
      ) : null}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-white/20" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-white/25 text-xs text-center py-6">No reviews yet. Be the first to share your experience!</p>
      ) : (
        <>
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {reviews.map((r) => (
              <div key={r.id} className="flex-none w-full snap-start flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,81,0,0.2)" }}>
                    {r.avatar_id
                      ? <img src={`/avatars/avatar-${r.avatar_id}.png`} alt={r.username} className="w-full h-full object-cover" />
                      : <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{r.username.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white/80 font-semibold text-xs leading-none truncate">{r.username}</p>
                    <p className="text-white/25 text-[10px] mt-0.5">{timeAgo(r.created_at)}</p>
                  </div>
                  {currentUserId === r.user_id && (
                    <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="text-white/20 hover:text-red-400 transition-colors shrink-0">
                      {deleting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <StarRating value={r.rating} />
                <p className="text-white/55 text-xs leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollRef.current?.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: "smooth" })}
                  className={`rounded-full transition-all ${activeIndex === i ? "w-4 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-white/20"}`}
                />
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </section>
  );
}
