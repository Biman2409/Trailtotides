// Shared avatar data — 10 illustrated adventure characters (6 male / 4 female)
// Each SVG is a 64×64 face portrait, dark-themed to match Trail to Tides aesthetic.

export const LS_KEY = "ttt_avatar_id";

export interface AvatarDef {
  id: number;
  label: string;
  gender: "m" | "f";
  svg: React.ReactNode;
}

// ─── Shared palette ───────────────────────────────────────────────────────────
// Skin tones cycle across characters for diversity
const SKINS = ["#f5c5a3", "#e8a87c", "#c68642", "#8d5524", "#f0d0b0", "#d4956a"];
const HAIR  = ["#1a0a00", "#2c1a0e", "#4a2c12", "#8b6914", "#e8c84a", "#d4d0c8"];

// ─── Male characters (6) ──────────────────────────────────────────────────────

function MaleClimber({ skin = SKINS[0], hair = HAIR[0] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0f0a04"/>
      {/* Helmet */}
      <ellipse cx="32" cy="20" rx="14" ry="12" fill="#ff5100"/>
      <rect x="18" y="24" width="28" height="5" rx="2" fill="#cc4000"/>
      {/* Face */}
      <ellipse cx="32" cy="34" rx="11" ry="13" fill={skin}/>
      {/* Eyes */}
      <ellipse cx="27.5" cy="31" rx="2.2" ry="2.4" fill="white"/>
      <ellipse cx="36.5" cy="31" rx="2.2" ry="2.4" fill="white"/>
      <circle cx="27.8" cy="31.4" r="1.4" fill="#2d1a00"/>
      <circle cx="36.8" cy="31.4" r="1.4" fill="#2d1a00"/>
      <circle cx="28.3" cy="30.8" r="0.5" fill="white"/>
      <circle cx="37.3" cy="30.8" r="0.5" fill="white"/>
      {/* Brow */}
      <path d="M25 28.5 Q27.5 27.5 30 28.5" stroke="#5a3a1a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M34 28.5 Q36.5 27.5 39 28.5" stroke="#5a3a1a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* Nose */}
      <path d="M31 33 Q32 35 33 33" stroke={skin === SKINS[0] ? "#c8956a" : "#7a4a22"} strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Mouth — slight smile */}
      <path d="M28.5 38 Q32 40.5 35.5 38" stroke="#a0603a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* Strap */}
      <path d="M21 29 Q19 34 20 38" stroke="#cc4000" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M43 29 Q45 34 44 38" stroke="#cc4000" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Jacket collar */}
      <path d="M21 46 Q24 42 32 44 Q40 42 43 46" fill="#1a3a5c"/>
      <rect x="20" y="46" width="24" height="18" rx="4" fill="#1a3a5c"/>
    </svg>
  );
}

function MaleTrekker({ skin = SKINS[1], hair = HAIR[1] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#071a10"/>
      {/* Hair / cap */}
      <ellipse cx="32" cy="19" rx="13" ry="11" fill={hair}/>
      <rect x="18" y="24" width="28" height="4" rx="1.5" fill={hair}/>
      <rect x="22" y="27" width="6" height="3" rx="1" fill={hair}/>
      {/* Face */}
      <ellipse cx="32" cy="34" rx="11.5" ry="13" fill={skin}/>
      {/* Beard stubble line */}
      <ellipse cx="32" cy="42" rx="8" ry="4" fill={skin} opacity="0.7"/>
      <path d="M24 40 Q28 43 32 43 Q36 43 40 40" fill="#c09070" opacity="0.2"/>
      {/* Eyes */}
      <ellipse cx="27.5" cy="31.5" rx="2.2" ry="2.2" fill="white"/>
      <ellipse cx="36.5" cy="31.5" rx="2.2" ry="2.2" fill="white"/>
      <circle cx="27.8" cy="31.8" r="1.3" fill="#1a3a1a"/>
      <circle cx="36.8" cy="31.8" r="1.3" fill="#1a3a1a"/>
      <circle cx="28.3" cy="31.3" r="0.4" fill="white"/>
      <circle cx="37.3" cy="31.3" r="0.4" fill="white"/>
      {/* Brow — thicker */}
      <path d="M25 28.5 Q27.5 27 30 28" stroke={hair} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M34 28 Q36.5 27 39 28.5" stroke={hair} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Nose */}
      <path d="M30.5 33 Q32 35.5 33.5 33" stroke="#a06040" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M28.5 38.5 Q32 41 35.5 38.5" stroke="#8b4a2a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* Jacket */}
      <path d="M21 46 Q24 43 32 44.5 Q40 43 43 46" fill="#2d5a3a"/>
      <rect x="20" y="46" width="24" height="18" rx="4" fill="#2d5a3a"/>
      <line x1="32" y1="44" x2="32" y2="64" stroke="#1a3a22" strokeWidth="1.5"/>
    </svg>
  );
}

function MaleSurfer({ skin = SKINS[2], hair = HAIR[4] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#03111e"/>
      {/* Tousled hair */}
      <ellipse cx="32" cy="18" rx="14" ry="11" fill={hair}/>
      <path d="M18 22 Q16 16 22 14 Q20 20 22 22" fill={hair}/>
      <path d="M46 22 Q48 16 42 13 Q44 20 42 22" fill={hair}/>
      <path d="M26 13 Q32 8 38 13 Q36 10 32 9 Q28 10 26 13" fill={hair}/>
      {/* Face — slightly tanned */}
      <ellipse cx="32" cy="34" rx="11" ry="13" fill={skin}/>
      {/* Eyes */}
      <ellipse cx="27.5" cy="31" rx="2.3" ry="2.3" fill="white"/>
      <ellipse cx="36.5" cy="31" rx="2.3" ry="2.3" fill="white"/>
      <circle cx="27.7" cy="31.3" r="1.4" fill="#1a4a6a"/>
      <circle cx="36.7" cy="31.3" r="1.4" fill="#1a4a6a"/>
      <circle cx="28.2" cy="30.8" r="0.5" fill="white"/>
      <circle cx="37.2" cy="30.8" r="0.5" fill="white"/>
      {/* Brow relaxed */}
      <path d="M25 28.5 Q27.5 27.5 30 28.5" stroke="#6a4010" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M34 28.5 Q36.5 27.5 39 28.5" stroke="#6a4010" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      {/* Nose */}
      <path d="M31 33 Q32 35 33 33" stroke="#a07050" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      {/* Big grin */}
      <path d="M27.5 38 Q32 41.5 36.5 38" stroke="#8b4020" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M27.5 38 Q32 41.5 36.5 38" fill="none"/>
      {/* Rash vest */}
      <path d="M21 46 Q24 42 32 44 Q40 42 43 46" fill="#0ea5e9"/>
      <rect x="20" y="46" width="24" height="18" rx="4" fill="#0ea5e9"/>
      <path d="M29 46 Q32 44 35 46 L35 64 L29 64 Z" fill="#0284c7" opacity="0.5"/>
    </svg>
  );
}

function MaleExpedition({ skin = SKINS[3], hair = HAIR[0] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0a0a0a"/>
      {/* Balaclava / beanie */}
      <ellipse cx="32" cy="20" rx="14" ry="13" fill="#1a1a2e"/>
      <ellipse cx="32" cy="29" rx="13" ry="6" fill="#1a1a2e"/>
      {/* Face opening */}
      <ellipse cx="32" cy="32" rx="10" ry="11" fill={skin}/>
      {/* Eyes — intense */}
      <ellipse cx="27.5" cy="30" rx="2.2" ry="2.3" fill="white"/>
      <ellipse cx="36.5" cy="30" rx="2.2" ry="2.3" fill="white"/>
      <circle cx="27.7" cy="30.3" r="1.4" fill="#0a0a1a"/>
      <circle cx="36.7" cy="30.3" r="1.4" fill="#0a0a1a"/>
      <circle cx="28.2" cy="29.8" r="0.5" fill="white"/>
      <circle cx="37.2" cy="29.8" r="0.5" fill="white"/>
      {/* Brow — determined */}
      <path d="M25 27 Q27.5 25.5 30 27" stroke="#2a1a0a" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <path d="M34 27 Q36.5 25.5 39 27" stroke="#2a1a0a" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      {/* Nose */}
      <path d="M30.5 32 Q32 34.5 33.5 32" stroke="#7a4a28" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Neutral mouth */}
      <path d="M29 37 Q32 38.5 35 37" stroke="#7a4a28" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      {/* Down jacket */}
      <path d="M22 43 Q24 40 32 41.5 Q40 40 42 43" fill="#2a2a2a"/>
      <rect x="21" y="43" width="22" height="21" rx="4" fill="#1a1a2e"/>
      {/* Jacket quilting lines */}
      <line x1="21" y1="50" x2="43" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <line x1="21" y1="57" x2="43" y2="57" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
    </svg>
  );
}

function MaleGuide({ skin = SKINS[4], hair = HAIR[2] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0e0808"/>
      {/* Hair — short neat */}
      <ellipse cx="32" cy="19" rx="13" ry="11" fill={hair}/>
      <path d="M19 24 Q19 18 25 16" stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M45 24 Q45 18 39 16" stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Face */}
      <ellipse cx="32" cy="34" rx="11.5" ry="13" fill={skin}/>
      {/* Laugh lines */}
      <path d="M21.5 36 Q20 38 21.5 40" stroke="#d4a080" strokeWidth="0.7" fill="none" opacity="0.5"/>
      <path d="M42.5 36 Q44 38 42.5 40" stroke="#d4a080" strokeWidth="0.7" fill="none" opacity="0.5"/>
      {/* Eyes — warm */}
      <ellipse cx="27.5" cy="31.5" rx="2.3" ry="2.2" fill="white"/>
      <ellipse cx="36.5" cy="31.5" rx="2.3" ry="2.2" fill="white"/>
      <circle cx="27.8" cy="31.8" r="1.4" fill="#3a2200"/>
      <circle cx="36.8" cy="31.8" r="1.4" fill="#3a2200"/>
      <circle cx="28.3" cy="31.2" r="0.5" fill="white"/>
      <circle cx="37.3" cy="31.2" r="0.5" fill="white"/>
      {/* Brow — raised friendly */}
      <path d="M25 28 Q27.5 26.5 30 28" stroke={hair} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M34 28 Q36.5 26.5 39 28" stroke={hair} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* Nose */}
      <ellipse cx="32" cy="34.5" rx="1.8" ry="1.2" fill="rgba(0,0,0,0.06)"/>
      <path d="M30 34 Q32 36.5 34 34" stroke="#b07040" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      {/* Big warm smile */}
      <path d="M27.5 38.5 Q32 42 36.5 38.5" stroke="#8b4020" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M27.5 38.5 Q32 42 36.5 38.5 Q34 39 30 39 Z" fill="#c05030" opacity="0.3"/>
      {/* Flannel shirt */}
      <path d="M21 46 Q24 43 32 44.5 Q40 43 43 46" fill="#8b1a1a"/>
      <rect x="20" y="46" width="24" height="18" rx="4" fill="#8b1a1a"/>
      <line x1="21" y1="52" x2="43" y2="52" stroke="#6a1010" strokeWidth="1" opacity="0.5"/>
      <line x1="32" y1="44" x2="32" y2="64" stroke="#6a1010" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  );
}

function MalePhotographer({ skin = SKINS[5], hair = HAIR[3] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0a0e14"/>
      {/* Beanie hat */}
      <ellipse cx="32" cy="17" rx="14" ry="10" fill="#374151"/>
      <rect x="18" y="22" width="28" height="5" rx="2.5" fill="#4b5563"/>
      <ellipse cx="32" cy="13" rx="5" ry="4" fill="#6b7280"/>
      {/* Hair sides */}
      <path d="M18 26 Q17 32 19 36" stroke="#4a3010" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M46 26 Q47 32 45 36" stroke="#4a3010" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Face */}
      <ellipse cx="32" cy="35" rx="11" ry="12.5" fill={skin}/>
      {/* Glasses */}
      <rect x="22" y="29" width="8" height="6" rx="3" fill="none" stroke="#6b7280" strokeWidth="1.2"/>
      <rect x="34" y="29" width="8" height="6" rx="3" fill="none" stroke="#6b7280" strokeWidth="1.2"/>
      <line x1="30" y1="32" x2="34" y2="32" stroke="#6b7280" strokeWidth="1.2"/>
      <line x1="22" y1="32" x2="19" y2="31" stroke="#6b7280" strokeWidth="1.1"/>
      <line x1="42" y1="32" x2="45" y2="31" stroke="#6b7280" strokeWidth="1.1"/>
      {/* Eyes behind glasses */}
      <circle cx="26" cy="32" r="1.3" fill="#1a3a1a"/>
      <circle cx="38" cy="32" r="1.3" fill="#1a3a1a"/>
      <circle cx="26.4" cy="31.5" r="0.4" fill="white"/>
      <circle cx="38.4" cy="31.5" r="0.4" fill="white"/>
      {/* Nose */}
      <path d="M31 35 Q32 37 33 35" stroke="#a07050" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      {/* Thoughtful mouth */}
      <path d="M29 39.5 Q32 41.5 35 39.5" stroke="#8b5030" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      {/* Dark technical jacket */}
      <path d="M21 47 Q24 44 32 45 Q40 44 43 47" fill="#111827"/>
      <rect x="20" y="47" width="24" height="17" rx="4" fill="#111827"/>
      <rect x="24" y="50" width="5" height="4" rx="1" fill="#374151"/>
    </svg>
  );
}

// ─── Female characters (4) ────────────────────────────────────────────────────

function FemaleAdventurer({ skin = SKINS[0], hair = HAIR[0] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#140a1e"/>
      {/* Ponytail hair */}
      <ellipse cx="32" cy="19" rx="13" ry="11" fill={hair}/>
      <path d="M44 22 Q50 28 48 38 Q46 44 44 42 Q46 36 44 30 Z" fill={hair}/>
      <path d="M44 22 Q48 26 46 32" stroke={hair} strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Hair sides */}
      <path d="M19 24 Q18 30 20 36" stroke={hair} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      {/* Face — slightly narrower */}
      <ellipse cx="32" cy="34.5" rx="10.5" ry="13" fill={skin}/>
      {/* Eyes — larger */}
      <ellipse cx="27.5" cy="31.5" rx="2.5" ry="2.6" fill="white"/>
      <ellipse cx="36.5" cy="31.5" rx="2.5" ry="2.6" fill="white"/>
      <circle cx="27.7" cy="31.8" r="1.6" fill="#2a0a4a"/>
      <circle cx="36.7" cy="31.8" r="1.6" fill="#2a0a4a"/>
      <circle cx="28.2" cy="31.2" r="0.6" fill="white"/>
      <circle cx="37.2" cy="31.2" r="0.6" fill="white"/>
      {/* Lashes top */}
      <path d="M25.2 29.4 Q27.5 28.2 29.8 29.4" stroke="#1a0a2a" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M34.2 29.4 Q36.5 28.2 38.8 29.4" stroke="#1a0a2a" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      {/* Brow */}
      <path d="M25.5 28 Q27.5 26.8 29.5 28" stroke="#2a1a3a" strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M34.5 28 Q36.5 26.8 38.5 28" stroke="#2a1a3a" strokeWidth="1" strokeLinecap="round" fill="none"/>
      {/* Nose — delicate */}
      <path d="M31 34 Q32 36 33 34" stroke="#c09070" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      {/* Smile with lip colour */}
      <path d="M28.5 39 Q32 41.5 35.5 39" fill="#e05070" opacity="0.8"/>
      <path d="M28.5 39 Q32 41.5 35.5 39" stroke="#c03050" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
      {/* Adventure jacket */}
      <path d="M21.5 47 Q24 44 32 45 Q40 44 42.5 47" fill="#4a1a6a"/>
      <rect x="21" y="47" width="22" height="17" rx="4" fill="#4a1a6a"/>
    </svg>
  );
}

function FemaleScaler({ skin = SKINS[2], hair = HAIR[3] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#0a140a"/>
      {/* Braid / flowing hair */}
      <ellipse cx="32" cy="18" rx="13.5" ry="11" fill={hair}/>
      <path d="M18 26 Q14 36 16 48 Q18 52 20 50 Q18 40 20 32 Z" fill={hair}/>
      <path d="M46 26 Q50 36 48 48 Q46 52 44 50 Q46 40 44 32 Z" fill={hair}/>
      {/* Helmet */}
      <ellipse cx="32" cy="16" rx="14.5" ry="10" fill="#f59e0b" opacity="0.9"/>
      <rect x="17" y="21" width="30" height="5" rx="2" fill="#d97706"/>
      {/* Face */}
      <ellipse cx="32" cy="34.5" rx="10.5" ry="13" fill={skin}/>
      {/* Eyes */}
      <ellipse cx="27.5" cy="31" rx="2.4" ry="2.5" fill="white"/>
      <ellipse cx="36.5" cy="31" rx="2.4" ry="2.5" fill="white"/>
      <circle cx="27.8" cy="31.4" r="1.5" fill="#1a4a1a"/>
      <circle cx="36.8" cy="31.4" r="1.5" fill="#1a4a1a"/>
      <circle cx="28.3" cy="30.8" r="0.55" fill="white"/>
      <circle cx="37.3" cy="30.8" r="0.55" fill="white"/>
      {/* Lashes */}
      <path d="M25.2 29 Q27.5 27.8 29.8 29" stroke="#2a3a0a" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M34.2 29 Q36.5 27.8 38.8 29" stroke="#2a3a0a" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      {/* Brow */}
      <path d="M25.5 27.5 Q27.5 26.3 29.5 27.5" stroke="#3a2a0a" strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M34.5 27.5 Q36.5 26.3 38.5 27.5" stroke="#3a2a0a" strokeWidth="1" strokeLinecap="round" fill="none"/>
      {/* Strap */}
      <path d="M22 26 Q20 32 21 38" stroke="#d97706" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M42 26 Q44 32 43 38" stroke="#d97706" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Nose */}
      <path d="M31 33 Q32 35.5 33 33" stroke="#a07050" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      {/* Determined mouth */}
      <path d="M29 38.5 Q32 40.5 35 38.5" stroke="#c04060" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M29 38.5 Q32 40.5 35 38.5" fill="#e05070" opacity="0.5"/>
      {/* Technical top */}
      <path d="M21.5 47 Q24 44 32 45 Q40 44 42.5 47" fill="#15803d"/>
      <rect x="21" y="47" width="22" height="17" rx="4" fill="#15803d"/>
    </svg>
  );
}

function FemaleExplorer({ skin = SKINS[1], hair = HAIR[4] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#1a0e00"/>
      {/* Wide brim hat */}
      <ellipse cx="32" cy="16" rx="14" ry="9" fill="#92400e"/>
      <ellipse cx="32" cy="20" rx="20" ry="5" fill="#78350f"/>
      <ellipse cx="32" cy="18.5" rx="14" ry="6" fill="#92400e"/>
      {/* Hair flowing out */}
      <path d="M18 24 Q14 38 16 50 Q18 54 20 52 Q17 40 20 28 Z" fill={hair}/>
      <path d="M46 24 Q50 38 48 50 Q46 54 44 52 Q47 40 44 28 Z" fill={hair}/>
      {/* Face */}
      <ellipse cx="32" cy="35" rx="10.5" ry="13" fill={skin}/>
      {/* Eyes — adventurous squint */}
      <ellipse cx="27.5" cy="31.5" rx="2.4" ry="2.2" fill="white"/>
      <ellipse cx="36.5" cy="31.5" rx="2.4" ry="2.2" fill="white"/>
      <circle cx="27.8" cy="31.7" r="1.5" fill="#4a2a00"/>
      <circle cx="36.8" cy="31.7" r="1.5" fill="#4a2a00"/>
      <circle cx="28.3" cy="31.1" r="0.55" fill="white"/>
      <circle cx="37.3" cy="31.1" r="0.55" fill="white"/>
      {/* Lashes */}
      <path d="M25.3 29.4 Q27.5 28.2 29.7 29.4" stroke="#3a1a00" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M34.3 29.4 Q36.5 28.2 38.7 29.4" stroke="#3a1a00" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      {/* Brow */}
      <path d="M25.5 28 Q27.5 26.8 29.5 28" stroke="#5a3010" strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M34.5 28 Q36.5 26.8 38.5 28" stroke="#5a3010" strokeWidth="1" strokeLinecap="round" fill="none"/>
      {/* Freckles */}
      <circle cx="28.5" cy="34" r="0.6" fill="#c07040" opacity="0.4"/>
      <circle cx="35.5" cy="34" r="0.6" fill="#c07040" opacity="0.4"/>
      <circle cx="32" cy="33" r="0.5" fill="#c07040" opacity="0.3"/>
      {/* Nose */}
      <path d="M31 34.5 Q32 36.5 33 34.5" stroke="#a07050" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M28.5 39 Q32 42 35.5 39" fill="#d05060" opacity="0.7"/>
      <path d="M28.5 39 Q32 42 35.5 39" stroke="#c04050" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
      {/* Khaki shirt */}
      <path d="M21.5 47 Q24 44 32 45 Q40 44 42.5 47" fill="#92400e"/>
      <rect x="21" y="47" width="22" height="17" rx="4" fill="#78350f"/>
    </svg>
  );
}

function FemaleScientist({ skin = SKINS[5], hair = HAIR[1] }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#04101e"/>
      {/* Hair — bob cut */}
      <ellipse cx="32" cy="18" rx="13" ry="11" fill={hair}/>
      <path d="M19 24 Q17 36 19 44 Q20 46 22 45 Q20 38 20 28 Z" fill={hair}/>
      <path d="M45 24 Q47 36 45 44 Q44 46 42 45 Q44 38 44 28 Z" fill={hair}/>
      <rect x="19" y="38" width="26" height="6" rx="3" fill={hair}/>
      {/* Face */}
      <ellipse cx="32" cy="33.5" rx="11" ry="13" fill={skin}/>
      {/* Glasses — round */}
      <circle cx="27.5" cy="30.5" r="4" fill="none" stroke="#22d3ee" strokeWidth="1.1" opacity="0.8"/>
      <circle cx="36.5" cy="30.5" r="4" fill="none" stroke="#22d3ee" strokeWidth="1.1" opacity="0.8"/>
      <line x1="31.5" y1="30.5" x2="32.5" y2="30.5" stroke="#22d3ee" strokeWidth="1.1"/>
      <line x1="23.5" y1="30.5" x2="21" y2="29.5" stroke="#22d3ee" strokeWidth="1"/>
      <line x1="40.5" y1="30.5" x2="43" y2="29.5" stroke="#22d3ee" strokeWidth="1"/>
      {/* Eyes */}
      <circle cx="27.5" cy="30.5" r="1.5" fill="#1a3a5a"/>
      <circle cx="36.5" cy="30.5" r="1.5" fill="#1a3a5a"/>
      <circle cx="28" cy="30" r="0.5" fill="white"/>
      <circle cx="37" cy="30" r="0.5" fill="white"/>
      {/* Lashes */}
      <path d="M25.5 27.5 Q27.5 26.4 29.5 27.5" stroke="#1a0a2a" strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M34.5 27.5 Q36.5 26.4 38.5 27.5" stroke="#1a0a2a" strokeWidth="1" strokeLinecap="round" fill="none"/>
      {/* Nose */}
      <path d="M31 33.5 Q32 35.5 33 33.5" stroke="#a08060" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      {/* Gentle smile */}
      <path d="M29 38.5 Q32 40.5 35 38.5" stroke="#b04060" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M29 38.5 Q32 40.5 35 38.5" fill="#d05070" opacity="0.4"/>
      {/* Lab / field jacket */}
      <path d="M21.5 46 Q24 43 32 44 Q40 43 42.5 46" fill="#1e3a5a"/>
      <rect x="21" y="46" width="22" height="18" rx="4" fill="#1e3a5a"/>
      <rect x="24" y="50" width="4" height="5" rx="1" fill="#22d3ee" opacity="0.3"/>
    </svg>
  );
}

// ─── Export ordered list (6M → 4F) ───────────────────────────────────────────
export const AVATARS: AvatarDef[] = [
  { id: 1,  label: "Climber",     gender: "m", svg: <MaleClimber /> },
  { id: 2,  label: "Trekker",     gender: "m", svg: <MaleTrekker /> },
  { id: 3,  label: "Surfer",      gender: "m", svg: <MaleSurfer /> },
  { id: 4,  label: "Expedition",  gender: "m", svg: <MaleExpedition /> },
  { id: 5,  label: "Guide",       gender: "m", svg: <MaleGuide /> },
  { id: 6,  label: "Photographer",gender: "m", svg: <MalePhotographer /> },
  { id: 7,  label: "Adventurer",  gender: "f", svg: <FemaleAdventurer /> },
  { id: 8,  label: "Scaler",      gender: "f", svg: <FemaleScaler /> },
  { id: 9,  label: "Explorer",    gender: "f", svg: <FemaleExplorer /> },
  { id: 10, label: "Scientist",   gender: "f", svg: <FemaleScientist /> },
];
