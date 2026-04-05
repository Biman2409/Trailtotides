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

// ── Storage helpers ────────────────────────────────────────────
async function storageLoad(userId: string): Promise<Set<string>> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("wishlists")
    .download(`${userId}.json`);
  if (error || !data) return new Set();
  try {
    const text = await data.text();
    const arr = JSON.parse(text) as string[];
    return new Set(arr);
  } catch { return new Set(); }
}

async function storageSave(userId: string, slugs: Set<string>): Promise<void> {
  const supabase = createClient();
  const blob = new Blob([JSON.stringify([...slugs])], { type: "application/json" });
  await supabase.storage
    .from("wishlists")
    .upload(`${userId}.json`, blob, { upsert: true, contentType: "application/json" });
}

// ── Provider ───────────────────────────────────────────────────
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const remote = await storageLoad(uid);
        // Merge any local guest saves into remote
        const local = lsGet();
        const merged = new Set([...remote, ...local]);
        setSaved(merged);
        if (local.size > 0) {
          await storageSave(uid, merged);
          localStorage.removeItem(LS_KEY);
        }
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
        const remote = await storageLoad(uid);
        const local = lsGet();
        const merged = new Set([...remote, ...local]);
        setSaved(merged);
        if (local.size > 0) {
          await storageSave(uid, merged);
          localStorage.removeItem(LS_KEY);
        }
      } else {
        setSaved(lsGet());
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const toggle = useCallback(async (slug: string) => {
    const isNowSaved = !saved.has(slug);

    // Optimistic update
    setSaved(prev => {
      const next = new Set(prev);
      if (isNowSaved) next.add(slug); else next.delete(slug);
      if (!userId) lsSet(next);
      return next;
    });

    if (userId) {
      const next = new Set(saved);
      if (isNowSaved) next.add(slug); else next.delete(slug);
      await storageSave(userId, next);
    }
  }, [saved, userId]);

  return (
    <WishlistContext.Provider value={{ saved, isSaved: (s) => saved.has(s), toggle, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}
