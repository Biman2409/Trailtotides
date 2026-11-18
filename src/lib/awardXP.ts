import { toast } from "sonner";
import { XP_LABELS, type XPAction } from "@/lib/xp";
import type { Achievement } from "@/lib/achievements";
import { hasSession } from "@/lib/signedIn";

// Before badges were tracked on the account, each browser kept its own list of the ones
// it had announced. It's sent once to seed the account's list, then dropped.
const LEGACY_EARNED_KEY = "earned_achievement_ids";

function takeLegacyEarned(): string[] | undefined {
  try {
    const raw = localStorage.getItem(LEGACY_EARNED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : undefined;
  } catch { return undefined; }
}

function dispatchXPUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("xp:updated"));
  }
}

/** Badges earned since the last check — the account remembers which were already announced */
async function checkNewTrophies(): Promise<Achievement[]> {
  try {
    const known = takeLegacyEarned();
    const res = await fetch("/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ known }),
    });
    if (!res.ok) return [];
    if (known) { try { localStorage.removeItem(LEGACY_EARNED_KEY); } catch {} }
    const { newIds } = (await res.json()) as { newIds: string[] };
    if (!newIds?.length) return [];
    // Loaded only when there is a badge to announce: the badge list pulls in all the adventure
    // data, and this module is part of every page (the trip log and wishlist use it)
    const { ALL_BADGES } = await import("@/lib/achievements");
    return ALL_BADGES.filter((b) => newIds.includes(b.id));
  } catch { return []; }
}

function showTrophyToast(trophy: Achievement) {
  toast(`Badge unlocked: ${trophy.name}`, {
    description: trophy.description,
    duration: 6000,
    action: {
      label: "View",
      onClick: () => { window.location.href = "/profile#trophies"; },
    },
  });
}

/** Look for newly earned badges and announce them. Also for unlocks that give no XP of their own. */
export async function announceNewTrophies(): Promise<void> {
  (await checkNewTrophies()).forEach(showTrophyToast);
}

export async function awardXP(action: XPAction, slug?: string): Promise<void> {
  // XP lives on an account: signed out, there's nothing to award it to
  if (!(await hasSession())) return;
  try {
    const res = await fetch("/api/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, slug: slug ?? null }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.awarded) {
      toast.success(`+${data.xp} XP · ${XP_LABELS[action]}`, { duration: 2500 });
      dispatchXPUpdate();
    }
    // Even with no XP (e.g. the 10th wishlist save) a count-based badge may have unlocked
    await announceNewTrophies();
  } catch {
    // Silent — XP is non-critical
  }
}

export async function revokeXP(action: XPAction, slug?: string): Promise<void> {
  try {
    await fetch("/api/xp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, slug: slug ?? null }),
    });
    dispatchXPUpdate();
  } catch {
    // Silent
  }
}
