"use client";

import { useSyncExternalStore, type ReactNode } from "react";

// Tailwind's lg breakpoint
const QUERY = "(min-width: 1024px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Renders its children on one side of the lg breakpoint only, so a component placed twice in a
 * layout (main column on phones, sidebar on desktop) mounts once. CSS hiding would still mount
 * the hidden copy, which for a map means a second map loading tiles. Nothing renders until the
 * page is running in the browser.
 */
export default function ScreenOnly({ below, children }: { below: boolean; children: ReactNode }) {
  const isLarge = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => null);
  if (isLarge === null || isLarge === below) return null;
  return <>{children}</>;
}
