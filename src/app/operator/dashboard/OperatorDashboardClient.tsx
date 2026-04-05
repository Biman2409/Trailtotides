"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  Search,
  Mountain,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  LogOut,
  Plus,
  X,
  Calendar,
  DollarSign,
  MapPin,
  Loader2,
  AlertCircle,
  BadgeCheck,
  FileText,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/auth/actions";
import Logo from "@/components/ui/custom/Logo";
import { submitOperatorUpdate, type OperatorProfile, type OperatorSubmission as Submission } from "@/app/auth/operator-actions";
import { format, parseISO } from "date-fns";

type AdventureItem = {
  slug: string;
  name: string;
  region: string;
  state: string;
  type: string;
  difficulty: string;
  heroImage: string;
  operators: { name: string; verified: boolean; priceFrom: string }[];
};

export default function OperatorDashboardClient({
  operatorProfile,
  submissions,
  adventures,
}: {
  operatorProfile: OperatorProfile;
  submissions: Submission[];
  adventures: AdventureItem[];
}) {
  const [activeView, setActiveView] = useState<"home" | "browse" | "submit">("home");
  const [search, setSearch] = useState("");
  const [selectedAdventure, setSelectedAdventure] = useState<AdventureItem | null>(null);
  const [localSubmissions, setLocalSubmissions] = useState<Submission[]>(submissions);

  // Form state
  const [operatorName, setOperatorName] = useState(operatorProfile.company_name);
  const [priceFrom, setPriceFrom] = useState("");
  const [dates, setDates] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const isApproved = operatorProfile.status === "approved";

  const filteredAdventures = useMemo(() => {
    if (!search.trim()) return adventures;
    const q = search.toLowerCase();
    return adventures.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.region.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q)
    );
  }, [adventures, search]);

  function openSubmitForm(adv: AdventureItem) {
    setSelectedAdventure(adv);
    setFormMsg(null);
    setPriceFrom("");
    setDates([""]);
    setNotes("");
    setActiveView("submit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg(null);
    const fd = new FormData();
    fd.append("adventure_slug", selectedAdventure!.slug);
    fd.append("operator_name", operatorName);
    fd.append("price_from", priceFrom);
    fd.append("exact_dates", JSON.stringify(dates.filter(Boolean)));
    fd.append("notes", notes);
    const result = await submitOperatorUpdate(fd);
    setSubmitting(false);
    if (result?.error) {
      setFormMsg({ type: "error", text: result.error });
    } else {
      setFormMsg({ type: "success", text: result.success ?? "Submitted!" });
      // Optimistically add to list
      setLocalSubmissions((prev) => [
        {
          id: Date.now().toString(),
          operator_id: operatorProfile.user_id,
          company_name: operatorProfile.company_name,
          adventure_slug: selectedAdventure!.slug,
          operator_name: operatorName,
          price_from: priceFrom,
          exact_dates: dates.filter(Boolean),
          notes: notes || null,
          status: "pending",
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setTimeout(() => {
        setActiveView("home");
        setSelectedAdventure(null);
      }, 1500);
    }
  }

  const statusBadge = (status: string) => {
    if (status === "approved")
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Approved
        </span>
      );
    if (status === "rejected")
      return (
        <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/25 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
          <XCircle className="w-2.5 h-2.5" />
          Rejected
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
        <Clock className="w-2.5 h-2.5" />
        Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between sticky top-0 bg-[#080808]/90 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#ff5100]/10 border border-[#ff5100]/20 flex items-center justify-center group-hover:bg-[#ff5100]/20 transition-all">
              <Mountain className="w-4 h-4 text-[#ff7d47]" />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-white/80 group-hover:text-white transition-colors">Trail to Tides</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#ff7d47]/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">Operator Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/40 font-semibold">
            <span>{operatorProfile.company_name}</span>
            <div className="h-3 w-px bg-white/10" />
            {statusBadge(operatorProfile.status)}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Account status banner */}
        {operatorProfile.status === "pending" && (
          <div className="mb-8 flex items-start gap-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4.5 h-4.5 text-amber-400" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-300 mb-1">Account Pending Review</p>
              <p className="text-[12px] text-white/50 leading-relaxed">
                Your operator application is under review. Our team typically approves within 24 hours.
                You can browse adventures below, but submission will be enabled once approved.
              </p>
            </div>
          </div>
        )}
        {operatorProfile.status === "rejected" && (
          <div className="mb-8 flex items-start gap-4 bg-red-500/8 border border-red-500/20 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <XCircle className="w-4.5 h-4.5 text-red-400" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-sm font-bold text-red-300 mb-1">Application Not Approved</p>
              <p className="text-[12px] text-white/50 leading-relaxed">
                Your application was not approved. Please contact{" "}
                <a href="mailto:hello@trailtotides.com" className="text-[#ff7d47] hover:underline">hello@trailtotides.com</a>{" "}
                for more information.
              </p>
            </div>
          </div>
        )}
        {operatorProfile.status === "approved" && (
          <div className="mb-8 flex items-start gap-4 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <BadgeCheck className="w-4.5 h-4.5 text-emerald-400" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300 mb-1">Verified Operator</p>
              <p className="text-[12px] text-white/50 leading-relaxed">
                Your account is approved. Browse adventures and submit price/date updates — they'll go live after admin review.
              </p>
            </div>
          </div>
        )}

        {/* Nav tabs */}
        {activeView !== "submit" && (
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] p-1 rounded-xl w-fit mb-8">
            {[
              { key: "home", label: "My Dashboard", icon: FileText },
              { key: "browse", label: "Browse Adventures", icon: Mountain },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as "home" | "browse")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                  activeView === key
                    ? "bg-[#ff5100] text-white shadow-lg shadow-[#ff5100]/20"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── HOME VIEW ── */}
        {activeView === "home" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Submissions", value: localSubmissions.length, color: "#ff5100" },
                { label: "Pending", value: localSubmissions.filter((s) => s.status === "pending").length, color: "#f59e0b" },
                { label: "Approved", value: localSubmissions.filter((s) => s.status === "approved").length, color: "#22c55e" },
                { label: "Rejected", value: localSubmissions.filter((s) => s.status === "rejected").length, color: "#ef4444" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-1">{label}</p>
                  <p className="text-3xl font-black" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Quick action */}
            {isApproved && (
              <button
                onClick={() => setActiveView("browse")}
                className="w-full flex items-center justify-between bg-[#ff5100]/8 hover:bg-[#ff5100]/12 border border-[#ff5100]/20 hover:border-[#ff5100]/40 rounded-2xl p-5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ff5100]/15 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-[#ff7d47]" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white text-sm">Submit a Price or Date Update</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Browse adventures and submit updated pricing or departure dates</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#ff7d47] group-hover:translate-x-1 transition-all" />
              </button>
            )}

            {/* Submissions list */}
            <div>
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-white/30" />
                Submitted Updates
              </h2>
              {localSubmissions.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/30 text-sm font-semibold">No submissions yet</p>
                  <p className="text-white/20 text-xs mt-1">Browse adventures to submit your first update</p>
                </div>
              ) : (
                <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Adventure</th>
                        <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden sm:table-cell">Price From</th>
                        <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden md:table-cell">Dates</th>
                        <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Status</th>
                        <th className="text-right px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hidden sm:table-cell">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localSubmissions.map((sub) => {
                        const adv = adventures.find((a) => a.slug === sub.adventure_slug);
                        return (
                          <tr key={sub.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] last:border-0 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-white/90 text-[13px] leading-tight">
                                {adv?.name ?? sub.adventure_slug}
                              </p>
                              {adv && (
                                <p className="text-white/35 text-[10px] mt-0.5">
                                  {adv.region} · {adv.state}
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-4 hidden sm:table-cell">
                              <span className="text-[#ff7d47] font-bold text-[13px]">₹{sub.price_from}</span>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              {sub.exact_dates && sub.exact_dates.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {sub.exact_dates.slice(0, 2).map((d, i) => (
                                    <span key={i} className="bg-white/5 border border-white/8 text-white/50 text-[10px] px-2 py-0.5 rounded-lg font-mono">
                                      {d}
                                    </span>
                                  ))}
                                  {sub.exact_dates.length > 2 && (
                                    <span className="text-white/25 text-[10px] px-1 py-0.5">+{sub.exact_dates.length - 2}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-white/25 text-[11px]">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4">{statusBadge(sub.status)}</td>
                            <td className="px-5 py-4 text-white/30 text-[11px] text-right hidden sm:table-cell">
                              {format(parseISO(sub.created_at), "MMM d · HH:mm")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BROWSE VIEW ── */}
        {activeView === "browse" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="text"
                  placeholder="Search adventures by name, region, type…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-white text-[13px] placeholder-white/25 focus:outline-none focus:border-[#ff5100]/40 transition-all"
                />
              </div>
              <p className="text-[11px] text-white/25 font-medium">{filteredAdventures.length} adventures</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAdventures.map((adv) => (
                <div
                  key={adv.slug}
                  className="bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] rounded-2xl overflow-hidden group transition-all"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={adv.heroImage}
                      alt={adv.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="font-bold text-white text-sm leading-tight">{adv.name}</p>
                      <p className="text-white/60 text-[10px] mt-0.5">{adv.region} · {adv.state}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1.5">
                        <span className="bg-white/5 border border-white/8 text-white/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {adv.type}
                        </span>
                        <span className="bg-white/5 border border-white/8 text-white/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {adv.difficulty}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/25">{adv.operators.length} operator{adv.operators.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button
                      onClick={() => openSubmitForm(adv)}
                      disabled={!isApproved}
                      className="w-full flex items-center justify-center gap-2 bg-[#ff5100]/10 hover:bg-[#ff5100]/20 border border-[#ff5100]/20 hover:border-[#ff5100]/40 text-[#ff7d47] text-[12px] font-bold rounded-xl py-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isApproved ? "Submit Update" : "Approval Required"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SUBMIT FORM VIEW ── */}
        {activeView === "submit" && selectedAdventure && (
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => { setActiveView("browse"); setSelectedAdventure(null); }}
              className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/80 text-sm mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to browse
            </button>

            {/* Adventure preview */}
            <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 mb-6">
              <img
                src={selectedAdventure.heroImage}
                alt={selectedAdventure.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div>
                <p className="font-bold text-white text-sm">{selectedAdventure.name}</p>
                <p className="text-white/40 text-[11px] mt-0.5">{selectedAdventure.region} · {selectedAdventure.state}</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="bg-white/5 border border-white/8 text-white/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {selectedAdventure.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-xl font-black text-white mb-1">Submit Update</h2>
              <p className="text-white/40 text-xs">Price and date updates go live after admin approval.</p>
            </div>

            {formMsg && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                formMsg.type === "error"
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : "bg-green-500/10 border border-green-500/20 text-green-400"
              }`}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Operator Name */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5 ml-1">Your Operator / Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    required
                    placeholder="Your company name as it will appear"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>

              {/* Price From */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5 ml-1">Price From (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="number"
                    min={0}
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    required
                    placeholder="e.g. 12500"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>

              {/* Exact Dates */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5 ml-1">
                  Departure Dates <span className="normal-case tracking-normal text-white/20">(optional)</span>
                </label>
                <div className="space-y-2">
                  {dates.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                          type="date"
                          value={d}
                          onChange={(e) => {
                            const newDates = [...dates];
                            newDates[i] = e.target.value;
                            setDates(newDates);
                          }}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all [color-scheme:dark]"
                        />
                      </div>
                      {dates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setDates(dates.filter((_, idx) => idx !== i))}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDates([...dates, ""])}
                    className="flex items-center gap-2 text-[11px] font-semibold text-[#ff7d47]/70 hover:text-[#ff7d47] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add another date
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5 ml-1">
                  Additional Notes <span className="normal-case tracking-normal text-white/20">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Inclusions, exclusions, special notes…"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#ff5100]/50 focus:bg-white/[0.06] transition-all resize-none"
                />
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-4 py-3">
                <p className="text-[11px] text-white/35 leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-amber-400/60 shrink-0" />
                  Your update will be reviewed by our admin team before going live on the adventure listing.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-3.5 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#ff5100]/20 text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit for Review"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
