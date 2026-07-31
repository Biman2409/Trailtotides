"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { GitCompare, ChevronDown, ChevronUp, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCompare, MAX } from "@/contexts/CompareContext";
import { createClient } from "@/lib/supabase/client";
import CompareContent from "./CompareContent";

export default function CompareAdventures() {
  const { selected } = useCompare();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setLoggedIn(!!session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Auto-expand when 2+ selected
  useEffect(() => {
    if (selected.length >= 2) setExpanded(true);
  }, [selected.length]);

  const hasSelection = selected.length > 0;

  return (
    <section id="compare-section" className="border-t" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-page)" }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">

        {/* Compact header bar */}
        <div
          className="flex items-center gap-3 py-3 cursor-pointer group select-none"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,81,0,0.1)", border: "1px solid rgba(255,81,0,0.2)" }}>
              <GitCompare className="w-3 h-3 text-[#ff5100]" />
            </div>
            <span className="text-xs font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>Compare</span>
            <span className="text-[10px] hidden sm:block" style={{ color: "var(--text-tertiary)" }}>Side-by-side stats, pricing &amp; ACE<sup>™</sup> profiles</span>
          </div>

          {/* Selected thumbnails preview */}
          {hasSelection && (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-[10px] mx-1" style={{ color: "var(--text-muted)" }}>—</span>
              {selected.map(a => (
                <div key={a.id} className="relative w-5 h-5 rounded overflow-hidden shrink-0 border" style={{ borderColor: "var(--border-subtle)" }}>
                  <Image src={a.heroImage} alt={a.name} fill className="object-cover" />
                </div>
              ))}
              <span className="text-[#ff5100] text-[10px] font-semibold shrink-0">{selected.length}/{MAX}</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {!hasSelection && loggedIn === false && (
              <button
                onClick={(e) => { e.stopPropagation(); router.push("/auth/login"); }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-white transition-all hover:opacity-80"
                style={{ background: "#ff5100" }}
              >
                <LogIn className="w-2.5 h-2.5" />
                Log in
              </button>
            )}
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5 transition-colors" style={{ color: "var(--text-muted)" }} />
              : <ChevronDown className="w-3.5 h-3.5 transition-colors" style={{ color: "var(--text-muted)" }} />
            }
          </div>
        </div>

        {/* Expanded panel */}
        {expanded && (
          <div className="pb-6">
            <CompareContent />
          </div>
        )}
      </div>
    </section>
  );
}
