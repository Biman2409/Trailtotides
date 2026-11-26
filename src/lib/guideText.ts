// Plain text from guide markup, for search and reading times. Kept apart from adventurepedia.ts
// (which imports the activity data) so the activity data can use it without an import loop.
import type { Block } from "./adventurepedia";

/** Plain text of inline markup: strips **bold** and turns [label](href) into label */
export function plain(s: string) {
  return s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function blockText(b: Block): string {
  if ("p" in b) return plain(b.p);
  if ("list" in b) return b.list.map(plain).join(" · ");
  if ("steps" in b) return b.steps.map(plain).join(" · ");
  if ("callout" in b) return `${b.title}. ${plain(b.text)}`;
  return [b.table.head.join(" "), ...b.table.rows.map((r) => r.join(" "))].join(" ");
}
