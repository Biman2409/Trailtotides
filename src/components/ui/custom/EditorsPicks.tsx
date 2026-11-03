"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { adventures, type Adventure } from "@/lib/data";
import { useFitnessProfile } from "@/lib/useFitnessProfile";
import { currentMonthIndexIST, pickedForProfile } from "@/lib/homeCuration";
import AdventureCard from "./AdventureCard";
import { FadeUp } from "./HomeAnimations";

// The home page's picks, two ways: the editors' six, or the Matchmaker's — your best fitness
// matches, in season first. Without a profile the Matchmaker side asks for the 2-minute test.
// The last choice is remembered in this browser.

type Tab = "editor" | "matched";
const TAB_KEY = "ttt_home_picks";

export default function EditorsPicks({ slugs, editorCount }: { slugs: string[]; editorCount: number }) {
  const editors = slugs.map((s) => adventures.find((a) => a.slug === s)).filter(Boolean) as Adventure[];
  const { ace, ready } = useFitnessProfile(); // completed trips included
  const [tab, setTab] = useState<Tab>("editor");
  const [matched, setMatched] = useState<Adventure[]>([]);

  useEffect(() => { try { if (localStorage.getItem(TAB_KEY) === "matched") setTab("matched"); } catch {} }, []);
  useEffect(() => { setMatched(ace ? pickedForProfile(adventures, ace, currentMonthIndexIST(), 6) : []); }, [ace]);
  const pick = (t: Tab) => { setTab(t); try { localStorage.setItem(TAB_KEY, t); } catch {} };

  const mine = tab === "matched";
  const list = mine ? matched : editors;
  const seeAll = mine
    ? { href: ace ? "/explore?ace=ready" : "/matchmaker", label: ace ? "See all your matches" : "Take the Matchmaker" }
    : { href: "/explore?editor=1", label: `See all ${editorCount} picks` };

  return (
    <>
      <FadeUp>
        <div className="flex items-end justify-between gap-4 mb-3 lg:mb-5">
          <div className="min-w-0">
            <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-2 flex items-center gap-1.5 uppercase">
              {mine ? <Sparkles className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5 fill-[#ff5100]" />}
              {mine ? "Adventure Matchmaker" : "Editor's Choice"}
            </p>
            <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight">
              {mine ? "Matched to your body" : "Adventures of a Lifetime"}
            </h2>
          </div>
          <Link
            href={seeAll.href}
            className="group hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5100] hover:text-[#ff7d47] transition-colors mb-1 shrink-0"
          >
            {seeAll.label}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Whose picks */}
        <div className="inline-flex p-1 mb-3 lg:mb-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }} role="tablist" aria-label="Whose picks">
          {([["editor", "Editor's picks", Crown], ["matched", "Matched to you", Sparkles]] as const).map(([k, label, Icon]) => {
            const on = tab === k;
            return (
              <button key={k} type="button" role="tab" aria-selected={on} onClick={() => pick(k)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-semibold transition-colors"
                style={on ? { background: "#ff5100", color: "#fff" } : { color: "var(--text-secondary)" }}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            );
          })}
        </div>
      </FadeUp>

      {mine && !ace ? (
        // No profile yet: what this side would show, and the way to get it
        <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <span className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{ background: "rgba(255,81,0,0.1)", color: "#ff5100" }}>
            <Sparkles className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="t-text text-[16px] font-bold">{ready ? "Your picks are 2 minutes away" : "Loading your picks…"}</p>
            <p className="text-[13.5px] mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Answer a few quick questions and the Adventure Matchmaker fills this row with the adventures your body is ready for, best in season first.
            </p>
          </div>
          <Link href="/matchmaker" className="group inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-[14px] font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a24] transition-colors shrink-0">
            Take the Matchmaker
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      ) : (
        // Phones swipe through the picks sideways; wider screens get the feature grid
        <div key={tab} className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar -mx-5 px-5 scroll-px-5 sm:mx-0 sm:px-0 pb-2 sm:pb-0 animate-in fade-in duration-500">
          {list.map((adventure, i) => (
            // The 2-column tablet grid fits the feature and four more; the sixth waits for the 3-column grid
            <div key={adventure.id} className={`snap-start shrink-0 w-[78vw] sm:w-auto ${i === 0 ? "sm:col-span-2 lg:row-span-2" : ""} ${i === 5 ? "sm:hidden lg:block" : ""}`}>
              {/* The section is already titled — no per-card badge. The feature card is large only in
                  the grid (CSS); in the phone swipe row it matches the rest. The others use wide photos
                  so two rows fit on one screen beside the feature. */}
              {i === 0 ? (
                <AdventureCard adventure={adventure} badge={false} fill size="large" />
              ) : (
                <AdventureCard adventure={adventure} badge={false} size="large" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="sm:hidden mt-3">
        <Link href={seeAll.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5100]">
          {seeAll.label}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}
