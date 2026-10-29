"use client";

import { useState } from "react";
import { ArrowUp, Loader2, X, MessageCircle } from "lucide-react";
import { CompassAIMark } from "@/components/ui/custom/BrandMarks";
import { askCompass, COMPASS_GRADIENT } from "@/lib/compass";
import { track } from "@/lib/analytics";
import type { ACE } from "@/lib/ace";

// Compass.AI on the map: describe a trip, the picks light up and the map flies to them.
// Same /api/chat the chat bubble uses; the follow-up conversation continues there.

export interface CompassPick { slug: string; reason: string }

const PROMPTS = ["A 5-day trek with big views", "Something near the sea in winter", "First Himalayan trek"];

export default function CompassBar({
  ace,
  onPicks,
  active,
}: {
  ace: ACE | null;
  onPicks: (picks: CompassPick[], question: string) => void;
  active: boolean;
}) {
  const [text, setText] = useState("");
  const [asked, setAsked] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // One line at rest; the starter prompts only appear while you're about to type
  const [focused, setFocused] = useState(false);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || loading) return;
    setLoading(true);
    setError("");
    track("map_compass_ask", { length: question.length });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        // The server gives up on the AI well before this; never leave the bar spinning
        signal: AbortSignal.timeout(45_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: question }], recommendationRounds: 0, ace: ace ?? undefined }),
      });
      const data = await res.json();
      const picks: CompassPick[] = (data.recommendations ?? []).map((r: { slug: string; reason: string }) => ({ slug: r.slug, reason: r.reason }));
      if (!res.ok || data.rateLimited || (!data.text && !picks.length)) {
        setError(data.error ?? "Compass.AI couldn't answer just now. Try again in a moment.");
      } else {
        setAsked(question);
        setReply(data.text ?? "");
        setText("");
        onPicks(picks, question);
        if (!picks.length) setError("No specific picks for that one. Try naming a place, a month or how hard.");
      }
    } catch {
      setError("Compass.AI couldn't answer just now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setAsked(""); setReply(""); setError("");
    onPicks([], "");
  }

  return (
    <div>
      <form
        onSubmit={(e) => { e.preventDefault(); ask(text); }}
        className="rounded-2xl p-px"
        style={{ background: active || text ? COMPASS_GRADIENT : "linear-gradient(135deg, rgba(255,81,0,0.55), rgba(255,179,122,0.35))" }}
      >
        <div className="flex items-center gap-2 rounded-[15px] pl-3 pr-1.5 h-11 bg-[#121417]">
          <CompassAIMark className="w-4 h-4 shrink-0 text-[#ff9a66]" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Describe your trip — Compass.AI picks"
            aria-label="Describe your trip and Compass.AI will pick adventures on the map"
            enterKeyHint="send"
            className="flex-1 min-w-0 bg-transparent text-[13px] text-white placeholder:text-white/45 outline-none"
            style={{ caretColor: "#ff5100" }}
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Ask Compass.AI"
            className={`w-8 h-8 rounded-full grid place-items-center shrink-0 transition ${text.trim() ? "hover:scale-105" : "opacity-50"}`}
            style={{ background: COMPASS_GRADIENT }}
          >
            {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <ArrowUp className="w-4 h-4 text-white" strokeWidth={2.5} />}
          </button>
        </div>
      </form>

      {focused && !text && !asked && !loading && !error && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {PROMPTS.map((p) => (
            // mousedown, not click: the input's blur would hide the prompts before a click lands
            <button key={p} type="button" onMouseDown={(e) => { e.preventDefault(); ask(p); }} className="shrink-0 text-[10.5px] px-2.5 py-1 rounded-full bg-white/[0.05] text-white/55 hover:text-white hover:bg-white/10 transition-colors">
              {p}
            </button>
          ))}
        </div>
      )}

      {(asked || error) && (
        <div className="mt-2 rounded-xl px-3 py-2 text-[11.5px] leading-snug bg-[rgba(255,81,0,0.06)] border border-[rgba(255,125,71,0.2)]">
          {asked && <p className="text-white/40 truncate">“{asked}”</p>}
          {reply && <p className="text-white/75 mt-0.5">{reply}</p>}
          {error && <p className="text-[#ffb37a] mt-0.5">{error}</p>}
          <div className="flex items-center gap-3 mt-1.5">
            {asked && (
              <button type="button" onClick={() => askCompass(asked)} className="inline-flex items-center gap-1 font-semibold text-[#ff9a66] hover:underline">
                <MessageCircle className="w-3 h-3" /> Continue in chat
              </button>
            )}
            <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-white/45 hover:text-white ml-auto">
              <X className="w-3 h-3" /> Clear picks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
