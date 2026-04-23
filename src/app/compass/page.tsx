"use client";

import { useState, useRef, useEffect } from "react";
import {
  Loader2, Compass, ArrowRight, Send, MapPin, Clock,
  BarChart2, Sparkles, Zap, RotateCcw, WifiOff, RefreshCw,
  Mountain, Waves, Wind, TreePine,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import type { Adventure } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
  suggestAce?: boolean;
  chips?: string[];
  rateLimited?: boolean;
}

const STARTER_PROMPTS = [
  { label: "I want something remote and challenging", icon: Mountain },
  { label: "Beginner-friendly in Himachal Pradesh", icon: TreePine },
  { label: "Water adventure in coastal India", icon: Waves },
  { label: "Ladakh bike expedition", icon: Wind },
  { label: "Multi-day trek with summit views", icon: Mountain },
  { label: "Quick weekend escape from Mumbai", icon: Sparkles },
];

function deriveChips(msg: Message, roundCount: number): string[] {
  if (msg.rateLimited) return ["Try again"];
  const cards = msg.cards ?? [];
  const text = (msg.content ?? "").toLowerCase();
  const chips: string[] = [];

  if (cards.length > 0) {
    const diff = cards[0].difficulty;
    if (diff === "Hard" || diff === "Advanced" || diff === "Extreme") chips.push("Something easier");
    else if (diff === "Easy" || diff === "Moderate") chips.push("Something harder");
    chips.push(`More in ${cards[0].state}`);
    chips.push(`Other ${cards[0].type.toLowerCase()} options`);
    if (cards.length === 1) chips.push("Show more options");
    else chips.push("Shorter duration");
  }

  if (text.includes("mountain") || text.includes("coast") || text.includes("prefer")) {
    chips.push("Mountains", "Coastal", "Northeast");
  }
  if (text.includes("how many days") || text.includes("how long") || text.includes("duration")) {
    chips.push("Weekend (2–3 days)", "4–6 days", "7+ days");
  }
  if (text.includes("difficulty") || text.includes("experience") || text.includes("fitness") || text.includes("level")) {
    chips.push("I'm a beginner", "Moderate fitness", "Very fit");
  }
  if (text.includes("type") || text.includes("activity") || text.includes("kind")) {
    chips.push("Trekking", "Motorcycling", "Kayaking");
  }
  if (text.includes("solo") || text.includes("group") || text.includes("travel with")) {
    chips.push("Solo", "With friends", "Family trip");
  }
  if (chips.length < 2 && roundCount >= 2) {
    chips.push("Show remote options", "Best for summer", "High altitude");
  }

  return [...new Set(chips)].slice(0, 4);
}

export default function CompassPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [roundCount, setRoundCount] = useState(0);
  const [chipsVisible, setChipsVisible] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (loading) { setChipsVisible(false); return; }
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") {
      const t = setTimeout(() => setChipsVisible(true), 320);
      return () => clearTimeout(t);
    }
  }, [messages, loading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  function reset() {
    setMessages([]);
    setInput("");
    setRoundCount(0);
    setChipsVisible(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    if (msg === "Try again") {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        setMessages((prev) => prev.slice(0, -1));
        await send(lastUserMsg.content);
        return;
      }
    }

    setInput("");
    setChipsVisible(false);
    const userMsg: Message = { role: "user", content: msg };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const newRound = roundCount + 1;
      const assistantMsg: Message = {
        role: "assistant",
        content: data.rateLimited ? "" : (data.text || (data.error ? "Something went wrong — please try again." : "")),
        cards: (data.cards ?? []) as Adventure[],
        recommendations: data.recommendations ?? [],
        suggestAce: data.suggestAce ?? false,
        rateLimited: data.rateLimited ?? false,
      };
      assistantMsg.chips = deriveChips(assistantMsg, newRound);
      setMessages((prev) => [...prev, assistantMsg]);
      setRoundCount(newRound);
    } catch {
      const errMsg: Message = { role: "assistant", content: "", rateLimited: true };
      errMsg.chips = ["Try again"];
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  const lastMsg = messages[messages.length - 1];
  const activeChips = lastMsg?.role === "assistant" ? (lastMsg.chips ?? []) : [];
  const showChips = chipsVisible && activeChips.length > 0 && !loading;
  const hasConversation = messages.length > 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-page)" }}>
      <Navbar />

      {/* Hero area — collapses once conversation starts */}
      <div
        className="transition-all duration-500 overflow-hidden"
        style={{ maxHeight: hasConversation ? 0 : 500, opacity: hasConversation ? 0 : 1 }}
      >
        <div className="pt-28 pb-10 px-5 text-center relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#ff5100]/[0.06] blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#ff5100]/20 bg-[#ff5100]/8 mb-8">
              <Sparkles className="w-3 h-3 text-[#ff5100]" />
              <span className="text-[#ff5100] text-[10px] font-black tracking-[0.25em] uppercase">AI Adventure Finder</span>
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#ff5100] flex items-center justify-center shadow-2xl shadow-[#ff5100]/40">
                <Compass className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-5xl lg:text-6xl font-black tracking-[-0.04em] t-text">
                Compass<span className="text-[#ff5100]">.AI</span>
              </h1>
            </div>

            <p className="text-lg t-text-2 leading-relaxed mb-10">
              Describe your escape.{" "}
              <span className="t-text font-semibold">We&apos;ll find the adventure.</span>
            </p>

            {/* Starter prompt grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto">
              {STARTER_PROMPTS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => send(label)}
                  className="group flex items-start gap-2.5 p-3.5 rounded-xl border text-left transition-all duration-200 hover:border-[#ff5100]/40 hover:bg-[#ff5100]/5 hover:-translate-y-0.5"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-default)",
                  }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#ff5100]/60 group-hover:text-[#ff5100] transition-colors" />
                  <span className="text-[11px] font-medium leading-snug t-text-2 group-hover:t-text transition-colors">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat shell */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 lg:px-6 pb-8">
        {/* Compact header when conversation active */}
        {hasConversation && (
          <div className="pt-20 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ff5100] flex items-center justify-center shadow-lg shadow-[#ff5100]/30">
                <Compass className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-lg font-black tracking-[-0.02em] t-text">
                Compass<span className="text-[#ff5100]">.AI</span>
              </span>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-white/5 hover:border-white/20"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}
            >
              <RotateCcw className="w-3 h-3" />
              New chat
            </button>
          </div>
        )}

        {/* Messages */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto"
          style={{ minHeight: hasConversation ? 0 : undefined }}
        >
          {hasConversation && (
            <div className="space-y-6 pb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center mt-0.5">
                      <Compass className="w-4 h-4 text-[#ff5100]" strokeWidth={2} />
                    </div>
                  )}

                  <div className={`space-y-3 ${msg.role === "assistant" ? "flex-1 min-w-0" : "max-w-[80%]"}`}>
                    {msg.content && (
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "text-white font-medium rounded-tr-sm"
                            : "rounded-tl-sm t-text border"
                        }`}
                        style={
                          msg.role === "user"
                            ? { background: "#ff5100" }
                            : { background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }
                        }
                      >
                        {msg.content}
                      </div>
                    )}

                    {msg.rateLimited && (
                      <div
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-sm border"
                        style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
                      >
                        <WifiOff className="w-4 h-4 shrink-0 opacity-30" style={{ color: "var(--text-secondary)" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium t-text">Compass is taking a breather</p>
                          <p className="text-[11px] t-text-3 mt-0.5">High demand right now — try again in a moment.</p>
                        </div>
                        <button
                          onClick={() => send("Try again")}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all hover:border-[#ff5100]/50 hover:text-[#ff5100]"
                          style={{ borderColor: "var(--border-default)", color: "var(--text-tertiary)" }}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </button>
                      </div>
                    )}

                    {msg.suggestAce && (
                      <Link
                        href="/ace"
                        className="group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff5100]/10"
                        style={{ borderColor: "rgba(255,81,0,0.3)", background: "var(--bg-page)" }}
                      >
                        <div className="h-0.5 bg-gradient-to-r from-[#ff5100] via-[#ff7d47] to-transparent" />
                        <div className="p-4 flex items-start gap-4">
                          <div className="shrink-0 w-11 h-11 rounded-xl bg-[#ff5100] flex items-center justify-center shadow-lg shadow-[#ff5100]/30">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff5100]">Personalised for you</span>
                            <p className="text-sm font-bold t-text group-hover:text-[#ff5100] transition-colors mt-0.5">Take the ACE Assessment</p>
                            <p className="text-[11px] t-text-3 mt-1 leading-relaxed">
                              Your Adventure Capability Engine profile matches you to adventures based on actual fitness, skills, and risk tolerance.
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#ff5100] shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <div className="px-4 pb-3 flex items-center gap-2 text-[10px] font-semibold text-[#ff5100]">
                          <span>2 minutes</span>
                          <span className="opacity-30">·</span>
                          <span>Free</span>
                          <span className="opacity-30">·</span>
                          <span>Instant results</span>
                        </div>
                      </Link>
                    )}

                    {msg.cards && msg.cards.length > 0 && (
                      <AdventureCards cards={msg.cards.slice(0, 2)} recommendations={msg.recommendations} />
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-[#ff5100]" strokeWidth={2} />
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm border"
                    style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
                  >
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-[#ff5100]/60 animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s`, animationDuration: "0.8s" }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Follow-up chips */}
        {showChips && (
          <div
            className="flex items-center gap-2 overflow-x-auto pb-3 mb-1"
            style={{ scrollbarWidth: "none" }}
          >
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] opacity-40 t-text whitespace-nowrap">Refine</span>
            <div className="w-px h-3 shrink-0 opacity-10 bg-white" />
            {activeChips.map((chip) => (
              <button
                key={chip}
                onClick={() => send(chip)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200 hover:border-[#ff5100]/60 hover:text-[#ff5100] hover:bg-[#ff5100]/5 whitespace-nowrap"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div
          className="rounded-2xl border overflow-hidden shadow-[0_8px_40px_-8px_rgba(0,0,0,0.5)]"
          style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}
        >
          <div className="flex items-center gap-2.5 p-3">
            <div
              className="flex items-center gap-2.5 flex-1 rounded-xl px-4 border transition-all duration-200 focus-within:border-[#ff5100]/40"
              style={{ background: "var(--bg-page)", borderColor: "var(--border-subtle)" }}
            >
              <Compass className="w-4 h-4 text-[#ff5100]/50 shrink-0" />
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && send()}
                placeholder={hasConversation ? "Refine or ask something new…" : "Where should I go? What do I need? Ask anything…"}
                className="flex-1 bg-transparent text-sm py-3.5 outline-none t-text placeholder:t-text-3"
              />
            </div>
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="shrink-0 h-11 w-11 flex items-center justify-center rounded-xl bg-[#ff5100] text-white disabled:opacity-25 hover:bg-[#ff7d47] active:scale-95 transition-all duration-200 shadow-lg shadow-[#ff5100]/25"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="px-5 pb-3 flex items-center justify-between">
            <p className="text-[10px] tracking-wide italic" style={{ color: "var(--text-tertiary)" }}>
              Powered by <span className="font-semibold not-italic">Groq</span> · Llama 3.3 70B
            </p>
            {hasConversation && (
              <button
                onClick={reset}
                className="text-[10px] font-medium flex items-center gap-1 transition-colors hover:text-[#ff5100]"
                style={{ color: "var(--text-tertiary)" }}
              >
                <RotateCcw className="w-2.5 h-2.5" />
                New chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdventureCards({
  cards,
  recommendations,
}: {
  cards: Adventure[];
  recommendations?: { slug: string; name: string; reason: string }[];
}) {
  const colClass = cards.length === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-2";
  return (
    <div className={`grid gap-3 ${colClass}`}>
      {cards.map((card, ci) => {
        const rec = recommendations?.find((r) => r.slug === card.slug);
        return (
          <Link
            key={ci}
            href={`/experiences/${card.slug}`}
            className="group flex flex-col rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff5100]/30 hover:shadow-xl hover:shadow-[#ff5100]/5"
            style={{ background: "var(--bg-page)", borderColor: "var(--border-subtle)" }}
          >
            <div className="relative h-32 overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.heroImage}
                alt={card.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#ff5100] text-white text-[9px] font-black uppercase tracking-wider">{card.type}</span>
                <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/90 text-[9px] font-semibold flex items-center gap-0.5 border border-white/10">
                  <MapPin className="w-2 h-2" />{card.state}
                </span>
              </div>
            </div>
            <div className="p-3 flex-1 flex flex-col gap-1.5">
              <h4 className="text-[13px] font-bold leading-snug group-hover:text-[#ff5100] transition-colors t-text line-clamp-2">{card.name}</h4>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="flex items-center gap-1 text-[10px] t-text-3"><BarChart2 className="w-2.5 h-2.5" />{card.difficulty}</span>
                {card.durationDays && (
                  <span className="flex items-center gap-1 text-[10px] t-text-3"><Clock className="w-2.5 h-2.5" />{card.durationDays}</span>
                )}
              </div>
              {rec?.reason && (
                <p className="text-[10px] leading-relaxed t-text-3 italic pt-1.5 border-t mt-auto" style={{ borderColor: "var(--border-subtle)" }}>{rec.reason}</p>
              )}
            </div>
            <div className="px-3 py-2 border-t flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff5100]">View</span>
              <ArrowRight className="w-3 h-3 text-[#ff5100] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
