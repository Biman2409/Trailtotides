"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Trash2, Loader2, ChevronDown, ChevronLeft, ChevronRight, Zap, MessageSquare } from "lucide-react";
import { XP_REWARDS } from "@/lib/xp";
import Link from "next/link";
import { useXP } from "@/contexts/XPContext";

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
  if (type === "Trekking" && name && SUMMIT_KEYWORDS.test(name)) return "Done this summit? Tell others what to expect.";
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

export default function ReviewSection({ slug, currentUserId, adventureType, adventureName }: Props) {
  const { onReview } = useXP();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
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
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  }

  useEffect(() => { updateScrollState(); }, [visibleReviews]);

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
      const gained = onReview(slug);
      if (gained > 0) {
        import("sonner").then(({ toast }) =>
          toast.success(`+${gained} XP — Review posted!`, { description: "Thanks for helping the community.", duration: 3000 })
        );
      }
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
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-1.5 text-white font-semibold text-sm">
          <MessageSquare className="w-3.5 h-3.5 text-white/40" />Reviews
        </h2>
        {avgRating !== null && (
          <div className="flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-white/70 text-sm font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-white/30 text-xs">· {reviews.length}</span>
          </div>
        )}
      </div>

      {/* Write / CTA */}
      {currentUserId ? (
        !hasReviewed ? (
          <form onSubmit={handleSubmit} className="rounded-xl p-4 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-sm font-medium">{ctaText(adventureType, adventureName)}</p>
            <span className="shrink-0 ml-3 inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
              <Zap className="w-2.5 h-2.5" />+{XP_REWARDS.review} XP
            </span>
          </div>
            <div className="mb-4">
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Your rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What was it like? Tips for others?"
              rows={3}
              maxLength={600}
              className="w-full rounded-xl p-3 text-sm text-white/70 placeholder:text-white/20 resize-none focus:outline-none focus:border-[#ff5100]/40 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <div className="flex items-center justify-between mt-3 gap-3">
              <span className="text-white/20 text-xs">{body.length}/600</span>
              <div className="flex items-center gap-3">
                {error && <p className="text-red-400 text-xs">{error}</p>}
                {success && <p className="text-emerald-400 text-xs font-medium">Posted!</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 text-white font-semibold py-2 px-5 rounded-xl text-sm transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #ff5100, #ff7d47)" }}
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Post Review
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-2" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span className="text-emerald-400 text-sm">You've already reviewed this adventure</span>
          </div>
        )
      ) : null}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-white/20" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-white/25 text-sm text-center py-8">No reviews yet. Be the first to share your experience!</p>
      ) : (
        <>
          <div className="relative">
            {canScrollLeft && (
              <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <ChevronLeft className="w-4 h-4 text-white/50" />
              </button>
            )}
            {canScrollRight && (
              <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <ChevronRight className="w-4 h-4 text-white/50" />
              </button>
            )}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-2 w-16 pointer-events-none z-[5]" style={{ background: "linear-gradient(to left, var(--bg-main, #0f1117), transparent)" }} />
            )}

            <div ref={scrollRef} onScroll={updateScrollState} className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar scroll-smooth">
              {visibleReviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl p-4 flex-none w-68 snap-start flex flex-col"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", minWidth: "260px" }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
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

                  <div className="h-px my-3" style={{ background: "rgba(255,255,255,0.06)" }} />

                  <p className="text-white/55 text-xs leading-relaxed flex-1">{r.body}</p>
                </div>
              ))}
            </div>
          </div>

          {reviews.length > INITIAL_COUNT && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-white/35 hover:text-white/60 rounded-xl transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Show all {reviews.length} reviews
            </button>
          )}
        </>
      )}
    </section>
  );
}
