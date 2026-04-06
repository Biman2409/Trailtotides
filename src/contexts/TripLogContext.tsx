"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadTripLog, saveTripLog } from "@/app/triplog/actions";
import type { TripEntry } from "@/app/triplog/actions";

export type { TripEntry };

interface TripLogCtx {
  log: TripEntry[];
  isDone: (slug: string) => boolean;
  markDone: (slug: string, date?: string, note?: string) => Promise<void>;
  unmark: (slug: string) => Promise<void>;
  loading: boolean;
}

const TripLogContext = createContext<TripLogCtx>({
  log: [],
  isDone: () => false,
  markDone: async () => {},
  unmark: async () => {},
  loading: true,
});

export function useTripLog() { return useContext(TripLogContext); }

const LS_KEY = "ttt_trip_log";
function lsGet(): TripEntry[] { try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
function lsSet(e: TripEntry[]) { try { localStorage.setItem(LS_KEY, JSON.stringify(e)); } catch {} }

export function TripLogProvider({ children }: { children: React.ReactNode }) {
  const [log, setLog] = useState<TripEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function init(uid: string | null) {
      setUserId(uid);
      if (uid) {
        const remote = await loadTripLog();
        const local = lsGet();
        const merged = [...remote];
        for (const e of local) {
          if (!merged.find(r => r.slug === e.slug)) merged.push(e);
        }
        setLog(merged);
        if (local.length > 0) { await saveTripLog(merged); localStorage.removeItem(LS_KEY); }
      } else {
        setLog(lsGet());
      }
      setLoading(false);
    }
    supabase.auth.getUser().then(({ data: { user } }) => init(user?.id ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      setLoading(true);
      await init(session?.user?.id ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const markDone = useCallback(async (slug: string, date?: string, note?: string) => {
    const entry: TripEntry = { slug, date: date ?? new Date().toISOString().slice(0, 10), note };
    setLog(prev => {
      const next = prev.find(e => e.slug === slug) ? prev.map(e => e.slug === slug ? entry : e) : [...prev, entry];
      if (userId) saveTripLog(next); else lsSet(next);
      return next;
    });
  }, [userId]);

  const unmark = useCallback(async (slug: string) => {
    setLog(prev => {
      const next = prev.filter(e => e.slug !== slug);
      if (userId) saveTripLog(next); else lsSet(next);
      return next;
    });
  }, [userId]);

  return (
    <TripLogContext.Provider value={{ log, isDone: s => log.some(e => e.slug === s), markDone, unmark, loading }}>
      {children}
    </TripLogContext.Provider>
  );
}
