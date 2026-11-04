"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, BadgeCheck, Star, ArrowRight, ArrowUpRight, GitCompareArrows, Check, Users, Route, Mountain, Waves, CalendarDays, ChevronRight, Loader2 } from "lucide-react";
import { CompassAIMark, MatchmakerMark } from "@/components/ui/custom/BrandMarks";
import type { Adventure, Month } from "@/lib/data";
import { useCompare } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { AXIS_LABEL } from "@/lib/fitness";
import { MONTHS } from "@/lib/homeCuration";
import { track } from "@/lib/analytics";
import { trailClimbM, trailHighPoint, trailWalkKm, type Trail } from "@/lib/trails/shared";
import {
  genreOf, difficultyOf, difficultyColor, verifiedOperators, priceFrom, formatINR, daysAgo, inSeason, type Fit,
} from "./mapShared";

// The selected pin, told as the promise: matched to your fitness, (picked for you by AI),
// run by verified operators — and then compare or book.

export default function PinCard({
  adventure: a,
  fit,
  group,
  hasProfile,
  month,
  pickReason,
  trail,
  hasTrail = false,
  onItinerary,
  itineraryOpen = false,
}: {
  adventure: Adventure;
  fit: Fit | null;
  group: string | null;
  hasProfile: boolean;
  month: Month | null;
  pickReason?: string;
  /** Drawn on the map when the adventure has one */
  trail?: Trail | null;
  /** The adventure has a mapped trail (it may still be loading) */
  hasTrail?: boolean;
  /** Opens the itinerary and elevation beside the card, on the map */
  onItinerary?: () => void;
  /** The itinerary panel is showing this adventure */
  itineraryOpen?: boolean;
  /** Unused here: "Back to results" above the card closes it */
  onClose?: () => void;
}) {
  const { isSelected, add, remove, isFull, openDrawer, selected } = useCompare();
  const { isSaved, toggle, signedIn } = useWishlist();
  const router = useRouter();
  const g = genreOf(a.type);
  const diff = difficultyOf(a);
  const verified = verifiedOperators(a).sort((x, y) => y.googleRating - x.googleRating);
  const others = (a.operators ?? []).filter((o) => !o.verified);
  const price = priceFrom(a);
  const top = verified[0];
  const comparing = isSelected(a.id);
  const saved = isSaved(a.slug);

  // The wishlist needs an account, same as everywhere else on the site
  function save() {
    if (!signedIn) {
      toast.error("Log in to wishlist this adventure.", {
        action: { label: "Log in", onClick: () => router.push("/auth/login") },
      });
      return;
    }
    toggle(a.slug);
  }

  function book() {
    track("map_book_click", { slug: a.slug, operator: top?.name ?? "" });
    if (top?.website) window.open(top.website, "_blank", "noopener,noreferrer");
  }

  return (
    <article className="tm-card" style={{ "--g": g.color } as React.CSSProperties}>
      <div className="relative h-28 lg:h-36 shrink-0 tm-on-photo">
        <Image src={a.heroImage} alt="" fill className="object-cover" sizes="380px" unoptimized />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--tm-card) 2%, rgba(var(--tm-bg),0.35) 55%, rgba(0,0,0,0.25))" }} />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="tm-chip" style={{ color: g.color, borderColor: `${g.color}55` }}>{a.type}</span>
          {!inSeason(a, month) && month && <span className="tm-chip text-white/60">Out of season in {month}</span>}
        </div>
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button type="button" onClick={save} aria-pressed={saved} aria-label={saved ? "Remove from your wishlist" : "Save to your wishlist"} title={saved ? "In your wishlist" : "Save to your wishlist"} className="tm-iconbtn">
            <Heart className="w-3.5 h-3.5" fill={saved ? "#ff5100" : "none"} color={saved ? "#ff5100" : "currentColor"} />
          </button>
        </div>
        <div className="absolute bottom-2.5 left-4 right-4">
          <h2 className="text-[17px] sm:text-[19px] font-bold leading-tight text-white tracking-tight">{a.name}</h2>
          <p className="mt-1 text-[11.5px] text-white/55 flex items-center gap-1.5 flex-wrap">
            <span>{a.state}</span><span className="opacity-40">·</span>
            {/* Duration is the first fact below, so the hero keeps to place and difficulty */}
            <span style={{ color: difficultyColor(diff) }}>{diff}</span>
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 space-y-4">
        <p className="text-[12.5px] leading-relaxed text-white/60">{a.tagline}</p>

        {/* 1. At a glance: always the same three facts, a dash where one doesn't apply */}
        <Facts a={a} trail={trail ?? null} />

        {/* 2. The day-by-day plan and height profile open beside the card, when the trail is mapped */}
        {hasTrail && (
          <button type="button" onClick={onItinerary} disabled={!trail || !onItinerary} className="tm-itin" aria-expanded={itineraryOpen} data-on={itineraryOpen || undefined}>
            <span className="tm-itin-icon">{trail ? <Route className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}</span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[13px] font-bold text-white">Itinerary &amp; elevation</span>
              <span className="block text-[11px] text-white/50 truncate">
                {trail ? `${trail.days.length}-day plan · ${trailWalkKm(trail)} km · ${trailClimbM(trail).toLocaleString("en-IN")} m up` : "Loading the trail…"}
              </span>
            </span>
            <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
          </button>
        )}

        {/* 3. Best months, always here */}
        <Section title="Best months" aside={month ? (inSeason(a, month) ? `In season in ${month}` : `Not in season in ${month}`) : a.bestSeason}>
          <div className="grid grid-cols-12 gap-[3px]">
            {MONTHS.map((m) => {
              const on = a.bestMonths.includes(m);
              return (
                <span key={m} title={m} className="h-5 rounded-[5px] grid place-items-center text-[8.5px] font-bold"
                  style={{ background: on ? `${g.color}33` : "rgba(var(--tm-ink),0.04)", color: on ? g.color : "rgba(var(--tm-ink),0.25)", outline: month === m ? "1.5px solid rgba(var(--tm-ink),0.7)" : "none" }}>
                  {m[0]}
                </span>
              );
            })}
          </div>
        </Section>

        {/* 4. Your fit, and why Compass.AI picked it */}
        {(pickReason || fit || !hasProfile) && <p className="tm-label !-mb-2">Your fit</p>}
        {/* Picked for you by Compass.AI */}
        {pickReason && (
          <div className="tm-panel flex gap-2.5" style={{ borderColor: "rgba(255,125,71,0.35)", background: "rgba(255,81,0,0.07)" }}>
            <CompassAIMark className="w-4 h-4 shrink-0 mt-0.5 text-[var(--tm-peach-2)]" />
            <p className="text-[12px] leading-snug text-white/80"><span className="font-semibold text-[var(--tm-peach-2)]">Compass.AI: </span>{pickReason}</p>
          </div>
        )}

        {/* Matched to your fitness */}
        {fit ? (
          <div className="tm-panel">
            <div className="flex items-center gap-2.5">
              <span className="tm-score" style={{ "--c": fit.bucket.color, "--p": `${fit.score}%` } as React.CSSProperties}>{fit.score}</span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold" style={{ color: fit.bucket.color }}>
                  {group ? (fit.bucket.key === "ready" ? "Everyone's ready" : fit.bucket.key === "stretch" ? "A stretch for the group" : "Not yet for the group") : fit.bucket.key === "ready" ? "You're ready" : fit.bucket.key === "stretch" ? "A stretch for you" : "Not yet"}
                </p>
                <p className="text-[11px] text-white/45">
                  {group && fit.weakest && fit.bucket.key !== "ready"
                    ? <>Waiting on {fit.weakest}{fit.weeks > 0 ? ` · ~${fit.weeks} weeks of training` : ""}</>
                    : fit.weeks > 0 ? <>About {fit.weeks} weeks of training to be ready</> : <>Matched to {group ? `“${group}”` : "your ACE™ profile"}</>}
                </p>
              </div>
              {group && <Users className="w-4 h-4 ml-auto text-white/30 shrink-0" />}
            </div>
            {fit.gaps.length > 0 && fit.bucket.key !== "ready" && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {fit.gaps.slice(0, 3).map((gp) => (
                  <span key={gp.axis} className="text-[10.5px] px-2 py-0.5 rounded-full bg-white/5 text-white/60">
                    {AXIS_LABEL[gp.axis]} <span className="text-white/35">{gp.have}→{gp.need}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : !hasProfile && (
          <Link href="/matchmaker" className="tm-panel flex items-center gap-2.5 group" onClick={() => track("map_fitness_cta", { from: "card" })}>
            <MatchmakerMark className="w-4 h-4 shrink-0 text-[var(--tm-peach-4)]" />
            <span className="text-[12px] text-white/75 flex-1">Are you ready for this? <span className="text-[var(--tm-peach-4)] font-semibold">Take the 2-min Adventure Matchmaker</span></span>
            <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* 5. Run by verified operators */}
        <div>
          <div className="flex items-baseline justify-between">
            <p className="tm-label">{verified.length ? `${verified.length} verified operator${verified.length > 1 ? "s" : ""}` : "Operators"}</p>
            {price !== null && <p className="text-[11px] text-white/45">from <span className="text-white font-bold text-[13px]">{formatINR(price)}</span></p>}
          </div>
          <ul className="space-y-1.5">
            {(verified.length ? verified : others).slice(0, 3).map((o) => {
              const checked = daysAgo(o.priceCheckedAt);
              return (
                <li key={o.name}>
                  <a href={o.website} target="_blank" rel="noopener noreferrer" onClick={() => track("map_operator_click", { slug: a.slug, operator: o.name })}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.035] hover:bg-white/[0.07] transition-colors group">
                    {o.verified ? <BadgeCheck className="w-4 h-4 shrink-0 text-[var(--tm-mint)]" /> : <span className="w-4 h-4 shrink-0" />}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold text-white/85 truncate">{o.name}</span>
                      <span className="block text-[10px] text-white/35">
                        <Star className="inline w-2.5 h-2.5 -mt-0.5 fill-[var(--tm-star)] text-[var(--tm-star)]" /> {o.googleRating.toFixed(1)}
                        {checked !== null && <> · price checked {checked === 0 ? "today" : `${checked}d ago`}</>}
                      </span>
                    </span>
                    <span className="text-[11.5px] font-bold text-white/80 shrink-0">{o.priceFrom}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 shrink-0" />
                  </a>
                </li>
              );
            })}
          </ul>
          {!verified.length && <p className="mt-1.5 text-[10.5px] text-white/35">None of these operators are verified yet.</p>}
        </div>

        {top?.website && (
          <p className="text-center text-[10.5px] text-white/40">
            <span className="text-white/70 font-semibold">Book now</span> opens {top.name}, the top-rated verified operator here
          </p>
        )}
        <Link href={`/experiences/${a.slug}`} className="flex items-center justify-center gap-1 text-[12px] font-semibold text-white/55 hover:text-white transition-colors">
          Open the full adventure page <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Compare or book: pinned to the bottom of the panel or sheet, so it's always in reach */}
      <div className="tm-card-actions">
        {comparing && selected.length > 1 && (
          <button type="button" onClick={openDrawer} className="w-full mb-2 text-[11.5px] font-semibold text-[var(--tm-mint)] hover:underline">Compare these {selected.length} side by side →</button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!comparing && isFull}
            onClick={() => (comparing ? remove(a.id) : add(a))}
            className="tm-btn"
            style={comparing ? { background: "rgba(111,240,224,0.12)", color: "var(--tm-mint)", borderColor: "rgba(111,240,224,0.35)" } : undefined}
          >
            {comparing ? <Check className="w-3.5 h-3.5" /> : <GitCompareArrows className="w-3.5 h-3.5" />}
            {comparing ? "In compare" : isFull ? "Compare is full" : "Add to compare"}
          </button>
          {top?.website ? (
            <button type="button" onClick={book} className="tm-btn tm-btn-primary" title={`Opens ${top.name}'s site`}>Book now <ArrowUpRight className="w-3.5 h-3.5" /></button>
          ) : (
            <Link href={`/experiences/${a.slug}`} className="tm-btn tm-btn-primary">See options <ArrowRight className="w-3.5 h-3.5" /></Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** A titled section of the card, so every card reads in the same order */
function Section({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="tm-label">{title}</p>
        {aside && <p className="text-[10.5px] text-white/45 truncate -mt-1.5">{aside}</p>}
      </div>
      {children}
    </div>
  );
}

/** Duration, distance and height (or depth), from the mapped trail when there is one */
function Facts({ a, trail }: { a: Adventure; trail: Trail | null }) {
  const high = trail ? trailHighPoint(trail).ele : null;
  const cells: [React.ReactNode, string, string][] = [
    [<CalendarDays key="d" className="w-3.5 h-3.5" />, "Duration", a.durationDays],
    [<Route key="r" className="w-3.5 h-3.5" />, "Distance", trail ? `${trailWalkKm(trail)} km` : a.distance ?? "—"],
    a.depth
      ? [<Waves key="w" className="w-3.5 h-3.5" />, "Depth", a.depth]
      : [<Mountain key="m" className="w-3.5 h-3.5" />, "Highest", a.altitude ? a.altitude.replace(/(\d)\s*m$/, "$1 m") : (high ? `${high.toLocaleString("en-IN")} m` : "—")],
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {cells.map(([icon, label, v]) => (
        <div key={label} className="tm-panel !px-2.5 !py-2 min-w-0">
          <p className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/40"><span className="text-white/50">{icon}</span>{label}</p>
          <p className="mt-1 text-[13px] font-bold text-white truncate" title={v}>{v}</p>
        </div>
      ))}
    </div>
  );
}
