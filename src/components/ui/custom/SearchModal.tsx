"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import type { SearchResult } from "@/app/api/search/route";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch all results on mount
  useEffect(() => {
    if (!open) return;
    async function fetchAll() {
      setLoading(true);
      try {
        const res = await fetch("/api/search");
        const data = await res.json();
        setAllResults(data.results || []);
      } catch {
        setAllResults([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Filter results by query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = allResults.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
    );
    setResults(filtered);
    setSelectedIndex(0);
  }, [query, allResults]);

  const navigate = useCallback(
    (url: string) => {
      onClose();
      router.push(url);
    },
    [onClose, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].url);
    }
  };

  if (!open) return null;

  const adventureResults = results.filter((r) => r.type === "adventure");
  const storyResults = results.filter((r) => r.type === "story");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1003] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[1004] flex items-start justify-center pt-[15vh] px-4">
        <div
          className="w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <Search className="w-4.5 h-4.5 shrink-0" style={{ color: "var(--text-muted)" }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search adventures, stories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }}
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded"
              style={{ background: "var(--bg-page)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
              <span className="text-[9px]">⌘</span>K
            </kbd>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 transition-colors" style={{ color: "var(--text-muted)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="overflow-y-auto max-h-[50vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-muted)" }} />
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No results for &ldquo;{query}&rdquo;</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Try a different search term</p>
              </div>
            ) : !query.trim() ? (
              <div className="py-12 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Type to search adventures & stories</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {allResults.length} total results indexed
                </p>
              </div>
            ) : (
              <>
                {/* Adventures */}
                {adventureResults.length > 0 && (
                  <div className="px-2 pt-2">
                    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}>
                      Adventures · {adventureResults.length}
                    </p>
                    {adventureResults.map((r, i) => {
                      const idx = results.indexOf(r);
                      return (
                        <button
                          key={r.id}
                          onClick={() => navigate(r.url)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
                          style={{
                            background: idx === selectedIndex ? "rgba(255,81,0,0.10)" : "transparent",
                          }}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
                            <Image src={r.image || ""} alt={r.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                              {r.title}
                            </p>
                            <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                              <MapPin className="w-3 h-3 inline mr-0.5" />
                              {r.subtitle}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Stories */}
                {storyResults.length > 0 && (
                  <div className="px-2 pt-2 pb-2">
                    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}>
                      Stories · {storyResults.length}
                    </p>
                    {storyResults.map((r, i) => {
                      const idx = results.indexOf(r);
                      return (
                        <button
                          key={r.id}
                          onClick={() => navigate(r.url)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
                          style={{
                            background: idx === selectedIndex ? "rgba(255,81,0,0.10)" : "transparent",
                          }}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
                            <Image src={r.image || ""} alt={r.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                              {r.title}
                            </p>
                            <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                              <BookOpen className="w-3 h-3 inline mr-0.5" />
                              {r.subtitle}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Summary */}
                <div className="px-4 py-2.5 text-[10px]" style={{ color: "var(--text-tertiary)", borderTop: "1px solid var(--border-subtle)" }}>
                  <span className="mr-3">↑↓ Navigate</span>
                  <span className="mr-3">↵ Open</span>
                  <span>Esc Close</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}