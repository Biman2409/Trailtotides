"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Adventure } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
}

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
          "Hey! I'm Trailwise — tell me what kind of adventure you're after and I'll find the perfect trip for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg]
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
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
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-full shadow-lg transition-all"
        aria-label="Open adventure finder chat"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
          {!open && <span className="text-sm font-semibold">Need help?</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[370px] max-w-[calc(100vw-1.5rem)] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 px-4 py-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-white" />
            <div>
                <p className="text-white font-semibold text-sm">Trailwise AI</p>
        <p className="text-orange-100 text-xs opacity-80">Your personal adventure guide</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[90%] space-y-2">
                  {/* Bubble */}
                  {msg.content && (
                    <div
                      className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
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
                    <div className="space-y-2">
                      {msg.cards.map((card, ci) => {
                        const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                        return (
                          <Link
                            key={ci}
                            href={`/adventure/${card.slug}`}
                            className="block bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl overflow-hidden transition-colors"
                          >
                            <div className="flex items-stretch">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={card.heroImage}
                                alt={card.name}
                                className="w-16 h-16 object-cover flex-shrink-0"
                              />
                              <div className="p-2 flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">{card.name}</p>
                                <p className="text-zinc-400 text-xs truncate">{card.state} · {card.type}</p>
                                {rec?.reason && (
                                  <p className="text-orange-400 text-xs mt-1 line-clamp-2">{rec.reason}</p>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 text-zinc-500 self-center mr-2 flex-shrink-0" />
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
                <div className="bg-zinc-800 px-3 py-2 rounded-xl rounded-bl-sm">
                  <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-zinc-700 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="e.g. easy trek in Himalayas in winter..."
              className="flex-1 bg-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
