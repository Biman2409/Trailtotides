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
    <section id="compass-ai" className="relative overflow-hidden bg-[#0a0e14] border-y border-white/[0.03] py-8 lg:py-12">
      {/* Deep atmospheric backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff5100]/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#ff5100]/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Architectural Header Section */}
        <div className="flex flex-col items-center text-center mb-6 space-y-4">
          <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-4 justify-center">
                  <Compass className="w-10 h-10 lg:w-12 lg:h-12 text-[#ff5100] drop-shadow-[0_0_30px_rgba(255,81,0,0.3)]" strokeWidth={1.2} />
                  <h2 className="text-white text-5xl lg:text-7xl font-bold tracking-tighter leading-none">
                    COMPASS.AI
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
                  <div className="px-6 py-3 border-b border-white/[0.05] flex items-center justify-center bg-white/[0.01]">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] text-center w-full">Recommended Starting Vectors</span>
                  </div>

                  {/* Interaction Terminal */}
                  <div className={`min-h-[60px] ${messages.length > 0 ? 'max-h-[450px]' : 'h-auto'} overflow-y-auto custom-scrollbar bg-black/20`}>
                    {messages.length === 0 && (
                      <div className="px-8 py-6 flex flex-nowrap gap-4 justify-center overflow-x-auto no-scrollbar">
                        {[
                          "Ladakh bike trip under 20k",
                          "Solo trek to Valley of Flowers",
                          "Scuba diving in Andaman islands"
                        ].map((v) => (
                            <button 
                              key={v}
                              onClick={() => send(v)}
                              className="px-6 py-3 rounded-full bg-white/[0.03] border border-white/[0.08] text-[12px] text-white/70 font-medium whitespace-nowrap hover:bg-[#ff5100]/10 hover:text-[#ff5100] hover:border-[#ff5100]/30 transition-all duration-300 shadow-lg flex-shrink-0"
                            >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                
                {messages.length > 0 && (
                  <div className="p-5 lg:p-6 space-y-5">
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
                                      {/* eslint-disable-next-line @next/next/no-im