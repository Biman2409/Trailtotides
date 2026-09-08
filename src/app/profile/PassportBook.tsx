"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Loader2, X, Compass } from "lucide-react";
import { toast } from "sonner";
import type { PassportData } from "@/lib/passportData";
import {
  INK, PAPER, GOLD, INDIA_PATH, DIFFICULTY_COLOR, DIFFICULTY_STAMP_SIZE, DIFFICULTY_LEVEL,
  RADAR_AXES, RADAR_AXIS_LABELS, RADAR_AXIS_SHORT, PASSPORT_MAP_W, PASSPORT_MAP_H,
  fmtDate, truncate, tint, ptsStr, polygonVertices, radarVertices, starVertices,
  mulberry32, sizeJitter, TypeIcon, StampOutline, BadgeIcon,
} from "@/lib/passportVisuals";
// PassportData is a type-only import — safe even though passportData.ts
// itself pulls in server-only Supabase clients (types are erased at build
// time and never reach the client bundle).

const MAP_W = PASSPORT_MAP_W, MAP_H = PASSPORT_MAP_H;
type PageKind = "stats" | "map";
// Both pages are designed at this fixed pixel size, then scaled to fit
// whatever the actual slot size is — see ScaledPage below.
const PAGE_REF_W = 400, PAGE_REF_H = 520;

// ─── Small hook: measures a container's rendered width so fixed-pixel
// content (built once at native size) can be scaled down/up to fit
// responsively, the same way a poster is photographed then resized. ───────
function useContainerScale(referenceWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setScale(w / referenceWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [referenceWidth]);
  return { ref, scale };
}

// Renders children at a fixed (refWidth x refHeight) pixel canvas, scaled to
// fill whatever size its parent actually is — guarantees the fixed-pixel
// page content (small font sizes, absolute stamp positions) never overflows
// or clips regardless of how wide the open spread ends up being rendered.
function ScaledPage({ refWidth, refHeight, children }: { refWidth: number; refHeight: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width && height) setScale(Math.min(width / refWidth, height / refHeight));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [refWidth, refHeight]);
  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden">
      <div style={{ width: refWidth, height: refHeight, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute" }}>
        {children}
      </div>
    </div>
  );
}

function ShareButton({ onClick, sharing }: { onClick: () => void; sharing: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={sharing}
      aria-label="Share this page"
      className="absolute bottom-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-60"
      style={{ background: "rgba(36,26,18,0.5)", color: "#f5ecd6" }}
    >
      {sharing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Share2 className="w-3 h-3" />}
    </button>
  );
}

function RadarChart({ ace, hasData, size = 180 }: { ace: Record<string, number>; hasData: boolean; size?: number }) {
  const cx = 100, cy = 100, maxR = 68, labelR = 90;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width="100%" height="100%" viewBox="0 0 200 200">
        {[1 / 3, 2 / 3, 1].map((f, i) => (
          <polygon key={i} points={ptsStr(polygonVertices(cx, cy, maxR * f, 8))} fill="none" stroke={INK} strokeWidth={1} opacity={0.12} />
        ))}
        {polygonVertices(cx, cy, maxR, 8).map(([x, y], i) => (
          <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={INK} strokeWidth={1} opacity={0.1} />
        ))}
        {hasData && (
          <polygon
            points={ptsStr(radarVertices(cx, cy, RADAR_AXES.map((ax) => ace[ax]), 5, maxR))}
            fill="rgba(255,81,0,0.18)" stroke="#ff5100" strokeWidth={2}
          />
        )}
      </svg>
      {polygonVertices(cx, cy, labelR, 8).map(([x, y], i) => (
        <div key={i} className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style={{ left: `${(x / 200) * 100}%`, top: `${(y / 200) * 100}%` }}>
          <span className="text-[9px] font-extrabold tracking-wide" style={{ color: INK, opacity: 0.55 }}>{RADAR_AXIS_SHORT[RADAR_AXES[i]]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Left page — bio, achievements, capability profile, badges ────────────
function StatsPage({ data, onShare, sharing }: { data: PassportData; onShare: () => void; sharing: boolean }) {
  const issueDate = new Date(data.issueDateISO);
  return (
    <div className="relative flex flex-col overflow-hidden" style={{ width: PAGE_REF_W, height: PAGE_REF_H, background: PAPER, padding: "18px 20px 14px" }}>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: "#ff5100" }}>
          <Compass className="w-3 h-3 text-white" />
        </div>
        <span className="text-[9px] font-extrabold tracking-[0.25em]" style={{ color: INK, opacity: 0.7 }}>TRAIL TO TIDES</span>
      </div>

      <div className="flex flex-row mt-2 flex-wrap gap-y-1">
        {[
          { label: "TYPE", value: "P" },
          { label: "CODE", value: "TTT" },
          { label: "PASSPORT NO.", value: data.passportNo },
          { label: "ISSUED", value: fmtDate(issueDate) },
        ].map((f, i, arr) => (
          <div key={f.label} className="flex flex-col pr-3 mr-3" style={{ borderRight: i < arr.length - 1 ? "1px dashed rgba(36,26,18,0.25)" : "none" }}>
            <span className="text-[7px] font-bold tracking-wider" style={{ color: INK, opacity: 0.45 }}>{f.label}</span>
            <span className="text-[10px] font-extrabold mt-0.5" style={{ color: INK }}>{f.value}</span>
          </div>
        ))}
      </div>

      <span className="mt-2 text-base font-extrabold tracking-wide" style={{ color: INK }}>ADVENTURE PASSPORT</span>

      <div className="flex flex-row gap-3 mt-2">
        <div className="w-14 h-16 flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "#e9dfc3", border: `2px solid ${INK}`, borderRadius: 4 }}>
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.avatarUrl} className="w-full h-full object-cover" alt="" />
          ) : (
            <div style={{ opacity: 0.25 }}><TypeIcon type="Mountaineering" size={24} color={INK} /></div>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0 justify-center gap-1">
          <div className="flex flex-col pb-0.5" style={{ borderBottom: "1px dashed rgba(36,26,18,0.22)" }}>
            <span className="text-[7px] font-bold tracking-wider" style={{ color: INK, opacity: 0.45 }}>NAME / NOM</span>
            <span className="text-[11px] font-bold mt-0.5 truncate" style={{ color: INK }}>{data.name}</span>
          </div>
          <div className="flex flex-col pb-0.5" style={{ borderBottom: "1px dashed rgba(36,26,18,0.22)" }}>
            <span className="text-[7px] font-bold tracking-wider" style={{ color: INK, opacity: 0.45 }}>USERNAME</span>
            <span className="text-[11px] font-bold mt-0.5 truncate" style={{ color: INK }}>{data.username ? `@${data.username}` : "—"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-2">
        <span className="text-[8px] font-bold tracking-widest" style={{ color: INK, opacity: 0.5 }}>ACHIEVEMENTS</span>
        <div className="flex flex-row items-baseline gap-2 mt-0.5">
          <span className="text-xl font-extrabold" style={{ color: INK }}>{data.totalAdventures}</span>
          <span className="text-[9px] font-bold" style={{ color: INK, opacity: 0.5 }}>{`ADVENTURES · ${data.statesCount} STATE${data.statesCount === 1 ? "" : "S"}`}</span>
        </div>
      </div>

      {data.hardest ? (
        <div className="flex flex-row items-center rounded-lg gap-2 mt-1.5 px-2.5 py-1.5" style={{ background: "rgba(36,26,18,0.045)" }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: tint(DIFFICULTY_COLOR[data.hardest.difficulty] ?? INK, 0.15), border: `1px solid ${tint(DIFFICULTY_COLOR[data.hardest.difficulty] ?? INK, 0.4)}` }}>
            <TypeIcon type={data.hardest.type} size={12} color={DIFFICULTY_COLOR[data.hardest.difficulty] ?? INK} />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[10px] font-bold truncate" style={{ color: INK }}>{truncate(data.hardest.name, 26)}</span>
            <span className="text-[7px]" style={{ color: INK, opacity: 0.45 }}>Toughest completed</span>
          </div>
          <div className="px-1.5 py-0.5 rounded-full shrink-0" style={{ background: tint(DIFFICULTY_COLOR[data.hardest.difficulty] ?? INK, 0.14), border: `1px solid ${DIFFICULTY_COLOR[data.hardest.difficulty] ?? INK}` }}>
            <span className="text-[7px] font-extrabold" style={{ color: DIFFICULTY_COLOR[data.hardest.difficulty] ?? INK }}>{data.hardest.difficulty.toUpperCase()}</span>
          </div>
        </div>
      ) : (
        <span className="text-[9px] mt-1.5" style={{ color: INK, opacity: 0.4 }}>Mark your first adventure done to start earning achievements</span>
      )}

      <div className="mt-2" style={{ borderBottom: "1px dashed rgba(36,26,18,0.3)" }} />

      <div className="flex flex-row items-center gap-2.5 mt-2">
        <RadarChart ace={data.userAce} hasData={data.hasAceData} size={88} />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-row items-center justify-between gap-1.5">
            <span className="text-[8px] font-bold tracking-wider" style={{ color: INK, opacity: 0.5 }}>CAPABILITY</span>
            {data.aceRank && (
              <div className="flex flex-row items-center gap-1 px-1.5 py-0.5 rounded-full shrink-0" style={{ background: tint(data.aceRank.color, 0.16), border: `1px solid ${data.aceRank.color}` }}>
                <svg width={7} height={7} viewBox="0 0 10 10"><polygon points={ptsStr(starVertices(5, 5, 5, 2.1, 5))} fill={data.aceRank.color} /></svg>
                <span className="text-[6.5px] font-extrabold" style={{ color: data.aceRank.color }}>{data.aceRank.label.toUpperCase()}</span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 leading-snug" style={{ color: INK }}>
            {data.hasAceData ? `Strongest in ${RADAR_AXIS_LABELS[data.topAxis]}` : "Take the ACE assessment to build your profile"}
          </span>
        </div>
      </div>

      <div className="flex flex-col mt-2">
        <span className="text-[8px] font-bold tracking-wider" style={{ color: INK, opacity: 0.5 }}>{`BADGES${data.totalBadges ? ` · ${data.totalBadges}` : ""}`}</span>
        {data.badges.length > 0 ? (
          <div className="flex flex-row flex-wrap gap-x-3 gap-y-1 mt-1">
            {data.badges.map((b) => (
              <div key={b.id} className="flex flex-row items-center gap-1.5">
                <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 16, height: 16, background: tint(b.color, 0.15), border: `1.5px solid ${tint(b.color, 0.5)}` }}>
                  <BadgeIcon name={b.icon} size={8} color={b.color} />
                </div>
                <span className="text-[8px] font-bold" style={{ color: INK }}>{truncate(b.name, 20)}</span>
              </div>
            ))}
            {data.badgeOverflow > 0 && <span className="text-[8px] font-bold" style={{ color: INK, opacity: 0.4 }}>{`+${data.badgeOverflow} more`}</span>}
          </div>
        ) : (
          <span className="text-[9px] mt-1" style={{ color: INK, opacity: 0.4 }}>Complete adventures to start unlocking badges</span>
        )}
      </div>

      <div className="flex-1 min-h-1.5" />

      <div className="flex flex-row items-center justify-between">
        <span className="text-[7px]" style={{ color: INK, opacity: 0.4 }}>Issued electronically · trailtotides.com</span>
        <div className="flex flex-col items-center justify-center px-2 py-1 rounded shrink-0" style={{ background: INK, border: `1.5px solid ${GOLD}`, transform: "rotate(-4deg)" }}>
          <span className="text-[7px] font-extrabold tracking-wider" style={{ color: GOLD }}>TTT</span>
        </div>
      </div>

      <ShareButton onClick={onShare} sharing={sharing} />
    </div>
  );
}

// ─── Right page — the map, stamped wherever the explorer has been ─────────
function MapPage({ data, onShare, sharing }: { data: PassportData; onShare: () => void; sharing: boolean }) {
  const { ref, scale } = useContainerScale(MAP_W);
  return (
    <div className="relative flex flex-col items-center overflow-hidden" style={{ width: PAGE_REF_W, height: PAGE_REF_H, background: PAPER, padding: "18px 16px 14px" }}>
      <div className="flex flex-col items-center shrink-0">
        <span className="text-[9px] font-bold tracking-[0.2em]" style={{ color: INK, opacity: 0.5 }}>VISAS & ENDORSEMENTS</span>
        <div className="w-16 h-px mt-1.5" style={{ background: "rgba(36,26,18,0.25)" }} />
      </div>

      {data.stamps.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center px-6 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ border: "2px dashed rgba(36,26,18,0.3)" }}>
              <div style={{ opacity: 0.25 }}><TypeIcon type="Trekking" size={34} color={INK} /></div>
            </div>
            <span className="text-sm font-bold mt-3" style={{ color: INK, opacity: 0.5 }}>Your first stamp awaits</span>
            <span className="text-[11px] mt-1" style={{ color: INK, opacity: 0.35 }}>Mark an adventure done to fill this page</span>
          </div>
        </div>
      ) : (
        <div ref={ref} className="w-full mt-2" style={{ aspectRatio: `${MAP_W} / ${MAP_H}`, position: "relative", overflow: "hidden" }}>
          <div style={{ width: MAP_W, height: MAP_H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute" }}>
            <svg width={MAP_W} height={MAP_H} viewBox="0 0 420 480" style={{ position: "absolute", top: 0, left: 0 }}>
              <path d={INDIA_PATH} fill={tint(INK, 0.04)} stroke={tint(INK, 0.32)} strokeWidth={1.6} />
            </svg>
            {data.stamps.map((s) => {
              const color = DIFFICULTY_COLOR[s.difficulty] ?? INK;
              const size = (DIFFICULTY_STAMP_SIZE[s.difficulty] ?? 100) * s.stampScale * sizeJitter(s.seed);
              const rot = (mulberry32(s.seed * 7 + 3)() - 0.5) * 20;
              const detailed = size >= 110;
              return (
                <div
                  key={s.slug}
                  className="absolute flex items-center justify-center"
                  style={{ left: `${s.dispX}%`, top: `${s.dispY}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, transform: `rotate(${rot}deg)` }}
                >
                  <StampOutline seed={s.seed} domain={s.domain} size={size} color={color} tier={DIFFICULTY_LEVEL[s.difficulty] ?? 1} />
                  <div className="flex flex-col items-center p-1.5 relative z-10">
                    <TypeIcon type={s.type} size={detailed ? 22 : 15} color={color} />
                    {detailed && <span className="text-xs font-extrabold mt-1 text-center leading-tight" style={{ color }}>{truncate(s.name, 18)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center shrink-0 mt-1">
        {data.stampOverflow > 0 && (
          <span className="text-[10px] font-bold" style={{ color: INK, opacity: 0.45 }}>{`+ ${data.stampOverflow} more journey${data.stampOverflow === 1 ? "" : "s"}`}</span>
        )}
        <span className="text-[10px]" style={{ color: INK, opacity: 0.35 }}>trailtotides.com</span>
      </div>

      <ShareButton onClick={onShare} sharing={sharing} />
    </div>
  );
}

// ─── Closed cover — a real book, portrait, waiting to be opened ───────────
function Cover({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.button
      onClick={onOpen}
      className="absolute inset-0 w-full h-full rounded-2xl flex flex-col items-center justify-center overflow-visible cursor-pointer z-10"
      style={{
        background: "radial-gradient(ellipse 90% 70% at 50% 15%, #7a1a26 0%, #4a0d16 55%, #2c0a10 100%)",
        transformStyle: "preserve-3d", transformOrigin: "0% 50%",
        boxShadow: "0 30px 70px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(201,162,77,0.25)",
      }}
      initial={false}
      whileHover={{ scale: 1.015, rotate: -0.6 }}
      whileTap={{ scale: 0.98 }}
      exit={{ rotateY: -115, opacity: 0, transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } }}
    >
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.35)" }} />

      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(201,162,77,0.14)", border: `1.5px solid ${GOLD}` }}>
        <Compass className="w-7 h-7" style={{ color: GOLD }} />
      </div>
      <span className="text-[11px] font-extrabold tracking-[0.35em]" style={{ color: "rgba(245,236,214,0.55)" }}>TRAIL TO TIDES</span>
      <span className="text-2xl font-extrabold tracking-[0.15em] mt-2 text-center px-4" style={{ color: "#f5ecd6" }}>ADVENTURE<br />PASSPORT</span>

      <motion.span
        className="text-[10px] font-bold tracking-[0.2em] mt-8 px-4 py-2 rounded-full"
        style={{ color: "rgba(245,236,214,0.75)", border: "1px solid rgba(245,236,214,0.25)" }}
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        TAP TO OPEN
      </motion.span>
    </motion.button>
  );
}

// ─── Open spread — both pages side by side, like a real open passport ─────
function OpenSpread({ data, onClose, onShare, sharingKind }: {
  data: PassportData; onClose: () => void; onShare: (kind: PageKind) => void; sharingKind: PageKind | null;
}) {
  return (
    <motion.div
      className="absolute inset-0 rounded-2xl overflow-hidden flex flex-row"
      style={{ boxShadow: "0 30px 70px rgba(0,0,0,0.5)", background: "#180509" }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] } }}
    >
      <button
        onClick={onClose}
        className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
        style={{ background: "rgba(36,26,18,0.5)", color: "#f5ecd6" }}
        aria-label="Close passport"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex-1 h-full min-w-0">
        <ScaledPage refWidth={PAGE_REF_W} refHeight={PAGE_REF_H}>
          <StatsPage data={data} onShare={() => onShare("stats")} sharing={sharingKind === "stats"} />
        </ScaledPage>
      </div>
      <div className="w-2 h-full shrink-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.28), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.28))" }} />
      <div className="flex-1 h-full min-w-0">
        <ScaledPage refWidth={PAGE_REF_W} refHeight={PAGE_REF_H}>
          <MapPage data={data} onShare={() => onShare("map")} sharing={sharingKind === "map"} />
        </ScaledPage>
      </div>
    </motion.div>
  );
}

export default function PassportBook() {
  const [data, setData] = useState<PassportData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [open, setOpen] = useState(false);
  const [sharingKind, setSharingKind] = useState<PageKind | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/passport-data")
      .then((r) => { if (!r.ok) throw new Error("not ok"); return r.json(); })
      .then((d) => { if (!cancelled) { setData(d); setStatus("ready"); } })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, []);

  async function handleShare(kind: PageKind) {
    setSharingKind(kind);
    try {
      const res = await fetch(`/api/passport?page=${kind}`);
      if (!res.ok) { toast.error("Couldn't generate your Adventure Passport — try again in a moment."); return; }
      const blob = await res.blob();
      const file = new File([blob], `adventure-passport-${kind}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Adventure Passport", text: "My adventures on Trail to Tides 🏔️" });
      } else {
        window.open(URL.createObjectURL(blob), "_blank");
        toast.success("Adventure Passport opened in a new tab — save it to share.");
      }
    } catch {
      // AbortError from a cancelled native share sheet is expected — no toast
    } finally {
      setSharingKind(null);
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden p-6 sm:p-10 flex flex-col items-center gap-5" style={{ border: "1px solid var(--border-subtle)", background: "linear-gradient(180deg, #2c0a10, #180509)" }}>
      <div
        className="relative w-full transition-[max-width,aspect-ratio] duration-700"
        style={{
          maxWidth: open ? 860 : 320,
          aspectRatio: open ? "1600 / 1040" : "700 / 900",
          perspective: 1800,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {status === "loading" && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.03)" }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 px-6 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
            <Compass className="w-6 h-6" style={{ color: "rgba(255,255,255,0.25)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Couldn&apos;t load your passport. Refresh to try again.</span>
          </div>
        )}

        {status === "ready" && data && (
          <>
            {/* Page-edge hint — a few offset sheets peeking out from behind the closed cover */}
            {!open && [10, 6, 3].map((offset, i) => (
              <div
                key={offset}
                className="absolute rounded-2xl pointer-events-none"
                style={{ inset: 0, left: offset, top: offset, background: PAPER, opacity: 0.16 - i * 0.03, zIndex: 0 }}
              />
            ))}

            <AnimatePresence>
              {!open && <Cover key="cover" onOpen={() => setOpen(true)} />}
            </AnimatePresence>

            {open && (
              <OpenSpread data={data} onClose={() => setOpen(false)} onShare={handleShare} sharingKind={sharingKind} />
            )}
          </>
        )}
      </div>

      <p className="text-xs text-center" style={{ color: "rgba(245,236,214,0.4)" }}>
        {open ? "Tap the share icon on either page to post it." : "Every completed adventure, stamped."}
      </p>
    </div>
  );
}
