import { toast } from "sonner";
import { XP_LABELS, type XPAction } from "@/lib/xp";
import { getAchievements } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";

const EARNED_KEY = "earned_achievement_ids";

function loadEarned(): Set<string> {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveEarned(ids: Set<string>) {
  try { localStorage.setItem(EARNED_KEY, JSON.stringify([...ids])); } catch {}
}

function dispatchXPUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("xp:updated"));
  }
}

async function checkNewTrophies(): Promise<Achievement[]> {
  try {
    const { loadProfile } = await import("@/lib/matchmaker");
    const profile = loadProfile();
    if (!profile?.ace) return [];

    const res = await fetch("/api/xp");
    if (!res.ok) return [];
    const data = await res.json();

    const totalXP: number = data.xp ?? 0;
    const events: { action: string; adventure_slug?: string }[] = data.events ?? [];
    const uniq = (action: string) =>
      new Set(events.filter(e => e.action === action).map(e => e.adventure_slug)).size;
    const engagement = {
      completed:  uniq("trip_log"),
      reviews:    uniq("review"),
      wishlisted: uniq("wishlist"),
      photos:     uniq("photo"),
      compares:   uniq("compare"),
    };

    const all = getAchievements(profile.ace, totalXP, engagement);
    const earned = loadEarned();
    const newOnes = all.filter(a => !earned.has(a.id));

    if (newOnes.length > 0) {
      newOnes.forEach(a => earned.add(a.id));
      saveEarned(earned);
    }

    return newOnes;
  } catch { return []; }
}

function showTrophyToast(trophy: Achievement) {
  const tierColors: Record<string, string> = {
    tier1: "#fbbf24",
    tier2: "#f97316",
    tier3: "#60a5fa",
  };
  const color = tierColors[trophy.tier] ?? "#60a5fa";

  toast(
    `🏆 Trophy Unlocked — ${trophy.name}`,
    {
      description: `${trophy.description} · View in your profile`,
      duration: 5000,
      style: {
        background: "#0f1923",
        border: `1px solid ${color}40`,
        color: "#fff",
      },
      action: {
        label: "View",
        onClick: () => { window.location.href = "/profile#trophies"; },
      },
    }
  );
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
      toast.success(`+${data.xp} XP · ${XP_LABELS[action]}`, {
        duration: 2500,
        style: { background: "#0f1923", border: "1px solid rgba(255,81,0,0.3)", color: "#fff" },
      });
      dispatchXPUpdate();

      // Check for newly unlocked trophies
      const newTrophies = await checkNewTrophies();
      newTrophies.forEach(t => showTrophyToast(t));
    }
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
