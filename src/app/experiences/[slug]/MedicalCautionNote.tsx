import { Stethoscope } from "lucide-react";

/**
 * Renders already-derived advisory strings only — never the user's raw
 * medical flags. deriveMedicalCautions() runs server-side in page.tsx so
 * health disclosures never reach client-side JS for a page anyone can view.
 */
export default function MedicalCautionNote({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;

  return (
    <div className="rounded-xl p-3.5 mt-3" style={{ background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.15)" }}>
      <div className="flex gap-3">
        <Stethoscope className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "#38bdf8" }}>Based on what you shared</p>
          {notes.map((note, i) => (
            <p key={i} className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{note}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
