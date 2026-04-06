"use client";

import { useState, useEffect } from "react";
import { Trophy, LogIn } from "lucide-react";
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
      toast.error("Log in to mark adventures as done.", {
        action: { label: "Log in", onClick: () => router.push("/auth/login") },
      });
      return;
    }
    if (done) {
      await unmark(slug);
      toast("Removed from your trip log");
    } else {
      await markDone(slug);
      toast.success("Added to your trip log 🏆");
    }
  }

  if (variant === "page") {
    return (
      <button
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${className}`}
        style={done
          ? { background: "rgba(251,191,36,0.15)", color: "#fcd34d", border: "1px solid rgba(251,191,36,0.4)", boxShadow: "0 0 12px rgba(251,191,36,0.15)" }
          : { background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }
        }
      >
        {loggedIn === false
          ? <><LogIn className="w-4 h-4" />Done it</>
          : done
            ? <><Trophy className="w-4 h-4 fill-current" />Been There</>
            : <><Trophy className="w-4 h-4" />Mark as Done</>
        }
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={done ? "Remove from trip log" : "Mark as done"}
      title={done ? "Been there!" : "Mark as done"}
      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 backdrop-blur-sm ${className}`}
      style={done
        ? { background: "rgba(251,191,36,0.9)", color: "#fff", boxShadow: "0 0 0 1px rgba(251,191,36,0.6), 0 0 10px rgba(251,191,36,0.3)" }
        : { background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.5)", boxShadow: "0 0 0 1px rgba(255,255,255,0.1)" }
      }
    >
      <Trophy className={`w-3.5 h-3.5 ${done ? "fill-white" : ""}`} />
    </button>
  );
}
