"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, LogIn, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  slug: string;
}

interface Comment {
  id: string;
  name: string;
  body: string;
  createdAt: string;
}

export default function StoryComments({ slug }: Props) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auth + comments load
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isLogged = !!session?.user;
      setLoggedIn(isLogged);
      if (isLogged) {
        setNameFromSession(session!.user);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      const isLogged = !!session?.user;
      setLoggedIn(isLogged);
      if (isLogged) {
        setNameFromSession(session!.user);
      } else {
        setNameFromSession(null);
      }
    });

    async function load() {
      try {
        const res = await fetch(`/api/stories/comments?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch {
        // no comments yet
      }
    }
    load();
    return () => listener?.subscription.unsubscribe();
  }, [slug]);

  function setNameFromSession(user: { user_metadata?: Record<string, unknown>; email?: string } | null) {
    if (user) {
      const name = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "User";
      setUserName(name);
    } else {
      setUserName("");
    }
  }

  const submit = useCallback(async () => {
    if (!userName.trim() || !body.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/stories/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: userName.trim(),
          body: body.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post");
      }

      const newComment: Comment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [slug, userName, body]);

  return (
    <div className="mt-10 pt-8 border-t border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
        <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
          Comments
        </h3>
        {comments.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(255,81,0,0.1)", color: "#ff5100" }}>
            {comments.length}
          </span>
        )}
      </div>

      {/* Comment form — only for logged-in users */}
      {loggedIn === false ? (
        <div
          className="mb-6 p-5 rounded-xl text-center"
          style={{
            background: "var(--bg-card)",
            border: "1px dashed var(--border-subtle)",
          }}
        >
          <LogIn className="w-5 h-5 mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Log in to join the conversation
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
            Share your thoughts on this story
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all hover:brightness-110"
            style={{ background: "#ff5100", color: "white" }}
          >
            <LogIn className="w-3.5 h-3.5" />
            Log in
          </button>
        </div>
      ) : loggedIn === null ? null : (
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}
            >
              {userName[0]}
            </div>
            Commenting as <span className="font-semibold">{userName}</span>
          </div>
          <div className="relative">
            <textarea
              placeholder="Share your thoughts..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-colors resize-none"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={submit}
              disabled={submitting || !body.trim()}
              className="absolute bottom-3 right-3 p-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{
                background: body.trim() ? "#ff5100" : "transparent",
                color: body.trim() ? "white" : "var(--text-muted)",
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          {error && (
            <p className="text-xs" style={{ color: "#ff4444" }}>{error}</p>
          )}
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: "rgba(255,81,0,0.15)", color: "#ff5100" }}
                >
                  {c.name[0]}
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {c.name}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                  {formatTime(c.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}