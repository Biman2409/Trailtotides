"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Heart, BadgeCheck, Star, ArrowRight, ArrowUpRight, GitCompareArrows, Check, Clock, Users, Route, Download } from "lucide-react";
import { CompassAIMark, MatchmakerMark } from "@/components/ui/custom/BrandMarks";
import type { Adventure, Month } from "@/lib/data";
import { useCompare } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { AXIS_LABEL } from "@/lib/fitness";
import { MONTHS } from "@/lib/homeCuration";
import { track } from "@/lib/analytics";
import { trailClimbM, trailEnds, trailProfile, trailWalkKm, type Trail } from "@/lib/trails/shared";
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
  onClose,
}: {
  adventure: Adventure;
  fit: Fit | null;
  group: string | null;
  hasProfile: boolean;
  month: Month | null;
  pickReason?: string;
  /** Drawn on the map when the adventure has one */
  trail?: Trail | null;
  onClose: () => void;
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
      <div className="relative h-36 lg:h-40 shrink-0">
        <Image src={a.heroImage} alt="" fill className="object-cover" sizes="380px" unoptimized />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #111418 2%, rgba(17,20,24,0.35) 55%, rgba(0,0,0,0.25))" }} />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="tm-chip" style={{ color: g.color, borderColor: `${g.color}55` }}>{a.type}</span>
          {!inSeason(a, month) && month && <span className="tm-chip text-white/60">Out of season in {month}</span>}
        </div>
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button type="button" onClick={save} aria-pressed={saved} aria-label={saved ? "Remove from saved" : "Save"} className="tm-iconbtn">
            <Heart className="w-3.5 h-3.5" fill={saved ? "#ff5100" : "none"} color={saved ? "#ff5100" : "currentColor"} />
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className="tm-iconbtn"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="absolute bottom-2.5 left-4 right-4">
          <h2 className="text-[17px] sm:text-[19px] font-bold leading-tight text-white tracking-tight">{a.name}</h2>
          <p className="mt-1 text-[11.5px] text-white/55 flex items-center gap-1.5 flex-wrap">
            <span>{a.state}</span><span className="opacity-40">·</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{a.durationDays}</span><span className="opacity-40">·</span>
            <span style={{ color: difficultyColor(diff) }}>{diff}</span>
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 space-y-3 overflow-y-auto">
        <p className="text-[12.5px] leading-relaxed text-white/60">{a.tagline}</p>

        {/* The trail, now drawn on the map */}
        {trail && <TrailPanel trail={trail} slug={a.slug} />}

        {/* Picked for you by Compass.AI */}
        {pickReason && (
          <div className="tm-panel flex gap-2.5" style={{ borderColor: "rgba(255,125,71,0.35)", background: "rgba(255,81,0,0.07)" }}>
            <CompassAIMark className="w-4 h-4 shrink-0 mt-0.5 text-[#ffb37a]" />
            <p className="text-[12px] leading-snug text-white/80"><span className="font-semibold text-[#ffb37a]">Compass.AI: </span>{pickReason}</p>
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
                    : fit.weeks > 0 ? <>About {fit.weeks} weeks of training to be ready</> : <>Matched to {group ? `“${group}”` : "your fitness profile"}</>}
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
            <MatchmakerMark className="w-4 h-4 shrink-0 text-[#ffa576]" />
            <span className="text-[12px] text-white/75 flex-1">Are you ready for this? <span className="text-[#ffa576] font-semibold">Take the 2-min fitness test</span></span>
            <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* Best months */}
        <div>
          <p className="tm-label">Best months</p>
          <div className="grid grid-cols-12 gap-[3px]">
            {MONTHS.map((m) => {
              const on = a.bestMonths.includes(m);
              return (
                <span key={m} title={m} className="h-5 rounded-[5px] grid place-items-center text-[8.5px] font-bold"
                  style={{ background: on ? `${g.color}33` : "rgba(255,255,255,0.04)", color: on ? g.color : "rgba(255,255,255,0.25)", outline: month === m ? "1.5px solid rgba(255,255,255,0.7)" : "none" }}>
                  {m[0]}
                </span>
              );
            })}
          </div>
        </div>

        {/* Run by verified operators */}
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
                    {o.verified ? <BadgeCheck className="w-4 h-4 shrink-0 text-[#6ff0e0]" /> : <span className="w-4 h-4 shrink-0" />}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold text-white/85 truncate">{o.name}</span>
                      <span className="block text-[10px] text-white/35">
                        <Star className="inline w-2.5 h-2.5 -mt-0.5 fill-[#ffd27a] text-[#ffd27a]" /> {o.googleRating.toFixed(1)}
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

        {/* Compare or book */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            disabled={!comparing && isFull}
            onClick={() => (comparing ? remove(a.id) : add(a))}
            className="tm-btn"
            style={comparing ? { background: "rgba(111,240,224,0.12)", color: "#6ff0e0", borderColor: "rgba(111,240,224,0.35)" } : undefined}
          >
            {comparing ? <Check className="w-3.5 h-3.5" /> : <GitCompareArrows className="w-3.5 h-3.5" />}
            {comparing ? "Comparing" : isFull ? "Compare full" : "Compare"}
          </button>
          {top?.website ? (
            <button type="button" onClick={book} className="tm-btn tm-btn-primary" title={`Opens ${top.name}'s site`}>Book now <ArrowUpRight className="w-3.5 h-3.5" /></button>
          ) : (
            <Link href={`/experiences/${a.slug}`} className="tm-btn tm-btn-primary">See options <ArrowRight className="w-3.5 h-3.5" /></Link>
          )}
        </div>
        {top?.website && (
          <p className="-mt-1 text-center text-[10.5px] text-white/40">
            Book with <span className="text-white/70 font-semibold">{top.name}</span>, our top-rated verified operator here
          </p>
        )}
        {comparing && selected.length > 1 && (
          <button type="button" onClick={openDrawer} className="w-full text-[11.5px] font-semibold text-[#6ff0e0] hover:underline">Compare {selected.length} side by side →</button>
        )}
        <Link href={`/experiences/${a.slug}`} className="flex items-center justify-center gap-1 text-[12px] font-semibold text-white/55 hover:text-white transition-colors">
          Full details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

/** Length, climb and a small elevation line for the trail on the map, with the way to the full trail and GPX */
function TrailPanel({ trail, slug }: { trail: Trail; slug: string }) {
  const prof = trailProfile(trail);
  const maxKm = prof[prof.length - 1].km;
  const eles = prof.map((p) => p.ele);
  const lo = Math.min(...eles), hi = Math.max(...eles);
  const W = 240, H = 40;
  const d = prof.map((p, i) => `${i ? "L" : "M"}${((p.km / maxKm) * W).toFixed(1)},${(H - 2 - ((p.ele - lo) / Math.max(1, hi - lo)) * (H - 6)).toFixed(1)}`).join("");
  return (
    <div className="tm-panel" style={{ borderColor: "rgba(255,81,0,0.35)", background: "rgba(255,81,0,0.06)" }}>
      <div className="flex items-center gap-2">
        <Route className="w-4 h-4 text-[#ff7d47] shrink-0" />
        <p className="text-[12.5px] font-bold text-white">Trail on the map</p>
        <p className="ml-auto text-[11px] text-white/50 tabular-nums" title={`${trailEnds(trail).from} to ${trailEnds(trail).to}, start to end`}>{trailWalkKm(trail)} km · +{trailClimbM(trail).toLocaleString("en-IN")} m · {trail.stops.length} stops</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10 mt-2" aria-label={`Elevation ${lo.toLocaleString("en-IN")} to ${hi.toLocaleString("en-IN")} m`} role="img">
        <path d={`${d}L${W},${H}L0,${H}Z`} fill="rgba(255,81,0,0.18)" />
        <path d={d} fill="none" stroke="#ff7d47" strokeWidth="1.6" />
      </svg>
      <div className="flex items-center justify-between text-[10.5px] text-white/40 -mt-0.5">
        <span>{trail.stops[0].name}</span><span>{trail.stops[trail.stops.length - 1].name}</span>
      </div>
      <div className="flex gap-2 mt-2.5">
        <Link href={`/experiences/${slug}#at-a-glance`} className="flex-1 inline-flex items-center justify-center gap-1 h-8 rounded-lg text-[12px] font-semibold text-white bg-white/10 hover:bg-white/15">Itinerary &amp; elevation <ArrowRight className="w-3.5 h-3.5" /></Link>
        <a href={`/experiences/${slug}/trail.gpx`} download className="inline-flex items-center justify-center gap-1 h-8 px-3 rounded-lg text-[12px] font-semibold text-white bg-[#ff5100] hover:bg-[#ff6a1f]"><Download className="w-3.5 h-3.5" />GPX</a>
      </div>
    </div>
  );
}
