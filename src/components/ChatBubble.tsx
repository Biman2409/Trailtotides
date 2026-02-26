"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, ChevronRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import type { Adventure } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
}

export default function ChatBubble() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
        content:
          "Hey! I'm Compass — tell me what kind of adventure you're after and I'll point you towards it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const target = document.getElementById("featured-adventures");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

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
          className={`fixed bottom-6 right-6 z-50 flex items-center justify-center text-white w-14 h-14 rounded-full shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
          style={{ background: open ? "#d84315" : "#f67345", boxShadow: "0 4px 20px rgba(244,132,95,0.45)", transition: "opacity 0.4s ease, transform 0.4s ease, background 0.2s" }}
          aria-label="Open Compass AI"
        >
          {open ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
        </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[370px] max-w-[calc(100vw-1.5rem)] bg-[#141920] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)" }}
        >
          {/* Header */}
            <div
              className="px-4 py-3.5 flex items-center gap-3"
              style={{ background: "#f67345" }}
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm tracking-tight">Compass AI</p>
              <p className="text-white/65 text-xs">Your personal adventure guide</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[90%] space-y-2">
                  {msg.content && (
                    <div
                      className={`px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-br-sm"
                          : "bg-white/6 border border-white/8 text-white/85 rounded-bl-sm"
                      }`}
                      style={msg.role === "user" ? { background: "#f67345" } : {}}
                    >
                      {msg.content}
                    </div>
                  )}

                  {msg.cards && msg.cards.length > 0 && (
                    <div className="space-y-1.5">
                      {msg.cards.map((card, ci) => {
                        const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                        return (
                          <Link
                            key={ci}
                            href={`/experiences/${card.slug}`}
                            className="flex items-stretch bg-white/5 hover:bg-white/10 border border-white/8 hover:border-[#f67345]/30 rounded-xl overflow-hidden transition-all group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={card.heroImage}
                              alt={card.name}
                              className="w-14 h-14 object-cover flex-shrink-0"
                            />
                            <div className="p-2.5 flex-1 min-w-0">
                              <p className="text-white text-xs font-semibold truncate">
                                {card.name}
                              </p>
                              <p className="text-white/40 text-xs truncate">
                                {card.state} · {card.type}
                              </p>
                              {rec?.reason && (
                                <p className="text-[#f09060] text-xs mt-0.5 line-clamp-2 leading-snug">
                                  {rec.reason}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#f67345] self-center mr-2 flex-shrink-0 transition-colors" />
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
                <div className="bg-white/6 border border-white/8 px-3.5 py-2.5 rounded-xl rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-[#f67345] animate-spin" />
                  <span className="text-white/50 text-sm">Finding adventures…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/8 p-3 flex gap-2 bg-white/[0.02]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything about adventures…"
              className="flex-1 bg-white/6 border border-white/8 text-white placeholder-white/25 text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-[#f67345]/60 focus:ring-1 focus:ring-[#f67345]/25 transition-all"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="disabled:opacity-30 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all hover:brightness-110 active:scale-95"
              style={{ background: "#f67345" }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
