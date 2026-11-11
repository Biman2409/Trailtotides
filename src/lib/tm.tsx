import type { ReactNode } from "react";

/** Text with every ™ drawn as a small raised trademark mark (sup.tm in globals.css), for labels passed around as strings */
export function tm(text: string): ReactNode {
  if (!text.includes("™")) return text;
  return text.split("™").flatMap((part, i) => (i === 0 ? [part] : [<sup key={i} className="tm">™</sup>, part]));
}
