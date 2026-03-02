"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Adventure } from "@/lib/data";

const MAX = 3;

interface CompareContextValue {
  selected: Adventure[];
  add: (a: Adventure) => void;
  remove: (id: string) => void;
  isSelected: (id: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Adventure[]>([]);

  function add(a: Adventure) {
    setSelected((prev) => {
      if (prev.find((s) => s.id === a.id) || prev.length >= MAX) return prev;
      return [...prev, a];
    });
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((a) => a.id !== id));
  }

  function isSelected(id: string) {
    return selected.some((a) => a.id === id);
  }

  return (
    <CompareContext.Provider value={{ selected, add, remove, isSelected, isFull: selected.length >= MAX }}>
      {children}
    </CompareContext.Provider>
  );
}

const NO_OP: CompareContextValue = {
  selected: [],
  add: () => {},
  remove: () => {},
  isSelected: () => false,
  isFull: false,
};

export function useCompare() {
  return useContext(CompareContext) ?? NO_OP;
}

export { MAX };
