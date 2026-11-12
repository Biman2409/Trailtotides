/**
 * Usage: npx tsx scripts/import-operator-offers.ts [research/competitor-treks.xlsx]
 *
 * Reads the operator research spreadsheet (Treks + Services + Sources sheets) and writes:
 *   src/lib/operatorOffers.json   full offer per adventure × operator, for the comparison
 *   src/lib/operatorPrices.json   just the headline fee per adventure × operator, read by data.ts
 *
 * Only operators already listed on an adventure in data.ts get an offer: this fills in what we
 * show, it never adds an operator. Re-run whenever the spreadsheet is refreshed.
 */
import * as XLSX from "xlsx";
import { readFileSync, writeFileSync } from "fs";
import { adventures } from "../src/lib/data";
import type { OperatorOffer } from "../src/lib/operatorOffer";

const file = process.argv[2] ?? "research/competitor-treks.xlsx";
const wb = XLSX.read(readFileSync(file));

// Adventures whose spreadsheet name differs from ours. Value: the sheet's "Trek" name, and
// optionally the listing to prefer when one operator sells several versions.
const ALIASES: Record<string, { trek: string; prefer?: RegExp }> = {
  "kedarkantha-trek": { trek: "Kedarkantha" },
  "deoriatal-chandrashila": { trek: "Chopta – Tungnath – Chandrashila", prefer: /deoria/i },
  "valley-of-flowers": { trek: "Valley of Flowers" },
  "khopra-danda": { trek: "Khopra Ridge" },
  "lobuche-peak": { trek: "Lobuche Peak" },
  "bagini-glacier": { trek: "Bagini Glacier & Changbang Base Camp" },
  "panch-kedar": { trek: "Panchkedar Trek & Drive" },
};

const norm = (s: string) => s.toLowerCase().replace(/\b(trek|the|and)\b/g, "").replace(/[^a-z0-9]/g, "");
const num = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const str = (v: unknown) => (v === null || v === undefined ? "" : String(v).replace(/\r/g, "").trim());

// ── Treks sheet, with the hyperlink behind each "Open ↗" cell ──────────────────────────────
const ws = wb.Sheets.Treks;
const range = XLSX.utils.decode_range(ws["!ref"]!);
const HEADER_ROW = 2; // 0-based: title, note, header
const headers: string[] = [];
for (let c = range.s.c; c <= range.e.c; c++) headers[c] = str(ws[XLSX.utils.encode_cell({ r: HEADER_ROW, c })]?.v);
type Row = Record<string, unknown> & { _url?: string };
const rows: Row[] = [];
for (let r = HEADER_ROW + 1; r <= range.e.r; r++) {
  const row: Row = {};
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r, c })];
    if (!cell) continue;
    row[headers[c]] = cell.v;
    if (headers[c] === "Page" && cell.l?.Target) row._url = cell.l.Target;
  }
  if (row.ID) rows.push(row);
}

// ── Services sheet: included / not included lines by ID ─────────────────────────────────────
const services: Record<string, unknown>[] = XLSX.utils.sheet_to_json(wb.Sheets.Services, { range: 2 });
const lines = new Map<string, { included: string[]; notIncluded: string[] }>();
for (const s of services) {
  const id = str(s.ID);
  const entry = lines.get(id) ?? { included: [], notIncluded: [] };
  const item = str(s.Item);
  if (!item) continue;
  if (s.Type === "Included") entry.included.push(item);
  else if (s.Type === "Not included") entry.notIncluded.push(item);
  lines.set(id, entry);
}

// ── Sources sheet: collection date per operator ─────────────────────────────────────────────
const sources: unknown[][] = XLSX.utils.sheet_to_json(wb.Sheets.Sources, { header: 1 });
const collected = new Map<string, string>();
for (const r of sources) if (r[1] === "Date collected") collected.set(str(r[0]), str(r[2]).slice(0, 10));

// "Jan, Feb · Seasons: …" → months; "Nov 2026, Dec 2026" → batches
const batchesOf = (v: unknown) => str(v).split(/\s*,\s*/).filter((s) => /^[A-Z][a-z]{2} \d{4}$/.test(s));

function toOffer(r: Row, operator: string): OperatorOffer {
  const id = str(r.ID);
  const terms = str(r["Other add-on terms"]);
  const cloak = /Cloakroom:\s*(Yes|No)/i.exec(terms)?.[1];
  const route = /Transport route:\s*(.+)/i.exec(terms)?.[1]?.replace(/^Transportation\s*/i, "").trim();
  const gst = num(r.GST);
  return {
    listedAs: str(r["Listed as"]) || str(r.Trek),
    days: num(r.Days),
    maxAltM: num(r["Max alt (m)"]),
    distanceKm: num(r["Distance (km)"]),
    difficulty: str(r.Difficulty) || undefined,
    feeBase: num(r["Base fee (₹)"]),
    gstRate: gst !== undefined && gst < 1 ? gst : undefined,
    feeTotal: num(r["Fee incl. GST (₹)"]),
    priceNote: str(r["Price notes"]) || undefined,
    batches: batchesOf(r["Dates / batches listed"]),
    startEnd: str(r["Start – end"]) || undefined,
    groupSize: num(r["Group size"]),
    addOns: {
      offloading: num(r["Offloading (₹)"]),
      transport: num(r["Transport (₹)"]),
      insurance: num(r["Insurance (₹)"]),
      singleTent: num(r["Single tent / room (₹)"]),
    },
    // TTH prices its add-ons before GST (Sources sheet); others don't say
    addOnsPlusGst: /trek the himalayas/i.test(operator),
    transportRoute: route || undefined,
    cloakroom: cloak ? cloak.toLowerCase() === "yes" : undefined,
    included: lines.get(id)?.included ?? [],
    notIncluded: lines.get(id)?.notIncluded ?? [],
    url: r._url,
    checkedAt: collected.get(str(r.Operator)) ?? undefined,
  };
}

const offers: Record<string, Record<string, OperatorOffer>> = {};
const prices: Record<string, Record<string, { priceFrom: string; checkedAt?: string }>> = {};
let count = 0;
for (const a of adventures) {
  const alias = ALIASES[a.slug];
  const target = norm(alias?.trek ?? a.name);
  const days = parseInt(a.durationDays, 10);
  for (const op of a.operators) {
    const candidates = rows.filter((r) => norm(str(r.Trek)) === target && norm(str(r.Operator)) === norm(op.name));
    if (!candidates.length) continue;
    // Several versions from one operator: the preferred listing, else the length closest to ours, else the cheapest
    const pick = [...candidates].sort((x, y) => {
      if (alias?.prefer) {
        const px = alias.prefer.test(str(x["Listed as"])) ? 0 : 1, py = alias.prefer.test(str(y["Listed as"])) ? 0 : 1;
        if (px !== py) return px - py;
      }
      if (Number.isFinite(days)) {
        const dx = Math.abs((num(x.Days) ?? 99) - days), dy = Math.abs((num(y.Days) ?? 99) - days);
        if (dx !== dy) return dx - dy;
      }
      return (num(x["Base fee (₹)"]) ?? Infinity) - (num(y["Base fee (₹)"]) ?? Infinity);
    })[0];
    const offer = toOffer(pick, op.name);
    (offers[a.slug] ??= {})[op.name] = offer;
    if (offer.feeBase) (prices[a.slug] ??= {})[op.name] = { priceFrom: `₹${offer.feeBase.toLocaleString("en-IN")}`, checkedAt: offer.checkedAt };
    count++;
  }
}

writeFileSync("src/lib/operatorOffers.json", JSON.stringify(offers) + "\n");
writeFileSync("src/lib/operatorPrices.json", JSON.stringify(prices, null, 1) + "\n");
console.log(`${count} offers across ${Object.keys(offers).length} adventures`);
