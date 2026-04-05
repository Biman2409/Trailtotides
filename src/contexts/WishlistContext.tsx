"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface WishlistCtx {
  saved: Set<string>;
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistCtx>({
  saved: new Set(),
  isSaved: () => false,
  toggle: async () => {},
  loading: true,
});

export function useWishlist() {
  return useContext(WishlistContext);
}

const LS_KEY = "ttt_saved_adventures";

function lsGet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function lsSet(s: Set<string>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...s])); } catch {}
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve auth state and load saved adventures
  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data } = await supabase
          .from("saved_adventures")
          .select("slug")
          .eq("user_id", uid);
        setSaved(new Set((data ?? []).map((r: { slug: string }) => r.slug)));
      } else {
        setSaved(lsGet());
      }
      setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data } = await supabase
          .from("saved_adventures")
          .select("slug")
          .eq("user_id", uid);
        setSaved(new Set((data ?? []).map((r: { slug: string }) => r.slug)));
      } else {
        setSaved(lsGet());
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const toggle = useCallback(async (slug: string) => {
    const supabase = createClient();
    const isNowSaved = !saved.has(slug);

    // Optimistic update
    setSaved(prev => {
      const next = new Set(prev);
      if (isNowSaved) next.add(slug); else next.delete(slug);
      return next;
    });

    if (userId) {
      if (isNowSaved) {
        await supabase.from("saved_adventures").insert({ user_id: userId, slug });
      } else {
        await supabase.from("saved_adventures").delete().eq("user_id", userId).eq("slug", slug);
      }
    } else {
      // Persist to localStorage for guests
      setSaved(prev => { lsSet(prev); return prev; });
      const updated = new Set(saved);
      if (isNowSaved) updated.add(slug); else updated.delete(slug);
      lsSet(updated);
    }
  }, [saved, userId]);

  return (
    <WishlistContext.Provider value={{ saved, isSaved: (s) => saved.has(s), toggle, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}
