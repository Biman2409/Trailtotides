import {
  Trophy, Crown, Brain, Footprints, Waves, ScanEye, Timer, Dumbbell, MountainSnow, Wind, Shield,
  Zap, Pickaxe, CheckCircle2, Star, Heart, Compass, Award, Camera,
  BicepsFlexed, ChefHat, Clapperboard, Gauge,
  Backpack, Medal, Globe, Map, Route, Flag, Wrench, Flame, PenLine, Aperture, CloudRain, Snowflake, CircleHelp,
  Moon, Repeat, History, FastForward,
} from "@/lib/localIcons";
import type { Achievement } from "@/lib/achievements";

// One badge seal, wherever badges show. Every badge has its own icon (see achievements.ts),
// so they stay tellable apart in the one orange: pinnacle badges filled, the rest outlined,
// locked ones dashed and grey.

const ORANGE = "#ff5100";

const ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  Crown, Trophy, Brain, Footprints, Waves, ScanEye, Timer, Dumbbell, MountainSnow, Wind, Shield,
  Zap, Pickaxe, CheckCircle2, Star, Heart, Compass, Award, Camera,
  BicepsFlexed, ChefHat, Clapperboard, Gauge,
  Backpack, Medal, Globe, Map, Route, Flag, Wrench, Flame, PenLine, Aperture, CloudRain, Snowflake, Secret: CircleHelp,
  Moon, Repeat, History, FastForward,
};

/** Secret badges, once found, are inked in gold */
export const BADGE_GOLD = "#d4a843";

export default function BadgeIcon({ badge, earned = true, size = 40 }: { badge: Pick<Achievement, "icon" | "tier" | "secret">; earned?: boolean; size?: number }) {
  const Icon = ICONS[badge.icon] ?? Trophy;
  const apex = badge.tier === "tier1";
  const icon = Math.round(size * 0.46);
  const radius = Math.round(size * 0.3);

  // Pinnacle, earned: a round medal rather than a tile
  if (earned && apex) {
    return (
      <PinnacleMedal size={size}>
        <Icon style={{ width: Math.round(size * 0.4), height: Math.round(size * 0.4) }} />
      </PinnacleMedal>
    );
  }

  const ink = badge.secret ? BADGE_GOLD : ORANGE;
  return (
    <span
      className="relative shrink-0 flex items-center justify-center"
      style={{
        width: size, height: size,
        // Pinnacle badges are round even while locked, so the medal shape is recognisable
        borderRadius: apex ? "50%" : radius,
        background: earned && badge.secret ? `${BADGE_GOLD}1f` : "transparent",
        border: earned ? `1.5px solid ${ink}` : "1px dashed var(--border-default)",
        // A locked pinnacle badge keeps a second, outer ring — prestigious even before it's earned
        outline: !earned && apex ? "1px dashed var(--border-default)" : undefined,
        outlineOffset: 2,
        color: earned ? ink : "var(--text-muted)",
      }}
    >
      <Icon style={{ width: icon, height: icon }} />
    </span>
  );
}

/** The pinnacle look, shared by the Trophy Cabinet and the passport: an orange coin with a
 *  light bevel inside a thin gold ring, and a faint light sweep now and then. Quietly premium
 *  rather than loud. `gap` is the colour behind it, so the ring sits clear of the coin. */
export function PinnacleMedal({ size, gap = "var(--bg-card)", children }: { size: number; gap?: string; children: React.ReactNode }) {
  const ring = Math.max(1.5, size * 0.045);
  const inner = ring + Math.max(1.5, size * 0.04);
  return (
    <span className="relative shrink-0 inline-flex" style={{ width: size, height: size, filter: "drop-shadow(0 2px 6px rgba(255,106,26,0.22))" }}>
      <span className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(150deg, #f6dfa6 0%, #c99a45 45%, #8a6424 70%, #e8c47c 100%)" }} />
      <span className="absolute rounded-full" style={{ inset: ring, background: gap }} />
      <span
        className="absolute rounded-full overflow-hidden flex items-center justify-center"
        style={{
          inset: inner, color: "#fff",
          background: "radial-gradient(circle at 30% 25%, #ff9b5c 0%, #ff5f12 50%, #d64600 100%)",
          boxShadow: "inset 0 1px 1.5px rgba(255,255,255,0.45), inset 0 -2px 3px rgba(80,20,0,0.28)",
        }}
      >
        <span className="badge-shine" aria-hidden />
        <span className="relative flex">{children}</span>
      </span>
    </span>
  );
}
