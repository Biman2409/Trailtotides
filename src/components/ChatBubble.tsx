"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, ChevronRight, Compass, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Adventure } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
  suggestAce?: boolean;
}

export default function ChatBubble({ alwaysVisible = false, opaque = false }: { alwaysVisible?: boolean; opaque?: boolean }) {
  const [visible, setVisible] = useState(alwaysVisible);
  const [labelVisible, setLabelVisible] = useState(false);
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
  const [nudge, setNudge] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (alwaysVisible) { setVisible(true); return; }

    // Safety net: always show after 4s no matter what
    const timer = setTimeout(() => setVisible(true), 4000);

    // Show on first scroll
    const onScroll = () => setVisible(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });

    // Try IntersectionObserver for early reveal if sentinel exists
    const target = document.getElementById("featured-adventures");
    if (target) {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisible(true); },
        { threshold: 0.1 }
      );
      observer.observe(target);
      return () => { clearTimeout(timer); observer.disconnect(); window.removeEventListener("scroll", onScroll); };
    }

    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, []);

  // Show the "Compass.AI" label alongside the button once it appears, and keep
  // it up until the user scrolls past the on-page Compass.AI (#ai-finder)
  // section — at which point it's retracted since the feature's already introduced.
  useEffect(() => {
    if (!visible || open) return;
    const showTimer = setTimeout(() => setLabelVisible(true), 250);
    return () => clearTimeout(showTimer);
  }, [visible, open]);

  useEffect(() => {
    if (open) { setLabelVisible(false); return; }

    const target = document.getElementById("ai-finder");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Section has fully scrolled above the viewport — retract the label.
        if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
          setLabelVisible(false);
        }
      },
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [open]);

  // Once the Compass.AI (#ai-finder) section has fully scrolled past, give the
  // button a brief attention pulse instead of forcing the panel open — the
  // user still chooses to click it. If they already have the panel open once
  // the Adventure Map (#map-cta) section scrolls past, close it for them.
  useEffect(() => {
    const finder = document.getElementById("ai-finder");
    if (!finder) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
          setNudge(true);
          setLabelVisible(true);
          setTimeout(() => { setNudge(false); setLabelVisible(false); }, 2400);
        }
      },
      { threshold: 0 }
    );
    observer.observe(finder);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mapSection = document.getElementById("map-cta");
    if (!mapSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
          setOpen(false);
        }
      },
      { threshold: 0 }
    );
    observer.observe(mapSection);
    return () => observer.disconnect();
  }, []);

  function toggleOpen() {
    setOpen((v) => !v);
  }

  function closePanel() {
    setOpen(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const recommendationRounds = messages.filter((m) => m.role === "assistant" && (m.cards?.length ?? 0) > 0).length;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg]
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
          recommendationRounds,
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
          suggestAce: data.suggestAce,
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
      {/* Floating button — a single seamless capsule that extends to show the
          "Compass.AI" label, then elegantly collapses back to just the icon. */}
      <button
        onClick={toggleOpen}
        className={`fixed lg:bottom-8 max-lg:bottom-[88px] right-8 z-50 flex items-center rounded-full hover:scale-105 active:scale-95 group ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"
        }`}
        style={{
          background: labelVisible ? (opaque ? "var(--bg-surface)" : "var(--bg-card)") : "#ff5100",
          border: "2px solid #ff5100",
          boxShadow: "0 10px 40px -10px rgba(255,81,0,0.45)",
          transition: "background-color 0.4s ease, opacity 0.6s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        aria-label="Open Compass.AI"
      >
        <span
          className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,padding] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            labelVisible ? "max-w-[140px] opacity-100 pl-5 pr-1" : "max-w-0 opacity-0 pl-0 pr-0"
          }`}
          style={{ transitionDuration: "500ms" }}
        >
          <span className="block text-left text-sm font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
            Compass<span style={{ color: "#ff5100" }}>.AI</span>
          </span>
          <span className="block text-left italic text-[10px] leading-tight mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            AI Assistant
          </span>
        </span>
        <span
          className="relative flex items-center justify-center w-[52px] h-[52px] rounded-full shrink-0 transition-colors duration-400"
          style={{ color: labelVisible ? "#ff5100" : "#ffffff" }}
        >
          <span
            className={`absolute inset-0 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ${
              labelVisible ? "bg-[#ff5100]/10" : "bg-white/20"
            }`}
          />
          <Compass className={`w-6 h-6 relative z-10 transition-transform duration-700 ${open ? 'rotate-180' : 'group-hover:rotate-90'}`} />
        </span>
      </button>

        {/* Chat panel */}
        {open && (
          <div className="fixed lg:bottom-28 max-lg:bottom-[108px] right-8 z-50 w-[380px] max-w-[calc(100vw-4rem)] rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out backdrop-blur-3xl"
            style={{ background: opaque ? "var(--bg-surface)" : "var(--bg-card)", border: "1px solid var(--border-default)", boxShadow: "0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px var(--border-subtle)" }}
          >
            {/* Header */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff5100] to-[#ff7d47] flex items-center justify-center shadow-lg shadow-[#ff5100]/20">
                  <Compass className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[var(--text-primary)] font-semibold text-sm tracking-tight">Compass<span className="text-[#ff5100]">.</span><span className="text-[#ff5100]">AI</span></p>
                          <p className="text-left italic text-xs text-[var(--text-muted)] leading-none mt-0.5">AI Assistant</p>
                        </div>
              </div>
            <button
              onClick={closePanel}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
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
                          : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-tl-[5px] font-light"
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
                            className="flex items-stretch bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#ff5100]/40 rounded-xl overflow-hidden transition-all duration-500 group shadow-lg"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={card.heroImage}
                              alt={card.name}
                              className="w-16 h-16 object-cover flex-shrink-0 group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="p-2.5 flex-1 min-w-0 flex flex-col justify-center">
                              <p className="text-[var(--text-primary)] text-[12px] font-semibold truncate group-hover:text-[#ff5100] transition-colors">
                                {card.name}
                              </p>
                              <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest truncate mt-0.5">
                                {card.state} · {card.type}
                              </p>
                              {rec?.reason && (
                                <p className="text-[#ff5100]/80 text-[10px] mt-1 line-clamp-2 leading-snug italic font-medium">
                                  &quot;{rec.reason}&quot;
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[#ff5100] self-center mr-3 flex-shrink-0 transition-all group-hover:translate-x-1" />
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {msg.suggestAce && (
                    <Link
                      href="/matchmaker"
                      className="group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
                      style={{ borderColor: "rgba(255,81,0,0.3)", background: "var(--bg-surface)" }}
                    >
                      <div className="shrink-0 w-9 h-9 rounded-lg bg-[#ff5100] flex items-center justify-center shadow-lg shadow-[#ff5100]/30">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-[var(--text-primary)] group-hover:text-[#ff5100] transition-colors">
                          Take the Adventure Matchmaker
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 leading-snug">
                          8 quick questions — get matched straight to adventures your body is ready for.
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#ff5100] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] px-4 py-3 rounded-xl rounded-tl-[5px] flex items-center gap-2.5">
                  <Loader2 className="w-3.5 h-3.5 text-[#ff5100] animate-spin" />
                  <span className="text-[var(--text-tertiary)] text-[11px] font-medium tracking-wide">Mapping optimal routes…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="relative flex items-center gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask Compass.AI..."
                    className="flex-1 bg-[var(--bg-surface)] border-[1.5px] border-[var(--border-strong)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm px-4 py-3.5 rounded-xl focus:bg-[var(--bg-card-hover)] focus:border-[#ff5100] focus:shadow-[0_0_0_3px_rgba(255,81,0,0.14)] transition-all font-light"
                    style={{ outline: "none" }}
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
