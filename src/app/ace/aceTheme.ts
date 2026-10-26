// The colours AceRadar draws with, for light and dark mode, plus the radar's own motion.
// Put this in a <style> and wrap the radar in an element with class "ace": the /ace page and
// the capability section on each adventure page both do, so their charts look the same.

export const ACE_THEME_CSS = `
.ace {
  --ace-stamina:#c2410c; --ace-power:#a16207; --ace-strength:#4d7c0f; --ace-agility:#0e7490;
  --ace-water:#1d4ed8; --ace-altitude:#6d28d9; --ace-focus:#be123c; --ace-nerve:#047857;
  --ace-accent:#d94600; --ace-ink:#1c1814; --ace-soft:#4f473f; --ace-faint:#776d62;
  --ace-line:rgba(28,24,20,0.11); --ace-grid:rgba(28,24,20,0.11); --ace-grid-strong:rgba(28,24,20,0.28);
  --ace-plate:rgba(255,255,255,0.7); --ace-plate-solid:#ffffff;
  --ace-panel:#ffffff; --ace-panel-2:#f4efe6;
  --ace-you:#2563eb; --ace-you-fill:rgba(37,99,235,0.08);
  --ok:#15803d; --warn:#d97706; --bad:#be123c;
  --lv-0:#8a8178; --lv-1:#15803d; --lv-2:#4d7c0f; --lv-3:#a16207; --lv-4:#c2410c; --lv-5:#b91c1c;
  --rk-1:#0e7490; --rk-2:#15803d; --rk-3:#b45309; --rk-4:#c2410c; --rk-5:#6d28d9;
  --ace-shadow:0 1px 2px rgba(28,22,16,0.06), 0 18px 40px -18px rgba(28,22,16,0.22);
}
.dark .ace {
  --ace-stamina:#fb923c; --ace-power:#facc15; --ace-strength:#a3e635; --ace-agility:#22d3ee;
  --ace-water:#60a5fa; --ace-altitude:#a78bfa; --ace-focus:#fb7185; --ace-nerve:#34d399;
  --ace-accent:#ff6a1f; --ace-ink:#f5efe8; --ace-soft:rgba(245,239,232,0.74); --ace-faint:rgba(245,239,232,0.52);
  --ace-line:rgba(255,255,255,0.1); --ace-grid:rgba(255,255,255,0.09); --ace-grid-strong:rgba(255,255,255,0.24);
  --ace-plate:rgba(255,255,255,0.025); --ace-plate-solid:#17120f;
  --ace-panel:rgba(255,214,170,0.045); --ace-panel-2:rgba(255,214,170,0.07);
  --ace-you:#7cb2ff; --ace-you-fill:rgba(124,178,255,0.08);
  --ok:#4ade80; --warn:#fbbf24; --bad:#fb7185;
  --lv-0:#8b8f98; --lv-1:#22c55e; --lv-2:#84cc16; --lv-3:#eab308; --lv-4:#f97316; --lv-5:#ef4444;
  --rk-1:#22d3ee; --rk-2:#4ade80; --rk-3:#f59e0b; --rk-4:#f97316; --rk-5:#a78bfa;
  --ace-shadow:0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 48px -24px rgba(0,0,0,0.7);
}
.ace-sweep { animation: aceSpin 6s linear infinite; transform-box: view-box; }
.ace-ping { transform-box: fill-box; transform-origin: center; animation: acePing 2.8s ease-out infinite; opacity: 0; }
@keyframes aceSpin { to { transform: rotate(360deg); } }
@keyframes acePing { 0% { transform: scale(1); opacity: 0.55; } 70%, 100% { transform: scale(3.2); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .ace-sweep, .ace-ping { animation: none; }
  .ace-sweep { display: none; }
}
`;

/** Verdict colours, matching the ACE page */
export const BUCKET_VAR = { ready: "var(--ok)", stretch: "var(--warn)", "not-yet": "var(--bad)" } as const;

export const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;
