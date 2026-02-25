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
    <section style={{ background: "#141920" }} className="border-b border-white/6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#c4622d]" />
              <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase">
                AI Adventure Finder
              </p>
            </div>
            <h2 className="text-white text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
              Find your perfect adventure
            </h2>
            <div className="mt-4 w-10 h-0.5 bg-[#c4622d] rounded-full" />
          </div>
          <p className="text-white/40 text-sm max-w-xs text-right hidden sm:block">
            Describe what you&apos;re looking for — we&apos;ll match you with the right trip
          </p>
        </div>

        {/* Chat container */}
        <div className="border border-white/8 rounded-2xl overflow-hidden">
          {/* Messages */}
          {messages.length > 0 && (
            <div className="max-h-[300px] overflow-y-auto p-5 space-y-4 bg-white/2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] space-y-3">
                    {msg.content && (
                      <div
                        className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "text-white rounded-br-sm"
                            : "bg-white/6 border border-white/8 text-white/80 rounded-bl-sm"
                        }`}
                        style={msg.role === "user" ? { background: "#c4622d" } : {}}
                      >
                        {msg.content}
                      </div>
                    )}
                    {msg.cards && msg.cards.length > 0 && (
                      <div className="grid gap-2">
                        {msg.cards.map((card, ci) => {
                          const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                          return (
                            <Link
                              key={ci}
                              href={`/adventure/${card.slug}`}
                              className="flex items-stretch bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/16 rounded-xl overflow-hidden transition-all group"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={card.heroImage}
                                alt={card.name}
                                className="w-16 h-16 object-cover flex-shrink-0"
                              />
                              <div className="p-3 flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold tracking-tight">{card.name}</p>
                                <p className="text-white/40 text-xs mt-0.5 tracking-wide uppercase">{card.state} · {card.type} · {card.difficulty}</p>
                                {rec?.reason && (
                                  <p className="text-[#c4622d] text-xs mt-1 line-clamp-1">{rec.reason}</p>
                                )}
                              </div>
                              <div className="flex items-center pr-3">
                                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#c4622d] transition-colors" />
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
                  <div className="bg-white/6 border border-white/8 px-4 py-2.5 rounded-xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-[#c4622d] animate-spin" />
                    <span className="text-white/50 text-sm">Finding adventures…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Suggestion chips — only before first message */}
          {messages.length === 0 && (
            <div className="px-4 pt-4 pb-3 flex flex-wrap gap-2 bg-white/2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs border border-white/10 text-white/50 hover:text-white hover:border-white/24 px-3 py-1.5 rounded-full transition-all tracking-wide"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="border-t border-white/8 p-3 flex gap-3 bg-white/3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Describe your ideal adventure…"
              className="flex-1 bg-white/6 border border-white/8 text-white placeholder-white/30 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#c4622d]/50 focus:ring-1 focus:ring-[#c4622d]/30 transition-all"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="disabled:opacity-30 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
              style={{ background: "#c4622d" }}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline tracking-wide">Search</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
