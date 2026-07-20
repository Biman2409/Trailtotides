"use client";

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
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
      toast.error("Log in to log completed adventures.", {
        action: { label: "Log in", onClick: () => router.push("/auth/login") },
      });
      return;
    }
    if (done) {
      await unmark(slug);
      toast("Removed from completed adventures");
    } else {
      await markDone(slug);
      toast.success("Logged as completed!");
      // XP is awarded by TripLogContext (trip_log action) — no duplicate call needed
    }
  }

  if (variant === "page") {
    return (
      <button
        onClick={handleToggle}
        className={`inline-flex items-center gap-0 sm:gap-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${className}`}
        style={done
          ? { background: "rgba(74,222,128,0.18)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.35)", boxShadow: "0 0 10px rgba(74,222,128,0.15)" }
          : { background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }
        }
      >
        <CheckCircle2 className={`w-3.5 h-3.5 ${done ? "fill-[#4ade80]/20" : ""}`} />
        <span className="hidden sm:inline">{done ? "Completed" : "Mark as done"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={done ? "Remove from completed" : "Mark as done"}
      title={done ? "Completed ✓" : "Mark as done"}
      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 backdrop-blur-sm ${className}`}
      style={done
        ? { background: "rgba(74,222,128,0.9)", color: "#0d2818", boxShadow: "0 0 0 1px rgba(74,222,128,0.5), 0 0 10px rgba(74,222,128,0.25)" }
        : { background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.45)", boxShadow: "0 0 0 1px rgba(255,255,255,0.1)" }
      }
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
    </button>
  );
}
