"use client";
import { CompareProvider } from "@/contexts/CompareContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import type { ReactNode } from "react";

export default function CompareWrapper({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <CompareProvider>{children}</CompareProvider>
    </WishlistProvider>
  );
}
