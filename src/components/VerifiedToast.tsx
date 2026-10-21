"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// The verification link lands on ?welcome=1 (see /auth/callback): say so once, then tidy the URL.
export default function VerifiedToast() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("welcome") !== "1") return;
    toast.success("Email verified. Welcome to Trail to Tides!");
    url.searchParams.delete("welcome");
    window.history.replaceState(window.history.state, "", url);
  }, []);
  return null;
}
