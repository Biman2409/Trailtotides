"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Compass, ArrowRight, Sparkles, Search } from "lucide-react";
import Link from "next/link";
import type { Adventure } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
}

const SUGGESTIONS = [
  { label: "Beginner-friendly Himalayan treks", icon: "🏔️" },
  { label: "Surfing spots in South India", icon: "🏄‍♂️" },
  { label: "Biking expeditions under ₹10k", icon: "🏍️" },
];

export default function InlineChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <section className="relative overflow-hidden bg-[#0a0e14] border-y border-white/[0.03]">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff5100]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ff5100]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5100]/10 border border-[#ff5100]/20 text-[#ff5100] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 animate-pulse">
            <Sparkles className="w-3 h-3" />
            AI Discovery Engine
          </div>
          <div className="flex items-center gap-4 justify-center">
            <Compass className="w-12 h-12 lg:w-16 lg:h-16 text-[#ff5100]" strokeWidth={1.5} />
            <h2 className="text-white text-5xl lg:text-7xl font-bold tracking-tight">
              Compass AI
            </h2>
          </div>
          <p className="text-white/40 text-lg max-w-2xl mx-auto mt-4 font-light leading-relaxed">
            Describe your ideal escape and let our intelligence map out the perfect adventure for you.
          </p>
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Glow effect on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff5100]/20 to-[#ff5100]/0 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-[#11161d]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden">
              
              {/* Messages Area */}
              <div className={`min-h-[160px] ${messages.length > 0 ? 'max-h-[450px]' : 'h-auto'} overflow-y-auto custom-scrollbar`}>
                {messages.length === 0 ? (
                  <div className="p-10 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="space-y-4">
                      <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em]">
                        Prompt Suggestions
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {SUGGESTIONS.map((s) => (
                          <button
                            key={s.label}
                            onClick={() => { send(s.label); inputRef.current?.focus(); }}
                            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-white/60 text-sm hover:text-white hover:bg-[#ff5100]/10 hover:border-[#ff5100]/30 transition-all duration-300 group"
                          >
                            <span className="text-lg group-hover:scale-110 transition-transform">{s.icon}</span>
                            <span className="font-medium">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 space-y-6">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-2 duration-500"}`}
                      >
                        <div className={`max-w-[85%] space-y-4 ${msg.role === "assistant" ? "w-full" : ""}`}>
                          {msg.content && (
                            <div
                              className={`px-6 py-4 rounded-[1.5rem] text-base leading-relaxed ${
                                msg.role === "user"
                                  ? "text-white rounded-tr-none shadow-lg shadow-[#ff5100]/10"
                                  : "bg-white/[0.04] border border-white/[0.08] text-white/90 rounded-tl-none font-light"
                              }`}
                              style={msg.role === "user" ? { background: "#ff5100" } : {}}
                            >
                              {msg.content}
                            </div>
                          )}

                          {msg.cards && msg.cards.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {msg.cards.map((card, ci) => {
                                const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                                return (
                                  <Link
                                    key={ci}
                                    href={`/experiences/${card.slug}`}
                                    className="flex flex-col bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#ff5100]/40 rounded-2xl overflow-hidden transition-all duration-500 group shadow-lg"
                                  >
                                    <div className="relative h-32 w-full overflow-hidden">
                                      <img
                                        src={card.heroImage}
                                        alt={card.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                      <div className="absolute bottom-3 left-4">
                                        <p className="text-[10px] font-bold text-[#ff5100] uppercase tracking-widest">{card.type}</p>
                                      </div>
                                    </div>
                                    <div className="p-4 flex-1">
                                      <h4 className="text-white font-bold text-sm leading-tight group-hover:text-[#ff5100] transition-colors">
                                        {card.name}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1.5 text-white/40 text-[11px] uppercase tracking-wider">
                                        <span>{card.state}</span>
                                        <span>•</span>
                                        <span>{card.difficulty}</span>
                                      </div>
                                      {rec?.reason && (
                                        <div className="mt-3 pt-3 border-t border-white/[0.05]">
                                          <p className="text-white/60 text-[11px] leading-relaxed italic">
                                            &quot;{rec.reason}&quot;
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="px-4 py-2 bg-white/[0.02] flex items-center justify-between">
                                      <span className="text-[10px] text-white/30 font-medium uppercase tracking-tight">View Details</span>
                                      <ArrowRight className="w-3.5 h-3.5 text-[#ff5100] group-hover:translate-x-1 transition-transform" />
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
                      <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="bg-white/[0.04] border border-white/[0.08] px-6 py-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-3">
                          <Loader2 className="w-4 h-4 text-[#ff5100] animate-spin" />
                          <span className="text-white/40 text-sm font-light italic">Consulting the maps…</span>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white/[0.02] border-t border-white/[0.08]">
                <div className="relative flex items-center gap-3">
                  <div className="absolute left-4 text-white/20">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask Compass AI what you’re looking for"
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-base py-4 pl-12 pr-16 rounded-2xl outline-none focus:bg-white/[0.06] focus:border-[#ff5100]/40 focus:ring-4 focus:ring-[#ff5100]/5 transition-all duration-300"
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    className="absolute right-2 p-2.5 rounded-xl bg-[#ff5100] text-white disabled:opacity-30 disabled:grayscale hover:bg-[#ff7d47] hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl shadow-[#ff5100]/20"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4">
                   <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                     Powered by Compass Intelligence
                   </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 81, 0, 0.3);
        }
      `}</style>
    </section>
  );
}
