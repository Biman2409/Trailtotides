"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Scrolls to top on every page navigation, UNLESS the URL contains
 * a ?scroll= param (used by the explore page to scroll to a specific card).
 */
export default function NavigationScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip the very first render (page is already at top on initial load)
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    // If the explore page wants to scroll to a specific card, let it handle it
    if (searchParams.get("scroll")) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, searchParams]);

  return null;
}
