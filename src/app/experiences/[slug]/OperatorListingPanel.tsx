"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitOperatorUpdate } from "@/app/auth/operator-actions";
import { getOperatorProfile } from "@/app/auth/operator-actions";
import { Building2, ChevronDown, ChevronUp, Plus, Minus, X, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Props {
  adventureSlug: string;
  adventureName: string;
}

export default function OperatorListingPanel({ adventureSlug, adventureName }: Props) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isOperator, setIsOperator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [operatorName, setOperatorName] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [notes, setNotes] = useState("");
  const [batches, setBatches] = useState<string[]>([""]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setLoading(false); return; }
      setUser({ id: session.user.id, email: session.user.email ?? "" });
      const profile = await getOperatorProfile(session.user.id);
      setIsOperator(!!profile);
      if (profile) setOperatorName(profile.company_name);
      setLoading(false);
    });
  }, []);

  const batchesFilled = batches.every(b => b.trim() !== "");

  function setBatchCount(n: number) {
    const clamped = Math.max(1, Math.min(12, n));
    setBatches(prev => Array.from({ length: clamped }, (_, i) => prev[i] ?? ""));
  }

  function setBatchDate(i: number, val: string) {
    setBatches(prev => { const next = [...prev]; next[i] = val; return next; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!operatorName || !priceFrom || !batchesFilled) return;
    setSubmitting(true);
    setResult(null);
    const fd = new FormData();
    fd.set("adventure_slug", adventureSlug);
    fd.set("operator_name", operatorName);
    fd.set("price_from", priceFrom);
    fd.set("notes", notes);
    fd.set("exact_dates", JSON.stringify(batches));
    const res = await submitOperatorUpdate(fd);
    setSubmitting(false);
    if (res?.error) {
      setResult({ type: "error", text: res.error });
    } else {
      setResult({ type: "success", text: "Listing submitted! Our team will review and approve it shortly." });
      setOpen(false);
      setPriceFrom(""); setNotes(""); setBatches([""]);
    }
  }

  if (loading) return null;

  // Not logged in
  if (!user) {
    return (
      <div
        className="rounded-2xl p-5"
        style={{ background: "rgba(255,81,0,0.04)", border: "1px solid rgba(255,81,0,0.12)" }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <Building2 className="w-4 h-4 text-[#ff5100]" />
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase">Are You an Operator?</p>
        </div>
        <p className="text-white/40 text-xs leading-relaxed mb-4">
          List <span className="text-white/60 font-medium">{adventureName}</span> on your operator profile and reach thousands of adventure seekers.
        </p>
        <div className="flex gap-2">
          <Link
            href="/auth/operator-signup"
            className="flex-1 text-center text-xs font-bold py-2.5 rounded-xl transition-all bg-[#ff5100] hover:bg-[#ff7d47] text-white"
          >
            Register as Operator
          </Link>
          <Link
            href="/auth/login?role=operator"
            className="flex-1 text-center text-xs font-semibold py-2.5 rounded-xl transition-all text-white/50 hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  // Logged in but not an operator
  if (!isOperator) {
    return (
      <div
        className="rounded-2xl p-5"
        style={{ background: "rgba(255,81,0,0.04)", border: "1px solid rgba(255,81,0,0.12)" }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <Building2 className="w-4 h-4 text-[#ff5100]" />
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase">List This Adventure</p>
        </div>
        <p className="text-white/40 text-xs leading-relaxed mb-4">
          You&apos;re logged in as an explorer. Register an operator account to list your services for this adventure.
        </p>
        <Link
          href="/auth/operator-signup"
          className="flex items-center justify-center gap-2 w-full text-xs font-bold py-2.5 rounded-xl bg-[#ff5100] hover:bg-[#ff7d47] text-white transition-all"
        >
          Create Operator Account
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // Operator: show submission form
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(16,185,129,0.2)" }}
    >
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-5 transition-colors hover:bg-white/[0.02]"
        style={{ background: "rgba(16,185,129,0.05)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase">Operator Panel</p>
            <p className="text-white/50 text-xs mt-0.5">Submit your listing for this adventure</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>

      {result?.type === "success" && (
        <div className="px-5 py-3 flex items-center gap-2 text-emerald-400 text-xs font-medium" style={{ background: "rgba(16,185,129,0.06)", borderTop: "1px solid rgba(16,185,129,0.12)" }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {result.text}
        </div>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="p-5 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Operator / Company Name */}
          <div>
            <label className="block text-[10px] font-bold text-white/35 uppercase tracking-[0.18em] mb-1.5">Company Name</label>
            <input
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              required
              placeholder="Summit Adventures Pvt. Ltd."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>

          {/* Price From */}
          <div>
            <label className="block text-[10px] font-bold text-white/35 uppercase tracking-[0.18em] mb-1.5">Starting Price (₹)</label>
            <input
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              required
              placeholder="e.g. 8500"
              type="number"
              min="0"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>

          {/* Batch departure dates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-white/35 uppercase tracking-[0.18em]">
                Departure Batches
              </label>
              <div className="flex items-center gap-0 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <button type="button" onClick={() => setBatchCount(batches.length - 1)} disabled={batches.length <= 1}
                  className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-25">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-7 text-center text-xs font-bold text-white">{batches.length}</span>
                <button type="button" onClick={() => setBatchCount(batches.length + 1)} disabled={batches.length >= 12}
                  className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-25">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {batches.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white/25 w-12 shrink-0">Batch {i + 1}</span>
                  <input
                    type="date"
                    value={val}
                    onChange={e => setBatchDate(i, e.target.value)}
                    required
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500/40 transition-all"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-white/35 uppercase tracking-[0.18em] mb-1.5">
              Notes <span className="normal-case tracking-normal text-white/20">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Inclusions, group size limits, special info…"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all resize-none"
            />
          </div>

          {result?.type === "error" && (
            <p className="text-red-400 text-xs">{result.text}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !batchesFilled}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit Listing for Review"}
          </button>
          <p className="text-white/25 text-[10px] text-center">
            Listings are reviewed by our team before going live (usually within 24h).
          </p>
        </form>
      )}
    </div>
  );
}
