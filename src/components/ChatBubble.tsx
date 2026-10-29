"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ArrowUp, ChevronRight, RotateCcw, Mountain, Bike, Sparkles, Snowflake, Gauge, Compass as CompassIcon } from "lucide-react";
import { CompassAIMark, MatchmakerMark } from "@/components/ui/custom/BrandMarks";
import Link from "next/link";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { COMPASS_ASK_EVENT, COMPASS_GRADIENT, COMPASS_RING, deriveChips, type CompassMessage } from "@/lib/compass";
import { getACE, computeDifficulty, computeMatchScore, type ACE } from "@/lib/ace";
import { getLowestPrice, type Adventure } from "@/lib/data";
import { bucketFor } from "@/lib/fitness";
import { DIFFICULTY_CONFIG } from "@/components/ui/custom/DifficultyMeter";

// Compass's identity: one warm orange gradient used for the orb, the button ring and the send button.
const AI_GRADIENT = COMPASS_GRADIENT;
const AI_RING = COMPASS_RING;

// What the thinking row says as the wait goes on, and when each line appears (ms). Most answers
// come back at once; the later lines only show when a question needs the AI.
const WAIT_LINES = ["Thinking…", "Looking through every adventure…", "Matching them to what you asked…", "Almost there, the AI is busy right now…"];
const WAIT_AT = [0, 3000, 8000, 15000];
// Past this the server has already given up on the AI, so stop waiting too
const CLIENT_TIMEOUT_MS = 45_000;

// The conversation survives moving between Home, Explore and the Map (each mounts its own chat)
const STORE_KEY = "ttt_compass_chat";

// The start screen's suggestions, each a question Compass answers well
const PROMPTS = [
  { icon: Mountain, text: "A beginner trek in Himachal" },
  { icon: Bike, text: "A bike trip in Ladakh" },
  { icon: Snowflake, text: "A snow trek in Uttarakhand" },
  { icon: Sparkles, text: "A challenging climb in Nepal" },
];

function Orb({ size = 28, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 ${pulse ? "compass-orb-pulse" : ""}`}
      style={{ width: size, height: size, background: AI_GRADIENT }}
      aria-hidden
    >
      <CompassAIMark className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} strokeWidth={2.1} />
    </span>
  );
}

/** One recommended adventure: photo, the facts that decide a trip, why it fits, and your match */
function PickCard({ adventure, reason, ace }: { adventure: Adventure; reason?: string; ace: ACE | null }) {
  const difficulty = computeDifficulty(getACE(adventure));
  const color = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.color ?? "#94a3b8";
  const price = getLowestPrice(adventure);
  const match = ace ? computeMatchScore(ace, getACE(adventure)) : null;
  const b = match !== null ? bucketFor(match) : null;
  return (
    <Link
      href={`/experiences/${adventure.slug}`}
      className="group flex gap-3 p-2 rounded-2xl transition-colors hover:bg-[var(--bg-card-hover)]"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      <span className="relative w-[76px] h-[76px] rounded-xl overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- small thumbnail, many hosts */}
        <img src={adventure.heroImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {b && (
          <span className="absolute bottom-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white tabular-nums" style={{ background: "rgba(0,0,0,0.65)" }}>
            <span style={{ color: b.color }}>●</span> {match}%
          </span>
        )}
      </span>
      <span className="flex-1 min-w-0 py-0.5">
        <span className="flex items-start gap-1.5">
          <span className="text-[13.5px] font-semibold leading-snug line-clamp-1 flex-1" style={{ color: "var(--text-primary)" }}>{adventure.name}</span>
          <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" style={{ color: "var(--text-secondary)" }} />
        </span>
        <span className="flex items-center gap-1.5 mt-1 text-[11px] flex-wrap" style={{ color: "var(--text-tertiary)" }}>
          <span className="font-semibold px-1.5 py-px rounded-md" style={{ color, background: `${color}1f` }}>{difficulty}</span>
          <span>{adventure.durationDays}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{adventure.state}</span>
          {price ? <><span aria-hidden>·</span><span>from ₹{price.toLocaleString("en-IN")}</span></> : null}
        </span>
        {reason && <span className="block text-[11.5px] leading-snug mt-1.5 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{reason}</span>}
      </span>
    </Link>
  );
}

export default function ChatBubble({ alwaysVisible = false }: { alwaysVisible?: boolean; opaque?: boolean }) {
  const [visible, setVisible] = useState(alwaysVisible);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<CompassMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitStage, setWaitStage] = useState(0);
  useEffect(() => {
    if (!loading) { setWaitStage(0); return; }
    const timers = WAIT_AT.slice(1).map((ms, i) => setTimeout(() => setWaitStage(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [loading]);
  const messagesRef = useRef<CompassMessage[]>([]);
  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  messagesRef.current = messages;
  loadingRef.current = loading;
  const { ace } = useFitnessProfile();
  const aceRef = useRef(ace);
  aceRef.current = ace;

  // Pick the conversation back up after moving to another page, and keep it as it grows
  useEffect(() => {
    try { const saved = sessionStorage.getItem(STORE_KEY); if (saved) setMessages(JSON.parse(saved)); } catch {}
  }, []);
  useEffect(() => {
    try {
      if (messages.length) sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-20)));
      else sessionStorage.removeItem(STORE_KEY);
    } catch {}
  }, [messages]);

  // Reveal the button on first scroll, or after a few seconds regardless.
  // Pages whose hero already has a Compass bar mark it [data-hide-compass]; there the button
  // stays hidden until the hero is mostly scrolled away, so two Compass entry points never sit together.
  useEffect(() => {
    if (alwaysVisible) { setVisible(true); return; }
    const hero = document.querySelector("[data-hide-compass]");
    if (hero) {
      const observer = new IntersectionObserver(
        ([entry]) => setVisible(entry.intersectionRatio < 0.35),
        { threshold: [0, 0.35, 1] },
      );
      observer.observe(hero);
      return () => observer.disconnect();
    }
    const timer = setTimeout(() => setVisible(true), 3000);
    const onScroll = () => setVisible(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, [alwaysVisible]);

  // On phones the button would sit over whatever is being read, so it tucks away while
  // scrolling down and comes back on any scroll up
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 8) return;
      setTucked(y > lastY && y > 120);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
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
        .compass-composer:focus-within { box-shadow: 0 0 0 3px rgba(255,81,0,0.16); border-color: rgba(255,81,0,0.5) !important; }
        /* Never taller than the room between the navbar (top) and the button (bottom).
           The start screen shrink-wraps; a conversation takes the full height to scroll in. */
        .compass-panel { max-height: calc(100dvh - 156px - 76px); }
        .compass-panel-tall { height: min(600px, calc(100dvh - 156px - 76px)); }
        @media (min-width: 1024px) {
          .compass-panel { max-height: calc(100dvh - 104px - 96px); }
          .compass-panel-tall { height: min(600px, calc(100dvh - 104px - 96px)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .compass-ring, .compass-orb-pulse, .compass-dot { animation: none !important; }
        }
      `}</style>

      {/* Floating button — a dark orb inside a slowly turning gradient ring */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`group fixed right-5 lg:right-8 bottom-[88px] lg:bottom-8 z-50 w-14 h-14 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 ${
          visible || open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        } ${tucked && !open ? "max-lg:opacity-0 max-lg:translate-y-8 max-lg:pointer-events-none" : ""}`}
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
            <CompassAIMark className="w-6 h-6 text-white transition-transform duration-700 group-hover:rotate-90" strokeWidth={2} />
          )}
        </span>
        {/* A dot while a conversation is waiting to be picked back up */}
        {!open && messages.length > 0 && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2" style={{ background: "#ff5100", borderColor: "var(--bg-page)" }} aria-hidden />
        )}
        {!open && (
          <span
            className="hidden lg:block absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none"
            style={{ background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
          >
            {messages.length > 0 ? "Back to your chat" : "Ask Compass.AI"}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Compass.AI"
          className={`compass-panel fixed z-50 inset-x-3 bottom-[156px] lg:inset-x-auto lg:right-8 lg:bottom-[104px] lg:w-[400px] flex flex-col rounded-[24px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out ${messages.length > 0 ? "compass-panel-tall" : ""}`}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 30px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02)",
          }}
        >
          {/* Header: who you're talking to, and whether its picks know your fitness */}
          <div className="relative shrink-0 px-4 pt-3.5 pb-3" style={{ background: "linear-gradient(180deg, rgba(255,81,0,0.10), transparent)", borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-2.5">
              <Orb size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
                  Compass<span style={{ color: "#ff5100" }}>.AI</span>
                </p>
                {ace ? (
                  <p className="flex items-center gap-1 text-[11.5px] leading-tight mt-0.5" style={{ color: "#10b981" }}>
                    <Gauge className="w-3 h-3" /> Picks matched to your fitness
                  </p>
                ) : (
                  <Link href="/matchmaker?mode=quick" className="flex items-center gap-1 text-[11.5px] leading-tight mt-0.5 hover:underline" style={{ color: "var(--text-tertiary)" }}>
                    <Gauge className="w-3 h-3" /> Take the quick match for personal picks
                  </Link>
                )}
              </div>
              {messages.length > 0 && (
                <button
                  onClick={reset}
                  className="h-8 px-2.5 rounded-full flex items-center gap-1 text-[12px] font-semibold transition-colors hover:bg-[var(--bg-card-hover)]"
                  style={{ color: "var(--text-secondary)" }}
                  aria-label="Start a new chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> New
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--bg-card-hover)]"
                style={{ color: "var(--text-tertiary)" }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar" aria-live="polite">
            {messages.length === 0 ? (
              <div className="flex flex-col">
                <p className="text-[18px] font-bold tracking-tight leading-snug" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display), Georgia, serif" }}>
                  Where to next?
                </p>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Say where, what kind of trip and how long. I&apos;ll pick from every adventure on Trail to Tides.
                </p>
                <p className="mt-4 mb-2 text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>Try asking</p>
                <div className="grid grid-cols-2 gap-2">
                  {PROMPTS.map((p) => (
                    <button
                      key={p.text}
                      onClick={() => send(p.text)}
                      className="group flex items-center gap-2.5 p-2.5 rounded-2xl text-left text-[12.5px] leading-snug font-medium transition-colors hover:bg-[var(--bg-card-hover)] hover:border-[#ff5100]/40"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                    >
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.12)" }}>
                        <p.icon className="w-3.5 h-3.5 text-[#ff5100]" />
                      </span>
                      {p.text}
                    </button>
                  ))}
                </div>
                <Link href="/explore" className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold self-start hover:underline" style={{ color: "var(--text-tertiary)" }}>
                  <CompassIcon className="w-3.5 h-3.5" /> Or browse every adventure
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((msg, i) =>
                  msg.role === "user" ? (
                    <div key={i} className="flex justify-end">
                      <div
                        className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-md text-[13.5px] leading-relaxed text-white"
                        style={{ background: "#ff5100" }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
                      <Orb size={26} />
                      <div className="flex-1 min-w-0 space-y-2.5 pt-0.5">
                        {msg.failed ? (
                          <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            I couldn&apos;t get an answer just now. Try again, or name a place and a kind of trip.
                          </p>
                        ) : msg.content ? (
                          <p className="text-[13.5px] leading-relaxed whitespace-pre-line" style={{ color: "var(--text-primary)" }}>
                            {msg.content}
                          </p>
                        ) : null}

                        {msg.cards && msg.cards.length > 0 && (
                          <div className="space-y-2">
                            {msg.cards.map((card) => (
                              <PickCard key={card.slug} adventure={card} reason={msg.recommendations?.find((r) => r.slug === card.slug)?.reason} ace={ace} />
                            ))}
                            {/* More of the same kind, in Explore's full list */}
                            <Link href={`/explore?type=${encodeURIComponent(msg.cards[0].type)}`}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold hover:underline" style={{ color: "var(--accent-ink)" }}>
                              See all {msg.cards[0].type.toLowerCase()} adventures <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}

                        {msg.suggestAce && (
                          <Link
                            href="/matchmaker"
                            className="group flex items-center gap-3 p-3 rounded-2xl transition-colors hover:bg-[var(--bg-card-hover)]"
                            style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.22)" }}
                          >
                            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: AI_GRADIENT }}>
                              <MatchmakerMark className="w-4 h-4 text-white" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>Not sure which? Try the Matchmaker</span>
                              <span className="block text-[11.5px] leading-snug mt-0.5" style={{ color: "var(--text-tertiary)" }}>Two minutes of questions, then every adventure rated for you.</span>
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
                    <Orb size={26} pulse />
                    <span className="flex items-center gap-1" aria-hidden>
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="compass-dot w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--text-secondary)", animation: `compassDot 1.2s ease-in-out ${d * 0.15}s infinite` }}
                        />
                      ))}
                    </span>
                    {/* Say what's happening so a slower AI answer never looks stuck */}
                    <span className="text-[12px]" role="status" style={{ color: "var(--text-tertiary)" }}>{WAIT_LINES[waitStage]}</span>
                  </div>
                )}

                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-[36px] animate-in fade-in duration-300">
                    {chips.map((c) => (
                      <button
                        key={c}
                        onClick={() => send(c)}
                        className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] hover:border-[#ff5100]/40"
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
          <div className="px-3 pt-2 pb-2.5 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="compass-composer flex items-center gap-2 pl-3.5 pr-1 py-1 rounded-2xl transition-shadow"
              style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-default)" }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={messages.length ? "Ask a follow-up…" : "e.g. a 5-day trek in Uttarakhand"}
                aria-label="Message Compass.AI"
                className="flex-1 min-w-0 bg-transparent text-[14px] py-2 outline-none placeholder:text-[var(--text-tertiary)]"
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
            <p className="text-[10px] leading-snug text-center mt-1.5" style={{ color: "var(--text-tertiary)" }}>
              Picks come from Trail to Tides listings. Confirm dates and prices with the operator.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
