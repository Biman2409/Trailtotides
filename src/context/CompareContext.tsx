"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Adventure } from "@/lib/data";

interface CompareContextValue {
  items: Adventure[];
  add: (a: Adventure) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Adventure[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((a: Adventure) => {
    setItems(prev => {
      if (prev.find(x => x.id === a.id) || prev.length >= 3) return prev;
      return [...prev, a];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(x => x.id !== id);
      if (next.length === 0) setIsOpen(false);
      return next;
    });
  }, []);

  const has = useCallback((id: string) => items.some(x => x.id === id), [items]);

  const clear = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  return (
    <CompareContext.Provider value={{ items, add, remove, has, clear, isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
