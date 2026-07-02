"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, ChevronRight, Compass } from "lucide-react";
import Link from "next/link";
import type { Adventure } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
}

export default function ChatBubble({ alwaysVisible = false }: { alwaysVisible?: boolean }) {
  const [visible, setVisible] = useState(alwaysVisible);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
        content:
          "Hey! I'm Compass.AI — tell me what kind of adventure you're after and I'll point you towards it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (alwaysVisible) { setVisible(true); return; }
    const target = document.getElementById("featured-adventures");
    if (target) {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisible(true); },
        { threshold: 0.1 }
      );
      observer.observe(target);
      return () => observer.disconnect();
    }
    // Fallback: show on first scroll if no sentinel found
    const onScroll = () => { setVisible(true); };
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        className={`fixed lg:bottom-8 max-lg:bottom-[88px] right-8 z-50 flex items-center justify-center text-white w-14 h-14 rounded-full shadow-2xl transition-all duration-500 ease-out hover:scale-110 active:scale-95 group ${
          visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-50 pointer-events-none"
        }`}
        style={{ 
          background: "#ff5100", 
          boxShadow: "0 10px 40px -10px rgba(255,81,0,0.6)", 
          transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s" 
        }}
          aria-label="Open Compass.AI"
        >
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
          <Compass className={`w-6 h-6 relative z-10 transition-transform duration-700 ${open ? 'rotate-180' : 'group-hover:rotate-90'}`} />
        </button>

        {/* Chat panel */}
        {open && (
          <div className="fixed lg:bottom-28 max-lg:bottom-[108px] right-8 z-50 w-[380px] max-w-[calc(100vw-4rem)] bg-[#11161d] border border-white/10 rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out backdrop-blur-3xl"
            style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }}
          >
            {/* Header */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff5100] to-[#ff7d47] flex items-center justify-center shadow-lg shadow-[#ff5100]/20">
                  <Compass className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm tracking-tight">Compass<span className="text-[#ff5100]">.</span><span className="text-[#ff5100]">AI</span></p>
                        </div>
              </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[400px] custom-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-2 duration-300"}`}
              >
                <div className="max-w-[90%] space-y-3">
                  {msg.content && (
                    <div
                      className={`px-4 py-3 rounded-xl text-[13px] leading-relaxed shadow-lg ${
                        msg.role === "user"
                          ? "text-white rounded-tr-[5px] font-semibold"
                          : "bg-white/[0.04] border border-white/[0.08] text-white/85 rounded-tl-[5px] font-light"
                      }`}
                      style={msg.role === "user" ? { background: "linear-gradient(135deg, #ff5100 0%, #ff7d47 100%)" } : {}}
                    >
                      {msg.content}
                    </div>
                  )}

                  {msg.cards && msg.cards.length > 0 && (
                    <div className="space-y-2">
                      {msg.cards.map((card, ci) => {
                        const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                        return (
                          <Link
                            key={ci}
                            href={`/experiences/${card.slug}`}
                            className="flex items-stretch bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#ff5100]/40 rounded-xl overflow-hidden transition-all duration-500 group shadow-lg"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={card.heroImage}
                              alt={card.name}
                              className="w-16 h-16 object-cover flex-shrink-0 group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="p-2.5 flex-1 min-w-0 flex flex-col justify-center">
                              <p className="text-white text-[12px] font-semibold truncate group-hover:text-[#ff5100] transition-colors">
                                {card.name}
                              </p>
                              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest truncate mt-0.5">
                                {card.state} · {card.type}
                              </p>
                              {rec?.reason && (
                                <p className="text-[#ff5100]/80 text-[10px] mt-1 line-clamp-2 leading-snug italic font-medium">
                                  &quot;{rec.reason}&quot;
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-[#ff5100] self-center mr-3 flex-shrink-0 transition-all group-hover:translate-x-1" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-white/[0.04] border border-white/[0.08] px-4 py-3 rounded-xl rounded-tl-[5px] flex items-center gap-2.5">
                  <Loader2 className="w-3.5 h-3.5 text-[#ff5100] animate-spin" />
                  <span className="text-white/40 text-[11px] font-medium tracking-wide">Mapping optimal routes…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/[0.05] bg-white/[0.02]">
            <div className="relative flex items-center gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask Compass.AI..."
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/10 text-sm px-4 py-3.5 rounded-xl outline-none focus:bg-white/[0.06] focus:border-[#ff5100]/40 transition-all font-light"
                />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="p-3.5 rounded-xl transition-all shadow-xl shadow-[#ff5100]/10 disabled:opacity-20 disabled:grayscale hover:bg-[#ff7d47] active:scale-95 group"
                style={{ background: "#ff5100" }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </button>
            </div>
            </div>
          </div>
        )}
    </>
  );
}
