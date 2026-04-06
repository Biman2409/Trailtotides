"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, LogIn } from "lucide-react";
import { useTripLog } from "@/contexts/TripLogContext";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  variant?: "card" | "page";
  className?: string;
}

export default function CheckInButton({ slug, variant = "card", className = "" }: Props) {
  const { isDone, markDone, unmark } = useTripLog();
  const done = isDone(slug);
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loggedIn === false) {
      toast.error("Log in to mark adventures as done.", {
        action: { label: "Log in", onClick: () => router.push("/auth/login") },
      });
      return;
    }
    if (done) {
      await unmark(slug);
      toast("Removed from your trip log");
    } else {
      if (variant === "page") {
        setShowPicker(true);
      } else {
        await markDone(slug);
        toast.success("Marked as done ✓");
      }
    }
  }

  async function confirmDate() {
    await markDone(slug, date);
    setShowPicker(false);
    toast.success("Added to your trip log ✓");
  }

  if (variant === "page") {
    return (
      <div className="relative">
        <button
          onClick={handleToggle}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${className}`}
          style={done
            ? { background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.35)" }
            : { background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }
          }
        >
          {loggedIn === false
            ? <><LogIn className="w-4 h-4" />Done it</>
            : done
              ? <><CheckCircle2 className="w-4 h-4" />Been There</>
              : <><Circle className="w-4 h-4" />Mark as Done</>
          }
        </button>
        {showPicker && (
          <div className="absolute top-full mt-2 left-0 z-50 rounded-xl p-4 shadow-2xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", minWidth: "220px" }}>
            <p className="text-white/70 text-xs mb-2 font-medium">When did you do this?</p>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-white/8 text-white border border-white/12 focus:outline-none focus:border-[#ff5100]/50 mb-3"
            />
            <div className="flex gap-2">
              <button onClick={confirmDate} className="flex-1 bg-[#ff5100] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#ff7d47] transition-colors">Save</button>
              <button onClick={() => setShowPicker(false)} className="flex-1 bg-white/8 text-white/50 text-xs font-semibold py-2 rounded-lg hover:bg-white/12 transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={done ? "Remove from trip log" : "Mark as done"}
      title={done ? "Been there!" : "Mark as done"}
      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 backdrop-blur-sm ${className}`}
      style={done
        ? { background: "rgba(16,185,129,0.9)", color: "#fff", boxShadow: "0 0 0 1px rgba(16,185,129,0.5)" }
        : { background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.5)", boxShadow: "0 0 0 1px rgba(255,255,255,0.1)" }
      }
    >
      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
    </button>
  );
}
