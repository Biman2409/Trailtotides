import { toast } from "sonner";
import { XP_LABELS, type XPAction } from "@/lib/xp";

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
  } catch {
    // Silent
  }
}
