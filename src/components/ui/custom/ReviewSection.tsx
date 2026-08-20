"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Trash2, Loader2, ChevronDown, Plus } from "lucide-react";
import Image from "next/image";
import { awardXP } from "@/lib/awardXP";
import { useTripLog } from "@/contexts/TripLogContext";

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
  operators?: { name: string }[];
}

const SUMMIT_KEYWORDS = /summit|peak/i;

function ctaText(type?: string, name?: string): string {
  if (type === "Trekking" && name && SUMMIT_KEYWORDS.test(name)) return "Done this summit? Tell others what to expect.";
  switch (type) {
    case "Trekking":       return "Done this trek? Tell others what to expect.";
    case "Mountaineering": return "Summited this peak? Share how it went.";
    case "Motorcycling":   return "Ridden this route? Share the experience.";
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

function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
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
          <Star className={`${sz} transition-colors ${s <= (hovered || value) ? "text-amber-400 fill-amber-400" : ""}`}
            style={s > (hovered || value) ? { color: "var(--text-muted)" } : undefined}
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

export default function ReviewSection({ slug, currentUserId, adventureType, adventureName, operators = [] }: Props) {
  const { markDone, isDone } = useTripLog();
  const isCompleted = isDone(slug);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Adventure review fields
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");

  // Operator rating fields
  const [opDropdownOpen, setOpDropdownOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  const [customOp, setCustomOp] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [opRating, setOpRating] = useState(0);

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

  const effectiveOpName = showCustomInput ? customOp.trim() : selectedOp;

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

      // Submit operator rating if provided
      if (effectiveOpName && opRating > 0) {
        await fetch("/api/operator-ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, operatorName: effectiveOpName, rating: opRating }),
        });
      }

      setRating(0); setBody("");
      setSelectedOp(null); setCustomOp(""); setOpRating(0); setShowCustomInput(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      awardXP("review", slug);
      if (!isDone(slug)) markDone(slug);
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <h3 className="text-amber-400 text-[10px] font-bold tracking-[0.18em] uppercase">Reviews</h3>
        </div>
        {avgRating !== null && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avgRating)} />
            <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{avgRating.toFixed(1)}</span>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>({reviews.length})</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Write form */}
        {currentUserId ? (
          !hasReviewed ? (
            !formOpen ? (
              <button
                onClick={() => setFormOpen(true)}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl mb-4 text-left transition-all hover:brightness-110 active:scale-[0.99]"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-xs flex-1" style={{ color: "var(--text-tertiary)" }}>{ctaText(adventureType, adventureName)}</span>
                <span className="text-amber-400/60 text-xs font-semibold shrink-0">Write review →</span>
              </button>
            ) : (
            <form onSubmit={handleSubmit} className="rounded-xl p-3.5 mb-4 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{ctaText(adventureType, adventureName)}</p>

              {/* Adventure rating */}
              <div className="flex items-center gap-3">
                <p className="text-[10px] uppercase tracking-widest shrink-0" style={{ color: "var(--text-tertiary)" }}>Rating</p>
                <StarRating value={rating} onChange={setRating} />
              </div>

              {/* Review body */}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What was it like? Tips for others?"
                rows={3}
                maxLength={600}
                className="w-full rounded-lg p-2.5 text-xs resize-none focus:outline-none transition-colors"
                style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
              />
              <div className="text-right">
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{body.length}/600</span>
              </div>

              {/* Operator section */}
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                <div className="px-3 py-2 flex items-center justify-between" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>Used an operator? Rate them</p>
                  <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>Optional</span>
                </div>

                <div className="p-3 space-y-2.5">
                  {/* Operator picker */}
                  {!showCustomInput ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpDropdownOpen(v => !v)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: selectedOp ? "var(--text-secondary)" : "var(--text-muted)" }}
                      >
                        {selectedOp ?? "Select operator\u2026"}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${opDropdownOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} />
                      </button>
                      {opDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 rounded-lg overflow-hidden shadow-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                          {operators.map((op) => (
                            <button
                              key={op.name}
                              type="button"
                              onClick={() => { setSelectedOp(op.name); setOpDropdownOpen(false); }}
                              className="w-full text-left px-3 py-2 text-xs transition-colors"
                              style={{ color: "var(--text-secondary)" }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                              {op.name}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => { setShowCustomInput(true); setSelectedOp(null); setOpDropdownOpen(false); }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center gap-1.5 transition-colors"
                            style={{ color: "#ff7d47", borderTop: "1px solid var(--border-subtle)" }}
                          >
                            <Plus className="w-3 h-3" /> Other operator
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        value={customOp}
                        onChange={(e) => setCustomOp(e.target.value)}
                        placeholder="Operator name\u2026"
                        className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                      />
                      <button type="button" onClick={() => { setShowCustomInput(false); setCustomOp(""); }}
                        className="text-xs transition-colors px-2"
                        style={{ color: "var(--text-muted)" }}>
                        Back
                      </button>
                    </div>
                  )}

                  {/* Operator star rating */}
                  {(selectedOp || (showCustomInput && customOp.trim())) && (
                    <div className="flex items-center gap-3 pt-0.5">
                      <p className="text-[10px] uppercase tracking-widest shrink-0" style={{ color: "var(--text-tertiary)" }}>Operator</p>
                      <StarRating value={opRating} onChange={setOpRating} size="sm" />
                      {opRating > 0 && <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{opRating}/5</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit row */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  {success && <p className="text-emerald-400 text-xs font-medium">Posted!</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setFormOpen(false); setRating(0); setBody(""); setError(""); }}
                    className="text-xs transition-colors px-2 py-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Cancel
                  </button>
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
            )
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
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: "var(--text-tertiary)" }}>No reviews yet. Be the first to share your experience!</p>
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
                    <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,81,0,0.2)" }}>
                      {r.avatar_id
                        ? <Image src={`/avatars/avatar-${r.avatar_id}.png`} alt={r.username} fill sizes="28px" className="object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: "var(--text-primary)" }}>{r.username.charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs leading-none truncate" style={{ color: "var(--text-primary)" }}>{r.username}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{timeAgo(r.created_at)}</p>
                    </div>
                    {currentUserId === r.user_id && (
                      <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="transition-colors shrink-0" style={{ color: "var(--text-muted)" }}>
                        {deleting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <StarRating value={r.rating} />
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.body}</p>
                </div>
              ))}
            </div>

            {reviews.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollRef.current?.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: "smooth" })}
                    className={`rounded-full transition-all ${activeIndex === i ? "w-4 h-1.5 bg-amber-400" : "w-1.5 h-1.5"}`}
                    style={activeIndex !== i ? { background: "var(--text-muted)" } : undefined}
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