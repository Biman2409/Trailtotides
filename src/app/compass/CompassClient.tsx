"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Compass, Loader2, RotateCcw, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Adventure } from "@/lib/data";

type Role = "user" | "model";
type Message = { role: Role; text: string; slugs?: string[] };

const STARTERS = [
  "Best Himalayan trek for a first-timer in summer?",
  "I want something extreme under ₹20,000",
  "Weekend adventure from Mumbai or Pune?",
  "Easy trek for a group with beginners",
  "Something unique — not the usual tourist routes",
  "Best adventure for the month of January?",
];

/** Extract [SLUG:xxx] markers from Gemini response */
function extractSlugs(text: string): string[] {
  const matches = [...text.matchAll(/\[SLUG:([\w-]+)\]/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

/** Strip [SLUG:xxx] markers from display text */
function cleanText(text: string): string {
  return text.replace(/\[SLUG:[\w-]+\]/g, "").trim();
}

/** Render markdown-like bold and line breaks */
function RenderText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}

function MessageBubble({
  msg,
  adventures,
}: {
  msg: Message;
  adventures: Adventure[];
}) {
  const isUser = msg.role === "user";
  const displayText = cleanText(msg.text);
  const paragraphs = displayText.split("\n").filter((l) => l.trim());

  const matchedAdventures = (msg.slugs ?? [])
    .map((slug) => adventures.find((a) => a.slug === slug))
    .filter(Boolean) as Adventure[];

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-xl bg-[#ff5100] flex items-center justify-center shadow-lg shadow-[#ff5100]/20 mt-0.5">
          <Compass className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-3 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Text bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-[#ff5100] text-white rounded-tr-sm"
              : "rounded-tl-sm"
          }`}
          style={
            isUser
              ? undefined
              : { background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }
          }
        >
          {paragraphs.map((p, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              <RenderText text={p} />
            </p>
          ))}
        </div>

        {/* Adventure cards */}
        {matchedAdventures.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {matchedAdventures.map((adv) => (
              <Link
                key={adv.slug}
                href={`/experiences/${adv.slug}`}
                className="flex items-center gap-3 rounded-2xl overflow-hidden group transition-all hover:-translate-y-0.5"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
              >
                <div className="relative w-20 h-16 shrink-0">
                  <Image
                    src={adv.heroImage}
                    alt={adv.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0 py-2 pr-3">
                  <p className="text-sm font-semibold truncate group-hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-primary)" }}>
                    {adv.name}
                  </p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {adv.type} · {adv.state} · {adv.difficulty}
                  </p>
                  {adv.operators.length > 0 && (
                    <p className="text-[11px] font-semibold mt-0.5 text-[#ff5100]">
                      from {adv.operators[0].priceFrom}
                    </p>
                  )}
                </div>
                <ExternalLink className="w-3.5 h-3.5 mr-3 shrink-0 opacity-30 group-hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-xl bg-[#ff5100] flex items-center justify-center shadow-lg shadow-[#ff5100]/20 mt-0.5">
        <Compass className="w-4 h-4 text-white" />
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#ff5100]/60 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CompassClient({ adventures }: { adventures: Adventure[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const configured = true; // will show error from API if key is missing

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    setInput("");

    const userMsg: Message = { role: "user", text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setStreaming(true);
    setStreamingText("");

    // Build history for API (exclude the message we're about to send)
    const history = messages.map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await fetch("/api/compass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        const err = await res.json();
        const errMsg: Message = {
          role: "model",
          text: err.error ?? "Something went wrong. Please try again.",
        };
        setMessages([...newMessages, errMsg]);
        setStreaming(false);
        return;
      }

      // Stream
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamingText(full);
      }

      const slugs = extractSlugs(full);
      const modelMsg: Message = { role: "model", text: full, slugs };
      setMessages([...newMessages, modelMsg]);
      setStreamingText("");
    } catch {
      const errMsg: Message = {
        role: "model",
        text: "Connection error. Please check your internet and try again.",
      };
      setMessages([...newMessages, errMsg]);
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const isEmpty = messages.length === 0 && !streaming;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5">
        {isEmpty ? (
          /* Welcome state */
          <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-12">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#ff5100] flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-[#ff5100]/30">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <p className="text-[#ff5100] text-xs font-bold tracking-[0.3em] uppercase mb-2">Compass AI</p>
              <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
                Find your next adventure
              </h2>
              <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Tell me what you&apos;re looking for — destination, budget, fitness, season, vibe. I&apos;ll find the right adventure for you.
              </p>
            </div>

            {/* Starter prompts */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3.5 py-2 rounded-xl font-medium transition-all hover:-translate-y-0.5 hover:border-[#ff5100]/40 hover:text-[#ff5100]"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} adventures={adventures} />
            ))}
            {streaming && streamingText ? (
              <MessageBubble
                msg={{ role: "model", text: streamingText }}
                adventures={adventures}
              />
            ) : streaming ? (
              <TypingBubble />
            ) : null}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 md:px-6 py-4"
        style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-page)" }}
      >
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={() => { setMessages([]); setStreamingText(""); }}
              disabled={streaming}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-30"
              style={{ color: "var(--text-muted)" }}
            >
              <RotateCcw className="w-3 h-3" />
              New conversation
            </button>
          </div>
        )}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={streaming}
            placeholder="Ask Compass anything about your next adventure…"
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-white/20 disabled:opacity-50"
            style={{ color: "var(--text-primary)" }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ff7d47] active:scale-95"
            style={{ background: input.trim() && !streaming ? "#ff5100" : "var(--bg-card)" }}
          >
            {streaming ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/50" />
            ) : (
              <Send className="w-4 h-4" style={{ color: input.trim() ? "white" : "var(--text-muted)" }} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-center mt-2" style={{ color: "var(--text-muted)" }}>
          Powered by Gemini Flash · {adventures.length} adventures in catalogue
        </p>
      </div>
    </div>
  );
}
