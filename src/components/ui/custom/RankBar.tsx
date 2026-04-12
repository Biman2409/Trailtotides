"use client";

export const RANKS = [
  { label: "Uncharted",   color: "#6b7280", stars: 0, minScore: 0  },
  { label: "Pathfinder",  color: "#22d3ee", stars: 1, minScore: 8  },
  { label: "Navigator",   color: "#4ade80", stars: 2, minScore: 16 },
  { label: "Trailblazer", color: "#f59e0b", stars: 3, minScore: 24 },
  { label: "Vanguard",    color: "#f97316", stars: 4, minScore: 32 },
  { label: "Apex",        color: "#a78bfa", stars: 5, minScore: 40 },
];

const N    = RANKS.length;
const SEGW = 100 / (N - 1); // 20% per segment
const THUMB = 14;            // thumb diameter px
const HALF  = THUMB / 2;     // 7px — margin used on each side

interface Props {
  totalScore: number;
  trackH?: number;
  showLabels?: boolean;
  showYouTag?: boolean;
}

export default function RankBar({
  totalScore,
  trackH = 10,
  showLabels = true,
  showYouTag = false,
}: Props) {
  const idx     = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const cur     = RANKS[idx];
  const next    = RANKS[idx + 1] ?? null;
  const seg     = next ? Math.min(1, Math.max(0, (totalScore - cur.minScore) / (next.minScore - cur.minScore))) : 1;
  // barPct: exact % position along full bar (0 = leftmost, 100 = rightmost)
  const barPct  = next ? idx * SEGW + seg * SEGW : 100;

  return (
    <div>
      {/*
       * Wrapper has margin-left/right = HALF so the track's 0% and 100%
       * edges each have HALF px of breathing room for the thumb to centre on.
       * The thumb's left:barPct% + translateX(-50%) then perfectly places it
       * at any value 0–100 without ever clipping or clamping.
       */}
      <div
        className="relative"
        style={{ height: trackH, marginLeft: HALF, marginRight: HALF }}
      >
        {/* ── Track: absolute inset-0, overflow-hidden clips fill + ticks ── */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          {/* Fill — no border-radius, no box-shadow */}
          <div
            className="absolute inset-y-0 left-0 transition-all duration-700"
            style={{
              width: `${barPct}%`,
              background: `linear-gradient(90deg, ${RANKS[1].color}cc, ${cur.color})`,
            }}
          />

          {/* Segment ticks — thin dark lines at each rank boundary */}
          {RANKS.slice(1, -1).map((_, i) => (
            <div
              key={i}
              className="absolute inset-y-0 w-px"
              style={{ left: `${(i + 1) * SEGW}%`, background: "rgba(0,0,0,0.5)" }}
            />
          ))}
        </div>

        {/* ── Segment node dots on top of track (reached ones glow) ── */}
        {RANKS.map((rank, i) => {
          const reached  = i <= idx;
          const isCur    = i === idx;
          const nodePct  = i * SEGW; // 0,20,40,60,80,100
          const nodeSize = isCur ? 8 : 6;
          return (
            <div
              key={rank.label}
              className="absolute rounded-full transition-all duration-500 pointer-events-none"
              style={{
                width:  nodeSize,
                height: nodeSize,
                top:    "50%",
                left:   `${nodePct}%`,
                transform: "translate(-50%, -50%)",
                background: reached ? rank.color : "rgba(255,255,255,0.12)",
                boxShadow: isCur ? `0 0 6px ${rank.color}` : "none",
                zIndex: 1,
              }}
            />
          );
        })}

        {/* ── Thumb ── sits above nodes, marks exact progress position ── */}
        <div
          className="absolute rounded-full border-2 pointer-events-none transition-all duration-700"
          style={{
            width:  THUMB,
            height: THUMB,
            top:    "50%",
            left:   `${barPct}%`,
            transform: "translate(-50%, -50%)",
            background: cur.color,
            borderColor: "#090d16",
            zIndex: 2,
          }}
        />
      </div>

      {/* ── Labels — absolutely positioned to align under each node ── */}
      {showLabels && (
        <div
          className="relative mt-2.5"
          style={{ marginLeft: HALF, marginRight: HALF, height: showYouTag ? 22 : 12 }}
        >
          {RANKS.map((rank, i) => {
            const isCur   = i === idx;
            const isPast  = i < idx;
            const nodePct = i * SEGW;
            return (
              <div
                key={rank.label}
                className="absolute flex flex-col items-center gap-0.5"
                style={{
                  // first label: left-align from left edge
                  // last label: right-align from right edge
                  // others: centre on tick position
                  ...(i === 0
                    ? { left: 0, alignItems: "flex-start" }
                    : i === N - 1
                    ? { right: 0, alignItems: "flex-end" }
                    : { left: `${nodePct}%`, transform: "translateX(-50%)", alignItems: "center" }),
                }}
              >
                <span
                  className="text-[7.5px] font-bold whitespace-nowrap leading-none tracking-wide"
                  style={{
                    color: isCur
                      ? rank.color
                      : isPast
                      ? `${rank.color}60`
                      : "rgba(255,255,255,0.18)",
                  }}
                >
                  {rank.label}
                </span>
                {showYouTag && isCur && (
                  <span
                    className="text-[6px] font-black uppercase tracking-widest leading-none"
                    style={{ color: `${rank.color}70` }}
                  >
                    you
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
