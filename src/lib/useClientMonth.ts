"use client";

import { useSyncExternalStore } from "react";
import { currentMonthIndexIST } from "@/lib/homeCuration";

const subscribe = () => () => {};

/**
 * This month (0–11, India time) once the page is running in the browser; null while the server
 * renders and during hydration. Cached pages are built days before someone reads them, so text
 * that depends on the month must wait for the browser's clock or it won't match the HTML.
 */
export function useClientMonth(): number | null {
  return useSyncExternalStore(subscribe, currentMonthIndexIST, () => null);
}
