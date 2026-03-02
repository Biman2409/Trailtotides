"use client";
import { CompareProvider } from "@/contexts/CompareContext";
import type { ReactNode } from "react";

export default function CompareWrapper({ children }: { children: ReactNode }) {
  return <CompareProvider>{children}</CompareProvider>;
}
