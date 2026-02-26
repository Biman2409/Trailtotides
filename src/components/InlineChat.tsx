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
    <section id="compass-ai" className="relative overflow-hidden bg-[#0a0e14] border-y border-white/[0.03] py-24 lg:py-32">
      {/* Deep atmospheric backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff5100]/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#ff5100]/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Architectural Header Section */}
        <div className="flex flex-col items-center text-center mb-20 space-y-6">
          <div className="flex items-center gap-6 justify-center">
            <Compass className="w-14 h-14 lg:w-20 lg:h-20 text-[#ff5100] drop-shadow-[0_0_30px_rgba(255,81,0,0.3)]" strokeWidth={1.2} />
            <h2 className="text-white text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-none">
              Compass AI
            </h2>
          </div>
        </div>

        {/* Command Center Interface */}
        <div className="max-w-5xl mx-auto">
          <div className="relative group">
            {/* Structural glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#ff5100]/30 to-[#ff5100]/0 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative bg-[#11161d]/90 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
              
              {/* Operational Header */}
              <div className="px-8 py-5 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#ff5100] animate-pulse" />
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Neural Engine Active</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Interaction Terminal */}
              <div className={`min-h-[220px] ${messages.length > 0 ? 'max-h-[500px]' : 'h-auto'} overflow-y-auto custom-scrollbar bg-black/20`}>
                {messages.length === 0 ? (
                  <div className="p-16 flex flex-col items-center justify-center text-center space-y-10">
                    <div className="space-y-6">
                      <p className="text-white/20 text-xs font-bold uppercase tracking-[0.4em]">
                        Recommended Starting Vectors
                      </p>
                      <div className="flex flex-wrap justify-center gap-4">
                        {SUGGESTIONS.map((s) => (
                          <button
                            key={s.label}
                            onClick={() => { send(s.label); inputRef.current?.focus(); }}
                            className="flex items-center gap-4 px-7 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-white/50 text-sm hover:text-white hover:bg-[#ff5100]/10 hover:border-[#ff5100]/40 transition-all duration-500 group shadow-lg"
                          >
                            <span className="text-xl group-hover:scale-125 transition-transform duration-500">{s.icon}</span>
                            <span className="font-semibold tracking-wide">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 space-y-8">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-4 duration-700"}`}
                      >
                        <div className={`max-w-[85%] space-y-5 ${msg.role === "assistant" ? "w-full" : ""}`}>
                          {msg.content && (
                            <div
                              className={`px-8 py-5 rounded-[2rem] text-lg leading-relaxed shadow-2xl ${
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              {msg.cards.map((card, ci) => {
                                const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                                return (
                                  <Link
                                    key={ci}
                                    href={`/experiences/${card.slug}`}
                                    className="flex flex-col bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-[#ff5100]/50 rounded-[2rem] overflow-hidden transition-all duration-700 group shadow-2xl relative"
                                  >
                                    <div className="relative h-44 w-full overflow-hidden">
                                      <img
                                        src={card.heroImage}
                                        alt={card.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-black/20 to-transparent" />
                                      <div className="absolute bottom-4 left-6">
                                        <div className="px-3 py-1 rounded-full bg-[#ff5100] text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                                          {card.type}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="p-7 flex-1 space-y-4">
                                      <div>
                                        <h4 className="text-white font-bold text-xl leading-tight group-hover:text-[#ff5100] transition-colors duration-300">
                                          {card.name}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-2 text-white/30 text-[11px] font-bold uppercase tracking-widest">
                                          <span>{card.state}</span>
                                          <span className="w-1 h-1 rounded-full bg-white/20" />
                                          <span className="text-[#ff5100]/60">{card.difficulty}</span>
                                        </div>
                                      </div>
                                      {rec?.reason && (
                                        <div className="pt-4 border-t border-white/[0.05]">
                                          <p className="text-white/50 text-[12px] leading-relaxed font-light italic">
                                            &quot;{rec.reason}&quot;
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="px-7 py-4 bg-white/[0.01] border-t border-white/[0.03] flex items-center justify-between">
                                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">Deployment Protocol Alpha</span>
                                      <div className="flex items-center gap-2 text-[#ff5100] text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                        View details
                                        <ArrowRight className="w-3.5 h-3.5" />
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
                        <div className="bg-white/[0.03] border border-white/[0.08] px-8 py-5 rounded-[2rem] rounded-tl-none flex items-center gap-4 backdrop-blur-sm">
                          <Loader2 className="w-5 h-5 text-[#ff5100] animate-spin" />
                          <span className="text-white/30 text-base font-light tracking-wide italic">Calculating optimal trajectories…</span>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* Command Input Area */}
              <div className="p-8 bg-white/[0.02] border-t border-white/[0.06] relative">
                <div className="relative flex items-center gap-4">
                  <div className="absolute left-6 text-[#ff5100]/40">
                    <Search className="w-6 h-6" />
                  </div>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask Compass AI what you’re looking for"
                    className="w-full bg-white/[0.03] border border-white/[0.07] text-white placeholder-white/10 text-lg py-6 pl-16 pr-24 rounded-3xl outline-none focus:bg-white/[0.05] focus:border-[#ff5100]/50 focus:ring-8 focus:ring-[#ff5100]/5 transition-all duration-500 font-light"
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    className="absolute right-3 p-4 rounded-2xl bg-[#ff5100] text-white disabled:opacity-20 disabled:grayscale hover:bg-[#ff7d47] hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl shadow-[#ff5100]/30 group"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between px-2 mt-5">
                   <p className="text-[10px] text-white/10 uppercase tracking-[0.4em] font-black">
                     Powered by Compass Intelligence • v4.0.2
                   </p>
                   <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5">
                       <div className="w-1 h-1 rounded-full bg-green-500" />
                       <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Encrypted</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                       <div className="w-1 h-1 rounded-full bg-blue-500" />
                       <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Low Latency</span>
                     </div>
                   </div>
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
