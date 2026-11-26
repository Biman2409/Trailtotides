"use client";

// Which Adventurepedia pages this visitor has opened, kept in their browser only, so the library
// can tick off the reading path. Losing it (private window, cleared storage) just un-ticks things.
import { useEffect, useState } from "react";

const KEY = "ttt:adventurepedia:read";

function load(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

/** Put on a guide page: records it as read once it's been open for a few seconds */
export function MarkRead({ href }: { href: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const read = load();
        if (!read.includes(href)) localStorage.setItem(KEY, JSON.stringify([...read, href].slice(-200)));
      } catch { /* storage blocked: nothing to remember */ }
    }, 4000);
    return () => clearTimeout(t);
  }, [href]);
  return null;
}

/** The pages read so far; empty until mounted, so the server render matches */
export function useRead() {
  const [read, setRead] = useState<Set<string>>(new Set());
  useEffect(() => { setRead(new Set(load())); }, []);
  return read;
}
