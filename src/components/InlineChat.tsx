"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Compass, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import type { Adventure } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
}

const SUGGESTIONS = [
  { label: "Beginner-friendly Himalayan treks" },
  { label: "Surfing spots in South India" },
  { label: "Biking expeditions under ₹10k" },
  { label: "Luxury camping in Rajasthan" },
  { label: "Scuba diving for beginners" },
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
    <section id="compass-ai" className="relative overflow-hidden bg-[#0a0e14] border-y border-white/[0.03] py-16 lg:py-24">
      {/* Deep atmospheric backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff5100]/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#ff5100]/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Architectural Header Section */}
        <div className="flex flex-col items-center text-center mb-12 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
              <span className="text-[9px] text-[#ff5100] font-black uppercase tracking-[0.3em]">AI Adventure Discovery Engine</span>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <Compass className="w-10 h-10 lg:w-14 lg:h-14 text-[#ff5100] drop-shadow-[0_0_30px_rgba(255,81,0,0.3)]" strokeWidth={1.2} />
              <h2 className="text-white text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">
                Compass AI
              </h2>
            </div>
          </div>
          <p className="text-white/40 text-base lg:text-lg font-medium tracking-tight max-w-xl leading-relaxed">
            Describe your escape. <span className="text-white">We&apos;ll map the adventure.</span>
          </p>
        </div>

        {/* Command Center Interface */}
        <div className="max-w-5xl mx-auto">
          <div className="relative group">
            {/* Structural glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#ff5100]/30 to-[#ff5100]/0 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative bg-[#11161d]/90 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
              
                {/* Operational Header */}
                <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Interaction Terminal */}
                <div className={`min-h-[160px] ${messages.length > 0 ? 'max-h-[450px]' : 'h-auto'} overflow-y-auto custom-scrollbar bg-black/20`}>
                  {messages.length === 0 ? (
                    <div className="p-8 lg:p-12 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="space-y-4 w-full">
                        <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.4em]">
                          Starting Vectors
                        </p>
                        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 pb-2 w-full justify-start md:justify-center px-4">
                          {SUGGESTIONS.map((s) => (
                            <button
                              key={s.label}
                              onClick={() => { send(s.label); inputRef.current?.focus(); }}
                              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-white/50 text-[11px] hover:text-[#ff5100] hover:bg-[#ff5100]/5 hover:border-[#ff5100]/30 transition-all duration-300 group shadow-lg whitespace-nowrap"
                            >
                              <div className="w-1 h-1 rounded-full bg-[#ff5100]/40 group-hover:bg-[#ff5100]" />
                              <span className="font-bold tracking-tight">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 lg:p-8 space-y-6">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-4 duration-700"}`}
                        >
                          <div className={`max-w-[90%] space-y-4 ${msg.role === "assistant" ? "w-full" : ""}`}>
                            {msg.content && (
                              <div
                                className={`px-6 py-4 rounded-[1.5rem] text-base leading-relaxed shadow-2xl ${
                                  msg.role === "user"
                                    ? "text-white rounded-tr-none shadow-[#ff5100]/20 font-bold"
                                    : "bg-white/[0.03] border border-white/[0.07] text-white/90 rounded-tl-none font-light backdrop-blur-md"
                                }`}
                                style={msg.role === "user" ? { background: "linear-gradient(135deg, #ff5100 0%, #ff7d47 100%)" } : {}}
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
                                      className="flex flex-col bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-[#ff5100]/50 rounded-[1.5rem] overflow-hidden transition-all duration-700 group shadow-2xl relative"
                                    >
                                      <div className="relative h-36 w-full overflow-hidden">
                                        <img
                                          src={card.heroImage}
                                          alt={card.name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-black/20 to-transparent" />
                                        <div className="absolute bottom-3 left-4">
                                          <div className="px-2 py-0.5 rounded-full bg-[#ff5100] text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-lg">
                                            {card.type}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="p-5 flex-1 space-y-3">
                                        <div>
                                          <h4 className="text-white font-bold text-lg leading-tight group-hover:text-[#ff5100] transition-colors duration-300">
                                            {card.name}
                                          </h4>
                                          <div className="flex items-center gap-2 mt-1.5 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                                            <span>{card.state}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                            <span className="text-[#ff5100]/60">{card.difficulty}</span>
                                          </div>
                                        </div>
                                        {rec?.reason && (
                                          <div className="pt-3 border-t border-white/[0.05]">
                                            <p className="text-white/50 text-[11px] leading-relaxed font-light italic">
                                              &quot;{rec.reason}&quot;
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      <div className="px-5 py-3 bg-white/[0.01] border-t border-white/[0.03] flex items-center justify-end">
                                        <div className="flex items-center gap-1.5 text-[#ff5100] text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                          View details
                                          <ArrowRight className="w-3 h-3" />
                                        </div>
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
                        <div className="flex justify-start animate-in fade-in duration-500">
                          <div className="bg-white/[0.03] border border-white/[0.08] px-6 py-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-3 backdrop-blur-sm">
                            <Loader2 className="w-4 h-4 text-[#ff5100] animate-spin" />
                            <span className="text-white/30 text-sm font-light tracking-wide italic">Calculating trajectories…</span>
                          </div>
                        </div>
                      )}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>

                {/* Command Input Area */}
                <div className="p-6 bg-white/[0.02] border-t border-white/[0.06] relative">
                  <div className="relative flex items-center gap-3">
                    <div className="absolute left-5 text-[#ff5100]/40">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder="Ask Compass AI what you’re looking for"
                      className="w-full bg-white/[0.03] border border-white/[0.07] text-white placeholder-white/10 text-base py-4 pl-12 pr-20 rounded-2xl outline-none focus:bg-white/[0.05] focus:border-[#ff5100]/50 focus:ring-4 focus:ring-[#ff5100]/5 transition-all duration-500 font-light"
                    />
                    <button
                      onClick={() => send()}
                      disabled={!input.trim() || loading}
                      className="absolute right-2.5 p-3 rounded-xl bg-[#ff5100] text-white disabled:opacity-20 disabled:grayscale hover:bg-[#ff7d47] hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl shadow-[#ff5100]/30 group"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </button>
                  </div>
                </div>

            </div>
          </div>
        </div>

      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 81, 0, 0.2);
        }
      `}</style>
    </section>
  );
}
