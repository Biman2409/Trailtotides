"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BadgeCheck, CheckCircle2, MessageSquareQuote } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWishlist } from "@/contexts/WishlistContext";

// "Get quotes": one request to several verified operators. Needs an account, so operators
// hear from real people and replies have somewhere to go.

const MAX_OPERATORS = 5;
const field = "w-full h-10 px-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#ff5100]/50";
const fieldStyle = { background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" };
const label = "block text-xs font-semibold mb-1.5";

export default function QuoteRequestButton({ slug, name, operators }: { slug: string; name: string; operators: string[] }) {
  const router = useRouter();
  const { signedIn } = useWishlist();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>(() => operators.slice(0, MAX_OPERATORS));
  const [startDate, setStartDate] = useState("");
  const [flexible, setFlexible] = useState(true);
  const [groupSize, setGroupSize] = useState(2);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<number | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  if (!operators.length) return null;

  function start() {
    if (!signedIn) {
      toast.error("Log in to ask operators for a quote.", {
        action: { label: "Log in", onClick: () => router.push(`/auth/login?next=${encodeURIComponent(location.pathname)}`) },
      });
      return;
    }
    setSentTo(null);
    setOpen(true);
  }

  function togglePick(op: string) {
    setPicked((p) => (p.includes(op) ? p.filter((x) => x !== op) : p.length < MAX_OPERATORS ? [...p, op] : p));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked.length) { toast.error("Pick at least one operator."); return; }
    setBusy(true);
    const res = await fetch("/api/quotes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, operators: picked, startDate, flexible, groupSize, message }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { toast.error(data.error ?? "Couldn't send the request."); return; }
    setSentTo(picked.length);
  }

  return (
    <>
      <button onClick={start}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:text-[#ff5100]"
        style={{ border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
        <MessageSquareQuote className="w-4 h-4" /> Get quotes from {operators.length === 1 ? "the operator" : `${Math.min(operators.length, MAX_OPERATORS)} operators`}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          {sentTo !== null ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "#34d399" }} />
              <DialogTitle className="text-lg font-bold mb-1.5">Request sent</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                We&apos;ve sent it to {sentTo === 1 ? "the operator" : `${sentTo} operators`}. Their replies come straight to your email, and the request is saved on your profile.
              </DialogDescription>
            </div>
          ) : (
            <form onSubmit={submit}>
              <DialogHeader className="mb-4">
                <DialogTitle className="text-lg font-bold">Get quotes for {name}</DialogTitle>
                <DialogDescription className="text-sm">One request to verified operators. They reply to you by email.</DialogDescription>
              </DialogHeader>

              <fieldset className="mb-4">
                <legend className={label} style={{ color: "var(--text-secondary)" }}>Operators {operators.length > MAX_OPERATORS && `(up to ${MAX_OPERATORS})`}</legend>
                <div className="space-y-1.5">
                  {operators.map((op) => (
                    <label key={op} className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: "var(--text-primary)" }}>
                      <input type="checkbox" checked={picked.includes(op)} onChange={() => togglePick(op)} className="accent-[#ff5100] w-4 h-4" />
                      {op} <BadgeCheck className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-[1fr_96px] gap-3 mb-2">
                <div>
                  <label htmlFor="q-date" className={label} style={{ color: "var(--text-secondary)" }}>Start date</label>
                  <input id="q-date" type="date" required min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} className={field} style={fieldStyle} />
                </div>
                <div>
                  <label htmlFor="q-size" className={label} style={{ color: "var(--text-secondary)" }}>People</label>
                  <input id="q-size" type="number" required min={1} max={50} value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} className={field} style={fieldStyle} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs mb-4 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={flexible} onChange={(e) => setFlexible(e.target.checked)} className="accent-[#ff5100]" />
                My dates are flexible
              </label>

              <label htmlFor="q-msg" className={label} style={{ color: "var(--text-secondary)" }}>Anything they should know? <span style={{ color: "var(--text-tertiary)" }}>(optional)</span></label>
              <textarea id="q-msg" rows={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="First trek at altitude, need gear on rent…"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none focus:ring-1 focus:ring-[#ff5100]/50 mb-4" style={fieldStyle} />

              <button type="submit" disabled={busy || !picked.length}
                className="w-full py-3 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ background: "#ff5100" }}>
                {busy ? "Sending…" : `Send to ${picked.length} operator${picked.length === 1 ? "" : "s"}`}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
