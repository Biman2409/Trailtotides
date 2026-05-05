"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  label?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  id?: string;
}

export default function AccordionSection({ title, label, defaultOpen = false, children, id }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="pt-6 first:pt-0">
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
            {title && <h2 className="text-white font-semibold text-base">{title}</h2>}
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
            <h2 className="text-white font-semibold text-base leading-snug">{title}</h2>
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
      {(label || title) && (
        <div className="h-px mt-6" style={{ background: "rgba(255,255,255,0.05)" }} />
      )}
    </section>
  );
}
