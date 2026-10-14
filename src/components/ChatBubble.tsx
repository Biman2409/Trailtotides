"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ArrowUp, Compass, ChevronRight, Zap, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { COMPASS_ASK_EVENT, COMPASS_GRADIENT, COMPASS_RING, STARTER_PROMPTS, deriveChips, type CompassMessage } from "@/lib/compass";

// Compass's identity: one warm orange gradient used for the orb, the button ring and the send button.
const AI_GRADIENT = COMPASS_GRADIENT;
const AI_RING = COMPASS_RING;

function Orb({ size = 28, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 ${pulse ? "compass-orb-pulse" : ""}`}
      style={{ width: size, height: size, background: AI_GRADIENT }}
      aria-hidden
    >
      <Compass className="text-white" style={{ width: size * 0.56, height: size * 0.56 }} strokeWidth={2.2} />
    </span>
  );
}

export default function ChatBubble({ alwaysVisible = false }: { alwaysVisible?: boolean; opaque?: boolean }) {
  const [visible, setVisible] = useState(alwaysVisible);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<CompassMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<CompassMessage[]>([]);
  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  messagesRef.current = messages;
  loadingRef.current = loading;
  const { ace } = useFitnessProfile();
  const aceRef = useRef(ace);
  aceRef.current = ace;

  // Reveal the button on first scroll, or after a few seconds regardless.
  useEffect(() => {
    if (alwaysVisible) { setVisible(true); return; }
    const timer = setTimeout(() => setVisible(true), 3000);
    const onScroll = () => setVisible(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, [alwaysVisible]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || loadingRef.current) return;

    let history = messagesRef.current;
    // "Try again" re-asks the last question instead of sending the words "Try again".
    let question = text;
    if (text === "Try again") {
      const lastUser = [...history].reverse().find((m) => m.role === "user");
      if (!lastUser) return;
      question = lastUser.content;
      history = history.slice(0, history.lastIndexOf(lastUser));
    }

    const userMsg: CompassMessage = { role: "user", content: question };
    const next = [...history, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const recommendationRounds = next.filter((m) => m.role === "assistant" && (m.cards?.length ?? 0) > 0).length;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          recommendationRounds,
          // Fitness profile (8 levels, completed trips included) so picks fit what they can handle
          ace: aceRef.current ?? undefined,
        }),
      });
      const data = await res.json();
      const failed = !!data.rateLimited || (!data.text && !!data.error);
      const reply: CompassMessage = {
        role: "assistant",
        content: failed ? "" : (data.text ?? ""),
        cards: data.cards ?? [],
        recommendations: data.recommendations ?? [],
        suggestAce: !!data.suggestAce,
        failed,
      };
      reply.chips = deriveChips(reply, recommendationRounds + 1);
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "", failed: true, chips: ["Try again"] }]);
    } finally {
      setLoading(false);
    }
  }, []);

  // The hero prompt bar (and anything else) can open Compass with a question already asked.
  useEffect(() => {
    const onAsk = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      setVisible(true);
      setOpen(true);
      if (text) send(text);
    };
    window.addEventListener(COMPASS_ASK_EVENT, onAsk);
    return () => window.removeEventListener(COMPASS_ASK_EVENT, onAsk);
  }, [send]);

  function reset() {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }

  const last = messages[messages.length - 1];
  const chips = !loading && last?.role === "assistant" ? (last.chips ?? []) : [];
  const canSend = !!input.trim() && !loading;

  return (
    <>
      <style>{`
        @keyframes compassSpin { to { transform: rotate(360deg); } }
        @keyframes compassPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,81,0,0.35); } 50% { box-shadow: 0 0 0 10px rgba(255,81,0,0); } }
        @keyframes compassDot { 0%,80%,100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
        .compass-orb-pulse { animation: compassPulse 2.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .compass-ring, .compass-orb-pulse, .compass-dot { animation: none !important; }
        }
      `}</style>

      {/* Floating button — a dark orb inside a slowly turning gradient ring */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`group fixed right-5 lg:right-8 bottom-[88px] lg:bottom-8 z-50 w-14 h-14 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
        style={{ boxShadow: "0 10px 32px -6px rgba(255,81,0,0.35), 0 4px 14px rgba(0,0,0,0.25)" }}
        aria-label={open ? "Close Compass.AI" : "Ask Compass.AI"}
        aria-expanded={open}
      >
        <span className="absolute inset-0 rounded-full overflow-hidden">
          <span className="compass-ring absolute -inset-1" style={{ background: AI_RING, animation: "compassSpin 6s linear infinite" }} />
        </span>
        <span className="absolute inset-[2px] rounded-full flex items-center justify-center" style={{ background: "#16110f" }}>
          {open ? (
            <X className="w-5 h-5 text-white/90" />
          ) : (
            <Compass className="w-6 h-6 text-white transition-transform duration-700 group-hover:rotate-90" strokeWidth={2} />
          )}
        </span>
        {!open && (
          <span
            className="hidden lg:block absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none"
            style={{ background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
          >
            Ask Compass.AI
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Compass.AI"
          className="fixed z-50 inset-x-3 bottom-[156px] lg:inset-x-auto lg:right-8 lg:bottom-[104px] lg:w-[360px] flex flex-col rounded-[22px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out"
          style={{
            // Shrink-wrap the empty state; grow to a fixed height once there's a conversation to scroll
            height: messages.length > 0 ? "min(520px, calc(100dvh - 190px))" : "auto",
            maxHeight: "calc(100dvh - 190px)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 30px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02)",
          }}
        >
          {/* Gradient hairline — the only colour in the chrome */}
          <div className="h-px w-full shrink-0" style={{ background: AI_GRADIENT, opacity: 0.8 }} />

          {/* Header */}
          <div className="flex items-center gap-2.5 pl-3.5 pr-2 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <Orb size={26} />
            <p className="flex-1 min-w-0 text-[14px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Compass<span style={{ color: "#ff5100" }}>.AI</span>
            </p>
            {messages.length > 0 && (
              <button
                onClick={reset}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--bg-card-hover)]"
                style={{ color: "var(--text-tertiary)" }}
                aria-label="Start a new chat"
                title="New chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col">
                <div className="flex flex-col items-center text-center pt-2 pb-4">
                  <Orb size={36} pulse />
                  <p className="mt-3 text-base font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
                    Where to next?
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed max-w-[240px]" style={{ color: "var(--text-secondary)" }}>
                    Tell me how you like to travel and I&apos;ll find adventures that fit.
                  </p>
                </div>
                <div className="space-y-1.5">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="group w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left text-[13px] transition-colors hover:bg-[var(--bg-card-hover)]"
                      style={{ border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
                    >
                      <span className="group-hover:text-[var(--text-primary)] transition-colors">{p}</span>
                      <ChevronRight className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((msg, i) =>
                  msg.role === "user" ? (
                    <div key={i} className="flex justify-end">
                      <div
                        className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-md text-[13px] leading-relaxed"
                        style={{ background: "var(--bg-card-hover)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
                      <Orb size={24} />
                      <div className="flex-1 min-w-0 space-y-3 pt-0.5">
                        {msg.failed ? (
                          <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            I couldn&apos;t reach my brain just now. Give it another go?
                          </p>
                        ) : msg.content ? (
                          <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: "var(--text-primary)" }}>
                            {msg.content}
                          </p>
                        ) : null}

                        {msg.cards && msg.cards.length > 0 && (
                          <div className="space-y-2">
                            {msg.cards.map((card) => {
                              const rec = msg.recommendations?.find((r) => r.slug === card.slug);
                              return (
                                <Link
                                  key={card.slug}
                                  href={`/experiences/${card.slug}`}
                                  className="group flex items-center gap-3 p-1.5 rounded-xl transition-colors hover:bg-[var(--bg-card-hover)]"
                                  style={{ border: "1px solid var(--border-subtle)" }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={card.heroImage} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{card.name}</p>
                                    <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{card.state} · {card.type}</p>
                                    {rec?.reason && (
                                      <p className="text-[11px] leading-snug mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{rec.reason}</p>
                                    )}
                                  </div>
                                  <ChevronRight className="w-4 h-4 shrink-0 mr-1 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" style={{ color: "var(--text-secondary)" }} />
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        {msg.suggestAce && (
                          <Link
                            href="/matchmaker"
                            className="group flex items-center gap-3 p-3 rounded-2xl transition-colors hover:bg-[var(--bg-card-hover)]"
                            style={{ border: "1px solid var(--border-subtle)" }}
                          >
                            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: AI_GRADIENT }}>
                              <Zap className="w-4 h-4 text-white" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>Try the Adventure Matchmaker</span>
                              <span className="block text-[11px] leading-snug mt-0.5" style={{ color: "var(--text-tertiary)" }}>A few quick questions to match adventures to your fitness.</span>
                            </span>
                            <ChevronRight className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: "var(--text-secondary)" }} />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                )}

                {loading && (
                  <div className="flex gap-2.5 items-center">
                    <Orb size={24} pulse />
                    <span className="flex items-center gap-1" aria-label="Compass is thinking">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="compass-dot w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--text-secondary)", animation: `compassDot 1.2s ease-in-out ${d * 0.15}s infinite` }}
                        />
                      ))}
                    </span>
                  </div>
                )}

                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-[34px] animate-in fade-in duration-300">
                    {chips.map((c) => (
                      <button
                        key={c}
                        onClick={() => send(c)}
                        className="px-3 py-1.5 rounded-full text-[12px] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                        style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="px-3 pt-1.5 pb-2.5 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="compass-composer flex items-center gap-2 pl-3.5 pr-1 py-1 rounded-xl transition-shadow"
              style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-default)" }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the trip you have in mind…"
                aria-label="Message Compass.AI"
                className="flex-1 min-w-0 bg-transparent text-[13.5px] py-2 outline-none placeholder:text-[var(--text-tertiary)]"
                // Focus is shown on the whole composer (focus-within ring), not the bare input
                style={{ color: "var(--text-primary)", outline: "none" }}
              />
              <button
                type="submit"
                disabled={!canSend}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:cursor-not-allowed"
                style={canSend ? { background: AI_GRADIENT, color: "#fff" } : { background: "var(--border-subtle)", color: "var(--text-tertiary)" }}
                aria-label="Send"
              >
                <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </form>
            <p className="text-[8px] leading-none tracking-wide text-center mt-1.5 opacity-80" style={{ color: "var(--text-tertiary)" }}>
              AI can make mistakes. Confirm details with the operator.
            </p>
          </div>
          <style>{`.compass-composer:focus-within { box-shadow: 0 0 0 3px rgba(255,81,0,0.16); border-color: rgba(255,81,0,0.5) !important; }`}</style>
        </div>
      )}
    </>
  );
}
