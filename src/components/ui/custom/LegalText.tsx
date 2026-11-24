import type { LegalSection } from "@/lib/legal";

// Renders the sections of the Terms of Use or Privacy Policy (src/lib/legal.ts): a heading
// each, and a paragraph per blank-line-separated block. Sized for a page or the sign-up pop-up.

export default function LegalText({ sections, compact = false }: { sections: LegalSection[]; compact?: boolean }) {
  return (
    <div className={compact ? "space-y-5" : "space-y-10"}>
      {sections.map((s) => (
        <section key={s.title}>
          <h2 className={compact ? "text-sm font-semibold mb-2" : "text-xl font-semibold mb-4"} style={{ color: "var(--text-primary)" }}>{s.title}</h2>
          <div className={compact ? "space-y-2" : "space-y-4"}>
            {s.content.split("\n\n").map((p, i) => (
              <p key={i} className={compact ? "text-sm leading-relaxed" : "text-base leading-relaxed"} style={{ color: "var(--text-secondary)" }}>{p}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
