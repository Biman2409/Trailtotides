"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { serif } from "../blocks";

// A preparation checklist, not a fitness test: the Matchmaker rates the body, this checks the
// homework. Each item says why it matters and links to the guide that covers it.
const GROUPS: { title: string; items: { id: string; text: string; why: string; href: string; link: string }[] }[] = [
  {
    title: "Body and health",
    items: [
      { id: "matchmaker", text: "I've taken the Matchmaker, and my trip is rated ready or a stretch for me", why: "It compares what the trip asks with what you can do.", href: "/matchmaker", link: "Take the Matchmaker" },
      { id: "benchmark", text: "I can meet the fitness benchmark for my trip's grade", why: "For a moderate trek: jog 5 km in about 40 minutes, or climb 40 floors with a 5 kg pack.", href: "/adventurepedia/getting-fit#how-fit", link: "Benchmarks by grade" },
      { id: "training", text: "I've trained for at least 6 weeks, including back-to-back days", why: "Turning up untrained is the most common reason treks go badly.", href: "/adventurepedia/getting-fit#plan", link: "The 8-week plan" },
      { id: "doctor", text: "I've talked to a doctor about my health, medicines and the trip's height", why: "Heart, lung and blood conditions, pregnancy and some medicines need a doctor's view.", href: "/adventurepedia/altitude-sickness#medicines", link: "Medicines and altitude" },
      { id: "altitude", text: "I know the signs of altitude sickness and the rule: never go higher with symptoms", why: "It's the most common serious problem on Himalayan trips.", href: "/adventurepedia/altitude-sickness#symptoms", link: "Know the signs" },
    ],
  },
  {
    title: "Kit",
    items: [
      { id: "shoes", text: "My shoes have ankle support, good grip, and 20 km or more in them", why: "Blisters and slips from new or flat shoes end more treks than anything else.", href: "/adventurepedia/what-to-pack#shoes", link: "Shoes" },
      { id: "layers", text: "My warm layers and sleeping bag are rated for the coldest night", why: "Summit mornings and winter camps can drop to -10°C or below.", href: "/adventurepedia/what-to-pack#layers", link: "The layering system" },
      { id: "packed", text: "I've packed from my trip's own checklist, and my offload bag is under 10 kg", why: "Every trek guide has a list tuned to its season and height.", href: "/adventurepedia/treks", link: "Trek guides" },
      { id: "firstaid", text: "My daypack has my medicines, a blister kit, ORS, sunscreen and a headtorch", why: "These are the things you need before you reach camp.", href: "/adventurepedia/first-aid-and-water#kit", link: "Personal first-aid kit" },
    ],
  },
  {
    title: "Paperwork and booking",
    items: [
      { id: "operator", text: "I've asked my operator who leads, the group ratio, and the plan if someone gets sick", why: "The answers tell you more than the price does.", href: "/adventurepedia/choosing-an-operator#questions", link: "Questions to ask" },
      { id: "itinerary", text: "My itinerary gains height slowly and has a spare day", why: "Each trek guide flags the nights that climb fast.", href: "/adventurepedia/altitude-sickness#acclimatise", link: "The ascent rules" },
      { id: "insurance", text: "My insurance names my activity, covers my highest point, and includes evacuation", why: "Ordinary travel insurance often leaves adventure out.", href: "/adventurepedia/insurance-and-emergencies#insurance", link: "Insurance that covers you" },
      { id: "permits", text: "I have my original photo ID, copies, and any permits my route needs", why: "Forest, border and island permits are checked on the way.", href: "/adventurepedia/permits-and-documents", link: "Permits and documents" },
      { id: "refunds", text: "I know the cancellation terms and have a buffer day before my journey home", why: "Weather and landslides cancel more trips than anything else.", href: "/adventurepedia/budgeting#compare", link: "Comparing fairly" },
    ],
  },
  {
    title: "Safety on the way",
    items: [
      { id: "offline", text: "The trail and an offline map are on my phone, tested in airplane mode", why: "There's no signal on most treks, but GPS still works.", href: "/adventurepedia/offline-maps", link: "Take your trek offline" },
      { id: "contacts", text: "Someone at home has my itinerary, the operator's number and when to raise the alarm", why: "It's how help starts if you don't come back on time.", href: "/adventurepedia/insurance-and-emergencies#if-it-happens", link: "If something goes wrong" },
      { id: "power", text: "I have a charged power bank and know how to keep it warm", why: "Cold drains batteries fast.", href: "/adventurepedia/camp-life#phones-tips", link: "Phones and power" },
      { id: "lnt", text: "I'll carry out all my rubbish, including used toilet paper", why: "There's no collection at 3,500 m. Whatever you leave stays.", href: "/adventurepedia/leave-no-trace", link: "Leave no trace" },
    ],
  },
];

const KEY = "ttt:adventurepedia:ready";
const TOTAL = GROUPS.reduce((n, g) => n + g.items.length, 0);

export default function Readiness() {
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => {
    try { setDone(new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]"))); } catch { /* storage blocked */ }
  }, []);
  const save = (next: Set<string>) => {
    setDone(next);
    try { localStorage.setItem(KEY, JSON.stringify([...next])); } catch { /* storage blocked */ }
  };
  const toggle = (id: string) => { const next = new Set(done); if (next.has(id)) next.delete(id); else next.add(id); save(next); };
  const n = done.size;
  const pct = Math.round((n / TOTAL) * 100);
  const verdict = n === TOTAL ? "You're ready. Have a brilliant trip."
    : pct >= 75 ? "Nearly there. Close the gaps below before you go."
    : pct >= 40 ? "Good progress. Keep going: the open items each link to what to do."
    : "Just starting. Two to four weeks is plenty of time to work through this.";

  return (
    <>
      <div className="sticky top-20 z-10 mt-8 rounded-2xl p-4 sm:p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "0 8px 30px rgba(var(--shadow-color),0.06)" }}>
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <p className="text-[15px] font-semibold t-text" aria-live="polite">{n} of {TOTAL} done · {verdict}</p>
          {n > 0 && (
            <button onClick={() => save(new Set())} className="shrink-0 inline-flex items-center gap-1 text-[12.5px] font-semibold t-text-3 hover:text-[#ff5100]">
              <RotateCcw className="w-3.5 h-3.5" />Reset
            </button>
          )}
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-2)" }} role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={n} aria-label="Readiness">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: n === TOTAL ? "#10b981" : "#ff5100" }} />
        </div>
      </div>

      {GROUPS.map((g) => (
        <section key={g.title} className="mt-10">
          <h2 className="text-[22px] sm:text-[26px] t-text leading-tight mb-3" style={serif}>{g.title}</h2>
          <ul className="space-y-2">
            {g.items.map((it) => {
              const on = done.has(it.id);
              return (
                <li key={it.id} className="rounded-2xl p-4 flex gap-3.5" style={{ background: "var(--bg-surface)", border: `1px solid ${on ? "rgba(16,185,129,0.35)" : "var(--border-subtle)"}` }}>
                  <button onClick={() => toggle(it.id)} role="checkbox" aria-checked={on} aria-label={it.text}
                    className="w-6 h-6 rounded-lg grid place-items-center shrink-0 mt-0.5 transition-colors"
                    style={on ? { background: "#10b981", color: "white" } : { border: "2px solid var(--border-default)" }}>
                    {on && <Check className="w-4 h-4" />}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-[15px] leading-[1.5] ${on ? "t-text-3 line-through decoration-1" : "t-text font-medium"}`}>{it.text}</p>
                    {!on && (
                      <p className="text-[13.5px] leading-[1.55] t-text-2 mt-1">
                        {it.why}{" "}
                        <Link href={it.href} className="font-semibold whitespace-nowrap inline-flex items-center gap-0.5" style={{ color: "var(--accent-ink)" }}>{it.link}<ArrowRight className="w-3 h-3" /></Link>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="mt-12 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4" style={{ background: "rgba(255,81,0,0.05)", border: "1px solid rgba(255,81,0,0.2)" }}>
        <p className="flex-1 text-[15px] leading-[1.6] t-text-2">Ready, or close? Find the trip that fits you, and compare its operators side by side.</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/matchmaker" className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full text-[14px] font-semibold t-text" style={{ border: "1px solid var(--border-default)" }}>Matchmaker</Link>
          <Link href="/explore" className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full text-[14px] font-semibold text-[#1c1814]" style={{ background: "#ff5100" }}>Explore adventures <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </>
  );
}
