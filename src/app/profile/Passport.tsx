"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Share2, X, Camera } from "lucide-react";
import { toast } from "sonner";
// Type-only: passportData.ts is server code, but types are erased from the client bundle
import type { PassportData, AdventureLogEntry, CollectionState, CollectionSlot, PassportStamp } from "@/lib/passportData";
import {
  GOLD, INDIA_PATH, DIFFICULTY_COLOR, RADAR_AXES, RADAR_AXIS_LABELS, RADAR_AXIS_SHORT,
  fmtDate, fmtNumber, parseISODate, ptsStr, polygonVertices, radarVertices,
  TypeIcon, ImmigrationStamp, BadgeIcon,
} from "@/lib/passportVisuals";
import { ALL_BADGES, badgeFace, type Achievement } from "@/lib/achievements";
import { useBadgeRarity } from "@/lib/useBadgeRarity";
import { BADGE_GOLD, PinnacleMedal } from "@/components/ui/custom/BadgeIcon";

// The Adventure Passport: a closed cover, then one page at a time (swipe, arrows or
// keys). ID page → where you've been → badges → a page per trip → the full logbook →
// the stamp collection (every adventure on the site, by region, stamped or waiting —
// last, so its many empty slots don't push your own trips back).
// Paper and ink in light mode, dark paper in dark mode; stamps are re-inked to match.
// Pages are laid out at 420×600. On a phone they narrow to the screen (down to 340, then
// the book scales); on a wider screen the whole book scales down to fit a short window.

const ORANGE = "#ff5100";
const PAGE_W = 420;
const PAGE_H = 600;
/** Narrowest the pages are laid out at; below this the book scales instead */
const MIN_PAGE_W = 340;
/** Room the page controls and site chrome need below/above the book */
const CHROME_H = 200;

type Section = "id" | "map" | "badges" | "trips" | "log" | "stamps";
const SECTION_LABEL: Record<Section, string> = { id: "ID", map: "Map", badges: "Badges", trips: "Trips", log: "Logbook", stamps: "Stamps" };
interface Page { key: string; section: Section; node: React.ReactNode }

// ─── Page furniture ────────────────────────────────────────────────────────

function PageFrame({ title, kicker, children, footer }: { title: string; kicker: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col px-5 pt-4 pb-3" style={{ background: "var(--pp-paper)", color: "var(--pp-ink)" }}>
      <div className="flex items-baseline justify-between gap-3 shrink-0 pr-8">
        <span className="text-[11px] tracking-[0.18em] uppercase" style={{ color: "var(--pp-muted)" }}>{kicker}</span>
        <span className="text-[11px] tracking-[0.18em] uppercase" style={{ color: "var(--pp-muted)" }}>Trail to Tides</span>
      </div>
      <h3 className="mt-1 text-[22px] leading-tight !font-normal shrink-0" style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--accent-ink)" }}>{title}</h3>
      <div className="flex-1 min-h-0 mt-3 flex flex-col">{children}</div>
      {footer && <div className="shrink-0 pt-2">{footer}</div>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--pp-muted)", fontVariant: "small-caps" }}>{children}</p>;
}

function Stamp({ slot, size }: { slot: Pick<CollectionSlot, "seed" | "date" | "difficulty"> & { state: string }; size: number }) {
  return (
    <span className="pp-stamp relative block shrink-0" style={{ width: size, height: size }}>
      <ImmigrationStamp seed={slot.seed} state={slot.state} date={slot.date ?? ""} size={size} tier={slot.difficulty === "Extreme" ? 5 : 1} />
    </span>
  );
}

function Mrz({ data }: { data: PassportData }) {
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "<");
  const [first, ...rest] = data.name.split(" ");
  const line1 = `P<TTT${clean(rest.join(" ") || first)}<<${clean(rest.length ? first : "")}`.padEnd(44, "<").slice(0, 44);
  const line2 = `${clean(data.passportNo)}<<${String(data.totalAdventures).padStart(3, "0")}ADV<<${String(data.statesCount).padStart(2, "0")}RG<<${clean(data.level.name)}`.padEnd(44, "<").slice(0, 44);
  return (
    <div className="font-mono text-[11px] leading-[1.35] tracking-[0.06em] overflow-hidden whitespace-nowrap" style={{ color: "var(--pp-muted)" }} aria-hidden>
      <div>{line1}</div>
      <div>{line2}</div>
    </div>
  );
}

// ─── Pages ─────────────────────────────────────────────────────────────────

function IdPage({ data }: { data: PassportData }) {
  const field = (label: string, value: string) => (
    <div className="min-w-0">
      <Label>{label}</Label>
      <p className="text-[14px] truncate">{value}</p>
    </div>
  );
  const cx = 50, cy = 50, maxR = 34;
  return (
    <PageFrame kicker="Passport · P · TTT" title="Adventure Passport" footer={<Mrz data={data} />}>
      <div className="flex gap-4">
        <div className="w-[88px] h-[108px] shrink-0 rounded-md overflow-hidden flex items-center justify-center" style={{ border: "1.5px solid var(--pp-ink)", background: "var(--pp-wash)" }}>
          {data.avatarUrl
            // eslint-disable-next-line @next/next/no-img-element -- small avatar, already sized
            ? <img src={data.avatarUrl} alt="" className="w-full h-full object-cover" />
            : <TypeIcon type="Mountaineering" size={34} color="currentColor" />}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {field("name", data.name)}
          {field("username", data.username ? `@${data.username}` : "—")}
          {field("level", `${data.level.name} · ${fmtNumber(data.totalXP)} XP`)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3" style={{ borderTop: "1px dashed var(--pp-line)" }}>
        {field("passport no.", data.passportNo)}
        {field("issued", fmtDate(new Date(data.issueDateISO)))}
      </div>

      <div className="grid grid-cols-3 mt-4 py-3" style={{ borderTop: "1px solid var(--pp-line)", borderBottom: "1px solid var(--pp-line)" }}>
        {[
          { n: data.totalAdventures, l: "adventures" },
          { n: data.statesCount, l: data.statesCount === 1 ? "region" : "regions" },
          { n: data.totalBadges, l: data.totalBadges === 1 ? "badge" : "badges" },
        ].map((s) => (
          <div key={s.l} className="text-center">
            <p className="text-[26px] leading-none" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>{s.n}</p>
            <Label>{s.l}</Label>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-3">
        <svg viewBox="0 0 100 100" className="w-[92px] h-[92px] shrink-0" aria-hidden>
          {[1 / 3, 2 / 3, 1].map((f) => (
            <polygon key={f} points={ptsStr(polygonVertices(cx, cy, maxR * f, 8))} fill="none" stroke="var(--pp-line)" strokeWidth={0.8} />
          ))}
          {data.hasAceData && (
            <polygon points={ptsStr(radarVertices(cx, cy, RADAR_AXES.map((ax) => data.userAce[ax]), 5, maxR))} fill="rgba(255,81,0,0.18)" stroke={ORANGE} strokeWidth={1.5} />
          )}
          {polygonVertices(cx, cy, maxR + 10, 8).map(([x, y], i) => (
            <text key={i} x={x} y={y} fontSize={6.5} textAnchor="middle" dominantBaseline="middle" fill="var(--pp-muted)">{RADAR_AXIS_SHORT[RADAR_AXES[i]]}</text>
          ))}
        </svg>
        <div className="min-w-0">
          <Label>capability</Label>
          {data.hasAceData ? (
            <>
              <p className="text-[14px]">ACE {data.aceScore}/40</p>
              <p className="text-[13px]" style={{ color: "var(--pp-muted)" }}>Strongest in {RADAR_AXIS_LABELS[data.topAxis]}</p>
            </>
          ) : (
            <p className="text-[13px]" style={{ color: "var(--pp-muted)" }}>
              Take the <Link href="/ace" className="underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>ACE™ assessment</Link> to fill this in.
            </p>
          )}
        </div>
      </div>
    </PageFrame>
  );
}

function MapPage({ data }: { data: PassportData }) {
  const states = data.collection.filter((c) => c.done > 0);
  return (
    <PageFrame kicker="Where you've been" title={data.totalAdventures ? `${data.totalAdventures} adventures, ${data.statesCount} ${data.statesCount === 1 ? "region" : "regions"}` : "Your map is empty"}>
      <div className="relative flex-1 min-h-0">
        <svg viewBox="0 0 420 480" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-label="Map of India with your adventures">
          <path d={INDIA_PATH} fill="var(--pp-wash)" stroke="var(--pp-line)" strokeWidth={1.2} />
          {data.stamps.map((s) => (
            <g key={s.slug}>
              <title>{`${s.name} · ${fmtDate(parseISODate(s.date))}`}</title>
              <circle cx={(s.xPct / 100) * 420} cy={(s.yPct / 100) * 480} r={9} fill="rgba(255,81,0,0.16)" />
              <circle cx={(s.xPct / 100) * 420} cy={(s.yPct / 100) * 480} r={4.5} fill={ORANGE} stroke="var(--pp-paper)" strokeWidth={1.5} />
            </g>
          ))}
        </svg>
        {!data.totalAdventures && (
          <p className="absolute inset-x-0 bottom-2 text-center text-[13px]" style={{ color: "var(--pp-muted)" }}>Mark an adventure done and it lands here.</p>
        )}
      </div>
      {states.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 shrink-0">
          {states.map((c) => (
            <span key={c.state} className="text-[12px] px-2 py-0.5 rounded-full" style={{ border: "1px solid var(--pp-line)" }}>
              {c.state} <span style={{ color: "var(--pp-muted)" }}>· {c.done}</span>
            </span>
          ))}
        </div>
      )}
    </PageFrame>
  );
}

const BADGES_PER_PAGE = 20;

function BadgesPage({ data, badges, part, parts }: { data: PassportData; badges: Achievement[]; part: number; parts: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const rarityOf = useBadgeRarity();
  const earnedIds = new Set(data.badges.map((b) => b.id));
  const picked = ALL_BADGES.find((b) => b.id === selected);
  const pickedEarned = !!picked && earnedIds.has(picked.id);
  const pickedFace = picked && badgeFace(picked, pickedEarned);
  // The footer shows the tapped seal, or else the badge closest to unlocking
  // (earned: what it means; locked: how to get it — the page has room for one or the other)
  const pickedProgress = picked && !pickedEarned ? data.badgeProgress[picked.id] ?? null : null;
  const foot = pickedFace
    ? { label: pickedEarned ? "earned" : "locked", name: pickedFace.name, line: pickedProgress?.hint || pickedFace.description, progress: pickedProgress, rare: rarityOf(pickedFace.id) }
    : data.nextBadge && { label: "next badge", name: data.nextBadge.name, line: data.nextBadge.hint, progress: data.nextBadge, rare: null };
  return (
    <PageFrame kicker={parts > 1 ? `Badges · ${part} of ${parts}` : "Badges"} title={`${data.totalBadges} of ${ALL_BADGES.length} badges`}>
      {/* Every badge has a seal: earned ones inked in orange (the pinnacle ones filled), the rest an outline to earn. Tap one for what it is. */}
      <div className="grid grid-cols-5 gap-x-1.5 gap-y-2 content-start">
        {badges.map((b, i) => {
          const earned = earnedIds.has(b.id);
          const face = badgeFace(b, earned);
          const accent = earned && b.tier === "tier1";
          const on = selected === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelected(on ? null : b.id)}
              aria-pressed={on}
              aria-label={`${face.name}, ${earned ? "earned" : "locked"}`}
              className="flex flex-col items-center gap-1 text-center rounded-lg transition-colors hover:bg-[var(--pp-wash)]"
              style={on ? { background: "var(--pp-wash)" } : undefined}
            >
              {accent ? (
                // Pinnacle: the same medal as the Trophy Cabinet, with the paper showing between ring and coin
                <PinnacleMedal size={46} gap="var(--pp-paper)"><BadgeIcon name={face.icon} size={18} color="#fff" /></PinnacleMedal>
              ) : (
                <span
                  className="relative w-11 h-11 rounded-full flex items-center justify-center"
                  style={!earned
                    ? { border: "1.5px dashed var(--pp-line)", outline: b.tier === "tier1" ? "1px dashed var(--pp-line)" : undefined, outlineOffset: 2, color: "var(--pp-muted)", opacity: 0.75 }
                    // Others inked orange — secret ones in gold — and stamped at a slight angle
                    : { border: `1.5px solid ${b.secret ? BADGE_GOLD : ORANGE}`, background: b.secret ? `${BADGE_GOLD}1f` : "transparent", outline: "1px dashed var(--pp-line)", outlineOffset: 2, transform: `rotate(${((i * 37) % 13) - 6}deg)`, color: b.secret ? BADGE_GOLD : ORANGE }}
                >
                  <BadgeIcon name={face.icon} size={18} color="currentColor" />
                </span>
              )}
              <span className="text-[11px] leading-tight line-clamp-2" style={{ color: earned ? "var(--pp-ink)" : "var(--pp-muted)" }}>{face.name}</span>
            </button>
          );
        })}
      </div>
      <div className="flex-1" />
      {foot && (
        <div className="pt-3" style={{ borderTop: "1px dashed var(--pp-line)" }}>
          <Label>{foot.label}</Label>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] truncate">{foot.name}</p>
              <p className="text-[12px] leading-snug line-clamp-2" style={{ color: "var(--pp-muted)" }}>{foot.line}</p>
              {foot.rare && <p className="text-[12px] leading-snug" style={{ color: "var(--accent-ink)" }}>{foot.rare}</p>}
            </div>
            {foot.progress && foot.progress.need > 1 && (
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="text-[12px] tabular-nums">{fmtNumber(foot.progress.have)} / {fmtNumber(foot.progress.need)}</span>
                <span className="block w-16 h-[3px] rounded-full overflow-hidden" style={{ background: "var(--pp-line)" }}>
                  <span className="block h-full" style={{ width: `${Math.round((foot.progress.have / foot.progress.need) * 100)}%`, background: ORANGE }} />
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </PageFrame>
  );
}

type StampChunk = { state: string; done: number; total: number; cont: boolean; slots: CollectionSlot[] };

function StampsPage({ chunks, totalDone, totalAll, onOpenTrip }: { chunks: StampChunk[]; totalDone: number; totalAll: number; onOpenTrip: (slug: string) => boolean }) {
  return (
    <PageFrame kicker={`Stamps · ${totalDone} of ${totalAll}`} title="The collection">
      <div className="flex flex-col gap-3">
        {chunks.map((c) => (
          <div key={`${c.state}-${c.slots[0]?.slug}`}>
            <div className="flex items-baseline justify-between mb-1.5">
              <Label>{c.state}{c.cont ? " (continued)" : ""}</Label>
              <span className="text-[12px] tabular-nums" style={{ color: "var(--pp-muted)" }}>{c.done} of {c.total}</span>
            </div>
            <div className="grid grid-cols-4 gap-x-1.5 gap-y-2">
              {c.slots.map((s) => {
                const body = (
                  <>
                    {s.done
                      ? <Stamp slot={{ ...s, state: c.state }} size={58} />
                      : (
                        <span className="w-[50px] h-[50px] my-[4px] rounded-full flex items-center justify-center" style={{ border: "1.5px dashed var(--pp-line)", color: "var(--pp-muted)" }}>
                          <TypeIcon type={s.type} size={18} color="currentColor" />
                        </span>
                      )}
                    <span className="text-[11px] leading-tight line-clamp-2 w-full" style={{ color: s.done ? "var(--pp-ink)" : "var(--pp-muted)" }}>{s.name}</span>
                  </>
                );
                const cls = "flex flex-col items-center gap-0.5 text-center rounded-lg py-0.5 transition-colors hover:bg-[var(--pp-wash)]";
                return s.done ? (
                  <button key={s.slug} type="button" className={cls} onClick={() => { if (!onOpenTrip(s.slug)) window.location.href = `/experiences/${s.slug}`; }} aria-label={`${s.name}, stamped ${s.date}`}>{body}</button>
                ) : (
                  <Link key={s.slug} href={`/experiences/${s.slug}`} className={cls} aria-label={`${s.name}, not done yet`}>{body}</Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}

function TripPage({ entry, state }: { entry: AdventureLogEntry; state: string }) {
  const color = DIFFICULTY_COLOR[entry.difficulty] ?? ORANGE;
  return (
    <PageFrame kicker={`Trip · ${fmtDate(parseISODate(entry.date))}`} title={entry.name}>
      <div className="relative rounded-lg overflow-hidden shrink-0" style={{ aspectRatio: "4 / 3", background: "var(--pp-wash)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote user photos of unknown size */}
        <img src={entry.photoUrl} alt={entry.photoCaption ?? entry.name} className="absolute inset-0 w-full h-full object-cover" />
        {entry.isPersonalPhoto && (
          <span className="absolute left-2 bottom-2 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(0,0,0,0.55)" }}>
            <Camera className="w-3 h-3" /> Your photo
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[12px]">
        <span className="px-2 py-0.5 rounded-full" style={{ border: `1px solid ${color}`, color }}>{entry.difficulty}</span>
        <span style={{ color: "var(--pp-muted)" }}>{state} · {entry.type}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {entry.trophies.map((t) => (
          <span key={t.label} className="text-[11px] px-2 py-1 rounded-md" style={{ background: "var(--pp-wash)" }}>{t.label.charAt(0) + t.label.slice(1).toLowerCase()}</span>
        ))}
      </div>
      <p className="mt-3 text-[14px] italic leading-relaxed line-clamp-4" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>&ldquo;{entry.memorableMoment}&rdquo;</p>
      <div className="flex-1" />
      <Link href={`/experiences/${entry.slug}`} className="self-start text-[13px] underline underline-offset-2" style={{ color: "var(--accent-ink)" }}>Open the adventure</Link>
    </PageFrame>
  );
}

function LogPage({ rows, from, total, onOpenTrip }: { rows: PassportStamp[]; from: number; total: number; onOpenTrip: (slug: string) => boolean }) {
  return (
    <PageFrame kicker={`Logbook · ${from + 1}–${from + rows.length} of ${total}`} title="Every adventure">
      {rows.length === 0 ? (
        <p className="text-[14px]" style={{ color: "var(--pp-muted)" }}>Nothing logged yet. Mark an adventure done from its page and it&apos;s written in here.</p>
      ) : (
        <ul>
          {rows.map((s) => (
            <li key={s.slug} style={{ borderBottom: "1px dashed var(--pp-line)" }}>
              <button
                type="button"
                onClick={() => { if (!onOpenTrip(s.slug)) window.location.href = `/experiences/${s.slug}`; }}
                className="w-full flex items-center gap-3 py-2 text-left transition-colors hover:bg-[var(--pp-wash)]"
              >
                <span className="font-mono text-[11px] w-[78px] shrink-0" style={{ color: "var(--pp-muted)" }}>{fmtDate(parseISODate(s.date))}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] truncate">{s.name}</span>
                  <span className="block text-[12px]" style={{ color: "var(--pp-muted)" }}>{s.state}</span>
                </span>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DIFFICULTY_COLOR[s.difficulty] ?? ORANGE }} title={s.difficulty} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </PageFrame>
  );
}

// ─── Splitting the collection and logbook into pages ───────────────────────

const COLS = 4, ROW_H = 96, HEAD_H = 28, STAMP_BUDGET = 470;

function paginateCollection(collection: CollectionState[]): StampChunk[][] {
  const pages: StampChunk[][] = [];
  let page: StampChunk[] = [], used = 0;
  const flush = () => { if (page.length) pages.push(page); page = []; used = 0; };
  for (const c of collection) {
    const rows: CollectionSlot[][] = [];
    for (let i = 0; i < c.slots.length; i += COLS) rows.push(c.slots.slice(i, i + COLS));
    let chunk: StampChunk | null = null;
    for (const row of rows) {
      if (!chunk) {
        if (used + HEAD_H + ROW_H > STAMP_BUDGET) flush();
        chunk = { state: c.state, done: c.done, total: c.slots.length, cont: pages.some((p) => p.some((x) => x.state === c.state)), slots: [] };
        page.push(chunk);
        used += HEAD_H;
      } else if (used + ROW_H > STAMP_BUDGET) {
        flush();
        chunk = { state: c.state, done: c.done, total: c.slots.length, cont: true, slots: [] };
        page.push(chunk);
        used += HEAD_H;
      }
      chunk.slots.push(...row);
      used += ROW_H;
    }
    used += 12; // gap between states
  }
  flush();
  return pages;
}

const LOG_ROWS = 8;

// ─── Cover ─────────────────────────────────────────────────────────────────

function Cover({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="relative w-full h-full rounded-2xl flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#4a1019", boxShadow: "inset 0 0 0 1px rgba(201,162,77,0.3)" }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      aria-label="Open your Adventure Passport"
    >
      <svg viewBox="0 0 420 480" className="absolute w-[78%] pointer-events-none" style={{ opacity: 0.07 }} aria-hidden>
        <path d={INDIA_PATH} fill={GOLD} />
      </svg>
      <span className="absolute inset-3 rounded-xl pointer-events-none" style={{ border: "1px solid rgba(201,162,77,0.35)" }} />
      <span className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ border: `1.5px solid ${GOLD}` }}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
      </span>
      <span className="text-[11px] tracking-[0.35em] uppercase" style={{ color: "rgba(201,162,77,0.8)" }}>Trail to Tides</span>
      <span className="text-[30px] leading-[1.1] mt-2 text-center" style={{ fontFamily: "var(--font-display), Georgia, serif", color: "#f3e3bd" }}>Adventure<br />Passport</span>
      <span className="text-[13px] mt-4" style={{ color: "rgba(243,227,189,0.6)" }}>{name}</span>
      <span className="text-[12px] mt-8 px-4 py-1.5 rounded-full" style={{ color: "#f3e3bd", border: "1px solid rgba(201,162,77,0.5)" }}>Open passport</span>
    </motion.button>
  );
}

// ─── The passport ──────────────────────────────────────────────────────────

/** Your own passport, or with `publicUsername` someone's public one (read-only extras) */
export default function Passport({ publicUsername }: { publicUsername?: string }) {
  const [data, setData] = useState<PassportData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [open, setOpen] = useState(!!publicUsername);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [sharing, setSharing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [fit, setFit] = useState({ width: PAGE_W, scale: 1 });
  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const onScreen = useRef(false);
  const dragged = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetch(publicUsername ? `/api/passport-data?u=${encodeURIComponent(publicUsername)}` : "/api/passport-data")
      .then((r) => { if (!r.ok) throw new Error("not ok"); return r.json(); })
      .then((d) => { if (!cancelled) { setData(d); setStatus("ready"); } })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [publicUsername, attempt]);

  // Size the book to its column. Narrower than a page: lay the pages out narrower (scaling
  // only below MIN_PAGE_W) and let the page scroll, so phone text stays readable. Room for a
  // full page: shrink the whole book (never below 72%) when the window is too short for it
  // and its controls.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const avail = el.clientWidth;
      if (avail < PAGE_W) {
        const width = Math.max(MIN_PAGE_W, avail);
        setFit({ width, scale: Math.min(1, avail / width) });
      } else {
        setFit({ width: PAGE_W, scale: Math.min(1, Math.max(0.72, (window.innerHeight - CHROME_H) / PAGE_H)) });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  const { width: pageW, scale } = fit;

  // Arrow keys only turn pages while the book is actually on screen
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { onScreen.current = e.isIntersecting; }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Trip pages are looked up by slug so stamps and logbook rows can jump to them
  const tripIndexRef = useRef(new Map<string, number>());

  const pages: Page[] = useMemo(() => {
    if (!data) return [];
    tripIndexRef.current.clear();
    const list: Page[] = [];
    const stateBySlug = new Map(data.stamps.map((s) => [s.slug, s.state]));
    const openTrip = (slug: string) => {
      const i = tripIndexRef.current.get(slug);
      if (i === undefined) return false;
      setDir(1);
      setIndex(i);
      return true;
    };
    list.push({ key: "id", section: "id", node: <IdPage data={data} /> });
    list.push({ key: "map", section: "map", node: <MapPage data={data} /> });
    const badgeParts = Math.ceil(ALL_BADGES.length / BADGES_PER_PAGE);
    for (let i = 0; i < badgeParts; i++) {
      const slice = ALL_BADGES.slice(i * BADGES_PER_PAGE, (i + 1) * BADGES_PER_PAGE);
      list.push({ key: `badges-${i}`, section: "badges", node: <BadgesPage data={data} badges={slice} part={i + 1} parts={badgeParts} /> });
    }
    data.logPages.forEach((entry) => {
      tripIndexRef.current.set(entry.slug, list.length);
      list.push({ key: `trip-${entry.slug}`, section: "trips", node: <TripPage entry={entry} state={stateBySlug.get(entry.slug) ?? ""} /> });
    });
    const logChunks = Math.max(1, Math.ceil(data.stamps.length / LOG_ROWS));
    for (let i = 0; i < logChunks; i++) {
      const rows = data.stamps.slice(i * LOG_ROWS, (i + 1) * LOG_ROWS);
      list.push({ key: `log-${i}`, section: "log", node: <LogPage rows={rows} from={i * LOG_ROWS} total={data.stamps.length} onOpenTrip={openTrip} /> });
    }
    paginateCollection(data.collection).forEach((chunks, i) => {
      list.push({ key: `stamps-${i}`, section: "stamps", node: <StampsPage chunks={chunks} totalDone={data.totalAdventures} totalAll={data.totalCollectable} onOpenTrip={openTrip} /> });
    });
    return list;
  }, [data]);

  const go = useCallback((next: number) => {
    if (next < 0 || next >= pages.length) return;
    setDir(next > index ? 1 : -1);
    setIndex(next);
  }, [index, pages.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!onScreen.current || (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName))) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, index]);

  const sections = (Object.keys(SECTION_LABEL) as Section[]).filter((s) => pages.some((p) => p.section === s));
  const current = pages[index];

  async function share() {
    const kind = current?.section === "map" ? "map" : "stats";
    setSharing(true);
    try {
      const res = await fetch(`/api/passport?page=${kind}`);
      if (!res.ok) { toast.error("Couldn't make the image. Try again in a moment."); return; }
      const blob = await res.blob();
      const file = new File([blob], `adventure-passport-${kind}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Adventure Passport" });
      } else {
        window.open(URL.createObjectURL(blob), "_blank");
        toast.success("Opened in a new tab. Save it to share.");
      }
    } catch {
      // A cancelled share sheet throws AbortError — nothing to say
    } finally {
      setSharing(false);
    }
  }

  const pill = "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors";

  return (
    <div ref={rootRef} className="pp flex flex-col items-center gap-4">
      <style>{`
        .pp { --pp-paper:#f5ecd6; --pp-ink:#241a12; --pp-muted:rgba(36,26,18,0.6); --pp-line:rgba(36,26,18,0.18); --pp-wash:rgba(36,26,18,0.05); }
        .dark .pp { --pp-paper:#221c16; --pp-ink:#efe5cf; --pp-muted:rgba(239,229,207,0.6); --pp-line:rgba(239,229,207,0.16); --pp-wash:rgba(239,229,207,0.06); }
        .dark .pp-stamp { filter: invert(1) hue-rotate(180deg); }
      `}</style>

      <div ref={shellRef} className="relative w-full" style={{ maxWidth: pageW * scale, height: PAGE_H * scale }}>
       <div className="absolute top-0 left-0" style={{ width: pageW, height: PAGE_H, transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: "top left" }}>
        {status === "loading" && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: "var(--bg-surface)" }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 px-8 text-center text-[14px]" style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
            Couldn&apos;t load the passport.
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="h-9 px-4 rounded-full text-[13px] font-semibold" style={{ color: "var(--accent-ink)", border: `1px solid ${ORANGE}` }}>
              Try again
            </button>
          </div>
        )}

        {status === "ready" && data && !open && <Cover name={data.name} onOpen={() => { setIndex(0); setOpen(true); }} />}

        {status === "ready" && data && open && current && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--pp-paper)" }}>
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={current.key}
                custom={dir}
                className="absolute inset-0 touch-pan-y"
                initial={{ x: dir * 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: dir * -60, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                // A swipe that ends over a stamp or logbook row mustn't also open it
                onPointerDown={() => { dragged.current = false; }}
                onDragStart={() => { dragged.current = true; }}
                onClickCapture={(e) => { if (dragged.current) { e.stopPropagation(); e.preventDefault(); dragged.current = false; } }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) go(index + 1);
                  else if (info.offset.x > 70) go(index - 1);
                }}
              >
                {current.node}
              </motion.div>
            </AnimatePresence>
            {!publicUsername && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close passport"
                className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "var(--pp-wash)", color: "var(--pp-muted)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
       </div>
      </div>

      {status === "ready" && data && open && (
        <>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous page" className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30" style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13px] tabular-nums w-14 text-center" style={{ color: "var(--text-secondary)" }}>{index + 1} / {pages.length}</span>
            <button type="button" onClick={() => go(index + 1)} disabled={index === pages.length - 1} aria-label="Next page" className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30" style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex flex-wrap justify-center gap-1.5" aria-label="Passport sections">
            {sections.map((s) => {
              const active = current?.section === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => go(pages.findIndex((p) => p.section === s))}
                  aria-current={active ? "page" : undefined}
                  className="h-8 px-3 rounded-full text-[13px] transition-colors"
                  style={active ? { background: ORANGE, color: "#fff" } : { border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                >
                  {SECTION_LABEL[s]}
                </button>
              );
            })}
          </nav>
        </>
      )}

      {/* Sharing belongs to the open book — the button says which image it makes */}
      {status === "ready" && data && open && !publicUsername && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <button type="button" onClick={share} disabled={sharing} className={`${pill} hover:bg-[#ff5100]/[0.06]`} style={{ color: "var(--accent-ink)", border: `1px solid ${ORANGE}` }}>
            {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
            {current?.section === "map" ? "Share the map" : "Share stats card"}
          </button>
          {data.username && <PublicLink username={data.username} />}
        </div>
      )}
    </div>
  );
}

// A link anyone can open (/passport/<username>), off until the owner turns it on
function PublicLink({ username }: { username: string }) {
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/account-prefs").then((r) => (r.ok ? r.json() : null)).then((p) => setOn(!!p?.passportPublic)).catch(() => setOn(false));
  }, []);
  const link = `${typeof window === "undefined" ? "" : window.location.origin}/passport/${encodeURIComponent(username)}`;

  async function toggle() {
    const next = !on;
    setOn(next);
    const res = await fetch("/api/account-prefs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passportPublic: next }) });
    if (!res.ok) { setOn(!next); toast.error("Couldn't change that. Try again."); return; }
    if (next) { try { await navigator.clipboard.writeText(link); } catch {} toast.success("Your passport is public. Link copied."); }
  }

  if (on === null) return null;
  // A real switch: its label names the setting, the knob shows whether it's on
  return (
    <div className="flex items-center gap-3">
      <button type="button" role="switch" aria-checked={on} onClick={toggle} className="inline-flex items-center gap-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
        <span className="relative w-9 h-5 rounded-full transition-colors" style={{ background: on ? ORANGE : "var(--border-default)" }}>
          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-[left] duration-200" style={{ left: on ? 18 : 2 }} />
        </span>
        Public link
      </button>
      {on && (
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(link); toast.success("Link copied."); } catch {} }} className="text-[13px] underline underline-offset-2" style={{ color: "var(--text-secondary)" }}>
          Copy link
        </button>
      )}
    </div>
  );
}
