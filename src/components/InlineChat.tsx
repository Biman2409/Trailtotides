"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Compass, ArrowRight, Send, MapPin, Clock, BarChart2 } from "lucide-react";
import Link from "next/link";
import type { Adventure } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
}

const PROMPTS = [
  "Beginner trek in Himachal Pradesh",
  "Ladakh bike trip in summer",
  "Easy weekend trek near Delhi",
];

export default function InlineChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll only within the chat container, not the whole page
  useEffect(() => {
    if (messages.length === 0) return;
    const el = chatRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

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
          content: data.text || (data.error ? "Sorry, something went wrong." : ""),
          cards: data.cards ?? [],
          recommendations: data.recommendations ?? [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="ai-finder"
      className="relative overflow-hidden py-16 lg:py-24"
      style={{ background: "var(--bg-page)" }}
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#ff5100]/[0.04] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto px-5 lg:px-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5100] flex items-center justify-center shadow-lg shadow-[#ff5100]/30">
              <Compass className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
              Compass<span className="text-[#ff5100]">.AI</span>
            </h2>
          </div>
          <p className="text-sm lg:text-base" style={{ color: "var(--text-secondary)" }}>
            Describe what you&apos;re looking for — we&apos;ll find your adventure.
          </p>
        </div>

        {/* Chat card */}
        <div
          className="rounded-2xl border overflow-hidden shadow-2xl"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {/* Messages area */}
          <div
            ref={chatRef}
            className="overflow-y-auto transition-all duration-300"
            style={{ minHeight: 80, maxHeight: messages.length > 0 ? 480 : "auto" }}
          >
            {/* Empty state — prompt chips */}
            {messages.length === 0 && (
              <div className="px-5 py-8 flex flex-col items-center gap-4">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 hover:border-[#ff5100]/50 hover:text-[#ff5100]"
                      style={{
                        background: "var(--bg-elevated)",
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

            {/* Message list */}
            {messages.length > 0 && (
              <div className="p-4 lg:p-5 space-y-5">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`space-y-3 ${msg.role === "assistant" ? "w-full" : "max-w-[80%]"}`}>

                      {/* Bubble */}
                      {msg.content && (
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "text-white rounded-tr-sm font-medium"
                              : "rounded-tl-sm font-normal border"
                          }`}
                          style={
                            msg.role === "user"
                              ? { background: "#ff5100" }
                              : {
                                  background: "var(--bg-elevated)",
                                  borderColor: "var(--border-subtle)",
                                  color: "var(--text-primary)",
                                }
                          }
                        >
                          {msg.content}
                        </div>
                      )}

                      {/* Adventure cards */}
                      {msg.cards && msg.cards.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.cards.map((card, ci) => {
                            const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                            return (
                              <Link
                                key={ci}
                                href={`/experiences/${card.slug}`}
                                className="group flex flex-col rounded-xl overflow-hidden border transition-all duration-300 hover:border-[#ff5100]/40 hover:shadow-lg hover:shadow-[#ff5100]/5"
                                style={{
                                  background: "var(--bg-page)",
                                  borderColor: "var(--border-subtle)",
                                }}
                              >
                                {/* Image */}
                                <div className="relative h-32 overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={card.heroImage}
                                    alt={card.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  <span className="absolute bottom-2 left-3 px-2 py-0.5 bg-[#ff5100] text-white text-[9px] font-black uppercase tracking-wider rounded-full">
                                    {card.type}
                                  </span>
                                </div>

                                {/* Info */}
                                <div className="p-3 space-y-2 flex-1">
                                  <h4 className="text-sm font-bold leading-snug group-hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-primary)" }}>
                                    {card.name}
                                  </h4>
                                  <div className="flex items-center gap-3 text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {card.state}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <BarChart2 className="w-3 h-3" />
                                      {card.difficulty}
                                    </span>
                                    {card.durationDays && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {card.durationDays}
                                      </span>
                                    )}
                                  </div>
                                  {rec?.reason && (
                                    <p className="text-[11px] leading-relaxed italic border-t pt-2" style={{ color: "var(--text-tertiary)", borderColor: "var(--border-subtle)" }}>
                                      {rec.reason}
                                    </p>
                                  )}
                                </div>

                                {/* Footer CTA */}
                                <div
                                  className="px-3 py-2 border-t flex items-center justify-between"
                                  style={{ borderColor: "var(--border-subtle)" }}
                                >
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ff5100]">
                                    View details
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-[#ff5100] group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm text-sm border"
                      style={{
                        background: "var(--bg-elevated)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <Loader2 className="w-3.5 h-3.5 text-[#ff5100] animate-spin" />
                      <span>Finding adventures…</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input bar */}
          <div
            className="p-3 border-t"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="e.g. 5-day trek in Uttarakhand for beginners…"
                className="flex-1 bg-transparent text-sm py-2.5 px-3 rounded-xl outline-none border transition-all duration-200 focus:border-[#ff5100]/50 placeholder-opacity-40"
                style={{
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-[#ff5100] text-white disabled:opacity-30 hover:bg-[#ff7d47] active:scale-95 transition-all duration-200 shadow-md shadow-[#ff5100]/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
