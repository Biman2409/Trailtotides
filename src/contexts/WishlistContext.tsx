"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadWishlist, saveWishlist } from "@/app/wishlist/actions";

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

  useEffect(() => {
    const supabase = createClient();

    async function init(uid: string | null) {
      setUserId(uid);
      if (uid) {
        // Load from server storage via server action
        const remote = await loadWishlist();
        const remoteSet = new Set(remote);
        // Merge any guest saves
        const local = lsGet();
        const merged = local.size > 0 ? new Set([...remoteSet, ...local]) : remoteSet;
        setSaved(merged);
        if (local.size > 0) {
          await saveWishlist([...merged]);
          localStorage.removeItem(LS_KEY);
        }
      } else {
        setSaved(lsGet());
      }
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      init(session?.user?.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      setLoading(true);
      await init(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const toggle = useCallback(async (slug: string) => {
    const isNowSaved = !saved.has(slug);

    // Build next set
    const next = new Set(saved);
    if (isNowSaved) next.add(slug); else next.delete(slug);

    // Optimistic UI update
    setSaved(next);

    if (userId) {
      await saveWishlist([...next]);
    } else {
      lsSet(next);
    }
  }, [saved, userId]);

  return (
    <WishlistContext.Provider value={{ saved, isSaved: (s) => saved.has(s), toggle, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}
