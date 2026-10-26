"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * The signed-in user's id, read in the browser so pages that show it can still be cached
 * as static HTML. undefined while loading or when signed out.
 */
export function useCurrentUserId(): string | undefined {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setUserId(session?.user?.id));
    return () => listener.subscription.unsubscribe();
  }, []);

  return userId;
}
