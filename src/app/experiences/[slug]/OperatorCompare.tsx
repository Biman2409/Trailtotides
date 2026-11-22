"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { X, Check, Minus, ExternalLink, BadgeCheck, ChevronDown, Plus, Trophy } from "lucide-react";
import type { OperatorCardData } from "./OperatorCard";
import { openOperator } from "@/lib/outbound";
import { compareOperators, highlights, shortDate, MAX_COMPARE, type Cell, type Rating } from "@/lib/operatorCompare";
import { leadPrice } from "@/lib/operatorRank";
import { firstBookableDate } from "@/lib/nextDeparture";

const muted = { color: "var(--text-tertiary)" } as const;
const GREEN = "#3fa877";
const BEST_BG = "rgba(255,81,0,0.09)";

function CellValue({ cell, best }: { cell: Cell; best?: boolean }) {
  const icon = cell.tone === "yes" ? <Check className="w-3.5 h-3.5 shrink-0" aria-hidden />
    : cell.tone === "no" ? <Minus className="w-3.5 h-3.5 shrink-0" aria-hidden /> : null;
  const color = best ? "var(--accent-ink)" : cell.tone === "yes" ? GREEN : cell.tone === "no" || cell.tone === "missing" ? "var(--text-tertiary)" : "var(--text-primary)";
  return (
    <span className="flex flex-col min-w-0">
      <span className={`inline-flex items-start gap-1 ${best ? "font-semibold" : ""} ${cell.tone === "missing" ? "italic" : ""}`} style={{ color }}>
        {icon}
        {cell.href
          ? <span className="underline underline-offset-2 decoration-[rgba(255,81,0,0.4)] break-all">{cell.text}</span>
          : <span className="break-words">{cell.text}</span>}
        {best && <span className="sr-only"> (best in this row)</span>}
      </span>
      {cell.sub && <span className="text-[11.5px] leading-snug mt-0.5" style={muted}>{cell.sub}</span>}
      {cell.list && (
        <ul className="mt-1 space-y-1 text-[12px] leading-snug list-disc pl-4" style={{ color: "var(--text-secondary)" }}>
          {cell.list.map((l, k) => <li key={k}>{l}</li>)}
        </ul>
      )}
    </span>
  );
}

/** A cell, as a button that opens the operator's page when it carries a link */
function CellBody({ cell, best, op, slug }: { cell: Cell; best?: boolean; op: OperatorCardData; slug: string }) {
  if (!cell.href) return <CellValue cell={cell} best={best} />;
  return (
    <button type="button" className="text-left" onClick={() => openOperator({ url: cell.href!, operator: op.name, source: "compare", slug })}
      aria-label={`${cell.text}: open ${op.name}'s site`}>
      <CellValue cell={cell} best={best} />
    </button>
  );
}

function BookButton({ op, slug, solid, compact }: { op: OperatorCardData; slug: string; solid?: boolean; compact?: boolean }) {
  const url = op.offer?.url ?? op.website;
  return (
    <button
      type="button"
      onClick={() => { if (url) openOperator({ url, operator: op.name, source: "compare", slug }); }}
      disabled={!url}
      aria-label={url ? `Book with ${op.name} (opens their site)` : `${op.name} has no website listed`}
      className={`w-full ${compact ? "h-8 text-[12px]" : "h-9 text-[12.5px]"} inline-flex items-center justify-center gap-1 rounded-full font-semibold disabled:opacity-40 transition-colors ${solid ? "text-[#1c1814] bg-[#ff5100] hover:bg-[#e64900]" : "text-[#ff5100] hover:bg-[rgba(255,81,0,0.08)]"}`}
      style={solid ? undefined : { border: "1px solid rgba(255,81,0,0.55)" }}
    >
      {url ? <>Book<ExternalLink className="w-3 h-3" aria-hidden /></> : "No site"}
    </button>
  );
}

/**
 * The side-by-side dashboard for the operators someone ticked: winners up top, then the same
 * fields for every operator. Columns on wider screens; on phones, one card per field with a
 * line per operator, so nothing scrolls sideways.
 */
export default function OperatorCompare({ all, selected, onToggle, ratings, slug, onClose }: {
  /** Every operator on the trek, in list order, so the dialog can add one */
  all: OperatorCardData[];
  /** Names of the ticked operators */
  selected: string[];
  onToggle: (name: string) => void;
  ratings: Record<string, Rating>;
  slug: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [showLists, setShowLists] = useState(false);
  const ops = useMemo(() => all.filter((o) => selected.includes(o.name)), [all, selected]);
  const travellers = ops.map((o) => ratings[o.name.trim().toLowerCase()] ?? null);
  const today = firstBookableDate();
  const sections = compareOperators(ops, travellers, today);
  const wins = ops.length > 1 ? highlights(sections, ops) : [];
  const fullField = sections[0].fields.find((f) => f.key === "full");
  const feeField = sections[0].fields.find((f) => f.key === "fee");
  const cheapest = (i: number) => (fullField?.best.some(Boolean) ? fullField.best[i] : !!feeField?.best[i]);
  const hasLists = ops.some((o) => (o.offer?.included.length ?? 0) + (o.offer?.notIncluded.length ?? 0) > 0);
  const checked = ops.map((o) => o.offer?.checkedAt ?? o.priceCheckedAt).filter(Boolean).sort().pop();
  const full = selected.length >= MAX_COMPARE;

  // Focus the dialog, close on Escape, keep the page behind from scrolling, and hand focus back after
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      before?.focus?.();
    };
  }, [onClose]);

  const labelCell = "sticky left-0 z-[1] px-4 py-3 text-left align-top font-normal";
  const cols = Math.max(ops.length, 1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="op-compare-title"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-5"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-6xl h-[94vh] sm:h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-page)", border: "1px solid var(--border-default)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title and the operator picker */}
        <div className="shrink-0 px-4 sm:px-5 pt-3 sm:pt-4 pb-3" style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] tracking-[0.1em] lowercase" style={{ color: "var(--text-secondary)", fontVariant: "small-caps" }}>side by side</p>
              <h2 id="op-compare-title" className="text-[20px] !font-normal tracking-[-0.01em] !text-[#ff5100]">
                {ops.length === 1 ? `${ops[0].name}: the details` : `Comparing ${ops.length} operators`}
              </h2>
            </div>
            <button ref={closeRef} onClick={onClose} aria-label="Close the comparison"
              className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.07]"
              style={{ color: "var(--text-secondary)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          {all.length > 1 && (
            <div className="mt-2.5 -mx-4 sm:mx-0 px-4 sm:px-0 flex gap-1.5 overflow-x-auto sm:flex-wrap pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label={`Operators in this comparison, up to ${MAX_COMPARE}`}>
              {all.map((o) => {
                const on = selected.includes(o.name);
                const disabled = !on && full;
                return (
                  <button key={o.name} type="button" onClick={() => onToggle(o.name)} disabled={disabled} aria-pressed={on}
                    title={disabled ? `Up to ${MAX_COMPARE} at a time: remove one first` : undefined}
                    className="shrink-0 h-8 px-3 inline-flex items-center gap-1.5 rounded-full text-[12.5px] font-medium transition-colors disabled:opacity-40"
                    style={on
                      ? { background: "rgba(255,81,0,0.12)", border: "1px solid rgba(255,81,0,0.55)", color: "var(--text-primary)" }
                      : { border: "1px dashed var(--border-default)", color: "var(--text-secondary)" }}>
                    {on ? <Check className="w-3.5 h-3.5 text-[#ff5100]" aria-hidden /> : <Plus className="w-3.5 h-3.5" aria-hidden />}
                    <span className="whitespace-nowrap">{o.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-auto" style={{ containerType: "inline-size" }}>
          {ops.length < 2 && all.length > 1 && (
            <p className="mx-4 sm:mx-5 mt-4 px-4 py-3 rounded-xl text-[13px]" style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-default)", color: "var(--text-secondary)" }}>
              Add {ops.length === 0 ? "two operators" : "another operator"} above to see them side by side.
            </p>
          )}

          {/* The winners, so the answer is visible before the detail */}
          {wins.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 px-4 sm:px-5 pt-4">
              {wins.map((w) => (
                <div key={w.key} className="rounded-xl px-3 py-2.5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                  <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                    <Trophy className="w-3 h-3 text-[#ff5100]" aria-hidden />{w.label}
                  </p>
                  <p className="text-[18px] font-semibold leading-tight mt-1" style={{ color: "var(--accent-ink)" }}>{w.value}</p>
                  <p className="text-[12.5px] leading-snug mt-0.5 line-clamp-2" style={{ color: "var(--text-primary)" }}>{w.names.join(", ")}</p>
                </div>
              ))}
            </div>
          )}

          {ops.length > 0 && (
            <>
              {/* Wider screens: operators as columns under a sticky header with their Book buttons */}
              <div className="hidden md:block px-5 pt-4">
                <table className="w-full border-separate border-spacing-0 text-[13px] rounded-xl" style={{ tableLayout: "fixed", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                  <colgroup>
                    <col style={{ width: 190 }} />
                    {ops.map((o) => <col key={o.name} />)}
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={`${labelCell} top-0 !z-[3] rounded-tl-xl`} style={{ background: "var(--bg-surface)", boxShadow: "inset 0 -1px 0 var(--border-default)" }}>
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={muted}>per person, INR</span>
                      </th>
                      {ops.map((op, i) => {
                        const lead = leadPrice(op);
                        return (
                          <th key={op.name} scope="col" className="sticky top-0 z-[2] px-3 pt-3 pb-3 text-left align-bottom font-normal"
                            style={{ background: "var(--bg-surface)", boxShadow: "inset 0 -1px 0 var(--border-default)" }}>
                            <span className="flex items-center gap-1.5">
                              <span className="text-[14.5px] font-semibold leading-tight line-clamp-2" style={{ color: "var(--text-primary)" }}>{op.name}</span>
                              {op.verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: GREEN }} aria-label="Verified" />}
                            </span>
                            <span className="block text-[13px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                              {lead.price || "Price not listed"} <span style={muted}>{lead.full ? "full trip" : "fee"}</span>
                            </span>
                            <div className="mt-2 flex items-center gap-1.5">
                              <BookButton op={op} slug={slug} solid={ops.length > 1 && cheapest(i)} />
                              {all.length > 1 && (
                                <button type="button" onClick={() => onToggle(op.name)} aria-label={`Remove ${op.name} from the comparison`}
                                  className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.07]" style={muted}>
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((s) => (
                      <Fragment key={s.title}>
                        <tr>
                          <th colSpan={cols + 1} scope="colgroup" className="text-left px-4 pt-5 pb-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--text-primary)" }}>
                            {s.title}
                          </th>
                        </tr>
                        {s.fields.map((f) => (
                          <tr key={f.key}>
                            <th scope="row" className={labelCell} style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}>
                              <span className="block text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{f.label}</span>
                              {f.hint && <span className="block text-[11.5px] leading-snug" style={muted}>{f.hint}</span>}
                            </th>
                            {ops.map((op, i) => (
                              <td key={op.name} className="px-3 py-3 align-top leading-snug"
                                style={{ borderTop: "1px solid var(--border-subtle)", background: f.best[i] ? BEST_BG : undefined }}>
                                <CellBody cell={f.cells[i]} best={f.best[i]} op={op} slug={slug} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                    {showLists && (
                      <tr>
                        <th scope="row" className={labelCell} style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}>
                          <span className="block text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>In their words</span>
                          <span className="block text-[11.5px]" style={muted}>their own inclusion lists</span>
                        </th>
                        {ops.map((op) => (
                          <td key={op.name} className="px-3 py-3 align-top text-[12px] leading-snug" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                            <OwnWords op={op} />
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phones: a sticky strip of the chosen operators, then one card per field */}
              <div className="md:hidden">
                <div className="sticky top-0 z-[2] px-4 pt-3 pb-2.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, background: "var(--bg-page)", boxShadow: "0 1px 0 var(--border-subtle)" }}>
                  {ops.map((op, i) => (
                    <div key={op.name} className="min-w-0 flex flex-col justify-between gap-1.5">
                      <p className="flex items-start gap-1 text-[12.5px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                        <span className="line-clamp-2">{op.name}</span>
                      </p>
                      <BookButton op={op} slug={slug} solid={ops.length > 1 && cheapest(i)} compact />
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-2">
                  {sections.map((s) => (
                    <section key={s.title} className="pt-4">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-primary)" }}>{s.title}</h3>
                      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                        {s.fields.map((f, fi) => (
                          <div key={f.key} className="px-3 py-2.5" style={fi > 0 ? { borderTop: "1px solid var(--border-subtle)" } : undefined}>
                            <p className="text-[12.5px] font-medium" style={{ color: "var(--text-primary)" }}>
                              {f.label}{f.hint && <span className="font-normal" style={muted}> · {f.hint}</span>}
                            </p>
                            <dl className="mt-1.5 space-y-1.5">
                              {ops.map((op, i) => (
                                <div key={op.name} className="flex items-start justify-between gap-3 text-[13px] rounded-md px-1.5 -mx-1.5 py-0.5"
                                  style={f.best[i] ? { background: BEST_BG } : undefined}>
                                  <dt className="min-w-0 truncate pt-px" style={{ color: "var(--text-secondary)" }}>{op.name}</dt>
                                  <dd className="text-right max-w-[62%] min-w-0 flex justify-end"><CellBody cell={f.cells[i]} best={f.best[i]} op={op} slug={slug} /></dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                  {showLists && ops.map((op) => (
                    <section key={op.name} className="pt-4">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--text-primary)" }}>{op.name}, in their words</h3>
                      <div className="rounded-xl px-3 py-2.5 text-[12.5px] leading-snug" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                        <OwnWords op={op} />
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              <div className="px-4 sm:px-5 pt-3 pb-5 space-y-2">
                {hasLists && (
                  <button type="button" onClick={() => setShowLists((v) => !v)} aria-expanded={showLists}
                    className="inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--accent-ink)" }}>
                    {showLists ? "Hide" : "Show"} each operator&apos;s full inclusion list
                    <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: showLists ? "rotate(180deg)" : undefined }} />
                  </button>
                )}
                <p className="text-[12px] leading-relaxed" style={muted}>
                  Highlighted: the best value in a row, when two or more operators list one. &ldquo;Not listed&rdquo; means the operator&apos;s page doesn&apos;t say; ask them before you book.
                  {" "}&ldquo;Full trip&rdquo; is the fee with the GST each operator states, plus their transport from the pick-up city when it&apos;s a paid extra.
                  {" "}Verified means our team has reviewed the listing; it isn&apos;t a safety certification.
                  {checked ? ` Prices and inclusions were read from each operator's own page, last checked ${shortDate(checked, true)}.` : ""}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OwnWords({ op }: { op: OperatorCardData }) {
  const inc = op.offer?.included ?? [];
  const exc = op.offer?.notIncluded ?? [];
  if (!inc.length && !exc.length) return <span className="italic" style={muted}>Not listed</span>;
  return (
    <>
      {inc.length > 0 && (
        <>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Included</p>
          <ul className="space-y-1 mb-3">{inc.map((l, k) => <li key={k}>{l}</li>)}</ul>
        </>
      )}
      {exc.length > 0 && (
        <>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Not included</p>
          <ul className="space-y-1">{exc.map((l, k) => <li key={k}>{l}</li>)}</ul>
        </>
      )}
    </>
  );
}
