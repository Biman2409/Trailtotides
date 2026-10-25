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

  // Pinnacle, earned: a deep orange gradient, a double ring, a soft glow and a slow shine
  if (earned && apex) {
    return (
      <span
        className="relative shrink-0 flex items-center justify-center overflow-hidden"
        style={{
          width: size, height: size, borderRadius: radius, color: "#fff",
          background: "linear-gradient(140deg, #ffb070 0%, #ff6a1a 38%, #ff5100 55%, #b33a00 100%)",
          boxShadow: `0 0 0 2px var(--bg-card), 0 0 0 3.5px ${ORANGE}, 0 6px 20px rgba(255,81,0,0.35)`,
        }}
      >
        <span className="badge-shine" aria-hidden />
        <Icon style={{ width: icon, height: icon, position: "relative" }} />
      </span>
    );
  }

  const ink = badge.secret ? BADGE_GOLD : ORANGE;
  return (
    <span
      className="relative shrink-0 flex items-center justify-center"
      style={{
        width: size, height: size, borderRadius: radius,
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
