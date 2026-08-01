"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteAllMatchmakerData } from "@/lib/matchmaker";
import { Section } from "@/app/profile/ProfileForm";

export default function DeleteAceDataButton() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteAllMatchmakerData();
    setDeleting(false);
    setDone(true);
    setConfirming(false);
  }

  return (
    <Section title="Danger Zone" subtitle="Permanently delete data associated with your account.">
      {done ? (
        <div className="flex items-start gap-2.5">
          <Trash2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Your capability and health data has been deleted.</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>You can build a fresh profile anytime by retaking the Adventure Matchmaker.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Delete my capability &amp; health data</p>
            <p className="text-xs mt-1 mb-4 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              Permanently removes your ACE™ capability profile and any health information you shared in the Adventure Matchmaker, on this device and from our servers. This doesn&apos;t delete your account.
            </p>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete data
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-60"
                  style={{ background: "#ef4444" }}
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Confirm delete
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}
