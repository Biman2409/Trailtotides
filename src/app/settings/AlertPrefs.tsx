"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Section } from "@/app/profile/ProfileForm";
import type { AccountPrefs } from "@/lib/apiUser";
import { EMAIL_ALERTS } from "@/lib/features";

const ROWS: { key: keyof AccountPrefs; title: string; body: string }[] = [
  { key: "wishlistAlerts", title: "Wishlist alerts", body: "Email me when an adventure on my wishlist is about to come into season, or its price drops." },
  { key: "passportPublic", title: "Public Adventure Passport", body: "Anyone with the link can see my passport: rank, stamps, badges and capability radar. Never my health answers." },
].filter((r) => EMAIL_ALERTS || r.key !== "wishlistAlerts") as { key: keyof AccountPrefs; title: string; body: string }[];

export default function AlertPrefs({ initial, username }: { initial: AccountPrefs; username: string | null }) {
  const [prefs, setPrefs] = useState(initial);

  async function set(key: keyof AccountPrefs, on: boolean) {
    const before = prefs;
    setPrefs({ ...prefs, [key]: on });
    const res = await fetch("/api/account-prefs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: on }) });
    if (!res.ok) { setPrefs(before); toast.error("Couldn't save that. Try again."); }
  }

  return (
    <Section title={EMAIL_ALERTS ? "Alerts and sharing" : "Sharing"} subtitle={EMAIL_ALERTS ? "Saved map searches have their own alert switch on your profile." : undefined}>
      <div className="space-y-4">
        {ROWS.map((r) => (
          <label key={r.key} className="flex items-start justify-between gap-4 cursor-pointer">
            <span className="min-w-0">
              <span className="block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.title}</span>
              <span className="block text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{r.body}</span>
              {r.key === "passportPublic" && prefs.passportPublic && username && (
                <a href={`/passport/${encodeURIComponent(username)}`} className="inline-block text-xs font-semibold mt-1 text-[#ff5100] hover:underline">
                  trailtotides.com/passport/{username}
                </a>
              )}
            </span>
            <Switch checked={prefs[r.key]} onCheckedChange={(on) => set(r.key, on)} className="mt-0.5 shrink-0" />
          </label>
        ))}
      </div>
    </Section>
  );
}
