"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { adventures, type Adventure } from "@/lib/data";

const MAX = 3;

interface CompareContextValue {
  selected: Adventure[];
  add: (a: Adventure) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  isFull: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

const STORAGE_KEY = "compare_selected";

export function CompareProvider({ children }: { children: ReactNode }) {
  // Starts empty on server and client alike, then picks up the saved compare after mount:
  // reading storage during the first render made the server and client HTML differ.
  const [selected, setSelected] = useState<Adventure[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Pick<Adventure, "id">[];
      // Match saved entries to today's data, so prices and details are never a stale copy
      const fresh = stored.map((s) => adventures.find((a) => a.id === s.id)).filter((a): a is Adventure => !!a).slice(0, MAX);
      if (fresh.length) setSelected((prev) => (prev.length ? prev : fresh));
    } catch { /* unreadable storage: start empty */ }
  }, []);

  function add(a: Adventure) {
    setSelected((prev) => {
      if (prev.find((s) => s.id === a.id) || prev.length >= MAX) return prev;
      const next = [...prev, a];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function remove(id: string) {
    setSelected((prev) => {
      const next = prev.filter((a) => a.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function clear() {
    setSelected([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  function isSelected(id: string) {
    return selected.some((a) => a.id === id);
  }

  return (
    <CompareContext.Provider
      value={{
        selected, add, remove, clear, isSelected, isFull: selected.length >= MAX,
        drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

const NO_OP: CompareContextValue = {
  selected: [],
  add: () => {},
  remove: () => {},
  clear: () => {},
  isSelected: () => false,
  isFull: false,
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
};

export function useCompare() {
  return useContext(CompareContext) ?? NO_OP;
}

export { MAX };
