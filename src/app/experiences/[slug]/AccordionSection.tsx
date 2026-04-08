"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  label?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function AccordionSection({ title, label, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      {/* Mobile: collapsible header. Desktop: always open */}
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

      {/* Desktop: always visible, no toggle */}
      <div className="hidden lg:block">
        {label && (
          <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.22em] uppercase mb-2">{label}</p>
        )}
        {title && !label && (
          <h2 className="text-white font-semibold text-xl mb-4">{title}</h2>
        )}
      </div>

      {/* Content */}
      <div
        className={`lg:block overflow-hidden transition-all duration-300 ease-in-out ${
          (open || (!label && !title)) ? "max-h-[2000px] opacity-100" : "lg:max-h-none max-h-0 opacity-0 lg:opacity-100"
        }`}
      >
        <div className="pb-2 lg:pb-0">{children}</div>
      </div>

      {/* Mobile divider */}
      {(label || title) && <div className="lg:hidden h-px mt-1" style={{ background: "var(--border-subtle)" }} />}
    </section>
  );
}
