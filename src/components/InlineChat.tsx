"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Adventure } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
}

const SUGGESTIONS = [
  "Easy Himalayan trek for beginners",
  "Scuba diving near islands in winter",
  "Solo adventure in Northeast India",
  "Extreme cycling in summer",
];

export default function InlineChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text || data.error || "Sorry, something went wrong.",
          cards: data.cards,
          recommendations: data.recommendations,
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
    <section className="py-8 px-6 lg:px-8 bg-[#fafaf8] border-b border-[#ede8e0]">
      <div className="max-w-3xl mx-auto">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-[#c4622d]/10 border border-[#c4622d]/20 rounded-full px-3 py-1">
            <Sparkles className="w-3 h-3 text-[#c4622d]" />
            <span className="text-[#c4622d] text-xs font-semibold tracking-widest uppercase">
              AI Adventure Finder
            </span>
          </div>
          <p className="text-[#b0a898] text-xs hidden sm:block">
            Describe your dream adventure — we&apos;ll find the best match
          </p>
        </div>

        {/* Chat window */}
        <div className="bg-white border border-[#e8e0d4] rounded-2xl overflow-hidden shadow-sm">
          {/* Messages */}
          {messages.length > 0 && (
            <div className="max-h-[280px] overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[85%] space-y-2">
                    {msg.content && (
                      <div
                        className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#c4622d] text-white rounded-br-sm"
                            : "bg-[#f5f0e8] text-[#1a1f2e] border border-[#e8e0d4] rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}
                    {msg.cards && msg.cards.length > 0 && (
                      <div className="grid gap-2">
                        {msg.cards.map((card, ci) => {
                          const rec = msg.recommendations?.find(
                            (r) => r.slug === card.slug
                          );
                          return (
                            <Link
                              key={ci}
                              href={`/adventure/${card.slug}`}
                              className="flex items-stretch bg-[#fafaf8] hover:bg-[#f5f0e8] border border-[#e8e0d4] rounded-xl overflow-hidden transition-colors group"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={card.heroImage}
                                alt={card.name}
                                className="w-16 h-16 object-cover flex-shrink-0"
                              />
                              <div className="p-2 flex-1 min-w-0">
                                <p className="text-[#1a1f2e] text-xs font-semibold">{card.name}</p>
                                <p className="text-[#7a7268] text-xs mt-0.5">
                                  {card.state} · {card.type} · {card.difficulty}
                                </p>
                                {rec?.reason && (
                                  <p className="text-[#c4622d] text-xs mt-1 line-clamp-1">
                                    {rec.reason}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center pr-2">
                                <ChevronRight className="w-3.5 h-3.5 text-[#b0a898] group-hover:text-[#c4622d] transition-colors" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#f5f0e8] border border-[#e8e0d4] px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-[#c4622d] animate-spin" />
                    <span className="text-[#7a7268] text-xs">Finding adventures…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Suggestion chips — only shown before first message */}
          {messages.length === 0 && (
            <div className="px-4 pt-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs bg-[#f5f0e8] hover:bg-[#ede5d8] border border-[#e0d8cc] text-[#5a5248] hover:text-[#1a1f2e] px-3 py-1 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="border-t border-[#e8e0d4] p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Describe your ideal adventure…"
              className="flex-1 bg-[#fafaf8] text-[#1a1f2e] placeholder-[#b0a898] text-xs px-3 py-2 rounded-lg outline-none border border-[#e8e0d4] focus:border-[#c4622d] focus:ring-1 focus:ring-[#c4622d]/20 transition-colors"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="bg-[#c4622d] hover:bg-[#d97040] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
