"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  loadXP, addCheckIn, removeCheckIn, addReview, addPhoto,
  getCurrentLevel, getNextLevel,
  type XPState, type Level,
} from "@/lib/xp";

interface XPContextValue {
  xp: XPState;
  currentLevel: Level;
  nextLevel: Level | null;
  /** Call after check-in; returns XP gained */
  onCheckIn: (slug: string) => number;
  /** Call after unmark */
  onUncheckIn: (slug: string) => void;
  /** Call after posting a review; returns XP gained */
  onReview: (slug: string) => number;
  /** Call after uploading a photo; returns XP gained */
  onPhoto: (slug: string) => number;
  refresh: () => void;
}

function checkLevelUp(prevXP: number, nextXP: number): Level | null {
  const prev = getCurrentLevel(prevXP);
  const next = getCurrentLevel(nextXP);
  if (next.level > prev.level) return next;
  return null;
}

function fireLevelUpToast(level: Level) {
  import("sonner").then(({ toast }) => {
    toast.success(`Level Up! You're now ${level.name}`, {
      description: `Reached Level ${level.level} — keep exploring!`,
      duration: 5000,
    });
  });
}

const XPContext = createContext<XPContextValue | null>(null);

const EMPTY_XP: XPState = { total: 0, checkIns: 0, reviews: 0, photos: 0, checkedSlugs: [], reviewedSlugs: [], photoSlugs: [] };

export function XPProvider({ children }: { children: React.ReactNode }) {
  // Start with empty state (SSR-safe), hydrate from localStorage after mount
  const [xp, setXP] = useState<XPState>(EMPTY_XP);

  function refresh() {
    setXP(loadXP());
  }

  useEffect(() => {
    // Hydrate on mount to avoid SSR/client mismatch
    setXP(loadXP());

    const handler = (e: StorageEvent) => {
      if (e.key === "ttt_xp") setXP(loadXP());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const onCheckIn = useCallback((slug: string): number => {
    const prevTotal = loadXP().total;
    const gained = addCheckIn(slug);
    if (gained > 0) {
      const newState = loadXP();
      setXP(newState);
      const levelUp = checkLevelUp(prevTotal, newState.total);
      if (levelUp) fireLevelUpToast(levelUp);
    }
    return gained;
  }, []);

  const onUncheckIn = useCallback((slug: string) => {
    removeCheckIn(slug);
    setXP(loadXP());
  }, []);

  const onReview = useCallback((slug: string): number => {
    const prevTotal = loadXP().total;
    const gained = addReview(slug);
    if (gained > 0) {
      const newState = loadXP();
      setXP(newState);
      const levelUp = checkLevelUp(prevTotal, newState.total);
      if (levelUp) fireLevelUpToast(levelUp);
    }
    return gained;
  }, []);

  const onPhoto = useCallback((slug: string): number => {
    const prevTotal = loadXP().total;
    const gained = addPhoto(slug);
    if (gained > 0) {
      const newState = loadXP();
      setXP(newState);
      const levelUp = checkLevelUp(prevTotal, newState.total);
      if (levelUp) fireLevelUpToast(levelUp);
    }
    return gained;
  }, []);

  const currentLevel = getCurrentLevel(xp.total);
  const nextLevel = getNextLevel(xp.total);

  return (
    <XPContext.Provider value={{ xp, currentLevel, nextLevel, onCheckIn, onUncheckIn, onReview, onPhoto, refresh }}>
      {children}
    </XPContext.Provider>
  );
}

export function useXP() {
  const ctx = useContext(XPContext);
  if (!ctx) throw new Error("useXP must be used inside XPProvider");
  return ctx;
}
