"use client";

import { useState } from "react";
import { X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { submitMessage } from "@/app/contact/actions";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function MessageModal({ isOpen, onClose, userEmail }: MessageModalProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("loading");
    try {
      await submitMessage(message);
      setStatus("success");
      setTimeout(() => {
        onClose();
        setMessage("");
        setStatus("idle");
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-3xl shadow-2xl shadow-black/50 overflow-hidden relative" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/20 to-transparent" />
        <div className="absolute -right-24 -top-24 w-48 h-48 bg-[#ff5100]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Direct Message</h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>Send a message directly to our team.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{ color: "var(--text-tertiary)" }}
            >
              <X className="w-5 h-5 hover:text-[var(--text-primary)]" />
            </button>
          </div>

          {status === "success" ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h4 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Message Sent!</h4>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>We'll get back to you at {userEmail}.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff5100] px-1">
                  From
                </label>
                <div className="w-full rounded-2xl px-5 py-4 text-sm font-medium" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
                  {userEmail}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff5100] px-1">
                  Your Message
                </label>
                <textarea
                  required
                  autoFocus
                  placeholder="How can we help you explore India?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full min-h-[160px] rounded-2xl px-5 py-4 text-sm font-medium transition-all outline-none resize-none placeholder-[var(--text-tertiary)]"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !message.trim()}
                className="w-full bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-50 disabled:hover:bg-[#ff5100] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-[#ff5100]/20 active:scale-[0.98]"
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {status === "error" && (
                <p className="text-red-400 text-xs text-center font-medium">
                  Failed to send message. Please try again.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}