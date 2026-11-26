import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** The share card for one Adventurepedia article: kicker, title and a line of summary */
export function guideOgImage({ kicker, title, summary }: { kicker: string; title: string; summary: string }) {
  const short = summary.length > 150 ? `${summary.slice(0, summary.lastIndexOf(" ", 147))}…` : summary;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "linear-gradient(135deg, #0d1117 0%, #1f1a14 55%, #0d1117 100%)", fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 70% at 85% 10%, rgba(255,81,0,0.22) 0%, transparent 70%)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#ff5100", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>ADVENTUREPEDIA · {kicker.toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: title.length > 48 ? 62 : 74, fontWeight: 800, color: "white", lineHeight: 1.08, letterSpacing: "-1.5px", maxWidth: 1000 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.68)", lineHeight: 1.45, maxWidth: 980 }}>{short}</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#ff8a4c", fontWeight: 600 }}>trailtotides.com</div>
      </div>
    ),
    OG_SIZE,
  );
}
