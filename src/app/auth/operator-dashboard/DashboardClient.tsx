"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck, ShieldAlert, Pencil, X, Check, Plus, CalendarDays,
  Loader2, ArrowUpRight, CheckCircle2, AlertCircle, Clock, ArrowRight,
} from "lucide-react";
import { updateOperatorSubmission, submitOperatorUpdate } from "@/app/auth/operator-actions";
import type { OperatorProfile, OperatorSubmission } from "@/app/auth/operator-actions";
import type { Adventure } from "@/lib/data";

type ListedAdventure = {
  adventure: Adventure;
  submission: OperatorSubmission; // most recent submission for this slug
};

type Props = {
  profile: OperatorProfile;
  listings: ListedAdventure[];
  allAdventures: Adventure[];
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  approved: { label: "Live", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: <CheckCircle2 className="w-3 h-3" /> },
  pending:  { label: "Under Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <Clock className="w-3 h-3" /> },
  rejected: { label: "Not Approved", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: <AlertCircle className="w-3 h-3" /> },
};

function EditForm({
  submission,
  adventure,
  onClose,
  onSaved,
}: {
  submission: OperatorSubmission;
  adventure: Adventure;
  onClose: () => void;
  onSaved: (updated: OperatorSubmission) => void;
}) {
  const [price, setPrice] = useState(submission.price_from.replace(/[^\d]/g, ""));
  const [notes, setNotes] = useState(submission.notes ?? "");
  const [dates, setDates] = useState<string[]>(submission.exact_dates ?? []);
  const [dateInput, setDateInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addDate() {
    const d = dateInput.trim();
    if (d && !dates.includes(d)) setDates(p => [...p, d]);
    setDateInput("");
  }

  async function handleSave() {
    if (!price) return;
    setSaving(true); setError(null);
    const fd = new FormData();
    fd.set("submission_id", submission.id);
    fd.set("price_from", price);
    fd.set("notes", notes);
    fd.set("exact_dates", JSON.stringify(dates));
    const res = await updateOperatorSubmission(fd);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    onSaved({ ...submission, price_from: price, notes, exact_dates: dates, status: "pending" });
  }

  return (
    <div className="p-5 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-white/60 text-xs font-semibold">Editing · {adventure.name}</p>
        <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Price */}
      <div>
        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1.5">Starting Price (₹)</label>
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          type="number" min="0"
          placeholder="e.g. 8500"
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all"
        />
      </div>

      {/* Departure Dates */}
      <div>
        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1.5">
          <CalendarDays className="inline w-3 h-3 mr-1 -mt-0.5" />
          Departure Dates <span className="normal-case tracking-normal text-white/20">(optional)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            value={dateInput}
            onChange={e => setDateInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addDate(); }}}
            placeholder="e.g. 15 Jan 2026"
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all"
          />
          <button type="button" onClick={addDate}
            className="px-3 py-2 rounded-xl text-emerald-400 transition-colors hover:bg-emerald-400/10"
            style={{ border: "1px solid rgba(16,185,129,0.2)" }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {dates.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {dates.map(d => (
              <span key={d} className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-lg"
                style={{ background: "rgba(255,81,0,0.08)", color: "rgba(255,125,71,0.9)", border: "1px solid rgba(255,81,0,0.18)" }}>
                {d}
                <button type="button" onClick={() => setDates(p => p.filter(x => x !== d))}>
                  <X className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1.5">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Inclusions, group size, special info…"
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-all resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving || !price}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all"
          style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save Changes</>}
        </button>
        <button onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/60 transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          Cancel
        </button>
      </div>
      <p className="text-white/20 text-[10px] text-center">Changes go back to the review queue before going live.</p>
    </div>
  );
}

function AddListingForm({
  allAdventures,
  existingSlugs,
  profile,
  onAdded,
}: {
  allAdventures: Adventure[];
  existingSlugs: Set<string>;
  profile: OperatorProfile;
  onAdded: (sub: OperatorSubmission, adv: Adventure) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = allAdventures.filter(a => !existingSlugs.has(a.slug));

  function addDate() {
    const d = dateInput.trim();
    if (d && !dates.includes(d)) setDates(p => [...p, d]);
    setDateInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlug || !price) return;
    setSaving(true); setError(null);
    const fd = new FormData();
    fd.set("adventure_slug", selectedSlug);
    fd.set("operator_name", profile.company_name);
    fd.set("price_from", price);
    fd.set("notes", notes);
    fd.set("exact_dates", JSON.stringify(dates));
    const res = await submitOperatorUpdate(fd);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    // Optimistically add to list
    const adv = allAdventures.find(a => a.slug === selectedSlug)!;
    const sub: OperatorSubmission = {
      id: `temp-${Date.now()}`,
      operator_id: profile.user_id,
      company_name: profile.company_name,
      adventure_slug: selectedSlug,
      operator_name: profile.company_name,
      price_from: price,
      website: profile.website,
      exact_dates: dates,
      notes: notes || null,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    onAdded(sub, adv);
    setOpen(false); setSelectedSlug(""); setPrice(""); setNotes(""); setDates([]);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold transition-all hover:bg-white/[0.04]"
        style={{ border: "1px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}
      >
        <Plus className="w-4 h-4" />
        Add a new adventure listing
      </button>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,81,0,0.2)", background: "rgba(255,81,0,0.03)" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[#ff5100] text-xs font-bold tracking-[0.18em] uppercase">New Adventure Listing</p>
        <button onClick={() => setOpen(false)} className="text-white/25 hover:text-white/60 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Adventure picker */}
        <div>
          <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1.5">Select Adventure</label>
          <select
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            required
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5100]/40 transition-all"
            style={{ appearance: "none" }}
          >
            <option value="" disabled style={{ background: "#1a1f2e" }}>Choose an adventure…</option>
            {available.map(a => (
              <option key={a.slug} value={a.slug} style={{ background: "#1a1f2e" }}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1.5">Starting Price (₹)</label>
          <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" required
            placeholder="e.g. 8500"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/40 transition-all" />
        </div>

        {/* Departure Dates */}
        <div>
          <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1.5">
            <CalendarDays className="inline w-3 h-3 mr-1 -mt-0.5" />Departure Dates <span className="normal-case tracking-normal text-white/20">(optional)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input value={dateInput} onChange={e => setDateInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addDate(); }}}
              placeholder="e.g. 15 Jan 2026"
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-white text-xs placeholder-white/20 focus:outline-none transition-all" />
            <button type="button" onClick={addDate}
              className="px-3 py-2 rounded-xl text-[#ff5100] transition-colors hover:bg-[#ff5100]/10"
              style={{ border: "1px solid rgba(255,81,0,0.2)" }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {dates.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dates.map(d => (
                <span key={d} className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-lg"
                  style={{ background: "rgba(255,81,0,0.08)", color: "rgba(255,125,71,0.9)", border: "1px solid rgba(255,81,0,0.18)" }}>
                  {d}<button type="button" onClick={() => setDates(p => p.filter(x => x !== d))}><X className="w-2.5 h-2.5 opacity-60 hover:opacity-100" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1.5">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Inclusions, group size, special info…"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none transition-all resize-none" />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button type="submit" disabled={saving || !selectedSlug || !price}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all"
          style={{ background: "#ff5100" }}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <>Submit Listing <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </div>
  );
}

export default function DashboardClient({ profile, listings: initialListings, allAdventures }: Props) {
  const [listings, setListings] = useState<ListedAdventure[]>(initialListings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const existingSlugs = new Set(listings.map(l => l.adventure.slug));

  function handleSaved(slug: string, updated: OperatorSubmission) {
    setListings(prev => prev.map(l => l.adventure.slug === slug ? { ...l, submission: updated } : l));
    setEditingId(null);
    setSavedId(slug);
    setTimeout(() => setSavedId(null), 3000);
  }

  function handleAdded(sub: OperatorSubmission, adv: Adventure) {
    setListings(prev => [...prev, { adventure: adv, submission: sub }]);
  }

  return (
    <div className="space-y-6">
      {/* Profile summary */}
      <div className="rounded-2xl p-5 flex items-start gap-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0"
          style={{ background: "rgba(255,81,0,0.1)", color: "#ff6b2b" }}>
          {profile.company_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-white font-bold text-lg leading-tight">{profile.company_name}</h2>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
              <ShieldCheck className="w-3 h-3" /> Verified Operator
            </span>
          </div>
          <p className="text-white/40 text-xs mt-0.5">{profile.email}</p>
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#ff5100] text-xs mt-1 hover:underline">
              {profile.website.replace(/^https?:\/\//, "")}
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>
        <Link href="/operators"
          className="shrink-0 text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
          Public profile <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white/80 text-sm font-bold">
            Your Listings
            <span className="ml-2 text-white/25 font-normal">({listings.length})</span>
          </h3>
        </div>

        {listings.length === 0 ? (
          <p className="text-white/25 text-sm mb-4">No listings yet. Add your first adventure below.</p>
        ) : (
          <div className="space-y-3 mb-4">
            {listings.map(({ adventure: adv, submission: sub }) => {
              const st = STATUS_STYLES[sub.status] ?? STATUS_STYLES.pending;
              const isEditing = editingId === adv.slug;
              const wasSaved = savedId === adv.slug;
              const priceNum = parseInt(sub.price_from.replace(/[^\d]/g, ""), 10);
              const priceDisplay = isNaN(priceNum) ? sub.price_from : `₹${priceNum.toLocaleString("en-IN")}`;

              return (
                <div key={adv.slug} className="rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                  {/* Adventure row */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="relative w-14 h-14 rounded-xl shrink-0 overflow-hidden">
                      <Image src={adv.heroImage} alt={adv.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/experiences/${adv.slug}`}
                        className="text-white/85 font-semibold text-sm truncate hover:text-white transition-colors flex items-center gap-1 w-fit">
                        {adv.name}
                        <ArrowUpRight className="w-3 h-3 opacity-40" />
                      </Link>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}>
                          {st.icon}{st.label}
                        </span>
                        <span className="text-emerald-400 text-[11px] font-bold">{priceDisplay} onwards</span>
                        {sub.exact_dates?.length > 0 && (
                          <span className="text-white/30 text-[10px]">{sub.exact_dates.length} date{sub.exact_dates.length > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {wasSaved && (
                        <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Saved
                        </span>
                      )}
                      <button
                        onClick={() => setEditingId(isEditing ? null : adv.slug)}
                        className="p-2 rounded-lg transition-colors hover:bg-white/[0.06]"
                        title={isEditing ? "Close editor" : "Edit listing"}
                        style={{ color: isEditing ? "#ff5100" : "rgba(255,255,255,0.3)" }}
                      >
                        {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {isEditing && (
                    <EditForm
                      submission={sub}
                      adventure={adv}
                      onClose={() => setEditingId(null)}
                      onSaved={updated => handleSaved(adv.slug, updated)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add new listing */}
        <AddListingForm
          allAdventures={allAdventures}
          existingSlugs={existingSlugs}
          profile={profile}
          onAdded={handleAdded}
        />
      </div>

      {/* Status legend */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-white/25 text-[10px] font-bold uppercase tracking-[0.15em] mb-3">Listing Status Guide</p>
        {Object.entries(STATUS_STYLES).map(([, st]) => (
          <div key={st.label} className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full w-28"
              style={{ background: st.bg, color: st.color }}>
              {st.icon}{st.label}
            </span>
            <span className="text-white/25 text-[10px]">
              {st.label === "Live" && "Visible on adventure pages and the operators directory."}
              {st.label === "Under Review" && "Our team will approve or reject within 24 hours."}
              {st.label === "Not Approved" && "Edit your listing and resubmit for review."}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
