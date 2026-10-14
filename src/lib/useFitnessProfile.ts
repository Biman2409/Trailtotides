"use client";

import { useEffect, useMemo, useState } from "react";
import { adventures } from "@/lib/data";
import { loadProfile, type StoredProfile } from "@/lib/matchmaker";
import { useTripLog } from "@/contexts/TripLogContext";
import { creditFromTrips, isStale, type TripCredit } from "@/lib/fitness";
import type { ACE } from "@/lib/ace";

// Fired by saveProfile/clearProfile in lib/matchmaker.
export const PROFILE_EVENT = "ttt:profile-updated";

/**
 * The visitor's Matchmaker profile with completed trips folded in. `ace` is what every match
 * score should use; `credits` explains any lift from trips. Null until mounted / if no profile.
 */
export function useFitnessProfile(): {
  profile: StoredProfile | null;
  ace: ACE | null;
  credits: TripCredit[];
  stale: boolean;
  ready: boolean;
} {
  const { log } = useTripLog();
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => { setProfile(loadProfile()); setReady(true); };
    read();
    window.addEventListener(PROFILE_EVENT, read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener(PROFILE_EVENT, read); window.removeEventListener("storage", read); };
  }, []);

  const completed = useMemo(() => log.map((e) => e.slug), [log]);

  return useMemo(() => {
    if (!profile?.ace) return { profile, ace: null, credits: [], stale: false, ready };
    const { ace, credits } = creditFromTrips(profile.ace, completed, adventures);
    return { profile, ace, credits, stale: isStale(profile.updatedAt), ready };
  }, [profile, completed, ready]);
}
