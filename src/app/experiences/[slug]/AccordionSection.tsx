"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  label?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  id?: string;
  /** Paired with `tintRgb` to render this section as a badged card instead of the plain header — used for the small set of sections meant to stand out as a matched pair (e.g. About / Highlights). */
  icon?: React.ReactNode;
  /** "r,g,b" triple, e.g. "255,81,0" — drives the card's border, wash, icon chip and label color. */
  tintRgb?: string;
  /** Suppress the trailing divider — use when a shared divider follows a row of sections instead. */
  noDivider?: boolean;
  /** Skip the top spacing — use when this section sits inside a row that already carries its own top offset. */
  noTopPad?: boolean;
  /** Extra control rendered in the card header, before the chevron (e.g. a small info link). Card variant only. */
  headerExtra?: React.ReactNode;
  /** Stretch this card to the height of its row siblings — only meaningful when it sits in a grid alongside another card meant to match it (e.g. the About / Highlights pair). Leave off for standalone, full-width cards. */
  stretch?: boolean;
}

export default function AccordionSection({ title, label, defaultOpen = false, children, id, icon, tintRgb, noDivider, noTopPad, headerExtra, stretch }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionRef = useRef<HTMLElement>(null);

  function handleToggle() {
    setOpen((o) => {
      const next = !o;
      // Scroll the newly opened section into view below the sticky navbar —
      // otherwise a section that opens near the bottom of the viewport can end
      // up with its fresh content hidden behind the fixed mobile book bar.
      if (next) {
        requestAnimationFrame(() => {
          sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      return next;
    });
  }

  if (icon && tintRgb) {
    return (
      <section ref={sectionRef} id={id} className={`${noTopPad ? "" : "pt-6 first:pt-0"} ${stretch ? "h-full" : ""} scroll-mt-24`}>
        <div className={`rounded-2xl overflow-hidden ${stretch ? "h-full flex flex-col" : ""}`} style={{ border: `1px solid rgba(${tintRgb},0.18)`, background: `rgba(${tintRgb},0.025)` }}>
          <button
            onClick={handleToggle}
            className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 text-left shrink-0"
            style={{ borderBottom: `1px solid rgba(${tintRgb},0.14)`, background: `rgba(${tintRgb},0.05)` }}
            aria-expanded={open}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `rgba(${tintRgb},0.15)`, color: `rgb(${tintRgb})` }}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              {label && <p className="text-[10px] font-bold tracking-[0.2em] uppercase leading-none mb-1" style={{ color: `rgb(${tintRgb})` }}>{label}</p>}
              {title && <h2 className="font-semibold text-[15px] leading-snug" style={{ color: "#ff5100" }}>{title}</h2>}
            </div>
            {headerExtra && (
              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>{headerExtra}</div>
            )}
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              style={{ color: "var(--text-tertiary)" }}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? `max-h-[4000px] opacity-100 ${stretch ? "flex-1" : ""}` : "max-h-0 opacity-0"}`}
          >
            <div className={`px-4 sm:px-5 py-4 sm:py-5 ${stretch ? "h-full" : ""}`}>{children}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className={noTopPad ? "" : "pt-6 first:pt-0"}>
      {/* Mobile: collapsible header */}
      {(label || title) && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden w-full flex items-center justify-between py-3 group"
          aria-expanded={open}
        >
          <div className="text-left">
            {label && (
              <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-0.5">{label}</p>
            )}
            {title && <h2 className="font-semibold text-base" style={{ color: "#ff5100" }}>{title}</h2>}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-white/30 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {/* Desktop: always visible header */}
      {(label || title) && (
        <div className="hidden lg:block mb-3">
          {label && (
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-1.5">{label}</p>
          )}
          {title && (
            <h2 className="font-semibold text-base leading-snug" style={{ color: "#ff5100" }}>{title}</h2>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className={`lg:block overflow-hidden transition-all duration-300 ease-in-out ${
          (open || (!label && !title)) ? "max-h-[2000px] opacity-100" : "lg:max-h-none max-h-0 opacity-0 lg:opacity-100"
        }`}
      >
        {children}
      </div>

      {/* Divider */}
      {!noDivider && (label || title) && (
        <div className="h-px mt-6" style={{ background: "rgba(255,255,255,0.05)" }} />
      )}
    </section>
  );
}
