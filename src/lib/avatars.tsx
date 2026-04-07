// Shared avatar data — 10 minimal flat-design adventure characters (6M / 4F)
// Geometric, bold, cool. Dark backgrounds with strong accent colors.

export const LS_KEY = "ttt_avatar_id";

export interface AvatarDef {
  id: number;
  label: string;
  gender: "m" | "f";
  accentColor: string;
  svg: React.ReactNode;
}

// ─── Design language ──────────────────────────────────────────────────────────
// Each character: dark bg, flat geometric face, bold single accent, minimal strokes.
// Face = simple oval + 2 dot eyes + minimal feature. Hair = solid flat shape.
// Clothing = 1-2 flat color blocks. No gradients, no noise, no detail.

// Male 1 — The Climber (burnt orange accent)
function M1() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0e0a08"/>
      {/* Helmet */}
      <path d="M18 30 Q18 14 32 14 Q46 14 46 30 L46 33 L18 33 Z" fill="#ff5100"/>
      <rect x="16" y="31" width="32" height="4" rx="2" fill="#cc3d00"/>
      {/* Face */}
      <rect x="20" y="33" width="24" height="20" rx="10" fill="#e8a87c"/>
      {/* Eyes */}
      <circle cx="26.5" cy="41" r="2.2" fill="#1a0800"/>
      <circle cx="37.5" cy="41" r="2.2" fill="#1a0800"/>
      <circle cx="27.3" cy="40.2" r="0.8" fill="white"/>
      <circle cx="38.3" cy="40.2" r="0.8" fill="white"/>
      {/* Mouth */}
      <path d="M27.5 47 Q32 50 36.5 47" stroke="#b8723a" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      {/* Chin strap */}
      <path d="M20 33 Q19 38 20 42" stroke="#cc3d00" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M44 33 Q45 38 44 42" stroke="#cc3d00" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// Male 2 — The Trekker (forest green accent)
function M2() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#070e09"/>
      {/* Hair block */}
      <path d="M18 27 Q18 12 32 12 Q46 12 46 27 L46 29 L18 29 Z" fill="#1c0f06"/>
      {/* Face */}
      <rect x="20" y="27" width="24" height="22" rx="10" fill="#c68642"/>
      {/* Beard bottom */}
      <path d="M20 42 Q20 49 32 49 Q44 49 44 42 Z" fill="#8a4a20"/>
      {/* Eyes */}
      <circle cx="26.5" cy="36" r="2.2" fill="#0e0800"/>
      <circle cx="37.5" cy="36" r="2.2" fill="#0e0800"/>
      <circle cx="27.3" cy="35.2" r="0.8" fill="white"/>
      <circle cx="38.3" cy="35.2" r="0.8" fill="white"/>
      {/* Brows — thick */}
      <rect x="24" y="32" width="7" height="2" rx="1" fill="#1c0f06"/>
      <rect x="33" y="32" width="7" height="2" rx="1" fill="#1c0f06"/>
    </svg>
  );
}

// Male 3 — The Surfer (sky blue accent)
function M3() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#030e18"/>
      {/* Tousled hair — 3 swoops */}
      <path d="M17 27 Q17 11 32 11 Q47 11 47 27 L45 27 Q45 15 32 15 Q19 15 19 27 Z" fill="#d4a030"/>
      <path d="M17 25 Q22 14 32 13" stroke="#d4a030" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M47 25 Q43 14 32 13" stroke="#c09020" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Face — tanned */}
      <rect x="19" y="25" width="26" height="22" rx="11" fill="#c47a3a"/>
      {/* Eyes */}
      <circle cx="26.5" cy="34" r="2.3" fill="#0a1f30"/>
      <circle cx="37.5" cy="34" r="2.3" fill="#0a1f30"/>
      <circle cx="27.4" cy="33.2" r="0.9" fill="white"/>
      <circle cx="38.4" cy="33.2" r="0.9" fill="white"/>
      {/* Wide grin */}
      <path d="M26 42 Q32 46 38 42" stroke="#8b4a20" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Rash guard collar */}
      <path d="M19 47 Q26 44 32 45 Q38 44 45 47" fill="#0ea5e9"/>
    </svg>
  );
}

// Male 4 — The Expedition (deep navy, cold skin)
function M4() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#070710"/>
      {/* Balaclava */}
      <rect x="16" y="12" width="32" height="36" rx="14" fill="#1e2a4a"/>
      {/* Face opening — rounded rect */}
      <rect x="21" y="24" width="22" height="18" rx="8" fill="#e8c4a0"/>
      {/* Eyes */}
      <circle cx="27" cy="32" r="2.4" fill="#0a0a1a"/>
      <circle cx="37" cy="32" r="2.4" fill="#0a0a1a"/>
      <circle cx="27.9" cy="31.1" r="0.9" fill="white"/>
      <circle cx="37.9" cy="31.1" r="0.9" fill="white"/>
      {/* Strong brows */}
      <rect x="24" y="27.5" width="6.5" height="2" rx="1" fill="#6a4020"/>
      <rect x="33.5" y="27.5" width="6.5" height="2" rx="1" fill="#6a4020"/>
      {/* Nose */}
      <circle cx="32" cy="35.5" rx="2" ry="1.2" fill="#cc9060" opacity="0.35"/>
      {/* Tight mouth */}
      <path d="M28.5 40 Q32 41.5 35.5 40" stroke="#a07050" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* Down jacket */}
      <path d="M16 48 Q21 44 32 45.5 Q43 44 48 48" fill="#1e2a4a"/>
    </svg>
  );
}

// Male 5 — The Guide (warm amber accent)
function M5() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#110800"/>
      {/* Hair — neat short */}
      <path d="M19 27 Q19 12 32 12 Q45 12 45 27 L43 27 Q43 16 32 16 Q21 16 21 27 Z" fill="#2c1a08"/>
      {/* Face */}
      <rect x="19" y="25" width="26" height="24" rx="11" fill="#d4956a"/>
      {/* Cheek lines — smile */}
      <path d="M21 37 Q20 40 21 43" stroke="#c07040" strokeWidth="1" fill="none" opacity="0.6"/>
      <path d="M43 37 Q44 40 43 43" stroke="#c07040" strokeWidth="1" fill="none" opacity="0.6"/>
      {/* Eyes — warm brown */}
      <circle cx="26.5" cy="34" r="2.5" fill="#2a1000"/>
      <circle cx="37.5" cy="34" r="2.5" fill="#2a1000"/>
      <circle cx="27.5" cy="33.1" r="0.9" fill="white"/>
      <circle cx="38.5" cy="33.1" r="0.9" fill="white"/>
      {/* Brows — relaxed */}
      <path d="M24 30.5 Q26.5 29.5 29 30.5" stroke="#2c1a08" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M35 30.5 Q37.5 29.5 40 30.5" stroke="#2c1a08" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      {/* Big smile */}
      <path d="M26 43 Q32 47 38 43" stroke="#8b3010" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Flannel collar */}
      <path d="M19 49 Q26 46 32 47 Q38 46 45 49" fill="#7c2020"/>
    </svg>
  );
}

// Male 6 — The Photographer (slate, glasses)
function M6() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#090c10"/>
      {/* Beanie */}
      <rect x="17" y="11" width="30" height="18" rx="10" fill="#374151"/>
      <rect x="16" y="24" width="32" height="6" rx="3" fill="#4b5563"/>
      <circle cx="32" cy="14" r="5" fill="#6b7280"/>
      {/* Hair sides */}
      <rect x="16" y="28" width="4" height="12" rx="2" fill="#1c0f06"/>
      <rect x="44" y="28" width="4" height="12" rx="2" fill="#1c0f06"/>
      {/* Face */}
      <rect x="19" y="27" width="26" height="22" rx="10" fill="#e0b888"/>
      {/* Glasses */}
      <rect x="21.5" y="33" width="9" height="7" rx="3.5" fill="none" stroke="#94a3b8" strokeWidth="1.3"/>
      <rect x="33.5" y="33" width="9" height="7" rx="3.5" fill="none" stroke="#94a3b8" strokeWidth="1.3"/>
      <line x1="30.5" y1="36.5" x2="33.5" y2="36.5" stroke="#94a3b8" strokeWidth="1.3"/>
      <line x1="21.5" y1="36.5" x2="19" y2="35.5" stroke="#94a3b8" strokeWidth="1.1"/>
      <line x1="42.5" y1="36.5" x2="45" y2="35.5" stroke="#94a3b8" strokeWidth="1.1"/>
      {/* Eyes */}
      <circle cx="26" cy="36.5" r="1.6" fill="#1a3060"/>
      <circle cx="38" cy="36.5" r="1.6" fill="#1a3060"/>
      <circle cx="26.6" cy="35.9" r="0.55" fill="white"/>
      <circle cx="38.6" cy="35.9" r="0.55" fill="white"/>
      {/* Mouth */}
      <path d="M28.5 44 Q32 46 35.5 44" stroke="#a07040" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// Female 1 — The Adventurer (violet accent, ponytail)
function F1() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0d0814"/>
      {/* Ponytail */}
      <path d="M43 24 Q52 30 50 42 Q48 48 46 46 Q48 40 46 32 Z" fill="#1c0f06"/>
      {/* Hair */}
      <path d="M18 28 Q18 12 32 12 Q46 12 46 28 L44 28 Q44 16 32 16 Q20 16 20 28 Z" fill="#1c0f06"/>
      {/* Hair sides flowing */}
      <rect x="17" y="27" width="4" height="18" rx="2" fill="#1c0f06"/>
      {/* Face */}
      <rect x="20" y="26" width="24" height="24" rx="11" fill="#f0c8a0"/>
      {/* Eyes — larger */}
      <circle cx="26.5" cy="35" r="2.6" fill="#2a0a4a"/>
      <circle cx="37.5" cy="35" r="2.6" fill="#2a0a4a"/>
      <circle cx="27.5" cy="34.1" r="1" fill="white"/>
      <circle cx="38.5" cy="34.1" r="1" fill="white"/>
      {/* Lashes — top line */}
      <path d="M24 32.4 Q26.5 31.2 29 32.4" stroke="#1a0a2a" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M35 32.4 Q37.5 31.2 40 32.4" stroke="#1a0a2a" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      {/* Brows */}
      <path d="M24.5 31 Q26.5 29.8 28.5 31" stroke="#2a1a3a" strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M35.5 31 Q37.5 29.8 39.5 31" stroke="#2a1a3a" strokeWidth="1" strokeLinecap="round" fill="none"/>
      {/* Lips */}
      <path d="M27.5 43 Q32 46 36.5 43" fill="#c84060" opacity="0.85"/>
      <path d="M27.5 43 Q32 46 36.5 43" stroke="#a82040" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      {/* Jacket */}
      <path d="M20 50 Q26 47 32 48 Q38 47 44 50" fill="#5b21b6"/>
    </svg>
  );
}

// Female 2 — The Scaler (amber helmet)
function F2() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#080e08"/>
      {/* Hair behind helmet */}
      <rect x="16" y="27" width="4" height="20" rx="2" fill="#8b6914"/>
      <rect x="44" y="27" width="4" height="20" rx="2" fill="#8b6914"/>
      {/* Helmet */}
      <path d="M17 29 Q17 13 32 13 Q47 13 47 29 L47 32 L17 32 Z" fill="#f59e0b"/>
      <rect x="15" y="30" width="34" height="5" rx="2.5" fill="#d97706"/>
      {/* Face */}
      <rect x="20" y="33" width="24" height="20" rx="10" fill="#d4956a"/>
      {/* Eyes */}
      <circle cx="26.5" cy="41.5" r="2.4" fill="#1a4a1a"/>
      <circle cx="37.5" cy="41.5" r="2.4" fill="#1a4a1a"/>
      <circle cx="27.4" cy="40.7" r="0.9" fill="white"/>
      <circle cx="38.4" cy="40.7" r="0.9" fill="white"/>
      {/* Lashes */}
      <path d="M24.2 39.2 Q26.5 38 28.8 39.2" stroke="#2a3a0a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M35.2 39.2 Q37.5 38 39.8 39.2" stroke="#2a3a0a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* Lips */}
      <path d="M27.5 48 Q32 51 36.5 48" fill="#c84060" opacity="0.8"/>
      {/* Chin strap */}
      <path d="M21 32 Q19 38 21 43" stroke="#d97706" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M43 32 Q45 38 43 43" stroke="#d97706" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// Female 3 — The Explorer (wide hat, freckles)
function F3() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#120900"/>
      {/* Hair flowing */}
      <rect x="15" y="28" width="4" height="22" rx="2" fill="#d4a030"/>
      <rect x="45" y="28" width="4" height="22" rx="2" fill="#d4a030"/>
      {/* Hat crown */}
      <path d="M19 27 Q19 13 32 13 Q45 13 45 27 L43 27 Q43 17 32 17 Q21 17 21 27 Z" fill="#92400e"/>
      {/* Hat brim */}
      <ellipse cx="32" cy="27" rx="21" ry="5" fill="#78350f"/>
      {/* Face */}
      <rect x="20" y="26" width="24" height="24" rx="11" fill="#c47a3a"/>
      {/* Eyes */}
      <circle cx="26.5" cy="35" r="2.4" fill="#3a1800"/>
      <circle cx="37.5" cy="35" r="2.4" fill="#3a1800"/>
      <circle cx="27.4" cy="34.2" r="0.9" fill="white"/>
      <circle cx="38.4" cy="34.2" r="0.9" fill="white"/>
      {/* Lashes */}
      <path d="M24.3 32.6 Q26.5 31.4 28.7 32.6" stroke="#3a1800" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M35.3 32.6 Q37.5 31.4 39.7 32.6" stroke="#3a1800" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* Freckles */}
      <circle cx="28" cy="37" r="0.8" fill="#8b4010" opacity="0.5"/>
      <circle cx="36" cy="37" r="0.8" fill="#8b4010" opacity="0.5"/>
      <circle cx="32" cy="36" r="0.6" fill="#8b4010" opacity="0.4"/>
      {/* Lips */}
      <path d="M27.5 43 Q32 46.5 36.5 43" fill="#d05060" opacity="0.85"/>
      {/* Shirt collar */}
      <path d="M20 50 Q26 47 32 48 Q38 47 44 50" fill="#92400e"/>
    </svg>
  );
}

// Female 4 — The Scientist (bob hair, teal glasses)
function F4() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#030e14"/>
      {/* Bob hair — solid block */}
      <path d="M17 27 Q17 11 32 11 Q47 11 47 27 L47 43 Q47 46 44 46 Q44 40 44 30 L20 30 Q20 40 20 46 Q17 46 17 43 Z" fill="#1c0f06"/>
      {/* Face */}
      <rect x="20" y="26" width="24" height="23" rx="10" fill="#e8c080"/>
      {/* Round glasses */}
      <circle cx="26.5" cy="35" r="4.2" fill="none" stroke="#22d3ee" strokeWidth="1.3" opacity="0.9"/>
      <circle cx="37.5" cy="35" r="4.2" fill="none" stroke="#22d3ee" strokeWidth="1.3" opacity="0.9"/>
      <line x1="30.7" y1="35" x2="33.3" y2="35" stroke="#22d3ee" strokeWidth="1.2"/>
      <line x1="22.3" y1="35" x2="20" y2="34" stroke="#22d3ee" strokeWidth="1.1"/>
      <line x1="41.7" y1="35" x2="44" y2="34" stroke="#22d3ee" strokeWidth="1.1"/>
      {/* Eyes */}
      <circle cx="26.5" cy="35" r="1.8" fill="#1a3a5a"/>
      <circle cx="37.5" cy="35" r="1.8" fill="#1a3a5a"/>
      <circle cx="27.2" cy="34.4" r="0.65" fill="white"/>
      <circle cx="38.2" cy="34.4" r="0.65" fill="white"/>
      {/* Lashes top */}
      <path d="M24 31.5 Q26.5 30.3 29 31.5" stroke="#1c0f06" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M35 31.5 Q37.5 30.3 40 31.5" stroke="#1c0f06" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      {/* Lips */}
      <path d="M28.5 44 Q32 46.5 35.5 44" fill="#c04070" opacity="0.8"/>
      {/* Lab jacket */}
      <path d="M20 49 Q26 46 32 47 Q38 46 44 49" fill="#1e3a5a"/>
    </svg>
  );
}

// ─── Export ordered list ──────────────────────────────────────────────────────
export const AVATARS: AvatarDef[] = [
  { id: 1,  label: "Climber",      gender: "m", accentColor: "#ff5100", svg: <M1 /> },
  { id: 2,  label: "Trekker",      gender: "m", accentColor: "#4ade80", svg: <M2 /> },
  { id: 3,  label: "Surfer",       gender: "m", accentColor: "#0ea5e9", svg: <M3 /> },
  { id: 4,  label: "Expedition",   gender: "m", accentColor: "#818cf8", svg: <M4 /> },
  { id: 5,  label: "Guide",        gender: "m", accentColor: "#f59e0b", svg: <M5 /> },
  { id: 6,  label: "Photographer", gender: "m", accentColor: "#94a3b8", svg: <M6 /> },
  { id: 7,  label: "Adventurer",   gender: "f", accentColor: "#a78bfa", svg: <F1 /> },
  { id: 8,  label: "Scaler",       gender: "f", accentColor: "#f59e0b", svg: <F2 /> },
  { id: 9,  label: "Explorer",     gender: "f", accentColor: "#fb923c", svg: <F3 /> },
  { id: 10, label: "Scientist",    gender: "f", accentColor: "#22d3ee", svg: <F4 /> },
];
