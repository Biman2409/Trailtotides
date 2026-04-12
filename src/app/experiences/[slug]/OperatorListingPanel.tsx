"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitOperatorUpdate } from "@/app/auth/operator-actions";
import { getOperatorProfile } from "@/app/auth/operator-actions";
import {
  ChevronDown, Plus, Minus, ShieldCheck, ArrowRight,
  Loader2, CheckCircle2, Briefcase, Package,
} from "lucide-react";
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
  const [cloakroom, setCloakroom] = useState(false);
  const [cloakroomCharge, setCloakroomCharge] = useState("");
  const [offloading, setOffloading] = useState(false);
  const [offloadingCharge, setOffloadingCharge] = useState("");

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
    fd.set("cloakroom", String(cloakroom));
    fd.set("cloakroom_charge", cloakroomCharge);
    fd.set("offloading", String(offloading));
    fd.set("offloading_charge", offloadingCharge);
    const res = await submitOperatorUpdate(fd);
    setSubmitting(false);
    if (res?.error) {
      setResult({ type: "error", text: res.error });
    } else {
      setResult({ type: "success", text: "Submitted! Our team will review your listing within 24h." });
      setOpen(false);
      setPriceFrom(""); setNotes(""); setBatches([""]);
      setCloakroom(false); setCloakroomCharge("");
      setOffloading(false); setOffloadingCharge("");
    }
  }

  if (loading) return null;

  // Shared header toggle
  function Header({ label, sub, accent = false }: { label: string; sub: string; accent?: boolean }) {
    return (
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="text-left">
          <p className={`text-[10px] font-bold tracking-[0.2em] uppercase leading-none mb-0.5 ${accent ? "text-[#ff5100]" : "text-emerald-400"}`}>
            {label}
          </p>
          <p className="text-white/35 text-[11px]">{sub}</p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/25 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,81,0,0.15)", background: "rgba(255,81,0,0.03)" }}
      >
        <Header label="Are You an Operator?" sub="List your services for this adventure" accent />
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "200px" : "0px" }}
        >
          <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid rgba(255,81,0,0.1)" }}>
            <p className="text-white/40 text-xs leading-relaxed mb-3">
              Reach thousands of adventure seekers by listing{" "}
              <span className="text-white/60 font-medium">{adventureName}</span> on your operator profile.
            </p>
            <div className="flex gap-2">
              <Link
                href="/auth/operator-signup"
                className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-[#ff5100] hover:bg-[#ff7d47] text-white transition-all"
              >
                Register
              </Link>
              <Link
                href="/auth/login?role=operator"
                className="flex-1 text-center text-xs font-semibold py-2 rounded-lg text-white/50 hover:text-white transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but not an operator
  if (!isOperator) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,81,0,0.15)", background: "rgba(255,81,0,0.03)" }}
      >
        <Header label="Are You an Operator?" sub="Create an operator account to list here" accent />
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "160px" : "0px" }}
        >
          <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid rgba(255,81,0,0.1)" }}>
            <p className="text-white/40 text-xs leading-relaxed mb-3">
              You&apos;re logged in as an explorer. Register an operator account to list your services.
            </p>
            <Link
              href="/auth/operator-signup"
              className="flex items-center justify-center gap-2 w-full text-xs font-bold py-2 rounded-lg bg-[#ff5100] hover:bg-[#ff7d47] text-white transition-all"
            >
              Create Operator Account
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Operator: submission form
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.03)" }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="text-left">
            <p className="text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase leading-none mb-0.5">Operator Panel</p>
            <p className="text-white/35 text-[11px]">Submit a listing for this adventure</p>
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/25 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {result?.type === "success" && !open && (
        <div className="px-4 py-2.5 flex items-center gap-2 text-emerald-400 text-xs font-medium" style={{ borderTop: "1px solid rgba(16,185,129,0.12)", background: "rgba(16,185,129,0.05)" }}>
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          {result.text}
        </div>
      )}

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? "900px" : "0px" }}
      >
        <form onSubmit={handleSubmit} className="px-4 pb-4 pt-3 space-y-3.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Company Name */}
          <div>
            <label className="block text-[9px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1">Company Name</label>
            <input
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              required
              placeholder="Summit Adventures Pvt. Ltd."
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>

          {/* Price From */}
          <div>
            <label className="block text-[9px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1">Starting Price (₹)</label>
            <input
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              required
              placeholder="e.g. 8500"
              type="number"
              min="0"
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>

          {/* Departure Batches */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.18em]">Departure Batches</label>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <button type="button" onClick={() => setBatchCount(batches.length - 1)} disabled={batches.length <= 1}
                  className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-25">
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="w-6 text-center text-[11px] font-bold text-white">{batches.length}</span>
                <button type="button" onClick={() => setBatchCount(batches.length + 1)} disabled={batches.length >= 12}
                  className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-25">
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              {batches.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-white/20 w-10 shrink-0">Batch {i + 1}</span>
                  <input
                    type="date"
                    value={val}
                    onChange={e => setBatchDate(i, e.target.value)}
                    required
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500/40 transition-all"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-[9px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1.5">Facilities</label>
            <div className="space-y-1.5">
              {/* Cloakroom */}
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <button type="button" onClick={() => setCloakroom(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-white/35" />
                    <span className="text-xs text-white/60 font-medium">Cloakroom / Luggage Storage</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${cloakroom ? "bg-emerald-500" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${cloakroom ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </button>
                {cloakroom && (
                  <div className="px-3 pb-2.5 border-t border-white/6">
                    <label className="block text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] mt-2 mb-1">Charge (₹) — blank if free</label>
                    <input type="number" min="0" value={cloakroomCharge} onChange={e => setCloakroomCharge(e.target.value)}
                      placeholder="e.g. 200"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all" />
                  </div>
                )}
              </div>

              {/* Offloading */}
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <button type="button" onClick={() => setOffloading(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-white/35" />
                    <span className="text-xs text-white/60 font-medium">Porter / Offloading Service</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${offloading ? "bg-emerald-500" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${offloading ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </button>
                {offloading && (
                  <div className="px-3 pb-2.5 border-t border-white/6">
                    <label className="block text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] mt-2 mb-1">Charge per KG (₹) — blank if included</label>
                    <input type="number" min="0" value={offloadingCharge} onChange={e => setOffloadingCharge(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[9px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1">
              Notes <span className="normal-case tracking-normal text-white/15">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Inclusions, group size limits, special info…"
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all resize-none"
            />
          </div>

          {result?.type === "error" && (
            <p className="text-red-400 text-xs">{result.text}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !batchesFilled}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</> : "Submit for Review"}
          </button>
          <p className="text-white/20 text-[9px] text-center">Reviewed by our team · usually within 24h</p>
        </form>
      </div>
    </div>
  );
}
