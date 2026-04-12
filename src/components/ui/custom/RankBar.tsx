"use client";

/**
 * Shared rank progress bar used across Profile, Matchmaker, etc.
 * No box-shadow on fill. Track is overflow-hidden + relative.
 * Thumb is a sibling outside the track so it never gets clipped.
 */

const RANKS = [
  { label: "Uncharted",   color: "#6b7280", stars: 0, minScore: 0  },
  { label: "Pathfinder",  color: "#22d3ee", stars: 1, minScore: 8  },
  { label: "Navigator",   color: "#4ade80", stars: 2, minScore: 16 },
  { label: "Trailblazer", color: "#f59e0b", stars: 3, minScore: 24 },
  { label: "Vanguard",    color: "#f97316", stars: 4, minScore: 32 },
  { label: "Apex",        color: "#a78bfa", stars: 5, minScore: 40 },
];

export { RANKS };

interface Props {
  totalScore: number;
  /** Height of the track in px (default 10) */
  trackH?: number;
  /** Show rank labels below (default true) */
  showLabels?: boolean;
  /** Show "you" tag under current label (default false) */
  showYouTag?: boolean;
}

export default function RankBar({ totalScore, trackH = 10, showLabels = true, showYouTag = false }: Props) {
  const N = RANKS.length;
  const segW = 100 / (N - 1); // % per segment

  const rankIndex = totalScore >= 40 ? 5 : totalScore >= 32 ? 4 : totalScore >= 24 ? 3 : totalScore >= 16 ? 2 : totalScore >= 8 ? 1 : 0;
  const currentRank = RANKS[rankIndex];
  const nextRank = RANKS[rankIndex + 1] ?? null;

  const segProgress = nextRank
    ? Math.min(1, Math.max(0, (totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)))
    : 1;

  // barPct: position along full bar 0–100
  const barPct = nextRank === null ? 100 : rankIndex * segW + segProgress * segW;
  const thumbPct = Math.min(97, Math.max(3, barPct));

  const thumbSize = trackH + 4; // thumb slightly larger than track

  return (
    <div>
      {/* Wrapper: relative, padded top/bottom to give thumb room */}
      <div className="relative" style={{ paddingTop: thumbSize / 2, paddingBottom: thumbSize / 2 }}>

        {/* Track: relative + overflow-hidden → clips fill and ticks perfectly */}
        <div
          className="relative rounded-full overflow-hidden"
          style={{ height: trackH, background: "rgba(255,255,255,0.07)" }}
        >
          {/* Fill — no border-radius, no box-shadow */}
          <div
            className="absolute inset-y-0 left-0 transition-all duration-700"
            style={{
              width: `${Math.min(100, barPct)}%`,
              background: `linear-gradient(90deg, ${RANKS[1].color}bb, ${currentRank.color})`,
            }}
          />
          {/* Segment tick marks */}
          {RANKS.slice(1, -1).map((_, i) => (
            <div
              key={i}
              className="absolute inset-y-0 w-px"
              style={{ left: `${(i + 1) * segW}%`, background: "rgba(0,0,0,0.55)" }}
            />
          ))}
        </div>

        {/* Thumb — sibling of track, NOT inside overflow-hidden, floats above */}
        <div
          className="absolute rounded-full border-2 pointer-events-none transition-all duration-700"
          style={{
            width: thumbSize,
            height: thumbSize,
            top: "50%",
            left: `${thumbPct}%`,
            transform: "translate(-50%, -50%)",
            background: currentRank.color,
            borderColor: "#0a0e17",
          }}
        />
      </div>

      {/* Rank labels */}
      {showLabels && (
        <div className="flex mt-1">
          {RANKS.map((rank, i) => {
            const isCurrent = i === rankIndex;
            const isPast = i < rankIndex;
            return (
              <div
                key={rank.label}
                className="flex-1 flex flex-col gap-0.5"
                style={i === 0 ? { alignItems: "flex-start" } : i === N - 1 ? { alignItems: "flex-end" } : { alignItems: "center" }}
              >
                <span
                  className="text-[7.5px] font-semibold whitespace-nowrap leading-none"
                  style={{ color: isCurrent ? rank.color : isPast ? `${rank.color}55` : "rgba(255,255,255,0.16)" }}
                >
                  {rank.label}
                </span>
                {showYouTag && isCurrent && (
                  <span className="text-[6px] font-bold uppercase tracking-wide leading-none" style={{ color: `${rank.color}80` }}>you</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
