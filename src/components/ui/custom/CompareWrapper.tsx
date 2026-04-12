"use client";
import { CompareProvider } from "@/contexts/CompareContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { TripLogProvider } from "@/contexts/TripLogContext";
import { XPProvider } from "@/contexts/XPContext";
import type { ReactNode } from "react";

export default function CompareWrapper({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <TripLogProvider>
        <XPProvider>
          <CompareProvider>{children}</CompareProvider>
        </XPProvider>
      </TripLogProvider>
    </WishlistProvider>
  );
}
