import type { ACE } from "./ace";
import type { MedicalFlags } from "./matchmakerQuestions";

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "ttt_matchmaker_profile";
const MEDICAL_STORAGE_KEY = "ttt_matchmaker_medical";
const CONSENT_STORAGE_KEY = "ttt_matchmaker_consent";

export interface StoredProfile {
  ace: ACE;
  /** ISO timestamp — always server-stamped on save, never trusted from a client clock. */
  updatedAt?: string;
  /** True if the altitude axis was capped due to a reported evacuation. */
  altitudeCapped?: boolean;
  rawAxes?: Record<string, number>;
  decayNotes?: string[];
  answers?: Record<string, unknown>; // the real answers given (never imputed ones) — used to refine a quick result
  /** "quick" = 5-question first pass with the rest estimated; "full" or absent = complete assessment. */
  mode?: "quick" | "full";
  // Legacy ERT field — kept so old profiles don't break
  ert?: { e: number; r: number; t: number };
}

function announceProfileChange() {
  // Let open components (cards, home rows, Compass) pick up the change without a reload
  try { window.dispatchEvent(new Event("ttt:profile-updated")); } catch {}
}

export function saveProfile(profile: StoredProfile): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
  announceProfileChange();
}

export function loadProfile(): StoredProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredProfile;
    // Migrate legacy ERT-only profiles
    if (!parsed.ace && parsed.ert) {
      const { e, r, t } = parsed.ert;
      parsed.ace = { stamina: e, power: Math.max(1, e - 1), strength: e, agility: t, water: 1, altitude: r, focus: t, nerve: t };
    }
    return parsed.ace ? parsed : null;
  } catch { return null; }
}

export function clearProfile(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  announceProfileChange();
}

// ─── Server sync helpers ───────────────────────────────────────────────────────

/** Save profile to Supabase (fire-and-forget, only for logged-in users) */
export async function saveProfileToServer(profile: StoredProfile): Promise<void> {
  try {
    await fetch("/api/ace-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
  } catch {}
}

/** Load profile from Supabase, falling back to localStorage.
 *  Bidirectional sync: if server has no profile but localStorage does, push it up. */
export async function loadProfileFromServer(): Promise<StoredProfile | null> {
  try {
    const res = await fetch("/api/ace-profile");
    if (!res.ok) return loadProfile();
    const { profile } = await res.json();
    if (profile?.ace) {
      // A result taken on this device while the save didn't reach the server (offline, or
      // signed out at the time) is newer than the account copy — keep it and push it up
      // instead of overwriting it. The server stamps saves a moment after the local clock,
      // so only a clearly newer local copy wins.
      const local = loadProfile();
      const localAt = local?.updatedAt ? Date.parse(local.updatedAt) : NaN;
      const serverAt = profile.updatedAt ? Date.parse(profile.updatedAt) : NaN;
      if (local?.ace && localAt - serverAt > 60_000) {
        saveProfileToServer(local); // fire-and-forget
        return local;
      }
      // Otherwise the account copy wins — sync it down, keeping local-only extras it lacks
      const merged: StoredProfile = { ...(local ?? {}), ...(profile as StoredProfile) };
      saveProfile(merged);
      return merged;
    }
    // Server has no data — if localStorage has data, push it up
    const local = loadProfile();
    if (local?.ace) {
      saveProfileToServer(local); // fire-and-forget
    }
    return local;
  } catch {}
  return loadProfile();
}

// ─── Staleness ────────────────────────────────────────────────────────────────

/** Missing/null timestamp (old-shape profiles, edge cases) is treated as maximally stale. */
export function isProfileStale(updatedAt: string | null | undefined, thresholdDays = 90): boolean {
  if (!updatedAt) return true;
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  return ageMs > thresholdDays * 86_400_000;
}

// ─── Medical flags — localStorage ──────────────────────────────────────────────
// Medical flags live only on the server now (nothing read the browser copy).
// This still wipes copies older versions wrote, when the user deletes their data.

export function clearMedicalFlags(): void {
  try { localStorage.removeItem(MEDICAL_STORAGE_KEY); } catch {}
}

// ─── Medical flags — server sync ───────────────────────────────────────────────

export async function saveMedicalFlagsToServer(flags: MedicalFlags): Promise<void> {
  try {
    await fetch("/api/ace-medical", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flags),
    });
  } catch {}
}

// ─── Consent — localStorage + server ───────────────────────────────────────────

export const MATCHMAKER_CONSENT_VERSION = 1;

export interface StoredConsent {
  consentedAt: string;
  consentVersion: number;
}

export function saveConsent(consent: StoredConsent): void {
  try { localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent)); } catch {}
}

export function loadConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    return parsed.consentVersion === MATCHMAKER_CONSENT_VERSION ? parsed : null;
  } catch { return null; }
}

/** Fire-and-forget — consent is stored as a sibling of ace_profile in the same POST body shape via api/ace-profile. */
export async function saveConsentToServer(consent: StoredConsent): Promise<void> {
  try {
    await fetch("/api/ace-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consent),
    });
  } catch {}
}

export async function loadConsentFromServer(): Promise<StoredConsent | null> {
  try {
    const res = await fetch("/api/ace-consent");
    if (!res.ok) return loadConsent();
    const { consent } = await res.json();
    if (consent?.consentVersion === MATCHMAKER_CONSENT_VERSION) {
      saveConsent(consent as StoredConsent);
      return consent as StoredConsent;
    }
    const local = loadConsent();
    if (local) saveConsentToServer(local); // fire-and-forget
    return local;
  } catch {}
  return loadConsent();
}

// ─── Delete-all — used by the account-settings "delete my capability & health data" control ──

export async function deleteAllMatchmakerData(): Promise<void> {
  clearProfile();
  clearMedicalFlags();
  try { localStorage.removeItem(CONSENT_STORAGE_KEY); } catch {}
  // Sequential, not Promise.all: user_metadata is a single JSON blob with no
  // per-field atomicity, so two concurrent read-modify-write DELETEs race —
  // whichever finishes last overwrites the other's change with its own
  // (now-stale) read, silently undoing it. Awaiting one before starting the
  // next means each starts from the state the previous one actually left.
  try { await fetch("/api/ace-profile", { method: "DELETE" }); } catch {}
  try { await fetch("/api/ace-medical", { method: "DELETE" }); } catch {}
}

