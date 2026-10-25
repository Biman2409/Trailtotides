import { toast } from "sonner";
import { XP_LABELS, type XPAction } from "@/lib/xp";
import { ALL_BADGES, type Achievement } from "@/lib/achievements";

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
