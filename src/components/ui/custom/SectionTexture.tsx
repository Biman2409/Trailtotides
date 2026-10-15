import { TIDES_FILL } from "./heroTextures";

// The hero's two textures — TRAIL's contour map and TIDES' wave lines — reused as quiet
// section backdrops. Each is a tinted fill masked by the line art, so one asset works in
// any colour and theme, and an outer radial mask fades it out toward the content.

const WAVES = TIDES_FILL.split(",url")[0]; // the bolder of the two wave tiles

type Props = {
  kind: "trail" | "tides";
  color: string;
  /** Where the texture pools: it fades out from here */
  at?: string;
  opacity?: number;
  /** Slow drift; off for sections that already move */
  drift?: boolean;
  className?: string;
};

export default function SectionTexture({ kind, color, at = "80% 30%", opacity = 0.14, drift = true, className = "" }: Props) {
  const mask = kind === "trail" ? "url(/hero/trail-contours.png)" : WAVES;
  const size = kind === "trail" ? "1500px auto" : "240px 180px";
  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        opacity,
        WebkitMaskImage: `radial-gradient(ellipse 70% 75% at ${at}, #000 0%, rgba(0,0,0,0.5) 45%, transparent 80%)`,
        maskImage: `radial-gradient(ellipse 70% 75% at ${at}, #000 0%, rgba(0,0,0,0.5) 45%, transparent 80%)`,
      }}
    >
      <div
        className={drift ? (kind === "trail" ? "st-drift-trail" : "st-drift-tides") : ""}
        style={{
          position: "absolute",
          inset: 0,
          background: color,
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: size,
          maskSize: size,
          WebkitMaskRepeat: "repeat",
          maskRepeat: "repeat",
        }}
      />
      <style>{`
        .st-drift-trail { animation: stTrail 90s linear infinite; }
        .st-drift-tides { animation: stTides 24s linear infinite; }
        @keyframes stTrail { to { -webkit-mask-position: -1500px 0; mask-position: -1500px 0; } }
        @keyframes stTides { to { -webkit-mask-position: 240px 0; mask-position: 240px 0; } }
        @media (prefers-reduced-motion: reduce) { .st-drift-trail, .st-drift-tides { animation: none; } }
      `}</style>
    </div>
  );
}
