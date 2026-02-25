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
  "Easy trek in the Himalayas for beginners",
  "Scuba diving in winter near islands",
  "Solo adventure in Northeast India",
  "Extreme cycling expedition in summer",
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
    <section className="py-12 px-6 lg:px-8 bg-[#0f1419]">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">AI Adventure Finder</span>
            </div>
            <h2 className="text-white text-2xl lg:text-3xl font-bold tracking-tight leading-tight mb-2">
              Tell us what you&apos;re after
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              Describe your dream adventure — region, difficulty, season, vibe — and we&apos;ll find the best match from our curated list.
            </p>
          </div>

        {/* Chat window */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Messages */}
          <div className="min-h-[120px] max-h-[320px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-zinc-500 text-sm text-center py-8">
                Ask anything — e.g. &quot;best winter trek for a beginner&quot;
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] space-y-3">
                  {msg.content && (
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-orange-500 text-white rounded-br-sm"
                          : "bg-zinc-800 text-zinc-100 rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                  {/* Adventure cards */}
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="grid gap-3">
                      {msg.cards.map((card, ci) => {
                        const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                        return (
                          <Link
                            key={ci}
                            href={`/adventure/${card.slug}`}
                            className="flex items-stretch bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl overflow-hidden transition-colors group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={card.heroImage}
                              alt={card.name}
                              className="w-20 h-20 object-cover flex-shrink-0"
                            />
                            <div className="p-3 flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold">{card.name}</p>
                              <p className="text-zinc-400 text-xs mt-0.5">{card.state} · {card.type} · {card.difficulty}</p>
                              {rec?.reason && (
                                <p className="text-orange-400 text-xs mt-1.5 line-clamp-2">{rec.reason}</p>
                              )}
                            </div>
                            <div className="flex items-center pr-3">
                              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
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
                <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                  <span className="text-zinc-400 text-sm">Finding adventures…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips — only shown before first message */}
          {messages.length === 0 && (
            <div className="px-6 pb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="border-t border-zinc-800 p-4 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Describe your ideal adventure…"
              className="flex-1 bg-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
