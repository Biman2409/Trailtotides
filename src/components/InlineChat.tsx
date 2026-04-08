"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Compass, ArrowRight, Send, MapPin, Clock, BarChart2, Sparkles, Zap, RotateCcw, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Adventure } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
  suggestAce?: boolean;
}

// Quick-start prompts
const STARTER_PROMPTS = [
  "Beginner trek in Himachal Pradesh",
  "Ladakh bike expedition",
  "Hard trek with summit views",
  "Multi-day trek in Kashmir",
  "Weekend adventure near Delhi",
  "Diving in the Andamans",
];

// Follow-up chips shown after each AI response
const FOLLOWUP_CHIPS = [
  ["Something easier", "Something harder", "Shorter duration", "Different state"],
  ["More remote options", "Solo-friendly?", "Best in summer", "Best in winter"],
  ["Under 5 days", "High altitude", "Near water", "For beginners"],
];

export default function InlineChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [roundCount, setRoundCount] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of chat container only
  useEffect(() => {
    if (messages.length === 0) return;
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  function reset() {
    setMessages([]);
    setInput("");
    setRoundCount(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: msg };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text || (data.error ? "Sorry, something went wrong. Please try again." : ""),
          cards: data.cards ?? [],
          recommendations: data.recommendations ?? [],
          suggestAce: data.suggestAce ?? false,
        },
      ]);
      setRoundCount((c) => c + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error — please check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Pick follow-up chips based on round
  const chipSet = FOLLOWUP_CHIPS[Math.min(roundCount - 1, FOLLOWUP_CHIPS.length - 1)] ?? FOLLOWUP_CHIPS[0];
  const lastMsg = messages[messages.length - 1];
  const showFollowups = !loading && lastMsg?.role === "assistant" && messages.length > 0;

  return (
    <section
      id="ai-finder"
      className="relative overflow-hidden pt-20 pb-6 lg:pt-28 lg:pb-8"
      style={{ background: "var(--bg-page)" }}
    >
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#ff5100]/[0.04] blur-[80px]" />
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 relative z-10">

        {/* Section label */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px w-8 bg-[#ff5100]/40" />
          <span className="text-[#ff5100] text-[10px] font-black tracking-[0.3em] uppercase">
            Looking for something specific?
          </span>
          <div className="h-px w-8 bg-[#ff5100]/40" />
        </div>

        {/* Heading */}
        <div className="text-center mb-10 space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#ff5100] flex items-center justify-center shadow-xl shadow-[#ff5100]/30">
              <Compass className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-[-0.03em] t-text">
              Compass<span className="text-[#ff5100]">.AI</span>
            </h2>
          </div>
          <p className="text-base lg:text-lg t-text-2 max-w-lg mx-auto leading-relaxed">
            Describe your escape.{" "}
            <span className="t-text font-semibold">We&apos;ll find the adventure.</span>
          </p>
        </div>

        {/* Chat shell */}
        <div
          className="rounded-2xl overflow-hidden shadow-[0_0_60px_-10px_rgba(0,0,0,0.6)] border"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
        >

          {/* Chat header — shown once conversation starts */}
          {messages.length > 0 && (
            <div
              className="flex items-center justify-between px-4 py-2.5 border-b"
              style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--text-secondary)" }}>
                  Compass.AI
                </span>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 hover:bg-white/5"
                style={{ color: "var(--text-tertiary)" }}
              >
                <RotateCcw className="w-3 h-3" />
                New chat
              </button>
            </div>
          )}

          {/* Conversation area */}
          <div
            ref={chatRef}
            className="overflow-y-auto transition-all duration-300"
            style={{
              minHeight: 120,
              maxHeight: messages.length > 0 ? 560 : "auto",
            }}
          >
            {/* Empty state — starter prompts */}
            {messages.length === 0 && (
              <div className="px-6 py-10 flex flex-col items-center gap-5 text-center">
                <div className="flex items-center gap-2 t-text-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Try asking</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-xl">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="px-4 py-2 rounded-full text-[12px] font-medium border transition-all duration-200 hover:border-[#ff5100]/50 hover:text-[#ff5100] hover:bg-[#ff5100]/5"
                      style={{
                        background: "var(--bg-elevated, #141b28)",
                        borderColor: "var(--border-default)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
              <div className="p-5 space-y-5">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* AI avatar */}
                    {msg.role === "assistant" && (
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center mt-0.5">
                        <Compass className="w-3.5 h-3.5 text-[#ff5100]" strokeWidth={2} />
                      </div>
                    )}

                    <div className={`space-y-3 ${msg.role === "assistant" ? "flex-1 min-w-0" : "max-w-[78%]"}`}>
                      {/* Text bubble */}
                      {msg.content && (
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "text-white font-medium rounded-tr-sm"
                              : "rounded-tl-sm t-text border"
                          }`}
                          style={
                            msg.role === "user"
                              ? { background: "#ff5100" }
                              : { background: "var(--bg-surface-2, #141b28)", borderColor: "var(--border-subtle)" }
                          }
                        >
                          {msg.content}
                        </div>
                      )}

                      {/* ACE assessment suggestion */}
                      {msg.suggestAce && (
                        <Link
                          href="/ace"
                          className="group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/10"
                          style={{ borderColor: "rgba(255,81,0,0.3)", background: "var(--bg-page)" }}
                        >
                          {/* Top accent bar */}
                          <div className="h-0.5 bg-gradient-to-r from-[#ff5100] via-[#ff7d47] to-transparent" />
                          <div className="p-4 flex items-start gap-4">
                            <div className="shrink-0 w-11 h-11 rounded-xl bg-[#ff5100] flex items-center justify-center shadow-lg shadow-[#ff5100]/30">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff5100]">Personalised for you</span>
                              </div>
                              <p className="text-sm font-bold t-text group-hover:text-[#ff5100] transition-colors">Take the ACE Assessment</p>
                              <p className="text-[11px] t-text-3 mt-1 leading-relaxed">
                                Your Adventure Capability Engine (ACE) profile matches you to adventures based on your actual fitness, skills, and risk tolerance — not just guesswork.
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#ff5100] shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <div className="px-4 pb-3">
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-[#ff5100]">
                              <span>Takes 2 minutes</span>
                              <span className="opacity-40">·</span>
                              <span>Free</span>
                              <span className="opacity-40">·</span>
                              <span>Instant results</span>
                            </div>
                          </div>
                        </Link>
                      )}

                      {/* Adventure cards */}
                      {msg.cards && msg.cards.length > 0 && (
                        <AdventureCards cards={msg.cards} recommendations={msg.recommendations} />
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center">
                      <Compass className="w-3.5 h-3.5 text-[#ff5100]" strokeWidth={2} />
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm border"
                      style={{ background: "var(--bg-surface-2, #141b28)", borderColor: "var(--border-subtle)" }}
                    >
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 rounded-full bg-[#ff5100]/60 animate-bounce"
                          style={{ animationDelay: `${d * 0.15}s`, animationDuration: "0.8s" }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Follow-up suggestion chips */}
          {showFollowups && (
            <div
              className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-t"
              style={{ borderColor: "var(--border-subtle)", background: "var(--bg-page)" }}
            >
              <ChevronRight className="w-3 h-3 shrink-0" style={{ color: "var(--text-tertiary)" }} />
              {chipSet.map((chip) => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="shrink-0 px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 hover:border-[#ff5100]/50 hover:text-[#ff5100] hover:bg-[#ff5100]/5 whitespace-nowrap"
                  style={{
                    borderColor: "var(--border-default)",
                    color: "var(--text-tertiary)",
                    background: "transparent",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-px" style={{ background: "var(--border-subtle)" }} />

          {/* Input bar */}
          <div className="p-3 flex items-center gap-2.5" style={{ background: "var(--bg-surface)" }}>
            <div
              className="flex items-center gap-2 flex-1 rounded-xl px-3.5 border transition-all duration-200 focus-within:border-[#ff5100]/40"
              style={{ background: "var(--bg-page)", borderColor: "var(--border-default)" }}
            >
              <Compass className="w-3.5 h-3.5 text-[#ff5100]/50 shrink-0" />
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={messages.length > 0 ? "Refine or ask something else…" : "Ask Compass.AI…"}
                className="flex-1 bg-transparent text-sm py-3 outline-none t-text placeholder:t-text-3"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-[#ff5100] text-white disabled:opacity-25 hover:bg-[#ff7d47] active:scale-95 transition-all duration-200 shadow-lg shadow-[#ff5100]/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <p className="text-center mt-3 text-[10px] tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Powered by <span className="font-semibold">Groq</span> · Llama 3.3 70B
        </p>
      </div>
    </section>
  );
}

// Adventure cards sub-component
function AdventureCards({
  cards,
  recommendations,
}: {
  cards: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
}) {
  // Single card gets wider treatment
  if (cards.length === 1) {
    const card = cards[0];
    const rec = recommendations?.find((r) => r.slug === card.slug);
    return (
      <Link
        href={`/experiences/${card.slug}`}
        className="group flex rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff5100]/30 hover:shadow-xl hover:shadow-[#ff5100]/5"
        style={{ background: "var(--bg-page)", borderColor: "var(--border-subtle)" }}
      >
        <div className="relative w-36 sm:w-44 shrink-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.heroImage}
            alt={card.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
        </div>
        <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-[#ff5100] text-white text-[9px] font-black uppercase tracking-wider">{card.type}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-0.5" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
              <MapPin className="w-2 h-2" />{card.state}
            </span>
          </div>
          <h4 className="text-sm font-bold leading-snug group-hover:text-[#ff5100] transition-colors t-text line-clamp-2">{card.name}</h4>
          <div className="flex items-center gap-3 mt-auto">
            <span className="flex items-center gap-1 text-[10px] t-text-3"><BarChart2 className="w-2.5 h-2.5" />{card.difficulty}</span>
            {card.durationDays && <span className="flex items-center gap-1 text-[10px] t-text-3"><Clock className="w-2.5 h-2.5" />{card.durationDays}</span>}
          </div>
          {rec?.reason && (
            <p className="text-[10px] leading-relaxed t-text-3 italic pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>{rec.reason}</p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff5100]">View adventure</span>
            <ArrowRight className="w-3 h-3 text-[#ff5100] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    );
  }

  // 2–3 cards in a grid
  return (
    <div className={`grid gap-3 ${cards.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
      {cards.map((card, ci) => {
        const rec = recommendations?.find((r) => r.slug === card.slug);
        return (
          <Link
            key={ci}
            href={`/experiences/${card.slug}`}
            className="group flex flex-col rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff5100]/30 hover:shadow-xl hover:shadow-[#ff5100]/5"
            style={{ background: "var(--bg-page)", borderColor: "var(--border-subtle)" }}
          >
            {/* Hero image */}
            <div className="relative h-28 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.heroImage}
                alt={card.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#ff5100] text-white text-[9px] font-black uppercase tracking-wider">
                  {card.type}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/90 text-[9px] font-semibold flex items-center gap-0.5 border border-white/10">
                  <MapPin className="w-2 h-2" />{card.state}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-3 flex-1 flex flex-col gap-1.5">
              <h4 className="text-[13px] font-bold leading-snug group-hover:text-[#ff5100] transition-colors duration-200 t-text line-clamp-2">
                {card.name}
              </h4>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="flex items-center gap-1 text-[10px] t-text-3">
                  <BarChart2 className="w-2.5 h-2.5" />{card.difficulty}
                </span>
                {card.durationDays && (
                  <span className="flex items-center gap-1 text-[10px] t-text-3">
                    <Clock className="w-2.5 h-2.5" />{card.durationDays}
                  </span>
                )}
              </div>
              {rec?.reason && (
                <p className="text-[10px] leading-relaxed t-text-3 italic pt-1.5 border-t mt-auto" style={{ borderColor: "var(--border-subtle)" }}>
                  {rec.reason}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff5100]">View</span>
              <ArrowRight className="w-3 h-3 text-[#ff5100] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
