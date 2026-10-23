// Adventure descriptions mark their standout points with **double asterisks**.
// <Emphasis> renders them highlighted; stripEmphasis gives the plain text for
// anything that isn't the page itself (structured data, search, the chat).

import type { ReactNode } from "react";

export function stripEmphasis(text: string): string {
  return text.replace(/\*\*/g, "");
}

export function Emphasis({ text, className }: { text: string; className?: string }): ReactNode {
  // Splitting on **…** puts the highlighted parts at the odd indexes
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className={className}>{part}</strong>
      : part
  );
}
