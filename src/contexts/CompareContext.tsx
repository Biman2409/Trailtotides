"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Adventure } from "@/lib/data";

const MAX = 3;

interface CompareContextValue {
  selected: Adventure[];
  add: (a: Adventure) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

const STORAGE_KEY = "compare_selected";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Adventure[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

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
    <CompareContext.Provider value={{ selected, add, remove, clear, isSelected, isFull: selected.length >= MAX }}>
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
};

export function useCompare() {
  return useContext(CompareContext) ?? NO_OP;
}

export { MAX };
